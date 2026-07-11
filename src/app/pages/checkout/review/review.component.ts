import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiServiceService } from '../../../service/api-service.service';
import { OrderSuccessModalComponent } from '../order-success-modal/order-success-modal.component';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, RouterLink, OrderSuccessModalComponent],
  templateUrl: './review.component.html',
  styleUrl: './review.component.css',
})
export class ReviewComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private api: ApiServiceService,
    private Router: Router,
  ) {}

  loading = true;
  orderId: string | null = null;
  status: 'success' | 'failed' | null = null;
  orderDetails: any = null;

  // Controls the success popup — opens automatically once the order
  // loads successfully with ?status=success in the URL.
  showSuccessModal = false;

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
        if (this.status === 'success' && this.orderDetails) {
          this.showSuccessModal = true;
          this.sentMail();
        }
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.Router.navigateByUrl('/review');
  }

  sentMail(): void {
    this.api.sentMail<any>(this.orderId).subscribe({
      next: (res) => {
        // this.toastr.success('Mail sent successfully');
      },
      error: () => {
        // this.toastr.error('Error sending mail');
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // NEW — Pulls the correct product image for each order line item.
  // Priority: order item's own color-variant gallery image (first one)
  // -> thumbnail image -> product_details.color gallery (string URLs)
  // -> fallback placeholder.
  // ═══════════════════════════════════════════════════════════════
  private resolveItemImage(item: any): string {
    const variantGallery = item?.product_color_variant?.gallery_images;
    if (Array.isArray(variantGallery) && variantGallery.length > 0) {
      return variantGallery[0]?.image_url || 'assets/images/no-image.png';
    }

    const variantThumb = item?.product_color_variant?.thumbnail_image?.image_url;
    if (variantThumb) {
      return variantThumb;
    }

    const detailsGallery = item?.product_details?.color?.gallery_images;
    if (Array.isArray(detailsGallery) && detailsGallery.length > 0) {
      return detailsGallery[0];
    }

    return 'assets/images/no-image.png';
  }

  get items(): any[] {
    return (this.orderDetails?.items || []).map((i: any) => ({
      name: i.product_name ?? '',
      color: i.color ?? '',
      size: i.size ?? '',
      qty: i.quantity ?? 1,
      price: Number(i.price ?? 0),
      total: Number(i.total ?? 0),
      image: this.resolveItemImage(i),
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