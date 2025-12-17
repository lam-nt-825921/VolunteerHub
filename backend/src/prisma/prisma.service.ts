// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';  
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'; 
import * as dotenv from 'dotenv';

dotenv.config(); 

const logger = new Logger('PrismaService'); 

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || 'file:./dev.db' }, {
      timestampFormat: 'unixepoch-ms'  
    });

    super({ adapter });  
    logger.log('✅ PrismaService initialized with SQLite adapter (VolunteerHub ready!)');
  }

  async onModuleInit() {
    try {
      await this.$queryRaw`SELECT 1`;  
      logger.log('✅ Prisma connected to dev.db - Ready for events, registrations, posts!');
    } catch (error) {
        logger.error('❌ Prisma connection failed:', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();  
    logger.log('🔌 Prisma disconnected');
  }
}