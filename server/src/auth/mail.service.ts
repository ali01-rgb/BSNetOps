import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly apiKey = process.env.BREVO_API_KEY;
  private readonly senderEmail = process.env.EMAIL_USER || 'inventory.bsn@gmail.com';
  private readonly senderName = 'IT Support BSNetOps';

  // Helper internal buat kirim email lewat Brevo HTTP API (bukan SMTP)
  // Dipakai karena Railway memblokir/timeout koneksi outbound ke port SMTP (587)
  private async sendViaBrevoApi(toEmail: string, subject: string, htmlContent: string, textContent: string) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'api-key': this.apiKey || '',
        },
        body: JSON.stringify({
          sender: { name: this.senderName, email: this.senderEmail },
          to: [{ email: toEmail }],
          subject: subject,
          htmlContent: htmlContent,
          textContent: textContent,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Brevo API merespons status ${response.status}: ${errorBody}`);
      }

      return { success: true };
    } catch (error) {
      console.error('🔥 Gagal mengirim email via Brevo API. Detail error:', error);
      throw new InternalServerErrorException('Gagal mengirim email.');
    }
  }

  // 🔥 FUNGSI: KIRIM EMAIL VERIFIKASI AKUN
  async sendVerificationEmail(toEmail: string, verifyToken: string, fullName: string) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyUrl = `${baseUrl}/register?verifyToken=${verifyToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f6f5;">
        <div style="background: white; padding: 30px; border-radius: 12px; text-align: center; border: 1px solid #e1e7e4;">
          <h2 style="color: #00634b; margin-bottom: 10px;">Verifikasi Email Anda</h2>
          <p style="color: #475569; font-size: 15px;">Halo <b>${fullName}</b>,</p>
          <p style="color: #475569; font-size: 14px; margin-bottom: 25px;">Satu langkah lagi! Klik tombol di bawah ini untuk mengaktifkan akun BSNetOps Anda. Tautan ini akan <b>kedaluwarsa dalam 5 menit</b>.</p>
          <a href="${verifyUrl}" style="background-color: #00634b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verifikasi Akun Saya</a>
        </div>
      </div>
    `;
    const text = `Halo ${fullName},\n\nTerima kasih telah mendaftar di BSNetOps. Silakan klik link berikut untuk verifikasi email Anda:\n\n${verifyUrl}\n\nTautan ini hanya berlaku selama 5 menit.`;

    return this.sendViaBrevoApi(toEmail, 'Verifikasi Akun Baru - BSNetOps', html, text);
  }

  // Fungsi Reset Password
  async sendResetPasswordEmail(toEmail: string, resetToken: string, fullName: string) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${baseUrl}/login?token=${resetToken}&email=${encodeURIComponent(toEmail)}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f6f5;">
        <div style="background: white; padding: 30px; border-radius: 12px; text-align: center; border: 1px solid #e1e7e4;">
          <h2 style="color: #00634b; margin-bottom: 10px;">Reset Password</h2>
          <p style="color: #475569; font-size: 15px;">Halo <b>${fullName}</b>,</p>
          <p style="color: #475569; font-size: 14px; margin-bottom: 25px;">Klik tombol di bawah ini untuk membuat password baru. Tautan ini akan kedaluwarsa dalam 15 menit.</p>
          <a href="${resetUrl}" style="background-color: #00634b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password Saya</a>
        </div>
      </div>
    `;
    const text = `Halo ${fullName},\n\nKlik link berikut untuk mereset kata sandi Anda:\n\n${resetUrl}\n\nBerlaku selama 15 menit.`;

    return this.sendViaBrevoApi(toEmail, 'Permintaan Reset Password - BSNetOps', html, text);
  }
}