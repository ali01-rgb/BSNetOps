import { Controller, Get, Patch, Param, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtService } from '@nestjs/jwt';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notifsService: NotificationsService,
    private jwtService: JwtService
  ) {}

  // Fungsi internal untuk ekstrak ID dari Token
  private getUserId(authHeader: string): string {
    if (!authHeader) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    const token = authHeader.split(' ')[1];
    try {
      const decoded = this.jwtService.verify(token);
      return decoded.sub; // ID user
    } catch {
      throw new HttpException('Token Invalid', HttpStatus.UNAUTHORIZED);
    }
  }

  @Get()
  getNotifs(@Headers('authorization') authHeader: string) {
    const userId = this.getUserId(authHeader);
    return this.notifsService.getUserNotifications(userId);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return this.notifsService.markAsRead(id);
  }

  @Patch('read-all')
  markAllRead(@Headers('authorization') authHeader: string) {
    const userId = this.getUserId(authHeader);
    return this.notifsService.markAllAsRead(userId);
  }
}