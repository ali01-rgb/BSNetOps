import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { AuthModule } from '../auth/auth.module'; // IMPORT AuthModule

@Module({
  imports: [
    AuthModule // Wajib di-import agar JwtAuthGuard bisa bekerja di controller ini
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService 
    // HAPUS PrismaService & JwtService. 
    // Prisma sudah Global, JWT ngambil dari AuthModule.
  ],
  exports: [NotificationsService], 
})
export class NotificationsModule {}