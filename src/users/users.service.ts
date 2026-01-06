import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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

  async createUser(createUserDto: CreateUserDto, token: string) {
    const roundOfSalt: number = this.configService.getOrThrow('ROUND_OF_SALT');
    const passwordHashed = await bcrypt.hash(
      createUserDto.password,
      roundOfSalt,
    );

    try {
      const user = this.userRepository.create({
        ...createUserDto,
        password: passwordHashed,
        verifyToken: token,
      });

      const newUser = await this.userRepository.save(user);

      return newUser;
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
        verifyToken: true,
      },
    });

    if (!user) {
      throw new NotFoundException({
        ok: false,
        error: 'Invalid credentials',
        message: ResponseMessageType.NOT_FOUND,
      });
    }

    if (!user.isActive) {
      throw new BadRequestException({
        ok: false,
        error: 'Account inactive',
        message: ResponseMessageType.BAD_REQUEST,
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

  async verifyUser(token: string) {
    const user = await this.userRepository.findOne({
      where: { verifyToken: token },
    });

    if (!user) {
      throw new BadRequestException({
        ok: false,
        message: ResponseMessageType.BAD_REQUEST,
        error: 'Invalid token',
      });
    }
    user.isVerified = true;
    user.verifyToken = null;

    try {
      const userVerified = await this.userRepository.save(user);
      return userVerified;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateToken(
    userId: string,
    token: string,
    type: 'verifyToken' | 'resetPasswordToken',
  ): Promise<void> {
    try {
      await this.userRepository.update(userId, {
        [type]: token,
      });
    } catch {
      throw new InternalServerErrorException({
        ok: false,
        message: ResponseMessageType.INTERNAL_SERVER_ERROR,
        error: 'Update verify token failed',
      });
    }
  }

  async updatePassword(token: string, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: { resetPasswordToken: token },
    });

    if (!user) {
      throw new UnauthorizedException({
        ok: false,
        message: ResponseMessageType.UNAUTHORIZED,
        error: 'Invalid Token',
      });
    }

    const roundOfSalt: number = this.configService.getOrThrow('ROUND_OF_SALT');
    const passwordHashed = await bcrypt.hash(newPassword, roundOfSalt);

    user.password = passwordHashed;
    user.resetPasswordToken = null;

    await this.userRepository.save(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...rest } = user;
    return rest;
  }
}
