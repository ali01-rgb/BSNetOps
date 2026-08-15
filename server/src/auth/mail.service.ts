import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    // 🔥 UBAH BAGIAN INI JADI SETTINGAN BREVO 🔥
    this.transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false, // false untuk port 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendResetPasswordEmail(toEmail: string, resetToken: string, fullName: string) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${baseUrl}/login?token=${resetToken}&email=${encodeURIComponent(toEmail)}`;

    try {
      await this.transporter.sendMail({
        from: `"IT Support BSNetOps" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Permintaan Reset Password - BSNetOps',
        
        // 🌟 PLAIN TEXT WAJIB ADA BIAR ANTI SPAM
        text: `Halo ${fullName},\n\nKami menerima permintaan reset password untuk akun BSNetOps Anda.\nSilakan salin tautan berikut ke browser Anda:\n\n${resetUrl}\n\nTautan ini berlaku selama 15 menit.\nJika Anda tidak memintanya, abaikan email ini.`,
        
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
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e1e7e4;">
                    <tr>
                      <td style="background-color: #00634b; padding: 30px 40px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">
                          Inventaris Logistik BSN
                        </h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 40px 40px 30px 40px;">
                        <h2 style="color: #1e293b; margin-top: 0; font-size: 18px; font-weight: 600;">
                          Halo, ${fullName}! 👋
                        </h2>
                        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                          Kami menerima permintaan untuk mereset kata sandi (<span style="color: #00634b; font-weight: 600;">password</span>) akun sistem logistik BSN Anda.
                        </p>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td align="center" style="padding-bottom: 30px;">
                              <a href="${resetUrl}" target="_blank" style="background-color: #00634b; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block;">
                                Reset Password Saya
                              </a>
                            </td>
                          </tr>
                        </table>
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
      console.error('Gagal mengirim email:', error);
      throw new InternalServerErrorException('Gagal mengirim email reset password.');
    }
  }
}