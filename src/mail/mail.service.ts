import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from 'src/users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { Envs } from 'src/common/schemas/envs.schema';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService<Envs>,
  ) {}

  async sendUserConfirmation(user: User, token: string) {
    const url = `${this.configService.get('FRONTEND_URL')}/auth/confirm?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      // from: '"Support Team" <support@example.com>', // Override si quieres
      subject: 'Welcome to What-About! Confirm your email',
      template: './welcome', // Nombre del archivo sin .hbs
      context: {
        name: user.name || user.username,
        url,
      },
    });
  }

  async sendResetPassword(user: User, token: string) {
    const url = `${this.configService.get('FRONTEND_URL')}/auth/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: `Reset Your Password ${user.username}`,
      template: './reset-password',
      context: {
        name: user.name || user.username,
        url,
      },
    });
  }
}
