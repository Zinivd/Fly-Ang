import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, of } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
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
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private readonly MAX_CATEGORY = 12;

  // Fixed skeleton counts so layout never jumps while loading
  readonly categorySkeletons = Array.from({ length: 6 });
  readonly productSkeletons = Array.from({ length: 4 });
  readonly collectionSkeletons = Array.from({ length: 3 });
  readonly reelSkeletons = Array.from({ length: 4 });

  category: CategoryItem[] = [];
  allProducts: ProductItem[] = [];
  products: ProductItem[] = [];
  collections: CollectionItem[] = [];
  reels: ReelItem[] = [];
  banners: Banner[] = [];

  isCategoryLoading = true;
  isReelLoading = true;
  isProductLoading = true;
  isCollectionLoading = true;
  isBannerLoading = true;

  categoryError = false;
  reelError = false;
  productError = false;
  collectionError = false;
  bannerError = false;

  activeReelIndex = 0;
  activeCategoryId: number | 'all' = 'all';

  constructor(private apiService: ApiServiceService) {}

  ngOnInit(): void {
    // All five fire together — none blocks another. Each section
    // renders (or shows its own error/empty state) the moment its
    // own call resolves.
    this.getCategoryList();
    this.getReelList();
    this.loadBanners();
    this.loadBestSellers();
    this.loadCollections();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ---------------- Banners ----------------
  loadBanners(): void {
    this.isBannerLoading = true;
    this.bannerError = false;
    this.apiService
      .getBanners<any>()
      .pipe(
        catchError((err) => {
          console.error('Error fetching banners:', err);
          this.bannerError = true;
          return of(null);
        }),
        finalize(() => (this.isBannerLoading = false)),
        takeUntil(this.destroy$),
      )
      .subscribe((res) => {
        this.banners = res?.data?.data || [];
      });
  }

  // ---------------- Best Sellers ----------------
  loadBestSellers(): void {
    this.isProductLoading = true;
    this.productError = false;
    this.apiService
      .getBestSellers<any>()
      .pipe(
        catchError((err) => {
          console.error('Error fetching best sellers:', err);
          this.productError = true;
          return of(null);
        }),
        finalize(() => (this.isProductLoading = false)),
        takeUntil(this.destroy$),
      )
      .subscribe((res) => {
        const rows = res?.data ?? [];
        this.allProducts = rows.map((row: any) => this.mapProduct(row));
        this.applyCategoryFilter();
      });
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

  // ---------------- Collections ----------------
  loadCollections(): void {
    this.isCollectionLoading = true;
    this.collectionError = false;
    this.apiService
      .getCollections<any>()
      .pipe(
        catchError((err) => {
          console.error('Error fetching collections:', err);
          this.collectionError = true;
          return of(null);
        }),
        finalize(() => (this.isCollectionLoading = false)),
        takeUntil(this.destroy$),
      )
      .subscribe((res) => {
        const rows = res?.data ?? [];
        this.collections = rows.map((row: any) => this.mapCollection(row));
      });
  }

  private mapCollection(row: any): CollectionItem {
    return {
      id: row.id,
      name: row.name,
      img:
        row.cover_url ||
        row.banner_url ||
        row.icon_url ||
        'assets/images/no-image.png',
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

  // ---------------- Categories ----------------
  getCategoryList(): void {
    this.isCategoryLoading = true;
    this.categoryError = false;
    this.apiService
      .getCategoryList()
      .pipe(
        catchError((err: any) => {
          console.error('Error fetching categories:', err);
          this.categoryError = true;
          return of(null);
        }),
        finalize(() => (this.isCategoryLoading = false)),
        takeUntil(this.destroy$),
      )
      .subscribe((res: any) => {
        this.category = (res?.data || []).slice(0, this.MAX_CATEGORY);
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

  // ---------------- Reels ----------------
  getReelList(): void {
    this.isReelLoading = true;
    this.reelError = false;
    this.apiService
      .getreelList()
      .pipe(
        catchError((err: any) => {
          console.error('Error fetching reels:', err);
          this.reelError = true;
          return of(null);
        }),
        finalize(() => (this.isReelLoading = false)),
        takeUntil(this.destroy$),
      )
      .subscribe((res: any) => {
        this.reels = (res?.data?.data || []).filter(
          (r: ReelItem & { is_published?: boolean }) =>
            (r as any).is_published !== false,
        );
        this.activeReelIndex = 0;
      });
  }

  onReelEnded(): void {
    if (this.reels.length === 0) return;
    this.activeReelIndex = (this.activeReelIndex + 1) % this.reels.length;
  }

  // ---------------- Retry (wired to buttons in the template) ----------------
  retryBanners(): void {
    this.loadBanners();
  }
  retryCategories(): void {
    this.getCategoryList();
  }
  retryProducts(): void {
    this.loadBestSellers();
  }
  retryCollections(): void {
    this.loadCollections();
  }
  retryReels(): void {
    this.getReelList();
  }
}