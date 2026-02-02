import { Opinion } from 'src/opinions/entities/opinions.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid', { name: 'tag_id' })
  id: string;

  @Column({ unique: true, type: 'text' })
  name: string;

  @Column({ type: 'int', default: 0 })
  count: number;

  @ManyToMany(() => Opinion, (opinion) => opinion.tags)
  opinion: Opinion[];
}
