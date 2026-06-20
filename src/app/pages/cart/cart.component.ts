import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsComponent } from '../../components/products/products.component';
import { PRODUCT_DATA } from '../../data/product.data';
import { ProductItem } from '../../models/shop.models';

export interface CartItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
  availableSizes: string[];
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
  constructor(private location: Location) {}

  // Recently viewed products
  products: ProductItem[] = PRODUCT_DATA;

  // Coupon
  couponCode: string = '';
  appliedCoupon: string = '';
  couponError: string = '';

  // Tax rate (e.g. 18% GST)
  readonly TAX_RATE = 0.18;

  // Shipping threshold
  readonly FREE_SHIPPING_THRESHOLD = 999;
  readonly SHIPPING_CHARGE = 49;

  // Available coupons
  readonly COUPONS: Record<string, number> = {
    SAVE10: 10,
    SAVE20: 20,
    FLAT50: 50,
  };

  // Cart items
  cartItems: CartItem[] = [
    {
      id: 1,
      name: 'Bottle Green Ankle Leggings',
      description: 'Seamless fitting | Comfortable',
      price: 499,
      image: 'assets/images/Products/1.png',
      size: 'S',
      quantity: 1,
      availableSizes: ['XS', 'S', 'M', 'L', 'XL'],
    },
    {
      id: 2,
      name: 'Classic Black Sports Bra',
      description: 'Medium support | Moisture-wicking',
      price: 349,
      image: 'assets/images/Products/2.png',
      size: 'M',
      quantity: 2,
      availableSizes: ['XS', 'S', 'M', 'L', 'XL'],
    },
    {
      id: 3,
      name: 'Navy Blue Yoga Pants',
      description: 'High waist | 4-way stretch',
      price: 599,
      image: 'assets/images/Products/3.png',
      size: 'L',
      quantity: 1,
      availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    },
  ];

  ngOnInit(): void {}

  // Calculations
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

  // Cart Actions
  increaseQty(item: CartItem): void {
    if (item.quantity < 10) item.quantity++;
  }

  decreaseQty(item: CartItem): void {
    if (item.quantity > 1) item.quantity--;
  }

  onQtyInput(item: CartItem, event: Event): void {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    if (!isNaN(val) && val >= 1 && val <= 10) {
      item.quantity = val;
    } else {
      item.quantity = 1;
    }
  }

  removeItem(id: number): void {
    this.cartItems = this.cartItems.filter((item) => item.id !== id);
    if (this.cartItems.length === 0) {
      this.appliedCoupon = '';
      this.couponCode = '';
    }
  }

  itemTotal(item: CartItem): number {
    return item.price * item.quantity;
  }

  // Coupon
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

  // Navigation
  goBack(): void {
    this.location.back();
  }
}
