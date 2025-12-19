import { Component, OnInit, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { PostsApiService, Post, Comment } from '../../../services/posts-api.service';
import { AlertService } from '../../../services/alert.service';

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
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isLoading = signal(false);
  commentsMap = signal<Map<number, Comment[]>>(new Map()); // Map postId -> comments

  constructor(
    public authService: AuthService,
    private postsApi: PostsApiService,
    private alertService: AlertService
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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  removeImage() {
    this.selectedFile = null;
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
      // Note: For now, if previewUrl is a data URL, we can't use it
      // The backend expects actual image URLs (e.g., from Cloudinary)
      // So we'll skip images if it's a data URL, or use it if it's already a URL
      let images: string[] | undefined = undefined;
      if (this.previewUrl) {
        // Check if it's a data URL or a regular URL
        if (this.previewUrl.startsWith('data:')) {
          // Data URL - skip for now (would need to upload to Cloudinary first)
          images = undefined;
        } else {
          // Regular URL - use it
          images = [this.previewUrl];
        }
      }
      
      await firstValueFrom(this.postsApi.createPost(this.eventId, {
        content,
        images,
        type: 'DISCUSSION'
      }));
      
      this.newPostContent.set('');
      this.selectedFile = null;
      this.previewUrl = null;
      await this.loadPosts();
    } catch (error: any) {
      console.error('Error creating post:', error);
      this.alertService.showError(error?.message || 'Đăng bài thất bại. Vui lòng thử lại!');
    } finally {
      this.isLoading.set(false);
    }
  }

  async addComment(postId: number) {
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
      const isAuthenticated = this.authService.isAuthenticated();
      const updatedPost = await firstValueFrom(this.postsApi.getPostById(post.id, isAuthenticated));
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
    
    if (!confirm(`Bạn có chắc muốn ${post.isPinned ? 'bỏ ghim' : 'ghim'} bài viết này?`)) {
      return;
    }

    this.isLoading.set(true);
    try {
      const updatedPost = await firstValueFrom(this.postsApi.pinPost(post.id, !post.isPinned));
      this.alertService.showSuccess(post.isPinned ? 'Đã bỏ ghim bài viết!' : 'Đã ghim bài viết!');
      
      // Reload posts to get updated order
      await this.loadPosts();
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
    
    if (!confirm('Bạn có chắc muốn xóa bài viết này?')) {
      return;
    }

    this.isLoading.set(true);
    try {
      await firstValueFrom(this.postsApi.deletePost(post.id));
      this.alertService.showSuccess('Đã xóa bài viết!');
      await this.loadPosts();
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
    
    if (!confirm('Bạn có chắc muốn xóa bình luận này?')) {
      return;
    }

    this.isLoading.set(true);
    try {
      await firstValueFrom(this.postsApi.deleteComment(comment.id));
      this.alertService.showSuccess('Đã xóa bình luận!');
      await this.reloadCommentsForPost(post.id);
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

