import { PrismaClient } from '@prisma/client';
import { logger } from '../shared/logger.js';

export const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

export async function connectPrisma() {
  try {
    await prisma.$connect();
    
    // Prepare GodMode Memory Layer (pgvector initialization)
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector;');
    
    logger.info('✅ PostgreSQL (via Prisma) connected successfully. pgvector extension active.');
    console.log('✅ PostgreSQL (via Prisma) connected successfully. pgvector extension active.');
  } catch (error) {
    logger.error('❌ Failed to connect to PostgreSQL or initialize extensions:', error);
    console.error('❌ Failed to connect to PostgreSQL:', error);
  }
}
