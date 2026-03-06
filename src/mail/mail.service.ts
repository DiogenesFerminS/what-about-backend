import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { Envs } from 'src/common/schemas/envs.schema';
import * as nodemailer from 'nodemailer';
import { ResponseMessageType } from 'src/common/interfaces/http-response.interface';
import { confirmAccountEmail } from './templates/confirmAccountEmail';
import { resetPasswordEmail } from './templates/resetPasswordEmail';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService<Envs>) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.getOrThrow('SMTP_HOST'),
      port: this.configService.getOrThrow('SMTP_PORT'),
      secure: this.configService.getOrThrow('SMTP_SECURE'),
      auth: {
        user: this.configService.getOrThrow('SMTP_USER'),
        pass: this.configService.getOrThrow('SMTP_PASS'),
      },
    });
  }

  async sendUserConfirmation(user: User, token: string) {
    const url = `${this.configService.get('FRONTEND_URL')}/auth/confirm?token=${token}`;

    const htmlContent = confirmAccountEmail(url);

    const mailOptions: nodemailer.SendMailOptions = {
      from: 'What-About <No Reply>',
      to: user.email,
      subject: 'Verify Your Account',
      html: htmlContent,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch {
      throw new BadRequestException({
        ok: false,
        message: ResponseMessageType.BAD_REQUEST,
        error: 'Failed to send email',
      });
    }
  }

  async sendResetPassword(user: User, token: string) {
    const url = `${this.configService.get('FRONTEND_URL')}/auth/reset-password?token=${token}`;

    const htmlContent = resetPasswordEmail(user.username, url);

    const mailOptions: nodemailer.SendMailOptions = {
      from: 'What-About <No Reply>',
      to: user.email,
      subject: 'Reset your Password',
      html: htmlContent,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch {
      throw new BadRequestException({
        ok: false,
        message: ResponseMessageType.BAD_REQUEST,
        error: 'Failed to send email',
      });
    }
  }
}
