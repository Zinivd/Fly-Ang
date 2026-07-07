import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReelItem } from '../../models/shop.models';

@Component({
  selector: 'app-reel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reel.component.html',
  styleUrl: './reel.component.css',
})
export class ReelComponent {
  @Input() reel!: ReelItem;
}
