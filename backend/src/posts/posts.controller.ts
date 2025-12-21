// src/posts/posts.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/request/create-post.dto';
import { UpdatePostDto } from './dto/request/update-post.dto';
import { FilterPostsDto } from './dto/request/filter-posts.dto';
import { CreateCommentDto } from './dto/request/create-comment.dto';
import { UpdateCommentDto } from './dto/request/update-comment.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, PostStatus } from '../generated/prisma/enums';
import { EventPermissions } from '../common/decorators/event-permissions.decorator';
import { EventPermissionsGuard } from '../auth/guards/event-permissions.guard';
import { EventPermission } from '../common/utils/event-permissions.util';
import { Public } from '../common/decorators/public.decorator';
import { AuthOptional } from '../common/decorators/auth-optional.decorator';
import { PostResponseDto } from './dto/response/post-response.dto';
import { CommentResponseDto } from './dto/response/comment-response.dto';

interface Actor {
  id: number;
  role: Role;
}


@ApiTags('posts')
@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   * Danh sách posts trong event (có pagination)
   * GET /events/:eventId/posts
   */
  /**
   * Lấy danh sách posts của một sự kiện (có thể xem không cần đăng nhập, nhưng cần token để xem likedByCurrentUser)
   * @param eventId - ID của sự kiện
   * @param filter - Bộ lọc posts (type, isPinned, page, limit)
   * @param user - Người dùng hiện tại (có thể null nếu chưa đăng nhập)
   * @returns Danh sách posts với phân trang
   */
  @Get('events/:eventId/posts')
  @AuthOptional()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy danh sách posts của một sự kiện (có phân trang, có thể xem không cần đăng nhập, nhưng cần token để xem likedByCurrentUser)' })
  @ApiResponse({
    status: 200,
    description:
      'Danh sách posts trong sự kiện. Ví dụ response: [ { \"id\": 1, \"content\": \"Hôm nay sự kiện rất vui\", \"images\": [...], ... } ]',
    type: PostResponseDto,
    isArray: true,
  })
  async getPostsForEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Query() filter: FilterPostsDto,
    @CurrentUser() user: Actor | null,
  ) {
    return this.postsService.getPostsForEvent(eventId, filter, user);
  }

  /**
   * Tạo post mới trong event (có thể upload nhiều ảnh, tối đa 10 ảnh)
   * @param eventId - ID của sự kiện
   * @param dto - Thông tin post cần tạo
   * @param files - Mảng file ảnh (tối đa 10 ảnh)
   * @param user - Người dùng hiện tại
   * @returns Post đã tạo
   */
  @Post('events/:eventId/posts')
  @Roles(Role.VOLUNTEER, Role.EVENT_MANAGER, Role.ADMIN)
  @UseGuards(EventPermissionsGuard)
  @EventPermissions(EventPermission.POST_CREATE)
  @UseInterceptors(FilesInterceptor('images', 10)) // Tối đa 10 ảnh
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Tạo post mới trong sự kiện (có thể upload nhiều ảnh)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          example: 'Hôm nay sự kiện diễn ra rất thành công! Cảm ơn tất cả mọi người đã tham gia.',
          description: 'Nội dung bài đăng',
        },
        type: {
          type: 'string',
          enum: ['DISCUSSION', 'ANNOUNCEMENT', 'UPDATE'],
          example: 'DISCUSSION',
          description: 'Loại bài đăng',
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Mảng ảnh (tối đa 10 ảnh) - JPG, PNG',
        },
      },
      required: ['content'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo post thành công, trả về thông tin post',
    type: PostResponseDto,
  })
  async createPost(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() dto: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: Actor,
  ) {
    return this.postsService.createPost(eventId, dto, user, files);
  }

  /**
   * Lấy chi tiết một post (có thể xem không cần đăng nhập, nhưng cần token để xem likedByCurrentUser)
   * @param postId - ID của post
   * @param user - Người dùng hiện tại (có thể null nếu chưa đăng nhập)
   * @returns Chi tiết post
   */
  @Get('posts/:postId')
  @AuthOptional()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy chi tiết một post (có thể xem không cần đăng nhập, nhưng cần token để xem likedByCurrentUser)' })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết post',
    type: PostResponseDto,
  })
  async getPostById(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser() user: Actor | null,
  ) {
    return this.postsService.getPostById(postId, user);
  }

  /**
   * Cập nhật post (có thể upload ảnh mới - tối đa 10 ảnh, tùy chọn)
   * Nếu có ảnh mới sẽ thay thế ảnh cũ, nếu không thì giữ nguyên ảnh cũ
   * @param postId - ID của post cần cập nhật
   * @param dto - Thông tin cần cập nhật
   * @param files - Mảng file ảnh mới (tối đa 10 ảnh, tùy chọn)
   * @param user - Người dùng hiện tại
   * @returns Post đã được cập nhật
   */
  @Patch('posts/:postId')
  @Roles(Role.VOLUNTEER, Role.EVENT_MANAGER, Role.ADMIN)
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cập nhật post (có thể upload ảnh mới - tùy chọn)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          example: 'Nội dung đã được cập nhật',
          description: 'Nội dung bài đăng',
        },
        type: {
          type: 'string',
          enum: ['DISCUSSION', 'ANNOUNCEMENT', 'UPDATE'],
          example: 'DISCUSSION',
          description: 'Loại bài đăng',
        },
        isPinned: {
          type: 'boolean',
          example: false,
          description: 'Ghim bài đăng (chỉ event creator hoặc có quyền POST_APPROVE)',
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Mảng ảnh mới (tối đa 10 ảnh) - Tùy chọn. Nếu không gửi, giữ nguyên ảnh cũ',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật post thành công',
    type: PostResponseDto,
  })
  async updatePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() dto: UpdatePostDto,
    @UploadedFiles() files: Express.Multer.File[] | undefined,
    @CurrentUser() user: Actor,
  ) {
    return this.postsService.updatePost(postId, dto, user, files);
  }

  /**
   * Xóa post (chỉ author hoặc có quyền POST_REMOVE_OTHERS)
   * @param postId - ID của post cần xóa
   * @param user - Người dùng hiện tại
   * @returns Thông báo xóa thành công
   */
  @Delete('posts/:postId')
  @Roles(Role.VOLUNTEER, Role.EVENT_MANAGER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Xóa post' })
  @ApiResponse({ status: 200, description: 'Xóa post thành công' })
  async deletePost(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser() user: Actor,
  ) {
    return this.postsService.deletePost(postId, user);
  }

  /**
   * Toggle pin/unpin post (tự động đảo ngược trạng thái pin)
   * Chỉ người có quyền POST_APPROVE mới được phép
   * @param postId - ID của post
   * @param user - Người dùng hiện tại
   * @returns Post đã được toggle pin
   */
  @Patch('posts/:postId/pin')
  @Roles(Role.VOLUNTEER, Role.EVENT_MANAGER, Role.ADMIN)
  @UseGuards(EventPermissionsGuard)
  @EventPermissions(EventPermission.POST_APPROVE)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle pin/unpin post (tự động đảo ngược trạng thái pin, chỉ người có quyền POST_APPROVE)' })
  @ApiResponse({
    status: 200,
    description: 'Toggle pin/unpin post thành công',
    type: PostResponseDto,
  })
  async pinPost(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser() user: Actor,
  ) {
    return this.postsService.pinPost(postId, user);
  }

  /**
   * Duyệt hoặc từ chối post (chỉ người có quyền POST_APPROVE)
   * @param postId - ID của post
   * @param status - Trạng thái mới: 'APPROVED' hoặc 'REJECTED'
   * @param user - Người dùng hiện tại
   * @returns Post đã được duyệt/từ chối
   */
  @Patch('posts/:postId/approve')
  @Roles(Role.VOLUNTEER, Role.EVENT_MANAGER, Role.ADMIN)
  @UseGuards(EventPermissionsGuard)
  @EventPermissions(EventPermission.POST_APPROVE)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Duyệt bài đăng (chỉ người có quyền POST_APPROVE)' })
  @ApiResponse({
    status: 200,
    description: 'Đã duyệt bài đăng thành công',
    type: PostResponseDto,
  })
  async approvePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Body('status') status: 'APPROVED' | 'REJECTED',
    @CurrentUser() user: Actor,
  ) {
    return this.postsService.approvePost(postId, status, user);
  }

  /**
   * Like một post
   * @param postId - ID của post
   * @param user - Người dùng hiện tại
   * @returns Thông báo like thành công
   */
  @Post('posts/:postId/like')
  @Roles(Role.VOLUNTEER, Role.EVENT_MANAGER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Like một bài đăng' })
  @ApiResponse({
    status: 200,
    description: 'Like thành công',
    type: PostResponseDto,
  })
  async likePost(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser() user: Actor,
  ) {
    return this.postsService.likePost(postId, user);
  }

  /**
   * Unlike một post
   * @param postId - ID của post
   * @param user - Người dùng hiện tại
   * @returns Thông báo unlike thành công
   */
  @Delete('posts/:postId/like')
  @Roles(Role.VOLUNTEER, Role.EVENT_MANAGER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Unlike một bài đăng' })
  @ApiResponse({
    status: 200,
    description: 'Unlike thành công',
    type: PostResponseDto,
  })
  async unlikePost(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser() user: Actor,
  ) {
    return this.postsService.unlikePost(postId, user);
  }

  /**
   * Lấy danh sách comments của một post (yêu cầu đăng nhập)
   * Trả về nested replies (comments có parentId sẽ được nhóm vào parent comment)
   * @param postId - ID của post
   * @param user - Người dùng hiện tại
   * @returns Danh sách comments với nested replies
   */
  @Get('posts/:postId/comments')
  @Roles(Role.VOLUNTEER, Role.EVENT_MANAGER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy danh sách comments của một post (yêu cầu đăng nhập)' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách comments của post',
    type: CommentResponseDto,
    isArray: true,
  })
  async getCommentsForPost(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser() user: Actor,
  ) {
    return this.postsService.getCommentsForPost(postId, user);
  }

  /**
   * Tạo comment hoặc reply (nếu có parentId)
   * @param postId - ID của post
   * @param dto - Thông tin comment (content, parentId nếu là reply)
   * @param user - Người dùng hiện tại
   * @returns Comment đã tạo
   */
  @Post('posts/:postId/comments')
  @Roles(Role.VOLUNTEER, Role.EVENT_MANAGER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Tạo comment mới' })
  @ApiResponse({
    status: 201,
    description: 'Tạo comment thành công',
    type: CommentResponseDto,
  })
  async createComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: Actor,
  ) {
    return this.postsService.createComment(postId, dto, user);
  }

  /**
   * Cập nhật comment (chỉ author)
   * @param commentId - ID của comment
   * @param dto - Nội dung comment mới
   * @param user - Người dùng hiện tại
   * @returns Comment đã được cập nhật
   */
  @Patch('comments/:commentId')
  @Roles(Role.VOLUNTEER, Role.EVENT_MANAGER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cập nhật comment' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật comment thành công',
    type: CommentResponseDto,
  })
  async updateComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() dto: UpdateCommentDto,
    @CurrentUser() user: Actor,
  ) {
    return this.postsService.updateComment(commentId, dto, user);
  }

  /**
   * Xóa comment (author hoặc có quyền COMMENT_DELETE_OTHERS)
   * @param commentId - ID của comment
   * @param user - Người dùng hiện tại
   * @returns Thông báo xóa thành công
   */
  @Delete('comments/:commentId')
  @Roles(Role.VOLUNTEER, Role.EVENT_MANAGER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Xóa comment' })
  @ApiResponse({ status: 200, description: 'Xóa comment thành công' })
  async deleteComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @CurrentUser() user: Actor,
  ) {
    return this.postsService.deleteComment(commentId, user);
  }
}

