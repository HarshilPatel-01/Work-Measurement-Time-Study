import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function resolveDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL?.trim();

  if (envUrl && envUrl.length > 0) {
    // Strip extraneous quotes if entered in Vercel UI
    let clean = envUrl.replace(/^["']|["']$/g, '').trim();
    if (clean.length > 0) {
      if (!clean.startsWith('file:') && !clean.startsWith('postgres:') && !clean.startsWith('postgresql:')) {
        clean = `file:${clean}`;
      }
      return clean;
    }
  }

  // If running in Vercel serverless environment, copy seed DB to writable /tmp
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDb = '/tmp/dev.db';
    if (!fs.existsSync(tmpDb)) {
      const candidates = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
      ];
      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          try {
            fs.copyFileSync(candidate, tmpDb);
            break;
          } catch (e) {
            console.warn('Could not copy sqlite db to /tmp:', e);
          }
        }
      }
    }
    return `file:${tmpDb}`;
  }

  return 'file:./dev.db';
}

const dbUrl = resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
