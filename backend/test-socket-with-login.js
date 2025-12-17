// test-socket-with-login.js
// Script tự động login và test Socket.IO
// Chạy: node test-socket-with-login.js

const { io } = require('socket.io-client');
const axios = require('axios');

const SERVER_URL = 'http://localhost:3000';
const TEST_EMAIL = 'manager@volunteerhub.com'; // Thay đổi email test
const TEST_PASSWORD = '123456'; // Thay đổi password test

async function testSocket() {
  try {
    console.log('🔐 Đang đăng nhập...');
    
    // 1. Login để lấy JWT token
    const loginResponse = await axios.post(`${SERVER_URL}/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    const { accessToken } = loginResponse.data;
    console.log('✅ Đăng nhập thành công!');
    console.log(`🔑 Token: ${accessToken.substring(0, 30)}...\n`);

    // 2. Kết nối Socket.IO
    console.log('🔌 Đang kết nối Socket.IO...');
    const socket = io(`${SERVER_URL}/notifications`, {
      auth: {
        token: accessToken,
      },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('✅ Socket.IO đã kết nối!');
      console.log(`📡 Socket ID: ${socket.id}\n`);
      
      // Yêu cầu unread count
      socket.emit('get_unread_count');
    });

    // Lắng nghe event connected từ server
    socket.on('connected', (data) => {
      console.log('✅ Server xác nhận kết nối:', data);
    });

    socket.on('disconnect', () => {
      console.log('❌ Đã ngắt kết nối');
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Lỗi kết nối Socket.IO:', error.message);
    });

    // Lắng nghe notification mới
    socket.on('notification', (data) => {
      console.log('\n🔔 === NOTIFICATION MỚI ===');
      console.log(JSON.stringify(data, null, 2));
      console.log('===========================\n');
    });

    // Lắng nghe unread count update
    socket.on('unread_count', (data) => {
      console.log(`📊 Unread count: ${data.count}`);
    });

    // Giữ script chạy
    console.log('⏳ Đang chờ notifications...');
    console.log('💡 Nhấn Ctrl+C để thoát\n');

    // Cleanup khi thoát
    process.on('SIGINT', () => {
      console.log('\n👋 Đang đóng kết nối...');
      socket.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Lỗi:', error.response?.data || error.message);
    console.log('\n💡 Hãy kiểm tra:');
    console.log('   1. Server đang chạy?');
    console.log('   2. Email/password đúng không?');
    console.log('   3. User đã tồn tại trong database?');
    process.exit(1);
  }
}

testSocket();

