import {
  Component,
  OnInit,
  OnDestroy,
  ViewChildren,
  QueryList,
  ElementRef,
} from '@angular/core';
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
  @ViewChildren('otp0, otp1, otp2, otp3, otp4, otp5')
  otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

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

  onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    // Allow digits only
    input.value = input.value.replace(/[^0-9]/g, '');

    if (input.value.length === 1 && index < 5) {
      this.focusInput(index + 1);
    }
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace') {
      if (input.value === '' && index > 0) {
        // Clear previous input and focus it
        this.getInput(index - 1).value = '';
        this.focusInput(index - 1);
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      this.focusInput(index - 1);
    } else if (event.key === 'ArrowRight' && index < 5) {
      this.focusInput(index + 1);
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text') ?? '';
    const digits = pasted
      .replace(/[^0-9]/g, '')
      .slice(0, 6)
      .split('');
    const inputs = this.otpInputs.toArray();
    digits.forEach((digit, i) => {
      if (inputs[i]) inputs[i].nativeElement.value = digit;
    });
    // Focus last filled input
    const lastIndex = Math.min(digits.length, 5);
    this.focusInput(lastIndex);
  }

  private focusInput(index: number): void {
    const inputs = this.otpInputs.toArray();
    inputs[index]?.nativeElement.focus();
  }

  private getInput(index: number): HTMLInputElement {
    return this.otpInputs.toArray()[index].nativeElement;
  }

  private getOtpValue(): string {
    return this.otpInputs
      .toArray()
      .map((el) => el.nativeElement.value)
      .join('');
  }

  verifyOtp(): void {
    const otp = this.getOtpValue();
    if (otp.length < 6) {
      this.toastr.error('Please enter all 6 digits.');
      return;
    }
    this.toastr.success('OTP verified successfully!');
    this.router.navigate(['/success']);
  }

  resendOtp(): void {
    // Clear all inputs
    this.otpInputs.toArray().forEach((el) => (el.nativeElement.value = ''));
    this.focusInput(0);
    this.toastr.success('OTP resent successfully!');
    this.startTimer();
  }

  get formattedTime(): string {
    const seconds = this.countdown.toString().padStart(2, '0');
    return `00:${seconds}`;
  }
}
