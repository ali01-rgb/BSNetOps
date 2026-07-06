import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';

// Biar Prisma CLI melek sama file .env lu
dotenv.config();

export default defineConfig({
  datasource: {
    // Ini yang diminta Prisma buat db push ke Supabase (Port 5432)
    url: process.env.DIRECT_URL,
  },
});