// src/posts/posts.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/request/create-post.dto';
import { UpdatePostDto } from './dto/request/update-post.dto';
import { FilterPostsDto } from './dto/request/filter-posts.dto';
import { CreateCommentDto } from './dto/request/create-comment.dto';
import { UpdateCommentDto } from './dto/request/update-comment.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';
import { EventPermissions } from '../common/decorators/event-permissions.decorator';
import { EventPermissionsGuard } from '../auth/guards/event-permissions.guard';
import { EventPermission } from '../common/utils/event-permissions.util';
import { Public } from '../common/decorators/public.decorator';
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
  @Get('events/:eventId/posts')
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách posts của một sự kiện (có phân trang)' })
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
   * Tạo post mới trong event
   * POST /events/:eventId/posts
   */
  @Post('events/:eventId/posts')
  @Roles(Role.VOLUNTEER, Role.EVENT_MANAGER, Role.ADMIN)
  @UseGuards(EventPermissionsGuard)
  @EventPermissions(EventPermission.POST_CREATE)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Tạo post mới trong sự kiện' })
  @ApiResponse({
    status: 201,
    description: 'Tạo post thành công, trả về thông tin post',
    type: PostResponseDto,
  })
  async createPost(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() dto: CreatePostDto,
    @CurrentUser() user: Actor,
  ) {
    return this.postsService.createPost(eventId, dto, user);
  }

  /**
   * Chi tiết 1 post
   * GET /posts/:postId
   */
  @Get('posts/:postId')
  @Public()
  @ApiOperation({ summary: 'Lấy chi tiết một post' })
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
  async updatePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() dto: UpdatePostDto,
    @CurrentUser() user: Actor,
  ) {
    return this.postsService.updatePost(postId, dto, user);
  }

  /**
   * Xóa post
   * DELETE /posts/:postId
   */
  @Delete('posts/:postId')
  @Roles(Role.VOLUNTEER, Role.EVENT_MANAGER, Role.ADMIN)
  async deletePost(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser() user: Actor,
  ) {
    return this.postsService.deletePost(postId, user);
  }

  /**
   * Pin/Unpin post
   * PATCH /posts/:postId/pin
   */
  @Patch('posts/:postId/pin')
  @Roles(Role.VOLUNTEER, Role.EVENT_MANAGER, Role.ADMIN)
  @UseGuards(EventPermissionsGuard)
  @EventPermissions(EventPermission.POST_APPROVE)
  async pinPost(
    @Param('postId', ParseIntPipe) postId: number,
    @Body('isPinned') isPinned: boolean,
    @CurrentUser() user: Actor,
  ) {
    return this.postsService.pinPost(postId, isPinned, user);
  }

  /**
   * Like post
   * POST /posts/:postId/like
   */
  @Post('posts/:postId/like')
  @Roles(Role.VOLUNTEER, Role.EVENT_MANAGER, Role.ADMIN)
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
  async unlikePost(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser() user: Actor,
  ) {
    return this.postsService.unlikePost(postId, user);
  }

  /**
   * Danh sách comments của 1 post
   * GET /posts/:postId/comments
   */
  @Get('posts/:postId/comments')
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách comments của một post' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách comments của post',
    type: CommentResponseDto,
    isArray: true,
  })
  async getCommentsForPost(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser() user: Actor | null,
  ) {
    return this.postsService.getCommentsForPost(postId, user);
  }

  /**
   * Tạo comment/reply
   * POST /posts/:postId/comments
   */
  @Post('posts/:postId/comments')
  @Roles(Role.VOLUNTEER, Role.EVENT_MANAGER, Role.ADMIN)
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
  async deleteComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @CurrentUser() user: Actor,
  ) {
    return this.postsService.deleteComment(commentId, user);
  }
}

