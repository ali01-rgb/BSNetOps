import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  UseGuards, 
  Request, 
  HttpException, 
  HttpStatus, 
  Param 
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // ================= ASSETS (CRUD BARANG) =================
  @Get('assets')
  @Roles('USER', 'MANAGER', 'ADMIN', 'user', 'manager', 'admin')
  async getAssets() {
    try {
      const assets = await this.inventoryService.getAllAssets();
      return { status: 'success', data: assets };
    } catch (error) {
      const err = error as Error;
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('assets')
  @Roles('ADMIN', 'admin')
  async createAsset(@Body() body: any) {
    try {
      const data = await this.inventoryService.createAsset(body);
      return { status: 'success', message: 'Aset/Barang berhasil ditambahkan', data: data };
    } catch (error) {
      const err = error as Error;
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('assets/:id')
  @Roles('ADMIN', 'admin')
  async updateAsset(@Param('id') id: string, @Body() body: any) {
    try {
      const data = await this.inventoryService.updateAsset(id, body);
      return { status: 'success', message: 'Aset/Barang berhasil diperbarui', data: data };
    } catch (error) {
      const err = error as Error;
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('assets/:id')
  @Roles('ADMIN', 'admin')
  async deleteAsset(@Param('id') id: string) {
    try {
      await this.inventoryService.deleteAsset(id);
      return { status: 'success', message: 'Aset/Barang berhasil dihapus secara permanen' };
    } catch (error) {
      const err = error as Error;
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ================= REQUESTS (USER) =================
  // 🔥 PERBAIKAN: Admin & Manager sekarang bisa create request juga (gak akan 403 Forbidden)
  @Post('requests')
  @Roles('USER', 'user', 'ADMIN', 'admin', 'MANAGER', 'manager')
  async createRequest(@Body() body: any, @Request() req: any) {
    try {
      await this.inventoryService.createRequest(req.user.sub, body);
      return { status: 'success', message: 'Permintaan berhasil diajukan!' };
    } catch (error) {
      const err = error as Error;
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 🔥 PERBAIKAN: Admin & Manager sekarang berhak melihat halaman Riwayatnya sendiri
  @Get('my-requests')
  @Roles('USER', 'user', 'ADMIN', 'admin', 'MANAGER', 'manager')
  async getMyRequests(@Request() req: any) {
    try {
      const myRequests = await this.inventoryService.getMyRequests(req.user.sub);
      return { status: 'success', data: myRequests };
    } catch (error) {
      const err = error as Error;
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ================= REQUESTS (ADMIN & MANAGER) =================
  
  @Get('admin/requests')
  @Roles('ADMIN', 'admin', 'MANAGER', 'manager') 
  async getAllRequestsForAdmin() {
    try {
      const data = await this.inventoryService.getAllRequestsForAdmin();
      return { status: 'success', data: data };
    } catch (error) {
      const err = error as Error;
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('manager/requests')
  @Roles('MANAGER', 'manager', 'ADMIN', 'admin')
  async getRequestsForManager() {
    try {
      const data = await this.inventoryService.getRequestsForManager();
      return { status: 'success', data: data };
    } catch (error) {
      const err = error as Error;
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('admin/requests/:id/status')
  @Roles('ADMIN', 'admin', 'MANAGER', 'manager')
  async updateRequestStatus(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    try {
      await this.inventoryService.updateRequestStatus(id, body, req.user);
      return { status: 'success', message: `Status berhasil diperbarui` };
    } catch (error) {
      const err = error as Error;
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 🔥 REVISI 2: MENGUBAH @Delete MENJADI @Post UNTUK MENGHINDARI ERROR CORS/BODY STRIPPING DI FRONTEND
  @Post('requests/bulk-delete')
  @Roles('ADMIN', 'admin', 'MANAGER', 'manager')
  async bulkDeleteRequests(@Body('ids') ids: string[]) {
    try {
      const data = await this.inventoryService.bulkDeleteRequests(ids);
      return { status: 'success', message: 'Riwayat berhasil dihapus dari database', data: data };
    } catch (error) {
      const err = error as Error;
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ================= TABEL KATEGORI BARANG (ADMIN) =================
  @Get('categories')
  @Roles('ADMIN', 'admin', 'MANAGER', 'manager', 'USER', 'user')
  async getCategories() {
    try {
      const data = await this.inventoryService.getAllCategories();
      return { status: 'success', data: data };
    } catch (error) {
      const err = error as Error;
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('categories')
  @Roles('ADMIN', 'admin')
  async createCategory(@Body() body: any) {
    try {
      const data = await this.inventoryService.createCategory(body);
      return { status: 'success', message: 'Kategori berhasil ditambahkan', data: data };
    } catch (error) {
      const err = error as Error;
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('categories/:id')
  @Roles('ADMIN', 'admin')
  async updateCategory(@Param('id') id: string, @Body() body: any) {
    try {
      const data = await this.inventoryService.updateCategory(id, body);
      return { status: 'success', message: 'Kategori berhasil diperbarui', data: data };
    } catch (error) {
      const err = error as Error;
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('categories/:id')
  @Roles('ADMIN', 'admin')
  async deleteCategory(@Param('id') id: string) {
    try {
      await this.inventoryService.deleteCategory(id);
      return { status: 'success', message: 'Kategori berhasil dihapus secara permanen' };
    } catch (error) {
      const err = error as Error;
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ================= MANAJEMEN USER / STAF (ADMIN) =================
  @Get('users')
  @Roles('ADMIN', 'admin')
  async getAllUsers() {
    try {
      const data = await this.inventoryService.getAllUsers();
      return { status: 'success', data: data };
    } catch (error) {
      const err = error as Error;
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('users')
  @Roles('ADMIN', 'admin')
  async createUserByAdmin(@Body() body: any) {
    try {
      const data = await this.inventoryService.createUserByAdmin(body);
      return { status: 'success', message: 'User/Staf baru berhasil ditambahkan', data: data };
    } catch (error) {
      const err = error as Error;
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('users/:id')
  @Roles('ADMIN', 'admin')
  async updateUserByAdmin(@Param('id') id: string, @Body() body: any) {
    try {
      const data = await this.inventoryService.updateUserByAdmin(id, body);
      return { status: 'success', message: 'Data user berhasil diperbarui', data: data };
    } catch (error) {
      const err = error as Error;
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('users/:id')
  @Roles('ADMIN', 'admin')
  async deleteUserByAdmin(@Param('id') id: string) {
    try {
      await this.inventoryService.deleteUserByAdmin(id);
      return { status: 'success', message: 'User berhasil dihapus' };
    } catch (error) {
      const err = error as Error;
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}