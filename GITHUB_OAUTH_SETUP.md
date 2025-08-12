# GitHub OAuth Setup Guide

This guide will help you set up GitHub OAuth authentication for the CodeCohort project.

## Prerequisites

1. You need a GitHub account
2. Node.js and npm installed
3. MongoDB running

## Step 1: Create a GitHub OAuth App

1. Go to GitHub Settings: https://github.com/settings/developers
2. Click "New OAuth App" or "Register a new application"
3. Fill in the application details:
   - **Application name**: CodeCohort (or your preferred name)
   - **Homepage URL**: `http://localhost:3000` (for development)
   - **Application description**: A collaborative platform for developers
   - **Authorization callback URL**: `http://localhost:5000/api/v1/auth/github/callback`

4. Click "Register application"
5. Note down the **Client ID** and **Client Secret**

## Step 2: Configure Environment Variables

1. Open `backend/.env` file
2. Replace the GitHub OAuth placeholders with your actual values:

```bash
GITHUB_CLIENT_ID=your_actual_github_client_id
GITHUB_CLIENT_SECRET=your_actual_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/v1/auth/github/callback
```

3. Make sure other required environment variables are set:
```bash
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
FRONTEND_URL=http://localhost:3000
```

## Step 3: Start the Application

1. Start the backend server:
```bash
cd backend
npm install
npm start
```

2. Start the frontend application:
```bash
cd frontend_new
npm install
npm start
```

## Step 4: Test GitHub OAuth

1. Open your browser and go to `http://localhost:3000`
2. Click on "Sign In" or "Sign Up"
3. Click on "Sign in with GitHub" or "Sign up with GitHub"
4. You should be redirected to GitHub for authorization
5. After authorizing, you'll be redirected back to your application

## How GitHub OAuth Works

1. **User clicks GitHub button**: Redirects to GitHub OAuth page
2. **User authorizes**: GitHub redirects to your callback URL with authorization code
3. **Backend exchanges code**: Gets access token and user info from GitHub
4. **User creation/login**: Creates new user or logs in existing user
5. **JWT token**: Backend creates JWT token and redirects to frontend
6. **Frontend authentication**: Frontend receives token and authenticates user

## GitHub OAuth Features

- **Automatic account creation**: New users are automatically created with GitHub profile info
- **Account linking**: Existing users can link their GitHub accounts
- **Profile picture**: Uses GitHub profile picture as default
- **Email verification**: GitHub accounts are considered verified
- **Secure authentication**: No password required for OAuth users

## Troubleshooting

### Common Issues:

1. **"Authorization callback URL mismatch"**
   - Make sure the callback URL in GitHub app settings matches exactly: `http://localhost:5000/api/v1/auth/github/callback`

2. **"Client ID not found"**
   - Verify your `GITHUB_CLIENT_ID` in the `.env` file

3. **"Access denied"**
   - Check your `GITHUB_CLIENT_SECRET` in the `.env` file

4. **"Session error"**
   - Make sure `SESSION_SECRET` is set in your `.env` file

5. **"CORS error"**
   - Ensure `FRONTEND_URL` is correctly set to `http://localhost:3000`

### For Production Deployment:

1. Update GitHub OAuth app settings:
   - **Homepage URL**: Your production domain
   - **Authorization callback URL**: `https://yourdomain.com/api/v1/auth/github/callback`

2. Update environment variables:
   - `FRONTEND_URL`: Your production frontend URL
   - `GITHUB_CALLBACK_URL`: Your production callback URL

## Security Notes

- Never commit your `.env` file to version control
- Use different GitHub OAuth apps for development and production
- Regularly rotate your `JWT_SECRET` and `SESSION_SECRET`
- Use HTTPS in production for secure OAuth flow
