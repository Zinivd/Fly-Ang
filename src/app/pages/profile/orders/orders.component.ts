import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-orders',
  imports: [CommonModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
})
export class OrdersComponent {
  activeTab: number = 0;
  showDetails: boolean = false;

  setActiveTab(index: number): void {
    this.activeTab = index;
  }

  viewDetails(): void {
    this.showDetails = true;
  }

  backToOrders(): void {
    this.showDetails = false;
  }
}
