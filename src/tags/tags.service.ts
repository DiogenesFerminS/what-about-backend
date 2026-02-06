import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { DataSource, In, Repository } from 'typeorm';
import { ResponseMessageType } from 'src/common/interfaces/http-response.interface';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag) private readonly TagsRepository: Repository<Tag>,
    private dataSource: DataSource,
  ) {}

  async getCountByName(name: string) {
    const count = await this.TagsRepository.count({
      where: { name: name },
    });

    return count;
  }

  async getExistingTags(posibleTags: string[]) {
    return this.TagsRepository.find({
      where: { name: In(posibleTags) },
    });
  }

  async getTrendingTags() {
    const tags = await this.TagsRepository.find({
      order: {
        count: 'DESC',
      },
      take: 10,
    });

    return tags;
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

  async decrementTags(tagsId: string[]) {
    if (tagsId.length === 0) {
      throw new BadRequestException({
        ok: false,
        error: 'Tags empty',
        message: ResponseMessageType.BAD_REQUEST,
      });
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const tags = await queryRunner.manager.find(Tag, {
        where: { id: In(tagsId) },
        lock: { mode: 'pessimistic_write' },
      });

      const tagsToSave: Tag[] = [];
      const tagsToRemove: Tag[] = [];

      for (const tag of tags) {
        tag.count -= 1;
        if (tag.count <= 0) {
          tagsToRemove.push(tag);
        } else {
          tagsToSave.push(tag);
        }
      }

      if (tagsToRemove.length > 0) {
        await queryRunner.manager.remove(tagsToRemove);
      }

      if (tagsToSave.length > 0) {
        await queryRunner.manager.save(tagsToSave);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      new BadRequestException({
        ok: false,
        error: error instanceof Error ? error.message : 'Unknow error',
        message: ResponseMessageType.BAD_REQUEST,
      });
    } finally {
      await queryRunner.release();
    }
  }
}
