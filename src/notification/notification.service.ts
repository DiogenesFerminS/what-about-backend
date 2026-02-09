import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { User } from 'src/users/entities/user.entity';
import { Opinion } from 'src/opinions/entities/opinions.entity';
import { ResponseMessageType } from 'src/common/interfaces/http-response.interface';
import { PaginationDto } from 'src/common/dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
  ) {}

  async getNotificationsByUser(
    userId: string,
    { limit = 10, page }: PaginationDto,
  ) {
    const skip = (page - 1) * limit;
    const [notifications, total] =
      await this.notificationsRepository.findAndCount({
        where: { owner: { id: userId } },
        relations: ['opinion', 'creator'],
        order: { createdAt: 'DESC' },
        skip: skip,
        take: limit,
      });

    const restPages = total / limit;

    const notReadIds = notifications
      .filter((not) => !not.isRead)
      .map((not) => not.id);

    await this.notificationsRepository
      .update(
        {
          id: In(notReadIds),
        },
        { isRead: true },
      )
      .catch(() => {
        throw new BadRequestException({
          ok: false,
          message: ResponseMessageType.BAD_REQUEST,
          error: 'The notifications could not be read.',
        });
      });

    return {
      meta: {
        total,
        page: page,
        limit: limit,
        totalPage: Math.ceil(restPages),
      },
      data: notifications,
    };
  }

  async getNotReadCount(userId: string) {
    const count = await this.notificationsRepository.count({
      where: { owner: { id: userId }, isRead: false },
    });

    return { count };
  }

  async create({
    creator,
    opinion,
    owner,
    type,
  }: {
    type: NotificationType;
    owner: User;
    opinion: Opinion | undefined;
    creator: User;
  }) {
    if (owner.id === creator.id) return;

    const newNotification = this.notificationsRepository.create({
      opinion: opinion,
      owner: owner,
      creator: creator,
      type,
    });

    const savedNotification =
      await this.notificationsRepository.save(newNotification);

    return savedNotification;
  }

  async delete({
    creator,
    owner,
    type,
    opinion,
  }: {
    creator: User;
    owner: User;
    type: NotificationType;
    opinion?: Opinion;
  }) {
    const whereFields: {
      creator: User;
      owner: User;
      type: NotificationType;
      opinion?: Opinion;
    } = {
      creator,
      owner,
      type,
    };

    if (owner.id === creator.id) return;

    if (opinion) {
      whereFields.opinion = opinion;
    }

    try {
      await this.notificationsRepository.delete(whereFields);
    } catch {
      throw new BadRequestException({
        ok: false,
        message: ResponseMessageType.BAD_REQUEST,
        error: 'Failure to delete record',
      });
    }
  }
}
