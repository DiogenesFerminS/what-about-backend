import { Injectable } from '@nestjs/common';
import { type ToggleLikeDto } from './dto/toggle-like.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { Repository } from 'typeorm';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/entities/notification.entity';
import { OpinionsService } from 'src/opinions/opinions.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like) private readonly likesRepository: Repository<Like>,
    private readonly notificationService: NotificationService,
    private readonly opinionsService: OpinionsService,
    private readonly usersService: UsersService,
  ) {}

  async toggleLike(toggleLikeDto: ToggleLikeDto, userId: string) {
    const existLike = await this.likesRepository.findOne({
      where: { userId: userId, opinionId: toggleLikeDto.opinionId },
    });

    const opinion = await this.opinionsService.findOneById(
      toggleLikeDto.opinionId,
    );

    const currentUser = await this.usersService.findOneById(userId);

    if (existLike) {
      await this.likesRepository.remove(existLike);
      await this.notificationService.delete({
        creator: currentUser,
        owner: opinion.user,
        type: NotificationType.LIKE,
        opinion: opinion,
      });
      return { isLiked: false };
    }
    const like = this.likesRepository.create({
      opinionId: toggleLikeDto.opinionId,
      userId: userId,
    });

    await this.likesRepository.save(like);
    await this.notificationService.create({
      creator: currentUser,
      opinion: opinion,
      owner: opinion.user,
      type: NotificationType.LIKE,
    });

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
