import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiServiceService } from '../../../service/api-service.service';

interface OrderListItem {
  id: number;
  orderNumber: string;
  amount: number;
  createdAt: string;
  deliveryStatus: string;
  paymentMethod: string;
  raw: any;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
})
export class OrdersComponent implements OnInit {
  constructor(private api: ApiServiceService) {}

  activeTab: number = 0;
  showDetails: boolean = false;

  loading = true;
  loadingDetails = false;

  allOrders: OrderListItem[] = [];
  selectedOrder: any = null;

  private get userId(): string | null {
    return localStorage.getItem('userId');
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    if (!this.userId) {
      this.loading = false;
      return;
    }
    this.loading = true;
    this.api.getOrdersByUser<any>(this.userId).subscribe({
      next: (res) => {
        const rows = res?.data ?? [];
        this.allOrders = rows.map((row: any) => this.mapOrder(row));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  private mapOrder(row: any): OrderListItem {
    return {
      id: row.id,
      orderNumber: row.order_id ?? '',
      amount: Number(row.amount ?? 0),
      createdAt: row.created_at ?? '',
      deliveryStatus: row.delivery_status ?? 'Pending',
      paymentMethod: row.payment_method ?? '',
      raw: row,
    };
  }

  get activeOrders(): OrderListItem[] {
    return this.allOrders.filter(
      (o) => !['Cancelled', 'Completed'].includes(o.deliveryStatus),
    );
  }
  get cancelledOrders(): OrderListItem[] {
    return this.allOrders.filter((o) => o.deliveryStatus === 'Cancelled');
  }
  get completedOrders(): OrderListItem[] {
    return this.allOrders.filter((o) => o.deliveryStatus === 'Completed');
  }

  setActiveTab(index: number): void {
    this.activeTab = index;
  }

  viewDetails(order: OrderListItem): void {
    this.showDetails = true;
    this.loadingDetails = true;
    this.api.getOrderById<any>(order.id).subscribe({
      next: (res) => {
        this.selectedOrder = res?.data ?? null;
        this.loadingDetails = false;
      },
      error: () => {
        this.loadingDetails = false;
      },
    });
  }

  backToOrders(): void {
    this.showDetails = false;
    this.selectedOrder = null;
  }

  // ---- Selected order display helpers ----
  get detailItems(): any[] {
    return (this.selectedOrder?.items || []).map((i: any) => ({
      name: i.product_name ?? '',
      color: i.color ?? '',
      size: i.size ?? '',
      qty: i.quantity ?? 1,
      total: Number(i.total ?? 0),
      image: 'assets/images/no-image.png',
    }));
  }
  get detailSubtotal(): number {
    return Number(this.selectedOrder?.subtotal ?? 0);
  }
  get detailDiscount(): number {
    return Number(this.selectedOrder?.discount ?? 0);
  }
  get detailShipping(): number {
    return Number(this.selectedOrder?.shipping ?? 0);
  }
  get detailTax(): number {
    return Number(this.selectedOrder?.tax ?? 0);
  }
  get detailTotal(): number {
    return Number(this.selectedOrder?.amount ?? 0);
  }
  get detailOrderNumber(): string {
    return this.selectedOrder?.order_id ?? '';
  }
  get detailOrderDate(): string {
    return this.selectedOrder?.created_at ?? '';
  }
  get detailCustomerName(): string {
    return this.selectedOrder?.customer_name ?? '';
  }
  get detailCustomerPhone(): string {
    return this.selectedOrder?.customer_phone ?? '';
  }
  get detailShippingAddress(): string {
    return this.selectedOrder?.shipping_address ?? '';
  }
  get detailDeliveryStatus(): string {
    return this.selectedOrder?.delivery_status ?? '';
  }
  get detailPaymentMethod(): string {
    return this.selectedOrder?.payment_method ?? '';
  }
}
