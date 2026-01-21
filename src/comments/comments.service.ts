import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UsersService } from 'src/users/users.service';
import { OpinionsService } from 'src/opinions/opinions.service';
import { ResponseMessageType } from 'src/common/interfaces/http-response.interface';
import { type PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    private readonly usersService: UsersService,
    private readonly opinionsService: OpinionsService,
  ) {}

  async create(userId: string, createCommentDto: CreateCommentDto) {
    const { content, opinionId } = createCommentDto;

    const user = await this.usersService.findOneById(userId);

    const opinion = await this.opinionsService.findOneById(opinionId);

    const comment = this.commentsRepository.create({
      content,
      user,
      opinion,
    });

    return await this.commentsRepository.save(comment);
  }

  async delete(commentId: string, userId: string) {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
      relations: ['user'],
    });

    if (!comment) {
      throw new NotFoundException({
        ok: false,
        error: 'Comment not found',
        message: ResponseMessageType.NOT_FOUND,
      });
    }

    if (comment.user.id !== userId) {
      throw new NotFoundException({
        ok: false,
        error: 'You can only delete your own comments',
        message: ResponseMessageType.UNAUTHORIZED,
      });
    }

    await this.commentsRepository.remove(comment);
    return { message: 'Comment deleted successfully' };
  }

  async getCommentsByOpinionId(
    opinionId: string,
    { limit, page }: PaginationDto,
  ) {
    // Verificar que la opinión existe
    await this.opinionsService.findOneById(opinionId);

    const skip = (page - 1) * limit;

    const query = this.commentsRepository
      .createQueryBuilder('comment')
      .select(['comment.id', 'comment.content', 'comment.createdAt'])
      .leftJoin('comment.user', 'user')
      .addSelect(['user.id', 'user.username', 'user.name', 'user.avatarUrl'])
      .leftJoin('comment.opinion', 'opinion')
      .where('opinion.id = :opinionId', { opinionId })
      .orderBy('comment.createdAt', 'DESC')
      .addOrderBy('comment.id', 'DESC');

    const total = await query.clone().getCount();

    const comments = await query.limit(limit).offset(skip).getMany();

    return {
      meta: {
        total,
        page,
        limit,
      },
      data: comments,
    };
  }

  async getCommentsCountByOpinionId(
    opinionId: string,
  ): Promise<{ count: number }> {
    await this.opinionsService.findOneById(opinionId);

    const count = await this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoin('comment.opinion', 'opinion')
      .where('opinion.id = :opinionId', { opinionId })
      .getCount();

    return { count };
  }
}
