import { Comment } from 'src/comments/entities/comment.entity';
import { Follow } from 'src/follows/entities/follow.entity';
import { Like } from 'src/likes/entities/like.entity';
import { Opinion } from 'src/opinions/entities/opinions.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  // REQUIRED - AUTH
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, length: 16, type: 'varchar' })
  username: string;

  @Column({ type: 'text', select: false })
  password: string;

  //PROFILE
  @Column({ nullable: true, type: 'varchar', length: 16 })
  name: string | null;

  @Column({ nullable: true, length: 160, type: 'varchar' })
  bio: string | null;

  @Column({ nullable: true, type: 'text' })
  avatarUrl: string | null;

  @Column({ nullable: true, type: 'varchar', length: 60 })
  location: string | null;

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @OneToMany(() => Follow, (follow) => follow.following)
  followers: Follow[];

  @OneToMany(() => Follow, (follow) => follow.follower)
  following: Follow[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  // STATE
  @Column({ default: false, name: 'is_verified' })
  isVerified: boolean;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({
    default: null,
    nullable: true,
    name: 'verify_token',
    type: 'text',
    unique: true,
  })
  verifyToken: string | null;

  @Column({
    default: null,
    nullable: true,
    name: 'reset_password_token',
    type: 'text',
    unique: true,
  })
  resetPasswordToken: string | null;

  @OneToMany(() => Opinion, (opinion) => opinion.user)
  opinions: Opinion[];

  //TIMESTAMPS
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
