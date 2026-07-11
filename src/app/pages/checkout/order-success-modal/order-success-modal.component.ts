import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-order-success-modal',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-success-modal.component.html',
  styleUrls: ['./order-success-modal.component.css'],
})
export class OrderSuccessModalComponent {
  @Input() show = false;
  @Input() orderDetails: any = null;
  @Input() items: any[] = [];
  @Input() subtotal = 0;
  @Input() discountAmount = 0;
  @Input() shippingCharge = 0;
  @Input() taxAmount = 0;
  @Input() total = 0;
  @Input() orderNumber = '';
  @Input() orderDate = '';

  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.closed.emit();
  }

  // Clicking the dark backdrop also closes the modal — clicking inside
  // the card itself should not (event.stopPropagation() on the card).
  onBackdropClick(): void {
    this.close();
  }

  formatDate(value: string): string {
    if (!value) return '-';
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}