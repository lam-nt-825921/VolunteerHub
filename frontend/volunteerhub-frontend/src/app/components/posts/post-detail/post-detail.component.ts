import { Component, OnInit, OnDestroy, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { PostsApiService, Post, Comment } from '../../../services/posts-api.service';
import { AlertService } from '../../../services/alert.service';
import { ConfirmationService } from '../../../services/confirmation.service';
import { EventsService } from '../../../services/events.service';
import { NavbarComponent } from '../../navbar/navbar.component';
import { FooterComponent } from '../../footer/footer.component';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.scss'
})
export class PostDetailComponent implements OnInit, OnDestroy {
  post = signal<Post | null>(null);
  comments = signal<Comment[]>([]);
  newCommentContent = signal('');
  replyingToComment = signal<Map<number, boolean>>(new Map());
  replyContent = signal<Map<number, string>>(new Map());
  isLoading = signal(false);
  isLoadingComments = signal(false);
  expandedComments = signal<Set<number>>(new Set());
  highlightedCommentId: number | null = null;
  canManage = signal(false);
  registrationPermissions: number | null = null;
  private subscriptions = new Subscription();

  constructor(
    public authService: AuthService,
    private postsApi: PostsApiService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService,
    private eventsService: EventsService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Check for commentId in query params to highlight
    effect(() => {
      const commentId = this.route.snapshot.queryParamMap.get('commentId');
      if (commentId && this.comments().length > 0) {
        this.highlightedCommentId = Number(commentId);
        setTimeout(() => this.scrollToComment(Number(commentId)), 500);
      }
    });
  }

  async ngOnInit() {
    // Get postId from route params
    const postIdParam = this.route.snapshot.paramMap.get('postId');
    if (!postIdParam) {
      console.error('Post ID not found in route params');
      this.router.navigate(['/events']);
      return;
    }
    
    // Extract only the numeric part (in case query params got mixed in)
    // Remove any non-numeric characters after the number
    const numericMatch = postIdParam.match(/^(\d+)/);
    if (!numericMatch) {
      console.error('Invalid post ID format:', postIdParam);
      this.alertService.showError('ID bài viết không hợp lệ');
      this.router.navigate(['/events']);
      return;
    }
    
    const postId = Number(numericMatch[1]);
    if (isNaN(postId) || postId <= 0) {
      console.error('Invalid post ID:', postIdParam);
      this.alertService.showError('ID bài viết không hợp lệ');
      this.router.navigate(['/events']);
      return;
    }

    // Check for commentId in query params
    const commentId = this.route.snapshot.queryParamMap.get('commentId');
    if (commentId) {
      const commentIdNum = Number(commentId);
      if (!isNaN(commentIdNum) && commentIdNum > 0) {
        this.highlightedCommentId = commentIdNum;
      }
    }

    // Load post and comments
    await this.loadPost(postId);
    await this.loadComments(postId);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  async loadPost(postId: number) {
    this.isLoading.set(true);
    try {
      const post = await firstValueFrom(this.postsApi.getPostById(postId));
      this.post.set(post);
      
      // Load permissions for the event
      if (post.eventId && this.authService.isAuthenticated()) {
        await this.loadEventPermissions(post.eventId);
      }
    } catch (error: any) {
      console.error('Error loading post:', error);
      this.alertService.showError(error?.message || 'Không thể tải bài viết. Vui lòng thử lại!');
      this.router.navigate(['/events']);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadEventPermissions(eventId: number) {
    try {
      const history = await this.eventsService.getParticipationHistory();
      const registration = history.find(h => h.event.id === eventId);
      
      if (registration) {
        this.registrationPermissions = registration.permissions;
        // Check POST_APPROVE permission (value = 4)
        const POST_APPROVE = 4;
        this.canManage.set((registration.permissions & POST_APPROVE) === POST_APPROVE);
      }
      
      // Also check if user is admin
      const user = this.authService.user();
      if (user && user.role === 'admin') {
        this.canManage.set(true);
      }
    } catch (error) {
      console.error('Error loading event permissions:', error);
    }
  }

  async loadComments(postId: number) {
    this.isLoadingComments.set(true);
    try {
      const isAuthenticated = this.authService.isAuthenticated();
      const comments = await firstValueFrom(this.postsApi.getCommentsForPost(postId, isAuthenticated));
      this.comments.set(comments);
      
      // Auto-expand all comments for detail view
      const allCommentIds = this.getAllCommentIds(comments);
      this.expandedComments.set(new Set(allCommentIds));
      
      // Scroll to highlighted comment if exists
      if (this.highlightedCommentId) {
        setTimeout(() => this.scrollToComment(this.highlightedCommentId!), 500);
      }
    } catch (error: any) {
      console.error('Error loading comments:', error);
      this.alertService.showError(error?.message || 'Không thể tải bình luận. Vui lòng thử lại!');
    } finally {
      this.isLoadingComments.set(false);
    }
  }

  getAllCommentIds(comments: Comment[]): number[] {
    const ids: number[] = [];
    for (const comment of comments) {
      ids.push(comment.id);
      if (comment.replies) {
        ids.push(...this.getAllCommentIds(comment.replies));
      }
    }
    return ids;
  }

  async createComment() {
    const post = this.post();
    if (!post || !this.newCommentContent().trim()) return;

    this.isLoading.set(true);
    try {
      await firstValueFrom(
        this.postsApi.createComment(post.id, { content: this.newCommentContent().trim() })
      );
      this.newCommentContent.set('');
      await this.loadComments(post.id);
      this.alertService.showSuccess('Đã thêm bình luận!');
    } catch (error: any) {
      console.error('Error creating comment:', error);
      this.alertService.showError(error?.message || 'Không thể thêm bình luận. Vui lòng thử lại!');
    } finally {
      this.isLoading.set(false);
    }
  }

  startReply(commentId: number) {
    const current = new Map(this.replyingToComment());
    current.set(commentId, true);
    this.replyingToComment.set(current);
    this.setReplyContent(commentId, '');
  }

  cancelReply(commentId: number) {
    const current = new Map(this.replyingToComment());
    current.delete(commentId);
    this.replyingToComment.set(current);
    const replyContent = new Map(this.replyContent());
    replyContent.delete(commentId);
    this.replyContent.set(replyContent);
  }

  setReplyContent(commentId: number, content: string) {
    const current = new Map(this.replyContent());
    current.set(commentId, content);
    this.replyContent.set(current);
  }

  getReplyContent(commentId: number): string {
    return this.replyContent().get(commentId) || '';
  }

  isReplyingTo(commentId: number): boolean {
    return this.replyingToComment().get(commentId) || false;
  }

  async submitReply(postId: number, parentCommentId: number) {
    const content = this.getReplyContent(parentCommentId).trim();
    if (!content) return;

    this.isLoading.set(true);
    try {
      await firstValueFrom(
        this.postsApi.createComment(postId, {
          content,
          parentId: parentCommentId,
        })
      );
      this.cancelReply(parentCommentId);
      await this.loadComments(postId);
      this.alertService.showSuccess('Đã thêm phản hồi!');
    } catch (error: any) {
      console.error('Error submitting reply:', error);
      this.alertService.showError(error?.message || 'Không thể thêm phản hồi. Vui lòng thử lại!');
    } finally {
      this.isLoading.set(false);
    }
  }

  async toggleLike(post: Post) {
    if (!this.authService.isAuthenticated()) {
      this.alertService.showError('Bạn cần đăng nhập để thích bài viết');
      return;
    }

    try {
      if (post.likedByCurrentUser) {
        await firstValueFrom(this.postsApi.unlikePost(post.id));
        post.likedByCurrentUser = false;
        post.likesCount = Math.max(0, post.likesCount - 1);
      } else {
        await firstValueFrom(this.postsApi.likePost(post.id));
        post.likedByCurrentUser = true;
        post.likesCount += 1;
      }
      this.post.set({ ...post });
    } catch (error: any) {
      console.error('Error toggling like:', error);
      this.alertService.showError(error?.message || 'Không thể thích/bỏ thích bài viết. Vui lòng thử lại!');
    }
  }

  isLiked(post: Post): boolean {
    return post.likedByCurrentUser || false;
  }

  async deleteComment(comment: Comment, post: Post) {
    const confirmed = await this.confirmationService.confirm(
      'Bạn có chắc muốn xóa bình luận này?',
      'Xác nhận xóa bình luận'
    );
    if (!confirmed) return;

    this.isLoading.set(true);
    try {
      await firstValueFrom(this.postsApi.deleteComment(comment.id));
      await this.loadComments(post.id);
      this.alertService.showSuccess('Đã xóa bình luận!');
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      this.alertService.showError(error?.message || 'Không thể xóa bình luận. Vui lòng thử lại!');
    } finally {
      this.isLoading.set(false);
    }
  }

  toggleCommentExpanded(commentId: number) {
    const current = this.expandedComments();
    const newSet = new Set(current);
    if (newSet.has(commentId)) {
      newSet.delete(commentId);
    } else {
      newSet.add(commentId);
    }
    this.expandedComments.set(newSet);
  }

  isCommentExpanded(commentId: number): boolean {
    return this.expandedComments().has(commentId);
  }

  countTotalReplies(comment: Comment): number {
    let count = 0;
    if (comment.replies) {
      count += comment.replies.length;
      for (const reply of comment.replies) {
        count += this.countTotalReplies(reply);
      }
    }
    return count;
  }

  scrollToComment(commentId: number) {
    const element = document.getElementById(`comment-${commentId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('highlight-comment');
      setTimeout(() => {
        element.classList.remove('highlight-comment');
      }, 2000);
    }
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
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  navigateToEvent(eventId: number) {
    this.router.navigate(['/events', eventId]);
  }
}

