import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { InfoComponent } from './info/info.component';
import { PasswordComponent } from './password/password.component';
import { OrdersComponent } from './orders/orders.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { AddressComponent } from './address/address.component';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    RouterLink,
    InfoComponent,
    PasswordComponent,
    OrdersComponent,
    WishlistComponent,
    AddressComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  activeTab: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const tab = Number(params['tab']);
      if (!isNaN(tab) && tab >= 0 && tab <= 5) {
        this.activeTab = tab;
      }
    });
  }

  setActiveTab(index: number): void {
    this.activeTab = index;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: index },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  signOut(): void {
    this.router.navigate(['/login']);
  }
}
