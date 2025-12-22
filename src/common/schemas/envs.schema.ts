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
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().port().required(),
  SMTP_USER: Joi.string().required(),
  SMTP_PASS: Joi.string().required(),
  SMTP_SECURE: Joi.boolean().required(),
  SMTP_FROM: Joi.string().required(),
  FRONTEND_URL: Joi.string().required(),
  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),
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
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;
  SMTP_SECURE: boolean;
  SMTP_FROM: string;
  FRONTEND_URL: string;
  CLOUDINARY_API_SECRET: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_CLOUD_NAME: string;
}
