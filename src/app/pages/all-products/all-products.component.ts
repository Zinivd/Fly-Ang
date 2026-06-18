import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductsComponent } from '../../components/products/products.component';
import { PRODUCT_DATA } from '../../data/product.data';
import { ProductItem } from '../../models/shop.models';

interface ColorOption {
  name: string;
  code: string;
  border?: boolean;
}

interface SortOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-all-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProductsComponent],
  templateUrl: './all-products.component.html',
  styleUrls: [
    './all-products.component.css',
    './filter.component.css',
  ],
})
export class AllProductsComponent {
  products: ProductItem[] = PRODUCT_DATA;

  // Sort dropdown (top of AllProducts.jsx)
  sortOptions: SortOption[] = [
    { value: '0', label: 'Default' },
    { value: '1', label: 'Price: Low to High' },
    { value: '2', label: 'Price: High to Low' },
    { value: '3', label: 'New Arrivals' },
    { value: '4', label: 'Popularity' },
  ];
  sortBy = '0';

  // Collapsible section toggler (Sidebar.jsx openSections)
  openSections: Record<string, boolean> = {
    productType: false,
    price: false,
    color: false,
    size: false,
    dressStyle: false,
  };

  toggleSection(section: string): void {
    this.openSections[section] = !this.openSections[section];
  }

  // Price range slider (replaces react-range with two native inputs)
  readonly MIN = 0;
  readonly MAX = 10000;
  readonly STEP = 10;
  values: [number, number] = [0, 5000];

  get trackBackground(): string {
    const minPct = ((this.values[0] - this.MIN) / (this.MAX - this.MIN)) * 100;
    const maxPct = ((this.values[1] - this.MIN) / (this.MAX - this.MIN)) * 100;
    return `linear-gradient(to right, var(--border) ${minPct}%, var(--sub) ${minPct}%, var(--sub) ${maxPct}%, var(--border) ${maxPct}%)`;
  }

  onMinInput(value: string): void {
    const next = Math.min(Number(value), this.values[1]);
    this.values = [next, this.values[1]];
  }

  onMaxInput(value: string): void {
    const next = Math.max(Number(value), this.values[0]);
    this.values = [this.values[0], next];
  }

  // Sidebar static filter data
  productTypes: string[] = [
    'Printed T-Shirts',
    'Plain T-Shirts',
    'Full Sleeve T-Shirts',
    'Half Sleeve T-Shirts',
    'Tops',
    'Kurtis',
    'Boxers',
    'Joggers',
    'Payjamas',
    'Jeans',
  ];

  colors: ColorOption[] = [
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
    { name: 'Blue', code: '#3498DB' },
  ];

  sizes: string[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];

  dressStyles: string[] = [
    'Classic',
    'Casual',
    'Business',
    'Sport',
    'Elegant',
    'Formal',
  ];
}
