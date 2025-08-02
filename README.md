# CodeCohort 🚀

A modern full-stack web application for collaborative coding and project management, built with React, Node.js, Express, and MongoDB.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🔐 Authentication System
- **Secure JWT Authentication**: Token-based authentication with bcrypt password hashing
- **User Registration & Login**: Complete signup/signin flow with validation
- **Protected Routes**: Route protection with authentication middleware
- **Profile Management**: User profile viewing and updating capabilities
- **Session Management**: Automatic token refresh and logout functionality

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Library**: Built with Radix UI primitives and shadcn/ui components
- **Dark/Light Theme**: Theme switching capability
- **Interactive Elements**: Toast notifications, modals, and form validation
- **Professional Styling**: Clean, modern interface with smooth animations

### 💻 Coding Features
- **Terminal Section**: Interactive terminal interface for code execution
- **Active Problems**: Problem tracking and management system
- **Project Dashboard**: User dashboard with project overview
- **Real-time Updates**: Live updates for collaborative features

### 🛡️ Security & Validation
- **Input Validation**: Zod schema validation on both frontend and backend
- **Password Security**: Strong password requirements and secure hashing
- **CORS Protection**: Configured for secure frontend-backend communication
- **Error Handling**: Comprehensive error handling and user-friendly messages

---

## 🚀 Planned & Suggested Features

### 🏆 Gamification & Community
- **Leaderboard**: Track and display top users based on solved problems or points.
- **Badges & Achievements**: Reward users for milestones and participation.
- **User Roles & Permissions**: Admin, mentor, and student roles with different access levels.

### 📝 Problem & Submission Enhancements
- **Problem Tags & Search**: Tag problems and enable advanced filtering/search.
- **Submission History**: Users can view their past submissions and results.
- **Automated Grading**: Evaluate code submissions and provide instant feedback.
- **Discussion Threads**: Allow users to discuss problems and solutions.

### 📢 Notifications & Communication
- **Email Notifications**: For registration, password reset, and submission results.
- **In-app Notifications**: Real-time alerts for collaboration and updates.
- **Chat/Collaboration Tools**: Real-time chat or code collaboration features.

### 🛠️ Developer Experience
- **API Documentation**: Swagger/OpenAPI docs for backend endpoints.
- **Comprehensive Testing**: Unit and integration tests for backend and frontend.
- **CI/CD Pipeline**: Automated testing and deployment.

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks and functional components
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - Beautiful component library
- **Axios** - HTTP client for API requests
- **React Hook Form** - Form handling and validation
- **Zod** - Schema validation
- **Lucide React** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📁 Project Structure

```
CodeCohort/
├── backend/                    # Backend server
│   ├── controllers/
│   │   └── authController.js   # Authentication logic
│   ├── middleware/
│   │   └── auth.js            # JWT middleware
│   ├── models/
│   │   └── User.js            # User schema
│   ├── routes/
│   │   └── auth.js            # Authentication routes
│   ├── validators/
│   │   └── authValidation.js  # Zod validation schemas
│   ├── db.js                  # Database connection
│   ├── index.js               # Server entry point
│   └── package.json
├── frontend_new/              # Frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── SignIn.jsx
│   │   │   │   └── SignUp.jsx
│   │   │   ├── ui/            # Reusable UI components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── TerminalSection.jsx
│   │   │   ├── ActiveProblems.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx # Authentication context
│   │   ├── services/
│   │   │   └── authService.js  # API service
│   │   ├── hooks/
│   │   │   └── use-toast.js    # Toast notifications
│   │   ├── lib/
│   │   │   └── utils.js        # Utility functions
│   │   ├── App.js              # Main application
│   │   └── index.js            # Entry point
│   ├── public/
│   └── package.json
├── README.md                   # This file
└── AUTH_README.md             # Authentication documentation
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local or cloud)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CodeCohort
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend_new
   npm install
   ```

### Environment Configuration

1. **Backend Environment Variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/codecohort
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   FRONTEND_URL=http://localhost:3000
   NODE_ENV=development
   PORT=5000
   ```

2. **Frontend Environment Variables**
   
   Create a `.env` file in the `frontend_new` directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api/v1
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   The server will run on `http://localhost:5000`

2. **Start the Frontend Development Server**
   ```bash
   cd frontend_new
   npm start
   ```
   The application will run on `http://localhost:3000`

3. **Access the Application**
   
   Open your browser and navigate to `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/signup` | Create new user account | No |
| POST | `/api/v1/auth/signin` | Login user | No |
| GET | `/api/v1/auth/profile` | Get current user profile | Yes |
| PUT | `/api/v1/auth/profile` | Update user profile | Yes |
| POST | `/api/v1/auth/logout` | Logout user | Yes |

### Example API Usage

#### User Registration
```javascript
POST /api/v1/auth/signup
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Password123",
  "fullName": "John Doe"
}
```

#### User Login
```javascript
POST /api/v1/auth/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

## 🔧 Development

### Available Scripts

**Backend:**
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

**Frontend:**
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

### Code Structure

- **Components**: Reusable UI components in `src/components/`
- **Pages**: Main page components
- **Services**: API calls and external service integrations
- **Contexts**: React context for state management
- **Hooks**: Custom React hooks
- **Utils**: Utility functions and helpers

### Testing the Application

1. **Create an Account**
   - Navigate to the signup page
   - Fill in the registration form
   - Submit to create your account

2. **Login**
   - Use your credentials to sign in
   - You'll be redirected to the dashboard

3. **Explore Features**
   - Navigate through different sections
   - Test the terminal interface
   - Check the active problems section

## 🚀 Deployment

### Backend Deployment

1. **Environment Variables**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codecohort
   JWT_SECRET=your-very-secure-random-secret-key
   FRONTEND_URL=https://your-frontend-domain.com
   NODE_ENV=production
   PORT=5000
   ```

2. **Build and Deploy**
   ```bash
   npm install --production
   npm start
   ```

### Frontend Deployment

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Deploy the `build` folder** to your hosting service (Netlify, Vercel, etc.)

### Database Setup

- **Local MongoDB**: Install and start MongoDB service
- **Cloud MongoDB**: Use MongoDB Atlas for cloud hosting

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Commit your changes**
   ```bash
   git commit -m "Add: your feature description"
   ```
5. **Push to the branch**
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Create a Pull Request**

### Development Guidelines

- Follow the existing code style
- Add appropriate comments and documentation
- Test your changes thoroughly
- Update documentation if needed

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

**Made by Shlok Garg and Shashank Rai** 🚀

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Radix UI](https://www.radix-ui.com/) for accessible component primitives
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework

---

**Happy Coding! 🎉**