import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CollectionItem } from '../../models/shop.models';

@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css'],
})
export class CollectionComponent {
  @Input() collection!: CollectionItem;
}