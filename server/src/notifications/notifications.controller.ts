import { Controller, Get, Patch, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // 1. Get notifications for current user
  @Get()
  async getUserNotifications(@Request() req) {
    return this.notificationsService.findByUser(req.user);
  }

  // 2. Read all notifications
  @Patch('read-all')
  async markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user);
  }

  // 3. Read single notification
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  // 4. Delete all notifications
  @Delete()
  async deleteAllNotifications(@Request() req) {
    return this.notificationsService.deleteAllNotifications(req.user);
  }

  // 5. Delete single notification
  @Delete(':id')
  async deleteNotification(@Param('id') id: string) {
    return this.notificationsService.deleteNotification(id);
  }
}