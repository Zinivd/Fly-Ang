import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductsComponent } from '../../components/products/products.component';
import { ProductItem } from '../../models/shop.models';
import { PRODUCT_DATA } from '../../data/product.data';
import { REVIEW_DATA } from '../../data/review.data';
import { ApiServiceService } from '../../service/api-service.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [RouterLink, CommonModule, ProductsComponent],
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
  ) {}

  loading = true;

  productId!: number;

  category = '';
  productName = '';
  productDescription = '';
  subtitle = '';
  rating = 5;
  reviewCount = 0;

  price = 0;
  originalPrice = 0;
  discountPercent = 0;
  savedAmount = 0;

  estimatedDelivery = '';

  productImages: string[] = [];

  colors: { name: string; code: string; border?: boolean }[] = [];

  highlights = [
    { icon: 'bx bx-cart', text: '100% Original Products' },
    { icon: 'bx bx-handshake', text: 'Easy 7 days returns and exchanges' },
    { icon: 'bx bx-currency-note', text: 'Cash on Delivery' },
  ];

  specifications: { label: string; value: any }[] = [];

  detailsMainImg = '';

  variants: any[] = [];

  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
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

  reviews = [...REVIEW_DATA];

  products: ProductItem[] = PRODUCT_DATA;

  currentSlide = 0;
  slidesPerPage = 3;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.productId = Number(params.get('id'));

      if (this.productId) {
        this.getProduct();
      }
    });
  }

  selectSize(size: string) {
    this.selectedSize = size;
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
        // Colors
        this.colors =
          product.color_variants?.map((item: any) => ({
            name: item.color.name,
            code: item.color.code,
            border:
              item.color.code.toLowerCase() === '#ffffff' ||
              item.color.code.toLowerCase() === '#fff',
          })) || [];
        // Images
        this.productImages = [];
        product.color_variants?.forEach((variant: any) => {
          if (variant.thumbnail_image?.image_url) {
            this.productImages.push(variant.thumbnail_image.image_url);
          }
          variant.gallery_images?.forEach((img: any) => {
            this.productImages.push(img.image_url);
          });
        });
        if (!this.productImages.length) {
          this.productImages.push('assets/images/no-image.png');
        }
        this.detailsMainImg = this.productImages[0];
        // Specifications
        this.specifications = [
          {
            label: 'Brand',
            value: product.brand,
          },
          {
            label: 'Category',
            value: product.category?.name,
          },
          {
            label: 'Unit',
            value: product.unit,
          },
          {
            label: 'Weight',
            value: product.weight,
          },
          {
            label: 'Minimum Quantity',
            value: product.min_qty,
          },
          {
            label: 'Reward Points',
            value: product.reward_points,
          },
          {
            label: 'Tags',
            value: product.tags,
          },
          {
            label: 'Shipping Days',
            value: product.estimate_shipping_days + ' Days',
          },
        ];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
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
    return Array(count).fill(0);
  }
}
