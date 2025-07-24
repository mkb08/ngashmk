const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Message = require('../models/Message');
const Earning = require('../models/Earning');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/argentessay', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Sample data
const seedData = async () => {
  try {
    console.log('🌱 Seeding database...');
    
    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await Message.deleteMany({});
    await Earning.deleteMany({});
    
    console.log('🧹 Cleared existing data');
    
    // Create admin user
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@argentessay.com',
      password: 'Admin@123',
      phone: '+1234567890',
      country: 'United States',
      role: 'admin',
      status: 'approved',
      emailVerified: true
    });
    
    console.log('👨‍💼 Admin created:', admin.email);
    
    // Create test writers
    const writers = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Writer@123',
        phone: '+1234567891',
        country: 'United States',
        role: 'writer',
        status: 'approved',
        emailVerified: true,
        educationalBackground: {
          degree: 'bachelor',
          fieldOfStudy: 'English Literature',
          university: 'Harvard University',
          graduationYear: 2020,
          gpa: 3.8
        },
        subjectExpertise: ['English', 'Literature', 'History', 'Philosophy'],
        writingExperience: 3,
        rating: 4.8,
        completedJobs: 45,
        totalEarnings: 6750
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@example.com',
        password: 'Writer@123',
        phone: '+1234567892',
        country: 'United Kingdom',
        role: 'writer',
        status: 'approved',
        emailVerified: true,
        educationalBackground: {
          degree: 'master',
          fieldOfStudy: 'Business Administration',
          university: 'London Business School',
          graduationYear: 2019,
          gpa: 3.9
        },
        subjectExpertise: ['Business', 'Marketing', 'Management', 'Finance'],
        writingExperience: 4,
        rating: 4.9,
        completedJobs: 67,
        totalEarnings: 12050
      },
      { 
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@example.com',
        password: 'Writer@123',
        phone: '+1234567893',
        country: 'Canada',
        role: 'writer',
        status: 'pending',
        emailVerified: true,
        educationalBackground: {
          degree: 'master',
          fieldOfStudy: 'Computer Science',
          university: 'University of Toronto',
          graduationYear: 2021,
          gpa: 3.7
        },
        subjectExpertise: ['Computer Science', 'Programming', 'Technology', 'Engineering'],
        writingExperience: 2,
        rating: 4.7,
        completedJobs: 23,
        totalEarnings: 3450
      }
    ];
    
    const createdWriters = [];
    for (const writerData of writers) {
      const writer = await User.create(writerData);
      createdWriters.push(writer);
      console.log('✍️ Writer created:', writer.email);
    }
    
    // Create applications for writers
    for (const writer of createdWriters) {
      const application = await Application.create({
        writer: writer._id,
        currentStep: 5,
        status: writer.status === 'approved' ? 'approved' : 'submitted',
        education: writer.educationalBackground,
        expertise: {
          primarySubjects: writer.subjectExpertise,
          writingExperience: writer.writingExperience
        },
        writingTest: {
          score: Math.floor(Math.random() * 30) + 70, // 70-100
          status: 'graded',
          attempts: 1
        }
      });
      
      console.log('📋 Application created for:', writer.email);
    }
    
    // Create sample jobs
    const jobs = [
      {
        title: 'Analysis of Shakespeare\'s Hamlet',
        description: 'Write a comprehensive analysis of Hamlet focusing on themes of revenge, madness, and mortality. Include character analysis and historical context.',
        subject: 'English Literature',
        academicLevel: 'undergraduate',
        paperType: 'essay',
        pages: 5,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        budget: 150,
        currency: 'USD',
        status: 'open',
        createdBy: admin._id,
        requirements: {
          formatStyle: 'MLA',
          sources: 8,
          instructions: 'Focus on Act III, Scene 1 (To be or not to be soliloquy)'
        }
      },
      {
        title: 'Marketing Strategy for Tech Startup',
        description: 'Develop a comprehensive marketing strategy for a new SaaS startup targeting small businesses. Include market analysis, competitive positioning, and go-to-market strategy.',
        subject: 'Business',
        academicLevel: 'masters',
        paperType: 'case_study',
        pages: 12,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        budget: 480,
        currency: 'USD',
        status: 'assigned',
        assignedTo: createdWriters[1]._id,
        createdBy: admin._id,
        assignedAt: new Date(),
        requirements: {
          formatStyle: 'APA',
          sources: 15,
          instructions: 'Include SWOT analysis and financial projections'
        }
      },
      {
        title: 'Machine Learning Algorithms Comparison',
        description: 'Compare and contrast different machine learning algorithms for image classification. Focus on accuracy, computational complexity, and practical applications.',
        subject: 'Computer Science',
        academicLevel: 'masters',
        paperType: 'research_paper',
        pages: 8,
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        budget: 320,
        currency: 'USD',
        status: 'open',
        createdBy: admin._id,
        requirements: {
          formatStyle: 'IEEE',
          sources: 12,
          instructions: 'Include Python code examples and performance metrics'
        }
      },
      {
        title: 'Impact of Social Media on Mental Health',
        description: 'Research paper examining the psychological effects of social media usage on teenagers and young adults. Include recent studies and statistical analysis.',
        subject: 'Psychology',
        academicLevel: 'undergraduate',
        paperType: 'research_paper',
        pages: 6,
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        budget: 210,
        currency: 'USD',
        status: 'completed',
        assignedTo: createdWriters[0]._id,
        createdBy: admin._id,
        assignedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        requirements: {
          formatStyle: 'APA',
          sources: 10,
          instructions: 'Focus on Instagram and TikTok platforms'
        }
      }
    ];
    
    const createdJobs = [];
    for (const jobData of jobs) {
      const job = await Job.create(jobData);
      createdJobs.push(job);
      console.log('📄 Job created:', job.title);
    }
    
    // Create earnings for completed jobs
    const earnings = [
      {
        writer: createdWriters[0]._id,
        job: createdJobs[3]._id,
        amount: 210,
        currency: 'USD',
        paymentStatus: 'paid',
        paidAt: new Date(),
        qualityRating: 5,
        completedOnTime: true,
        earnedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];
    
    for (const earningData of earnings) {
      const earning = await Earning.create(earningData);
      console.log('💰 Earning created:', earning.amount);
    }
    
    // Create sample messages
    const messages = [
      {
        sender: admin._id,
        recipient: createdWriters[0]._id,
        subject: 'Welcome to ArgentEssay!',
        content: 'Welcome to our platform! Your application has been approved. You can now start taking on writing assignments.',
        messageType: 'system',
        isRead: true,
        readAt: new Date()
      },
      {
        sender: createdWriters[0]._id,
        recipient: admin._id,
        subject: 'Question about job requirements',
        content: 'Hi, I have a question about the Shakespeare analysis job. Could you clarify the specific focus areas?',
        messageType: 'job_related',
        relatedJob: createdJobs[0]._id,
        isRead: false
      }
    ];
    
    for (const messageData of messages) {
      const message = await Message.create(messageData);
      console.log('💬 Message created:', message.subject);
    }
    
    console.log('✅ Database seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   - ${await User.countDocuments()} users`);
    console.log(`   - ${await Job.countDocuments()} jobs`);
    console.log(`   - ${await Application.countDocuments()} applications`);
    console.log(`   - ${await Message.countDocuments()} messages`);
    console.log(`   - ${await Earning.countDocuments()} earnings`);
    
    // Display test credentials
    console.log('\n🔑 Test Credentials:');
    console.log('   Admin: admin@argentessay.com / Admin@123');
    console.log('   Writers:');
    console.log('     - john.doe@example.com / Writer@123');
    console.log('     - sarah.johnson@example.com / Writer@123');
    console.log('     - michael.chen@example.com / Writer@123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run seed function
seedData();
