import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProductItem } from '../../models/shop.models';
import { ApiServiceService } from '../../service/api-service.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent {
  @Input() product!: ProductItem;

  private addingToCart = false;

  constructor(
    private api: ApiServiceService,
    private toastr: ToastrService,
  ) {}

  private get userId(): string | null {
    return localStorage.getItem('userId');
  }

  addToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.userId) {
      this.toastr.info('Please log in to add items to your bag.');
      return;
    }
    if (this.addingToCart) return;

    this.addingToCart = true;
    this.api
      .addToCart(this.userId, { product_id: this.product.id, quantity: 1 })
      .subscribe({
        next: () => {
          this.toastr.success('Added to bag!');
          this.addingToCart = false;
        },
        error: () => {
          this.toastr.error('Failed to add to bag.');
          this.addingToCart = false;
        },
      });
  }
}
