import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ResponseMessageType } from 'src/common/interfaces/http-response.interface';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
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
}
