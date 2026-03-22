import { Component } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared-imports';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
  // Un pequeño detalle interactivo para volver al inicio suavemente
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
