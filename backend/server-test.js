const { io } = require('socket.io-client');

// Test Socket.IO connection with different authentication scenarios
const testSocketConnection = () => {
  console.log('🧪 Testing Socket.IO connection...');
  
  // Test 1: Connection without token (should work for development)
  console.log('\n📋 Test 1: Connection without token');
  const socket1 = io('http://localhost:5000', {
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });

  socket1.on('connect', () => {
    console.log('✅ Connected to server (no token)');
    
    // Test authentication without token
    socket1.emit('authenticate', { 
      userId: 'test-user-123'
    });
  });

  socket1.on('authenticated', (data) => {
    console.log('✅ Authentication successful (no token):', data);
    
    // Test join request
    const testJoinRequest = {
      projectId: 'test-project-123',
      creatorId: 'test-creator-456',
      requesterData: {
        id: 'test-user-123',
        username: 'testuser',
        fullName: 'Test User',
        profileImage: 'https://example.com/avatar.jpg',
        projectTitle: 'Test Project'
      },
      message: 'This is a test join request'
    };
    
    console.log('📨 Sending test join request...');
    socket1.emit('send-join-request', testJoinRequest);
  });

  socket1.on('auth-error', (error) => {
    console.log('❌ Authentication failed (no token):', error);
  });

  // Test 2: Connection with invalid token
  console.log('\n📋 Test 2: Connection with invalid token');
  const socket2 = io('http://localhost:5000', {
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });

  socket2.on('connect', () => {
    console.log('✅ Connected to server (invalid token)');
    
    // Test authentication with invalid token
    socket2.emit('authenticate', { 
      userId: 'test-user-456',
      token: 'invalid-token-123'
    });
  });

  socket2.on('authenticated', (data) => {
    console.log('✅ Authentication successful (invalid token):', data);
  });

  socket2.on('auth-error', (error) => {
    console.log('❌ Authentication failed (invalid token):', error);
  });

  // Test 3: Connection with valid token format (mock)
  console.log('\n📋 Test 3: Connection with valid token format');
  const socket3 = io('http://localhost:5000', {
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });

  socket3.on('connect', () => {
    console.log('✅ Connected to server (valid token format)');
    
    // Test authentication with valid token format
    socket3.emit('authenticate', { 
      userId: 'test-user-789',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItNzg5IiwiaWF0IjoxNjE2MjM5MDIyfQ.invalid-signature'
    });
  });

  socket3.on('authenticated', (data) => {
    console.log('✅ Authentication successful (valid token format):', data);
  });

  socket3.on('auth-error', (error) => {
    console.log('❌ Authentication failed (valid token format):', error);
  });

  // Common event handlers for all sockets
  const setupCommonHandlers = (socket, name) => {
    socket.on('new-join-request', (data) => {
      console.log(`📨 ${name} received join request:`, data);
    });

    socket.on('join-request-response', (data) => {
      console.log(`📨 ${name} received join request response:`, data);
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 ${name} disconnected:`, reason);
    });

    socket.on('connect_error', (error) => {
      console.log(`❌ ${name} connection error:`, error);
    });
  };

  setupCommonHandlers(socket1, 'Socket1 (no token)');
  setupCommonHandlers(socket2, 'Socket2 (invalid token)');
  setupCommonHandlers(socket3, 'Socket3 (valid token format)');

  // Cleanup after 15 seconds
  setTimeout(() => {
    console.log('\n🧹 Cleaning up test connections...');
    socket1.disconnect();
    socket2.disconnect();
    socket3.disconnect();
    process.exit(0);
  }, 15000);
};

// Run the test
testSocketConnection();
