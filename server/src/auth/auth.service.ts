import { 
  Injectable, HttpException, HttpStatus, NotFoundException, 
  Inject, forwardRef
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt'; 
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => PrismaService))
    private prisma: PrismaService,
    @Inject(forwardRef(() => JwtService))
    private jwtService: JwtService,
  ) {}

  // 🔥 LOGIN BEBAS PAKAI (NAMA / ID PEGAWAI / EMAIL)
  async login(identifier: string, pass: string) {
    const cleanId = (identifier || '').trim();
    
    const user = await this.prisma.user.findFirst({ 
      where: { 
        OR: [
          { email: { equals: cleanId, mode: 'insensitive' } },
          { employeeId: { equals: cleanId, mode: 'insensitive' } },
          { fullName: { equals: cleanId, mode: 'insensitive' } }
        ]
      } 
    });

    if (!user) throw new HttpException('Nama Karyawan, ID Pegawai, atau Email tidak terdaftar di sistem', HttpStatus.UNAUTHORIZED);
    if (!user.isVerified) throw new HttpException('Akses ditolak. Akun belum diverifikasi.', HttpStatus.FORBIDDEN);
    if (user.is_suspended) throw new HttpException('Akses Ditolak! Akun Anda ditangguhkan.', HttpStatus.FORBIDDEN);
    if (user.deleted_at) throw new HttpException('Akses Ditolak! Akun ini telah dihapus oleh Admin.', HttpStatus.FORBIDDEN);
    if (!user.password) throw new HttpException('Password tidak valid.', HttpStatus.UNAUTHORIZED);

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new HttpException('Password yang Anda masukkan salah', HttpStatus.UNAUTHORIZED);

    const userRole = user.role || 'USER';
    const payload = { sub: user.id, email: user.email, role: userRole };
    
    return {
      access_token: await this.jwtService.signAsync(payload),
      isFirstLogin: user.isFirstLogin,
      role: userRole, 
      user: {
        id: user.id, 
        email: user.email, 
        employeeId: user.employeeId,
        role: userRole, 
        fullName: user.fullName,
        namaLengkap: user.fullName, 
        cabang: user.cabang,
        unit: user.unit || user.divisi,
      },
    };
  }

  // 🔥 FUNGSI GANTI PASSWORD PERTAMA KALI
  async changeFirstPassword(userId: string, newPass: string) {
    const hashedPassword = await bcrypt.hash(newPass, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword, isFirstLogin: false },
    });
    return { message: 'Password berhasil diperbarui! Silakan lanjut ke Dashboard.' };
  }

  // 🔥 GET PROFILE (DITAMBAHKAN unit: true)
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, 
        employeeId: true, 
        email: true, 
        fullName: true,
        divisi: true, 
        unit: true, // 👈 Ditambahkan agar unit terambil
        cabang: true, 
        phone: true, 
        avatar: true, 
        role: true, 
        isFirstLogin: true, 
        is_suspended: true, 
        deleted_at: true, 
      },
    });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    if (user.is_suspended) throw new HttpException('Akun ditangguhkan.', HttpStatus.FORBIDDEN);
    return user;
  }

  // 🔥 UPDATE PROFILE (DITAMBAHKAN penanganan data.unit)
  async updateProfile(userId: string, data: any) {
    const resolvedUnit = data.unit || data.divisi || undefined;

    let payloadUpdate: any = {
      fullName: data.fullName,
      phone: data.phone,
      avatar: data.avatar,
    };

    if (data.email) {
      payloadUpdate.email = data.email.trim().toLowerCase();
    }
    if (data.cabang !== undefined) payloadUpdate.cabang = data.cabang;
    if (resolvedUnit !== undefined) {
      payloadUpdate.unit = resolvedUnit;
      payloadUpdate.divisi = resolvedUnit; // Disinkronkan dengan divisi
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: payloadUpdate,
      select: { 
        id: true, 
        fullName: true, 
        email: true, 
        divisi: true, 
        unit: true, // 👈 Ditambahkan di return response
        cabang: true, 
        phone: true, 
        avatar: true, 
        role: true 
      },
    });
  }
}