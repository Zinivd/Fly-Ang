import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiServiceService } from '../../../service/api-service.service';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './review.component.html',
  styleUrl: './review.component.css',
})
export class ReviewComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private api: ApiServiceService,
  ) {}

  loading = true;
  orderId: string | null = null;
  status: 'success' | 'failed' | null = null;
  orderDetails: any = null;

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.orderId = params.get('orderId');
      this.status = (params.get('status') as 'success' | 'failed') || null;

      if (this.orderId) {
        this.loadOrder(this.orderId);
      } else {
        this.loading = false;
      }
    });
  }

  loadOrder(orderId: string): void {
    this.loading = true;
    this.api.getOrderById<any>(orderId).subscribe({
      next: (res) => {
        this.orderDetails = res?.data ?? null;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  get items(): any[] {
    return (this.orderDetails?.items || []).map((i: any) => ({
      name: i.product_name ?? '',
      color: i.color ?? '',
      size: i.size ?? '',
      qty: i.quantity ?? 1,
      price: Number(i.price ?? 0),
      total: Number(i.total ?? 0),
      image: 'assets/images/no-image.png', // order items API doesn't return an image URL
    }));
  }
  get subtotal(): number {
    return Number(this.orderDetails?.subtotal ?? 0);
  }
  get discountAmount(): number {
    return Number(this.orderDetails?.discount ?? 0);
  }
  get shippingCharge(): number {
    return Number(this.orderDetails?.shipping ?? 0);
  }
  get taxAmount(): number {
    return Number(this.orderDetails?.tax ?? 0);
  }
  get total(): number {
    return Number(this.orderDetails?.amount ?? 0);
  }
  get orderNumber(): string {
    return this.orderDetails?.order_id ?? '';
  }
  get orderDate(): string {
    return this.orderDetails?.created_at ?? '';
  }
  get shippingAddress(): string {
    return this.orderDetails?.shipping_address ?? '';
  }
  get customerName(): string {
    return this.orderDetails?.customer_name ?? '';
  }
  get customerPhone(): string {
    return this.orderDetails?.customer_phone ?? '';
  }
  get paymentStatus(): string {
    return this.orderDetails?.payment_status ?? '';
  }
}
