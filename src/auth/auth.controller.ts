import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from 'src/common/pipes/zodValidation.pipe';
import { type LoginDto, loginSchema } from './dto/login.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { type CreateUserDto, createUserSchema } from 'src/users/dto';
import { ResponseMessageType } from 'src/common/interfaces/http-response.interface';
import { type Response } from 'express';
import { type ResendEmailDto, resendEmailSchema } from './dto/resend-email.dto';
import { type NewPasswordDto, newPasswordSchema } from './dto/new-password.dto';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @Public()
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() loginDto: LoginDto,
  ) {
    const token = await this.authService.login(loginDto);

    res.cookie('auth-token', token, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60,
      path: '/',
    });

    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
    };
  }

  @Get('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.cookie('auth-token', null, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
    };
  }

  @Post('create-account')
  @UsePipes(new ZodValidationPipe(createUserSchema))
  @Public()
  async createUser(
    @Res({ passthrough: true }) response: Response,
    @Body() createUserDto: CreateUserDto,
  ) {
    response.status(201);
    const resp = await this.authService.createUser(createUserDto);
    return {
      ok: true,
      message: ResponseMessageType.CREATED,
      data: resp,
    };
  }

  @Get('verify-account/:token')
  @Public()
  async verifyAccount(@Param('token') token: string) {
    const userVerified = await this.authService.validateToken(token);
    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data: userVerified,
    };
  }

  @Post('resend-validate-email')
  @Public()
  @UsePipes(new ZodValidationPipe(resendEmailSchema))
  async resendValidateEmail(@Body() resendEmailDto: ResendEmailDto) {
    const resp = await this.authService.resendValidateEmail(resendEmailDto);
    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data: resp,
    };
  }

  @Post('reset-password')
  @Public()
  @UsePipes(new ZodValidationPipe(resendEmailSchema))
  async resetPassword(@Body() resendEmailDto: ResendEmailDto) {
    const resp = await this.authService.sendResetPasswordEmail(resendEmailDto);
    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data: resp,
    };
  }

  @Post('reset-password/:token')
  @Public()
  async updatePassword(
    @Param('token') token: string,
    @Body(new ZodValidationPipe(newPasswordSchema))
    newPasswordDto: NewPasswordDto,
  ) {
    const resp = await this.authService.updatePassword(token, newPasswordDto);
    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data: resp,
    };
  }
}
