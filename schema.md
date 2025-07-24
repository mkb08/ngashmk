# ArgentEssay Database Schema

## Overview
This document describes the MongoDB database schema for the ArgentEssay academic writing platform.

## Database: `argentessay`

## Collections

### 1. Users Collection
**Purpose**: Stores user information for both writers and admins

```javascript
{
  _id: ObjectId,
  firstName: String,           // Required
  lastName: String,            // Required
  email: String,               // Required, unique, lowercase
  password: String,            // Hashed password
  phone: String,               // Required
  country: String,             // Required
  role: String,                // 'writer' | 'admin'
  status: String,              // 'pending' | 'approved' | 'rejected' | 'suspended'
  
  // Writer-specific fields
  educationalBackground: {
    degree: String,            // 'high_school' | 'associate' | 'bachelor' | 'master' | 'doctorate'
    fieldOfStudy: String,
    university: String,
    graduationYear: Number,
    gpa: Number
  },
  subjectExpertise: [String],  // Array of subject areas
  writingExperience: Number,   // Years of experience
  bio: String,                 // Max 500 characters
  
  // Documents
  cv: {
    filename: String,
    path: String,
    uploadedAt: Date
  },
  sampleWork: [{
    filename: String,
    path: String,
    uploadedAt: Date
  }],
  
  // Test Results
  writingTest: {
    score: Number,             // 0-100
    completedAt: Date,
    status: String             // 'pending' | 'passed' | 'failed'
  },
  
  // Account Management
  emailVerified: Boolean,
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // Performance Metrics
  rating: Number,              // 0-5 stars
  completedJobs: Number,
  totalEarnings: Number,
  
  // Timestamps
  lastLogin: Date,
  registrationStep: Number,    // 1-5
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `email` (unique)
- `role` + `status`
- `subjectExpertise`

---

### 2. Jobs Collection
**Purpose**: Stores job listings and assignments

```javascript
{
  _id: ObjectId,
  title: String,               // Required
  description: String,         // Required
  subject: String,             // Required
  academicLevel: String,       // 'high_school' | 'undergraduate' | 'masters' | 'phd'
  paperType: String,           // 'essay' | 'research_paper' | 'thesis' | 'dissertation' | etc.
  pages: Number,               // Required
  wordCount: Number,           // Calculated (pages * 275)
  deadline: Date,              // Required
  budget: Number,              // Required
  currency: String,            // 'USD' | 'EUR' | 'GBP'
  
  // Requirements
  requirements: {
    formatStyle: String,       // 'APA' | 'MLA' | 'Chicago' | 'Harvard' | 'Other'
    sources: Number,
    instructions: String,
    attachments: [{
      filename: String,
      path: String,
      uploadedAt: Date
    }]
  },
  
  // Assignment
  status: String,              // 'open' | 'assigned' | 'in_progress' | 'submitted' | 'completed' | 'cancelled'
  assignedTo: ObjectId,        // Reference to User
  assignedAt: Date,
  
  // Submission
  submission: {
    submittedAt: Date,
    content: String,
    attachments: [{
      filename: String,
      path: String,
      uploadedAt: Date
    }],
    revisionRequested: Boolean,
    revisionNotes: String
  },
  
  // Payment
  payment: {
    status: String,            // 'pending' | 'paid' | 'refunded'
    paidAt: Date,
    amount: Number,
    transactionId: String
  },
  
  // Rating
  rating: {
    score: Number,             // 1-5
    feedback: String,
    ratedAt: Date
  },
  
  // Bidding (optional)
  biddingEnabled: Boolean,
  bids: [{
    writer: ObjectId,
    amount: Number,
    message: String,
    createdAt: Date
  }],
  
  // Metadata
  createdBy: ObjectId,         // Reference to User (admin)
  createdAt: Date,
  updatedAt: Date,
  completedAt: Date
}
```

**Indexes**:
- `status` + `deadline`
- `assignedTo` + `status`
- `subject` + `academicLevel`
- `createdAt`

---

### 3. Applications Collection
**Purpose**: Tracks writer application progress

```javascript
{
  _id: ObjectId,
  writer: ObjectId,            // Reference to User (unique)
  
  // Progress Tracking
  currentStep: Number,         // 1-5
  completedSteps: [{
    step: Number,
    completedAt: Date,
    data: Mixed
  }],
  
  // Step 2: Education
  education: {
    highestDegree: String,
    fieldOfStudy: String,
    university: String,
    graduationYear: Number,
    gpa: Number,
    additionalCertifications: [String]
  },
  
  // Step 3: Expertise
  expertise: {
    primarySubjects: [String],
    secondarySubjects: [String],
    writingExperience: Number,
    specializations: [String],
    languageProficiency: [{
      language: String,
      level: String            // 'basic' | 'intermediate' | 'advanced' | 'native'
    }]
  },
  
  // Step 4: Documents
  documents: {
    cv: {
      filename: String,
      path: String,
      uploadedAt: Date,
      verified: Boolean
    },
    sampleWorks: [{
      title: String,
      filename: String,
      path: String,
      subject: String,
      description: String,
      uploadedAt: Date,
      verified: Boolean
    }],
    certificates: [{
      title: String,
      filename: String,
      path: String,
      uploadedAt: Date,
      verified: Boolean
    }]
  },
  
  // Step 5: Writing Test
  writingTest: {
    testId: String,
    startedAt: Date,
    completedAt: Date,
    timeSpent: Number,
    answers: [{
      questionId: String,
      answer: String,
      timeSpent: Number
    }],
    score: Number,             // 0-100
    feedback: String,
    status: String,            // 'not_started' | 'in_progress' | 'completed' | 'graded'
    attempts: Number           // Max 3
  },
  
  // Review Process
  status: String,              // 'incomplete' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'on_hold'
  review: {
    reviewedBy: ObjectId,      // Reference to User (admin)
    reviewedAt: Date,
    reviewNotes: String,
    rating: Number,            // 1-5
    strengths: [String],
    weaknesses: [String],
    recommendations: String
  },
  
  // Communication
  notes: [{
    author: ObjectId,          // Reference to User
    content: String,
    isInternal: Boolean,
    createdAt: Date
  }],
  
  // Timeline
  submittedAt: Date,
  approvedAt: Date,
  rejectedAt: Date,
  rejectionReason: String,
  rejectionDetails: String,
  
  // Reapplication
  canReapply: Boolean,
  reapplyAfter: Date,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `writer` (unique)
- `status` + `createdAt`
- `review.reviewedBy`

---

### 4. Messages Collection
**Purpose**: Internal messaging system

```javascript
{
  _id: ObjectId,
  sender: ObjectId,            // Reference to User
  recipient: ObjectId,         // Reference to User
  subject: String,             // Required
  content: String,             // Required
  attachments: [{
    filename: String,
    path: String,
    size: Number,
    uploadedAt: Date
  }],
  isRead: Boolean,
  readAt: Date,
  priority: String,            // 'low' | 'normal' | 'high' | 'urgent'
  relatedJob: ObjectId,        // Reference to Job
  messageType: String,         // 'general' | 'job_related' | 'system' | 'support'
  parentMessage: ObjectId,     // Reference to Message (for threads)
  isDeleted: Boolean,
  deletedAt: Date,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `recipient` + `isRead` + `createdAt`
- `sender` + `createdAt`
- `relatedJob`
- `parentMessage`

---

### 5. Earnings Collection
**Purpose**: Track writer payments and earnings

```javascript
{
  _id: ObjectId,
  writer: ObjectId,            // Reference to User
  job: ObjectId,               // Reference to Job
  amount: Number,              // Required
  currency: String,            // 'USD' | 'EUR' | 'GBP'
  
  // Payment Details
  paymentStatus: String,       // 'pending' | 'processing' | 'paid' | 'failed' | 'refunded'
  paymentMethod: String,       // 'paypal' | 'bank_transfer' | 'stripe' | 'other'
  paymentDetails: {
    transactionId: String,
    paymentDate: Date,
    processingFee: Number,
    netAmount: Number
  },
  
  // Bonus and Deductions
  bonus: {
    amount: Number,
    reason: String,
    appliedBy: ObjectId,       // Reference to User (admin)
    appliedAt: Date
  },
  deductions: [{
    amount: Number,
    reason: String,
    appliedBy: ObjectId,       // Reference to User (admin)
    appliedAt: Date
  }],
  
  // Quality Metrics
  qualityRating: Number,       // 1-5
  completedOnTime: Boolean,
  revisionRequests: Number,
  
  // Timeline
  earnedAt: Date,
  paidAt: Date,
  
  // Invoice
  invoice: {
    invoiceNumber: String,
    generatedAt: Date,
    dueDate: Date,
    taxAmount: Number,
    totalAmount: Number
  },
  
  // Notes
  notes: String,
  adminNotes: String,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `writer` + `earnedAt`
- `job`
- `paymentStatus`
- `earnedAt`

---

## Relationships

### User Relationships
- **User → Applications**: One-to-One (writer has one application)
- **User → Jobs**: One-to-Many (writer can have many jobs)
- **User → Messages**: One-to-Many (sender/recipient)
- **User → Earnings**: One-to-Many (writer can have many earnings)

### Job Relationships
- **Job → User**: Many-to-One (created by admin)
- **Job → User**: Many-to-One (assigned to writer)
- **Job → Messages**: One-to-Many (job-related messages)
- **Job → Earnings**: One-to-One (each job has one earning)

### Message Relationships
- **Message → User**: Many-to-One (sender)
- **Message → User**: Many-to-One (recipient)
- **Message → Job**: Many-to-One (related job)
- **Message → Messages**: Self-referencing (parent message for threads)

---

## Data Validation Rules

### User Validation
- Email must be unique and valid format
- Password minimum 6 characters
- Phone number must be valid
- Graduation year must be reasonable (1950-current year + 10)

### Job Validation
- Deadline must be in the future
- Budget must be positive
- Pages must be positive integer
- Word count calculated from pages

### Application Validation
- Each step must be completed before advancing
- Writing test score must be 0-100
- Documents must be valid file types

### Message Validation
- Sender and recipient must exist
- Content must not be empty
- Attachments must be valid file types

### Earning Validation
- Amount must be positive
- Quality rating must be 1-5
- Payment status must be valid enum

---

## Security Considerations

### Data Encryption
- Passwords hashed with bcrypt
- Sensitive tokens encrypted
- File uploads scanned for security

### Access Control
- Role-based permissions
- Document ownership verification
- Rate limiting on API endpoints

### Data Privacy
- Personal information encrypted at rest
- GDPR compliance features
- Data retention policies

---

## Backup and Recovery

### MongoDB Backup
```bash
# Create backup
mongodump --db argentessay --out ./backups/

# Restore backup
mongorestore --db argentessay ./backups/argentessay/
```

### File Backup
- Uploads directory backed up daily
- Cloud storage integration (AWS S3, Google Cloud Storage)
- Version control for documents

---

## Performance Optimization

### Indexes
- All foreign keys indexed
- Common query fields indexed
- Text search indexes for search functionality

### Caching
- Redis for session management
- CDN for static assets
- Browser caching headers

### Query Optimization
- Pagination for large datasets
- Selective field projection
- Aggregation pipelines for complex queries
