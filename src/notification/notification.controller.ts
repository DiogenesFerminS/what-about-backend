import { Controller, Get } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { type GetUserInterface } from 'src/common/interfaces/get-user.interface';
import { ResponseMessageType } from 'src/common/interfaces/http-response.interface';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationsService: NotificationService) {}

  @Get('stats')
  async getStats(@GetUser() payload: GetUserInterface) {
    const notifications =
      await this.notificationsService.getNotificationsByUser(payload.id);

    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data: notifications,
    };
  }
}
