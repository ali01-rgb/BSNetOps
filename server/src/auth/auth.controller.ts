import { Controller, Post, Body, Get, Patch, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
// Sesuaikan import JwtAuthGuard dengan letak file lu!
// (Karena di terminal lu sebelumnya ada tulisan JwtAuthGuard/RolesGuard, pastikan path ini benar)
import { JwtAuthGuard } from './jwt-auth.guard'; 

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.authService.login(body.username, body.password);
  }

  // 🔥 1. ENDPOINT UNTUK AMBIL DATA PROFIL (Dipanggil pas halaman di-load)
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    // req.user.sub biasanya berisi ID user dari token JWT
    return this.authService.getProfile(req.user.sub || req.user.id);
  }

  // 🔥 2. ENDPOINT UNTUK SIMPAN EDIT PROFIL (Dipanggil pas klik tombol Simpan)
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@Req() req, @Body() body: any) {
    return this.authService.updateProfile(req.user.sub || req.user.id, body);
  }
}