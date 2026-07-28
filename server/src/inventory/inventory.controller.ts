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

  // ================= ASSETS =================
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

  // ================= REQUESTS (USER) =================
  @Post('requests')
  @Roles('USER', 'user')
  async createRequest(@Body() body: any, @Request() req: any) {
    try {
      await this.inventoryService.createRequest(req.user.sub, body);
      return { status: 'success', message: 'Permintaan berhasil diajukan!' };
    } catch (error) {
      const err = error as Error;
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('my-requests')
  @Roles('USER', 'user')
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

  @Post('admin/requests/:id/status')
  @Roles('ADMIN', 'admin', 'MANAGER', 'manager')
  async updateRequestStatus(@Param('id') id: string, @Body('status') status: string) {
    try {
      await this.inventoryService.updateRequestStatus(id, status);
      return { status: 'success', message: `Status berhasil diubah menjadi ${status}` };
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