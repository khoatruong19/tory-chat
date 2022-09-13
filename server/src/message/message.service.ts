import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { Friendship, Message, User } from 'src/typeorm';
import {
  CreateMessageParams,
  CreateMessageResponse,
  DeleteMessageParams,
  UpdateMessagesSeenParams,
} from 'src/utils/types';
import { Not, Repository } from 'typeorm';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    @InjectRepository(Friendship)
    private readonly conversationRepository: Repository<Friendship>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createMessage({
    userId,
    content,
    seen,
    requestId,
  }: CreateMessageParams): Promise<CreateMessageResponse> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: requestId },
      relations: ['lastMessageSent'],
    });
    if (!conversation)
      throw new HttpException('Conversation not found', HttpStatus.BAD_REQUEST);

    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user)
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);

    const { receiverId, senderId } = conversation;

    if (receiverId !== user.id && senderId !== user.id)
      throw new HttpException('Cannot Create Message', HttpStatus.FORBIDDEN);
    const message = this.messagesRepository.create({
      content,
      seen,
      conversation,
      author: instanceToPlain(user),
    });
    const savedMessage = await this.messagesRepository.save(message);
    conversation.lastMessageSent = savedMessage;
    const updatedConversation = await this.conversationRepository.save(
      conversation,
    );
    return { message: savedMessage, conversation: updatedConversation };
  }

  async getMessagesByConversationId(
    requestId: number,
    limit: number,
    offset: number,
  ): Promise<Message[]> {
    return await this.messagesRepository
      .createQueryBuilder('message')

      .where('message.conversationId = :conversationId', {
        conversationId: requestId,
      })
      .orderBy('message.createdAt', 'DESC')
      .leftJoinAndSelect('message.author', 'author')
      .limit(limit)
      .offset(offset)
      .getMany();
  }

  async deleteMessage(params: DeleteMessageParams): Promise<number> {
    const conversation = await this.conversationRepository
      .createQueryBuilder('conversation')
      .where('id = :conversationId', { conversationId: params.conversationId })
      .leftJoinAndSelect('conversation.lastMessageSent', 'lastMessageSent')
      .leftJoinAndSelect('conversation.messages', 'message')
      .where('conversation.id = :conversationId', {
        conversationId: params.conversationId,
      })
      .orderBy('message.createdAt', 'DESC')
      .limit(5)
      .getOne();

    if (!conversation) throw new BadRequestException('Conversation not found!');

    const message = await this.messagesRepository.findOne({
      where: {
        id: params.messageId,
        author: { id: params.userId },
        conversation: { id: params.conversationId },
      },
    });

    if (!message) throw new BadRequestException('Message not found!');

    let socketReceiverUserId =
      conversation.receiverId === params.userId
        ? conversation.senderId
        : conversation.receiverId;

    if (conversation.messages[0].id !== message.id) {
      await this.messagesRepository.delete({ id: message.id });
      return socketReceiverUserId;
    }
    // Deleting Last Message
    const size = conversation.messages.length;
    const SECOND_MESSAGE_INDEX = 1;
    if (size <= 1) {
      await this.conversationRepository.update(
        { id: params.conversationId },
        { lastMessageSent: null },
      );
      await this.messagesRepository.delete({ id: message.id });
    } else {
      const newLastMessage = conversation.messages[SECOND_MESSAGE_INDEX];
      await this.conversationRepository.update(
        { id: params.conversationId },
        { lastMessageSent: newLastMessage },
      );
      await this.messagesRepository.delete({ id: message.id });
    }

    return socketReceiverUserId;
  }

  async updateMessagesSeen(
    params: UpdateMessagesSeenParams,
  ): Promise<{ message: string }> {
    const unseenMessages = await this.messagesRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.author', 'author')

      .where('message.conversationId = :conversationId', {
        conversationId: params.conversationId,
      })
      .andWhere('message.seen = false')
      .andWhere('author.id != :authorId', { authorId: params.userId })
      .getMany();

    if (unseenMessages.length > 0) {
      const seenMessages = unseenMessages.map((m) => ({ ...m, seen: true }));
      await this.messagesRepository.save(seenMessages);
      return {
        message: 'All messages seen!',
      };
    }
  }
}
