import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CategoryComponent } from '../../components/category/category.component';
import { ProductsComponent } from '../../components/products/products.component';
import { CollectionComponent } from '../../components/collection/collection.component';

import {
  CategoryItem,
  ProductItem,
  CollectionItem,
} from '../../models/shop.models';
import { CATEGORY_DATA } from '../../data/category.data';
import { PRODUCT_DATA } from '../../data/product.data';
import { COLLECTION_DATA } from '../../data/collection.data';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    CategoryComponent,
    ProductsComponent,
    CollectionComponent,
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
})
export class HomePageComponent {
  category: CategoryItem[] = CATEGORY_DATA;
  products: ProductItem[] = PRODUCT_DATA;
  collections: CollectionItem[] = COLLECTION_DATA;
}
