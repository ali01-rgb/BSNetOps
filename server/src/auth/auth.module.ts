import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module'; 
import { JwtModule } from '@nestjs/jwt'; 
import { MailService } from './mail.service'; // 🔥 IMPORT MAIL SERVICE

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true, 
      secret: process.env.JWT_SECRET || 'rahasia', 
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    MailService // 🔥 TAMBAHKAN MAIL SERVICE DI SINI
  ],
})
export class AuthModule {}