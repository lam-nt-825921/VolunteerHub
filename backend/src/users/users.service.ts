// src/users/users.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UpdateProfileDto } from './dto/request/update-profile.dto';
import { UpdateUserDto } from './dto/request/update-user.dto';
import { FilterUsersDto } from './dto/request/filter-users.dto';
import { CreateUserDto } from './dto/request/create-user.dto';
import { UserProfileDto } from './dto/response/users-profile.response';
import { plainToInstance } from 'class-transformer';
import { Role } from '../generated/prisma/enums';
import * as bcrypt from 'bcrypt';


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

    // 1. Lấy thông tin user hiện tại để có avatar cũ
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    // 2. Nếu có file ảnh, xóa ảnh cũ và upload ảnh mới lên Cloudinary
    if (file) {
      // Xóa ảnh cũ trước khi upload ảnh mới
      if (currentUser?.avatar) {
        await this.cloudinary.deleteImage(currentUser.avatar);
      }
      
      const uploadResult = await this.cloudinary.uploadImage(file);
      avatarUrl = uploadResult.secure_url;
    }

    // 3. Cập nhật vào Database
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...dto,
        ...(avatarUrl && { avatar: avatarUrl }), // Chỉ update avatar nếu có upload mới
      },
    });

    // 4. Trả về kết quả (đã lọc password)
    return plainToInstance(UserProfileDto, updatedUser);
  }

  async createManager(dto: CreateUserDto): Promise<UserProfileDto> {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email đã tồn tại');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        fullName: dto.fullName,
        role: dto.role || Role.EVENT_MANAGER,
        isActive: true,
      },
    });
    return plainToInstance(UserProfileDto, newUser);
  }

  async updateRole(userId: number, role: Role): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role: role },
    });
    return plainToInstance(UserProfileDto, updatedUser);
  }

  // Admin: Lấy danh sách users với filter và pagination
  async findAll(filter: FilterUsersDto) {
    const where: any = {};

    // Filter theo keyword (email hoặc fullName)
    // PostgreSQL hỗ trợ case-insensitive search với mode: 'insensitive'
    if (filter.keyword) {
      const keyword = filter.keyword.trim();
      where.OR = [
        { email: { contains: keyword, mode: 'insensitive' } },
        { fullName: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    // Filter theo role
    if (filter.role) {
      where.role = filter.role;
    }

    // Filter theo isActive
    if (filter.isActive !== undefined) {
      where.isActive = filter.isActive;
    }

    // Pagination
    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const skip = (page - 1) * limit;

    // Query
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'asc' },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true,
          avatar: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
          reputationScore: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((user) => plainToInstance(UserProfileDto, user)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Admin: Lấy chi tiết 1 user
  async findOne(userId: number): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return plainToInstance(UserProfileDto, user);
  }

  // Admin: Cập nhật user
  async updateUser(userId: number, dto: UpdateUserDto): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
    return plainToInstance(UserProfileDto, updatedUser);
  }

  // Admin: Xóa user (soft delete bằng cách set isActive = false)
  async deleteUser(userId: number): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return { message: 'User đã được vô hiệu hóa thành công' };
  }

  // Admin: Kích hoạt/vô hiệu hóa user
  async toggleActive(userId: number, isActive: boolean): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });
    return plainToInstance(UserProfileDto, updatedUser);
  }
}