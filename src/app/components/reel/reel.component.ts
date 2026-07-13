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
  isMuted: boolean = true;

  ngAfterViewInit(): void {
    this.viewReady = true;
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
      this.isMuted = true; // every new play starts muted
      video.currentTime = 0;
      video.muted = true;
      video.play().catch((err) => console.warn('Video play blocked:', err));
    }
  }

  pause(): void {
    const video = this.reelVideo?.nativeElement;
    if (video) {
      video.pause();
    }
  }

  toggleMute(event: MouseEvent): void {
    event.stopPropagation();
    const video = this.reelVideo?.nativeElement;
    if (!video) return;
    this.isMuted = !this.isMuted;
    video.muted = this.isMuted;
  }

  onEnded(): void {
    this.videoEnded.emit();
  }
}