import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Pastikan PrismaModule di-import
import { JwtModule } from '@nestjs/jwt'; // <--- Wajib ada

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true, // Biar bisa dipakai di mana saja
      secret: 'bebas_isi_apa_aja_di_sini', // Ini kunci rahasia token lu
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}