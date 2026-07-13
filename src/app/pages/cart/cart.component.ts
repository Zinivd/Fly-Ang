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
  /** Per-unit price AFTER the product's own discount (flat/percent) — before any coupon. */
  price: number;
  /** Per-unit original list price, before any discount. */
  mrp: number;
  discountType: 'flat' | 'percent' | null;
  /** Raw discount value from the product: a ₹ amount when flat, a % when percent. */
  discountValue: number;
  image: string;
  size: string;
  quantity: number;
  maxStock: number;
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

  // Product/discounted prices are treated as PRE-TAX (tax-exclusive).
  // GST is calculated fresh from taxableAmount and added on top in `total`.
  // NOTE: if the product page still displays "Inclusive of all taxes" anywhere,
  // that copy needs to be updated/removed to match this pricing model —
  // otherwise customers will see conflicting claims about whether tax is included.
  readonly TAX_RATE = 0.18;
  readonly FREE_SHIPPING_THRESHOLD = 999;
  readonly SHIPPING_CHARGE = 49;
  readonly COUPONS: Record<string, number> = {
    SAVE10: 10,
    SAVE20: 20,
    FLAT50: 50,
  };
  readonly DEFAULT_MAX_QTY = 10;

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

  /**
   * Computes the per-unit discounted price from the product's own
   * discount_type/discount fields:
   *   - 'flat'    → subtract the ₹ amount directly
   *   - 'percent' → subtract that % of the MRP
   *   - anything else / no discount → MRP unchanged
   * Never allowed to go below 0.
   */
  private calcDiscountedPrice(
    mrp: number,
    discountType: 'flat' | 'percent' | null,
    discountValue: number,
  ): number {
    if (!discountType || !discountValue) return mrp;
    if (discountType === 'flat') {
      return Math.max(this.round2(mrp - discountValue), 0);
    }
    if (discountType === 'percent') {
      return Math.max(this.round2(mrp - (mrp * discountValue) / 100), 0);
    }
    return mrp;
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

          const mrp = this.round2(Number(row.product?.unit_price ?? 0));
          const discountType = (row.product?.discount_type as 'flat' | 'percent' | null) ?? null;
          const discountValue = Number(row.product?.discount ?? 0);
          // Computed explicitly from discount_type/discount rather than trusting
          // effective_price blindly, so flat vs percent is always handled correctly
          // and the discount amount can be surfaced in the order summary.
          const price = this.calcDiscountedPrice(mrp, discountType, discountValue);

          return {
            id: row.id,
            productId: row.product?.id ?? row.product_id,
            productColorVariantId: row.product_color_variant_id ?? null,
            productSizeStockId: row.product_size_stock_id ?? null,
            name: row.product?.name ?? '',
            description: row.product?.brand ?? '',
            price,
            mrp,
            discountType,
            discountValue,
            image: sortedImages?.[0]?.image_url ?? 'assets/images/no-image.png',
            size: row.size_stock?.size ?? '',
            quantity: row.quantity ?? 1,
            // Real stock for this exact size/color, so qty controls can't
            // let someone order more than what's actually available.
            maxStock: Number(row.size_stock?.stock ?? this.DEFAULT_MAX_QTY),
            availableSizes: variant?.size_stocks?.map((s: any) => s.size) ?? [
              row.size_stock?.size ?? '',
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

  // ---------- Calculations ----------

  /** Sum of every item's original MRP × quantity, BEFORE any discount. */
  get subtotal(): number {
    return this.round2(
      this.cartItems.reduce((sum, item) => sum + item.mrp * item.quantity, 0),
    );
  }

  /** Total ₹ saved from each product's own flat/percent discount, summed across the cart. */
  get productDiscountTotal(): number {
    return this.round2(
      this.cartItems.reduce((sum, item) => sum + (item.mrp - item.price) * item.quantity, 0),
    );
  }

  get discountPercent(): number {
    return this.appliedCoupon ? (this.COUPONS[this.appliedCoupon] ?? 0) : 0;
  }

  /** Amount left after the product-level discount, before the coupon is applied. */
  get postProductDiscountAmount(): number {
    return this.round2(this.subtotal - this.productDiscountTotal);
  }

  /** Extra ₹ saved from the coupon code, applied on top of the already product-discounted amount. */
  get couponDiscountAmount(): number {
    return this.round2((this.postProductDiscountAmount * this.discountPercent) / 100);
  }

  /**
   * Total discount shown to the customer = product discount (flat/percent set on
   * the product) + coupon discount. Previously this only reflected the coupon,
   * so a product with a built-in discount showed "Discount: ₹0.00" even though
   * money was already being taken off — that was the bug.
   */
  get discountAmount(): number {
    return this.round2(this.productDiscountTotal + this.couponDiscountAmount);
  }

  /** Amount the customer is actually charged for goods, after both discounts. */
  get taxableAmount(): number {
    return this.round2(this.postProductDiscountAmount - this.couponDiscountAmount);
  }

  get shippingCharge(): number {
    return this.taxableAmount >= this.FREE_SHIPPING_THRESHOLD || this.cartItems.length === 0
      ? 0
      : this.SHIPPING_CHARGE;
  }

  /**
   * GST charged FRESH on top of the discounted (pre-tax) goods amount.
   * `taxableAmount` is treated as the base price — GST is not baked into
   * it, so this is a forward calculation (base × rate), and IS added to
   * `total` below.
   */
  get taxAmount(): number {
    return this.round2(this.taxableAmount * this.TAX_RATE);
  }

  get total(): number {
    // Discounted goods (pre-tax) + fresh GST on top + shipping.
    return this.round2(this.taxableAmount + this.taxAmount + this.shippingCharge);
  }

  get totalItems(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  get amountForFreeShipping(): number {
    const remaining = this.round2(this.FREE_SHIPPING_THRESHOLD - this.taxableAmount);
    return remaining > 0 ? remaining : 0;
  }

  // ---------- Cart Actions (optimistic UI + rollback) ----------
  increaseQty(item: CartItem): void {
    if (item.quantity >= item.maxStock) return;
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
    const raw = parseInt((event.target as HTMLInputElement).value, 10);
    const prev = item.quantity;
    if (isNaN(raw)) {
      (event.target as HTMLInputElement).value = String(item.quantity);
      return;
    }
    // Clamp into range instead of silently discarding the typed value.
    const clamped = Math.min(Math.max(raw, 1), item.maxStock);
    item.quantity = clamped;
    (event.target as HTMLInputElement).value = String(clamped);
    if (clamped !== prev) this.syncQuantity(item, prev);
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

  /** Line total = post-product-discount unit price × quantity (pre-coupon). */
  itemTotal(item: CartItem): number {
    return this.round2(item.price * item.quantity);
  }

  // ---------- Coupon ----------
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
        mrp: i.mrp,
        discountType: i.discountType,
        discountValue: i.discountValue,
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

  private round2(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}