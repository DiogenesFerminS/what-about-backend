import { DataSource, In, Repository } from 'typeorm';
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
import { extractTags } from 'src/common/helpers/extractTags';
import { Logger } from '@nestjs/common';

dotenv.config();
const logger = new Logger('SEED');

const setupFullTextSearch = async (dataSource: DataSource) => {
  logger.log('Configuring Search Engine (Triggers & Extensions)...');

  await dataSource.query(`CREATE EXTENSION IF NOT EXISTS unaccent`);

  await dataSource.query(`
    CREATE OR REPLACE FUNCTION opinion_tsvector_trigger() RETURNS trigger AS $$
    BEGIN
      new."searchVector" := to_tsvector('spanish', unaccent(coalesce(new.title, '') || ' ' || coalesce(new.content, '')));
      RETURN new;
    END
    $$ LANGUAGE plpgsql;
  `);

  await dataSource.query(`DROP TRIGGER IF EXISTS tsvectorupdate ON "opinion"`);

  await dataSource.query(`
    CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
    ON "opinion" FOR EACH ROW EXECUTE PROCEDURE opinion_tsvector_trigger();
  `);

  logger.log('Search engine configured correctly.');
};

const getTags = async (content: string, tagsRepository: Repository<Tag>) => {
  const tagsNames = extractTags(content);
  if (tagsNames.length > 0) {
    const existingTags = await tagsRepository.find({
      where: { name: In(tagsNames) },
    });
    const existingTagsName = existingTags.map((tag) => tag.name);

    const newTags = tagsNames.filter((tag) => !existingTagsName.includes(tag));

    let newTagsEntities: Tag[] = [];
    if (newTags.length > 0) {
      newTagsEntities = newTags.map((tag) =>
        tagsRepository.create({ name: tag }),
      );
      await tagsRepository.save(newTagsEntities);
    }

    const allTags = [...existingTags, ...newTagsEntities];

    const allTagsIds = allTags.map((t) => t.id);
    await tagsRepository.increment({ id: In(allTagsIds) }, 'count', 1);

    return allTags;
  }
};

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
  await setupFullTextSearch(AppDataSource);

  logger.log('SEED INITIALIZED...');
  const usersRepository = AppDataSource.getRepository(User);
  const opinionsRepository = AppDataSource.getRepository(Opinion);
  const tagsRepository = AppDataSource.getRepository(Tag);

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

  const entitiesOpinions: Opinion[] = [];
  for (const opinion of OPINION_TEMPLATES) {
    const randomIndex = Math.floor(Math.random() * 6);
    const user = savedUsers[randomIndex];

    const tags = await getTags(opinion.content, tagsRepository);

    const newOpinion = opinionsRepository.create({
      content: opinion.content,
      title: opinion.title,
      imageUrl: opinion.imageIndex,
      tags: tags,
      user,
    });

    entitiesOpinions.push(newOpinion);
  }

  await opinionsRepository.save(entitiesOpinions);

  logger.log('SEED COMPLETED');
  await AppDataSource.destroy();
};

runSeed().catch((err) => logger.error(err));
