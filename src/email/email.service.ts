import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false, // true pour 465, false pour 587 avec STARTTLS
      auth: {
        user: this.config.get<string>('BREVO_SMTP_USER'),
        pass: this.config.get<string>('BREVO_SMTP_KEY'),
      },
    });
  }

  async sendResetPasswordEmail(to: string, token: string, username?: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"SharedVault" <${this.config.get<string>('BREVO_SMTP_USER')}>`,
        to,
        subject: 'Réinitialisation de votre mot de passe - SharedVault',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333;">Bonjour${username ? ` ${username}` : ''},</h1>
            <p>Vous avez demandé une réinitialisation de mot de passe.</p>
            <div style="font-size: 32px; font-weight: bold; color: #0066ff; text-align: center; margin: 20px 0; padding: 15px; background: #f0f8ff; border-radius: 8px;">
              ${token}
            </div>
            <p>Ce code est valable <strong>1 heure</strong>.</p>
            <p><strong>Ne partagez jamais ce code</strong>, même avec l'équipe SharedVault.</p>
            <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email en toute sécurité.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #777; text-align: center;">
              © ${new Date().getFullYear()} SharedVault – Tous droits réservés
            </p>
          </div>
        `,
      });

      console.log(`Email reset envoyé à ${to} - Message ID: ${info.messageId}`);
    } catch (error) {
      console.error('Erreur envoi email reset via Brevo:', error);
      // On logge mais on ne throw pas → l'API continue (sécurité)
    }
  }
}