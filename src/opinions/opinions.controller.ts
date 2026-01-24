import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
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
import { type Response, type Express } from 'express';
import {
  type PaginationDto,
  paginationSchema,
} from 'src/common/dto/pagination.dto';
import { type GetUserInterface } from 'src/common/interfaces/get-user.interface';
import {
  type updatedOpinionDto,
  updatedOpinionSchema,
} from './dto/update-opinion.dto';
import { type SearchDto, searchSchema } from 'src/common/dto';

@Controller('opinions')
export class OpinionsController {
  constructor(private readonly opinionsService: OpinionsService) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('file'))
  async createOpinion(
    @Res({ passthrough: true }) response: Response,
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

    response.statusCode = 201;

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
      message: ResponseMessageType.SUCCESS,
      data,
    };
  }

  @Get('search')
  async getOpinionsByTerm(
    @GetUser() payload: GetUserInterface,
    @Query(new ZodValidationPipe(searchSchema)) query: SearchDto,
  ) {
    const data = await this.opinionsService.getOpinionsByTerm(
      payload.id,
      query.term,
      { limit: query.limit, page: query.page },
    );

    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data,
    };
  }

  @Get('follow-opinions')
  async getFollowOpinions(
    @GetUser() payload: GetUserInterface,
    @Query(new ZodValidationPipe(paginationSchema))
    paginationDto: PaginationDto,
  ) {
    const resp = await this.opinionsService.getFollowingOpininions(
      payload.id,
      paginationDto,
    );

    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data: resp,
    };
  }

  @Get(':id')
  async getOneById(@Param('id', ParseUUIDPipe) id: string) {
    const opinion = await this.opinionsService.findOneById(id);

    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data: opinion,
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
      message: ResponseMessageType.SUCCESS,
      data,
    };
  }

  @Delete(':id')
  async deleteOpinions(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() payload: GetUserInterface,
  ) {
    const resp = await this.opinionsService.deleteOpinion(id, payload.id);

    return {
      ok: true,
      message: ResponseMessageType.DELETED,
      data: resp,
    };
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  async updateOpinion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updatedOpinionSchema))
    updatedOpinionDto: updatedOpinionDto,
    @GetUser() payload: GetUserInterface,
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
    const resp = await this.opinionsService.updateOpinion({
      id,
      file,
      updatedOpinionDto,
      userId: payload.id,
    });

    return {
      ok: true,
      message: ResponseMessageType.UPDATED,
      data: resp,
    };
  }
}
