import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Friendship } from './Friendship';
import { User } from './User';

@Entity({ name: 'messages' })
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: number;

  @Column({ default: 0 })
  seen: boolean;

  @ManyToOne(() => User, (user) => user.messages, {
    cascade: ['insert', 'update'],
  })
  @JoinColumn()
  author: User;

  @ManyToOne(() => Friendship, (friendship) => friendship.messages, {
    onDelete: 'CASCADE',
  })
  conversation: Friendship;
}
