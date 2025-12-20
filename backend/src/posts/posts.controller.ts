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

const logger = new Logger('PostsController');

@ApiTags('posts')
@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   * Danh sách posts trong event (có pagination)
   * GET /events/:eventId/posts
   */
  @Get('events/:eventId/posts')
  @AuthOptional() // Cho phép xem không cần đăng nhập, nhưng nếu có token thì lấy user để check likedByCurrentUser
  @ApiBearerAuth('JWT-auth') // Swagger sẽ hiển thị nút Authorize (optional)
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
    logger.log(`[PostsController] getPostsForEvent called: eventId=${eventId}, user=${user ? `id=${user.id}, role=${user.role}` : 'null'}`);
    return this.postsService.getPostsForEvent(eventId, filter, user);
  }

  /**
   * Tạo post mới trong event
   * POST /events/:eventId/posts
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
   * Chi tiết 1 post
   * GET /posts/:postId
   */
  @Get('posts/:postId')
  @AuthOptional() // Cho phép xem không cần đăng nhập, nhưng nếu có token thì lấy user để check likedByCurrentUser
  @ApiBearerAuth('JWT-auth') // Swagger sẽ hiển thị nút Authorize (optional)
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
   * Sửa post
   * PATCH /posts/:postId
   */
  @Patch('posts/:postId')
  @Roles(Role.VOLUNTEER, Role.EVENT_MANAGER, Role.ADMIN)
  @UseInterceptors(FilesInterceptor('images', 10)) // Tối đa 10 ảnh - optional
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
   * Xóa post
   * DELETE /posts/:postId
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
   * Pin/Unpin post (toggle tự động)
   * PATCH /posts/:postId/pin
   * Tự động toggle: nếu đang true → false, nếu đang false → true
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
    logger.log(`[PostsController] pinPost called: postId=${postId}, userId=${user.id}`);
    return this.postsService.pinPost(postId, user);
  }

  /**
   * Duyệt hoặc từ chối post
   * PATCH /posts/:postId/approve
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
   * Like post
   * POST /posts/:postId/like
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
   * Unlike post
   * DELETE /posts/:postId/like
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
   * Danh sách comments của 1 post
   * GET /posts/:postId/comments
   * Yêu cầu đăng nhập
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
   * Tạo comment/reply
   * POST /posts/:postId/comments
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
   * Sửa comment
   * PATCH /comments/:commentId
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
   * Xóa comment
   * DELETE /comments/:commentId
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

