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
} from 'typeorm';

@Entity()
export class Opinion {
  @PrimaryGeneratedColumn('uuid', { name: 'opinion_id' })
  id: string;

  @Column({ type: 'varchar', length: 500 })
  content: string;

  @Column('varchar', { nullable: true, name: 'image_url' })
  imageUrl: string | null;

  @OneToMany(() => Like, (like) => like.opinion)
  likes: Like[];

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
