import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { User } from 'src/users/entities/user.entity';
import { Opinion } from 'src/opinions/entities/opinions.entity';
import { ResponseMessageType } from 'src/common/interfaces/http-response.interface';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
  ) {}

  async getNotificationsByUser(userId: string) {
    const notifications = await this.notificationsRepository.find({
      where: { owner: { id: userId } },
      relations: ['opinion', 'creator'],
    });

    return notifications;
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
