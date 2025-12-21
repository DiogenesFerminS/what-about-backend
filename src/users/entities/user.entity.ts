import {
  Column,
  CreateDateColumn,
  Entity,
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
  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true, length: 160, type: 'varchar' })
  bio?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ nullable: true })
  location?: string;

  // STATE
  @Column({ default: false, name: 'is_verified' })
  isVerified: boolean;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ default: null, nullable: true, name: 'verify_token', type: 'text' })
  verifyToken: string | null;

  //TIMESTAMPS
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
