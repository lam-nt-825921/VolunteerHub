import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'volunteer' | 'manager' | 'admin' | 'guest';
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: 'volunteer' | 'manager';
}

// Mock accounts for testing
export const MOCK_ACCOUNTS = {
  volunteer: [
    { email: 'volunteer1@test.com', password: '123456', name: 'Nguyễn Văn A', role: 'volunteer' as const },
    { email: 'volunteer2@test.com', password: '123456', name: 'Trần Thị B', role: 'volunteer' as const },
  ],
  manager: [
    { email: 'manager1@test.com', password: '123456', name: 'Lê Văn C', role: 'manager' as const },
    { email: 'manager2@test.com', password: '123456', name: 'Phạm Thị D', role: 'manager' as const },
  ],
  admin: [
    { email: 'admin@test.com', password: '123456', name: 'Admin User', role: 'admin' as const },
  ]
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = signal<User | null>(null);
  public readonly user = this.currentUser.asReadonly();

  constructor(private router: Router) {
    // Check for stored user session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser.set(JSON.parse(storedUser));
    }
  }

  login(credentials: LoginCredentials): { success: boolean; message: string; user?: User } {
    // Check all mock accounts
    const allAccounts = [
      ...MOCK_ACCOUNTS.volunteer,
      ...MOCK_ACCOUNTS.manager,
      ...MOCK_ACCOUNTS.admin
    ];

    const account = allAccounts.find(
      acc => acc.email === credentials.email && acc.password === credentials.password
    );

    if (account) {
      const user: User = {
        id: account.email === 'admin@test.com' ? 999 : 
            account.email === 'manager1@test.com' ? 1 :
            account.email === 'manager2@test.com' ? 2 :
            account.email === 'volunteer1@test.com' ? 101 :
            account.email === 'volunteer2@test.com' ? 102 : Date.now(),
        email: account.email,
        name: account.name,
        role: account.role,
      };
      this.currentUser.set(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return { success: true, message: 'Đăng nhập thành công!', user };
    }

    return { success: false, message: 'Email hoặc mật khẩu không đúng!' };
  }

  register(data: RegisterData): { success: boolean; message: string; user?: User } {
    // Validate passwords match
    if (data.password !== data.confirmPassword) {
      return { success: false, message: 'Mật khẩu xác nhận không khớp!' };
    }

    // Check if email already exists
    const allAccounts = [
      ...MOCK_ACCOUNTS.volunteer,
      ...MOCK_ACCOUNTS.manager,
      ...MOCK_ACCOUNTS.admin
    ];

    if (allAccounts.some(acc => acc.email === data.email)) {
      return { success: false, message: 'Email đã được sử dụng!' };
    }

    // Create new user (default to volunteer role)
    const role = data.role || 'volunteer';
    const user: User = {
      id: Date.now(),
      email: data.email,
      name: data.name,
      role: role,
    };

    // In real app, this would be a POST request
    // For now, just add to mock accounts
    if (role === 'volunteer') {
      MOCK_ACCOUNTS.volunteer.push({
        email: data.email,
        password: data.password,
        name: data.name,
        role: 'volunteer'
      });
    } else if (role === 'manager') {
      MOCK_ACCOUNTS.manager.push({
        email: data.email,
        password: data.password,
        name: data.name,
        role: 'manager'
      });
    }

    this.currentUser.set(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    return { success: true, message: 'Đăng ký thành công!', user };
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
    this.router.navigate(['/']);
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  hasRole(role: 'volunteer' | 'manager' | 'admin'): boolean {
    return this.currentUser()?.role === role;
  }

  isGuest(): boolean {
    return !this.isAuthenticated();
  }

  getAllUsers(): User[] {
    // In a real app, this would fetch from an API
    // For now, return mock users from MOCK_ACCOUNTS
    const allAccounts = [
      ...MOCK_ACCOUNTS.volunteer,
      ...MOCK_ACCOUNTS.manager,
      ...MOCK_ACCOUNTS.admin
    ];

    return allAccounts.map((acc, index) => ({
      id: acc.email === 'admin@test.com' ? 999 :
          acc.email === 'manager1@test.com' ? 1 :
          acc.email === 'manager2@test.com' ? 2 :
          acc.email === 'volunteer1@test.com' ? 101 :
          acc.email === 'volunteer2@test.com' ? 102 : 1000 + index,
      email: acc.email,
      name: acc.name,
      role: acc.role,
    }));
  }

  toggleUserActive(userId: number): { success: boolean; message: string } {
    // In a real app, this would be an API call
    // For now, just return success
    const user = this.getAllUsers().find(u => u.id === userId);
    if (!user) {
      return { success: false, message: 'Không tìm thấy người dùng!' };
    }
    return { success: true, message: 'Đã cập nhật trạng thái người dùng!' };
  }

  changeUserRole(userId: number, newRole: 'volunteer' | 'manager' | 'admin'): { success: boolean; message: string } {
    // In a real app, this would be an API call
    const user = this.getAllUsers().find(u => u.id === userId);
    if (!user) {
      return { success: false, message: 'Không tìm thấy người dùng!' };
    }
    // Update the user's role in mock data
    const allAccounts = [
      ...MOCK_ACCOUNTS.volunteer,
      ...MOCK_ACCOUNTS.manager,
      ...MOCK_ACCOUNTS.admin
    ];
    const account = allAccounts.find(acc => acc.email === user.email);
    if (account) {
      account.role = newRole;
    }
    return { success: true, message: `Đã thay đổi vai trò thành ${newRole}!` };
  }
}

