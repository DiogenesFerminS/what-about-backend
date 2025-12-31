import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ResponseMessageType } from 'src/common/interfaces/http-response.interface';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { MailService } from 'src/mail/mail.service';
import * as crypto from 'crypto';
import { type ResendEmailDto } from './dto/resend-email.dto';
import { NewPasswordDto } from './dto/new-password.dto';

@Injectable()
export class AuthService {
  private logger: Logger = new Logger('AUTH SERVICE');
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async login({ term, password }: LoginDto) {
    const user = await this.usersService.findUserByTerm(term);
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException({
        ok: false,
        error: 'Invalid Credentials',
        message: ResponseMessageType.UNAUTHORIZED,
      });
    }

    if (!user.isVerified) {
      throw new UnauthorizedException({
        ok: false,
        error: 'Please verify your account to log in, check your email.',
        message: ResponseMessageType.UNAUTHORIZED,
      });
    }

    const payload = { id: user.id, username: user.username };

    return await this.jwtService.signAsync(payload);
  }

  async createUser(createUserDto: CreateUserDto) {
    const token = this.generateRandomToken();
    const newUser = await this.usersService.createUser(createUserDto, token);

    this.mailService.sendUserConfirmation(newUser, token).catch((error) => {
      this.logger.error('Error sending welcome email', error);
    });

    return `An email has been sent to ${newUser.email} to verify your account`;
  }

  async validateToken(token: string) {
    const userVerified = await this.usersService.verifyUser(token);
    return userVerified;
  }

  async resendValidateEmail({ email }: ResendEmailDto) {
    const user = await this.usersService.findUserByTerm(email);

    if (user.isVerified) {
      throw new BadRequestException({
        ok: false,
        message: ResponseMessageType.BAD_REQUEST,
        error: 'User already verified',
      });
    }

    const token = this.generateRandomToken();
    await this.usersService.updateToken(user.id, token, 'verifyToken');

    try {
      await this.mailService.sendUserConfirmation(user, token);
      return 'Verification link resent. Please check your inbox.';
    } catch {
      this.logger.error('Error to sending email');
      throw new InternalServerErrorException({
        ok: false,
        message: ResponseMessageType.INTERNAL_SERVER_ERROR,
        error: 'Error to sending email',
      });
    }
  }

  async sendResetPasswordEmail({ email }: ResendEmailDto) {
    const user = await this.usersService.findUserByTerm(email);

    if (!user.isVerified) {
      throw new BadRequestException({
        ok: false,
        message: ResponseMessageType.BAD_REQUEST,
        error: 'Verify your account to change your password',
      });
    }

    const token = this.generateRandomToken();
    await this.usersService.updateToken(user.id, token, 'resetPasswordToken');

    try {
      await this.mailService.sendResetPassword(user, token);
      return 'An email has been sent with instructions to reset your password.';
    } catch {
      this.logger.error('Error to sending email');
      throw new InternalServerErrorException({
        ok: false,
        message: ResponseMessageType.INTERNAL_SERVER_ERROR,
        error: 'Error to sending email',
      });
    }
  }

  async updatePassword(token: string, newPassworDto: NewPasswordDto) {
    return await this.usersService.updatePassword(
      token,
      newPassworDto.password,
    );
  }

  private generateRandomToken() {
    const token = crypto.randomBytes(32).toString('hex');
    return token;
  }
}
