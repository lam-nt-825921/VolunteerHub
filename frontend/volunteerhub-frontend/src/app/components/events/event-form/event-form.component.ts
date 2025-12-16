import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Event } from '../../../services/events.service';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './event-form.component.html',
  styleUrl: './event-form.component.scss'
})
export class EventFormComponent implements OnInit {
  @Input() event: Event | null = null;
  @Input() managerId!: number;
  @Input() managerName!: string;
  @Output() save = new EventEmitter<Partial<Event>>();
  @Output() cancel = new EventEmitter<void>();

  formData: Partial<Event> = {
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    category: '',
    maxParticipants: 50
  };

  categories = ['Môi trường', 'Giáo dục', 'Y tế', 'Xã hội', 'Văn hóa', 'Thể thao'];

  ngOnInit() {
    if (this.event) {
      this.formData = {
        title: this.event.title,
        description: this.event.description,
        startDate: this.event.startDate.split('T')[0] + 'T' + this.event.startDate.split('T')[1].substring(0, 5),
        endDate: this.event.endDate.split('T')[0] + 'T' + this.event.endDate.split('T')[1].substring(0, 5),
        location: this.event.location,
        category: this.event.category,
        maxParticipants: this.event.maxParticipants
      };
    } else {
      // Set default dates
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      this.formData.startDate = this.formatDateForInput(tomorrow);
      this.formData.endDate = this.formatDateForInput(tomorrow);
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

    const eventData: Partial<Event> = {
      ...this.formData,
      managerId: this.managerId,
      managerName: this.managerName
    };

    this.save.emit(eventData);
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

    if (!this.formData.startDate) {
      alert('Vui lòng chọn ngày bắt đầu!');
      return false;
    }

    if (!this.formData.endDate) {
      alert('Vui lòng chọn ngày kết thúc!');
      return false;
    }

    if (new Date(this.formData.startDate) >= new Date(this.formData.endDate)) {
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

    if (!this.formData.maxParticipants || this.formData.maxParticipants < 1) {
      alert('Số người tham gia tối đa phải lớn hơn 0!');
      return false;
    }

    return true;
  }

  onCancel() {
    this.cancel.emit();
  }
}

