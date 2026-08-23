import { 
  Controller, Post, Body, Get, Patch, UseGuards, Req, 
  Inject, forwardRef 
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard'; 

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  // 🔥 LOGIN MENGGUNAKAN NAMA / ID / EMAIL
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    // Parameter 'email' di sini adalah variabel bebas (bisa Nama, ID Pegawai, atau Email)
    return this.authService.login(body.email, body.password);
  }

  // 🔥 ENDPOINT GANTI PASSWORD PERTAMA KALI LOGIN
  @UseGuards(JwtAuthGuard)
  @Post('first-time-change-password')
  async changeFirstPassword(@Req() req, @Body() body: { newPassword: string }) {
    return this.authService.changeFirstPassword(req.user.sub, body.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    return this.authService.getProfile(req.user.sub || req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@Req() req, @Body() body: any) {
    return this.authService.updateProfile(req.user.sub || req.user.id, body);
  }
}