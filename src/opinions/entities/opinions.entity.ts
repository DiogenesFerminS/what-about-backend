import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
  DeleteDateColumn,
} from 'typeorm';

@Entity()
export class Opinion {
  @PrimaryGeneratedColumn('uuid', { name: 'opinion_id' })
  id: string;

  @Column({ type: 'varchar', length: 500 })
  content: string;

  @Column('varchar', { nullable: true, name: 'image_url' })
  imageUrl?: string | null;

  @Column('boolean', { default: false, name: 'is_edited' })
  isEdited: boolean;

  @DeleteDateColumn({ name: 'deleted_at', select: false })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.opinions, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
