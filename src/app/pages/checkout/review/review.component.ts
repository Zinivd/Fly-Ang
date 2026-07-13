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
      next: () => {
        // this.toastr.success('Mail sent successfully');
      },
      error: () => {
        // this.toastr.error('Error sending mail');
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // Pulls the correct product image for each order line item.
  //
  // Priority (matched against the ACTUAL API payload shape):
  // 1. item.product_color_variant.gallery_images[0].image_url
  //    -> array of OBJECTS: { image_url, sort_order, ... }
  //    sorted by sort_order so we always grab the first uploaded image.
  // 2. item.product_color_variant.thumbnail_image.image_url
  // 3. item.product_details.color.gallery_images[0]
  //    -> array of plain STRING urls (different shape than #1!)
  // 4. item.product.color_variants[] matched by product_color_variant_id
  //    -> fallback when the order-item snapshot itself has no gallery
  //       but the live product record still does (variant only has
  //       color info, no images, in some responses).
  // 5. placeholder image
  // ═══════════════════════════════════════════════════════════════
  private resolveItemImage(item: any): string {
    const PLACEHOLDER = 'assets/images/no-image.png';

    // 1. product_color_variant.gallery_images -> array of objects
    const variantGallery = item?.product_color_variant?.gallery_images;
    if (Array.isArray(variantGallery) && variantGallery.length > 0) {
      const sorted = [...variantGallery].sort(
        (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
      );
      const url = sorted[0]?.image_url;
      if (url) return url;
    }

    // 2. product_color_variant.thumbnail_image
    const variantThumb = item?.product_color_variant?.thumbnail_image?.image_url;
    if (variantThumb) return variantThumb;

    // 3. product_details.color.gallery_images -> array of plain strings
    const detailsGallery = item?.product_details?.color?.gallery_images;
    if (Array.isArray(detailsGallery) && detailsGallery.length > 0 && detailsGallery[0]) {
      return detailsGallery[0];
    }

    // 4. product.color_variants[] matched by product_color_variant_id
    const productVariants = item?.product?.color_variants;
    if (Array.isArray(productVariants) && item?.product_color_variant_id) {
      const matched = productVariants.find(
        (v: any) => v.id === item.product_color_variant_id,
      );
      const matchedGallery = matched?.gallery_images;
      if (Array.isArray(matchedGallery) && matchedGallery.length > 0) {
        const url = matchedGallery[0]?.image_url || matchedGallery[0];
        if (url) return url;
      }
    }

    return PLACEHOLDER;
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