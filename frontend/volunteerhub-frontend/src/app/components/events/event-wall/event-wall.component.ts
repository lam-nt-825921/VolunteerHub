import { Component, OnInit, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { PostsApiService, Post, Comment } from '../../../services/posts-api.service';
import { AlertService } from '../../../services/alert.service';
import { ConfirmationService } from '../../../services/confirmation.service';

@Component({
  selector: 'app-event-wall',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './event-wall.component.html',
  styleUrl: './event-wall.component.scss'
})
export class EventWallComponent implements OnInit {
  @Input() eventId!: number;
  @Input() canManage = false; // For managers/admins

  posts = signal<Post[]>([]);
  newPostContent = signal('');
  newCommentContent = signal<Map<number, string>>(new Map());
  replyingToComment = signal<Map<number, boolean>>(new Map()); // Map commentId -> isReplying
  replyContent = signal<Map<number, string>>(new Map()); // Map commentId -> replyContent
  previewUrl: string | null = null;
  isLoading = signal(false);
  commentsMap = signal<Map<number, Comment[]>>(new Map()); // Map postId -> comments

  constructor(
    public authService: AuthService,
    private postsApi: PostsApiService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService
  ) {}

  async ngOnInit() {
    await this.loadPosts();
  }

  async loadPosts() {
    this.isLoading.set(true);
    try {
      const isAuthenticated = this.authService.isAuthenticated();
      const result = await firstValueFrom(this.postsApi.getPostsForEvent(this.eventId, {}));
      
      // Handle both array and paginated response
      const postsArray = Array.isArray(result) ? result : (result as any).data || [];
      
    // Sort: pinned first, then by date
      postsArray.sort((a: Post, b: Post) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
      
      this.posts.set(postsArray);
      
      // Load comments for each post
      await this.loadAllComments(postsArray);
    } catch (error: any) {
      console.error('Error loading posts:', error);
      this.alertService.showError(error?.message || 'Không thể tải bài viết. Vui lòng thử lại!');
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadAllComments(posts: Post[]) {
    const commentsMap = new Map<number, Comment[]>();
    
    for (const post of posts) {
      try {
        const isAuthenticated = this.authService.isAuthenticated();
        const comments = await firstValueFrom(this.postsApi.getCommentsForPost(post.id, isAuthenticated));
        commentsMap.set(post.id, comments);
      } catch (error) {
        console.error(`Error loading comments for post ${post.id}:`, error);
        commentsMap.set(post.id, []);
      }
    }
    
    this.commentsMap.set(commentsMap);
  }

  getCommentsForPost(postId: number): Comment[] {
    return this.commentsMap().get(postId) || [];
  }

  flattenComments(comments: Comment[]): Comment[] {
    const result: Comment[] = [];
    for (const comment of comments) {
      result.push(comment);
      if (comment.replies && comment.replies.length > 0) {
        result.push(...this.flattenComments(comment.replies));
      }
    }
    return result;
  }

  selectedFiles: File[] = [];
  
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      // Store all selected files (up to 10, matching backend limit)
      this.selectedFiles = Array.from(input.files).slice(0, 10);
      
      // Preview the first image
      const firstFile = this.selectedFiles[0];
      if (firstFile && firstFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewUrl = e.target?.result as string;
        };
        reader.readAsDataURL(firstFile);
      }
      
      // Clear the input so user can select the same file again if needed
      input.value = '';
    }
  }

  removeImage() {
    this.selectedFiles = [];
    this.previewUrl = null;
  }

  async createPost() {
    const content = this.newPostContent().trim();
    if (!content) {
      return;
    }

    if (!this.authService.isAuthenticated()) {
      return;
    }

    this.isLoading.set(true);
    try {
      await firstValueFrom(this.postsApi.createPost(
        this.eventId, 
        { content, type: 'DISCUSSION' as const },
        this.selectedFiles.length > 0 ? this.selectedFiles : undefined
      ));
    
      this.newPostContent.set('');
      this.selectedFiles = [];
      this.previewUrl = null;
      await this.loadPosts();
    } catch (error: any) {
      console.error('Error creating post:', error);
      this.alertService.showError(error?.message || 'Đăng bài thất bại. Vui lòng thử lại!');
    } finally {
      this.isLoading.set(false);
    }
  }

  async addComment(postId: number, parentId?: number) {
    if (parentId) {
      // This is a reply
      await this.submitReply(postId, parentId);
      return;
    }

    // This is a top-level comment
    const contentMap = this.newCommentContent();
    const content = contentMap.get(postId)?.trim();
    if (!content) {
      return;
    }

    if (!this.authService.isAuthenticated()) {
      return;
    }

    this.isLoading.set(true);
    try {
      await firstValueFrom(this.postsApi.createComment(postId, {
        content
      }));
      
    contentMap.set(postId, '');
    this.newCommentContent.set(new Map(contentMap));
      
      // Reload comments for this post
      await this.reloadCommentsForPost(postId);
    } catch (error: any) {
      console.error('Error adding comment:', error);
      this.alertService.showError(error?.message || 'Bình luận thất bại. Vui lòng thử lại!');
    } finally {
      this.isLoading.set(false);
    }
  }

  startReply(commentId: number) {
    const replyingMap = this.replyingToComment();
    replyingMap.set(commentId, true);
    this.replyingToComment.set(new Map(replyingMap));
  }

  cancelReply(commentId: number) {
    const replyingMap = this.replyingToComment();
    replyingMap.delete(commentId);
    this.replyingToComment.set(new Map(replyingMap));
    
    const replyContentMap = this.replyContent();
    replyContentMap.delete(commentId);
    this.replyContent.set(new Map(replyContentMap));
  }

  async submitReply(postId: number, parentCommentId: number) {
    const replyContentMap = this.replyContent();
    const content = replyContentMap.get(parentCommentId)?.trim();
    if (!content) {
      return;
    }

    if (!this.authService.isAuthenticated()) {
      return;
    }

    this.isLoading.set(true);
    try {
      await firstValueFrom(this.postsApi.createComment(postId, {
        content,
        parentId: parentCommentId
      }));
      
      replyContentMap.delete(parentCommentId);
      this.replyContent.set(new Map(replyContentMap));
      
      const replyingMap = this.replyingToComment();
      replyingMap.delete(parentCommentId);
      this.replyingToComment.set(new Map(replyingMap));
      
      // Reload comments for this post
      await this.reloadCommentsForPost(postId);
    } catch (error: any) {
      console.error('Error adding reply:', error);
      this.alertService.showError(error?.message || 'Phản hồi thất bại. Vui lòng thử lại!');
    } finally {
      this.isLoading.set(false);
    }
  }

  isReplyingTo(commentId: number): boolean {
    return this.replyingToComment().get(commentId) || false;
  }

  getReplyContent(commentId: number): string {
    return this.replyContent().get(commentId) || '';
  }

  setReplyContent(commentId: number, content: string) {
    const replyContentMap = this.replyContent();
    replyContentMap.set(commentId, content);
    this.replyContent.set(new Map(replyContentMap));
  }

  async reloadCommentsForPost(postId: number) {
    try {
      const isAuthenticated = this.authService.isAuthenticated();
      const comments = await firstValueFrom(this.postsApi.getCommentsForPost(postId, isAuthenticated));
      const commentsMap = new Map(this.commentsMap());
      commentsMap.set(postId, comments);
      this.commentsMap.set(commentsMap);
      
      // Also reload the post to update comment count
      const currentPosts = this.posts();
      const post = currentPosts.find(p => p.id === postId);
      if (post) {
        const updatedPost = await firstValueFrom(this.postsApi.getPostById(postId, isAuthenticated));
        const updatedPosts = currentPosts.map(p => p.id === postId ? updatedPost : p);
        this.posts.set(updatedPosts);
      }
    } catch (error) {
      console.error('Error reloading comments:', error);
    }
  }

  async toggleLike(post: Post) {
    if (!this.authService.isAuthenticated()) {
      this.alertService.showError('Bạn cần đăng nhập để thích bài viết!');
      return;
    }

    this.isLoading.set(true);
    try {
      if (post.likedByCurrentUser) {
        await firstValueFrom(this.postsApi.unlikePost(post.id));
      } else {
        await firstValueFrom(this.postsApi.likePost(post.id));
      }
      
      // Reload the post to get updated like status
      // Always pass true since user must be authenticated to like/unlike
      const updatedPost = await firstValueFrom(this.postsApi.getPostById(post.id, true));
      const currentPosts = this.posts();
      const updatedPosts = currentPosts.map(p => p.id === post.id ? updatedPost : p);
      this.posts.set(updatedPosts);
    } catch (error: any) {
      console.error('Error toggling like:', error);
      this.alertService.showError(error?.message || 'Thao tác thất bại. Vui lòng thử lại!');
    } finally {
      this.isLoading.set(false);
  }
  }

  isLiked(post: Post): boolean {
    return post.likedByCurrentUser;
  }

  async pinPost(post: Post) {
    if (!this.canManage) return;
    
    // Pin/unpin doesn't need confirmation - it's a simple toggle action
    this.isLoading.set(true);
    try {
      const updatedPost = await firstValueFrom(this.postsApi.pinPost(post.id, !post.isPinned));
      // Reload posts to get updated order
      await this.loadPosts();
      // No success alert - action is visible (pin icon changes)
    } catch (error: any) {
      console.error('Error pinning post:', error);
      this.alertService.showError(error?.message || 'Thao tác thất bại. Vui lòng thử lại!');
    } finally {
      this.isLoading.set(false);
    }
  }

  async deletePost(post: Post) {
    const user = this.authService.user();
    if (!this.canManage && post.author.id !== user?.id) return;
    
    const confirmed = await this.confirmationService.confirm(
      'Bạn có chắc muốn xóa bài viết này?'
    );
    if (!confirmed) return;

    this.isLoading.set(true);
    try {
      await firstValueFrom(this.postsApi.deletePost(post.id));
      await this.loadPosts();
      // No success alert - action is visible (post disappears)
    } catch (error: any) {
      console.error('Error deleting post:', error);
      this.alertService.showError(error?.message || 'Xóa bài viết thất bại. Vui lòng thử lại!');
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteComment(comment: Comment, post: Post) {
    const user = this.authService.user();
    if (!this.canManage && comment.author.id !== user?.id) return;
    
    const confirmed = await this.confirmationService.confirm(
      'Bạn có chắc muốn xóa bình luận này?'
    );
    if (!confirmed) return;

    this.isLoading.set(true);
    try {
      await firstValueFrom(this.postsApi.deleteComment(comment.id));
      await this.reloadCommentsForPost(post.id);
      // No success alert - action is visible (comment disappears)
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      this.alertService.showError(error?.message || 'Xóa bình luận thất bại. Vui lòng thử lại!');
    } finally {
      this.isLoading.set(false);
    }
  }

  setCommentContent(postId: number, content: string) {
    const contentMap = this.newCommentContent();
    contentMap.set(postId, content);
    this.newCommentContent.set(new Map(contentMap));
  }

  getCommentContent(postId: number): string {
    return this.newCommentContent().get(postId) || '';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

