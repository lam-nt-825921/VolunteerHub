import { Component, OnInit, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';
import { WallService, WallPost, WallComment } from '../../../services/wall.service';

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

  posts: WallPost[] = [];
  newPostContent = signal('');
  newCommentContent = signal<Map<number, string>>(new Map());
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(
    public authService: AuthService,
    private wallService: WallService
  ) {}

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.posts = this.wallService.getPostsByEvent(this.eventId);
    // Sort: pinned first, then by date
    this.posts.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
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

  createPost() {
    const content = this.newPostContent().trim();
    if (!content) return;

    const user = this.authService.user();
    if (!user) return;

    const imageUrl = this.previewUrl || undefined;
    this.wallService.createPost(this.eventId, user.id, user.name, content, imageUrl);
    
    this.newPostContent.set('');
    this.selectedFile = null;
    this.previewUrl = null;
    this.loadPosts();
  }

  addComment(postId: number) {
    const contentMap = this.newCommentContent();
    const content = contentMap.get(postId)?.trim();
    if (!content) return;

    const user = this.authService.user();
    if (!user) return;

    this.wallService.addComment(postId, this.eventId, user.id, user.name, content);
    contentMap.set(postId, '');
    this.newCommentContent.set(new Map(contentMap));
    this.loadPosts();
  }

  toggleLike(post: WallPost) {
    const user = this.authService.user();
    if (!user) return;

    this.wallService.toggleLike(post.id, this.eventId, user.id);
    this.loadPosts();
  }

  isLiked(post: WallPost): boolean {
    const user = this.authService.user();
    if (!user) return false;
    return post.likedBy.includes(user.id);
  }

  pinPost(post: WallPost) {
    if (!this.canManage) return;
    this.wallService.pinPost(post.id, this.eventId);
    this.loadPosts();
  }

  deletePost(post: WallPost) {
    if (!this.canManage && post.userId !== this.authService.user()?.id) return;
    if (confirm('Bạn có chắc muốn xóa bài viết này?')) {
      this.wallService.deletePost(post.id, this.eventId);
      this.loadPosts();
    }
  }

  deleteComment(comment: WallComment, post: WallPost) {
    if (!this.canManage && comment.userId !== this.authService.user()?.id) return;
    if (confirm('Bạn có chắc muốn xóa bình luận này?')) {
      this.wallService.deleteComment(comment.id, post.id, this.eventId);
      this.loadPosts();
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

