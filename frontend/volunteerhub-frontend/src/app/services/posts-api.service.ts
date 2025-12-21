/**
 * Posts API Service
 * Handles all post and comment related API calls
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_CONFIG } from './api.config';

// ============ ENUMS ============
export type PostType = 'DISCUSSION' | 'ANNOUNCEMENT';
export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ATTENDED' | 'KICKED' | 'LEFT';

// ============ INTERFACES ============

export interface AuthorSummary {
  id: number;
  fullName: string;
  avatar: string | null;
  reputationScore?: number;
}

export type PostStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Post {
  id: number;
  content: string;
  images: string[];
  type: PostType;
  status?: PostStatus; // Only included for users with POST_APPROVE permission
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  eventId: number;
  author: AuthorSummary;
  commentsCount: number;
  likesCount: number;
  likedByCurrentUser: boolean;
}

export interface CommentAuthor {
  id: number;
  fullName: string;
  avatar: string | null;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  parentId: number | null;
  postId: number;
  author: CommentAuthor;
  replies?: Comment[];
}

// ============ REQUEST DTOs ============

export interface CreatePostRequest {
  content: string;
  images?: string[];
  type?: PostType;
}

export interface UpdatePostRequest {
  content?: string;
  images?: string[];
  type?: PostType;
  isPinned?: boolean;
}

export interface FilterPostsRequest {
  type?: PostType;
  isPinned?: boolean;
  status?: PostStatus; // Only works for users with POST_APPROVE permission
  page?: number;
  limit?: number;
}

export interface CreateCommentRequest {
  content: string;
  parentId?: number;
}

export interface UpdateCommentRequest {
  content: string;
}

// ============ RESPONSE TYPES ============

export interface PaginatedPostsResponse {
  data: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Posts API Service
 */
@Injectable({
  providedIn: 'root'
})
export class PostsApiService {
  constructor(private apiService: ApiService) {}

  /**
   * Get posts for an event (with pagination)
   * GET /events/:eventId/posts
   */
  getPostsForEvent(eventId: number, filter?: FilterPostsRequest): Observable<Post[] | PaginatedPostsResponse> {
    const url = API_CONFIG.endpoints.posts.forEvent.replace(':eventId', eventId.toString());
    const queryString = this.buildQueryString(filter);
    // Pass true to include auth token so backend can populate likedByCurrentUser correctly
    return this.apiService.get<Post[] | PaginatedPostsResponse>(`${url}${queryString}`, true);
  }

  /**
   * Create a new post in an event
   * POST /events/:eventId/posts
   */
  createPost(eventId: number, data: CreatePostRequest, files?: File[]): Observable<Post> {
    const url = API_CONFIG.endpoints.posts.forEvent.replace(':eventId', eventId.toString());
    
    // If files are provided, use FormData; otherwise use JSON
    if (files && files.length > 0) {
      const formData = new FormData();
      formData.append('content', data.content);
      if (data.type) {
        formData.append('type', data.type);
      }
      // Append each file with the field name 'images' (backend expects this)
      files.forEach(file => {
        formData.append('images', file);
      });
      return this.apiService.post<Post>(url, formData, true, true);
    } else {
      return this.apiService.post<Post>(url, data, true);
    }
  }

  /**
   * Get a single post by ID
   * GET /posts/:postId
   */
  getPostById(postId: number, authenticated: boolean = true): Observable<Post> {
    const url = API_CONFIG.endpoints.posts.byId.replace(':postId', postId.toString());
    return this.apiService.get<Post>(url, authenticated);
  }

  /**
   * Update a post
   * PATCH /posts/:postId
   */
  updatePost(postId: number, data: UpdatePostRequest): Observable<Post> {
    const url = API_CONFIG.endpoints.posts.byId.replace(':postId', postId.toString());
    return this.apiService.patch<Post>(url, data, true);
  }

  /**
   * Delete a post
   * DELETE /posts/:postId
   */
  deletePost(postId: number): Observable<{ message: string }> {
    const url = API_CONFIG.endpoints.posts.byId.replace(':postId', postId.toString());
    return this.apiService.delete<{ message: string }>(url, true);
  }

  /**
   * Pin/unpin a post
   * PATCH /posts/:postId/pin
   */
  pinPost(postId: number, isPinned: boolean): Observable<Post> {
    const url = API_CONFIG.endpoints.posts.pin.replace(':postId', postId.toString());
    return this.apiService.patch<Post>(url, { isPinned }, true);
  }

  /**
   * Like a post
   * POST /posts/:postId/like
   */
  likePost(postId: number): Observable<{ message: string }> {
    const url = API_CONFIG.endpoints.posts.like.replace(':postId', postId.toString());
    return this.apiService.post<{ message: string }>(url, {}, true);
  }

  /**
   * Unlike a post
   * DELETE /posts/:postId/like
   */
  unlikePost(postId: number): Observable<{ message: string }> {
    const url = API_CONFIG.endpoints.posts.like.replace(':postId', postId.toString());
    return this.apiService.delete<{ message: string }>(url, true);
  }

  /**
   * Get comments for a post
   * GET /posts/:postId/comments
   */
  getCommentsForPost(postId: number, authenticated: boolean = true): Observable<Comment[]> {
    const url = API_CONFIG.endpoints.posts.comments.replace(':postId', postId.toString());
    return this.apiService.get<Comment[]>(url, authenticated);
  }

  /**
   * Create a comment/reply
   * POST /posts/:postId/comments
   */
  createComment(postId: number, data: CreateCommentRequest): Observable<Comment> {
    const url = API_CONFIG.endpoints.posts.comments.replace(':postId', postId.toString());
    return this.apiService.post<Comment>(url, data, true);
  }

  /**
   * Update a comment
   * PATCH /comments/:commentId
   */
  updateComment(commentId: number, data: UpdateCommentRequest): Observable<Comment> {
    const url = API_CONFIG.endpoints.posts.commentById.replace(':commentId', commentId.toString());
    return this.apiService.patch<Comment>(url, data, true);
  }

  /**
   * Delete a comment
   * DELETE /comments/:commentId
   */
  deleteComment(commentId: number): Observable<{ message: string }> {
    const url = API_CONFIG.endpoints.posts.commentById.replace(':commentId', commentId.toString());
    return this.apiService.delete<{ message: string }>(url, true);
  }

  /**
   * Approve or reject a post
   * PATCH /posts/:postId/approve
   */
  approvePost(postId: number, status: 'APPROVED' | 'REJECTED'): Observable<Post> {
    const url = API_CONFIG.endpoints.posts.byId.replace(':postId', postId.toString()) + '/approve';
    return this.apiService.patch<Post>(url, { status }, true);
  }

  /**
   * Helper: Build query string from filter object
   */
  private buildQueryString(filter?: FilterPostsRequest): string {
    if (!filter) return '';

    const params: string[] = [];
    if (filter.type) params.push(`type=${encodeURIComponent(filter.type)}`);
    if (filter.isPinned !== undefined) params.push(`isPinned=${filter.isPinned}`);
    if (filter.status) params.push(`status=${encodeURIComponent(filter.status)}`);
    if (filter.page) params.push(`page=${filter.page}`);
    if (filter.limit) params.push(`limit=${filter.limit}`);

    return params.length > 0 ? `?${params.join('&')}` : '';
  }
}

