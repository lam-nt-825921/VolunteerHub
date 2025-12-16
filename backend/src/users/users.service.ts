// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfileDto } from './dto/users-profile.response';
import { plainToInstance } from 'class-transformer';


@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  // Lấy thông tin user
  async getProfile(userId: number): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');
    
    // tạo response DTO
    return plainToInstance(UserProfileDto, user);
    
  }

  // Cập nhật profile
  async updateProfile(userId: number, dto: UpdateProfileDto, file?: Express.Multer.File) {
    let avatarUrl = undefined;

    // 1. Nếu có file ảnh, upload lên Cloudinary
    if (file) {
      const uploadResult = await this.cloudinary.uploadImage(file);
      avatarUrl = uploadResult.secure_url;
    }

    // 2. Cập nhật vào Database
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...dto,
        ...(avatarUrl && { avatar: avatarUrl }), // Chỉ update avatar nếu có upload mới
      },
    });

    // 3. Trả về kết quả (đã lọc password)
    return plainToInstance(UserProfileDto, updatedUser);
  }
}