import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  // 🔥 TAMBAH FORWARDREF BIAR AMAN DARI CIRCULAR DEPENDENCY
  constructor(
    @Inject(forwardRef(() => JwtService))
    private jwtService: JwtService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('Akses ditolak: Token tidak ditemukan.');
    }
    
    try {
      // 🔥 REVISI KRUSIAL: Kasih fallback 'rahasia' biar server nggak crash kalau ENV telat kebaca
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'rahasia'
      });
      
      request['user'] = payload; 
    } catch (error) {
      const err = error as Error;
      console.log("🚨 ALASAN TOKEN DITOLAK:", err.message);
      throw new UnauthorizedException('Akses ditolak: Token tidak valid atau sudah kedaluwarsa.');
    }
    
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}