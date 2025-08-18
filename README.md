# CodeCohort 🚀

A modern full‑stack app for collaborative coding and project management.
Built with React, Node.js/Express, MongoDB, and Socket.io.
Includes GitHub OAuth, team workflows, and real‑time updates.

## Table of Contents
1. Features
2. Architecture
3. Project Structure
4. Quick Start
5. Environment
6. Running
7. API
8. Deployment
9. Contributing
10. License & Authors

---

## 1. Features
### Authentication
- GitHub OAuth via Passport
- JWT auth with protected routes
- Role-based access (user, creator, admin)

### GitHub Integration
- Link projects to GitHub repos
- Lock/unlock repositories
- Version history tracking

### Team Collaboration
- Request to join teams
- Approval workflow for creators
- Real‑time notifications

### Project & Task Management
- Create projects and tasks
- Kanban-style task management
- Live updates via Socket.io

### UI/UX & Security
- Built with React 19 and Tailwind CSS
- Radix UI and shadcn/ui components
- Zod validation and bcrypt hashing

---

## 2. Architecture
### Frontend
- React 19, React Router DOM
- Tailwind CSS, Radix UI, shadcn/ui
- Axios for API calls; Socket.io client
- React Hook Form with Zod

### Backend
- Node.js + Express, MongoDB
- Mongoose for ODM
- Socket.io server, Passport for OAuth
- JWT auth, bcrypt, dotenv, CORS

### External Services
- GitHub API & OAuth integration
- Cloudinary (optional)

---

## 3. Project Structure
```
CodeCohort/
├─ backend/
│  ├─ config/         # GitHub & cloudinary
│  ├─ controllers/    # auth, problems, tasks, teams, etc.
│  ├─ middleware/     # auth, security
│  ├─ models/         # User, Problem, Task, TeamRequest, Message
│  ├─ routes/         # API endpoints
│  ├─ socket/         # Socket.io handlers
│  ├─ utils/          # logger, code parser
│  ├─ validators/     # Zod schemas
│  ├─ db.js, index.js, package.json
│  └─ scripts/        # Maintenance scripts
└─ frontend_new/
   ├─ public/
   ├─ src/
      ├─ components/  # UI components
      ├─ contexts/    # Auth and Socket contexts
      ├─ services/    # API clients
      ├─ hooks/, lib/, utils/
      ├─ App.js, index.js
   └─ package.json
```

---

## 4. Quick Start
### Prerequisites
- Node.js 16+
- MongoDB (local or Atlas)
- npm or yarn

### Installation
```bash
# Clone repository
git clone <repository-url>
cd CodeCohort

# Backend setup
cd backend
npm install

# Frontend setup
cd ../frontend_new
npm install
```

---

## 5. Environment
### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/codecohort
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
PORT=5000

# GitHub OAuth
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
SESSION_SECRET=your-session-secret

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_API_URL=http://localhost:5000/api/v1
```
See GITHUB_OAUTH_SETUP.md for full details.

---

## 6. Running the Application
### Backend (http://localhost:5000)
```bash
cd backend
npm run dev
```

### Frontend (http://localhost:3000)
```bash
cd frontend_new
npm start
```
Open http://localhost:3000 in your browser.

---

## 7. API
Base URL: http://localhost:5000/api/v1

### Auth Endpoints
- POST /auth/signup: Create user
- POST /auth/signin: Login user
- GET /auth/github: GitHub OAuth start
- GET /auth/github/callback: OAuth callback
- GET /auth/profile: Get user profile
- PUT /auth/profile: Update profile
- POST /auth/logout: Logout

### Project Endpoints
- GET /problems: List projects
- POST /problems: Create project (Creator)
- GET /problems/:id: Get project
- PUT /problems/:id: Update project (Creator/Admin)
- DELETE /problems/:id: Delete project (Creator/Admin)
- GET /problems/my/problems: User projects

### GitHub Repo Endpoints
- PUT /problems/:projectId/github-repository: Set/Update repo (Creator)
- GET /problems/:projectId/github-repository: Get repo (Team Member)
- PUT /problems/:projectId/github-repository/lock: Lock repo (Creator)
- PUT /problems/:projectId/github-repository/unlock: Unlock repo (Creator)

### Team Endpoints
- POST /teams/projects/:projectId/join: Request join
- GET /teams/projects/:projectId/requests: List join requests (Creator)
- PUT /teams/requests/:requestId/respond: Approve/Reject
- GET /teams/requests/creator: Creator's requests
- GET /teams/requests/my: My requests
- DELETE /teams/projects/:projectId/leave: Leave team
- GET /teams/projects/:projectId/team: Team members

### Task Endpoints
- POST /projects/:projectId/tasks: Create task (Team Member)
- GET /projects/:projectId/tasks: List tasks (Team Member)
- PUT /tasks/:taskId: Update task (Team Member)
- DELETE /tasks/:taskId: Delete task (Team Member)
- PUT /tasks/reorder: Reorder tasks (Team Member)

---

## 8. Deployment
### Backend Deployment
1. Set production env vars in .env.
2. Build and run:
```bash
npm ci --omit=dev
npm start
```
3. Set GitHub OAuth callback to:
`https://your-backend.com/api/v1/auth/github/callback`

### Frontend Deployment
1. Set production env vars in .env.
2. Build and deploy the build folder:
```bash
npm run build
```

---

## 9. Contributing
- Fork the repo
- Create a feature branch
- Commit your changes
- Push the branch
- Open a Pull Request
Guidelines: Follow code style, add tests, update docs.

---

## 10. License & Authors
- License: ISC
- Authors: Shlok Garg, Shashank Rai
Acknowledgments: shadcn/ui, Radix UI, Tailwind CSS

---

Need help? Check AUTH_README.md, GITHUB_OAUTH_SETUP.md, and SOCKET_IO_README.md.

© 2025 CodeCohort