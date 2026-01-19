import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  Res,
  ParseUUIDPipe,
  Get,
  Query,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import {
  createCommentSchema,
  type CreateCommentDto,
} from './dto/create-comment.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { type GetUserInterface } from 'src/common/interfaces/get-user.interface';
import { type Response } from 'express';
import { ResponseMessageType } from 'src/common/interfaces/http-response.interface';
import {
  paginationSchema,
  type PaginationDto,
} from 'src/common/dto/pagination.dto';
import { ZodValidationPipe } from 'src/common/pipes/zodValidation.pipe';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('opinion/:opinionId')
  async getCommentsByOpinionId(
    @Param('opinionId', ParseUUIDPipe) opinionId: string,
    @Query(new ZodValidationPipe(paginationSchema))
    paginationDto: PaginationDto,
  ) {
    const data = await this.commentsService.getCommentsByOpinionId(
      opinionId,
      paginationDto,
    );

    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data,
    };
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(createCommentSchema))
    createCommentDto: CreateCommentDto,
    @GetUser() payload: GetUserInterface,
    @Res({ passthrough: true }) response: Response,
  ) {
    const data = await this.commentsService.create(
      payload.id,
      createCommentDto,
    );

    response.statusCode = 201;

    return {
      ok: true,
      message: ResponseMessageType.CREATED,
      data,
    };
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() payload: GetUserInterface,
  ) {
    const data = await this.commentsService.delete(id, payload.id);

    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data,
    };
  }
}
