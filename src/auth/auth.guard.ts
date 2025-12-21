import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';
import { ResponseMessageType } from 'src/common/interfaces/http-response.interface';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
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

    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException({
        ok: false,
        error: 'No authorization header provided',
        message: ResponseMessageType.UNAUTHORIZED,
      });
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer') {
      throw new UnauthorizedException({
        ok: false,
        error: 'Invalid token type',
        message: ResponseMessageType.UNAUTHORIZED,
      });
    }

    if (!token) {
      throw new UnauthorizedException({
        ok: false,
        error: 'No token provided',
        message: ResponseMessageType.UNAUTHORIZED,
      });
    }

    try {
      const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow('JWT_SECRET'),
      });

      request.user = { id: payload.sub, username: payload.username };
    } catch (error: unknown) {
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
