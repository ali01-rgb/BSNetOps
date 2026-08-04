import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
// Hapus PrismaModule dari import karena sudah @Global()
import { NotificationsModule } from '../notifications/notifications.module'; 
import { AuthModule } from '../auth/auth.module'; // IMPORT INI

@Module({
  imports: [
    NotificationsModule, 
    AuthModule // TAMBAHKAN KE DALAM ARRAY IMPORTS
  ], 
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}