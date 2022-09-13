import { Module } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { FriendshipController } from './friendship.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friendship, Message, User } from 'src/typeorm';
import { UsersModule } from 'src/users/users.module';
import { Services } from 'src/utils/constants';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([Friendship, User, Message])],
  providers: [
    {
      provide: Services.FRIENDSHIPS,
      useClass: FriendshipService,
    },
  ],
  controllers: [FriendshipController],
  exports: [
    {
      provide: Services.FRIENDSHIPS,
      useClass: FriendshipService,
    },
  ],
})
export class FriendshipModule {}
