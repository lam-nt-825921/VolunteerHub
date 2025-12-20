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
      // Sử dụng streamifier để chuyển buffer thành stream và pipe vào uploadStream
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  /**
   * Upload nhiều ảnh cùng lúc
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
   * Extract public_id từ URL và xóa
   */
  async deleteImage(imageUrl: string): Promise<void> {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
      return;
    }

    try {
      // Extract public_id từ Cloudinary URL
      // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
      // Hoặc: https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}.{format}
      // Hoặc có transformations: .../upload/{transformations}/{public_id}.{format}
      const urlParts = imageUrl.split('/');
      const uploadIndex = urlParts.findIndex((part) => part === 'upload');
      
      if (uploadIndex === -1) {
        // Không phải Cloudinary URL hợp lệ
        return;
      }

      // Lấy phần sau 'upload'
      const afterUpload = urlParts.slice(uploadIndex + 1);
      
      // Tìm phần cuối cùng (public_id + extension)
      // Bỏ qua các transformations (v1_, w_500, h_300, etc.)
      let publicIdWithExt = afterUpload[afterUpload.length - 1];
      
      // Loại bỏ extension (.jpg, .png, .webp, etc.)
      const lastDotIndex = publicIdWithExt.lastIndexOf('.');
      if (lastDotIndex !== -1) {
        publicIdWithExt = publicIdWithExt.substring(0, lastDotIndex);
      }

      // Nếu có version (v1234567890), bỏ qua nó
      // public_id có thể là: v1234567890/folder/image hoặc folder/image
      let publicId = publicIdWithExt;
      if (afterUpload.length > 1) {
        // Có thể có version hoặc transformations, lấy phần cuối cùng
        // Nhưng nếu phần đầu là số (version), bỏ qua
        const firstPart = afterUpload[0];
        if (/^v\d+$/.test(firstPart)) {
          // Có version, bỏ qua phần đầu
          publicId = afterUpload.slice(1).join('/');
          // Loại bỏ extension nếu có
          const dotIndex = publicId.lastIndexOf('.');
          if (dotIndex !== -1) {
            publicId = publicId.substring(0, dotIndex);
          }
        } else {
          // Không có version, lấy tất cả trừ extension
          publicId = afterUpload.join('/');
          const dotIndex = publicId.lastIndexOf('.');
          if (dotIndex !== -1) {
            publicId = publicId.substring(0, dotIndex);
          }
        }
      }

      // Xóa ảnh từ Cloudinary
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      // Log lỗi nhưng không throw để không ảnh hưởng đến flow chính
      console.error('Error deleting image from Cloudinary:', error);
    }
  }
}