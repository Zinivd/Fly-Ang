import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiServiceService } from '../../service/api-service.service';

interface ShopAllItem {
  label: string;
  link: any[]; // routerLink array
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit {
  constructor(private api: ApiServiceService) {}

  shopAllItems: ShopAllItem[] = [];
  isShopAllLoading = true;

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isShopAllLoading = true;
    this.api.getCategoryList<any>().subscribe({
      next: (res) => {
        const rows = res?.data ?? [];
        this.shopAllItems = rows.map((cat: any) => ({
          label: cat.name,
          link: ['/all-products', this.slugify(cat.name), cat.id],
        }));
        this.isShopAllLoading = false;
      },
      error: (err) => {
        console.error('Error fetching categories for footer:', err);
        this.isShopAllLoading = false;
      },
    });
  }

  private slugify(name: string): string {
    return (name || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // quickLinks, helpLinks, shopLinks, policyLinks, socialLinks — unchanged
  quickLinks = [
    { label: 'Our Story', link: '' },
    { label: "FAQ's", link: '' },
    { label: 'Blogs', link: '' },
    { label: 'Testimonials', link: '' },
    { label: 'Contact Us', link: '' },
  ];

  helpLinks = [
    { label: 'Track Your Order', link: '' },
    { label: 'Customer Support', link: '' },
    { label: 'Profile', link: '' },
    { label: 'Returns & Exchange', link: '' },
    { label: 'Size Guide', link: '' },
  ];

  shopLinks = [
    { label: 'Shimmer Leggings', link: '' },
    { label: 'Saree Shapper', link: '' },
    { label: 'Yoga Shorts', link: '' },
    { label: 'Kurti Pants', link: '' },
    { label: 'Chudithar Leggings', link: '' },
    { label: 'Ankle Leggings', link: '' },
  ];

  policyLinks = [
    { label: 'Terms & Conditions', link: '' },
    { label: 'Return Policy', link: '' },
    { label: 'Support Policy', link: '' },
    { label: 'Privacy Policy', link: '' },
  ];

  socialLinks = [
    {
      id: 'facebook',
      icon: 'fa-brands fa-facebook-f',
      href: '',
      title: 'Facebook',
    },
    {
      id: 'instagram',
      icon: 'fa-brands fa-instagram',
      href: '',
      title: 'Instagram',
    },
    {
      id: 'linkedin',
      icon: 'fa-brands fa-linkedin-in',
      href: '',
      title: 'LinkedIn',
    },
    { id: 'youtube', icon: 'fa-brands fa-youtube', href: '', title: 'YouTube' },
  ];
}
