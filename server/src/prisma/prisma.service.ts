import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

// 1. Mantra sakti biar NestJS melek dan bisa baca file .env lu sebelum Pool-nya jalan
dotenv.config(); 

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // 2. Sekarang Supabase URL lu pasti kebaca dengan sempurna di sini
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // 3. Pasangkan ke Adapter bawaan Prisma 7
    const adapter = new PrismaPg(pool);
    
    // 4. Masukin adapternya ke mesin utama
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}