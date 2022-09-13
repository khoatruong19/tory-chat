import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Inject,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { instanceToPlain } from 'class-transformer';
import { CurrentUser } from 'src/common/decorators';
import { Routes, Services } from 'src/utils/constants';
import { JwtPayload } from 'src/utils/types';
import { SendRequestDto } from './dtos/SendRequest.dto';
import { FriendshipService } from './friendship.service';

@Controller(Routes.FRIENDSHIPS)
export class FriendshipController {
  constructor(
    @Inject(Services.FRIENDSHIPS) private friendshipService: FriendshipService,
    private eventEmitter: EventEmitter2,
  ) {}
  @Get()
  async getAllFriends(@CurrentUser() user: JwtPayload) {
    const friends = await this.friendshipService.getAllFriends(user.sub);
    const friendIds = friends.map((f) => f.id);
    this.eventEmitter.emit('friends.online', { friendIds, userId: user.sub });
    return instanceToPlain(friends);
  }

  @Get('requests')
  getAllRequests(@CurrentUser() user: JwtPayload) {
    return this.friendshipService.getAllRequests(user.sub);
  }

  @Get(':requestId')
  getConversation(@Param('requestId', ParseIntPipe) requestId: number) {
    return this.friendshipService.getConversationById(requestId);
  }

  @Post()
  async sendFriendRequest(
    @CurrentUser() user: JwtPayload,
    @Body() sendRequestDto: SendRequestDto,
  ) {
    const newRequest = await this.friendshipService.sendRequest({
      senderId: user.sub,
      ...sendRequestDto,
    });
    this.eventEmitter.emit('request.send', newRequest);
    return newRequest;
  }

  @Delete(':requestId')
  async cancelFriendRequest(
    @CurrentUser() user: JwtPayload,
    @Param('requestId', ParseIntPipe) requestId: number,
  ) {
    const { socketReceiverUserId, type, receiverCanceller } =
      await this.friendshipService.cancelRequest(user.sub, requestId);
    this.eventEmitter.emit('request.cancel', {
      socketReceiverUserId,
      type,
      requestId,
      receiverCanceller,
    });
    return {
      message: 'Request cancelled',
    };
  }

  @Delete('unfriend/:requestId')
  async unfriend(
    @CurrentUser() user: JwtPayload,
    @Param('requestId', ParseIntPipe) requestId: number,
  ) {
    const { socketReceiverUserId } = await this.friendshipService.cancelRequest(
      user.sub,
      requestId,
    );
    this.eventEmitter.emit('request.unfriend', {
      socketReceiverUserId,
      requestId,
    });
    return {
      message: 'Unfriend!',
    };
  }

  @Patch(':requestId')
  async acceptFriendRequest(
    @CurrentUser() user: JwtPayload,
    @Param('requestId', ParseIntPipe) requestId: number,
  ) {
    const { socketReceiverUserId, receiverName } =
      await this.friendshipService.acceptRequest(user.sub, requestId);
    this.eventEmitter.emit('request.accept', {
      socketReceiverUserId,
      requestId,
      receiverName,
    });
    return {
      message: 'Request accepted!',
    };
  }
}
