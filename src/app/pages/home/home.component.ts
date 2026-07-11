import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
import { ApiServiceService } from '../../service/api-service.service';

interface Banner {
  id: number;
  title: string;
  web_banner_url: string;
  mobile_banner_url: string;
}

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
    RouterModule,
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
  allProducts: ProductItem[] = [];
  products: ProductItem[] = [];
  collections: CollectionItem[] = [];
  reels: ReelItem[] = [];
  isCategoryLoading = false;
  isReelLoading = false;
  isProductLoading = true;
  isCollectionLoading = true;
  activeReelIndex = 0;
  banners: Banner[] = [];
  isBannerLoading = true;

  activeCategoryId: number | 'all' = 'all';

  constructor(private apiService: ApiServiceService) {}

  ngOnInit(): void {
    this.getCategoryList();
    this.getReelList();
    this.loadBanners();
    this.loadBestSellers();
    this.loadCollections();
  }

  loadBanners() {
    this.apiService.getBanners<any>().subscribe({
      next: (res) => {
        this.banners = res.data.data;
        this.isBannerLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isBannerLoading = false;
      },
    });
  }

  loadBestSellers(): void {
    this.isProductLoading = true;
    this.apiService.getBestSellers<any>().subscribe({
      next: (res) => {
        const rows = res?.data ?? [];
        this.allProducts = rows.map((row: any) => this.mapProduct(row));
        this.applyCategoryFilter();
        this.isProductLoading = false;
      },
      error: (err) => {
        console.error('Error fetching best sellers:', err);
        this.isProductLoading = false;
      },
    });
  }

  loadCollections(): void {
    this.isCollectionLoading = true;
    this.apiService.getCollections<any>().subscribe({
      next: (res) => {
        const rows = res?.data ?? [];
        this.collections = rows.map((row: any) => this.mapCollection(row));
        this.isCollectionLoading = false;
      },
      error: (err) => {
        console.error('Error fetching collections:', err);
        this.isCollectionLoading = false;
      },
    });
  }

  private mapCollection(row: any): CollectionItem {
    return {
      id: row.id,
      name: row.name,
      img: row.cover_url || row.banner_url || row.icon_url || 'assets/images/no-image.png',
      slug: this.slugify(row.name),
    };
  }

  private slugify(name: string): string {
    return (name || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private mapProduct(row: any): ProductItem {
    const firstVariant = row.color_variants?.[0];
    const sortedImages = firstVariant?.gallery_images
      ?.slice()
      .sort((a: any, b: any) => a.sort_order - b.sort_order);

    const discount = Number(row.discount) || 0;

    return {
      id: row.id,
      title: row.name,
      subtitle: row.brand,
      image: sortedImages?.[0]?.image_url ?? 'assets/images/no-image.png',
      rating: 5,
      review: 0,
      sp: row.effective_price,
      mrp: Number(row.unit_price),
      badge: row.is_flash_sale
        ? row.flash_sale_title || 'Sale'
        : discount > 0
          ? `${discount}% OFF`
          : '',
      color_variants: row.color_variants || [],
      category_id: row.category_id,
    } as ProductItem;
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

  selectCategory(id: number | 'all'): void {
    this.activeCategoryId = id;
    this.applyCategoryFilter();
  }

  private applyCategoryFilter(): void {
    this.products =
      this.activeCategoryId === 'all'
        ? this.allProducts
        : this.allProducts.filter(
            (p: any) => p.category_id === this.activeCategoryId,
          );
  }

  getReelList(): void {
    this.isReelLoading = true;
    this.apiService.getreelList().subscribe({
      next: (res: any) => {
        this.reels = (res?.data?.data || []).filter(
          (r: ReelItem & { is_published?: boolean }) =>
            (r as any).is_published !== false,
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
