import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // AMBIL SEMUA NOTIF MILIK USER TERTENTU (Terbaru di atas)
  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // TANDAI 1 NOTIF SUDAH DIBACA
  async markAsRead(notifId: string) {
    return this.prisma.notification.update({
      where: { id: notifId },
      data: { isRead: true },
    });
  }

  // TANDAI SEMUA NOTIF SUDAH DIBACA
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  // 🔥 FUNGSI BUAT BIKIN NOTIFIKASI BARU
  async createNotification(userId: string, title: string, message: string, type: string, target: string) {
    return this.prisma.notification.create({
      data: { userId, title, message, type, target }
    });
  }
}