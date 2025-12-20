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
      // LƯU Ý: Schema hiện tại là PostgreSQL, không thể dùng SQLite adapter
      // Nếu muốn dùng SQLite cho dev, cần đổi schema.prisma về provider = "sqlite"
      logger.error('❌ Schema mismatch: Schema is PostgreSQL but DATABASE_URL is SQLite');
      logger.error('💡 Solution: Use PostgreSQL DATABASE_URL OR change schema.prisma to "sqlite" for development');
      throw new Error('Schema provider (postgresql) does not match DATABASE_URL (SQLite). Please use PostgreSQL DATABASE_URL for production or change schema.prisma to "sqlite" for development.');
    } else {
      // Dùng PostgreSQL (Neon hoặc Supabase) với adapter pg
      const pool = new Pool({ connectionString: databaseUrl });
      const adapter = new PrismaPg(pool);
      super({ adapter });
      const mode = process.env.NODE_ENV === 'production' ? 'Production' : 'Development';
      logger.log(`✅ PrismaService initialized with PostgreSQL adapter (${mode} mode)`);
    }
  }

  async onModuleInit() {
    try {
      await this.$queryRaw`SELECT 1`;  
      const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
      const dbType = databaseUrl.startsWith('file:') 
        ? 'SQLite (dev.db)' 
        : databaseUrl.includes('neon.tech') 
          ? 'PostgreSQL (Neon)' 
          : 'PostgreSQL';
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