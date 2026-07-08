import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  // Kita inject JwtService bawaan NestJS untuk memverifikasi token
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // 1. Ekstrak token Bearer dari header request
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('Token tidak ditemukan. Silakan login terlebih dahulu.');
    }
    
    try {
      // 2. Verifikasi token menggunakan secret key dari file .env kamu
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET, 
      });
      
      // 3. Simpan payload (id, username, role) ke dalam object request
      // Ini WAJIB supaya RolesGuard bisa membaca: request.user.role
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Token tidak valid atau sudah kadaluarsa.');
    }
    
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}