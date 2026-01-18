import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Patch,
  UploadedFile,
  UseInterceptors,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { type Response } from 'express';

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
  @UseInterceptors(FileInterceptor('file'))
  async updateProfile(
    @GetUser() payload: GetUserInterface,
    @Body(new ZodValidationPipe(updateProfileSchema))
    updateProfileDto: UpdateProfileDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    const profileUpdated = await this.usersService.updateProfile(
      payload.id,
      updateProfileDto,
      file,
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
