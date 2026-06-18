import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './otp.component.html',
  styleUrl: './otp.component.css',
})
export class OtpComponent implements OnInit, OnDestroy {
  countdown: number = 30;
  showResendButton: boolean = false;
  private timer: any;

  constructor(
    private toastr: ToastrService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.startTimer();
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  startTimer(): void {
    this.countdown = 30;
    this.showResendButton = false;

    clearInterval(this.timer);

    this.timer = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        clearInterval(this.timer);
        this.showResendButton = true;
      }
    }, 1000);
  }

  verifyOtp(): void {
    this.toastr.success('OTP verified successfully!');
    this.router.navigate(['/success']);
  }

  resendOtp(): void {
    this.toastr.success('OTP resent successfully!');
    this.startTimer();
  }

  get formattedTime(): string {
    const seconds = this.countdown.toString().padStart(2, '0');
    return `00:${seconds}`;
  }
}
