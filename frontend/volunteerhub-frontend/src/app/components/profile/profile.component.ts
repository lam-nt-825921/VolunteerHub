import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { AuthService } from '../../services/auth.service';
import { UsersApiService, UserProfileResponse, UpdateProfileRequest } from '../../services/users-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatIconModule,
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  isEditing = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  profile: UserProfileResponse | null = null;
  editData: UpdateProfileRequest = {
    fullName: '',
    phone: '',
    password: '',
  };
  selectedAvatar: File | null = null;
  avatarPreview: string | null = null;
  fileSizeWarning = signal<string | null>(null);

  constructor(
    public authService: AuthService,
    private usersApi: UsersApiService
  ) {}

  async ngOnInit() {
    await this.loadProfile();
  }

  async loadProfile() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    try {
      this.profile = await firstValueFrom(this.usersApi.getProfile());
      this.editData = {
        fullName: this.profile.fullName || '',
        phone: this.profile.phone || '',
        password: '', // Don't pre-fill password
      };
      this.avatarPreview = this.profile.avatar || null;
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'Không thể tải thông tin profile');
    } finally {
      this.isLoading.set(false);
    }
  }

  startEdit() {
    if (this.profile) {
      this.editData = {
        fullName: this.profile.fullName || '',
        phone: this.profile.phone || '',
        password: '',
      };
      this.avatarPreview = this.profile.avatar || null;
      this.selectedAvatar = null;
      this.isEditing.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');
    }
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.selectedAvatar = null;
    this.avatarPreview = this.profile?.avatar || null;
    this.errorMessage.set('');
    this.successMessage.set('');
    this.fileSizeWarning.set(null);
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.errorMessage.set('Vui lòng chọn file ảnh hợp lệ');
        this.fileSizeWarning.set(null);
        return;
      }

      // Check file size for warning (10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        this.fileSizeWarning.set(`Cảnh báo: ${file.name} vượt quá 10MB (${fileSizeMB}MB). Vui lòng chọn ảnh nhỏ hơn.`);
      } else {
        this.fileSizeWarning.set(null);
      }

      this.selectedAvatar = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async saveProfile() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    // Validation
    if (!this.editData.fullName || this.editData.fullName.trim() === '') {
      this.errorMessage.set('Vui lòng nhập họ và tên');
      this.isLoading.set(false);
      return;
    }

    if (this.editData.password && this.editData.password.length < 6) {
      this.errorMessage.set('Mật khẩu phải có ít nhất 6 ký tự');
      this.isLoading.set(false);
      return;
    }

    try {
      const updateData: UpdateProfileRequest = {
        fullName: this.editData.fullName.trim(),
        phone: this.editData.phone?.trim() || undefined,
      };

      // Only include password if it's provided
      if (this.editData.password && this.editData.password.trim() !== '') {
        updateData.password = this.editData.password;
      }

      const updatedProfile = await firstValueFrom(
        this.usersApi.updateProfile(updateData, this.selectedAvatar || undefined)
      );

      this.profile = updatedProfile;
      
      // Update auth service user data
      const currentUser = this.authService.user();
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          name: updatedProfile.fullName || updatedProfile.email.split('@')[0],
          avatar: updatedProfile.avatar || undefined
        };
        // Note: AuthService doesn't have a method to update user, so we'll need to reload
        // For now, just update localStorage
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }

      this.successMessage.set('Cập nhật profile thành công!');
      this.isEditing.set(false);
      this.selectedAvatar = null;

      // Clear success message after 3 seconds
      setTimeout(() => {
        this.successMessage.set('');
      }, 3000);
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'Cập nhật profile thất bại. Vui lòng thử lại!');
    } finally {
      this.isLoading.set(false);
    }
  }

  getRoleLabel(role: string): string {
    const roleMap: Record<string, string> = {
      'VOLUNTEER': 'Tình nguyện viên',
      'MANAGER': 'Quản lý sự kiện',
      'ADMIN': 'Quản trị viên'
    };
    return roleMap[role] || role;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

