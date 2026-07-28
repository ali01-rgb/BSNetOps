import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { InventoryModule } from './inventory/inventory.module'; // 🔥 1. IMPORT MODUL INVENTORY DI SINI
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    PrismaModule, 
    AuthModule, 
    InventoryModule, NotificationsModule // 🔥 2. DAFTARKAN DI ARRAY IMPORTS BIAR RUTENYA AKTIF
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}