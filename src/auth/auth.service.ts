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
import { CreateUserDto } from 'src/users/dto';
import { MailService } from 'src/mail/mail.service';
import * as crypto from 'crypto';
import { type ResendEmailDto } from './dto/resend-email.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { ConfigService } from '@nestjs/config';
import { type Envs } from 'src/common/schemas/envs.schema';

@Injectable()
export class AuthService {
  private logger: Logger = new Logger('AUTH SERVICE');
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    private configService: ConfigService<Envs>,
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

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15min',
    });

    const refreshToken = await this.jwtService.signAsync(
      { id: user.id },
      {
        expiresIn: '7d',
        secret: this.configService.getOrThrow('JWT_SECRET_REFRESH'),
      },
    );

    const refreshTokenHash = await bcrypt.hash(
      refreshToken,
      this.configService.getOrThrow('ROUND_OF_SALT'),
    );

    await this.usersService.updateRefreshToken(refreshTokenHash, user.id);

    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(refreshToken: string) {
    try {
      const payload: { id: string } = await this.jwtService.verifyAsync(
        refreshToken,
        {
          secret: this.configService.getOrThrow('JWT_SECRET_REFRESH'),
        },
      );

      await this.usersService.clearRefreshToken(payload.id);
      return { succes: true };
    } catch {
      throw new BadRequestException({
        ok: false,
        message: ResponseMessageType.BAD_REQUEST,
        error: 'Logout failed',
      });
    }
  }

  async refresh(refreshToken: string) {
    try {
      const payload: { id: string } = await this.jwtService.verifyAsync(
        refreshToken,
        {
          secret: this.configService.getOrThrow('JWT_SECRET_REFRESH'),
        },
      );

      const user = await this.usersService.findOneById(payload.id);

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException({
          ok: false,
          message: ResponseMessageType.UNAUTHORIZED,
          error: 'Invalid token unauthorized',
        });
      }

      const isValidToken = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );

      if (!isValidToken) {
        throw new UnauthorizedException({
          ok: false,
          message: ResponseMessageType.UNAUTHORIZED,
          error: 'Invalid token unauthorized',
        });
      }

      const accessPayload = { id: user.id, username: user.username };
      const newAccessToken = await this.jwtService.signAsync(accessPayload, {
        expiresIn: '15Min',
      });

      const newRefreshToken = await this.jwtService.signAsync(
        { id: user.id },
        {
          expiresIn: '7d',
          secret: this.configService.getOrThrow('JWT_SECRET_REFRESH'),
        },
      );

      const refreshTokenHash = await bcrypt.hash(
        newRefreshToken,
        this.configService.getOrThrow('ROUND_OF_SALT'),
      );

      await this.usersService.updateRefreshToken(refreshTokenHash, user.id);

      return {
        refreshToken: newRefreshToken,
        accessToken: newAccessToken,
      };
    } catch {
      throw new BadRequestException({
        ok: false,
        message: ResponseMessageType.BAD_REQUEST,
        error: 'Invalid token',
      });
    }
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
