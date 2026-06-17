import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoryItem } from '../../models/shop.models';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css'],
})
export class CategoryComponent {
  @Input() category!: CategoryItem;
}
