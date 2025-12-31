import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { OpinionsService } from './opinions.service';
import { ZodValidationPipe } from 'src/common/pipes/zodValidation.pipe';
import {
  type CreateOpinionDto,
  createOpinionSchema,
} from './dto/create-opinion.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { ResponseMessageType } from 'src/common/interfaces/http-response.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { type Express } from 'express';
import {
  type PaginationDto,
  paginationSchema,
} from 'src/common/dto/pagination.dto';
import { type GetUserInterface } from 'src/common/interfaces/get-user.interface';

@Controller('opinions')
export class OpinionsController {
  constructor(private readonly opinionsService: OpinionsService) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('file'))
  async createOpinion(
    @GetUser() payload: GetUserInterface,
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
      payload.id,
      createOpinionDto,
      file,
    );

    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data: newOpinion,
    };
  }

  @Get()
  @UsePipes(new ZodValidationPipe(paginationSchema))
  async getAllOpinions(@Query() paginationDto: PaginationDto) {
    const data = await this.opinionsService.getAllOpinions(paginationDto);

    return {
      ok: true,
      MessageChannel: ResponseMessageType.SUCCESS,
      data,
    };
  }
}
