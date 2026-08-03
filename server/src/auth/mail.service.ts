import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendResetPasswordEmail(toEmail: string, resetToken: string, fullName: string) {
    // 🔥 Fallback diubah ke 127.0.0.1 agar lebih aman dari filter spam teks "localhost"
    const baseUrl = process.env.FRONTEND_URL || 'http://127.0.0.1:5173';
    const resetUrl = `${baseUrl}/login?token=${resetToken}&email=${encodeURIComponent(toEmail)}`;

    try {
      await this.transporter.sendMail({
        from: `"Sistem Logistik BSN" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: '🔒 Permintaan Reset Password - Inventaris Logistik BSN',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Password</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f4f6f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f4f6f5; padding: 40px 0;">
              <tr>
                <td align="center">
                  <!-- Container Utama -->
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e1e7e4;">
                    
                    <!-- Header Email -->
                    <tr>
                      <td style="background-color: #00634b; padding: 30px 40px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">
                          Inventaris Logistik BSN
                        </h1>
                        <p style="color: #a3d9cb; margin: 5px 0 0 0; font-size: 13px;">
                          Pusat Layanan & Manajemen Aset Perusahaan
                        </p>
                      </td>
                    </tr>

                    <!-- Isi Konten -->
                    <tr>
                      <td style="padding: 40px 40px 30px 40px;">
                        <h2 style="color: #1e293b; margin-top: 0; font-size: 18px; font-weight: 600;">
                          Halo, ${fullName}! 👋
                        </h2>
                        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                          Kami menerima permintaan untuk mereset kata sandi (<span style="color: #00634b; font-weight: 600;">password</span>) akun sistem logistik BSN Anda.
                        </p>
                        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">
                          Silakan klik tombol di bawah ini untuk membuat password baru Anda. Tautan ini aman dan hanya berlaku selama <strong style="color: #00634b;">15 menit</strong> ke depan.
                        </p>

                        <!-- Tombol CTA Utama -->
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td align="center" style="padding-bottom: 30px;">
                              <a href="${resetUrl}" target="_blank" style="background-color: #00634b; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 10px rgba(0, 99, 75, 0.2); transition: background-color 0.2s;">
                                Reset Password Saya
                              </a>
                            </td>
                          </tr>
                        </table>

                        <!-- Kotak Informasi Cadangan -->
                        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px 20px; margin-bottom: 25px;">
                          <p style="color: #64748b; font-size: 12px; margin: 0 0 8px 0; line-height: 1.4;">
                            Jika tombol di atas tidak merespons, klik kanan pada tombol <strong>"Reset Password Saya"</strong>, pilih <em>"Copy link address"</em>, lalu tempelkan (paste) ke peramban Anda.
                          </p>
                        </div>

                        <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">
                          ⚠️ Jika Anda merasa tidak pernah melakukan permintaan ini, abaikan saja email ini. Akun Anda akan tetap aman.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer Email -->
                    <tr>
                      <td style="background-color: #f8fafc; padding: 20px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="color: #94a3b8; font-size: 11px; margin: 0; line-height: 1.4;">
                          &copy; ${new Date().getFullYear()} Bank Syariah Nasional (BSN). Seluruh hak cipta dilindungi.
                        </p>
                        <p style="color: #cbd5e1; font-size: 10px; margin: 5px 0 0 0;">
                          Pesan otomatis dikirim oleh Sistem Inventory BSN. Jangan membalas email ini.
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      });

      return { success: true };
    } catch (error) {
      console.error('Gagal mengirim email via Nodemailer:', error);
      throw new InternalServerErrorException('Gagal mengirim email reset password.');
    }
  }
}