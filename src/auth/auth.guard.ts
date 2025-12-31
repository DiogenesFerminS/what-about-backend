import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';
import { GetUserInterface } from 'src/common/interfaces/get-user.interface';
import { ResponseMessageType } from 'src/common/interfaces/http-response.interface';
import { Envs } from 'src/common/schemas/envs.schema';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService<Envs>,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user: { id: string; username: string } }>();

    const response = context.switchToHttp().getResponse<Response>();

    const token = request.cookies['auth-token'] as string | undefined;

    if (!token) {
      throw new UnauthorizedException({
        ok: false,
        error: 'Authentication cookie not found',
        message: ResponseMessageType.UNAUTHORIZED,
      });
    }

    try {
      const payload: GetUserInterface = await this.jwtService.verifyAsync(
        token,
        {
          secret: this.configService.getOrThrow('JWT_SECRET'),
        },
      );

      request.user = { id: payload.id, username: payload.username };
    } catch (error: unknown) {
      //TODO: Cambiar el secure a un env
      response.clearCookie('auth-token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });

      throw new UnauthorizedException({
        ok: false,
        error:
          error instanceof Error
            ? (error.message ?? 'Invalid token')
            : 'Invalid token',
        message: ResponseMessageType.UNAUTHORIZED,
      });
    }
    return true;
  }
}
