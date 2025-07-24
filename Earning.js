const mongoose = require('mongoose');

const earningSchema = new mongoose.Schema({
  writer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Earning amount is required'],
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP']
  },
  
  // Payment details
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['paypal', 'bank_transfer', 'stripe', 'other']
  },
  paymentDetails: {
    transactionId: String,
    paymentDate: Date,
    processingFee: {
      type: Number,
      default: 0
    },
    netAmount: Number
  },
  
  // Bonus and deductions
  bonus: {
    amount: {
      type: Number,
      default: 0
    },
    reason: String,
    appliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appliedAt: Date
  },
  deductions: [{
    amount: Number,
    reason: String,
    appliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appliedAt: Date
  }],
  
  // Quality metrics
  qualityRating: {
    type: Number,
    min: 1,
    max: 5
  },
  completedOnTime: {
    type: Boolean,
    default: true
  },
  revisionRequests: {
    type: Number,
    default: 0
  },
  
  // Timeline
  earnedAt: {
    type: Date,
    default: Date.now
  },
  paidAt: Date,
  
  // Invoice details
  invoice: {
    invoiceNumber: String,
    generatedAt: Date,
    dueDate: Date,
    taxAmount: {
      type: Number,
      default: 0
    },
    totalAmount: Number
  },
  
  // Notes and comments
  notes: String,
  adminNotes: String
}, {
  timestamps: true
});

// Indexes
earningSchema.index({ writer: 1, earnedAt: -1 });
earningSchema.index({ job: 1 });
earningSchema.index({ paymentStatus: 1 });
earningSchema.index({ earnedAt: -1 });

// Virtual for final amount (including bonus and deductions)
earningSchema.virtual('finalAmount').get(function() {
  let final = this.amount + (this.bonus.amount || 0);
  
  if (this.deductions && this.deductions.length > 0) {
    const totalDeductions = this.deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
    final -= totalDeductions;
  }
  
  return Math.max(final, 0); // Ensure non-negative
});

// Virtual for net payment amount (after processing fees)
earningSchema.virtual('netPayment').get(function() {
  const finalAmount = this.finalAmount;
  const processingFee = this.paymentDetails?.processingFee || 0;
  return finalAmount - processingFee;
});

// Pre-save middleware to calculate net amount
earningSchema.pre('save', function(next) {
  if (this.paymentDetails) {
    this.paymentDetails.netAmount = this.netPayment;
  }
  
  if (this.invoice) {
    this.invoice.totalAmount = this.finalAmount + (this.invoice.taxAmount || 0);
  }
  
  next();
});

// Methods
earningSchema.methods.markAsPaid = async function(paymentMethod, transactionId, processingFee = 0) {
  this.paymentStatus = 'paid';
  this.paidAt = new Date();
  this.paymentDetails = {
    transactionId,
    paymentDate: new Date(),
    processingFee,
    netAmount: this.netPayment
  };
  this.paymentMethod = paymentMethod;
  
  return this.save();
};

earningSchema.methods.addBonus = async function(amount, reason, adminId) {
  this.bonus = {
    amount,
    reason,
    appliedBy: adminId,
    appliedAt: new Date()
  };
  
  return this.save();
};

earningSchema.methods.addDeduction = async function(amount, reason, adminId) {
  this.deductions.push({
    amount,
    reason,
    appliedBy: adminId,
    appliedAt: new Date()
  });
  
  return this.save();
};

earningSchema.methods.generateInvoice = async function() {
  const invoiceNumber = `INV-${Date.now()}-${this.writer.toString().slice(-6)}`;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30); // 30 days from now
  
  this.invoice = {
    invoiceNumber,
    generatedAt: new Date(),
    dueDate,
    taxAmount: 0, // Can be calculated based on writer's location
    totalAmount: this.finalAmount
  };
  
  return this.save();
};

// Static methods
earningSchema.statics.getWriterEarnings = function(writerId, startDate, endDate) {
  const query = { writer: writerId };
  
  if (startDate || endDate) {
    query.earnedAt = {};
    if (startDate) query.earnedAt.$gte = startDate;
    if (endDate) query.earnedAt.$lte = endDate;
  }
  
  return this.find(query)
    .populate('job', 'title subject deadline')
    .sort({ earnedAt: -1 });
};

earningSchema.statics.getEarningsStats = function(writerId) {
  return this.aggregate([
    { $match: { writer: mongoose.Types.ObjectId(writerId) } },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: '$amount' },
        totalBonus: { $sum: '$bonus.amount' },
        totalDeductions: { $sum: { $sum: '$deductions.amount' } },
        paidAmount: {
          $sum: {
            $cond: [
              { $eq: ['$paymentStatus', 'paid'] },
              '$amount',
              0
            ]
          }
        },
        pendingAmount: {
          $sum: {
            $cond: [
              { $eq: ['$paymentStatus', 'pending'] },
              '$amount',
              0
            ]
          }
        },
        jobsCompleted: { $sum: 1 },
        averageRating: { $avg: '$qualityRating' },
        onTimeDeliveries: {
          $sum: {
            $cond: ['$completedOnTime', 1, 0]
          }
        }
      }
    }
  ]);
};

earningSchema.statics.getMonthlyEarnings = function(writerId, year) {
  return this.aggregate([
    {
      $match: {
        writer: mongoose.Types.ObjectId(writerId),
        earnedAt: {
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$earnedAt' },
        totalAmount: { $sum: '$amount' },
        jobCount: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
};

earningSchema.statics.getPendingPayments = function() {
  return this.find({ paymentStatus: 'pending' })
    .populate('writer', 'firstName lastName email')
    .populate('job', 'title')
    .sort({ earnedAt: 1 });
};

const Earning = mongoose.model('Earning', earningSchema);

module.exports = Earning;
