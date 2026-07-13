import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ProductsComponent } from '../../components/products/products.component';
import { ApiServiceService } from '../../service/api-service.service';

interface Category {
  id: number;
  name: string;
  type: string;
}

interface Color {
  id: number;
  name: string;
  code: string;
}

@Component({
  selector: 'app-all-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProductsComponent],
  templateUrl: './all-products.component.html',
  styleUrls: ['./all-products.component.css', './filter.component.css'],
})
export class AllProductsComponent implements OnInit {
  constructor(
    private api: ApiServiceService,
    private route: ActivatedRoute,
  ) {}

  categoryId: number | null = null;
  categoryName = '';
  products: any[] = [];
  categories: Category[] = [];
  colors: Color[] = [];
  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
  selectedCategories: number[] = [];
  selectedColors: number[] = [];
  selectedSizes: string[] = [];

  isLoading = false;

  sortOptions = [
    {
      value: '0',
      label: 'Default',
    },
    {
      value: '1',
      label: 'Price : Low to High',
    },
    {
      value: '2',
      label: 'Price : High to Low',
    },
  ];

  sortBy = '0';

  openSections: any = {
    category: false,
    price: false,
    color: false,
    size: false,
  };

  readonly MIN = 0;
  readonly MAX = 10000;
  readonly STEP = 10;

  values: [number, number] = [0, 5000];

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.categoryId = Number(params.get('categoryId'));
      this.categoryName = params.get('categoryName') || '';
      this.loadCategories();
      this.loadColors();
      if (this.categoryId) {
        this.selectedCategories = [this.categoryId];
      }
      this.loadProducts();
    });
  }

  toggleSection(section: string) {
    this.openSections[section] = !this.openSections[section];
  }

  loadCategories() {
    this.api.getCategoryList<any>().subscribe({
      next: (res) => {
        this.categories = res.data;
      },
    });
  }

  loadColors() {
    this.api.getColors<any>().subscribe({
      next: (res) => {
        this.colors = res.data;
      },
    });
  }

  loadProducts() {
    const params: any = {};
    if (this.selectedCategories.length) {
      params.category_id = this.selectedCategories.join(',');
    }
    if (this.selectedColors.length) {
      params.color_id = this.selectedColors.join(',');
    }
    if (this.selectedSizes.length) {
      params.size = this.selectedSizes.join(',');
    }
    params.min_price = this.values[0];
    params.max_price = this.values[1];
    switch (this.sortBy) {
      case '1':
        params.sort = 'price_asc';
        break;

      case '2':
        params.sort = 'price_desc';
        break;

      default:
        params.sort = '';
    }

    this.isLoading = true;

    this.api.getProducts<any>(params).subscribe({
      next: (res) => {
        this.products = res.data.data.map((item: any) => {
          const colors = item.color_variants || [];

          return {
            id: item.id,
            title: item.name,
            subtitle: item.brand,
            image:
              colors[0]?.gallery_images?.[0]?.image_url ||
              'assets/images/no-image.png',

            badge: item.discount > 0 ? `${item.discount}% OFF` : '',
            rating: 5,
            review: 0,
            sp: item.effective_price,
            mrp: item.unit_price,

            category: item.category,
            color_variants: colors,

            // New
            colors: colors.map((variant: any) => ({
              id: variant.color.id,
              name: variant.color.name,
              code: variant.color.code,
            })),
          };
        });

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  toggleCategory(id: number, event: any) {
    if (event.target.checked) {
      this.selectedCategories.push(id);
    } else {
      this.selectedCategories = this.selectedCategories.filter((x) => x !== id);
    }
    this.loadProducts();
  }

  toggleColor(id: number, event: any) {
    if (event.target.checked) {
      this.selectedColors.push(id);
    } else {
      this.selectedColors = this.selectedColors.filter((x) => x !== id);
    }
    this.loadProducts();
  }

  toggleSize(size: string, event: any) {
    if (event.target.checked) {
      this.selectedSizes.push(size);
    } else {
      this.selectedSizes = this.selectedSizes.filter((x) => x !== size);
    }
    this.loadProducts();
  }

  get trackBackground(): string {
    const minPct = ((this.values[0] - this.MIN) / (this.MAX - this.MIN)) * 100;
    const maxPct = ((this.values[1] - this.MIN) / (this.MAX - this.MIN)) * 100;
    return `linear-gradient(to right,var(--border) ${minPct}%,
    var(--sub) ${minPct}%,
    var(--sub) ${maxPct}%,
    var(--border) ${maxPct}%)`;
  }

  onMinInput(value: string) {
    this.values = [Math.min(+value, this.values[1]), this.values[1]];
    this.loadProducts();
  }

  onMaxInput(value: string) {
    this.values = [this.values[0], Math.max(+value, this.values[0])];
    this.loadProducts();
  }

  resetFilters() {
    this.selectedCategories = [];
    this.selectedColors = [];
    this.selectedSizes = [];
    this.values = [0, 5000];
    this.sortBy = '0';
    if (this.categoryId) {
      this.selectedCategories = [this.categoryId];
    }
    this.loadProducts();
  }

  applyFilters() {
    this.loadProducts();
  }

  isCategoryOpen(name: string): boolean {
  return this.openSections[name];
}
}
