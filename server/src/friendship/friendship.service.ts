import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Friendship, Message, User } from 'src/typeorm';
import { sendRequestDetails } from 'src/utils/types';
import { Not, Repository } from 'typeorm';

type FriendWithMessages = User & {
  requestId: number;
  lastMessage: Message;
  unseenMessagesCount: number;
};

@Injectable()
export class FriendshipService {
  constructor(
    @InjectRepository(Friendship)
    private friendshipRepository: Repository<Friendship>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
  ) {}

  async getAllFriends(userId: number): Promise<FriendWithMessages[]> {
    const senderRequest = await this.friendshipRepository.find({
      where: {
        status: 1,
        senderId: userId,
      },
      relations: ['lastMessageSent'],
    });

    const receiverRequest = await this.friendshipRepository.find({
      where: {
        status: 1,
        receiverId: userId,
      },
      relations: ['lastMessageSent'],
    });

    let friends = await Promise.all(
      [...senderRequest, ...receiverRequest]
        .sort(
          (a, b) => b.lastMessageSent?.createdAt - a.lastMessageSent?.createdAt,
        )
        .map(async (request) => {
          const user = await this.usersRepository.findOne({
            where: {
              id:
                request.receiverId === userId
                  ? request.senderId
                  : request.receiverId,
            },
          });
          const unseenMessagesCount = await this.messagesRepository.count({
            relations: ['author'],
            where: {
              conversation: { id: request.id },
              seen: false,
              author: { id: Not(userId) },
            },
          });

          return {
            ...user,
            requestId: request.id,
            lastMessage: request.lastMessageSent,
            unseenMessagesCount,
          };
        }),
    );
    return friends;
  }

  async getConversationById(requestId: number) {
    return await this.friendshipRepository.findOne({
      where: { id: requestId },
      relations: ['messages'],
    });
  }

  async getAllRequests(userId: number): Promise<Friendship[]> {
    const senderRequest = await this.friendshipRepository.find({
      where: {
        status: 0,
        senderId: userId,
      },
    });

    const receiverRequest = await this.friendshipRepository.find({
      where: {
        status: 0,
        receiverId: userId,
      },
    });

    return [...senderRequest, ...receiverRequest];
  }

  async sendRequest(value: sendRequestDetails): Promise<Friendship> {
    const existingRequest = await this.friendshipRepository.findOne({
      where: {
        senderId: value.senderId,
        receiverId: value.receiverId,
      },
    });

    if (existingRequest)
      throw new BadRequestException('Request already exists!');

    const sender = await this.usersRepository.findOne({
      where: { id: value.senderId },
      select: ['firstName', 'lastName', 'image'],
    });
    if (!sender) throw new BadRequestException('Error requesting !');

    const fullname = sender.firstName + ' ' + sender.lastName;
    const newRequest = this.friendshipRepository.create({
      ...value,
      sender: fullname,
      senderImage: sender.image,
    });

    return await this.friendshipRepository.save(newRequest);
  }

  async cancelRequest(userId: number, requestId: number) {
    const existingRequest = await this.friendshipRepository.findOne({
      where: { id: requestId },
    });

    if (!existingRequest)
      throw new BadRequestException('Request doesnt exists!');

    if (
      existingRequest.receiverId !== userId &&
      existingRequest.senderId !== userId
    )
      throw new UnauthorizedException('Unauthorized!');

    let socketReceiverUserId: number;
    let type: 'sender' | 'receiver';
    let receiverCanceller: string = '';

    if (existingRequest.receiverId === userId) {
      socketReceiverUserId = existingRequest.senderId;
      type = 'sender';
      receiverCanceller = existingRequest.receiver;
    } else {
      socketReceiverUserId = existingRequest.receiverId;
      type = 'receiver';
    }

    await this.friendshipRepository.delete(existingRequest);
    return {
      socketReceiverUserId,
      type,
      receiverCanceller,
    };
  }

  async acceptRequest(userId: number, requestId: number) {
    const existingRequest = await this.friendshipRepository.findOne({
      where: { id: requestId, status: 0, receiverId: userId },
    });
    if (!existingRequest)
      throw new BadRequestException('Request doesnt exists!');

    if (
      existingRequest.receiverId !== userId &&
      existingRequest.senderId !== userId
    )
      throw new UnauthorizedException('Unauthorized!');

    existingRequest.status = 1;

    await this.friendshipRepository.save(existingRequest);

    let socketReceiverUserId = existingRequest.senderId;

    let receiverName = existingRequest.receiver;

    return { socketReceiverUserId, receiverName };
  }
}
