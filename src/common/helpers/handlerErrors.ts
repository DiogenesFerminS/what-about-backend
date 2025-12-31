import { BadRequestException } from '@nestjs/common';
import { isDatabaseError } from './isDatabaseError';
import { ResponseMessageType } from '../interfaces/http-response.interface';

export const handleError = (error: unknown) => {
  if (isDatabaseError(error)) {
    if (error.code === '23505') {
      const match = error.detail?.match(/\((.*?)\)/);
      const field = match ? match[1] : 'unknown field';
      throw new BadRequestException({
        ok: false,
        error: `This ${field} is already in use`,
        message: ResponseMessageType.BAD_REQUEST,
      });
    }
    throw new BadRequestException({
      ok: false,
      error: error.detail,
      message: ResponseMessageType.BAD_REQUEST,
    });
  }

  throw new BadRequestException({
    ok: false,
    error: error instanceof Error ? error.message : 'Unknown error',
    message: ResponseMessageType.BAD_REQUEST,
  });
};
