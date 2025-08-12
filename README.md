# CodeCohort 🚀

A modern full-stack web application for collaborative coding and project management, built with React, Node.js, Express, and MongoDB. Features GitHub OAuth integration, team collaboration, and real-time version history tracking.

## 📋 Table of Contents

- [Features](#-features)
- [GitHub Integration](#-github-integration)
- [Team Collaboration](#-team-collaboration)
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
- **GitHub OAuth Integration**: Sign in/up with GitHub for seamless authentication
- **JWT Authentication**: Token-based authentication with bcrypt password hashing
- **Role-based Access**: User, Creator, and Admin roles with different permissions
- **User Registration & Login**: Complete signup/signin flow with validation
- **Protected Routes**: Route protection with authentication middleware
- **Profile Management**: User profile viewing and updating with GitHub profile integration
- **Session Management**: Automatic token refresh and logout functionality

### 🐙 GitHub Integration
- **GitHub OAuth**: One-click sign in/up with GitHub account
- **GitHub Profile Validation**: Required GitHub profiles for creators, optional for users
- **Repository Management**: Link projects to GitHub repositories
- **Version History**: Real-time tracking of commits, branches, and changes
- **Repository Locking**: Creators can lock/unlock repositories for team access
- **Commit Comparison**: View differences between commits and branches
- **Repository Navigation**: Team members can access GitHub repositories through navbar

### 🧑‍🤝‍🧑 Team Collaboration
- **Team Join Requests**: Developers can request to join project teams
- **Approval Workflow**: Project creators can approve or reject join requests
- **Real-time Notifications**: Live updates via Socket.io for team interactions
- **Team Management**: View team members and manage permissions
- **Collaborative Access**: Approved team members get GitHub repository access
- **Team Dashboard**: Dedicated views for creators and team members

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Library**: Built with Radix UI primitives and shadcn/ui components
- **Interactive Elements**: Toast notifications, modals, and form validation
- **Professional Styling**: Clean, modern interface with smooth animations
- **Dynamic Navigation**: Context-aware navigation based on user role and team membership

### 💻 Coding Features
- **Project Management**: Create and manage coding projects
- **Task Tracking**: Kanban-style task management
- **Version Control**: Integrated GitHub version history
- **Real-time Updates**: Live updates for collaborative features

### 🛡️ Security & Validation
- **Input Validation**: Zod schema validation on both frontend and backend
- **Password Security**: Strong password requirements and secure hashing
- **GitHub URL Validation**: Validate GitHub profile and repository URLs
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
- **React Router DOM** - Client-side routing and navigation
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - Beautiful component library
- **Axios** - HTTP client for API requests
- **Socket.io Client** - Real-time communication
- **React Hook Form** - Form handling and validation
- **Zod** - Schema validation
- **Lucide React** - Modern icon library
- **Sonner** - Toast notifications

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.io** - Real-time bidirectional communication
- **Passport.js** - Authentication middleware with GitHub OAuth
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing and security
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management
- **Zod** - Server-side validation

### External Services
- **GitHub API** - Repository and version control integration
- **GitHub OAuth** - Social authentication
- **Cloudinary** - Image upload and management (optional)

## 🐙 GitHub Integration Features

### Authentication
- **GitHub OAuth Flow**: Complete OAuth 2.0 implementation
- **Profile Sync**: Automatic profile information from GitHub
- **Role-based Requirements**: GitHub profiles required for creators

### Repository Management
- **Repository Linking**: Connect projects to GitHub repositories
- **Repository Validation**: Validate GitHub repository URLs and access
- **Lock/Unlock System**: Control team access to repositories
- **Real-time Access**: Team members get immediate repository access upon approval

### Version History
- **Commit Tracking**: Real-time commit history and details
- **Branch Management**: View and compare different branches
- **Diff Visualization**: Compare commits and view changes
- **File Tree Navigation**: Browse repository structure

## 📁 Project Structure

```
CodeCohort/
├── backend/                           # Backend server
│   ├── config/
│   │   ├── passport.js               # GitHub OAuth configuration
│   │   └── cloudinary.js             # Image upload configuration
│   ├── controllers/
│   │   ├── authController.js         # Authentication logic
│   │   ├── problemController.js      # Problem/project management
│   │   ├── taskController.js         # Task management
│   │   ├── teamController.js         # Team collaboration
│   │   └── uploadController.js       # File upload handling
│   ├── middleware/
│   │   └── auth.js                   # JWT authentication middleware
│   ├── models/
│   │   ├── User.js                   # User schema with GitHub integration
│   │   ├── Problem.js                # Project schema with GitHub repository
│   │   ├── Task.js                   # Task schema
│   │   └── TeamRequest.js            # Team join request schema
│   ├── routes/
│   │   ├── auth.js                   # Authentication routes
│   │   ├── problems.js               # Project/problem routes
│   │   ├── tasks.js                  # Task routes
│   │   ├── teams.js                  # Team collaboration routes
│   │   └── upload.js                 # File upload routes
│   ├── validators/
│   │   └── authValidation.js         # Zod validation schemas
│   ├── db.js                         # Database connection
│   ├── index.js                      # Server entry point with Socket.io
│   └── package.json
├── frontend_new/                     # Frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── SignIn.jsx        # Login with GitHub OAuth
│   │   │   │   ├── SignUp.jsx        # Registration with GitHub
│   │   │   │   └── GitHubCallback.jsx # OAuth callback handler
│   │   │   ├── ui/                   # Reusable UI components
│   │   │   ├── VersionHistory/
│   │   │   │   ├── GitHubRepositoryInput.jsx
│   │   │   │   ├── VersionHistory.jsx
│   │   │   │   └── DemoVersionHistory.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── CreatorDashboard.jsx  # Enhanced with GitHub features
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── Header.jsx            # Navigation with GitHub links
│   │   │   ├── KanbanBoard.jsx
│   │   │   ├── ProjectBoard.jsx
│   │   │   ├── TeamJoinWorkflow.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx       # Authentication with GitHub
│   │   │   └── SocketContext.jsx     # Real-time communication
│   │   ├── services/
│   │   │   ├── authService.js        # Authentication API
│   │   │   ├── problemService.js     # Project/GitHub API
│   │   │   ├── teamService.js        # Team collaboration API
│   │   │   └── githubService.js      # GitHub API integration
│   │   ├── hooks/
│   │   │   └── use-toast.js          # Toast notifications
│   │   ├── lib/
│   │   │   └── utils.js              # Utility functions
│   │   ├── App.js                    # Main application
│   │   └── index.js                  # Entry point
│   ├── public/
│   └── package.json
├── README.md                         # Project documentation
├── AUTH_README.md                    # Authentication setup guide
└── GITHUB_OAUTH_SETUP.md            # GitHub OAuth configuration guide
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
   
   # GitHub OAuth Configuration
   GITHUB_CLIENT_ID=your-github-oauth-app-client-id
   GITHUB_CLIENT_SECRET=your-github-oauth-app-client-secret
   SESSION_SECRET=your-session-secret-for-oauth
   
   # Optional: Cloudinary for image uploads
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   ```

2. **Frontend Environment Variables**
   
   Create a `.env` file in the `frontend_new` directory:
   ```env
   REACT_APP_BACKEND_URL=http://localhost:5000
   REACT_APP_API_URL=http://localhost:5000/api/v1
   ```

3. **GitHub OAuth Setup**
   
   See [GITHUB_OAUTH_SETUP.md](GITHUB_OAUTH_SETUP.md) for detailed instructions on setting up GitHub OAuth application.

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
| GET | `/api/v1/auth/github` | GitHub OAuth login | No |
| GET | `/api/v1/auth/github/callback` | GitHub OAuth callback | No |
| GET | `/api/v1/auth/profile` | Get current user profile | Yes |
| PUT | `/api/v1/auth/profile` | Update user profile | Yes |
| POST | `/api/v1/auth/logout` | Logout user | Yes |

### Project/Problem Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/problems` | Get all problems/projects | No |
| POST | `/api/v1/problems` | Create new project | Yes (Creator) |
| GET | `/api/v1/problems/:id` | Get project by ID | Yes |
| PUT | `/api/v1/problems/:id` | Update project | Yes (Creator/Admin) |
| DELETE | `/api/v1/problems/:id` | Delete project | Yes (Creator/Admin) |
| GET | `/api/v1/problems/my/problems` | Get user's projects | Yes |

### GitHub Repository Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| PUT | `/api/v1/problems/:projectId/github-repository` | Update GitHub repository | Yes (Creator) |
| GET | `/api/v1/problems/:projectId/github-repository` | Get GitHub repository | Yes (Team Member) |
| PUT | `/api/v1/problems/:projectId/github-repository/lock` | Lock repository | Yes (Creator) |
| PUT | `/api/v1/problems/:projectId/github-repository/unlock` | Unlock repository | Yes (Creator) |

### Team Collaboration Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/teams/projects/:projectId/join` | Request to join team | Yes |
| GET | `/api/v1/teams/projects/:projectId/requests` | Get project join requests | Yes (Creator) |
| PUT | `/api/v1/teams/requests/:requestId/respond` | Approve/reject join request | Yes (Creator) |
| GET | `/api/v1/teams/requests/creator` | Get all creator's join requests | Yes (Creator) |
| GET | `/api/v1/teams/requests/my` | Get user's join requests | Yes |
| DELETE | `/api/v1/teams/projects/:projectId/leave` | Leave team | Yes |
| GET | `/api/v1/teams/projects/:projectId/team` | Get team members | Yes (Team Member) |

### Task Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/projects/:projectId/tasks` | Create task | Yes (Team Member) |
| GET | `/api/v1/projects/:projectId/tasks` | Get project tasks | Yes (Team Member) |
| PUT | `/api/v1/tasks/:taskId` | Update task | Yes (Team Member) |
| DELETE | `/api/v1/tasks/:taskId` | Delete task | Yes (Team Member) |
| PUT | `/api/v1/tasks/reorder` | Reorder tasks | Yes (Team Member) |

### Example API Usage

#### User Registration with GitHub Profile
```javascript
POST /api/v1/auth/signup
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Password123",
  "fullName": "John Doe",
  "role": "creator",
  "githubProfile": "https://github.com/johndoe"
}
```

#### GitHub OAuth Login
```javascript
GET /api/v1/auth/github
// Redirects to GitHub OAuth page
// After authorization, redirects to callback URL
```

#### Request to Join Team
```javascript
POST /api/v1/teams/projects/64f5c2a5e8b4f12345678901/join
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "message": "I'm excited to contribute to this project!"
}
```

#### Approve Team Join Request
```javascript
PUT /api/v1/teams/requests/64f5c2a5e8b4f12345678902/respond
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "action": "approve"
}
```

#### Lock GitHub Repository
```javascript
PUT /api/v1/problems/64f5c2a5e8b4f12345678901/github-repository/lock
Authorization: Bearer <jwt-token>
```

## 🔄 Real-time Features

### Socket.io Events

#### Client to Server Events
- `join-user-room` - Join user's personal notification room
- `join-project-room` - Join project collaboration room
- `send-join-request` - Send team join request notification
- `handle-join-request` - Handle request approval/rejection
- `task-updated` - Broadcast task updates

#### Server to Client Events
- `new-join-request` - New team join request received
- `join-request-response` - Response to join request (approved/rejected)
- `task-updated` - Task was updated by team member

### Real-time Notifications
The application uses Socket.io for real-time notifications:

1. **Team Join Requests**: Creators receive instant notifications when users request to join
2. **Request Responses**: Users get immediate feedback when their requests are approved/rejected
3. **Task Updates**: Team members see live updates when tasks are modified
4. **Repository Access**: Immediate GitHub repository access upon team approval

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
   - Test GitHub OAuth login
   - Create a project and link it to a GitHub repository
   - Test team join workflow:
     - As a user: Request to join a project team
     - As a creator: Approve/reject join requests
     - As a team member: Access GitHub repository through navbar
   - Lock/unlock repositories as a creator
   - Explore version history and commit tracking

## 🚀 Deployment

### Backend Deployment

1. **Environment Variables**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codecohort
   JWT_SECRET=your-very-secure-random-secret-key
   FRONTEND_URL=https://your-frontend-domain.com
   NODE_ENV=production
   PORT=5000
   
   # GitHub OAuth (Production)
   GITHUB_CLIENT_ID=your-production-github-client-id
   GITHUB_CLIENT_SECRET=your-production-github-client-secret
   SESSION_SECRET=your-production-session-secret
   
   # Optional: Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   ```

2. **GitHub OAuth Production Setup**
   - Update GitHub OAuth app with production URLs
   - Set authorization callback URL to: `https://your-backend-domain.com/api/v1/auth/github/callback`

3. **Build and Deploy**
   ```bash
   npm install --production
   npm start
   ```

### Frontend Deployment

1. **Environment Variables (Production)**
   ```env
   REACT_APP_BACKEND_URL=https://your-backend-domain.com
   REACT_APP_API_URL=https://your-backend-domain.com/api/v1
   ```

2. **Build the Application**
   ```bash
   npm run build
   ```

3. **Deploy the `build` folder** to your hosting service (Netlify, Vercel, etc.)

### Database Setup

- **Local MongoDB**: Install and start MongoDB service
- **Cloud MongoDB**: Use MongoDB Atlas for cloud hosting with proper network access configuration

### GitHub OAuth Setup

1. **Create GitHub OAuth App**:
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Create new OAuth App with:
     - Application name: "CodeCohort"
     - Homepage URL: Your frontend URL
     - Authorization callback URL: `{backend-url}/api/v1/auth/github/callback`

2. **Configure Environment Variables** with the generated Client ID and Client Secret

For detailed setup instructions, see [GITHUB_OAUTH_SETUP.md](GITHUB_OAUTH_SETUP.md)

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