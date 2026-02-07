import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationController } from './notification.controller';

@Module({
  providers: [NotificationService],
  controllers: [NotificationController],
  imports: [TypeOrmModule.forFeature([Notification])],
  exports: [NotificationService],
})
export class NotificationModule {}
