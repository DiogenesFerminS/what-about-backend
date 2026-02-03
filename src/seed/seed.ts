import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../users/entities/user.entity';
import { Opinion } from '../opinions/entities/opinions.entity';
import { Like } from '../likes/entities/like.entity';
import { Tag } from '../tags/entities/tag.entity';
import { Follow } from '../follows/entities/follow.entity';
import { SEED_USERS } from './data/seed_users';
import * as bcrypt from 'bcrypt';
import { OPINION_TEMPLATES } from './data/seed_opinions';
import { Comment } from 'src/comments/entities/comment.entity';

dotenv.config();

const runSeed = async () => {
  const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
    username: process.env.POSTGRES_USER,
    password: String(process.env.POSTGRES_PASS),
    database: process.env.POSTGRES_NAME,
    entities: [User, Opinion, Comment, Like, Tag, Follow],
  });

  await AppDataSource.initialize();

  const usersRepository = AppDataSource.getRepository(User);
  const opinionsRepository = AppDataSource.getRepository(Opinion);

  await AppDataSource.query(
    `TRUNCATE TABLE "tags", "user", "opinion", "opinion_tags" CASCADE`,
  );

  const roundOfSalt = process.env.ROUND_OF_SALT ?? '10';

  const seedUsers = SEED_USERS.map(async (user) => {
    const passwordHashed = await bcrypt.hash(user.password, +roundOfSalt);
    return {
      ...user,
      password: passwordHashed,
    };
  });

  const users = await Promise.all(seedUsers);
  const savedUsers = await usersRepository.save(users);

  const entitiesOpinions = OPINION_TEMPLATES.map((op) => {
    const randomIndex = Math.floor(Math.random() * 6);
    const user = savedUsers[randomIndex];

    return opinionsRepository.create({
      content: op.content,
      title: op.title,
      imageUrl: op.imageIndex,
      user: user,
    });
  });

  await opinionsRepository.save(entitiesOpinions);

  console.log('Conectado');
  await AppDataSource.destroy();
};

runSeed().catch((err) => console.error(err));
