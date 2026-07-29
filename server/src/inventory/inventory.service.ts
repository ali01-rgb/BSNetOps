import { Injectable, HttpException, HttpStatus, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  // ================= ASSETS (BARANG / INVENTARIS) =================
  async getAllAssets() {
    return await this.prisma.asset.findMany({
      orderBy: { kode_barang: 'asc' },
      include: {
        category: true, 
      },
    });
  }

  async createAsset(data: any) {
    const kodeBarang = data.kode_barang || data.id || `BRG-${Date.now()}`;
    const namaBarang = data.nama_barang || data.nama_aset || data.name;
    const stok = parseInt(data.stok ?? data.stock ?? 0, 10);

    return await this.prisma.asset.create({
      data: {
        kode_barang: kodeBarang,
        nama_barang: namaBarang,
        stok: stok,
        location: data.location || null,
        status: data.status || (stok <= 3 ? 'Kritis' : 'Aman'),
        image_url: data.image_url || data.image || null,
        categoryId: data.categoryId || null,
      },
      include: { category: true }
    });
  }

  async updateAsset(idParam: string, data: any) {
    const existingAsset = await this.prisma.asset.findFirst({
      where: {
        OR: [
          { id: idParam },
          { kode_barang: idParam }
        ]
      }
    });

    if (!existingAsset) {
      throw new NotFoundException(`Asset dengan ID atau Kode '${idParam}' tidak ditemukan.`);
    }

    const updatePayload: any = {};

    if (data.nama_barang !== undefined || data.nama_aset !== undefined || data.name !== undefined) {
      updatePayload.nama_barang = data.nama_barang || data.nama_aset || data.name;
    }
    if (data.stok !== undefined || data.stock !== undefined) {
      updatePayload.stok = parseInt(data.stok ?? data.stock, 10);
    }
    if (data.location !== undefined) {
      updatePayload.location = data.location;
    }
    if (data.status !== undefined) {
      updatePayload.status = data.status;
    }
    if (data.image_url !== undefined || data.image !== undefined) {
      updatePayload.image_url = data.image_url || data.image;
    }
    if (data.categoryId !== undefined) {
      updatePayload.categoryId = data.categoryId || null;
    }
    if (data.deleted_at !== undefined) {
      updatePayload.deleted_at = data.deleted_at ? new Date(data.deleted_at) : null;
    }

    return await this.prisma.asset.update({
      where: { id: existingAsset.id },
      data: updatePayload,
      include: { category: true }
    });
  }

  async deleteAsset(idParam: string) {
    const existingAsset = await this.prisma.asset.findFirst({
      where: {
        OR: [
          { id: idParam },
          { kode_barang: idParam }
        ]
      }
    });

    if (!existingAsset) {
      throw new NotFoundException(`Asset dengan ID atau Kode '${idParam}' tidak ditemukan.`);
    }

    return await this.prisma.asset.delete({
      where: { id: existingAsset.id },
    });
  }

  // ================= REQUESTS =================
  async createRequest(userId: string, data: any) {
    const requestData = data.items.map((item: any) => ({
      userId: userId,
      nama_aset: item.namaAset,
      jumlah: parseInt(item.jumlah),
      prioritas: item.prioritas,
      tanggal_dibutuhkan: new Date(data.tanggalDibutuhkan),
      alasan: item.keterangan || '',
      status: 'Pending',
    }));

    const newRequests = await this.prisma.request.createMany({
      data: requestData,
    });

    try {
      const userYangRequest = await this.prisma.user.findUnique({ where: { id: userId } });
      // 🔥 FIX: Array Role yang lebih kuat
      const adminUsers = await this.prisma.user.findMany({ 
        where: { role: { in: ['ADMIN', 'admin', 'Admin'] } } 
      });
      
      for (const admin of adminUsers) {
        await this.notificationsService.createNotification({
          userId: admin.id,
          title: 'Request Barang Baru',
          message: `${userYangRequest?.fullName || userYangRequest?.username || 'User'} mengajukan ${data.items.length} jenis barang. Butuh divalidasi!`,
          type: 'request',
          target: 'penyetujuan-barang'
        });
      }
    } catch (error) {
      console.log("Gagal mengirim notif ke Admin", error);
    }

    return newRequests;
  }

  async getMyRequests(userId: string) {
    return await this.prisma.request.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }
  
  async getAllRequestsForAdmin() {
    return await this.prisma.request.findMany({
      include: { user: true }, 
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateRequestStatus(id: string, status: string) {
    const updatedRequest = await this.prisma.request.update({
      where: { id: id },
      data: { status: status },
      include: { user: true }
    });

    try {
      if (status === 'Diteruskan' || status.toLowerCase() === 'diteruskan') {
        // 🔥 FIX: Array Role Manager yang lebih kuat
        const managerUsers = await this.prisma.user.findMany({ 
          where: { role: { in: ['MANAGER', 'manager', 'Manager'] } } 
        });
        
        for (const manager of managerUsers) {
          await this.notificationsService.createNotification({
            userId: manager.id,
            title: 'Menunggu Approval (ACC)',
            message: `Admin telah meneruskan request ${updatedRequest.jumlah} ${updatedRequest.nama_aset}. Butuh ACC Anda.`,
            type: 'request',
            target: 'approval-request'
          });
        }
      } 
      else if (status === 'Disetujui' || status.toLowerCase() === 'disetujui') {
        await this.notificationsService.createNotification({
          userId: updatedRequest.userId,
          title: 'Permintaan Disetujui',
          message: `Yeay! Pengajuan ${updatedRequest.jumlah} ${updatedRequest.nama_aset} telah disetujui.`,
          type: 'approved',
          target: 'riwayat-permintaan'
        });
      } 
      else if (status === 'Ditolak' || status.toLowerCase() === 'ditolak') {
        await this.notificationsService.createNotification({
          userId: updatedRequest.userId,
          title: 'Permintaan Ditolak',
          message: `Maaf, pengajuan ${updatedRequest.jumlah} ${updatedRequest.nama_aset} ditolak.`,
          type: 'rejected',
          target: 'riwayat-permintaan'
        });
      }
    } catch (error) {
      console.log("Gagal mengirim notif update status", error);
    }

    return updatedRequest;
  }

  // ================= KATEGORI BARANG (PRISMA) =================
  async getAllCategories() {
    return await this.prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCategory(data: any) {
    if (data.category_code) {
      const existingCode = await this.prisma.category.findUnique({
        where: { category_code: data.category_code }
      });
      if (existingCode) {
        throw new ConflictException(`Kode kategori ${data.category_code} sudah digunakan!`);
      }
    }

    return await this.prisma.category.create({
      data: {
        category_code: data.category_code || null,
        name: data.name,
        description: data.description || null,
      },
    });
  }

  async updateCategory(id: string, data: any) {
    return await this.prisma.category.update({
      where: { id: id },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        description: data.description !== undefined ? data.description : undefined,
        deleted_at: data.deleted_at !== undefined ? (data.deleted_at ? new Date(data.deleted_at) : null) : undefined,
      },
    });
  }

  async deleteCategory(id: string) {
    return await this.prisma.category.delete({
      where: { id: id },
    });
  }

  // ================= MANAJEMEN USER / HAK AKSES STAF (PRISMA) =================
  async getAllUsers() {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        employeeId: true,
        username: true,
        email: true,
        fullName: true,
        divisi: true,
        phone: true,
        role: true,
        hasSignedUp: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createUserByAdmin(data: any) {
    const existingEmployee = await this.prisma.user.findFirst({
      where: {
        OR: [
          { employeeId: data.employeeId },
          { email: data.email },
          { username: data.username }
        ]
      }
    });

    if (existingEmployee) {
      throw new ConflictException('ID Staff, Email, atau Username sudah terdaftar di sistem!');
    }

    let hashedPassword = null;
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10);
    }

    return await this.prisma.user.create({
      data: {
        employeeId: data.employeeId,
        username: data.username,
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName || null,
        divisi: data.divisi || null,
        phone: data.phone || null,
        role: (data.role || 'USER').toUpperCase(),
        hasSignedUp: data.hasSignedUp ?? false,
      },
      select: {
        id: true,
        employeeId: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
      }
    });
  }

  async updateUserByAdmin(id: string, data: any) {
    const updatePayload: any = {};

    if (data.fullName !== undefined) updatePayload.fullName = data.fullName;
    if (data.email !== undefined) updatePayload.email = data.email;
    if (data.divisi !== undefined) updatePayload.divisi = data.divisi;
    if (data.phone !== undefined) updatePayload.phone = data.phone;
    if (data.role !== undefined) updatePayload.role = data.role.toUpperCase();
    if (data.employeeId !== undefined) updatePayload.employeeId = data.employeeId;

    if (data.password) {
      updatePayload.password = await bcrypt.hash(data.password, 10);
    }

    return await this.prisma.user.update({
      where: { id: id },
      data: updatePayload,
      select: {
        id: true,
        employeeId: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        divisi: true,
        phone: true,
      }
    });
  }

  async deleteUserByAdmin(id: string) {
    return await this.prisma.user.delete({
      where: { id: id },
    });
  }
}