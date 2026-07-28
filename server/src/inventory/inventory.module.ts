import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module'; // 🔥 IMPORT INI

@Module({
  imports: [
    PrismaModule, 
    NotificationsModule // 🔥 TAMBAHKAN KE DALAM ARRAY IMPORTS
  ], 
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}