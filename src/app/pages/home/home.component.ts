import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryComponent } from '../../components/category/category.component';
import { ProductsComponent } from '../../components/products/products.component';
import { CollectionComponent } from '../../components/collection/collection.component';
import { ReelComponent } from '../../components/reel/reel.component';
import { SpotlightHeadComponent } from '../../components/spotlight-head/spotlight-head.component';
import { SpotlightBottomComponent } from '../../components/spotlight-bottom/spotlight-bottom.component';
import { TestimonialComponent } from '../../components/testimonial/testimonial.component';
import {
  CategoryItem,
  ProductItem,
  CollectionItem,
  ReelItem,
} from '../../models/shop.models';
import { PRODUCT_DATA } from '../../data/product.data';
import { COLLECTION_DATA } from '../../data/collection.data';
import { ApiServiceService } from '../../service/api-service.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    CategoryComponent,
    ProductsComponent,
    CollectionComponent,
    ReelComponent,
    SpotlightHeadComponent,
    SpotlightBottomComponent,
    TestimonialComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: [
    './home.component.css',
    '../../components/category/category.component.css',
    '../../components/products/products.component.css',
    '../../components/collection/collection.component.css',
    '../../components/reel/reel.component.css',
    '../../components/spotlight-head/spotlight-head.component.css',
    '../../components/spotlight-bottom/spotlight-bottom.component.css',
    '../../components/testimonial/testimonial.component.css',
  ],
})
export class HomeComponent implements OnInit {
  category: CategoryItem[] = [];
  products: ProductItem[] = PRODUCT_DATA;
  collections: CollectionItem[] = COLLECTION_DATA;
  reels: ReelItem[] = [];
  isCategoryLoading = false;
  isReelLoading = false;
  activeReelIndex = 0;

  constructor(private apiService: ApiServiceService) {}

  ngOnInit(): void {
    this.getCategoryList();
    this.getReelList();
  }

  getCategoryList(): void {
    this.isCategoryLoading = true;
    this.apiService.getCategoryList().subscribe({
      next: (res: any) => {
        this.category = res?.data || [];
        this.isCategoryLoading = false;
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
        this.isCategoryLoading = false;
      },
    });
  }

  getReelList(): void {
    this.isReelLoading = true;
    this.apiService.getreelList().subscribe({
      next: (res: any) => {
        this.reels = (res?.data?.data || []).filter(
          (r: ReelItem & { is_published?: boolean }) => (r as any).is_published !== false
        );
        this.activeReelIndex = 0;
        this.isReelLoading = false;
      },
      error: (err: any) => {
        console.error('Error fetching reels:', err);
        this.isReelLoading = false;
      },
    });
  }

  onReelEnded(): void {
    if (this.reels.length === 0) return;
    this.activeReelIndex = (this.activeReelIndex + 1) % this.reels.length;
  }
}