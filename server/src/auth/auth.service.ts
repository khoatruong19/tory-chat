import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import process from 'process';
import { Tokens } from 'src/utils/types';
import * as bcrypt from 'bcrypt';
import { IsNull, Not, Repository } from 'typeorm';
import { User } from 'src/typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async hashToken(token: string): Promise<string> {
    return await bcrypt.hash(token, 10);
  }

  async getTokens(userId: number, email: string): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get('ACCESS_TOKEN_SECRET'),
          expiresIn: 60 * 15,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get('REFRESH_TOKEN_SECRET'),
          expiresIn: 60 * 60,
        },
      ),
    ]);
    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async updateRtHash(userId: number, rt: string) {
    const hash = await this.hashToken(rt);
    await this.usersRepository.update(
      {
        id: userId,
      },
      {
        hashedRt: hash,
      },
    );
  }

  async logout(userId: number) {
    await this.usersRepository.update(
      {
        id: userId,
        hashedRt: Not(IsNull()),
      },
      {
        hashedRt: null,
      },
    );
  }

  async refreshTokens(userId: number, rt: string): Promise<Tokens> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user || !user.hashedRt) throw new ForbiddenException('Access denied!');
    const rtMatched = await bcrypt.compare(rt, user.hashedRt);
    if (!rtMatched) throw new ForbiddenException('Access denied!');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }
}
