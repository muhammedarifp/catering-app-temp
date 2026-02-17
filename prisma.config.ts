import { defineConfig } from 'prisma/config'

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:password123@localhost:5433/catering_app',
  },
})
