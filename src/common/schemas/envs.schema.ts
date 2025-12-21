import Joi from 'joi';

export const envs = Joi.object({
  PORT: Joi.number().port().required(),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASS: Joi.string().required(),
  POSTGRES_NAME: Joi.string().required(),
  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.number().port().required(),
  JWT_SECRET: Joi.string().required(),
  ROUND_OF_SALT: Joi.number().required(),
});

export interface Envs {
  PORT: number;
  POSTGRES_USER: string;
  POSTGRES_PASS: string;
  POSTGRES_NAME: string;
  POSTGRES_HOST: string;
  POSTGRES_PORT: number;
  JWT_SECRET: string;
  ROUND_OF_SALT: number;
}
