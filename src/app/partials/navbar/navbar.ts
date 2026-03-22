import { Component, signal } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared-imports';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  isMobileMenuOpen = signal(false);

  toggleMenu() {
    this.isMobileMenuOpen.update(val => !val);
  }

  closeMenu() {
    this.isMobileMenuOpen.set(false);
  }
}
