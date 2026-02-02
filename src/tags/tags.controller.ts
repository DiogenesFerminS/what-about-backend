import { Controller, Get, Param } from '@nestjs/common';
import { TagsService } from './tags.service';
import { ResponseMessageType } from 'src/common/interfaces/http-response.interface';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get(':name')
  async getCountByName(@Param('name') name: string) {
    const count = await this.tagsService.getCountByName(name);

    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data: count,
    };
  }
}
