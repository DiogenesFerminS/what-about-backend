import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Post,
  Query,
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
  async getAllOpinions(
    @Query(new ZodValidationPipe(paginationSchema))
    paginationDto: PaginationDto,
    @GetUser() payload: GetUserInterface,
  ) {
    const data = await this.opinionsService.getAllOpinions(
      paginationDto,
      payload.id,
    );

    return {
      ok: true,
      MessageChannel: ResponseMessageType.SUCCESS,
      data,
    };
  }

  @Get('user/:id')
  async getAllOpinionsByUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Query(new ZodValidationPipe(paginationSchema))
    paginationDto: PaginationDto,
    @GetUser() payload: GetUserInterface,
  ) {
    const data = await this.opinionsService.getAllByUserId({
      limit: paginationDto.limit,
      page: paginationDto.page,
      userId: id,
      viewerId: payload.id,
    });

    return {
      ok: true,
      MessageChannel: ResponseMessageType.SUCCESS,
      data,
    };
  }
}
