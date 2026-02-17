import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = global as unknown as { prisma: PrismaClient; pool: pg.Pool }

// Create connection pool
const pool = globalForPrisma.pool || new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password123@localhost:5433/catering_app',
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.pool = pool

// Create adapter
const adapter = new PrismaPg(pool)

// Create Prisma Client
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
