import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ZodValidationPipe } from 'src/common/pipes/zodValidation.pipe';
import { ResponseMessageType } from 'src/common/interfaces/http-response.interface';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import {
  type UpdateProfileDto,
  updateProfileSchema,
} from './dto/update-profile.dto';
import { type GetUserInterface } from 'src/common/interfaces/get-user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/profile')
  async getProfile(@GetUser() payload: GetUserInterface) {
    const profile = await this.usersService.findOneById(payload.id);

    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data: profile,
    };
  }

  @Patch('/update-profile')
  async updateProfile(
    @GetUser() payload: GetUserInterface,
    @Body(new ZodValidationPipe(updateProfileSchema))
    updateProfileDto: UpdateProfileDto,
  ) {
    const profileUpdated = await this.usersService.updateProfile(
      payload.id,
      updateProfileDto,
    );

    return {
      ok: true,
      message: ResponseMessageType.UPDATED,
      data: profileUpdated,
    };
  }

  @Get('/:id')
  async getUserById(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findOneById(id);
    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data: user,
    };
  }

  @Get()
  async getAllUsers() {
    const users = await this.usersService.findAllUsers();
    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data: users,
    };
  }
}
