import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  OnChanges,
  AfterViewInit,
  SimpleChanges,
} from '@angular/core';
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
export class ReelComponent implements OnChanges, AfterViewInit {
  @Input() reel!: ReelItem;
  @Input() isActive: boolean = false;
  @Output() videoEnded = new EventEmitter<void>();

  @ViewChild('reelVideo') reelVideo!: ElementRef<HTMLVideoElement>;

  private viewReady = false;

  ngAfterViewInit(): void {
    this.viewReady = true;
    // In case isActive was already true before the view was ready
    if (this.isActive) {
      this.play();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['isActive'] || !this.viewReady) {
      return;
    }
    this.isActive ? this.play() : this.pause();
  }

  play(): void {
    const video = this.reelVideo?.nativeElement;
    if (video) {
      video.currentTime = 0;
      video.play().catch((err) => console.warn('Video play blocked:', err));
    }
  }

  pause(): void {
    const video = this.reelVideo?.nativeElement;
    if (video) {
      video.pause();
    }
  }

  onEnded(): void {
    this.videoEnded.emit();
  }
}