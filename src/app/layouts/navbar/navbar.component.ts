import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  isLoggedIn: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkAuthStatus();

    const hash = window.location.hash;
    if (hash) {
      const tabButton = document.querySelector<HTMLElement>(
        `[data-bs-target="${hash}"]`,
      );
      if (tabButton) {
        tabButton.click();
      }
    }
  }

  private checkAuthStatus(): void {
    const token = localStorage.getItem('authToken');
    this.isLoggedIn = !!token;
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('tokenExpiresAt');
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }
}
