import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {

  ngOnInit(): void {
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
}
