import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Follow } from './entities/follow.entity';
import { Repository } from 'typeorm';
import { ResponseMessageType } from 'src/common/interfaces/http-response.interface';
import { UsersService } from 'src/users/users.service';
import { handleError } from 'src/common/helpers/handlerErrors';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/entities/notification.entity';

@Injectable()
export class FollowsService {
  private errorHandler = handleError;

  constructor(
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    private readonly usersService: UsersService,
    private readonly notificationService: NotificationService,
  ) {}
  async create(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      throw new BadRequestException({
        ok: false,
        message: ResponseMessageType.BAD_REQUEST,
        error: "You can't follow yourself",
      });
    }

    const [currentUser, followindUser] = await Promise.all([
      this.usersService.findOneById(currentUserId),
      this.usersService.findOneById(targetUserId),
    ]);

    const newFollow = this.followRepository.create({
      follower: currentUser,
      following: followindUser,
    });

    try {
      const savedFollow = await this.followRepository.save(newFollow);
      await this.notificationService.create({
        type: NotificationType.FOLLOW,
        creator: currentUser,
        owner: followindUser,
        opinion: undefined,
      });
      return savedFollow;
    } catch (error: unknown) {
      this.errorHandler(error);
    }
  }

  async isFollowed(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      throw new BadRequestException({
        ok: false,
        message: ResponseMessageType.BAD_REQUEST,
        error: "You can't follow yourself",
      });
    }

    const resp = await this.followRepository
      .createQueryBuilder('follows')
      .where('follows.follower_id = :followerId')
      .andWhere('follows.following_id = :followingId')
      .setParameters({ followerId: currentUserId, followingId: targetUserId })
      .getCount();

    return resp > 0;
  }

  async unfollow(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      throw new BadRequestException({
        ok: false,
        message: ResponseMessageType.BAD_REQUEST,
        error: "You can't unfollow yourself",
      });
    }

    const [currentUser, targetUser] = await Promise.all([
      this.usersService.findOneById(currentUserId),
      this.usersService.findOneById(targetUserId),
    ]);

    try {
      const result = await this.followRepository
        .createQueryBuilder()
        .delete()
        .from(Follow)
        .where('follower_id = :followerId', { followerId: currentUserId })
        .andWhere('following_id = :followingId', { followingId: targetUserId })
        .execute();

      await this.notificationService.delete({
        creator: currentUser,
        owner: targetUser,
        type: NotificationType.FOLLOW,
      });
      return (result.affected ?? 0) > 0;
    } catch (error: unknown) {
      this.errorHandler(error);
    }
  }

  async getFollowStats(userId: string) {
    try {
      const [followersCount, followingCount] = await Promise.all([
        this.followRepository
          .createQueryBuilder('follow')
          .where('follow.following_id = :userId', { userId })
          .getCount(),
        this.followRepository
          .createQueryBuilder('follow')
          .where('follow.follower_id = :userId', { userId })
          .getCount(),
      ]);

      return {
        followers: followersCount,
        following: followingCount,
      };
    } catch (error: unknown) {
      this.errorHandler(error);
    }
  }

  async getFollowingIds(currentId: string) {
    const follows = await this.followRepository
      .createQueryBuilder('follow')
      .leftJoinAndSelect('follow.following', 'following')
      .where('follow.follower_id = :currentId', { currentId })
      .getMany();

    const ids = follows.map((follow) => follow.following.id);
    return ids;
  }
}
