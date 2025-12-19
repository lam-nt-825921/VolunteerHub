// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';  
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load env file dựa trên NODE_ENV (được load trước khi ConfigModule khởi tạo)
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.prod' });
} else {
  dotenv.config({ path: '.env' });
} 

const logger = new Logger('PrismaService'); 

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // Ưu tiên lấy từ process.env (đã được load từ dotenv/config hoặc ConfigModule)
    const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
    
    // Tự động detect database type từ DATABASE_URL
    const isSQLite = databaseUrl.startsWith('file:');
    
    if (isSQLite) {
      // Development: Dùng SQLite với adapter
      const adapter = new PrismaBetterSqlite3({ url: databaseUrl }, {
        timestampFormat: 'unixepoch-ms'  
      });
      super({ adapter });
      logger.log('✅ PrismaService initialized with SQLite adapter (Development mode)');
    } else {
      // Production: Dùng PostgreSQL (Supabase) với adapter pg
      const pool = new Pool({ connectionString: databaseUrl });
      const adapter = new PrismaPg(pool);
      super({ adapter });
      logger.log('✅ PrismaService initialized with PostgreSQL adapter (Production mode)');
    }
  }

  async onModuleInit() {
    try {
      await this.$queryRaw`SELECT 1`;  
      const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
      const dbType = databaseUrl.startsWith('file:') ? 'SQLite (dev.db)' : 'PostgreSQL (Supabase)';
      logger.log(`✅ Prisma connected to ${dbType} - Ready for events, registrations, posts!`);
    } catch (error) {
        logger.error('❌ Prisma connection failed:', error);
        throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();  
    logger.log('🔌 Prisma disconnected');
  }
}