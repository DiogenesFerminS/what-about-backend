import { Opinion } from 'src/opinions/entities/opinions.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum NotificationType {
  LIKE = 'LIKE',
  FOLLOW = 'FOLLOW',
  REPOST = 'REPOST',
}

@Entity()
@Index('IDX_UNREAD_NOTIFICATIONS', ['owner'], { where: '"isRead" = false' })
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  owner: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  creator: User;

  @ManyToOne(() => Opinion, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'opinionId' })
  opinion: Opinion;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
