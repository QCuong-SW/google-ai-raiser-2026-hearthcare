import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../user/user.entity';

@Entity('feedbacks')
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'sender_name' })
  senderName!: string;

  @Column({ name: 'sender_phone' })
  senderPhone!: string;

  @Column('text')
  content!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(
    () => User,
    (user) => user.feedbacks,
    {
      onDelete: 'SET NULL',
      nullable: true,
    }
  )
  @JoinColumn({ name: 'user_id' })
  user!: User;
}