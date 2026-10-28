import { defineConfig } from '@prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Fallback pour le build Docker, remplacé par la vraie variable au runtime
    url: process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy',
  },
})
