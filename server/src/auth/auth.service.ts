import { 
  Injectable, HttpException, HttpStatus, NotFoundException, 
  BadRequestException, ConflictException, Inject, forwardRef
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt'; 
import * as bcrypt from 'bcrypt';
import { MailService } from './mail.service';
import * as ExcelJS from 'exceljs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => PrismaService))
    private prisma: PrismaService,
    @Inject(forwardRef(() => JwtService))
    private jwtService: JwtService,
    @Inject(forwardRef(() => MailService))
    private mailService: MailService,
  ) {}

  // 🔥 HELPER GENERATE KODE ALFANUMERIK ANTI-AMBIGU (6 KARAKTER KAPITAL)
  private generateSecureCode(): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Tanpa 0, O, 1, I agar tidak membingungkan
    let result = '';
    const randomBytes = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) {
      result += chars[randomBytes[i] % chars.length];
    }
    return result;
  }

  // 🔥 FITUR ADMIN: GENERATE BANYAK KODE KE DB & EKSPOR FILE EXCEL BER-HIGHLIGHT HIJAU
  async generateRegistrationCodes(count: number): Promise<{ buffer: Buffer; filename: string }> {
    if (count < 1 || count > 1000) {
      throw new BadRequestException('Jumlah kode yang di-generate harus antara 1 sampai 1000.');
    }

    const generatedCodes: string[] = [];
    const dbPayload: { code: string }[] = [];

    while (dbPayload.length < count) {
      const code = this.generateSecureCode();
      if (!generatedCodes.includes(code)) {
        generatedCodes.push(code);
        dbPayload.push({ code });
      }
    }

    // Simpan kode baru ke database
    await this.prisma.registrationCode.createMany({
      data: dbPayload,
      skipDuplicates: true,
    });

    // Buat file Excel dengan styling profesional
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Kode Registrasi BSNetOps');

    // Definisi Kolom
    worksheet.columns = [
      { header: 'NO', key: 'no', width: 8 },
      { header: 'NAMA / KARYAWAN', key: 'name', width: 35 },
      { header: 'KODE VALIDASI REGISTRASI', key: 'code', width: 30 },
      { header: 'STATUS KLAIM', key: 'status', width: 20 },
    ];

    // Styling Header (Highlight Hijau Khas BSNetOps)
    const headerRow = worksheet.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF00634B' }, // Hijau Elegan BSNetOps
      };
      cell.font = {
        name: 'Segoe UI',
        bold: true,
        color: { argb: 'FFFFFFFF' },
        size: 11,
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'medium', color: { argb: 'FF004332' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      };
    });

    // Isi Baris Data
    generatedCodes.forEach((code, index) => {
      const row = worksheet.addRow({
        no: index + 1,
        name: '', // Dikosongkan agar admin bisa mengisi manual sebelum dibagikan ke grup kantor
        code: code,
        status: 'BELUM DIGUNAKAN',
      });

      row.height = 22;
      row.eachCell((cell, colNumber) => {
        cell.font = { name: 'Segoe UI', size: 10 };
        cell.alignment = {
          vertical: 'middle',
          horizontal: colNumber === 2 ? 'left' : 'center',
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        };
        if (colNumber === 3) {
          cell.font = { name: 'Consolas', bold: true, size: 11, color: { argb: 'FF00634B' } };
        }
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `Kode_Registrasi_BSNetOps_${Date.now()}.xlsx`;

    return {
      buffer: Buffer.from(buffer),
      filename,
    };
  }

  // 🔥 REGISTRASI: MEMBUAT AKUN SEMENTARA & MENGIRIM LINK VERIFIKASI KE EMAIL
  async register(data: any) {
    const { fullName, email, password, unit } = data; 
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail) {
      throw new BadRequestException('Email wajib diisi.');
    }

    let user = await this.prisma.user.findUnique({ where: { email: cleanEmail } });

    if (user && user.isVerified) {
      throw new ConflictException('Email sudah terdaftar dan aktif!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (!user) {
      const existingUsers = await this.prisma.user.findMany({
        where: { employeeId: { startsWith: 'BSN-USR-' } },
        select: { employeeId: true },
      });

      let maxNumber = 0;
      existingUsers.forEach((u) => {
        if (u.employeeId) {
          const num = parseInt(u.employeeId.split('-')[2], 10);
          if (!isNaN(num) && num > maxNumber) maxNumber = num;
        }
      });
      const autoGeneratedId = `BSN-USR-${String(maxNumber + 1).padStart(3, '0')}`;

      user = await this.prisma.user.create({
        data: {
          employeeId: autoGeneratedId,
          fullName: fullName,
          email: cleanEmail,
          password: hashedPassword,
          divisi: unit || 'KC Semarang',
          role: 'USER',
          isVerified: false, 
        },
      });
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword, fullName: fullName, divisi: unit },
      });
    }

    const verifyToken = this.jwtService.sign(
      { sub: user.id, email: user.email }, 
      { secret: process.env.JWT_SECRET || 'rahasia-reset', expiresIn: '5m' }
    );

    await this.mailService.sendVerificationEmail(user.email, verifyToken, user.fullName || 'User');

    return { 
      message: 'Registrasi berhasil, silakan periksa kotak masuk email Anda.', 
      employeeId: user.employeeId 
    };
  }

  // 🔥 VALIDASI TOKEN EMAIL & KODE SEKALI PAKAI SECARA TRANSAKSIONAL
  async verifyEmail(token: string, registrationCode: string) {
    if (!token || !registrationCode) {
      throw new BadRequestException('Token verifikasi dan Kode Registrasi wajib diisi.');
    }

    const cleanCode = registrationCode.trim().toUpperCase();

    // 1. Validasi Kode di Database
    const validCode = await this.prisma.registrationCode.findUnique({
      where: { code: cleanCode },
    });

    if (!validCode) {
      throw new BadRequestException('Kode validasi registrasi tidak valid atau tidak terdaftar.');
    }

    if (validCode.isUsed) {
      throw new BadRequestException('Kode validasi ini sudah pernah digunakan.');
    }

    // 2. Validasi Token JWT dari Email
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'rahasia-reset',
      });

      const user = await this.prisma.user.findUnique({
        where: { email: decoded.email },
      });

      if (!user) {
        throw new NotFoundException('Data user tidak ditemukan.');
      }

      // 3. Update User dan Kunci Kode Registrasi
      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: user.id },
          data: { isVerified: true, hasSignedUp: true },
        }),
        this.prisma.registrationCode.update({
          where: { id: validCode.id },
          data: {
            isUsed: true,
            usedByEmail: user.email,
            usedAt: new Date(),
            userId: user.id,
          },
        }),
      ]);

      return { success: true, message: 'Akun Anda berhasil diverifikasi dan aktif!' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException('Sesi verifikasi telah kedaluwarsa atau token tidak valid.');
    }
  }

  async resendVerification(email: string) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email: cleanEmail } });

    if (!user) throw new NotFoundException('Alamat email tidak terdaftar.');
    if (user.isVerified) throw new BadRequestException('Akun ini sudah diverifikasi sebelumnya. Silakan login.');

    const verifyToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { secret: process.env.JWT_SECRET || 'rahasia-reset', expiresIn: '5m' }
    );

    await this.mailService.sendVerificationEmail(user.email, verifyToken, user.fullName || 'User');
    return { message: 'Link verifikasi baru berhasil dikirim ke email Anda.' };
  }

  async resendVerificationByExpiredToken(expiredToken: string) {
    if (!expiredToken) throw new BadRequestException('Token tidak ditemukan.');

    const decoded: any = this.jwtService.decode(expiredToken);
    if (!decoded || !decoded.email) throw new BadRequestException('Format token tidak valid.');

    const cleanEmail = decoded.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email: cleanEmail } });

    if (!user) throw new NotFoundException('User tidak ditemukan.');
    if (user.isVerified) throw new BadRequestException('Akun ini sudah aktif. Silakan login.');

    const newToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { secret: process.env.JWT_SECRET || 'rahasia-reset', expiresIn: '5m' }
    );

    await this.mailService.sendVerificationEmail(user.email, newToken, user.fullName || 'User');
    return { message: 'Link verifikasi baru berhasil dikirim ke email Anda.' };
  }

  async login(email: string, pass: string) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email: cleanEmail } });

    if (!user) throw new HttpException('Email tidak terdaftar', HttpStatus.UNAUTHORIZED);
    if (!user.isVerified) throw new HttpException('Email belum diverifikasi. Cek kotak masuk Anda!', HttpStatus.FORBIDDEN);
    if (user.is_suspended) throw new HttpException('Akses Ditolak! Akun Anda ditangguhkan.', HttpStatus.FORBIDDEN);
    if (user.deleted_at) throw new HttpException('Akses Ditolak! Akun ini telah dihapus.', HttpStatus.FORBIDDEN);
    if (!user.password) throw new HttpException('Password tidak valid.', HttpStatus.UNAUTHORIZED);

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new HttpException('Password salah', HttpStatus.UNAUTHORIZED);

    const userRole = user.role || 'USER';
    const payload = { sub: user.id, email: user.email, role: userRole };
    
    return {
      access_token: await this.jwtService.signAsync(payload),
      role: userRole, 
      user: {
        id: user.id, email: user.email, employeeId: user.employeeId,
        role: userRole, namaLengkap: user.fullName, 
      },
    };
  }

  async forgotPassword(email: string) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = await this.prisma.user.findFirst({ where: { email: cleanEmail } });
    if (!user) throw new NotFoundException('Alamat email tidak terdaftar di sistem.');

    const resetToken = this.jwtService.sign({ sub: user.id, email: user.email }, { 
      secret: process.env.JWT_SECRET || 'rahasia-reset', expiresIn: '15m' 
    });

    await this.mailService.sendResetPasswordEmail(user.email, resetToken, user.fullName || 'User');
    return { message: 'Link reset password berhasil dikirim ke email.' };
  }

  async resetPassword(email: string, newPass: string, token: string) {
    if (!token) throw new BadRequestException('Token reset password tidak ditemukan.');
    const cleanEmail = (email || '').trim().toLowerCase();

    try {
      const decoded = this.jwtService.verify(token, { secret: process.env.JWT_SECRET || 'rahasia-reset' });
      if (decoded.email !== cleanEmail) throw new BadRequestException('Token tidak cocok.');

      const hashedPassword = await bcrypt.hash(newPass, 10);
      await this.prisma.user.update({
        where: { id: decoded.sub }, data: { password: hashedPassword },
      });
      return { message: 'Password berhasil diperbarui!' };
    } catch (error) {
      throw new BadRequestException('Link reset password tidak valid atau sudah kadaluarsa.');
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, employeeId: true, email: true, fullName: true,
        divisi: true, phone: true, avatar: true, role: true, is_suspended: true, deleted_at: true, 
      },
    });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    if (user.is_suspended) throw new HttpException('Akun ditangguhkan.', HttpStatus.FORBIDDEN);
    return user;
  }

  async updateProfile(userId: string, data: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName, employeeId: data.employeeId, email: data.email,
        divisi: data.divisi, phone: data.phone, avatar: data.avatar,
      },
      select: { id: true, fullName: true, email: true, divisi: true, phone: true, avatar: true, role: true },
    });
  }
}