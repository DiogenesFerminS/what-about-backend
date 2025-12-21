import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ResponseMessageType } from 'src/common/interfaces/http-response.interface';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { MailService } from 'src/mail/mail.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async login({ term, password }: LoginDto) {
    const user = await this.usersService.findUserByTerm(term);
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException({
        ok: false,
        error: 'Invalid Credentials',
        message: ResponseMessageType.UNAUTHORIZED,
      });
    }

    const payload = { sub: user.id, username: user.username };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async createUser(createUserDto: CreateUserDto) {
    const token = this.generateRandomToken();
    const newUser = await this.usersService.createUser(createUserDto, token);

    await this.mailService.sendUserConfirmation(newUser, token);
    return `An email has been sent to ${newUser.email}to verify your account`;
  }

  async validateToken(token: string) {
    const user = await this.usersService.findUserByTerm(token);
    if (!user) {
      throw new UnauthorizedException({
        ok: false,
        message: ResponseMessageType.UNAUTHORIZED,
        error: 'Invalid Token',
      });
    }

    const userVerified = await this.usersService.verifyUser(user);
    return userVerified;
  }

  private generateRandomToken() {
    const token = crypto.randomBytes(32).toString('hex');
    return token;
  }
}
