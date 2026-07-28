import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service'; // Sesuaikan path PrismaService lu
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, PrismaService, JwtService],
  exports: [NotificationsService], // Diexport biar modul Request bisa bikin notif
})
export class NotificationsModule {}