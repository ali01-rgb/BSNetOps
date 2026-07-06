import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt'; // <--- Tambah ini
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService // <--- Inject JWT di sini
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

  // --- TAMBAHAN FUNGSI LOGIN ---
  async login(username: string, pass: string) {
    // 1. Cari user berdasarkan username
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) {
      throw new HttpException('User tidak ditemukan', HttpStatus.UNAUTHORIZED);
    }

    // 2. Bandingkan password yang di-input dengan yang di DB (yang sudah di-hash)
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new HttpException('Password salah', HttpStatus.UNAUTHORIZED);
    }

    // 3. Kalau cocok, bikin token JWT
    const payload = { sub: user.id, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}