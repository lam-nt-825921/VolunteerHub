import { Component, OnInit, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { PostsApiService, Post, Comment } from '../../../services/posts-api.service';
import { AlertService } from '../../../services/alert.service';
import { ConfirmationService } from '../../../services/confirmation.service';

@Component({
  selector: 'app-event-wall',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterModule],
  templateUrl: './event-wall.component.html',
  styleUrl: './event-wall.component.scss'
})
export class EventWallComponent implements OnInit {
  @Input() eventId!: number;
  @Input() canManage = false; // For managers/admins

  posts = signal<Post[]>([]);
  pendingPosts = signal<Post[]>([]); // Posts waiting for approval
  showPendingPosts = signal(false); // Toggle to show/hide pending posts section
  newPostContent = signal('');
  newCommentContent = signal<Map<number, string>>(new Map());
  replyingToComment = signal<Map<number, boolean>>(new Map()); // Map commentId -> isReplying
  replyContent = signal<Map<number, string>>(new Map()); // Map commentId -> replyContent
  previewUrl: string | null = null;
  isLoading = signal(false);
  isLoadingPending = signal(false);
  commentsMap = signal<Map<number, Comment[]>>(new Map()); // Map postId -> comments
  expandedComments = signal<Set<number>>(new Set()); // Track which comments are expanded
  processingPosts = signal<Map<number, 'approving' | 'rejecting'>>(new Map()); // Track which posts are being processed

  constructor(
    public authService: AuthService,
    private postsApi: PostsApiService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService
  ) {}

  async ngOnInit() {
    await Promise.all([
      this.loadPosts(),
      // Load pending posts if user has manage permission
      this.canManage ? this.loadPendingPosts() : Promise.resolve()
    ]);
  }

  async loadPosts() {
    this.isLoading.set(true);
    try {
      const isAuthenticated = this.authService.isAuthenticated();
      console.log('[EventWall] Loading posts for event:', this.eventId, 'authenticated:', isAuthenticated);
      
      const result = await firstValueFrom(this.postsApi.getPostsForEvent(this.eventId, {}));
      
      console.log('[EventWall] Posts API response:', result);
      
      // Handle both array and paginated response
      const postsArray = Array.isArray(result) ? result : (result as any).data || [];
      
      console.log('[EventWall] Posts array:', postsArray.length, 'posts');
      if (postsArray.length === 0) {
        console.log('[EventWall] No posts found - this could be normal if no posts exist, or could indicate a permission issue');
      }
      
      // If user has manage permission, filter out PENDING posts from main list
      // (they will be shown in the pending posts section instead)
      let approvedPosts = postsArray;
      if (this.canManage) {
        // Filter out posts with status PENDING
        approvedPosts = postsArray.filter((post: Post) => post.status !== 'PENDING');
        
        // Extract pending posts
        const pendingArray = postsArray.filter((post: Post) => post.status === 'PENDING');
        this.pendingPosts.set(pendingArray);
      }
      
      // Sort: pinned first, then by date
      approvedPosts.sort((a: Post, b: Post) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      this.posts.set(approvedPosts);
      console.log('[EventWall] Posts set:', this.posts().length, 'posts (filtered)');
      
      // Load comments for each post
      await this.loadAllComments(approvedPosts);
      
      // Reload pending posts count if user has manage permission (to get latest count)
      if (this.canManage) {
        await this.loadPendingPosts();
      }
    } catch (error: any) {
      console.error('[EventWall] Error loading posts:', error);
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
  fileSizeWarning = signal<string | null>(null);
  
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      // Check for files exceeding 10MB
      const oversizedFiles = files.filter(file => file.size > maxSize);
      if (oversizedFiles.length > 0) {
        const fileNames = oversizedFiles.map(f => f.name).join(', ');
        const fileSizes = oversizedFiles.map(f => (f.size / (1024 * 1024)).toFixed(2)).join(', ');
        this.fileSizeWarning.set(`Cảnh báo: ${fileNames} vượt quá 10MB (${fileSizes}MB). Vui lòng chọn ảnh nhỏ hơn.`);
      } else {
        this.fileSizeWarning.set(null);
      }
      
      // Store all selected files (up to 10, matching backend limit)
      this.selectedFiles = files.slice(0, 10);
      
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
    this.fileSizeWarning.set(null);
  }

  async createPost() {
    const content = this.newPostContent().trim();
    if (!content) {
      return;
    }

    if (!this.authService.isAuthenticated()) {
      return;
    }

    try {
      const newPost = await firstValueFrom(this.postsApi.createPost(
        this.eventId, 
        { content, type: 'DISCUSSION' as const },
        this.selectedFiles.length > 0 ? this.selectedFiles : undefined
      ));
    
      this.newPostContent.set('');
      this.selectedFiles = [];
      this.previewUrl = null;
      this.fileSizeWarning.set(null);
      
      // Add the new post to the beginning of the list (after pinned posts)
      const currentPosts = this.posts();
      const pinnedPosts = currentPosts.filter(p => p.isPinned);
      const unpinnedPosts = currentPosts.filter(p => !p.isPinned);
      const updatedPosts = [...pinnedPosts, newPost, ...unpinnedPosts];
      this.posts.set(updatedPosts);
      
      // Initialize empty comments for the new post
      const commentsMap = new Map(this.commentsMap());
      commentsMap.set(newPost.id, []);
      this.commentsMap.set(commentsMap);
    } catch (error: any) {
      console.error('Error creating post:', error);
      this.alertService.showError(error?.message || 'Đăng bài thất bại. Vui lòng thử lại!');
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

    try {
      await firstValueFrom(this.postsApi.createComment(postId, {
        content
      }));
      
      contentMap.set(postId, '');
      this.newCommentContent.set(new Map(contentMap));
      
      // Reload comments for this post (only comments, not all posts)
      await this.reloadCommentsForPost(postId);
    } catch (error: any) {
      console.error('Error adding comment:', error);
      this.alertService.showError(error?.message || 'Bình luận thất bại. Vui lòng thử lại!');
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
      
      // Reload comments for this post (only comments, not all posts)
      await this.reloadCommentsForPost(postId);
    } catch (error: any) {
      console.error('Error adding reply:', error);
      this.alertService.showError(error?.message || 'Phản hồi thất bại. Vui lòng thử lại!');
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

    try {
      if (post.likedByCurrentUser) {
        await firstValueFrom(this.postsApi.unlikePost(post.id));
      } else {
        await firstValueFrom(this.postsApi.likePost(post.id));
      }
      
      // Update the post locally to reflect like status change
      const currentPosts = this.posts();
      const updatedPosts = currentPosts.map(p => {
        if (p.id === post.id) {
          return {
            ...p,
            likedByCurrentUser: !p.likedByCurrentUser,
            likesCount: p.likedByCurrentUser ? (p.likesCount || 1) - 1 : (p.likesCount || 0) + 1
          };
        }
        return p;
      });
      this.posts.set(updatedPosts);
    } catch (error: any) {
      console.error('Error toggling like:', error);
      this.alertService.showError(error?.message || 'Thao tác thất bại. Vui lòng thử lại!');
    }
  }

  isLiked(post: Post): boolean {
    return post.likedByCurrentUser;
  }

  async pinPost(post: Post) {
    if (!this.canManage) return;
    
    // Pin/unpin doesn't need confirmation - it's a simple toggle action
    try {
      const updatedPost = await firstValueFrom(this.postsApi.pinPost(post.id, !post.isPinned));
      
      // Update the post locally
      const currentPosts = this.posts();
      const updatedPosts = currentPosts.map(p => p.id === post.id ? updatedPost : p);
      
      // Re-sort: pinned first, then by date
      updatedPosts.sort((a: Post, b: Post) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      this.posts.set(updatedPosts);
      // No success alert - action is visible (pin icon changes)
    } catch (error: any) {
      console.error('Error pinning post:', error);
      this.alertService.showError(error?.message || 'Thao tác thất bại. Vui lòng thử lại!');
    }
  }

  async deletePost(post: Post) {
    const user = this.authService.user();
    if (!this.canManage && post.author.id !== user?.id) return;
    
    const confirmed = await this.confirmationService.confirm(
      'Bạn có chắc muốn xóa bài viết này?'
    );
    if (!confirmed) return;

    try {
      await firstValueFrom(this.postsApi.deletePost(post.id));
      
      // Remove the post from local state
      const currentPosts = this.posts();
      const updatedPosts = currentPosts.filter(p => p.id !== post.id);
      this.posts.set(updatedPosts);
      
      // Also remove comments for this post
      const commentsMap = new Map(this.commentsMap());
      commentsMap.delete(post.id);
      this.commentsMap.set(commentsMap);
      
      // No success alert - action is visible (post disappears)
    } catch (error: any) {
      console.error('Error deleting post:', error);
      this.alertService.showError(error?.message || 'Xóa bài viết thất bại. Vui lòng thử lại!');
    }
  }

  async deleteComment(comment: Comment, post: Post) {
    const user = this.authService.user();
    if (!this.canManage && comment.author.id !== user?.id) return;
    
    const confirmed = await this.confirmationService.confirm(
      'Bạn có chắc muốn xóa bình luận này?'
    );
    if (!confirmed) return;

    try {
      await firstValueFrom(this.postsApi.deleteComment(comment.id));
      
      // Reload comments for this post (only comments, not all posts)
      await this.reloadCommentsForPost(post.id);
      // No success alert - action is visible (comment disappears)
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      this.alertService.showError(error?.message || 'Xóa bình luận thất bại. Vui lòng thử lại!');
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

  /**
   * Count total number of replies (including nested replies) recursively
   */
  countTotalReplies(comment: Comment): number {
    if (!comment.replies || comment.replies.length === 0) {
      return 0;
    }
    let count = comment.replies.length;
    for (const reply of comment.replies) {
      count += this.countTotalReplies(reply);
    }
    return count;
  }

  /**
   * Toggle expand/collapse for a comment
   */
  toggleCommentExpanded(commentId: number) {
    const expanded = new Set(this.expandedComments());
    if (expanded.has(commentId)) {
      expanded.delete(commentId);
    } else {
      expanded.add(commentId);
    }
    this.expandedComments.set(expanded);
  }

  /**
   * Check if a comment is expanded
   */
  isCommentExpanded(commentId: number): boolean {
    return this.expandedComments().has(commentId);
  }

  /**
   * Load pending posts (only for users with POST_APPROVE permission)
   */
  async loadPendingPosts() {
    if (!this.canManage) return;
    
    this.isLoadingPending.set(true);
    try {
      const result = await firstValueFrom(
        this.postsApi.getPostsForEvent(this.eventId, { status: 'PENDING' })
      );
      
      const pendingArray = Array.isArray(result) ? result : (result as any).data || [];
      this.pendingPosts.set(pendingArray);
    } catch (error: any) {
      console.error('Error loading pending posts:', error);
      // Don't show error to user - they might not have permission
    } finally {
      this.isLoadingPending.set(false);
    }
  }

  /**
   * Get count of pending posts
   */
  getPendingPostsCount(): number {
    return this.pendingPosts().length;
  }

  /**
   * Toggle show/hide pending posts section
   */
  togglePendingPosts() {
    const wasOpen = this.showPendingPosts();
    this.showPendingPosts.update(v => !v);
    
    // If opening and no pending posts loaded yet, load them
    if (!wasOpen && this.showPendingPosts()) {
      if (this.pendingPosts().length === 0) {
        this.loadPendingPosts();
      }
    }
  }

  /**
   * Approve a pending post (optimistic update)
   */
  async approvePost(post: Post) {
    const confirmed = await this.confirmationService.confirm(
      'Bạn có chắc muốn duyệt bài viết này?',
      'Xác nhận duyệt bài viết'
    );
    if (!confirmed) return;

    // Set loading state for this post
    const currentProcessing = new Map(this.processingPosts());
    currentProcessing.set(post.id, 'approving');
    this.processingPosts.set(currentProcessing);

    // Optimistic update: Remove from pending list immediately
    const currentPending = this.pendingPosts();
    const updatedPending = currentPending.filter(p => p.id !== post.id);
    this.pendingPosts.set(updatedPending);

    // Optimistic update: Add to approved posts list immediately
    const currentPosts = this.posts();
    const approvedPost: Post = { ...post, status: 'APPROVED' };
    const updatedPosts = [approvedPost, ...currentPosts];
    // Sort: pinned first, then by date
    updatedPosts.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    this.posts.set(updatedPosts);

    try {
      // Call API in background
      await firstValueFrom(this.postsApi.approvePost(post.id, 'APPROVED'));
      
      // Success: UI already updated, no need to show success message
    } catch (error: any) {
      console.error('Error approving post:', error);
      
      // Rollback: Restore pending post and remove from approved list
      this.pendingPosts.set([...updatedPending, post]);
      const rolledBackPosts = this.posts().filter(p => p.id !== post.id);
      this.posts.set(rolledBackPosts);
      
      this.alertService.showError(error?.message || 'Duyệt bài viết thất bại. Vui lòng thử lại!');
    } finally {
      // Clear loading state
      const finalProcessing = new Map(this.processingPosts());
      finalProcessing.delete(post.id);
      this.processingPosts.set(finalProcessing);
    }
  }

  /**
   * Reject a pending post (optimistic update)
   */
  async rejectPost(post: Post) {
    const confirmed = await this.confirmationService.confirm(
      'Bạn có chắc muốn từ chối bài viết này? Bài viết sẽ bị ẩn khỏi kênh trao đổi.',
      'Xác nhận từ chối bài viết'
    );
    if (!confirmed) return;

    // Set loading state for this post
    const currentProcessing = new Map(this.processingPosts());
    currentProcessing.set(post.id, 'rejecting');
    this.processingPosts.set(currentProcessing);

    // Optimistic update: Remove from pending list immediately
    const currentPending = this.pendingPosts();
    const updatedPending = currentPending.filter(p => p.id !== post.id);
    this.pendingPosts.set(updatedPending);

    try {
      // Call API in background
      await firstValueFrom(this.postsApi.approvePost(post.id, 'REJECTED'));
      
      // Success: UI already updated, no need to show success message
    } catch (error: any) {
      console.error('Error rejecting post:', error);
      
      // Rollback: Restore pending post
      this.pendingPosts.set([...updatedPending, post]);
      
      this.alertService.showError(error?.message || 'Từ chối bài viết thất bại. Vui lòng thử lại!');
    } finally {
      // Clear loading state
      const finalProcessing = new Map(this.processingPosts());
      finalProcessing.delete(post.id);
      this.processingPosts.set(finalProcessing);
    }
  }

  /**
   * Check if a post is being processed
   */
  isPostProcessing(postId: number): boolean {
    return this.processingPosts().has(postId);
  }

  /**
   * Get processing state for a post
   */
  getPostProcessingState(postId: number): 'approving' | 'rejecting' | null {
    return this.processingPosts().get(postId) || null;
  }
}

