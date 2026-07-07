import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr'
import { ProductsComponent } from '../../../components/products/products.component';
import { PRODUCT_DATA } from '../../../data/product.data';
import { ProductItem } from '../../../models/shop.models';

@Component({
  selector: 'app-wishlist',
  imports: [CommonModule, ProductsComponent],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css',
})
export class WishlistComponent {

  constructor(private toastr: ToastrService) {}

  products: ProductItem[] = PRODUCT_DATA;

  removeFromWishlist(id: string | number): void {
    this.products = this.products.filter((p) => p.id !== id);
    this.toastr.success('Removed from wishlist!');
  }
}
