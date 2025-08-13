# Troubleshooting Guide

This guide helps you resolve common issues with the CodeCohort application, particularly Socket.IO and authentication problems.

## 🔐 Access Token Errors

### Problem: "Access token is coming" or "Invalid or expired token"

**Symptoms:**
- Socket.IO connection fails to authenticate
- Users see authentication error messages
- Real-time features don't work

**Solutions:**

#### 1. Check Token Storage
```javascript
// In browser console, check if token exists
console.log('Token:', localStorage.getItem('token'));
```

#### 2. Verify Token Format
The token should be a valid JWT format:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI...rest-of-token
```

#### 3. Clear and Re-login
```javascript
// Clear all stored data
localStorage.clear();
sessionStorage.clear();

// Then log in again
```

#### 4. Check Backend JWT Secret
Ensure your `.env` file has the correct JWT secret:
```env
JWT_SECRET=your-secret-key-here
```

#### 5. Verify User Authentication
Make sure the user is properly logged in before Socket.IO connects.

## 🔌 Socket.IO Connection Issues

### Problem: Socket.IO won't connect

**Symptoms:**
- Connection status shows "disconnected"
- Real-time features don't work
- Console shows connection errors

**Solutions:**

#### 1. Check Server Status
```bash
# Check if backend is running
curl http://localhost:5000/api/v1/health
```

#### 2. Verify CORS Settings
Ensure your `.env` file has the correct frontend URL:
```env
FRONTEND_URL=http://localhost:3000
```

#### 3. Check Network Connectivity
```javascript
// Test basic connectivity
fetch('http://localhost:5000/api/v1/health')
  .then(response => response.json())
  .then(data => console.log('Server status:', data))
  .catch(error => console.error('Connection failed:', error));
```

#### 4. Browser Console Debugging
Open browser console and look for:
- CORS errors
- Network errors
- Socket.IO connection errors

## 🧪 Testing Socket.IO Connection

### Run the Test Script
```bash
# Start the backend server first
npm run dev

# In another terminal, run the test
node server-test.js
```

### Expected Output
```
🧪 Testing Socket.IO connection...

📋 Test 1: Connection without token
✅ Connected to server (no token)
✅ Authentication successful (no token): { userId: 'test-user-123' }
📨 Sending test join request...

📋 Test 2: Connection with invalid token
✅ Connected to server (invalid token)
❌ Authentication failed (invalid token): { message: 'Invalid or expired token' }

📋 Test 3: Connection with valid token format
✅ Connected to server (valid token format)
❌ Authentication failed (valid token format): { message: 'Invalid or expired token' }
```

## 🔧 Common Fixes

### 1. Restart Both Frontend and Backend
```bash
# Stop all processes (Ctrl+C)
# Then restart:

# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend_new
npm start
```

### 2. Clear Browser Cache
- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Clear browser cache and cookies
- Try incognito/private mode

### 3. Check Environment Variables
Ensure all required environment variables are set:

**Backend (.env):**
```env
MONGODB_URI=mongodb://localhost:27017/codecohort
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
SESSION_SECRET=your-session-secret
```

**Frontend (.env):**
```env
REACT_APP_SERVER_URL=http://localhost:5000
```

### 4. Database Connection
```bash
# Check if MongoDB is running
mongosh
# or
mongo
```

## 🐛 Debug Mode

### Enable Detailed Logging
Add this to your backend `.env`:
```env
DEBUG=socket.io:*
NODE_ENV=development
```

### Frontend Debug Logging
Open browser console and look for:
- Socket.IO connection logs
- Authentication logs
- Error messages

## 📱 Browser Compatibility

### Supported Browsers
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Check Browser Support
```javascript
// Test WebSocket support
if ('WebSocket' in window) {
  console.log('WebSocket supported');
} else {
  console.log('WebSocket not supported');
}
```

## 🔒 Security Issues

### CORS Errors
If you see CORS errors, check:
1. Frontend URL in backend CORS settings
2. Credentials setting in frontend requests
3. Environment variables

### Token Security
- Never log tokens to console in production
- Use HTTPS in production
- Implement token refresh mechanism

## 📞 Getting Help

### Check Logs
1. **Backend logs**: Look for error messages in terminal
2. **Frontend logs**: Check browser console
3. **Network tab**: Check for failed requests

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Access token required" | No token in request | Log in again |
| "Invalid or expired token" | Token is invalid/expired | Clear storage and re-login |
| "User not found" | User doesn't exist in DB | Check database connection |
| "CORS error" | Frontend/backend URL mismatch | Check environment variables |
| "Connection failed" | Backend not running | Start backend server |

### Still Having Issues?

1. Check the [Socket.IO README](./SOCKET_IO_README.md)
2. Verify all environment variables are set
3. Ensure MongoDB is running
4. Check network connectivity
5. Try the test script to isolate the issue

---

For additional help, check the console logs and error messages for specific details about your issue.
