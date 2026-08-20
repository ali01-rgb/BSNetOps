import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly apiKey = process.env.BREVO_API_KEY;
  private readonly senderEmail = process.env.EMAIL_USER || 'inventory.bsn@gmail.com';
  private readonly senderName = 'IT Support BSNetOps';

  // Helper internal pengiriman email via HTTP API Brevo
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

  // 🔥 FUNGSI: KIRIM EMAIL VERIFIKASI DENGAN ARAHAN KODE REGISTRASI
  async sendVerificationEmail(toEmail: string, verifyToken: string, fullName: string) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyUrl = `${baseUrl}/register?verifyToken=${verifyToken}`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 25px; background-color: #f4f6f5;">
        <div style="background: white; padding: 35px; border-radius: 12px; text-align: center; border: 1px solid #e1e7e4; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="display: inline-block; background: #e6f4ea; padding: 12px 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #00634b; margin: 0; font-size: 22px;">Verifikasi & Aktivasi Akun</h2>
          </div>
          <p style="color: #334155; font-size: 16px; margin: 0 0 10px 0;">Halo <b>${fullName}</b>,</p>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 25px;">
            Terima kasih telah mendaftar di sistem <b>BSNetOps</b>.<br/>
            Klik tombol di bawah ini untuk menuju halaman validasi dan masukkan <b>Kode Registrasi</b> yang telah diberikan oleh admin kantor.
          </p>
          <a href="${verifyUrl}" style="background-color: #00634b; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 2px 4px rgba(0,99,75,0.2);">Aktivasi Akun Saya</a>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; margin-bottom: 0;">
            ⚠️ Tautan aktivasi ini hanya berlaku selama <b>5 menit</b> demi keamanan data Anda.
          </p>
        </div>
      </div>
    `;

    const text = `Halo ${fullName},\n\nTerima kasih telah mendaftar di BSNetOps. Silakan klik tautan berikut untuk validasi kode registrasi Anda:\n\n${verifyUrl}\n\nTautan ini berlaku selama 5 menit.`;

    return this.sendViaBrevoApi(toEmail, 'Verifikasi & Aktivasi Akun - BSNetOps', html, text);
  }

  // FUNGSI RESET PASSWORD
  async sendResetPasswordEmail(toEmail: string, resetToken: string, fullName: string) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${baseUrl}/login?token=${resetToken}&email=${encodeURIComponent(toEmail)}`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 25px; background-color: #f4f6f5;">
        <div style="background: white; padding: 35px; border-radius: 12px; text-align: center; border: 1px solid #e1e7e4; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="display: inline-block; background: #e6f4ea; padding: 12px 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #00634b; margin: 0; font-size: 22px;">Reset Password</h2>
          </div>
          <p style="color: #334155; font-size: 16px; margin: 0 0 10px 0;">Halo <b>${fullName}</b>,</p>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 25px;">
            Kami menerima permintaan untuk menyetel ulang kata sandi Anda. Klik tombol di bawah ini untuk membuat kata sandi baru.
          </p>
          <a href="${resetUrl}" style="background-color: #00634b; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 2px 4px rgba(0,99,75,0.2);">Reset Password Saya</a>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; margin-bottom: 0;">
            ⚠️ Tautan ini akan kedaluwarsa secara otomatis dalam waktu <b>15 menit</b>.
          </p>
        </div>
      </div>
    `;

    const text = `Halo ${fullName},\n\nKlik link berikut untuk mereset kata sandi Anda:\n\n${resetUrl}\n\nBerlaku selama 15 menit.`;

    return this.sendViaBrevoApi(toEmail, 'Permintaan Reset Password - BSNetOps', html, text);
  }
}