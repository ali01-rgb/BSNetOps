import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Ambil list role yang diizinkan dari decorator @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Jika endpoint tidak dipasang decorator @Roles, artinya endpoint itu bebas diakses
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 2. Ambil data user yang sudah ditempel oleh JwtGuard ke dalam request
    const { user } = context.switchToHttp().getRequest();
    
    // 🔥 CCTV: Cetak isi payload token ke terminal biar kelihatan role-nya apa
    console.log("🕵️‍♂️ CEK USER DI ROLES GUARD:", user);

    // Validasi apakah user ada dan memiliki role
    if (!user || !user.role) {
      throw new HttpException('Akses ditolak. Token Anda tidak memiliki data Role. Silakan login ulang.', HttpStatus.UNAUTHORIZED);
    }

    // 3. Cek apakah role si user ada di dalam list requiredRoles (dibikin tahan banting/kebal huruf besar-kecil)
    const userRole = String(user.role).toUpperCase();
    const hasRole = requiredRoles.some((role) => String(role).toUpperCase() === userRole);
    
    if (!hasRole) {
      throw new HttpException('Anda tidak memiliki hak akses untuk fitur ini.', HttpStatus.FORBIDDEN);
    }

    return true;
  }
}