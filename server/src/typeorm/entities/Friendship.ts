import { FriendshipStatus } from 'src/utils/types';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Message } from './Message';

@Entity({ name: 'friendships' })
export class Friendship {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sender: string;

  @Column()
  senderId: number;

  @Column()
  senderImage: string;

  @Column()
  receiver: string;

  @Column()
  receiverId: number;

  @Column()
  receiverImage: string;

  @Column('int', { default: 0 })
  status: FriendshipStatus;

  @OneToMany(() => Message, (message) => message.conversation, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  messages: Message[];

  @OneToOne(() => Message, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'last_message_sent' })
  lastMessageSent: Message;
}
