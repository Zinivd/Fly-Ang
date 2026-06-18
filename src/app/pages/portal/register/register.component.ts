import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

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
  ) {}

  mobile: string = '';
  fullName: string = '';
  email: string = '';

  onMobileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.mobile = input.value.replace(/[^0-9]/g, '');
  }

  sendOtp(): void {
    if (!this.mobile.trim()) {
      this.toastr.error('Please enter your mobile number');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(this.mobile)) {
      this.toastr.error('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!this.fullName.trim()) {
      this.toastr.error('Please enter your full name');
      return;
    }

    this.toastr.success('OTP sent successfully!');
    this.router.navigate(['/otp']);
  }
}
