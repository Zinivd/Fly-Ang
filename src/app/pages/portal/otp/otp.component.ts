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
import { ApiServiceService } from '../../../service/api-service.service'; // ⚠️ adjust path

type OtpFlow = 'register' | 'login';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './otp.component.html',
  styleUrl: './otp.component.css',
})
export class OtpComponent implements OnInit, OnDestroy {
  @ViewChildren('otp0, otp1, otp2, otp3, otp4')
  otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  countdown: number = 60;
  showResendButton: boolean = false;
  isVerifying: boolean = false;
  isResending: boolean = false;
  private timer: any;

  private flow: OtpFlow = 'register';
  private otpToken: string = '';
  private email: string = '';
  private name: string = '';

  constructor(
    private toastr: ToastrService,
    private router: Router,
    private api: ApiServiceService,
  ) {}

  ngOnInit(): void {
    const state = (history.state || {}) as any;

    this.flow = (state.otpFlow || sessionStorage.getItem('otpFlow') || 'register') as OtpFlow;
    this.otpToken = state.otpToken || sessionStorage.getItem('otpToken') || '';
    this.email = state.email || sessionStorage.getItem('registerEmail') || '';
    this.name = state.name || sessionStorage.getItem('registerName') || '';

    if (!this.otpToken) {
      this.toastr.error('Session expired. Please try again.');
      this.router.navigate([this.flow === 'login' ? '/login' : '/register']);
      return;
    }

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
    input.value = input.value.replace(/[^0-9]/g, '');

    if (input.value.length === 1 && index < 4) {
      this.focusInput(index + 1);
    }
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace') {
      if (input.value === '' && index > 0) {
        this.getInput(index - 1).value = '';
        this.focusInput(index - 1);
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      this.focusInput(index - 1);
    } else if (event.key === 'ArrowRight' && index < 4) {
      this.focusInput(index + 1);
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text') ?? '';
    const digits = pasted
      .replace(/[^0-9]/g, '')
      .slice(0, 5)
      .split('');
    const inputs = this.otpInputs.toArray();
    digits.forEach((digit, i) => {
      if (inputs[i]) inputs[i].nativeElement.value = digit;
    });
    const lastIndex = Math.min(digits.length, 4);
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

  private clearOtpSession(): void {
    sessionStorage.removeItem('otpToken');
    sessionStorage.removeItem('otpFlow');
    sessionStorage.removeItem('registerEmail');
    sessionStorage.removeItem('registerName');
  }

  private handleVerifySuccess(response: any): void {
    this.isVerifying = false;

    if (response?.access_token) {
      localStorage.setItem('authToken', response.access_token);
    }
    if (response?.refresh_token) {
      localStorage.setItem('refreshToken', response.refresh_token);
    }
    if (response?.user_id) {
      localStorage.setItem('userId', response.user_id);
    }
    if (response?.expires_in) {
      const expiresAt = Date.now() + response.expires_in * 1000;
      localStorage.setItem('tokenExpiresAt', String(expiresAt));
    }

    this.clearOtpSession();

    this.toastr.success('OTP verified successfully!');
    this.router.navigate(['/']);
  }

  private handleVerifyError(err: any): void {
    this.isVerifying = false;
    this.toastr.error(
      err?.error?.error?.message || err?.error?.message || 'Invalid OTP',
    );
  }

  verifyOtp(): void {
    const otp = this.getOtpValue();
    if (otp.length < 5) {
      this.toastr.error('Please enter all 5 digits.');
      return;
    }

    this.isVerifying = true;

    if (this.flow === 'login') {
      const payload = {
        login_otp_token: this.otpToken,
        otp_code: otp,
      };
      this.api.loginOtpVerify<any>(payload).subscribe({
        next: (response) => this.handleVerifySuccess(response),
        error: (err) => this.handleVerifyError(err),
      });
    } else {
      const payload = {
        otp_token: this.otpToken,
        otp_code: otp,
      };
      this.api.verifyOtp<any>(payload).subscribe({
        next: (response) => this.handleVerifySuccess(response),
        error: (err) => this.handleVerifyError(err),
      });
    }
  }

  resendOtp(): void {
    if (!this.email) {
      this.toastr.error('Missing details. Please try again.');
      this.router.navigate([this.flow === 'login' ? '/login' : '/register']);
      return;
    }

    this.isResending = true;

    if (this.flow === 'login') {
      this.api.loginOtp<any>({ login_field: this.email }).subscribe({
        next: (response) => {
          this.isResending = false;
          const otpToken =
            response?.login_otp_token ??
            response?.data?.login_otp_token ??
            response?.result?.login_otp_token;

          if (!otpToken) {
            this.toastr.error('Something went wrong. Please try again.');
            return;
          }

          this.otpToken = otpToken;
          sessionStorage.setItem('otpToken', otpToken);

          this.otpInputs.toArray().forEach((el) => (el.nativeElement.value = ''));
          this.focusInput(0);
          this.toastr.success('OTP resent successfully!');
          this.startTimer();
        },
        error: (err) => {
          this.isResending = false;
          this.toastr.error(
            err?.error?.error?.message ||
              err?.error?.message ||
              'Failed to resend OTP',
          );
        },
      });
      return;
    }

    // register flow: needs name too
    if (!this.name) {
      this.toastr.error('Missing registration details. Please register again.');
      this.router.navigate(['/register']);
      return;
    }

    this.api.register<any>({ name: this.name, email: this.email }).subscribe({
      next: (response) => {
        this.isResending = false;
        const otpToken =
          response?.otp_token ??
          response?.data?.otp_token ??
          response?.result?.otp_token;

        if (!otpToken) {
          this.toastr.error('Something went wrong. Please try again.');
          return;
        }

        this.otpToken = otpToken;
        sessionStorage.setItem('otpToken', otpToken);

        this.otpInputs.toArray().forEach((el) => (el.nativeElement.value = ''));
        this.focusInput(0);
        this.toastr.success('OTP resent successfully!');
        this.startTimer();
      },
      error: (err) => {
        this.isResending = false;
        this.toastr.error(
          err?.error?.error?.message ||
            err?.error?.message ||
            'Failed to resend OTP',
        );
      },
    });
  }

  get formattedTime(): string {
    const seconds = this.countdown.toString().padStart(2, '0');
    return `00:${seconds}`;
  }
}