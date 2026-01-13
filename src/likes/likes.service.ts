import { Injectable } from '@nestjs/common';
import { type ToggleLikeDto } from './dto/toggle-like.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { OpinionsService } from 'src/opinions/opinions.service';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like) private readonly likesRepository: Repository<Like>,
    private readonly usersService: UsersService,
    private readonly opinionsService: OpinionsService,
  ) {}

  async toggleLike(toggleLikeDto: ToggleLikeDto, userId: string) {
    const existLike = await this.likesRepository.findOne({
      where: { userId: userId, opinionId: toggleLikeDto.opinionId },
    });

    if (existLike) {
      await this.likesRepository.remove(existLike);
      return { isLiked: false };
    }
    const like = this.likesRepository.create({
      opinionId: toggleLikeDto.opinionId,
      userId: userId,
    });

    await this.likesRepository.save(like);
    return { isLiked: true };
  }

  getAllLikes() {
    return this.likesRepository.find({
      relations: { user: true, opinion: true },
      select: {
        id: true,
        opinion: {
          id: true,
        },
        user: {
          id: true,
        },
      },
    });
  }
}
