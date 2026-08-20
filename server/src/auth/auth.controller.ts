import { 
  Controller, Post, Body, Get, Patch, UseGuards, Req, 
  Inject, forwardRef, Res, HttpStatus 
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard'; 
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  // 🔥 VERIFIKASI EMAIL SEKALIGUS VALIDASI KODE SEKALI PAKAI
  @Post('verify-email')
  async verifyEmail(@Body() body: { token: string; registrationCode: string }) {
    return this.authService.verifyEmail(body.token, body.registrationCode);
  }

  // 🔥 FITUR ADMIN: GENERATE KODE KE DB & DOWNLOAD EXCEL DENGAN HIGHLIGHT HIJAU
  @Post('generate-registration-codes')
  async generateRegistrationCodes(
    @Body('count') count: number,
    @Res() res: Response,
  ) {
    const total = Number(count) || 10;
    const { buffer, filename } = await this.authService.generateRegistrationCodes(total);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.status(HttpStatus.OK).send(buffer);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('resend-verification')
  async resendVerification(@Body() body: { email: string }) {
    return this.authService.resendVerification(body.email);
  }

  // 🔥 KIRIM ULANG EMAIL VIA TOKEN KEDALUWARSA (1-KLIK)
  @Post('resend-verification-token')
  async resendVerificationToken(@Body() body: { token: string }) {
    return this.authService.resendVerificationByExpiredToken(body.token);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 1, ttl: 180000 } })
  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

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