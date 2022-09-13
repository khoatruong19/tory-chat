import { Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Friendship } from 'src/typeorm';
import { UsersService } from 'src/users/users.service';
import { Services } from 'src/utils/constants';
import {
  CreateMessageResponse,
  DeleteMessageEventPayload,
} from 'src/utils/types';
import { GatewaySessionManager } from './gateway.session';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class MyGateway implements OnGatewayConnection {
  constructor(
    @Inject(Services.GATEWAY_SESSION_MANAGER)
    private readonly sessions: GatewaySessionManager,
    @Inject(Services.USERS)
    private readonly users: UsersService,
  ) {}
  private usersList: { userId: number; socketId: string }[] = [];

  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket, ...args: any[]) {
    socket.emit('connected', `${socket.id} are connected`);
  }

  handleDisconnect(client: Socket) {
    this.usersList = this.usersList.filter(
      (user) => user.socketId !== client.id,
    );
  }

  @SubscribeMessage('logout')
  onLogoutUser(@ConnectedSocket() client: Socket) {
    this.usersList = this.usersList.filter(
      (user) => user.socketId !== client.id,
    );
  }

  @SubscribeMessage('addUser')
  onAddUser(
    @ConnectedSocket() client: Socket,
    @MessageBody('userId') userId: number,
  ) {
    !this.usersList.some((user) => user.userId === userId) &&
      this.usersList.push({ userId, socketId: client.id });
  }

  @SubscribeMessage('newMessage')
  onNewMessage(@MessageBody() message: string) {
    this.server.emit('message', message);
  }

  @OnEvent('request.send')
  handleReceiveRequest(payload: Friendship) {
    const { receiverId } = payload;
    const receiver = this.usersList.find((user) => user.userId === receiverId);
    if (receiver) {
      this.server.to(receiver.socketId).emit('receiveRequest', payload);
    }
  }

  @OnEvent('request.accept')
  handleAcceptRequest(payload: {
    socketReceiverUserId: number;
    receiverName: string;
    requestId: number;
  }) {
    const receiver = this.usersList.find(
      (user) => user.userId === payload.socketReceiverUserId,
    );
    if (receiver) {
      this.server.to(receiver.socketId).emit('acceptRequest', {
        requestId: payload.requestId,
        receiverName: payload.receiverName,
      });
    }
  }

  @OnEvent('request.cancel')
  handleCancelRequest(payload: {
    socketReceiverUserId: number;
    type: 'sender' | 'receiver';
    receiverCanceller: string;
    requestId: number;
  }) {
    const receiver = this.usersList.find(
      (user) => user.userId === payload.socketReceiverUserId,
    );
    if (receiver) {
      this.server.to(receiver.socketId).emit('cancelRequest', {
        requestId: payload.requestId,
        receiverCanceller: payload.receiverCanceller,
        type: payload.type,
      });
    }
  }

  @OnEvent('request.unfriend')
  handleUnfriend(payload: { socketReceiverUserId: number; requestId: number }) {
    const receiver = this.usersList.find(
      (user) => user.userId === payload.socketReceiverUserId,
    );
    if (receiver) {
      this.server.to(receiver.socketId).emit('unfriend', {
        requestId: payload.requestId,
      });
    }
  }

  @OnEvent('message.create')
  handleCreateMessage(payload: CreateMessageResponse) {
    const { message, conversation } = payload;
    let socketReceiverUserId =
      conversation.receiverId === message.author.id
        ? conversation.senderId
        : conversation.receiverId;
    const receiver = this.usersList.find(
      (user) => user.userId === socketReceiverUserId,
    );
    if (receiver) {
      this.server.to(receiver.socketId).emit('onMessage', payload);
    }
  }

  @OnEvent('message.delete')
  handleDeleteMessage(payload: DeleteMessageEventPayload) {
    const { socketReceiverUserId, ...rest } = payload;
    const receiver = this.usersList.find(
      (user) => user.userId === socketReceiverUserId,
    );
    if (receiver) {
      this.server.to(receiver.socketId).emit('deleteMessage', rest);
    }
  }

  @OnEvent('friends.online')
  handleGetOnlineFriends(payload: { friendIds: number[]; userId: number }) {
    const onlineFriendIds = [];
    payload.friendIds.map((id) => {
      const existingUser = this.usersList.find((user) => user.userId === id);
      if (existingUser) {
        this.server
          .to(existingUser.socketId)
          .emit('updateOnlineFriends', payload.userId);
        onlineFriendIds.push(id);
      }
    });

    const receiver = this.usersList.find(
      (user) => user.userId === payload.userId,
    );
    if (receiver) {
      this.server
        .to(receiver.socketId)
        .emit('getOnlineFriends', onlineFriendIds);
    }
  }

  @SubscribeMessage('onConversationJoin')
  onConversationJoin(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`conversation-${data.conversationId}`);
    this.server.to(`conversation-${data.conversationId}`).emit('userJoin');
  }

  @SubscribeMessage('onConversationLeave')
  onConversationLeave(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('leave, ', data.conversationId);
    client.leave(`conversation-${data.conversationId}`);
    this.server.to(`conversation-${data.conversationId}`).emit('userLeave');
  }

  @SubscribeMessage('onTypingStart')
  onTypingStart(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    this.server
      .to(`conversation-${data.conversationId}`)
      .emit('onTypingStart', data.conversationId);
  }

  @SubscribeMessage('onTypingStop')
  onTypingStop(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    this.server.to(`conversation-${data.conversationId}`).emit('onTypingStop');
  }

  @SubscribeMessage('onConversationNumbers')
  onConversationNumbers(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    const clients = this.server.sockets.adapter.rooms.get(
      `conversation-${data.conversationId}`,
    );
    this.server
      .to(`conversation-${data.conversationId}`)
      .emit('onConversationNumbers', {
        count: clients.size,
      });
  }
}
