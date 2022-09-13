import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { CurrentUser } from 'src/common/decorators';
import { Services } from 'src/utils/constants';
import { JwtPayload } from 'src/utils/types';
import { UpdateUserDto } from './dtos/UpdateUser.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(@Inject(Services.USERS) private usersService: UsersService) {}
  @Get()
  getAllUsers(@CurrentUser() userPayload: JwtPayload) {
    return instanceToPlain(this.usersService.getAllUsers(userPayload.sub));
  }

  @Patch()
  updateUserInfo(
    @CurrentUser('id') userPayload: JwtPayload,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return instanceToPlain(
      this.usersService.updateUser({
        userId: userPayload.sub,
        ...updateUserDto,
      }),
    );
  }
}
