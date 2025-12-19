import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AlertService } from '../../../services/alert.service';

// Flexible event input interface that works with both legacy Event and DashboardEvent
interface EventInput {
  id?: number;
  title?: string;
  description?: string;
  startTime?: string;
  startDate?: string;
  endTime?: string;
  endDate?: string;
  location?: string;
  category?: { name?: string } | string | null;
  visibility?: string;
  coverImage?: string | null;
}

// Output interface for the form
export interface EventFormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  category: string;
  visibility: string;
  coverImage?: string;
}

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './event-form.component.html',
  styleUrl: './event-form.component.scss'
})
export class EventFormComponent implements OnInit {
  @Input() event: EventInput | null = null;
  @Input() managerId!: number;
  @Input() managerName!: string;
  @Output() save = new EventEmitter<EventFormData>();
  @Output() cancel = new EventEmitter<void>();

  formData: EventFormData = {
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    category: '',
    visibility: 'PUBLIC',
    coverImage: ''
  };

  selectedFile: File | null = null;
  previewUrl: string | null = null;

  categories = ['Môi trường', 'Giáo dục', 'Y tế', 'Xã hội', 'Văn hóa', 'Thể thao'];

  fieldErrors: { [key: string]: string } = {};

  constructor(private alertService: AlertService) {}
  visibilities = [
    { value: 'PUBLIC', label: 'Công khai' },
    { value: 'INTERNAL', label: 'Nội bộ' },
    { value: 'PRIVATE', label: 'Riêng tư' }
  ];

  ngOnInit() {
    if (this.event) {
      // Handle both new API format (startTime) and legacy format (startDate)
      const startTime = this.event.startTime || this.event.startDate || '';
      const endTime = this.event.endTime || this.event.endDate || '';
      
      // Handle category as object or string
      let categoryName = '';
      if (typeof this.event.category === 'object' && this.event.category?.name) {
        categoryName = this.event.category.name;
      } else if (typeof this.event.category === 'string') {
        categoryName = this.event.category;
      }

      this.formData = {
        title: this.event.title || '',
        description: this.event.description || '',
        startTime: this.formatDateTimeForInput(startTime),
        endTime: this.formatDateTimeForInput(endTime),
        location: this.event.location || '',
        category: categoryName,
        visibility: this.event.visibility || 'PUBLIC',
        coverImage: this.event.coverImage || ''
      };
      
      // Set preview if there's an existing cover image
      if (this.event.coverImage) {
        this.previewUrl = this.event.coverImage;
      }
    } else {
      // Set default dates
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      this.formData.startTime = this.formatDateForInput(tomorrow);
      this.formData.endTime = this.formatDateForInput(tomorrow);
    }
  }

  formatDateTimeForInput(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return this.formatDateForInput(date);
    } catch {
      return dateString.split('T')[0] + 'T' + (dateString.split('T')[1]?.substring(0, 5) || '00:00');
    }
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.alertService.showError('Vui lòng chọn file ảnh hợp lệ');
        return;
      }

      // Validate file size (max 30MB)
      if (file.size > 30 * 1024 * 1024) {
        this.alertService.showError('Kích thước file không được vượt quá 30MB');
        return;
      }

      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.selectedFile = null;
    this.previewUrl = null;
    this.formData.coverImage = '';
  }

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    // Cover image is optional
    // If a file is selected, we'd need to upload it first to get a URL
    // For now, only accept URL strings (backend validation requires valid URL format)
    // If user selected a file, they need to provide a URL or the image will be omitted
    if (this.selectedFile && !this.formData.coverImage?.trim()) {
      // File selected but no URL provided - make coverImage optional (omit it)
      this.formData.coverImage = undefined;
    } else if (this.formData.coverImage?.trim()) {
      // Validate that it's a proper URL format (not base64)
      if (this.formData.coverImage.startsWith('data:')) {
        this.alertService.showWarning('Backend chỉ chấp nhận URL ảnh hợp lệ. Vui lòng upload ảnh lên server và nhập URL, hoặc để trống để bỏ qua ảnh bìa.');
        this.formData.coverImage = undefined;
      }
      // If it's a valid URL string, keep it
    } else {
      // No cover image - that's fine, it's optional
      this.formData.coverImage = undefined;
    }

    this.save.emit(this.formData);
  }

  validateForm(): boolean {
    // Clear previous errors
    this.fieldErrors = {};
    let isValid = true;

    if (!this.formData.title?.trim()) {
      this.fieldErrors['title'] = 'Vui lòng nhập tiêu đề sự kiện!';
      isValid = false;
    }

    if (!this.formData.description?.trim()) {
      this.fieldErrors['description'] = 'Vui lòng nhập mô tả sự kiện!';
      isValid = false;
    } else if (this.formData.description.trim().length < 20) {
      this.fieldErrors['description'] = 'Mô tả sự kiện phải có ít nhất 20 ký tự!';
      isValid = false;
    }

    if (!this.formData.startTime) {
      this.fieldErrors['startTime'] = 'Vui lòng chọn ngày bắt đầu!';
      isValid = false;
    }

    if (!this.formData.endTime) {
      this.fieldErrors['endTime'] = 'Vui lòng chọn ngày kết thúc!';
      isValid = false;
    } else if (this.formData.startTime && new Date(this.formData.startTime) >= new Date(this.formData.endTime)) {
      this.fieldErrors['endTime'] = 'Ngày kết thúc phải sau ngày bắt đầu!';
      isValid = false;
    }

    if (!this.formData.location?.trim()) {
      this.fieldErrors['location'] = 'Vui lòng nhập địa điểm!';
      isValid = false;
    }

    if (!this.formData.category) {
      this.fieldErrors['category'] = 'Vui lòng chọn danh mục!';
      isValid = false;
    }

    return isValid;
  }

  clearFieldError(fieldName: string) {
    if (this.fieldErrors[fieldName]) {
      delete this.fieldErrors[fieldName];
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}

