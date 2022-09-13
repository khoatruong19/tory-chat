import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { CurrentUser, Public } from 'src/common/decorators';
import { RtGuard } from 'src/common/guards';
import { UsersService } from 'src/users/users.service';
import { Routes, Services } from 'src/utils/constants';
import { JwtPayload, JwtPayloadWithRt } from 'src/utils/types';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/CreateUser.dto';
import { LoginUserDto } from './dtos/LoginUser.dto';

@Controller(Routes.AUTH)
export class AuthController {
  constructor(
    @Inject(Services.AUTH) private authService: AuthService,
    @Inject(Services.USERS) private usersService: UsersService,
  ) {}

  @Public()
  @Post('register')
  async registerUser(@Body() createUserDto: CreateUserDto) {
    return instanceToPlain(await this.usersService.createUser(createUserDto));
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    return instanceToPlain(await this.usersService.findUser(loginUserDto));
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logoutUser(@CurrentUser() user: JwtPayload) {
    return this.authService.logout(user.sub);
  }

  @Post('me')
  @HttpCode(HttpStatus.OK)
  me(@CurrentUser() user: JwtPayload) {
    return this.usersService.me(user.sub);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshToken(@CurrentUser() user: JwtPayloadWithRt) {
    return this.authService.refreshTokens(user.sub, user.refreshToken);
  }
}
