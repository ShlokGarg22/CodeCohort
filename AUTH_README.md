# CodeCohort Authentication System

A professional full-stack authentication system built with React, Node.js, Express, MongoDB, and modern security practices.

## 🚀 Features

### Backend
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Input Validation**: Zod schema validation for all endpoints
- **Professional Structure**: Organized codebase with separate folders for models, controllers, routes, validators, and middleware
- **Security Best Practices**: Password strength requirements, secure token handling
- **Error Handling**: Comprehensive error handling and validation
- **CORS Support**: Configured for frontend-backend communication

### Frontend
- **Modern React**: Built with React 18 and modern hooks
- **Routing**: React Router DOM for navigation
- **Authentication Flow**: Complete signup/signin/logout flow
- **Protected Routes**: Route protection with authentication checks
- **Beautiful UI**: Tailwind CSS with professional styling
- **Form Validation**: Client-side validation with user-friendly error messages
- **Responsive Design**: Mobile-first responsive design

## 📁 Project Structure

```
CodeCohort/
├── backend/
│   ├── controllers/
│   │   └── authController.js      # Authentication logic
│   ├── middleware/
│   │   └── auth.js                # JWT middleware & auth utilities
│   ├── models/
│   │   └── User.js                # User schema with Mongoose
│   ├── routes/
│   │   └── auth.js                # Authentication routes
│   ├── validators/
│   │   └── authValidation.js      # Zod validation schemas
│   ├── .env                       # Environment variables
│   ├── .env.example              # Environment variables template
│   ├── index.js                  # Server entry point
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── auth/
    │   │   │   ├── SignUp.jsx     # Signup component
    │   │   │   └── SignIn.jsx     # Signin component
    │   │   ├── Dashboard.jsx      # User dashboard
    │   │   ├── Navbar.jsx         # Updated navbar with auth
    │   │   └── ProtectedRoute.jsx # Route protection
    │   ├── contexts/
    │   │   └── AuthContext.jsx    # Authentication context
    │   ├── services/
    │   │   └── api.js             # API service with interceptors
    │   └── App.jsx                # Main app with routing
    └── package.json
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update the variables:
   ```env
   MONGODB_URI=mongodb://localhost:27017/codecohort
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   ```

4. **Start the server:**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:5173`

### Database Setup

1. **Install MongoDB:**
   - Local: Download from [MongoDB.com](https://www.mongodb.com/try/download/community)
   - Cloud: Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. **Start MongoDB service:**
   ```bash
   # Local MongoDB
   mongod
   ```

3. **The application will automatically create the database and collections**

## 🔐 API Endpoints

### Authentication Routes (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/signup` | Create new user account | No |
| POST | `/signin` | Login user | No |
| GET | `/profile` | Get current user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |
| POST | `/logout` | Logout user | Yes |

### Example API Usage

#### Signup
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

#### Signin
```javascript
POST /api/v1/auth/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

## 🔒 Security Features

### Password Requirements
- Minimum 6 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### JWT Security
- 7-day token expiration
- Secure token storage
- Automatic token refresh handling
- Protected route middleware

### Input Validation
- Zod schema validation on backend
- Client-side form validation
- Sanitized user inputs
- Error message standardization

## 🎨 Frontend Pages

### Available Routes
- `/` - Home page with project carousel
- `/signup` - User registration
- `/signin` - User login
- `/dashboard` - Protected user dashboard
- Protected routes redirect to signin when not authenticated

### Authentication Flow

## 🤖 AI Chat (@ai) Setup

Backend expects an environment variable `GOOGLE_AI_KEY` (or `GEMINI_API_KEY`) in `backend/.env`.

Endpoints:
- POST `/api/v1/ai/:projectId/prompt` body: `{ "prompt": "..." }` (requires auth and project membership)
- GET `/api/v1/ai/health` to check availability

In chat, typing messages starting with `@ai ` triggers the backend, then the AI result is posted back into the chat as an `AI:` message so all members see it.
1. User signs up or signs in
2. JWT token stored in localStorage
3. Token included in API requests
4. Protected routes check authentication
5. Automatic redirect on token expiration

## 🔧 Development

### Running Both Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Testing Authentication
1. Go to `http://localhost:5173`
2. Click "Sign Up" to create an account
3. Fill in the form and submit
4. You'll be automatically redirected to the dashboard
5. Try logging out and signing in again

## 🚀 Production Deployment

### Environment Variables for Production
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codecohort
JWT_SECRET=your-very-secure-random-secret-key
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
```

### Build Frontend
```bash
cd frontend
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the ISC License.

---

**Made by Shlok Garg and Shashank Rai** 🚀
