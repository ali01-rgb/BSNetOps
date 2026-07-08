import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service'; // 👈 1. Ambil service database lo

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [InventoryController],
  providers: [PrismaService], // 👈 2. Masukkan ke providers biar controller gak crash nyari DB
})
export class InventoryModule {}