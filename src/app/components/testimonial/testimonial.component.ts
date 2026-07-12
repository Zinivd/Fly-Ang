import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiServiceService } from '../../service/api-service.service';

export interface Review {
  title: string;
  body: string;
  rating: number;
  reviewer: string;
  verified: boolean;
}

@Component({
  selector: 'app-testimonial',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './testimonial.component.html',
  styleUrls: ['./testimonial.component.css'],
})
export class TestimonialComponent implements OnInit, OnDestroy {
  constructor(private api: ApiServiceService) {}

  reviews: Review[] = [];
  isLoading = true;

  currentIndex = 0;
  private autoPlayInterval: any;

  get currentReview(): Review | null {
    return this.reviews.length ? this.reviews[this.currentIndex] : null;
  }

  get starArray(): boolean[] {
    if (!this.currentReview) return [];
    return Array.from({ length: 5 }, (_, i) => i < this.currentReview!.rating);
  }

  ngOnInit(): void {
    this.loadTestimonials();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  loadTestimonials(): void {
    this.isLoading = true;
    this.api.getTestimonials<any>().subscribe({
      next: (res) => {
        const rows = res?.data?.data ?? res?.data ?? [];
        this.reviews = rows.map((r: any) => this.mapReview(r));
        this.isLoading = false;
        if (this.reviews.length > 1) this.startAutoPlay();
      },
      error: (err) => {
        console.error('Error fetching testimonials:', err);
        this.isLoading = false;
      },
    });
  }

  // ASSUMED field names — adjust once the real response is confirmed
  private mapReview(r: any): Review {
    return {
      title: r.title ?? '',
      body: r.description ?? r.body ?? '',
      rating: Number(r.rating ?? 0),
      reviewer: r.user?.name ?? r.customer_name ?? 'Customer',
      verified: !!r.verified,
    };
  }

  prev(): void {
    if (!this.reviews.length) return;
    this.currentIndex =
      (this.currentIndex - 1 + this.reviews.length) % this.reviews.length;
    this.resetAutoPlay();
  }

  next(): void {
    if (!this.reviews.length) return;
    this.currentIndex = (this.currentIndex + 1) % this.reviews.length;
    this.resetAutoPlay();
  }

  goTo(index: number): void {
    this.currentIndex = index;
    this.resetAutoPlay();
  }

  private startAutoPlay(): void {
    this.autoPlayInterval = setInterval(() => this.next(), 4000);
  }

  private stopAutoPlay(): void {
    if (this.autoPlayInterval) clearInterval(this.autoPlayInterval);
  }

  private resetAutoPlay(): void {
    this.stopAutoPlay();
    this.startAutoPlay();
  }
}
