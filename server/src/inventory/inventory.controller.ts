import { Controller, Get, Post, Body, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrismaService } from '../prisma/prisma.service'; 

@Controller('inventory')
export class InventoryController {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // 1. AMBIL SEMUA ASET
  // ==========================================
  @Get('assets')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER', 'MANAGER', 'ADMIN', 'user', 'manager', 'admin') // 🔥 Amankan dua-duanya biar gak 403 lagi
  async getAssets() {
    try {
      const assets = await this.prisma.asset.findMany({
        orderBy: {
          kode_barang: 'asc',
        },
      });
      return { status: 'success', data: assets };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ==========================================
  // 2. KIRIM FORM PERMINTAAN BARANG
  // ==========================================
  @Post('request')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER', 'user') // 🔥 Amankan dua-duanya
  async createRequest(@Body() body: any, @Request() req: any) {
    const userId = req.user.sub; 

    try {
      await this.prisma.request.create({
        data: {
          userId: userId,
          nama_aset: body.nama_aset,
          jumlah: parseInt(body.jumlah),
          prioritas: body.prioritas,
          tanggal_dibutuhkan: new Date(body.tanggal_dibutuhkan),
          alasan: body.alasan,
          status: 'Pending', 
        },
      });
      return { status: 'success', message: 'Permintaan berhasil diajukan!' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ==========================================
  // 3. AMBIL RIWAYAT REQUEST SENDIRI
  // ==========================================
  @Get('my-requests') 
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER', 'user') // 🔥 Amankan dua-duanya
  async getMyRequests(@Request() req: any) {
    const userId = req.user.sub;

    try {
      const myRequests = await this.prisma.request.findMany({
        where: {
          userId: userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return { status: 'success', data: myRequests };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}