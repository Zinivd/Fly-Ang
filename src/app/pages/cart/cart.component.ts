import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProductsComponent } from '../../components/products/products.component';
import { ProductItem } from '../../models/shop.models';
import { ApiServiceService } from '../../service/api-service.service';
import { CheckoutService } from '../../service/checkout.service';

export interface CartItem {
  id: number;
  productId: number;
  productColorVariantId: number | null;
  productSizeStockId: number | null;
  name: string;
  description: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
  availableSizes: string[];
  colorName: string;
  colorCode: string;
}

@Component({
  selector: 'app-cart',
  imports: [RouterLink, CommonModule, FormsModule, ProductsComponent],
  templateUrl: './cart.component.html',
  styleUrls: [
    './cart.component.css',
    '../../components/products/products.component.css',
  ],
})
export class CartComponent implements OnInit {
  constructor(
    private location: Location,
    private api: ApiServiceService,
    private toastr: ToastrService,
    private router: Router,
    private checkout: CheckoutService,
  ) {}

  loading = true;
  products: ProductItem[] = [];
  isRecentlyViewedLoading = true;

  couponCode = '';
  appliedCoupon = '';
  couponError = '';

  readonly TAX_RATE = 0.18;
  readonly FREE_SHIPPING_THRESHOLD = 999;
  readonly SHIPPING_CHARGE = 49;
  readonly COUPONS: Record<string, number> = {
    SAVE10: 10,
    SAVE20: 20,
    FLAT50: 50,
  };

  cartItems: CartItem[] = [];

  private get userId(): string | null {
    return localStorage.getItem('userId');
  }

  ngOnInit(): void {
    this.loadCart();
    this.loadRecentlyViewed();
  }

  loadRecentlyViewed(): void {
    if (!this.userId) {
      this.isRecentlyViewedLoading = false;
      return;
    }
    this.isRecentlyViewedLoading = true;
    this.api.getRecentlyViewed<any>(this.userId).subscribe({
      next: (res) => {
        const rows = res?.data?.data ?? res?.data ?? [];
        this.products = rows.map((row: any) => this.mapProduct(row));
        this.isRecentlyViewedLoading = false;
      },
      error: (err) => {
        console.error('Error fetching recently viewed:', err);
        this.isRecentlyViewedLoading = false;
      },
    });
  }

  private mapProduct(row: any): ProductItem {
    const product = row.product || row;
    const firstVariant = product.color_variants?.[0];
    const sortedImages = firstVariant?.gallery_images
      ?.slice()
      .sort((a: any, b: any) => a.sort_order - b.sort_order);

    const discount = Number(product.discount) || 0;

    return {
      id: product.id,
      title: product.name,
      subtitle: product.brand,
      image: sortedImages?.[0]?.image_url ?? 'assets/images/no-image.png',
      rating: 5,
      review: 0,
      sp: product.effective_price,
      mrp: Number(product.unit_price),
      badge: discount > 0 ? `${discount}% OFF` : '',
      color_variants: product.color_variants || [],
    } as ProductItem;
  }

  loadCart(): void {
    if (!this.userId) {
      this.loading = false;
      return;
    }
    this.loading = true;
    this.api.getCart<any>(this.userId).subscribe({
      next: (res) => {
        const items = res?.data?.items || [];
        this.cartItems = items.map((row: any) => {
          const variant = row.color_variant;
          const sortedImages = variant?.gallery_images
            ?.slice()
            .sort((a: any, b: any) => a.sort_order - b.sort_order);

          return {
            id: row.id,
            productId: row.product?.id ?? row.product_id,
            productColorVariantId: row.product_color_variant_id ?? null,
            productSizeStockId: row.product_size_stock_id ?? null,
            name: row.product?.name ?? '',
            description: row.product?.brand ?? '',
            price: Number(row.product?.effective_price ?? 0),
            image: sortedImages?.[0]?.image_url ?? 'assets/images/no-image.png',
            size: row.size_stock?.size ?? '',
            quantity: row.quantity ?? 1,
            availableSizes: variant?.size_stocks?.map((s: any) => s.size) ?? [
              'XS',
              'S',
              'M',
              'L',
              'XL',
            ],
            colorName: variant?.color?.name ?? '',
            colorCode: variant?.color?.code ?? '',
          };
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  // Calculations (unchanged)
  get subtotal(): number {
    return this.cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
  }
  get discountPercent(): number {
    return this.appliedCoupon ? (this.COUPONS[this.appliedCoupon] ?? 0) : 0;
  }
  get discountAmount(): number {
    return Math.round((this.subtotal * this.discountPercent) / 100);
  }
  get shippingCharge(): number {
    return this.subtotal - this.discountAmount >= this.FREE_SHIPPING_THRESHOLD
      ? 0
      : this.SHIPPING_CHARGE;
  }
  get taxableAmount(): number {
    return this.subtotal - this.discountAmount;
  }
  get taxAmount(): number {
    return Math.round(this.taxableAmount * this.TAX_RATE);
  }
  get total(): number {
    return this.taxableAmount + this.shippingCharge + this.taxAmount;
  }
  get totalItems(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }
  get amountForFreeShipping(): number {
    const remaining =
      this.FREE_SHIPPING_THRESHOLD - (this.subtotal - this.discountAmount);
    return remaining > 0 ? remaining : 0;
  }

  // Cart Actions -> now call the API, with optimistic UI + rollback
  increaseQty(item: CartItem): void {
    if (item.quantity >= 10) return;
    const prev = item.quantity;
    item.quantity++;
    this.syncQuantity(item, prev);
  }

  decreaseQty(item: CartItem): void {
    if (item.quantity <= 1) return;
    const prev = item.quantity;
    item.quantity--;
    this.syncQuantity(item, prev);
  }

  onQtyInput(item: CartItem, event: Event): void {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    const prev = item.quantity;
    item.quantity = !isNaN(val) && val >= 1 && val <= 10 ? val : 1;
    this.syncQuantity(item, prev);
  }

  private syncQuantity(item: CartItem, previousQty: number): void {
    if (!this.userId) return;
    this.api
      .updateCartItem(this.userId, item.id, { quantity: item.quantity })
      .subscribe({
        error: () => {
          item.quantity = previousQty; // rollback on failure
          this.toastr.error('Failed to update quantity.');
        },
      });
  }

  removeItem(id: number): void {
    if (!this.userId) return;
    const removed = this.cartItems.find((i) => i.id === id);
    this.cartItems = this.cartItems.filter((item) => item.id !== id);
    if (this.cartItems.length === 0) {
      this.appliedCoupon = '';
      this.couponCode = '';
    }

    this.api.removeCartItem(this.userId, id).subscribe({
      next: () => this.toastr.success('Removed from cart.'),
      error: () => {
        if (removed) this.cartItems.push(removed); // rollback on failure
        this.toastr.error('Failed to remove item.');
      },
    });
  }

  itemTotal(item: CartItem): number {
    return item.price * item.quantity;
  }

  // Coupon (unchanged)
  applyCoupon(): void {
    const code = this.couponCode.trim().toUpperCase();
    this.couponError = '';
    if (!code) {
      this.couponError = 'Please enter a coupon code.';
      return;
    }
    if (this.COUPONS[code] !== undefined) {
      this.appliedCoupon = code;
      this.couponCode = '';
    } else {
      this.couponError = 'Invalid coupon code. Try SAVE10, SAVE20, or FLAT50.';
      this.appliedCoupon = '';
    }
  }

  removeCoupon(): void {
    this.appliedCoupon = '';
    this.couponCode = '';
    this.couponError = '';
  }

  goBack(): void {
    this.location.back();
  }

  proceedToCheckout(): void {
    if (this.cartItems.length === 0) return;
    this.checkout.setOrderSummary({
      items: this.cartItems.map((i) => ({
        name: i.name,
        qty: i.quantity,
        price: i.price,
        image: i.image,
        size: i.size,
        productId: i.productId,
        productColorVariantId: i.productColorVariantId,
        productSizeStockId: i.productSizeStockId,
      })),
      subtotal: this.subtotal,
      discountAmount: this.discountAmount,
      shippingCharge: this.shippingCharge,
      taxAmount: this.taxAmount,
      total: this.total,
      couponCode: this.appliedCoupon || undefined,
    });
    this.router.navigate(['/checkout']);
  }
}
