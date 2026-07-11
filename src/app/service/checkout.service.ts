// service/checkout.service.ts
import { Injectable } from '@angular/core';

export interface CheckoutSummaryItem {
  name: string;
  qty: number;
  price: number;
  image: string;
  size: string;
  productId: number;
  productColorVariantId: number | null;
  productSizeStockId: number | null;
}

export interface CheckoutOrderSummary {
  items: CheckoutSummaryItem[];
  subtotal: number;
  discountAmount: number;
  shippingCharge: number;
  taxAmount: number;
  total: number;
  couponCode?: string;
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  orderSummary: CheckoutOrderSummary | null = null;
  selectedAddress: any = null;

  setOrderSummary(summary: CheckoutOrderSummary): void {
    this.orderSummary = summary;
  }
  setAddress(address: any): void {
    this.selectedAddress = address;
  }
  clear(): void {
    this.orderSummary = null;
    this.selectedAddress = null;
  }
}
