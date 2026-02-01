import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { In, Repository } from 'typeorm';
import { ResponseMessageType } from 'src/common/interfaces/http-response.interface';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag) private readonly TagsRepository: Repository<Tag>,
  ) {}

  async getExistingTags(posibleTags: string[]) {
    return this.TagsRepository.find({
      where: { name: In(posibleTags) },
    });
  }

  createMany(tagNames: string[]) {
    if (tagNames.length > 0) {
      return this.TagsRepository.create(
        tagNames.map((name) => ({ name: name })),
      );
    }
    return [];
  }

  async saveMany(tags: Tag[]) {
    if (tags.length === 0) {
      throw new BadRequestException({
        ok: false,
        error: 'Tags empty',
        message: ResponseMessageType.BAD_REQUEST,
      });
    }

    return await this.TagsRepository.save(tags);
  }

  async incrementTags(tagsId: string[]) {
    if (tagsId.length === 0) {
      throw new BadRequestException({
        ok: false,
        error: 'Tags empty',
        message: ResponseMessageType.BAD_REQUEST,
      });
    }

    return await this.TagsRepository.increment({ id: In(tagsId) }, 'count', 1);
  }
}
