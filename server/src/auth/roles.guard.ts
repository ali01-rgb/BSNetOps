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

    // Jika endpoint tidak dipasang decorator @Roles, artinya endpoint itu bebas diakses (public/semua role yang login)
    if (!requiredRoles) {
      return true;
    }

    // 2. Ambil data user yang sudah ditempel oleh JwtGuard ke dalam request
    const { user } = context.switchToHttp().getRequest();
    
    // Validasi apakah user ada dan memiliki role
    if (!user || !user.role) {
      throw new HttpException('Akses ditolak. Sesi tidak valid.', HttpStatus.UNAUTHORIZED);
    }

    // 3. Cek apakah role si user ada di dalam list requiredRoles
    const hasRole = requiredRoles.includes(user.role);
    
    if (!hasRole) {
      throw new HttpException('Anda tidak memiliki hak akses untuk fitur ini.', HttpStatus.FORBIDDEN);
    }

    return true;
  }
}