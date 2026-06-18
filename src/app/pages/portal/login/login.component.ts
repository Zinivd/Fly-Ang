import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {

  mobile: string = '';
  fullName: string = '';

  sendOtp(): void {
    console.log('Sending OTP to:', this.mobile, 'Name:', this.fullName);
  }
}
