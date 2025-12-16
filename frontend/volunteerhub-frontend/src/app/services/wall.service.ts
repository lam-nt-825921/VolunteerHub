import { Injectable, signal } from '@angular/core';

export interface WallPost {
  id: number;
  eventId: number;
  userId: number;
  userName: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  isPinned: boolean;
  likes: number;
  likedBy: number[];
  comments: WallComment[];
}

export interface WallComment {
  id: number;
  postId: number;
  userId: number;
  userName: string;
  content: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class WallService {
  private posts = signal<Map<number, WallPost[]>>(new Map());

  public readonly postsByEvent = this.posts.asReadonly();

  constructor() {
    // Initialize with mock data
    this.initializeMockData();
  }

  private initializeMockData() {
    const mockPosts: WallPost[] = [
      {
        id: 1,
        eventId: 1,
        userId: 101,
        userName: 'Nguyễn Văn A',
        content: 'Rất vui được tham gia sự kiện này!',
        createdAt: new Date().toISOString(),
        isPinned: false,
        likes: 5,
        likedBy: [101, 102, 103],
        comments: [
          {
            id: 1,
            postId: 1,
            userId: 102,
            userName: 'Trần Thị B',
            content: 'Đồng ý!',
            createdAt: new Date().toISOString()
          }
        ]
      }
    ];

    const postsMap = new Map<number, WallPost[]>();
    postsMap.set(1, mockPosts);
    this.posts.set(postsMap);
  }

  getPostsByEvent(eventId: number): WallPost[] {
    return this.posts().get(eventId) || [];
  }

  createPost(eventId: number, userId: number, userName: string, content: string, imageUrl?: string): WallPost {
    const post: WallPost = {
      id: Date.now(),
      eventId,
      userId,
      userName,
      content,
      imageUrl,
      createdAt: new Date().toISOString(),
      isPinned: false,
      likes: 0,
      likedBy: [],
      comments: []
    };

    const currentPosts = this.posts();
    const eventPosts = currentPosts.get(eventId) || [];
    eventPosts.push(post);
    currentPosts.set(eventId, eventPosts);
    this.posts.set(new Map(currentPosts));

    return post;
  }

  addComment(postId: number, eventId: number, userId: number, userName: string, content: string): WallComment {
    const comment: WallComment = {
      id: Date.now(),
      postId,
      userId,
      userName,
      content,
      createdAt: new Date().toISOString()
    };

    const currentPosts = this.posts();
    const eventPosts = currentPosts.get(eventId) || [];
    const post = eventPosts.find(p => p.id === postId);
    if (post) {
      post.comments.push(comment);
      currentPosts.set(eventId, [...eventPosts]);
      this.posts.set(new Map(currentPosts));
    }

    return comment;
  }

  toggleLike(postId: number, eventId: number, userId: number): { liked: boolean; likes: number } {
    const currentPosts = this.posts();
    const eventPosts = currentPosts.get(eventId) || [];
    const post = eventPosts.find(p => p.id === postId);

    if (!post) {
      return { liked: false, likes: 0 };
    }

    const index = post.likedBy.indexOf(userId);
    if (index > -1) {
      post.likedBy.splice(index, 1);
      post.likes--;
    } else {
      post.likedBy.push(userId);
      post.likes++;
    }

    currentPosts.set(eventId, [...eventPosts]);
    this.posts.set(new Map(currentPosts));

    return { liked: index === -1, likes: post.likes };
  }

  pinPost(postId: number, eventId: number): boolean {
    const currentPosts = this.posts();
    const eventPosts = currentPosts.get(eventId) || [];
    const post = eventPosts.find(p => p.id === postId);

    if (!post) {
      return false;
    }

    // Unpin all other posts first
    eventPosts.forEach(p => {
      if (p.id !== postId) {
        p.isPinned = false;
      }
    });

    post.isPinned = !post.isPinned;
    currentPosts.set(eventId, [...eventPosts]);
    this.posts.set(new Map(currentPosts));

    return post.isPinned;
  }

  deletePost(postId: number, eventId: number): boolean {
    const currentPosts = this.posts();
    const eventPosts = currentPosts.get(eventId) || [];
    const filteredPosts = eventPosts.filter(p => p.id !== postId);

    if (filteredPosts.length === eventPosts.length) {
      return false; // Post not found
    }

    currentPosts.set(eventId, filteredPosts);
    this.posts.set(new Map(currentPosts));

    return true;
  }

  deleteComment(commentId: number, postId: number, eventId: number): boolean {
    const currentPosts = this.posts();
    const eventPosts = currentPosts.get(eventId) || [];
    const post = eventPosts.find(p => p.id === postId);

    if (!post) {
      return false;
    }

    const index = post.comments.findIndex(c => c.id === commentId);
    if (index === -1) {
      return false;
    }

    post.comments.splice(index, 1);
    currentPosts.set(eventId, [...eventPosts]);
    this.posts.set(new Map(currentPosts));

    return true;
  }
}

