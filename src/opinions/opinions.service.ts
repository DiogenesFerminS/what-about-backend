import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { handleError } from 'src/common/helpers/handlerErrors';
import { Opinion } from './entities/opinions.entity';
import { Repository } from 'typeorm';
import { CreateOpinionDto } from './dto/create-opinion.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ResponseMessageType } from 'src/common/interfaces/http-response.interface';
import { type PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class OpinionsService {
  private handleError = handleError;
  constructor(
    @InjectRepository(Opinion) private opinionRepository: Repository<Opinion>,
    private cloudinaryService: CloudinaryService,
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

  async getAllOpinions({ limit, page }: PaginationDto) {
    const skip = (page - 1) * limit;

    const [opinions, total] = await this.opinionRepository
      .createQueryBuilder('opinion')
      .leftJoin('opinion.user', 'user')
      .select([
        'opinion.id',
        'opinion.content',
        'opinion.imageUrl',
        'opinion.createdAt',
        'opinion.isEdited',
      ])
      .addSelect(['user.id', 'user.username', 'user.email', 'user.name'])

      .orderBy('opinion.createdAt', 'DESC')
      .take(limit)
      .skip(skip)

      .getManyAndCount();

    const lastPage = Math.ceil(total / limit);

    return {
      meta: {
        total,
        lastPage,
        page,
      },
      data: opinions,
    };
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
