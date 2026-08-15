import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module'; 
import { JwtModule } from '@nestjs/jwt'; 
import { MailService } from './mail.service';
import { ThrottlerModule } from '@nestjs/throttler'; // 🔥 1. IMPORT THROTTLER DI SINI

@Module({
  imports: [
    // 1. Gunakan forwardRef untuk PrismaModule biar saling tunggu pas booting
    forwardRef(() => PrismaModule),
    
    // 2. Register JwtModule tanpa 'global: true' agar terikat kuat di AuthModule ini
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'rahasia', 
      signOptions: { expiresIn: '1d' },
    }),

    // 🔥 3. DAFTARIN THROTTLER MODULE DI SINI BIAR GUARD-NYA BISA JALAN
    ThrottlerModule.forRoot([{
      ttl: 180000, // 3 menit (180.000 ms)
      limit: 1,    // Maksimal 1 request
    }]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    MailService
  ],
  // 4. EXPORTS WAJIB ADA: Agar AuthService & JwtModule bisa dibaca oleh Guard/Module lain
  exports: [AuthService, JwtModule], 
})
export class AuthModule {}