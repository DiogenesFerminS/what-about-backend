import { Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';
import { type Express } from 'express';

@Injectable()
export class CloudinaryService {
  uploadFile(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: 'what-about-opinions-assets' },
          (error, uploadResult) => {
            if (error) {
              return reject(new Error('Error al subir a Cloudinary'));
            }

            if (!uploadResult) {
              return reject(
                new Error(
                  'Cloudinary subió el archivo pero no devolvió resultados.',
                ),
              );
            }

            return resolve(uploadResult);
          },
        )
        .end(file.buffer);
    });
  }
}
