// scripts/run-prisma.js
// Helper script để chạy Prisma commands với env file đúng
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Lấy command và env file từ arguments
const command = process.argv[2]; // 'migrate', 'studio', 'seed', etc.
const envFile = process.argv[3] || '.env'; // '.env' hoặc '.env.prod'
const envPath = path.join(__dirname, '..', envFile);

// Load env file
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
  console.log(`✅ Loaded environment from: ${envFile}`);
} else {
  console.warn(`⚠️  Environment file not found: ${envFile}, using system env`);
}

// Map commands
const commands = {
  'migrate': 'npx prisma migrate dev --schema=./src/prisma/schema.prisma',
  'migrate:prod': 'npx prisma migrate deploy --schema=./src/prisma/schema.prisma',
  'studio': 'npx prisma studio --schema=./src/prisma/schema.prisma',
  'seed': 'npx ts-node prisma/seed.ts',
};

const prismaCommand = commands[command];
if (!prismaCommand) {
  console.error(`❌ Unknown command: ${command}`);
  console.error(`Available commands: ${Object.keys(commands).join(', ')}`);
  process.exit(1);
}

// Chạy command với env variables đã load
try {
  execSync(prismaCommand, { 
    stdio: 'inherit', 
    cwd: path.join(__dirname, '..'),
    env: { ...process.env } // Pass env variables to child process
  });
} catch (error) {
  process.exit(1);
}

