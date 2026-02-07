import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { UsersModule } from 'src/users/users.module';
import { OpinionsModule } from 'src/opinions/opinions.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  controllers: [LikesController],
  providers: [LikesService],
  imports: [
    UsersModule,
    OpinionsModule,
    NotificationModule,
    TypeOrmModule.forFeature([Like]),
  ],
})
export class LikesModule {}
