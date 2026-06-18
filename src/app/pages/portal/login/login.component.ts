import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  constructor(
    private toastr: ToastrService,
    private router: Router,
  ) {}

  mobile: string = '';
  fullName: string = '';

  sendOtp(): void {
    this.toastr.success('OTP sent successfully!');
    this.router.navigate(['/otp']);
  }
}
