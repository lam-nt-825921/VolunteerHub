// test-socket.js
// Script để test Socket.IO notifications mà không cần frontend
// Chạy: node test-socket.js

const { io } = require('socket.io-client');

// Thay đổi các giá trị này theo JWT token và port của bạn
const SERVER_URL = 'http://localhost:3000';
const JWT_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Lấy từ login API

console.log('🔌 Đang kết nối đến Socket.IO server...');
console.log(`📍 Server: ${SERVER_URL}/notifications`);
console.log(`🔐 Token: ${JWT_TOKEN.substring(0, 20)}...`);

const socket = io(`${SERVER_URL}/notifications`, {
  auth: {
    token: JWT_TOKEN,
  },
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  console.log('✅ Đã kết nối thành công!');
  console.log(`📡 Socket ID: ${socket.id}`);
  
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
  console.error('❌ Lỗi kết nối:', error.message);
  console.log('\n💡 Hãy kiểm tra:');
  console.log('   1. Server đang chạy?');
  console.log('   2. JWT token hợp lệ?');
  console.log('   3. Port đúng không?');
});

// Lắng nghe notification mới
socket.on('notification', (data) => {
  console.log('\n🔔 === NOTIFICATION MỚI ===');
  console.log(JSON.stringify(data, null, 2));
  console.log('===========================\n');
});

// Lắng nghe unread count update
socket.on('unread_count', (data) => {
  console.log(`\n📊 Unread count: ${data.count}`);
});

// Xử lý lỗi
socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
});

// Giữ script chạy
console.log('\n⏳ Đang chờ notifications...');
console.log('💡 Nhấn Ctrl+C để thoát\n');

// Cleanup khi thoát
process.on('SIGINT', () => {
  console.log('\n👋 Đang đóng kết nối...');
  socket.disconnect();
  process.exit(0);
});

