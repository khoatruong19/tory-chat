import {
  Controller,
  Post,
  Patch,
  Param,
  ParseIntPipe,
  Body,
  Inject,
  Get,
  Delete,
  Query,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { instanceToPlain } from 'class-transformer';
import { CurrentUser } from 'src/common/decorators';
import { Routes, Services } from 'src/utils/constants';
import { JwtPayload } from 'src/utils/types';
import { CreateMessageDto } from './dtos/CreateMessage.dto';
import { MessageService } from './message.service';

@Controller(Routes.MESSAGES)
export class MessageController {
  constructor(
    @Inject(Services.MESSAGES) private readonly messageService: MessageService,
    private eventEmitter: EventEmitter2,
  ) {}
  @Post('')
  async createMessage(
    @Param('id', ParseIntPipe) requestId: number,
    @CurrentUser() user: JwtPayload,
    @Body()
    { content, seen }: CreateMessageDto,
  ) {
    const params = { userId: user.sub, content, requestId, seen };
    const response = await this.messageService.createMessage(params);
    this.eventEmitter.emit('message.create', response);
    return response;
  }

  @Get()
  async getMessagesFromConversation(
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
    @Param('id', ParseIntPipe) requestId: number,
  ) {
    const messages = await this.messageService.getMessagesByConversationId(
      requestId,
      limit,
      offset,
    );

    return { id: requestId, messages: instanceToPlain(messages) };
  }

  @Patch()
  async updateUnseenMessagesFromConversation(
    @Param('id', ParseIntPipe) requestId: number,
    @CurrentUser() userPayload: JwtPayload,
  ) {
    const messages = await this.messageService.updateMessagesSeen({
      userId: userPayload.sub,
      conversationId: requestId,
    });

    return { id: requestId, messages: instanceToPlain(messages) };
  }

  @Delete(':messageId')
  async deleteMessageFromConversation(
    @CurrentUser() userPayload: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
    @Param('messageId', ParseIntPipe) messageId: number,
  ) {
    const socketReceiverUserId = await this.messageService.deleteMessage({
      userId: userPayload.sub,
      conversationId: id,
      messageId,
    });

    this.eventEmitter.emit('message.delete', {
      socketReceiverUserId,
      conversationId: id,
      messageId,
    });

    return {
      message: 'Message deleted!',
    };
  }
}
