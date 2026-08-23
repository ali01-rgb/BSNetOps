import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module'; 
import { JwtModule } from '@nestjs/jwt'; 

@Module({
  imports: [
    // 1. Gunakan forwardRef untuk PrismaModule biar saling tunggu pas booting
    forwardRef(() => PrismaModule),
    
    // 2. Register JwtModule agar token JWT aktif untuk otentikasi login
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'rahasia', 
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  // 3. EXPORTS WAJIB ADA: Agar AuthService & JwtModule bisa dibaca oleh Guard/Module lain
  exports: [AuthService, JwtModule], 
})
export class AuthModule {}