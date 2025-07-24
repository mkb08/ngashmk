const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  writer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Application Steps Progress
  currentStep: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  completedSteps: [{
    step: Number,
    completedAt: Date,
    data: mongoose.Schema.Types.Mixed
  }],
  
  // Step 1: Personal Details (handled in User model)
  
  // Step 2: Educational Background
  education: {
    highestDegree: {
      type: String,
      enum: ['high_school', 'associate', 'bachelor', 'master', 'doctorate'],
      required: function() { return this.currentStep >= 2; }
    },
    fieldOfStudy: {
      type: String,
      required: function() { return this.currentStep >= 2; }
    },
    university: {
      type: String,
      required: function() { return this.currentStep >= 2; }
    },
    graduationYear: {
      type: Number,
      required: function() { return this.currentStep >= 2; },
      min: 1950,
      max: new Date().getFullYear() + 10
    },
    gpa: {
      type: Number,
      min: 0,
      max: 4.0
    },
    additionalCertifications: [String]
  },
  
  // Step 3: Subject Expertise
  expertise: {
    primarySubjects: [{
      type: String,
      required: function() { return this.currentStep >= 3; }
    }],
    secondarySubjects: [String],
    writingExperience: {
      type: Number,
      required: function() { return this.currentStep >= 3; },
      min: 0
    },
    specializations: [String],
    languageProficiency: [{
      language: String,
      level: {
        type: String,
        enum: ['basic', 'intermediate', 'advanced', 'native']
      }
    }]
  },
  
  // Step 4: Document Uploads
  documents: {
    cv: {
      filename: String,
      path: String,
      uploadedAt: Date,
      verified: {
        type: Boolean,
        default: false
      }
    },
    sampleWorks: [{
      title: String,
      filename: String,
      path: String,
      subject: String,
      description: String,
      uploadedAt: Date,
      verified: {
        type: Boolean,
        default: false
      }
    }],
    certificates: [{
      title: String,
      filename: String,
      path: String,
      uploadedAt: Date,
      verified: {
        type: Boolean,
        default: false
      }
    }]
  },
  
  // Step 5: Writing Test
  writingTest: {
    testId: String,
    startedAt: Date,
    completedAt: Date,
    timeSpent: Number, // in minutes
    answers: [{
      questionId: String,
      answer: String,
      timeSpent: Number
    }],
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    feedback: String,
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'graded'],
      default: 'not_started'
    },
    attempts: {
      type: Number,
      default: 0,
      max: 3
    }
  },
  
  // Overall Application Status
  status: {
    type: String,
    enum: ['incomplete', 'submitted', 'under_review', 'approved', 'rejected', 'on_hold'],
    default: 'incomplete'
  },
  
  // Review Process
  review: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    reviewNotes: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    strengths: [String],
    weaknesses: [String],
    recommendations: String
  },
  
  // Communication
  notes: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    isInternal: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Timeline
  submittedAt: Date,
  approvedAt: Date,
  rejectedAt: Date,
  
  // Rejection details
  rejectionReason: {
    type: String,
    enum: [
      'incomplete_application',
      'insufficient_qualifications',
      'poor_test_performance',
      'inadequate_samples',
      'failed_verification',
      'other'
    ]
  },
  rejectionDetails: String,
  
  // Reapplication
  canReapply: {
    type: Boolean,
    default: true
  },
  reapplyAfter: Date
}, {
  timestamps: true
});

// Indexes
applicationSchema.index({ writer: 1 });
applicationSchema.index({ status: 1, createdAt: -1 });
applicationSchema.index({ 'review.reviewedBy': 1 });
applicationSchema.index({ currentStep: 1 });

// Virtual for completion percentage
applicationSchema.virtual('completionPercentage').get(function() {
  return Math.round((this.currentStep / 5) * 100);
});

// Virtual for is complete
applicationSchema.virtual('isComplete').get(function() {
  return this.currentStep === 5 && this.writingTest.status === 'completed';
});

// Methods
applicationSchema.methods.advanceStep = async function() {
  if (this.currentStep < 5) {
    this.completedSteps.push({
      step: this.currentStep,
      completedAt: new Date()
    });
    this.currentStep += 1;
    return this.save();
  }
  return this;
};

applicationSchema.methods.submit = async function() {
  if (this.isComplete) {
    this.status = 'submitted';
    this.submittedAt = new Date();
    return this.save();
  }
  throw new Error('Application is not complete');
};

applicationSchema.methods.approve = async function(reviewerId, notes) {
  this.status = 'approved';
  this.approvedAt = new Date();
  this.review = {
    reviewedBy: reviewerId,
    reviewedAt: new Date(),
    reviewNotes: notes
  };
  return this.save();
};

applicationSchema.methods.reject = async function(reviewerId, reason, details) {
  this.status = 'rejected';
  this.rejectedAt = new Date();
  this.rejectionReason = reason;
  this.rejectionDetails = details;
  this.review = {
    reviewedBy: reviewerId,
    reviewedAt: new Date(),
    reviewNotes: details
  };
  return this.save();
};

applicationSchema.methods.addNote = async function(authorId, content, isInternal = true) {
  this.notes.push({
    author: authorId,
    content,
    isInternal
  });
  return this.save();
};

// Static methods
applicationSchema.statics.getPendingReviews = function() {
  return this.find({ status: 'submitted' })
    .populate('writer', 'firstName lastName email')
    .sort({ submittedAt: 1 });
};

applicationSchema.statics.getApplicationStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
