import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt'; 
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService 
  ) {}

  async register(data: any) {
    const employee = await this.prisma.user.findUnique({
      where: { employeeId: data.employeeId },
    });

    if (!employee) {
      throw new HttpException('ID Staff tidak ditemukan.', HttpStatus.NOT_FOUND);
    }

    if (employee.hasSignedUp) {
      throw new HttpException('Akun sudah aktif.', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const updatedUser = await this.prisma.user.update({
      where: { employeeId: data.employeeId },
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        hasSignedUp: true,
      },
    });

    return { message: 'Registrasi berhasil', user: updatedUser.username };
  }

  // --- FUNGSI LOGIN ---
  async login(username: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) {
      throw new HttpException('User tidak ditemukan', HttpStatus.UNAUTHORIZED);
    }

    if (!user.password) {
      throw new HttpException('Password tidak valid. Silakan registrasi ulang.', HttpStatus.UNAUTHORIZED);
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new HttpException('Password salah', HttpStatus.UNAUTHORIZED);
    }

    const userRole = user.role || 'USER';

    const payload = { 
      sub: user.id, 
      username: user.username,
      role: userRole 
    };
    
    return {
      access_token: await this.jwtService.signAsync(payload),
      role: userRole, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        employeeId: user.employeeId,
        role: userRole,
        namaLengkap: user.fullName, 
      }
    };
  }

  // 🔥 AMBIL PROFIL (Termasuk phone & avatar)
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        employeeId: true,
        username: true,
        email: true,
        fullName: true,
        divisi: true,
        phone: true,  // 🔥 Ditarik dari DB
        avatar: true, // 🔥 Ditarik dari DB
        role: true, 
      },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan di database');
    }

    return user;
  }

  // 🔥 UPDATE PROFIL (Menyimpan phone & avatar)
  async updateProfile(userId: string, data: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        employeeId: data.employeeId,
        email: data.email,
        divisi: data.divisi,
        phone: data.phone,   // 🔥 Disimpan ke DB
        avatar: data.avatar, // 🔥 Disimpan ke DB
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        divisi: true,
        phone: true,
        avatar: true,
        role: true,
      }
    });
  }
}