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
import {
  type CreateUserDto,
  createUserSchema,
} from 'src/users/dto/create-user.dto';
import { ResponseMessageType } from 'src/common/interfaces/http-response.interface';
import { type Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @Public()
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(@Body() loginDto: LoginDto) {
    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data: await this.authService.login(loginDto),
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
}
