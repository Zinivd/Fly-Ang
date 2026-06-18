import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductsComponent } from '../../components/products/products.component';
import { ProductItem } from '../../models/shop.models';
import { PRODUCT_DATA } from '../../data/product.data';
import { REVIEW_DATA } from '../../data/review.data';

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
export class ProductDetailsComponent {
  category = 'Leggings & Leggings';
  productName = 'Bottle Green Ankle Leggings';
  subtitle = 'Seamless fitting | Comfortable';
  rating = 4.7;
  reviewCount = 202;
  price = 499;
  originalPrice = 599;
  discountPercent = 10;
  savedAmount = 21;
  estimatedDelivery = '18th Oct';

  productImages = [
    'assets/images/Details/1.png',
    'assets/images/Details/2.png',
    'assets/images/Details/3.png',
    'assets/images/Details/4.png',
    'assets/images/Details/5.png',
    'assets/images/Details/6.png',
  ];

  colors: { name: string; code: string; border?: boolean }[] = [
    { name: 'Purple', code: '#8E44AD' },
    { name: 'Black', code: '#000000' },
    { name: 'Red', code: '#E74C3C' },
    { name: 'Orange', code: '#E67E22' },
    { name: 'Navy', code: '#2C3E50' },
    { name: 'White', code: '#FFFFFF', border: true },
    { name: 'Brown', code: '#D35400' },
    { name: 'Green', code: '#27AE60' },
    { name: 'Yellow', code: '#F1C40F' },
    { name: 'Grey', code: '#BDC3C7' },
    { name: 'Pink', code: '#F78FB3' },
  ];

  shadeColors: { name: string; code: string; border?: boolean }[] = [
    { name: 'Parrot', code: '#3DC733' },
    { name: 'Grass', code: '#84E401' },
    { name: 'Chilly', code: '#259C42' },
    { name: 'Mojito', code: '#49BC93' },
    { name: 'Rama', code: '#1B8577' },
    { name: 'Ice', code: '#B0F0B4' },
    { name: 'Tea', code: '#C2E79A' },
    { name: 'Lime', code: '#E5FB96' },
    { name: 'Pista', code: '#B9CBA1' },
    { name: 'Catepillar', code: '#CBCB4F' },
    { name: 'Fern', code: '#9BA568' },
    { name: 'Bottle', code: '#06402A' },
    { name: 'Peacock', code: '#175D69' },
    { name: 'Forest', code: '#374F2F' },
    { name: 'Apricot', code: '#DDD100' },
  ];

  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];

  highlights = [
    { icon: 'bx bx-cart', text: '100% Original Products' },
    { icon: 'bx bx-truck', text: 'Free Delivery on all orders above Rs.599' },
    { icon: 'bx bx-handshake', text: 'Easy 7 days returns and exchanges' },
    { icon: 'bx bx-currency-note', text: 'Cash on Delivery' },
  ];

  // ── Detail Spotlight images ──────────────────────────────────────────
  detailsMainImg = 'assets/images/Details/6.png';

  variants = [
    { text: 'Fluid with Liva Fabric', img: 'assets/images/Details/2.png' },
    { text: '4-way Stretch', img: 'assets/images/Details/3.png' },
    { text: 'Moisture Wicking', img: 'assets/images/Details/4.png' },
    { text: 'Fluid with Liva Fabric', img: 'assets/images/Details/5.png' },
    { text: 'Fluid with Liva Fabric', img: 'assets/images/Details/6.png' },
  ];

  // ── Fabric & Care icons ──────────────────────────────────────────────
  fabrics = [
    { text: 'Machine Wash', img: 'assets/images/Icons/1.png' },
    { text: 'Do Not Tumble Dry', img: 'assets/images/Icons/2.png' },
    { text: 'Hand Wash', img: 'assets/images/Icons/3.png' },
    { text: 'Do Not Bleach', img: 'assets/images/Icons/4.png' },
    { text: 'Use Iron', img: 'assets/images/Icons/5.png' },
    { text: 'Wash with like colors', img: 'assets/images/Icons/6.png' },
    { text: 'Wash Inside Out', img: 'assets/images/Icons/7.png' },
  ];

  // ── Specifications ───────────────────────────────────────────────────
  specifications = [
    { label: 'Length', value: 'Ankle Length' },
    { label: 'Fabrics', value: 'Viscose Rayon, Elastane' },
    { label: 'Fit', value: 'Slim Fit' },
    { label: 'Rise', value: 'Mid Rise' },
    { label: 'Pattern', value: 'Solid' },
    { label: 'Box Content', value: 'A pair of Ankle Length Leggings' },
    { label: 'Country Of Origin', value: 'India' },
    {
      label: 'Manufactured & Marketed By',
      value:
        'FLY BIRDS GARMENTS 423B, 4th St, Raja Nagar, Poyampalayam, Tiruppur, Tamil Nadu 641603.',
    },
  ];

  // ── Reviews ──────────────────────────────────────────────────────────
  reviews = [...REVIEW_DATA];

  // ── Similar Products — reuse same product array used on home page ────
  products: ProductItem[] = PRODUCT_DATA;

  // ── Slider state ─────────────────────────────────────────────────────
  currentSlide = 0;
  slidesPerPage = 3;

  get visibleReviews() {
    return this.reviews.slice(
      this.currentSlide,
      this.currentSlide + this.slidesPerPage,
    );
  }

  prevSlide(): void {
    if (this.currentSlide > 0) this.currentSlide--;
  }

  nextSlide(): void {
    if (this.currentSlide + this.slidesPerPage < this.reviews.length)
      this.currentSlide++;
  }

  getStars(count: number): number[] {
    return Array(count).fill(0);
  }
}
