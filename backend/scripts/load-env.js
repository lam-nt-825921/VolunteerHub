// scripts/load-env.js
// Helper script để load env file đúng cách cho các script Node.js
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Xác định env file dựa trên NODE_ENV hoặc argument
const env = process.env.NODE_ENV || process.argv[2] || 'development';
const envFile = env === 'production' ? '.env.prod' : '.env';
const envPath = path.join(__dirname, '..', envFile);

// Load env file nếu tồn tại
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
  console.log(`✅ Loaded environment from: ${envFile}`);
} else {
  console.warn(`⚠️  Environment file not found: ${envFile}`);
  console.warn(`   Using system environment variables or defaults`);
}

// Export để các script khác có thể dùng
module.exports = { env, envFile, envPath };

