import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('Akses ditolak: Token tidak ditemukan.');
    }
    
 try {
      // REVISI: Samakan kuncinya dengan yang ada di auth.module.ts
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET
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