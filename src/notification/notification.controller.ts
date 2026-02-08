import { Controller, Get, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { type GetUserInterface } from 'src/common/interfaces/get-user.interface';
import { ResponseMessageType } from 'src/common/interfaces/http-response.interface';
import { ZodValidationPipe } from 'src/common/pipes/zodValidation.pipe';
import { type PaginationDto, paginationSchema } from 'src/common/dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationsService: NotificationService) {}

  @Get('stats')
  async getStats(
    @Query(new ZodValidationPipe(paginationSchema))
    paginationDto: PaginationDto,
    @GetUser() payload: GetUserInterface,
  ) {
    const notifications =
      await this.notificationsService.getNotificationsByUser(
        payload.id,
        paginationDto,
      );

    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data: notifications,
    };
  }

  @Get('not-read')
  async getNotReadCount(@GetUser() payload: GetUserInterface) {
    const data = await this.notificationsService.getNotReadCount(payload.id);

    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data,
    };
  }
}
