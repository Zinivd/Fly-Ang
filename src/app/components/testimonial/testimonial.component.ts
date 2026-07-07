import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';

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
  reviews: Review[] = [
    {
      title: '"The fit is absolutely perfect!"',
      body: "I've worn so many leggings brands, but Flybirds really nailed the comfort and stretch. It doesn't lose shape even after long hours.",
      rating: 5,
      reviewer: 'Priya S',
      verified: true,
    },
    {
      title: '"Worth every penny!"',
      body: "I was skeptical at first, but after trying Flybirds I won't go back. The fabric is buttery soft and the waistband stays put through every workout.",
      rating: 4,
      reviewer: 'Maya R',
      verified: true,
    },
    {
      title: '"My go-to for every run"',
      body: 'From morning jogs to long trail runs, these leggings have been with me every step. Zero chafing, great compression — ordered three pairs already.',
      rating: 5,
      reviewer: 'John D',
      verified: false,
    },
    {
      title: '"Obsessed with the quality"',
      body: "These are hands down the best leggings I've ever owned. The material is thick enough to be opaque but still breathable. Totally worth it.",
      rating: 5,
      reviewer: 'Sarah K',
      verified: true,
    },
  ];

  currentIndex = 0;
  private autoPlayInterval: any;

  get currentReview(): Review {
    return this.reviews[this.currentIndex];
  }

  get starArray(): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < this.currentReview.rating);
  }

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  prev(): void {
    this.currentIndex =
      (this.currentIndex - 1 + this.reviews.length) % this.reviews.length;
    this.resetAutoPlay();
  }

  next(): void {
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
