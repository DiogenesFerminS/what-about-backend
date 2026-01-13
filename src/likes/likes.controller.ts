import { Controller, Post, Body, Get } from '@nestjs/common';
import { LikesService } from './likes.service';
import { toggleLikeSchema, type ToggleLikeDto } from './dto/toggle-like.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { type GetUserInterface } from 'src/common/interfaces/get-user.interface';
import { ZodValidationPipe } from 'src/common/pipes/zodValidation.pipe';
import { ResponseMessageType } from 'src/common/interfaces/http-response.interface';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  async toggleLike(
    @GetUser() payload: GetUserInterface,
    @Body(new ZodValidationPipe(toggleLikeSchema)) toggleLikeDto: ToggleLikeDto,
  ) {
    const data = await this.likesService.toggleLike(toggleLikeDto, payload.id);
    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data,
    };
  }

  @Get()
  getAllLikes() {
    return this.likesService.getAllLikes();
  }
}
