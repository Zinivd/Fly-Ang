import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProductsComponent } from '../../components/products/products.component';
import { ProductItem } from '../../models/shop.models';
import { PRODUCT_DATA } from '../../data/product.data';
import { ApiServiceService } from '../../service/api-service.service';

interface SizeStock {
  id: number;
  size: string;
  stock: number;
  price: number;
}

interface ColorVariant {
  id: number;
  color: { id: number; name: string; code: string };
  gallery_images: { image_url: string; sort_order: number }[];
  size_stocks: SizeStock[];
}

interface ProductReview {
  id: number;
  title: string;
  description: string;
  rating: number;
  userName: string;
  createdAt: string;
}

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, ProductsComponent],
  templateUrl: './product-details.component.html',
  styleUrls: [
    './product-details.component.css',
    './content.component.css',
    './review.component.css',
    './description.component.css',
    '../../components/products/products.component.css',
  ],
})
export class ProductDetailsComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private api: ApiServiceService,
    private toastr: ToastrService,
  ) {}

  loading = true;

  productId!: number;

  category = '';
  productName = '';
  productDescription = '';
  subtitle = '';
  rating = 0;
  reviewCount = 0;

  price = 0;
  originalPrice = 0;
  discountPercent = 0;
  savedAmount = 0;

  estimatedDelivery = '';

  productImages: string[] = [];

  highlights = [
    { icon: 'bx bx-cart', text: '100% Original Products' },
    { icon: 'bx bx-handshake', text: 'Easy 7 days returns and exchanges' },
    { icon: 'bx bx-currency-note', text: 'Cash on Delivery' },
  ];

  specifications: { label: string; value: any }[] = [];

  detailsMainImg = '';
  variants: any[] = [];

  colorVariants: ColorVariant[] = [];
  colors: { id: number; name: string; code: string; border?: boolean }[] = [];
  availableSizes: string[] = [];
  selectedVariantId: number | null = null;
  selectedSizeStockId: number | null = null;
  selectedSize = '';

  fabrics = [
    { text: 'Machine Wash', img: 'assets/images/Icons/1.png' },
    { text: 'Do Not Tumble Dry', img: 'assets/images/Icons/2.png' },
    { text: 'Hand Wash', img: 'assets/images/Icons/3.png' },
    { text: 'Do Not Bleach', img: 'assets/images/Icons/4.png' },
    { text: 'Use Iron', img: 'assets/images/Icons/5.png' },
    { text: 'Wash with like colors', img: 'assets/images/Icons/6.png' },
    { text: 'Wash Inside Out', img: 'assets/images/Icons/7.png' },
  ];

  // Reviews
  reviews: ProductReview[] = [];
  isReviewsLoading = true;
  currentSlide = 0;
  slidesPerPage = 3;

  showReviewModal = false;
  submittingReview = false;
  reviewForm = {
    title: '',
    description: '',
    rating: 0,
  };
  hoverStar = 0;

  products: ProductItem[] = [];
  isSimilarLoading = true;

  isWishlisted = false;
  private wishlistBusy = false;
  private addingToCart = false;

  private get userId(): string | null {
    return localStorage.getItem('userId');
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.productId = Number(params.get('id'));
      if (this.productId) {
        this.getProduct();
        this.loadReviews();
      }
    });
  }

  getProduct() {
    this.loading = true;
    this.api.getProductById<any>(this.productId).subscribe({
      next: (res) => {
        const product = res.data;
        this.category = product.category?.name || '';
        this.productName = product.name;
        this.productDescription = product.description || '';
        this.subtitle = product.brand;
        this.price = Number(product.effective_price);
        this.originalPrice = Number(product.unit_price);
        this.discountPercent = Number(product.discount);
        this.savedAmount = this.originalPrice - this.price;
        this.estimatedDelivery = product.estimate_shipping_days + ' Days';
        this.colorVariants = product.color_variants || [];
        this.colors = this.colorVariants.map((v: any) => ({
          id: v.id,
          name: v.color.name,
          code: v.color.code,
          border: ['#fff', '#ffffff', '#fffff'].includes(
            v.color.code.toLowerCase(),
          ),
        }));

        this.productImages = [];
        const firstVariant = product.color_variants?.[0];
        if (firstVariant) {
          this.selectedVariantId = firstVariant.id;
          const sortedImages = (firstVariant.gallery_images || [])
            .slice()
            .sort((a: any, b: any) => a.sort_order - b.sort_order);
          this.productImages = sortedImages.map((img: any) => img.image_url);
          this.availableSizes = (firstVariant.size_stocks || []).map(
            (s: any) => s.size,
          );
        }
        if (!this.productImages.length) {
          this.productImages = ['assets/images/no-image.png'];
        }
        this.detailsMainImg = this.productImages[0];

        this.specifications = [
          { label: 'Brand', value: product.brand },
          { label: 'Category', value: product.category?.name },
          { label: 'Unit', value: product.unit },
          { label: 'Weight', value: product.weight },
          { label: 'Minimum Quantity', value: product.min_qty },
          { label: 'Reward Points', value: product.reward_points },
          { label: 'Tags', value: product.tags },
          {
            label: 'Shipping Days',
            value: product.estimate_shipping_days + ' Days',
          },
        ];

        this.isWishlisted = !!product.is_wishlisted;
        this.loading = false;
        this.trackRecentlyViewed();
        this.loadSimilarProducts();
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  loadSimilarProducts(): void {
    this.isSimilarLoading = true;
    this.api.getSimilarProducts<any>(this.productId).subscribe({
      next: (res) => {
        const rows = res?.data?.data ?? res?.data ?? [];
        this.products = rows.map((row: any) => this.mapProduct(row));
        this.isSimilarLoading = false;
      },
      error: (err) => {
        console.error('Error fetching similar products:', err);
        this.isSimilarLoading = false;
      },
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

  // ---------- Reviews ----------
  loadReviews(): void {
    this.isReviewsLoading = true;
    this.api.getReviewsByProduct<any>(this.productId).subscribe({
      next: (res) => {
        const data = res?.data ?? res;
        const rows = data?.reviews?.data ?? [];

        this.reviews = rows.map((r: any) => ({
          id: r.id,
          title: r.title ?? '',
          description: r.description ?? '',
          rating: Number(r.rating ?? 0),
          userName: r.user?.name ?? 'Customer', // API doesn't return a name field on reviews
          createdAt: r.created_at ?? '',
        }));

        this.rating = Number(data?.rating_summary?.average_rating ?? 0);
        this.reviewCount = Number(data?.rating_summary?.total_reviews ?? 0);

        this.currentSlide = 0;
        this.isReviewsLoading = false;
      },
      error: () => {
        this.isReviewsLoading = false;
      },
    });
  }

  openReviewModal(): void {
    if (!this.userId) {
      this.toastr.info('Please log in to write a review.');
      return;
    }
    this.reviewForm = { title: '', description: '', rating: 0 };
    this.showReviewModal = true;
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
  }

  setReviewRating(star: number): void {
    this.reviewForm.rating = star;
  }

  submitReview(): void {
    if (!this.userId) return;
    if (!this.reviewForm.title.trim()) {
      this.toastr.error('Please enter a title.');
      return;
    }
    if (!this.reviewForm.description.trim()) {
      this.toastr.error('Please enter a description.');
      return;
    }
    if (this.reviewForm.rating < 1) {
      this.toastr.error('Please select a star rating.');
      return;
    }
    if (this.submittingReview) return;

    this.submittingReview = true;
    this.api
      .createReview<any>({
        user_id: this.userId,
        product_id: this.productId,
        title: this.reviewForm.title.trim(),
        description: this.reviewForm.description.trim(),
        rating: this.reviewForm.rating,
      })
      .subscribe({
        next: () => {
          this.submittingReview = false;
          this.toastr.success('Review submitted!');
          this.showReviewModal = false;
          this.loadReviews();
        },
        error: () => {
          this.submittingReview = false;
          this.toastr.error('Failed to submit review.');
        },
      });
  }

  get visibleReviews() {
    return this.reviews.slice(
      this.currentSlide,
      this.currentSlide + this.slidesPerPage,
    );
  }

  prevSlide() {
    if (this.currentSlide > 0) this.currentSlide--;
  }

  nextSlide() {
    if (this.currentSlide + this.slidesPerPage < this.reviews.length)
      this.currentSlide++;
  }

  getStars(count: number): number[] {
    return Array(Math.round(count)).fill(0);
  }

  // ---------- Colors / sizes (unchanged) ----------
  selectColor(colorId: number): void {
    const variant = this.colorVariants.find((v) => v.id === colorId);
    if (variant) this.selectVariant(variant);
  }

  private selectVariant(variant: ColorVariant): void {
    this.selectedVariantId = variant.id;
    const images = (variant.gallery_images || [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => img.image_url);
    this.productImages = images.length
      ? images
      : ['assets/images/no-image.png'];
    this.detailsMainImg = this.productImages[0];
    this.availableSizes = (variant.size_stocks || []).map((s) => s.size);
    this.selectedSize = '';
    this.selectedSizeStockId = null;
  }

  selectSize(size: string): void {
    this.selectedSize = size;
    const variant = this.colorVariants.find(
      (v) => v.id === this.selectedVariantId,
    );
    const stock = variant?.size_stocks.find((s) => s.size === size);
    this.selectedSizeStockId = stock ? stock.id : null;
  }

  // ---------- Wishlist / cart (unchanged) ----------
  toggleWishlist(): void {
    if (!this.userId) {
      this.toastr.info('Please log in to use your wishlist.');
      return;
    }
    if (this.wishlistBusy) return;
    this.wishlistBusy = true;

    if (this.isWishlisted) {
      this.api.removeFromWishlist(this.userId, this.productId).subscribe({
        next: () => {
          this.isWishlisted = false;
          this.toastr.success('Removed from wishlist!');
          this.wishlistBusy = false;
        },
        error: () => {
          this.toastr.error('Failed to remove from wishlist.');
          this.wishlistBusy = false;
        },
      });
    } else {
      this.api
        .addToWishlist(this.userId, { product_id: this.productId })
        .subscribe({
          next: () => {
            this.isWishlisted = true;
            this.toastr.success('Added to wishlist!');
            this.wishlistBusy = false;
          },
          error: () => {
            this.toastr.error('Failed to add to wishlist.');
            this.wishlistBusy = false;
          },
        });
    }
  }

  addToBag(): void {
    if (!this.userId) {
      this.toastr.info('Please log in to add items to your bag.');
      return;
    }
    if (!this.selectedVariantId) {
      this.toastr.info('Please select a color.');
      return;
    }
    if (!this.selectedSizeStockId) {
      this.toastr.info('Please select a size.');
      return;
    }
    if (this.addingToCart) return;

    this.addingToCart = true;
    this.api
      .addToCart(this.userId, {
        product_id: this.productId,
        product_color_variant_id: this.selectedVariantId,
        product_size_stock_id: this.selectedSizeStockId,
        quantity: 1,
      })
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

  buyNow(): void {
    this.addToBag();
  }

  private trackRecentlyViewed(): void {
    if (!this.userId) return;
    this.api
      .addRecentlyViewed({ user_id: this.userId, product_id: this.productId })
      .subscribe({
        error: (err) => console.error('Failed to record recently viewed:', err),
      });
  }
}
