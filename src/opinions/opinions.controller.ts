import {
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { OpinionsService } from './opinions.service';
import { ZodValidationPipe } from 'src/common/pipes/zodValidation.pipe';
import {
  type CreateOpinionDto,
  createOpinionSchema,
} from './dto/create-opinion.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { type JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { ResponseMessageType } from 'src/common/interfaces/http-response.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { type Express } from 'express';

@Controller('opinions')
export class OpinionsController {
  constructor(private readonly opinionsService: OpinionsService) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('file'))
  async createOpinion(
    @GetUser() { sub }: JwtPayload,
    @Body(new ZodValidationPipe(createOpinionSchema))
    createOpinionDto: CreateOpinionDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    const newOpinion = await this.opinionsService.createOpinion(
      sub,
      createOpinionDto,
      file,
    );

    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data: newOpinion,
    };
  }
}
