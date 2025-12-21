import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { handleError } from 'src/common/helpers/handlerErrors';
import { ResponseMessageType } from 'src/common/interfaces/http-response.interface';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Envs } from 'src/common/schemas/envs.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  private handleError: (error: unknown) => never;

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private configService: ConfigService<Envs>,
  ) {
    this.handleError = handleError;
  }

  async createUser(createUserDto: CreateUserDto) {
    const roundOfSalt: number = this.configService.getOrThrow('ROUND_OF_SALT');
    const passwordHashed = await bcrypt.hash(
      createUserDto.password,
      roundOfSalt,
    );

    try {
      const user = this.userRepository.create({
        ...createUserDto,
        password: passwordHashed,
      });

      const newUser = await this.userRepository.save(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...rest } = newUser;

      return rest;
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  async findOneById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException({
        ok: false,
        error: 'User not found',
        message: ResponseMessageType.NOT_FOUND,
      });
    }

    return user;
  }

  findAllUsers() {
    return this.userRepository.find();
  }

  async findUserByTerm(term: string) {
    const user = await this.userRepository.findOne({
      where: [{ username: term }, { email: term }],
      select: {
        password: true,
        id: true,
        username: true,
        email: true,
        isActive: true,
        isVerified: true,
      },
    });

    if (!user) {
      throw new NotFoundException({
        ok: false,
        error: 'User not found',
        message: ResponseMessageType.NOT_FOUND,
      });
    }

    return user;
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto) {
    const oldUser = await this.findOneById(id);
    const newUser = this.userRepository.merge(oldUser, updateProfileDto);

    try {
      await this.userRepository.save(newUser);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...rest } = newUser;
      return rest;
    } catch (error) {
      this.handleError(error);
    }
  }
}
