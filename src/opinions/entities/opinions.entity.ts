import { Comment } from 'src/comments/entities/comment.entity';
import { Like } from 'src/likes/entities/like.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
  DeleteDateColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Opinion {
  @PrimaryGeneratedColumn('uuid', { name: 'opinion_id' })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'varchar', length: 2700 })
  content: string;

  @Column('varchar', { nullable: true, name: 'image_url' })
  imageUrl: string | null;

  @OneToMany(() => Like, (like) => like.opinion)
  likes: Like[];

  @OneToMany(() => Comment, (comment) => comment.opinion)
  comments: Comment[];

  @ManyToOne(() => Opinion, (opinion) => opinion.reposts, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'original_opinion_id' })
  @Index()
  originalOpinion: Opinion;

  @OneToMany(() => Opinion, (opinion) => opinion.originalOpinion)
  reposts: Opinion[];

  @Column('boolean', { default: false, name: 'is_edited' })
  isEdited: boolean;

  @DeleteDateColumn({ name: 'deleted_at', select: false })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  @Index()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.opinions, {
    onDelete: 'CASCADE',
  })
  user: User;
}
