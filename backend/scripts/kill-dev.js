// Script để kill process đang chạy trên port 3000
// Sử dụng: node scripts/kill-dev.js

const { exec } = require('child_process');
const os = require('os');

const PORT = process.env.PORT || 3000;

if (os.platform() === 'win32') {
  // Windows
  console.log(`🔍 Đang tìm process trên port ${PORT}...`);
  
  exec(`netstat -ano | findstr :${PORT}`, (error, stdout, stderr) => {
    if (error) {
      console.log(`✅ Không có process nào đang chạy trên port ${PORT}`);
      process.exit(0);
    }

    if (!stdout) {
      console.log(`✅ Không có process nào đang chạy trên port ${PORT}`);
      process.exit(0);
    }

    const lines = stdout.split('\n');
    const pids = new Set();

    lines.forEach((line) => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5 && parts[1] === 'TCP' && parts[3].includes(`:${PORT}`)) {
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0' && !isNaN(parseInt(pid))) {
          pids.add(pid);
        }
      }
    });

    if (pids.size === 0) {
      console.log(`✅ Không có process nào đang chạy trên port ${PORT}`);
      process.exit(0);
    }

    console.log(`🔪 Đang kill ${pids.size} process(es): ${Array.from(pids).join(', ')}`);

    pids.forEach((pid) => {
      exec(`taskkill /F /PID ${pid}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Không thể kill process ${pid}:`, error.message);
        } else {
          console.log(`✅ Đã kill process ${pid}`);
        }
      });
    });

    setTimeout(() => {
      console.log(`\n✅ Hoàn thành! Port ${PORT} đã được giải phóng.`);
      process.exit(0);
    }, 1000);
  });
} else {
  // Linux/Mac
  console.log(`🔍 Đang tìm process trên port ${PORT}...`);
  
  exec(`lsof -ti:${PORT}`, (error, stdout, stderr) => {
    if (error || !stdout) {
      console.log(`✅ Không có process nào đang chạy trên port ${PORT}`);
      process.exit(0);
    }

    const pids = stdout.trim().split('\n').filter(pid => pid);
    
    if (pids.length === 0) {
      console.log(`✅ Không có process nào đang chạy trên port ${PORT}`);
      process.exit(0);
    }

    console.log(`🔪 Đang kill ${pids.length} process(es): ${pids.join(', ')}`);

    pids.forEach((pid) => {
      exec(`kill -9 ${pid}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Không thể kill process ${pid}:`, error.message);
        } else {
          console.log(`✅ Đã kill process ${pid}`);
        }
      });
    });

    setTimeout(() => {
      console.log(`\n✅ Hoàn thành! Port ${PORT} đã được giải phóng.`);
      process.exit(0);
    }, 1000);
  });
}

