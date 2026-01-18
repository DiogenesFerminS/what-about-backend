import {
  Controller,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Res,
  Get,
  Delete,
} from '@nestjs/common';
import { FollowsService } from './follows.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { type GetUserInterface } from 'src/common/interfaces/get-user.interface';
import { type Response } from 'express';
import { ResponseMessageType } from 'src/common/interfaces/http-response.interface';

@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post(':id')
  async create(
    @Res({ passthrough: true }) response: Response,
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() payload: GetUserInterface,
  ) {
    const data = await this.followsService.create(payload.id, id);

    response.statusCode = 201;

    return {
      ok: true,
      message: ResponseMessageType.CREATED,
      data: data,
    };
  }

  @Get('is-followed/:id')
  async isFollowed(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() payload: GetUserInterface,
  ) {
    const data = await this.followsService.isFollowed(payload.id, id);
    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data,
    };
  }

  @Delete(':id')
  async unfollow(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() payload: GetUserInterface,
  ) {
    const data = await this.followsService.unfollow(payload.id, id);
    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data,
    };
  }

  @Get('stats/:id')
  async getFollowStats(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.followsService.getFollowStats(id);
    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data,
    };
  }
}
