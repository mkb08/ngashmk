# ArgentEssay - Academic Writing Platform

A comprehensive, full-stack web application for freelance academic writers to register, apply for jobs, manage profiles, and communicate with clients/admin.

## 🚀 Features

### Frontend Features
- **Responsive Design**: Mobile-first, fully responsive design
- **Modern UI/UX**: Clean, professional interface with smooth animations
- **Multi-step Registration**: 5-step registration process for writers
- **Interactive Dashboards**: Separate dashboards for writers and admins
- **Real-time Updates**: Live notifications and messaging system

### Backend Features
- **RESTful API**: Clean, well-structured API endpoints
- **Authentication**: JWT-based authentication with role-based access
- **File Upload**: Secure file upload system with validation
- **Email Integration**: Email verification and password reset
- **Database**: MongoDB with Mongoose ODM

### Core Functionality
- **Writer Registration**: Multi-step application process
- **Job Management**: Browse, apply, and manage writing jobs
- **Admin Panel**: Manage writers, jobs, and applications
- **Messaging System**: Internal communication between writers and admins
- **Payment Tracking**: Earnings and payment management
- **Performance Analytics**: Track writer performance and ratings

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **JavaScript (ES6+)** - Interactive functionality
- **Bootstrap 5** - Responsive framework
- **Font Awesome** - Icons
- **Google Fonts** - Typography (Poppins, Roboto)

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File upload handling
- **Nodemailer** - Email service
- **bcryptjs** - Password hashing

## 📁 Project Structure

```
argentessay/
├── backend/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/          # Database models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   ├── uploads/          # File uploads
│   ├── server.js         # Entry point
│   ├── package.json      # Dependencies
│   └── .env.example      # Environment variables
├── frontend/
│   ├── assets/
│   │   ├── css/          # Stylesheets
│   │   ├── js/           # JavaScript files
│   │   └── images/       # Static images
│   ├── pages/            # HTML pages
│   └── components/         # Reusable components
├── database/
│   └── schema.md         # Database schema
├── argentessay-plan.md   # Project plan
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd argentessay
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/argentessay
JWT_SECRET=your-secret-key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CLIENT_URL=http://localhost:3000
```

4. **Start MongoDB**
```bash
mongod
```

5. **Start the backend server**
```bash
npm run dev
```

6. **Open the frontend**
Open `frontend/pages/index.html` in your browser or serve it using a local server:
```bash
# Using Python
python -m http.server 3000 --directory frontend

# Using Node.js
npx serve frontend
```

## 📊 Database Models

### User Model
- **Fields**: firstName, lastName, email, password, phone, country, role, status
- **Relationships**: Applications, Jobs, Messages, Earnings

### Job Model
- **Fields**: title, description, subject, deadline, budget, status, assignedTo
- **Relationships**: User (creator), User (assigned writer)

### Application Model
- **Fields**: writer, currentStep, education, expertise, documents, writingTest
- **Status**: incomplete, submitted, under_review, approved, rejected

### Message Model
- **Fields**: sender, recipient, subject, content, attachments, isRead
- **Types**: general, job_related, system, support

### Earning Model
- **Fields**: writer, job, amount, paymentStatus, paymentMethod, invoice
- **Calculations**: finalAmount, netPayment

## 🔐 Authentication

### JWT Token Structure
```json
{
  "id": "user_id",
  "role": "writer|admin",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Protected Routes
- **Writer Routes**: Require writer role and approved status
- **Admin Routes**: Require admin role
- **Public Routes**: No authentication required

## 📧 Email Templates

### Available Templates
1. **Email Verification**: Sent after registration
2. **Password Reset**: Sent on forgot password request
3. **Job Notifications**: Sent when jobs are assigned
4. **Payment Notifications**: Sent when payments are processed

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new writer
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user

### Writer Routes
- `GET /api/writer/dashboard` - Get writer dashboard data
- `GET /api/writer/jobs` - Get available jobs
- `POST /api/writer/jobs/:id/apply` - Apply for job
- `GET /api/writer/earnings` - Get earnings summary
- `PUT /api/writer/profile` - Update profile

### Admin Routes
- `GET /api/admin/dashboard` - Get admin dashboard
- `GET /api/admin/writers` - Get all writers
- `PUT /api/admin/writers/:id/approve` - Approve writer
- `POST /api/admin/jobs` - Create new job
- `GET /api/admin/applications` - Get applications

### Messaging
- `GET /api/messages` - Get messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark as read

## 🧪 Testing

### Test Accounts
**Admin Account**
- Email: admin@argentessay.com
- Password: Admin@123

**Writer Account**
- Email: writer@example.com
- Password: Writer@123

### Test Data
Run the seed script to populate test data:
```bash
npm run seed
```

## 🚀 Deployment

### Production Build
```bash
# Backend
cd backend
npm run build

# Frontend
# Build and minify CSS
npm run build-css

# Build and minify JS
npm run build-js
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/argentessay
JWT_SECRET=your-production-secret
CLIENT_URL=https://argentessay.com
```

### Hosting Options
- **Backend**: Heroku, AWS, DigitalOcean
- **Frontend**: Netlify, Vercel, AWS S3
- **Database**: MongoDB Atlas

## 🔧 Development

### Available Scripts
```bash
# Start development server
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### Code Style
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality checks

## 📱 Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support
- **Email**: support@argentessay.com
- **Documentation**: [docs.argentessay.com](https://docs.argentessay.com)
- **Issues**: [GitHub Issues](https://github.com/argentessay/argentessay/issues)

## 🙏 Acknowledgments
- Inspired by Academia-Research and similar platforms
- Built with modern web technologies
- Designed for scalability and performance
