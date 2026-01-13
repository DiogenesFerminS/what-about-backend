import { Opinion } from 'src/opinions/entities/opinions.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Like {
  @PrimaryGeneratedColumn('uuid', {
    name: 'like_id',
  })
  id: string;

  @Column()
  userId: string;

  @Column()
  opinionId: string;

  @ManyToOne(() => User, (user) => user.likes)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Opinion, (opinion) => opinion.likes)
  @JoinColumn({ name: 'opinionId' })
  opinion: Opinion;
}
