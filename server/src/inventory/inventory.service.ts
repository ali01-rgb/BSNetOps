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
    try {
      return await this.prisma.asset.findMany({
        orderBy: { kode_barang: 'asc' },
        include: { category: true },
      });
    } catch (error) {
      console.error("🔥 Error pada getAllAssets():", error);
      throw new HttpException('Gagal mengambil data aset dari database.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
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
      include: { category: true },
    });
  }

  async updateAsset(idParam: string, data: any) {
    const existingAsset = await this.prisma.asset.findFirst({
      where: { OR: [{ id: idParam }, { kode_barang: idParam }] },
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
    if (data.location !== undefined) updatePayload.location = data.location;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.image_url !== undefined || data.image !== undefined) {
      updatePayload.image_url = data.image_url || data.image;
    }
    if (data.categoryId !== undefined) updatePayload.categoryId = data.categoryId || null;
    if (data.deleted_at !== undefined) {
      updatePayload.deleted_at = data.deleted_at ? new Date(data.deleted_at) : null;
    }

    return await this.prisma.asset.update({
      where: { id: existingAsset.id },
      data: updatePayload,
      include: { category: true },
    });
  }

  async deleteAsset(idParam: string) {
    const existingAsset = await this.prisma.asset.findFirst({
      where: { OR: [{ id: idParam }, { kode_barang: idParam }] },
    });

    if (!existingAsset) {
      throw new NotFoundException(`Asset dengan ID atau Kode '${idParam}' tidak ditemukan.`);
    }

    return await this.prisma.asset.delete({ where: { id: existingAsset.id } });
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

    const newRequests = await this.prisma.request.createMany({ data: requestData });

    this.prisma.user
      .findUnique({ where: { id: userId } })
      .then(async (userYangRequest) => {
        const adminUsers = await this.prisma.user.findMany({
          where: { role: { in: ['ADMIN', 'admin', 'Admin'] } },
        });

        const notifPromises = adminUsers.map((admin) =>
          this.notificationsService.createNotification({
            userId: admin.id,
            title: 'Request Barang Baru',
            message: `${userYangRequest?.fullName || userYangRequest?.email || 'User'} mengajukan ${data.items.length} jenis barang. Butuh divalidasi!`,
            type: 'request',
            target: 'penyetujuan-barang',
          })
        );
        await Promise.all(notifPromises);
      })
      .catch((error) => {
        console.log('Gagal mengirim notif ke Admin (Background Task Error):', error);
      });

    return newRequests;
  }

  async getMyRequests(userId: string) {
    const requests = await this.prisma.request.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    });

    if (requests.length === 0) return [];

    const assetNames = [...new Set(requests.map((r) => r.nama_aset).filter(Boolean))];

    const assets = await this.prisma.asset.findMany({
      where: { nama_barang: { in: assetNames } },
      include: { category: true },
    });

    return requests.map((req) => {
      const matchedAsset = assets.find((a) => a.nama_barang === req.nama_aset);
      return {
        ...req,
        category: matchedAsset?.category?.name || 'Inventaris Umum',
        categoryName: matchedAsset?.category?.name || 'Inventaris Umum',
      };
    });
  }

  async getAllRequestsForAdmin() {
    const requests = await this.prisma.request.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((req) => ({
      ...req,
      user: req.user || { fullName: 'User Terhapus', email: 'deleted_user@system', divisi: '-' },
    }));
  }

  async getRequestsForManager() {
    const requests = await this.prisma.request.findMany({
      where: {
        status: {
          in: [
            'DITERUSKAN', 'Diteruskan', 'diteruskan', 'DITERUSKAN KE MANAGER',
            'DISETUJUI', 'Disetujui', 'disetujui',
            'SELESAI', 'Selesai', 'selesai',
            'DITOLAK', 'Ditolak', 'ditolak', 'REJECTED'
          ],
        },
      },
      include: {
        user: {
          select: { id: true, fullName: true, divisi: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (requests.length === 0) return [];

    const assetNames = [...new Set(requests.map((r) => r.nama_aset).filter(Boolean))];
    const assets = await this.prisma.asset.findMany({
      where: { nama_barang: { in: assetNames } },
      include: { category: true },
    });

    return requests.map((req) => {
      const matchedAsset = assets.find((a) => a.nama_barang === req.nama_aset);
      return {
        ...req,
        user: req.user || { fullName: 'User Terhapus', divisi: '-' },
        category: matchedAsset?.category?.name || 'Inventaris Umum',
        categoryName: matchedAsset?.category?.name || 'Inventaris Umum',
      };
    });
  }

  async bulkDeleteRequests(ids: string[]) {
    if (!ids || ids.length === 0) {
      return { count: 0, message: 'Tidak ada ID yang diberikan.' };
    }

    const result = await this.prisma.request.deleteMany({ where: { id: { in: ids } } });

    return {
      success: true,
      count: result.count,
      message: `${result.count} data riwayat berhasil dihapus secara permanen.`,
    };
  }

  // ================= UPDATE STATUS & PEMOTONGAN STOK OTOMATIS =================
  // 🔥 FIX UTAMA: parameter kedua sekarang diterima sebagai 'payload' (bisa string ATAU object),
  // dan di-parse dengan benar. Sebelumnya, controller mengirim seluruh body object
  // { status, jumlah_disetujui, catatan_admin } tapi function ini menganggapnya string murni,
  // menyebabkan .toUpperCase() crash dan field jumlah_disetujui/catatan_admin tidak pernah tersimpan.
  async updateRequestStatus(id: string, payload: any, currentUser?: any) {
    // Dukung dua format: string biasa (lama) atau object { status, jumlah_disetujui, catatan_admin } (baru)
    const status = typeof payload === 'string' ? payload : payload?.status;
    const jumlahDisetujuiInput = typeof payload === 'object' ? payload?.jumlah_disetujui : undefined;
    const catatanAdminInput = typeof payload === 'object' ? payload?.catatan_admin : undefined;

    const statusUpper = (status || 'PENDING').toUpperCase();
    const updateData: any = { status: status };

    // 🔥 FIX: field ini sebelumnya dikirim dari frontend tapi TIDAK PERNAH disimpan ke database
    if (jumlahDisetujuiInput !== undefined && jumlahDisetujuiInput !== null) {
      updateData.jumlah_disetujui = parseInt(jumlahDisetujuiInput, 10);
    }
    if (catatanAdminInput !== undefined) {
      updateData.catatan_admin = catatanAdminInput;
    }

    if (currentUser && currentUser.sub) {
      try {
        const userDb = await this.prisma.user.findUnique({ where: { id: currentUser.sub } });
        if (userDb) {
          const roleUpper = (userDb.role || '').toUpperCase();
          if (roleUpper === 'ADMIN' && statusUpper === 'DITERUSKAN') {
            updateData.adminName = userDb.fullName || userDb.email;
          }
          if (roleUpper === 'MANAGER' && ['DISETUJUI', 'DITOLAK', 'SELESAI'].includes(statusUpper)) {
            updateData.managerName = userDb.fullName || userDb.email;
          }
        }
      } catch (e) {
        console.log("Gagal merekam jejak nama pemroses", e);
      }
    }

    const existingRequest = await this.prisma.request.findUnique({ where: { id } });
    if (!existingRequest) {
      throw new NotFoundException(`Request dengan ID ${id} tidak ditemukan.`);
    }

    const isApproving = ['DISETUJUI', 'SELESAI', 'APPROVED'].includes(statusUpper);
    const wasAlreadyApproved = ['DISETUJUI', 'SELESAI', 'APPROVED'].includes((existingRequest.status || '').toUpperCase());

    if (isApproving && !wasAlreadyApproved) {
      const matchedAsset = await this.prisma.asset.findFirst({
        where: { nama_barang: { equals: existingRequest.nama_aset, mode: 'insensitive' } },
      });

      if (matchedAsset) {
        // Pakai jumlah_disetujui kalau ada, kalau tidak fallback ke jumlah yang diminta
        const jumlahDiminta = updateData.jumlah_disetujui ?? existingRequest.jumlah ?? 1;
        const stokSekarang = matchedAsset.stok || 0;
        const sisaStok = Math.max(0, stokSekarang - jumlahDiminta);
        const newStatusStok = sisaStok <= 3 ? 'Kritis' : 'Aman';

        await this.prisma.asset.update({
          where: { id: matchedAsset.id },
          data: { stok: sisaStok, status: newStatusStok },
        });
      }
    }

    const updatedRequest = await this.prisma.request.update({
      where: { id: id },
      data: updateData,
      include: { user: true },
    });

    (async () => {
      try {
        if (statusUpper === 'DITERUSKAN') {
          const managerUsers = await this.prisma.user.findMany({
            where: { role: { in: ['MANAGER', 'manager', 'Manager'] } },
          });

          const notifPromises = managerUsers.map((manager) =>
            this.notificationsService.createNotification({
              userId: manager.id,
              title: 'Menunggu Approval (ACC)',
              message: `Admin telah meneruskan request ${updatedRequest.jumlah} ${updatedRequest.nama_aset}. Butuh ACC Anda.`,
              type: 'request',
              target: 'approval-request',
            })
          );
          await Promise.all(notifPromises);
        } else if (statusUpper === 'DISETUJUI' || statusUpper === 'SELESAI') {
          await this.notificationsService.createNotification({
            userId: updatedRequest.userId,
            title: 'Permintaan Disetujui',
            message: `Yeay! Pengajuan ${updatedRequest.jumlah} ${updatedRequest.nama_aset} telah disetujui.`,
            type: 'approved',
            target: 'riwayat-permintaan',
          });
        } else if (statusUpper === 'DITOLAK') {
          await this.notificationsService.createNotification({
            userId: updatedRequest.userId,
            title: 'Permintaan Ditolak',
            message: `Maaf, pengajuan ${updatedRequest.jumlah} ${updatedRequest.nama_aset} ditolak.`,
            type: 'rejected',
            target: 'riwayat-permintaan',
          });
        }
      } catch (error) {
        console.log('Gagal mengirim notif update status', error);
      }
    })();

    return updatedRequest;
  }

  // ================= KATEGORI BARANG (PRISMA) =================
  async getAllCategories() {
    return await this.prisma.category.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createCategory(data: any) {
    const existingCategory = await this.prisma.category.findFirst({
      where: { name: { equals: data.name, mode: 'insensitive' } },
    });

    if (existingCategory) {
      if (existingCategory.deleted_at) {
        throw new ConflictException(
          `Kategori "${existingCategory.name}" sedang berada di Trash. Silakan Restore dari Trash, jangan buat baru!`
        );
      }
      throw new ConflictException(`Kategori "${existingCategory.name}" sudah terdaftar di sistem!`);
    }

    if (data.category_code) {
      const existingCode = await this.prisma.category.findUnique({
        where: { category_code: data.category_code },
      });
      if (existingCode) {
        throw new ConflictException(`Kode kategori ${data.category_code} sudah digunakan!`);
      }
    }

    const newCategory = await this.prisma.category.create({
      data: {
        category_code: data.category_code || null,
        name: data.name,
        description: data.description || null,
      },
    });

    await this.prisma.asset.updateMany({
      where: { categoryId: null, kategori_sebelumnya: { equals: data.name, mode: 'insensitive' } },
      data: { categoryId: newCategory.id, kategori_sebelumnya: null },
    });

    return newCategory;
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
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (category) {
      await this.prisma.asset.updateMany({
        where: { categoryId: id },
        data: { kategori_sebelumnya: category.name, categoryId: null },
      });
    }

    return await this.prisma.category.delete({ where: { id: id } });
  }

  // ================= MANAJEMEN USER / HAK AKSES STAF (PRISMA) =================
  async getAllUsers() {
    return await this.prisma.user.findMany({
      select: {
        id: true, employeeId: true, email: true, fullName: true, divisi: true,
        phone: true, role: true, hasSignedUp: true, isVerified: true,
        createdAt: true, updatedAt: true, is_suspended: true, deleted_at: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createUserByAdmin(data: any) {
    const cleanEmail = (data.email || '').trim().toLowerCase();

    const existingEmployee = await this.prisma.user.findFirst({
      where: { email: { equals: cleanEmail, mode: 'insensitive' } },
    });

    if (existingEmployee) {
      throw new ConflictException('Email sudah terdaftar di sistem!');
    }

    const roleString = (data.role || 'STAFF').toUpperCase();
    let prefix = 'USR';
    if (roleString === 'ADMIN') prefix = 'ADM';
    if (roleString === 'MANAGER') prefix = 'MGR';

    const existingUsers = await this.prisma.user.findMany({
      where: { employeeId: { startsWith: `BSN-${prefix}-` } },
      select: { employeeId: true },
    });

    let maxNumber = 0;
    existingUsers.forEach((u) => {
      if (u.employeeId) {
        const parts = u.employeeId.split('-');
        const num = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(num) && num > maxNumber) maxNumber = num;
      }
    });

    const nextNumber = String(maxNumber + 1).padStart(3, '0');
    const autoGeneratedId = `BSN-${prefix}-${nextNumber}`;

    let hashedPassword = null;
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10);
    }

    return await this.prisma.user.create({
      data: {
        employeeId: autoGeneratedId,
        email: cleanEmail,
        password: hashedPassword,
        fullName: data.fullName || data.name || cleanEmail.split('@')[0],
        divisi: data.divisi || data.unit || 'KC Semarang',
        role: roleString === 'STAFF' ? 'USER' : roleString,
        hasSignedUp: data.hasSignedUp ?? true,
        isVerified: true,
      },
      select: { id: true, employeeId: true, email: true, fullName: true, role: true },
    });
  }

  async updateUserByAdmin(id: string, data: any) {
    const updatePayload: any = {};

    if (data.fullName !== undefined) updatePayload.fullName = data.fullName;
    if (data.email !== undefined) updatePayload.email = data.email.trim().toLowerCase();
    if (data.divisi !== undefined) updatePayload.divisi = data.divisi;
    if (data.phone !== undefined) updatePayload.phone = data.phone;
    if (data.role !== undefined) updatePayload.role = data.role.toUpperCase();
    if (data.employeeId !== undefined) updatePayload.employeeId = data.employeeId;
    if (data.is_suspended !== undefined) updatePayload.is_suspended = data.is_suspended;
    if (data.deleted_at !== undefined) {
      updatePayload.deleted_at = data.deleted_at ? new Date(data.deleted_at) : null;
    }
    if (data.password) {
      updatePayload.password = await bcrypt.hash(data.password, 10);
    }

    return await this.prisma.user.update({
      where: { id: id },
      data: updatePayload,
      select: {
        id: true, employeeId: true, email: true, fullName: true, role: true,
        divisi: true, phone: true, is_suspended: true, deleted_at: true,
      },
    });
  }

  async deleteUserByAdmin(id: string) {
    return await this.prisma.user.delete({ where: { id: id } });
  }
}
