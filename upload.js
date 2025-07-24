const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Create upload directories if they don't exist
const createUploadDirs = () => {
  const dirs = [
    'uploads',
    'uploads/cv',
    'uploads/samples',
    'uploads/certificates',
    'uploads/jobs',
    'uploads/submissions',
    'uploads/messages'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// File filter function
const fileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype;

    // Check file extension and MIME type
    let isAllowed = false;

    if (allowedTypes.documents && allowedTypes.documents.includes(ext)) {
      isAllowed = true;
    } else if (allowedTypes.images && allowedTypes.images.includes(ext)) {
      isAllowed = true;
    } else if (allowedTypes.all) {
      isAllowed = true;
    }

    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} is not allowed. Allowed types: ${JSON.stringify(allowedTypes)}`), false);
    }
  };
};

// Storage configuration
const storage = (uploadPath) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // Generate unique filename
      const uniqueSuffix = crypto.randomBytes(6).toString('hex');
      const timestamp = Date.now();
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
      
      cb(null, `${basename}-${timestamp}-${uniqueSuffix}${ext}`);
    }
  });
};

// Upload configurations for different file types
const uploadConfigs = {
  // CV upload (single file)
  cv: multer({
    storage: storage('uploads/cv'),
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: fileFilter({
      documents: ['.pdf', '.doc', '.docx']
    })
  }).single('cv'),

  // Sample work upload (multiple files)
  samples: multer({
    storage: storage('uploads/samples'),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB per file
      files: 5 // Maximum 5 files
    },
    fileFilter: fileFilter({
      documents: ['.pdf', '.doc', '.docx', '.txt']
    })
  }).array('samples', 5),

  // Certificate upload (multiple files)
  certificates: multer({
    storage: storage('uploads/certificates'),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB per file
      files: 10 // Maximum 10 files
    },
    fileFilter: fileFilter({
      documents: ['.pdf', '.jpg', '.jpeg', '.png'],
      images: ['.jpg', '.jpeg', '.png']
    })
  }).array('certificates', 10),

  // Job attachment upload (multiple files)
  jobAttachments: multer({
    storage: storage('uploads/jobs'),
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB per file
      files: 10 // Maximum 10 files
    },
    fileFilter: fileFilter({
      all: true // Allow all file types for job attachments
    })
  }).array('attachments', 10),

  // Submission upload (multiple files)
  submission: multer({
    storage: storage('uploads/submissions'),
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB per file
      files: 5 // Maximum 5 files
    },
    fileFilter: fileFilter({
      documents: ['.pdf', '.doc', '.docx', '.txt', '.zip']
    })
  }).array('files', 5),

  // Message attachment upload (multiple files)
  messageAttachments: multer({
    storage: storage('uploads/messages'),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB per file
      files: 5 // Maximum 5 files
    },
    fileFilter: fileFilter({
      all: true // Allow all file types for messages
    })
  }).array('attachments', 5),

  // Profile picture upload (single file)
  profilePicture: multer({
    storage: storage('uploads/profiles'),
    limits: {
      fileSize: 2 * 1024 * 1024 // 2MB
    },
    fileFilter: fileFilter({
      images: ['.jpg', '.jpeg', '.png', '.gif']
    })
  }).single('profilePicture')
};

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name'
      });
    }
  }
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'File upload error'
    });
  }
  
  next();
};

// File deletion utility
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// File validation utility
const validateFile = (file) => {
  if (!file) {
    throw new Error('No file provided');
  }

  // Check if file exists
  if (!fs.existsSync(file.path)) {
    throw new Error('File not found');
  }

  // Additional security checks can be added here
  // - Virus scanning
  // - Content type verification
  // - File signature verification

  return true;
};

// Clean old files utility
const cleanOldFiles = async (directory, daysOld = 30) => {
  const now = Date.now();
  const cutoffTime = now - (daysOld * 24 * 60 * 60 * 1000);

  try {
    const files = await fs.promises.readdir(directory);
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = await fs.promises.stat(filePath);
      
      if (stats.isFile() && stats.mtimeMs < cutoffTime) {
        await deleteFile(filePath);
        console.log(`Deleted old file: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning old files:', error);
  }
};

// Schedule cleanup (run daily)
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    cleanOldFiles('uploads/temp', 1); // Delete temp files older than 1 day
  }, 24 * 60 * 60 * 1000); // Run every 24 hours
}

module.exports = {
  uploadConfigs,
  handleUploadError,
  deleteFile,
  validateFile,
  cleanOldFiles
};
