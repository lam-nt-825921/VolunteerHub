/**
 * API Configuration
 * Centralized configuration for API endpoints
 */
export const API_CONFIG = {
  baseUrl: 'https://volunteerhub-s6tc.onrender.com',
  endpoints: {
    // Auth endpoints
    auth: {
      register: '/register',
      login: '/login',
      logout: '/logout',
      refresh: '/refresh',
    },
    // User endpoints
    users: {
      profile: '/users/profile',
    },
    // Admin endpoints
    admin: {
      users: '/admin/users',
    },
    // Events endpoints
    events: {
      public: '/events/public',           // GET - public events (no auth)
      base: '/events',                    // GET (auth) - all events, POST - create event
      byId: '/events/:id',                // GET - single event, PATCH - update event
      status: '/events/:id/status',       // PATCH - update event status
      inviteCode: '/events/:id/invite-code', // GET - get invite code
    },
    // Registrations endpoints
    registrations: {
      register: '/registrations/:eventId',           // POST - register for event
      joinByCode: '/registrations/join-by-code',     // POST - join by invite code
      list: '/registrations/:eventId',               // GET - list registrations
      updateStatus: '/registrations/:eventId/:registrationId/status', // PATCH - update status
      checkIn: '/registrations/:eventId/:registrationId/check-in',    // POST - check-in
      leave: '/registrations/:eventId/leave',        // POST - leave event
    },
    // Dashboard endpoints
    dashboard: {
      stats: '/dashboard/stats',                     // GET - user stats
      recommendedEvents: '/dashboard/recommended-events', // GET - recommended events
      myEvents: '/dashboard/my-events',              // GET - user's events
      upcomingEvents: '/dashboard/upcoming-events',  // GET - upcoming events
      participationHistory: '/dashboard/participation-history', // GET - history
      adminStats: '/dashboard/admin/stats',          // GET - admin stats
    },
    // Posts endpoints
    posts: {
      forEvent: '/events/:eventId/posts',           // GET - list posts for event, POST - create post
      byId: '/posts/:postId',                       // GET - get post, PATCH - update post, DELETE - delete post
      pin: '/posts/:postId/pin',                    // PATCH - pin/unpin post
      like: '/posts/:postId/like',                  // POST - like post, DELETE - unlike post
      comments: '/posts/:postId/comments',          // GET - get comments, POST - create comment
      commentById: '/comments/:commentId',          // PATCH - update comment, DELETE - delete comment
    },
    // Notifications endpoints
    notifications: {
      list: '/notifications',                       // GET - list notifications
      unreadCount: '/notifications/unread-count',   // GET - unread count
      markAsRead: '/notifications/:id/read',        // PATCH - mark as read
      markAllAsRead: '/notifications/read-all',     // PATCH - mark all as read
      delete: '/notifications/:id',                 // DELETE - delete notification
    }
  },
  // WebSocket configuration
  websocket: {
    url: 'https://volunteerhub-s6tc.onrender.com',
    namespace: '/notifications'
  }
};

