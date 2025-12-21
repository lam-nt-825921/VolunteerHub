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
  /**
   * Upload ảnh lên Cloudinary
   * @param file - File ảnh từ multer
   * @param folder - Thư mục trên Cloudinary để lưu ảnh (mặc định: 'volunteer-hub-avatars')
   * @returns Promise với kết quả upload từ Cloudinary
   */
  uploadImage(
    file: Express.Multer.File,
    folder: string = 'volunteer-hub-avatars',
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('No result from Cloudinary'));
          resolve(result);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  /**
   * Upload nhiều ảnh cùng lúc
   * @param files - Mảng các file ảnh từ multer
   * @param folder - Thư mục trên Cloudinary để lưu ảnh (mặc định: 'volunteer-hub-posts')
   * @returns Promise với mảng các URL ảnh đã upload
   */
  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: string = 'volunteer-hub-posts',
  ): Promise<string[]> {
    const uploadPromises = files.map((file) =>
      this.uploadImage(file, folder).then((result) => result.secure_url),
    );
    return Promise.all(uploadPromises);
  }

  /**
   * Xóa ảnh từ Cloudinary bằng URL
   * Tự động extract public_id từ URL và xóa ảnh
   * @param imageUrl - URL của ảnh trên Cloudinary
   */
  async deleteImage(imageUrl: string): Promise<void> {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
      return;
    }

    try {
      const urlParts = imageUrl.split('/');
      const uploadIndex = urlParts.findIndex((part) => part === 'upload');
      
      if (uploadIndex === -1) {
        return;
      }

      const afterUpload = urlParts.slice(uploadIndex + 1);
      
      let publicIdWithExt = afterUpload[afterUpload.length - 1];
      
      const lastDotIndex = publicIdWithExt.lastIndexOf('.');
      if (lastDotIndex !== -1) {
        publicIdWithExt = publicIdWithExt.substring(0, lastDotIndex);
      }

      let publicId = publicIdWithExt;
      if (afterUpload.length > 1) {
        const firstPart = afterUpload[0];
        if (/^v\d+$/.test(firstPart)) {
          publicId = afterUpload.slice(1).join('/');
          const dotIndex = publicId.lastIndexOf('.');
          if (dotIndex !== -1) {
            publicId = publicId.substring(0, dotIndex);
          }
        } else {
          publicId = afterUpload.join('/');
          const dotIndex = publicId.lastIndexOf('.');
          if (dotIndex !== -1) {
            publicId = publicId.substring(0, dotIndex);
          }
        }
      }

      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
    }
  }
}