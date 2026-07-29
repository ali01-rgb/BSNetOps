import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // 1. Method generic pembuat notifikasi
  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type?: string;
    target?: string;
  }) {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        target: data.target || 'dashboard',
      },
    });
  }

  // 🔥 2. HELPER EKSTRAK ID JWT SUPER AGRESIF
  private extractUserId(user: any): string {
    if (!user) return '';
    // Jika bentuknya langsung string (bukan object)
    if (typeof user === 'string') return user;
    
    // JWT NestJS default biasanya menaruh ID di "sub" (seperti di inventory.controller)
    return user.sub || user.userId || user.id || '';
  }

  // 3. Fetch notifikasi milik user tertentu
  async findByUser(user: any) {
    const targetUserId = this.extractUserId(user);
    
    // Jika backend gagal dapet ID, log peringatan di terminal
    if (!targetUserId) {
      console.log('⚠️ PERINGATAN: ID User tidak ditemukan di Token JWT!', user);
      return [];
    }

    return this.prisma.notification.findMany({
      where: { userId: targetUserId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Alias untuk kompatibilitas
  async getUserNotifications(user: any) {
    return this.findByUser(user);
  }

  // 4. Update status dibaca (Satu Notif)
  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  // 5. Update status dibaca (Semua Notif)
  async markAllAsRead(user: any) {
    const targetUserId = this.extractUserId(user);
    if (!targetUserId) return { count: 0 };

    return this.prisma.notification.updateMany({
      where: { userId: targetUserId },
      data: { isRead: true },
    });
  }

  // 6. Hapus satu notifikasi
  async deleteNotification(id: string) {
    return this.prisma.notification.delete({
      where: { id },
    });
  }

  // 7. Hapus semua notifikasi milik user
  async deleteAllNotifications(user: any) {
    const targetUserId = this.extractUserId(user);
    if (!targetUserId) return { count: 0 };

    return this.prisma.notification.deleteMany({
      where: { userId: targetUserId },
    });
  }
}