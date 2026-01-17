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
    folder: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: folder }, (error, uploadResult) => {
          if (error) {
            return reject(new Error('Error uploading to Cloudinary'));
          }

          if (!uploadResult) {
            return reject(
              new Error(
                'Cloudinary uploaded the file but returned no results.',
              ),
            );
          }

          return resolve(uploadResult);
        })
        .end(file.buffer);
    });
  }

  async deleteImage(publicId: string) {
    try {
      const response = (await cloudinary.uploader.destroy(publicId)) as {
        result: 'ok' | 'not found';
      };
      return response;
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      return null;
    }
  }
}
