import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodError } from 'zod';
import { ZodObject } from 'zod/v4';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodObject) {}

  transform(value: unknown): unknown {
    try {
      const parsedValue = this.schema.parse(value);

      return parsedValue;
    } catch (error: unknown) {
      throw new BadRequestException({
        ok: false,
        error:
          error instanceof ZodError ? error.issues[0].message : 'Unknown error',
        message: 'Bad Request',
      });
    }
  }
}
