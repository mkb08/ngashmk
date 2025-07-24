# ArgentEssay - Academic Writing Platform Development Plan

## Project Overview
- **Website Name**: ArgentEssay
- **Purpose**: Platform for freelance academic writers to register, apply for jobs, manage profiles, and communicate with clients/admin
- **Tech Stack**: 
  - Frontend: HTML5, CSS3, JavaScript, Bootstrap 5
  - Backend: Node.js with Express
  - Database: MongoDB
  - Authentication: JWT tokens
  - Email: Nodemailer
  - File Upload: Multer

## Project Structure
```
argentessay/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── auth.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── writerController.js
│   │   ├── jobController.js
│   │   ├── adminController.js
│   │   └── messageController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Job.js
│   │   ├── Application.js
│   │   ├── Message.js
│   │   └── Earning.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── writer.js
│   │   ├── admin.js
│   │   └── message.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── utils/
│   │   └── email.js
│   ├── .env.example
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── assets/
│   │   ├── css/
│   │   │   ├── style.css
│   │   │   ├── dashboard.css
│   │   │   └── admin.css
│   │   ├── js/
│   │   │   ├── main.js
│   │   │   ├── auth.js
│   │   │   ├── dashboard.js
│   │   │   └── admin.js
│   │   └── images/
│   ├── pages/
│   │   ├── index.html
│   │   ├── register.html
│   │   ├── login.html
│   │   ├── writer-dashboard.html
│   │   ├── admin-dashboard.html
│   │   └── profile.html
│   └── components/
│       └── (reusable components)
├── database/
│   └── schema.md
└── README.md
```

## Key Features Implementation Plan

### 1. Home Page
- Hero section with CTA
- Benefits cards (5 key benefits)
- Testimonials carousel
- Footer with links and social media

### 2. Writer Registration (Multi-step)
- Step 1: Personal details
- Step 2: Educational background
- Step 3: Subject expertise (multi-select)
- Step 4: File uploads (CV, samples)
- Step 5: Writing test
- Email verification system

### 3. Authentication System
- JWT-based authentication
- Role-based access (writer, admin)
- Password reset functionality
- Session management

### 4. Writer Dashboard
- Job listings with filters
- Active jobs management
- Submitted work tracking
- Earnings summary with charts
- Internal messaging
- Profile management

### 5. Admin Panel
- Writer application review
- Job posting and assignment
- Performance tracking
- Payment management
- Content management
- Analytics dashboard

### 6. Database Schema
- Users (writers and admins)
- Jobs (listings)
- Applications (writer applications)
- Messages (internal communication)
- Earnings (payment tracking)
- Documents (uploaded files)

## Design Guidelines
- **Primary Colors**: Navy Blue (#1e3a8a), White (#ffffff)
- **Secondary Colors**: Light Gray (#f3f4f6), Accent Blue (#3b82f6)
- **Typography**: Poppins (headings), Roboto (body)
- **Layout**: Clean, professional, card-based design
- **Responsive**: Mobile-first approach

## Security Features
- Password hashing (bcrypt)
- CSRF protection
- XSS prevention
- Input validation
- File upload restrictions
- Rate limiting

## Development Phases
1. **Phase 1**: Setup and Authentication
2. **Phase 2**: Home page and Registration
3. **Phase 3**: Writer Dashboard
4. **Phase 4**: Admin Panel
5. **Phase 5**: Messaging and Notifications
6. **Phase 6**: Testing and Deployment

## Testing Strategy
- Seed data for demo
- Test accounts (admin and writers)
- API testing
- Responsive testing
- Security testing
