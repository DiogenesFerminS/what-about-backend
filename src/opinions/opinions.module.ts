import { Module } from '@nestjs/common';
import { OpinionsService } from './opinions.service';
import { OpinionsController } from './opinions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Opinion } from './entities/opinions.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  controllers: [OpinionsController],
  providers: [OpinionsService],
  imports: [CloudinaryModule, TypeOrmModule.forFeature([Opinion])],
})
export class OpinionsModule {}
