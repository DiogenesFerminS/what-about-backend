import { updatedOpinionDto } from '../dto/update-opinion.dto';
import { type Express } from 'express';

export interface updateOpinionParams {
  id: string;
  file: Express.Multer.File | undefined;
  updatedOpinionDto: updatedOpinionDto;
  userId: string;
}
