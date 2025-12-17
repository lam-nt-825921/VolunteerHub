/**
 * API Configuration
 * Centralized configuration for API endpoints
 */
export const API_CONFIG = {
  baseUrl: 'http://localhost:3000',
  endpoints: {
    auth: {
      register: '/register',
      login: '/login',
      logout: '/logout',
      refresh: '/refresh',
    },
    users: {
      profile: '/users/profile',
    }
  }
};

