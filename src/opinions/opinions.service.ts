import {
  BadRequestException,
  Injectable,
  NotFoundException,
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
import { RawOpinion } from './interfaces/raw-opinion';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class OpinionsService {
  private handleError = handleError;
  constructor(
    @InjectRepository(Opinion) private opinionRepository: Repository<Opinion>,
    private cloudinaryService: CloudinaryService,
    private usersService: UsersService,
  ) {}

  async createOpinion(
    userId: string,
    createOpinionDto: CreateOpinionDto,
    file?: Express.Multer.File,
  ) {
    let imageUrl: null | string = null;
    const { content } = createOpinionDto;

    if (file) {
      imageUrl = await this.uploadImg(file);
    }
    const opinion = this.opinionRepository.create({
      content,
      imageUrl: imageUrl,
      user: { id: userId },
    });

    return await this.opinionRepository.save(opinion);
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
    const opinion = await this.opinionRepository.findOneBy({ id });

    if (!opinion) {
      throw new NotFoundException({
        ok: false,
        error: 'Opinion not found',
        message: ResponseMessageType.NOT_FOUND,
      });
    }

    return opinion;
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

  private baseQuery(viewerId: string) {
    return this.opinionRepository
      .createQueryBuilder('opinion')
      .select([
        'opinion.id',
        'opinion.content',
        'opinion.imageUrl',
        'opinion.createdAt',
        'opinion.isEdited',
      ])
      .leftJoin('opinion.user', 'user')
      .addSelect([
        'user.id',
        'user.username',
        'user.email',
        'user.name',
        'user.avatarUrl',
      ])
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
      return {
        ...opinion,
        likesCount: parseInt(rawData[index].likeCount || '0'),
        isLiked,
      };
    });

    return opinions;
  }

  private async uploadImg(file: Express.Multer.File) {
    try {
      const resp = await this.cloudinaryService.uploadFile(file);
      return resp.secure_url as string;
    } catch (error: unknown) {
      throw new BadRequestException({
        ok: false,
        message: ResponseMessageType.BAD_REQUEST,
        error: error instanceof Error ? error.message : 'Upload file failed',
      });
    }
  }
}
