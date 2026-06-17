import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent {
  shopAllItems = [
    { label: 'Ankle Leggings', link: '/all-products' },
    { label: 'Full Length Leggings', link: '' },
    { label: 'Shimmer Leggings', link: '' },
    { label: 'Capri Leggings', link: '' },
    { label: 'Denim Leggings', link: '' },
    { label: 'Kurti Pant', link: '' },
    { label: 'Palazzo Pant', link: '' },
    { label: 'Metallic Pant', link: '' },
    { label: 'Yoga Shorts', link: '' },
    { label: 'Saree Shaper', link: '' },
    { label: 'Pyjama Set', link: '' },
    { label: 'Capri Set', link: '' },
    { label: 'Shimmer Dupatta', link: '' },
    { label: 'Nazmin Dupatta', link: '' },
  ];

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
