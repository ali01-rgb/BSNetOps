import { Controller, Post, Body, Get, Patch, UseGuards, Req, Inject, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard'; 
import { ThrottlerGuard, Throttle } from '@nestjs/throttler'; // 🔥 IMPORT THROTTLER UNTUK ANTI-SPAM

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService
  ) {}

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.authService.login(body.username, body.password);
  }

  // 🔥 RUTE 1: REQUEST FORGOT PASSWORD (DILINDUNGI ANTI-SPAM)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 1, ttl: 180000 } }) // Maks 1 request per 3 menit (180000 ms)
  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  // 🔥 RUTE 2: EXECUTE RESET PASSWORD BARU (DITAMBAH PARAMETER TOKEN)
  @Post('reset-password')
  async resetPassword(@Body() body: { email: string; newPassword: string; token: string }) {
    return this.authService.resetPassword(body.email, body.newPassword, body.token);
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