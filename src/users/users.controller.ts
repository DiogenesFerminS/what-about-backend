import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UsePipes,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ZodValidationPipe } from 'src/common/pipes/zodValidation.pipe';
import { type Request, type Response } from 'express';
import { ResponseMessageType } from 'src/common/interfaces/http-response.interface';
import { type JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import {
  type UpdateProfileDto,
  updateProfileSchema,
} from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/profile')
  async getProfile(@GetUser() payload: JwtPayload) {
    const profile = await this.usersService.findOneById(payload.sub);

    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data: profile,
    };
  }

  @Patch('/update-profile')
  @UsePipes(new ZodValidationPipe(updateProfileSchema))
  async updateProfile(
    @GetUser() payload: JwtPayload,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const profileUpdated = await this.usersService.updateProfile(
      payload.sub,
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
