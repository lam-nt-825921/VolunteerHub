// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UpdateProfileDto } from './dto/request/update-profile.dto';
import { UserProfileDto } from './dto/response/users-profile.response';
import { plainToInstance } from 'class-transformer';
import { Role } from 'src/generated/prisma/enums';


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

  async createManager(dto: any) : Promise<UserProfileDto> {
    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: dto.password, // Lưu ý: cần hash password trước khi lưu vào DB
        fullName: dto.fullName,
        role: dto.role || 'EVENT_MANAGER', // Mặc định là EVENT_MANAGER nếu không có role
        isActive: true,
      },
    });
    return plainToInstance(UserProfileDto, newUser);
  }

  async updateRole(userId: number, role: Role): Promise<UserProfileDto> {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role: role },
    });
    return plainToInstance(UserProfileDto, updatedUser);
  }
}