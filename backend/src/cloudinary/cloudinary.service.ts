// src/cloudinary/cloudinary.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

/**
 * Service để xử lý upload ảnh lên Cloudinary
 */
@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {}

  private isCloudinaryConfigured(): boolean {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');
    return !!(cloudName && apiKey && apiSecret);
  }

  uploadImage(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse> {
    // Check if Cloudinary is configured
    if (!this.isCloudinaryConfigured()) {
      throw new BadRequestException(
        'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file. Cloudinary is optional - you can skip image uploads if not needed.',
      );
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'volunteer-hub-avatars', 
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('No result from Cloudinary'));
          resolve(result);
        },
      );    
      // Sử dụng streamifier để chuyển buffer thành stream và pipe vào uploadStream
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}