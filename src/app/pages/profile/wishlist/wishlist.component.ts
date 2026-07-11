import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ProductsComponent } from '../../../components/products/products.component';
import { ProductItem } from '../../../models/shop.models';
import { ApiServiceService } from '../../../service/api-service.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, ProductsComponent],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css',
})
export class WishlistComponent implements OnInit {
  constructor(
    private api: ApiServiceService,
    private toastr: ToastrService,
  ) {}

  loading = true;
  products: ProductItem[] = [];

  private get userId(): string | null {
    return localStorage.getItem('userId');
  }

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    if (!this.userId) {
      this.loading = false;
      return;
    }

    this.loading = true;
    this.api.getWishlist<any>(this.userId).subscribe({
      next: (res) => {
        const rows = res?.data || [];
        this.products = rows.map((row: any) => this.mapToProductItem(row));
        this.loading = false;
      },
      error: () => {
        this.toastr.error('Failed to load wishlist.');
        this.loading = false;
      },
    });
  }

  private mapToProductItem(row: any): any {
    const product = row.product || row;

    const firstVariant = product.color_variants?.[0];
    const image =
      firstVariant?.thumbnail_image?.image_url ||
      firstVariant?.gallery_images?.[0]?.image_url ||
      'assets/images/no-image.png';

    return {
      id: product.id,
      wishlistRowId: row.id,
      image,
      badge: product.badge || '',
      title: product.name,
      subtitle: product.brand,
      rating: product.rating || 5,
      review: product.review_count || 0,
      sp: product.effective_price,
      mrp: product.unit_price,
      color_variants: product.color_variants || [],
    };
  }

  removeFromWishlist(productId: string | number): void {
    if (!this.userId) return;

    this.api.removeFromWishlist(this.userId, productId).subscribe({
      next: () => {
        this.products = this.products.filter((p: any) => p.id !== productId);
        this.toastr.success('Removed from wishlist!');
      },
      error: () => {
        this.toastr.error('Failed to remove from wishlist.');
      },
    });
  }
}
