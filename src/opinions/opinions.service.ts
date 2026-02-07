import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { handleError } from 'src/common/helpers/handlerErrors';
import { Opinion } from './entities/opinions.entity';
import { Repository } from 'typeorm';
import { CreateOpinionDto } from './dto/create-opinion.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ResponseMessageType } from 'src/common/interfaces/http-response.interface';
import { type PaginationDto } from 'src/common/dto/pagination.dto';
import { Like } from 'src/likes/entities/like.entity';
import { type RawOpinion } from './interfaces/raw-opinion';
import { UsersService } from 'src/users/users.service';
import { updateOpinionParams } from './interfaces/update-opinion';
import { getPublicId } from 'src/common/helpers/getPublicId-cloudinary';
import { FollowsService } from 'src/follows/follows.service';
import { RepostDto } from './dto/repost-opinion';
import { extractTags } from 'src/common/helpers/extractTags';
import { TagsService } from 'src/tags/tags.service';
import { Tag } from 'src/tags/entities/tag.entity';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/entities/notification.entity';

@Injectable()
export class OpinionsService {
  private handleError = handleError;
  constructor(
    @InjectRepository(Opinion) private opinionRepository: Repository<Opinion>,
    private cloudinaryService: CloudinaryService,
    private usersService: UsersService,
    private followsService: FollowsService,
    private tagsService: TagsService,
    private readonly notificationService: NotificationService,
  ) {}

  async createOpinion(
    userId: string,
    createOpinionDto: CreateOpinionDto,
    file?: Express.Multer.File,
  ) {
    let imageUrl: null | string = null;
    const { content, title } = createOpinionDto;

    if (file) {
      imageUrl = await this.uploadImg(file);
    }
    const opinion = this.opinionRepository.create({
      title,
      content,
      imageUrl: imageUrl,
      user: { id: userId },
    });

    const tagNames = extractTags(content);

    if (tagNames.length > 0) {
      const existingTags = await this.tagsService.getExistingTags(tagNames);
      const existingTagsName = existingTags.map((existTag) => existTag.name);

      const newTags = tagNames.filter((tag) => !existingTagsName.includes(tag));
      let newTagsEntities: Tag[] = [];

      if (newTags.length > 0) {
        newTagsEntities = this.tagsService.createMany(newTags);
        await this.tagsService.saveMany(newTagsEntities);
      }

      const allTags = [...existingTags, ...newTagsEntities];

      opinion.tags = allTags;

      const tagsId = allTags.map((t) => t.id);
      await this.tagsService.incrementTags(tagsId);
    }

    return this.opinionRepository.save(opinion);
  }

  async repostOpinion(
    opinionId: string,
    { content, title }: RepostDto,
    userId: string,
  ) {
    const originalOpinion = await this.findOneById(opinionId);
    const currentUser = await this.usersService.findOneById(userId);

    const itsRepost = !!originalOpinion.originalOpinion;

    const repost = this.opinionRepository.create({
      originalOpinion: itsRepost
        ? originalOpinion.originalOpinion
        : originalOpinion,
      content: content,
      title: title,
      user: currentUser,
    });

    const tagsNames = extractTags(content);

    if (tagsNames.length > 0) {
      const existingTags = await this.tagsService.getExistingTags(tagsNames);
      const existingTagsName = existingTags.map((tag) => tag.name);

      const newTags = tagsNames.filter(
        (tag) => !existingTagsName.includes(tag),
      );

      let newTagsEntities: Tag[] = [];
      if (newTags.length > 0) {
        newTagsEntities = this.tagsService.createMany(newTags);
        await this.tagsService.saveMany(newTagsEntities);
      }

      const allTags = [...existingTags, ...newTagsEntities];
      repost.tags = allTags;

      const allTagsIds = allTags.map((t) => t.id);
      await this.tagsService.incrementTags(allTagsIds);
    }

    try {
      const savedRepost = await this.opinionRepository.save(repost);
      await this.notificationService.create({
        creator: currentUser,
        owner: originalOpinion.user,
        opinion: originalOpinion,
        type: NotificationType.REPOST,
      });
      return savedRepost;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteRepost(opinionId: string, userId: string) {
    const originalOpinion = await this.findOneById(opinionId);
    const currentUser = await this.usersService.findOneById(userId);

    const existRepost = await this.opinionRepository.findOne({
      where: {
        originalOpinion: originalOpinion,
        user: currentUser,
      },
      relations: ['tags'],
    });

    if (!existRepost) {
      throw new NotFoundException({
        ok: false,
        message: ResponseMessageType.BAD_REQUEST,
        error: 'Opinion not found',
      });
    }

    if (existRepost.tags.length > 0) {
      const tagsIds = existRepost.tags.map((t) => t.id);
      await this.tagsService.decrementTags(tagsIds);
    }

    try {
      await this.opinionRepository.remove(existRepost);
      await this.notificationService.delete({
        creator: currentUser,
        owner: originalOpinion.user,
        type: NotificationType.REPOST,
        opinion: originalOpinion,
      });
      return {
        success: true,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async getRepostStats(opinionId: string, currentId: string) {
    const [total, myRepost] = await Promise.all([
      this.opinionRepository.count({
        relations: ['originalOpinion'],
        where: { originalOpinion: { id: opinionId } },
      }),

      this.opinionRepository.count({
        relations: ['originalOpinion'],
        where: {
          originalOpinion: { id: opinionId },
          user: { id: currentId },
        },
      }),
    ]);

    return {
      total,
      myRepost: myRepost > 0,
    };
  }

  async getAllOpinions({ limit, page }: PaginationDto, userId: string) {
    const skip = (page - 1) * limit;

    const result = await this.baseQuery(userId)
      .limit(limit)
      .offset(skip)
      .getRawAndEntities();

    const { entities, raw } = result;
    const rawData = raw as RawOpinion[];
    const opinions = this.handleParseEntity({ entities, rawData });
    return {
      meta: {
        page,
        limit,
      },
      data: opinions,
    };
  }

  async findOneById(id: string) {
    const opinion = await this.opinionRepository.findOne({
      where: { id },
      relations: ['user', 'originalOpinion', 'tags'],
    });

    if (!opinion) {
      throw new NotFoundException({
        ok: false,
        error: 'Opinion not found',
        message: ResponseMessageType.NOT_FOUND,
      });
    }

    return opinion;
  }

  async getAllByOneOpinion(id: string, currentId: string) {
    const result = await this.baseQuery(currentId)
      .andWhere('opinion.id = :id')
      .setParameter('id', id)
      .getRawAndEntities();

    const { entities, raw } = result;
    if (!entities || entities.length < 0) {
      throw new BadRequestException({
        ok: false,
        message: ResponseMessageType.BAD_REQUEST,
        error: 'Opinion not found',
      });
    }
    const rawData = raw as RawOpinion[];

    const opinions = this.handleParseEntity({ entities, rawData });

    return opinions[0];
  }

  async getAllByUserId({
    limit,
    page,
    userId,
    viewerId,
  }: {
    limit: number;
    page: number;
    userId: string;
    viewerId: string;
  }) {
    await this.usersService.findOneById(userId);

    const skip = (page - 1) * limit;

    const query = this.baseQuery(viewerId)
      .andWhere('user.id = :userId')
      .setParameter('userId', userId);

    const total = await query.clone().getCount();

    const result = await query.limit(limit).offset(skip).getRawAndEntities();

    const { entities, raw } = result;
    const rawData = raw as RawOpinion[];

    const opinions = this.handleParseEntity({ entities, rawData });

    return {
      meta: {
        total,
        page,
        limit,
      },
      data: opinions,
    };
  }

  async deleteOpinion(id: string, userId: string) {
    const opinion = await this.findOneById(id);

    if (opinion.user.id !== userId) {
      throw new UnauthorizedException({
        ok: false,
        error: 'You cannot delete opinions that are not your own',
        message: ResponseMessageType.UNAUTHORIZED,
      });
    }

    try {
      if (opinion.tags.length > 0) {
        const tagsIds = opinion.tags.map((tag) => tag.id);
        await this.tagsService.decrementTags(tagsIds);
      }

      await this.opinionRepository.remove(opinion);
      return { success: true };
    } catch (error) {
      console.log(error);
      throw new BadRequestException({
        ok: false,
        error: 'An error has occurred',
        message: ResponseMessageType.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async updateOpinion({
    id,
    file,
    updatedOpinionDto,
    userId,
  }: updateOpinionParams) {
    const opinion = await this.findOneById(id);

    if (opinion.user.id !== userId) {
      throw new UnauthorizedException({
        ok: false,
        error: 'You cannot delete opinions that are not your own',
        message: ResponseMessageType.UNAUTHORIZED,
      });
    }

    const imageUrl = await this.manageImage(
      file,
      opinion.imageUrl,
      updatedOpinionDto.deleteImage,
    );

    const updatedOpinion = this.opinionRepository.merge(opinion, {
      ...updatedOpinionDto,
      imageUrl,
      isEdited: true,
    });

    if (opinion.tags.length > 0) {
      const oldTagsId = opinion.tags.map((t) => t.id);
      await this.tagsService.decrementTags(oldTagsId);
    }

    if (updatedOpinionDto.content) {
      const tagsNames = extractTags(updatedOpinionDto.content);
      if (tagsNames.length > 0) {
        const existingTags = await this.tagsService.getExistingTags(tagsNames);
        const existingTagsNames = existingTags.map((e) => e.name);

        const newTags = tagsNames.filter((t) => !existingTagsNames.includes(t));

        let newTagsEntities: Tag[] = [];
        if (newTags.length > 0) {
          newTagsEntities = this.tagsService.createMany(newTags);
          await this.tagsService.saveMany(newTagsEntities);
        }

        const allTags = [...existingTags, ...newTagsEntities];
        const allTagsId = allTags.map((t) => t.id);
        await this.tagsService.incrementTags(allTagsId);

        updatedOpinion.tags = allTags;
      }
    }

    try {
      const savedOpinion = await this.opinionRepository.save(updatedOpinion);

      return savedOpinion;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getFollowingOpininions(
    currentId: string,
    { limit = 10, page }: PaginationDto,
  ) {
    const skip = (page - 1) * limit;

    const ids = await this.followsService.getFollowingIds(currentId);

    if (ids.length === 0) {
      return {
        meta: {
          limit,
          page,
          total: 0,
        },
        data: [],
      };
    }

    const query = this.baseQuery(currentId)
      .andWhere('user.id IN (:...ids)')
      .setParameter('ids', ids);

    const total = await query.clone().getCount();

    const result = query.limit(limit).offset(skip).getRawAndEntities();

    const { entities, raw } = await result;

    const rawData = raw as RawOpinion[];
    const opinions = this.handleParseEntity({ entities, rawData });

    return {
      meta: {
        total: total,
        limit: limit,
        page: page,
      },
      data: opinions,
    };
  }

  async getOpinionsByTagName(
    tagName: string,
    currentId: string,
    { limit, page }: PaginationDto,
  ) {
    const skip = (page - 1) * limit;

    const query = this.baseQuery(currentId)
      .innerJoin('opinion.tags', 'filterTag', 'filterTag.name = :tag')
      .setParameter('tag', tagName);

    const total = await query.clone().getCount();

    const result = await query.limit(limit).offset(skip).getRawAndEntities();

    const { entities, raw } = result;
    const rawData = raw as RawOpinion[];

    const opinions = this.handleParseEntity({ entities, rawData });

    return {
      meta: {
        total,
        limit,
        page,
      },
      data: opinions,
    };
  }

  getOpinionsByTerm = async (
    currentId: string,
    term: string | undefined,
    { limit, page }: PaginationDto,
  ) => {
    const skip = (page - 1) * limit;

    if (!term) {
      return {
        meta: {
          total: 0,
          page: page,
          limit: limit,
        },
        data: [],
      };
    }

    const formattedTerm = term
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .map((word) => `${word}:*`)
      .join(' & ');

    const query = this.baseQuery(currentId)
      .andWhere(
        "opinion.searchVector @@ to_tsquery('spanish', unaccent(:term))",
        { term: formattedTerm },
      )
      .addSelect(
        "ts_rank(opinion.searchVector, to_tsquery('spanish', unaccent(:term)))",
        'rank',
      )
      .orderBy('rank', 'DESC');

    const total = await query.clone().getCount();

    const result = query.limit(limit).offset(skip).getRawAndEntities();

    const { entities, raw } = await result;
    const rawData = raw as RawOpinion[];
    const opinions = this.handleParseEntity({ entities, rawData });

    return {
      meta: {
        total,
        limit,
        page,
      },
      data: opinions,
    };
  };

  private baseQuery(viewerId: string) {
    return this.opinionRepository
      .createQueryBuilder('opinion')
      .select([
        'opinion.id',
        'opinion.content',
        'opinion.title',
        'opinion.imageUrl',
        'opinion.createdAt',
        'opinion.isEdited',
      ])
      .leftJoinAndSelect('opinion.originalOpinion', 'originalOp')
      .leftJoin('originalOp.user', 'originalUser')
      .addSelect([
        'originalUser.id',
        'originalUser.username',
        'originalUser.avatarUrl',
      ])
      .leftJoin('opinion.user', 'user')
      .addSelect([
        'user.id',
        'user.username',
        'user.email',
        'user.name',
        'user.avatarUrl',
      ])
      .leftJoin('opinion.tags', 'tags')
      .addSelect(['tags.name', 'tags.id', 'tags.count'])
      .addSelect((sq) => {
        return sq
          .select('COUNT(*)')
          .from(Like, 'likes')
          .where('likes.opinionId = opinion.id');
      }, 'likeCount')
      .addSelect((sq) => {
        return sq
          .select('COUNT(l.id)')
          .from(Like, 'l')
          .where('l.opinionId = opinion.id')
          .andWhere('l.userId = :viewerId');
      }, 'isLiked')
      .addSelect((sq) => {
        return sq
          .select('COUNT(my_repost.id)')
          .from(Opinion, 'my_repost')
          .where('my_repost.user.id = :viewerId')
          .andWhere(
            'my_repost.originalOpinion.id = COALESCE(originalOp.id, opinion.id)',
          );
      }, 'isRepostedByMe')
      .addSelect((sq) => {
        return sq
          .select('COUNT(reposts.id)')
          .from(Opinion, 'reposts')
          .where(
            'reposts.originalOpinion.id = COALESCE(originalOp.id, opinion.id)',
          );
      }, 'repostCount')
      .setParameter('viewerId', viewerId)
      .orderBy('opinion.createdAt', 'DESC')
      .addOrderBy('opinion.id', 'DESC');
  }

  private handleParseEntity({
    entities,
    rawData,
  }: {
    entities: Opinion[];
    rawData: RawOpinion[];
  }) {
    const opinions = entities.map((opinion, index) => {
      const isLiked = parseInt(rawData[index].isLiked || '0') > 0;
      const isRepostedByMe = parseInt(rawData[index].isRepostedByMe || '0') > 0;
      const repostCount = parseInt(rawData[index].repostCount || '0');
      return {
        ...opinion,
        likesCount: parseInt(rawData[index].likeCount || '0'),
        isLiked,
        isRepostedByMe: isRepostedByMe,
        repostCount: repostCount,
      };
    });

    return opinions;
  }

  private async uploadImg(file: Express.Multer.File) {
    try {
      const resp = await this.cloudinaryService.uploadFile(
        file,
        'what-about-opinions-assets',
      );
      return resp.secure_url as string;
    } catch (error: unknown) {
      throw new BadRequestException({
        ok: false,
        message: ResponseMessageType.BAD_REQUEST,
        error: error instanceof Error ? error.message : 'Upload file failed',
      });
    }
  }

  private async manageImage(
    file: Express.Multer.File | undefined,
    oldUrlImg: string | null,
    deleteFlag: boolean = false,
  ) {
    try {
      if (file) {
        const resp = await this.uploadImg(file);
        await this.deleteCloudinaryImage(oldUrlImg);
        return resp;
      }

      if (deleteFlag) {
        await this.deleteCloudinaryImage(oldUrlImg);
        return null;
      }

      return oldUrlImg;
    } catch (error) {
      throw new BadRequestException({
        ok: false,
        message: ResponseMessageType.BAD_REQUEST,
        error: error instanceof Error ? error.message : 'Upload file failed',
      });
    }
  }

  private async deleteCloudinaryImage(imageUrl: string | null) {
    if (!imageUrl) return;
    const publicId = getPublicId(imageUrl);
    await this.cloudinaryService.deleteImage(publicId);
  }
}
