import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

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

  categories = ['Môi trường', 'Giáo dục', 'Y tế', 'Xã hội', 'Văn hóa', 'Thể thao'];
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

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.save.emit(this.formData);
  }

  validateForm(): boolean {
    if (!this.formData.title?.trim()) {
      alert('Vui lòng nhập tiêu đề sự kiện!');
      return false;
    }

    if (!this.formData.description?.trim()) {
      alert('Vui lòng nhập mô tả sự kiện!');
      return false;
    }

    if (this.formData.description.trim().length < 20) {
      alert('Mô tả sự kiện phải có ít nhất 20 ký tự!');
      return false;
    }

    if (!this.formData.startTime) {
      alert('Vui lòng chọn ngày bắt đầu!');
      return false;
    }

    if (!this.formData.endTime) {
      alert('Vui lòng chọn ngày kết thúc!');
      return false;
    }

    if (new Date(this.formData.startTime) >= new Date(this.formData.endTime)) {
      alert('Ngày kết thúc phải sau ngày bắt đầu!');
      return false;
    }

    if (!this.formData.location?.trim()) {
      alert('Vui lòng nhập địa điểm!');
      return false;
    }

    if (!this.formData.category) {
      alert('Vui lòng chọn danh mục!');
      return false;
    }

    return true;
  }

  onCancel() {
    this.cancel.emit();
  }
}

