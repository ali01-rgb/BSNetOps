import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // 🔥 FUNGSI BARU: KIRIM EMAIL VERIFIKASI AKUN
  async sendVerificationEmail(toEmail: string, verifyToken: string, fullName: string) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    // Link mengarah ke frontend halaman register dengan parameter token
    const verifyUrl = `${baseUrl}/register?verifyToken=${verifyToken}`;

    try {
      await this.transporter.sendMail({
        from: `"IT Support BSNetOps" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Verifikasi Akun Baru - BSNetOps',
        text: `Halo ${fullName},\n\nTerima kasih telah mendaftar di BSNetOps. Silakan klik link berikut untuk verifikasi email Anda:\n\n${verifyUrl}\n\nTautan ini hanya berlaku selama 5 menit.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f6f5;">
            <div style="background: white; padding: 30px; border-radius: 12px; text-align: center; border: 1px solid #e1e7e4;">
              <h2 style="color: #00634b; margin-bottom: 10px;">Verifikasi Email Anda</h2>
              <p style="color: #475569; font-size: 15px;">Halo <b>${fullName}</b>,</p>
              <p style="color: #475569; font-size: 14px; margin-bottom: 25px;">Satu langkah lagi! Klik tombol di bawah ini untuk mengaktifkan akun BSNetOps Anda. Tautan ini akan <b>kedaluwarsa dalam 5 menit</b>.</p>
              <a href="${verifyUrl}" style="background-color: #00634b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verifikasi Akun Saya</a>
            </div>
          </div>
        `,
      });
      return { success: true };
    } catch (error) {
      console.error('🔥 Gagal mengirim email verifikasi. Detail error:', error);
      throw new InternalServerErrorException('Gagal mengirim email verifikasi.');
    }
  }

  // Fungsi Reset Password tetap sama
  async sendResetPasswordEmail(toEmail: string, resetToken: string, fullName: string) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${baseUrl}/login?token=${resetToken}&email=${encodeURIComponent(toEmail)}`;

    try {
      await this.transporter.sendMail({
        from: `"IT Support BSNetOps" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Permintaan Reset Password - BSNetOps',
        text: `Halo ${fullName},\n\nKlik link berikut untuk mereset kata sandi Anda:\n\n${resetUrl}\n\nBerlaku selama 15 menit.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f6f5;">
            <div style="background: white; padding: 30px; border-radius: 12px; text-align: center; border: 1px solid #e1e7e4;">
              <h2 style="color: #00634b; margin-bottom: 10px;">Reset Password</h2>
              <p style="color: #475569; font-size: 15px;">Halo <b>${fullName}</b>,</p>
              <p style="color: #475569; font-size: 14px; margin-bottom: 25px;">Klik tombol di bawah ini untuk membuat password baru. Tautan ini akan kedaluwarsa dalam 15 menit.</p>
              <a href="${resetUrl}" style="background-color: #00634b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password Saya</a>
            </div>
          </div>
        `,
      });
      return { success: true };
    } catch (error) {
      console.error('🔥 Gagal mengirim email reset password. Detail error:', error);
      throw new InternalServerErrorException('Gagal mengirim email reset password.');
    }
  }
}