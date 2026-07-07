import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiServiceService } from '../../../service/api-service.service'; // ⚠️ adjust path

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  constructor(
    private toastr: ToastrService,
    private router: Router,
    private api: ApiServiceService,
  ) {}

  fullName: string = '';
  email: string = '';
  isLoading: boolean = false;

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  sendOtp(): void {
    if (!this.fullName.trim()) {
      this.toastr.error('Please enter your full name');
      return;
    }

    if (!this.email.trim()) {
      this.toastr.error('Please enter your email ID');
      return;
    }

    if (!this.isValidEmail(this.email.trim())) {
      this.toastr.error('Please enter a valid email ID');
      return;
    }

    const payload = {
      name: this.fullName.trim(),
      email: this.email.trim(),
    };

    this.isLoading = true;

    this.api.register<any>(payload).subscribe({
      next: (response) => {
        this.isLoading = false;

        // ⚠️ ASSUMPTION: otp_token comes back either at the top level
        // or nested under `data`/`result`. Adjust once you confirm the shape.
        const otpToken =
          response?.otp_token ??
          response?.data?.otp_token ??
          response?.result?.otp_token;

        if (!otpToken) {
          this.toastr.error('Something went wrong. Please try again.');
          return;
        }

        this.toastr.success(response?.message || 'OTP sent successfully!');

        // Persist so a page refresh on /otp doesn't lose it
        sessionStorage.setItem('otpToken', otpToken);
        sessionStorage.setItem('otpFlow', 'register');
        sessionStorage.setItem('registerEmail', this.email.trim());
        sessionStorage.setItem('registerName', this.fullName.trim());

        this.router.navigate(['/otp'], {
          state: {
            otpToken,
            otpFlow: 'register',
            email: this.email.trim(),
            name: this.fullName.trim(),
          },
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error(
          err?.error?.error?.message ||
            err?.error?.message ||
            'Failed to send OTP',
        );
      },
    });
  }
}
