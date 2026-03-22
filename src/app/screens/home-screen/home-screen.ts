import { Component, signal } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { Navbar } from '../../partials/navbar/navbar';
import { Footer } from '../../partials/footer/footer';

@Component({
  selector: 'app-home-screen',
  standalone: true,
  imports: [SHARED_IMPORTS, Navbar, Footer],
  templateUrl: './home-screen.html',
  styleUrl: './home-screen.scss'
})
export class HomeScreen {
  public activeFeatureIndex = signal<number>(0);

  public steps = [
    { num: '01', title: 'Explora', desc: 'Consulta el catálogo y disponibilidad en tiempo real.' },
    { num: '02', title: 'Reserva', desc: 'Selecciona tu horario y recibe confirmación inmediata.' },
    { num: '03', title: 'Utiliza', desc: 'Accede al laboratorio o recibe tu equipo solicitado.' }
  ];

  public features = [
    { icon: 'bi-calendar-check', title: 'Gestión Inteligente', desc: 'Reserva espacios de manera centralizada. Nuestro motor de validación síncrona previene duplicidad y choques de horarios en tiempo real, garantizando disponibilidad.', colorClass: 'text-primary' },
    { icon: 'bi-box-seam', title: 'Control Dinámico', desc: 'Monitorea la existencia y el estado físico de los equipos de laboratorio, solicitando préstamos directamente desde la plataforma con flujos de aprobación.', colorClass: 'text-success' },
    { icon: 'bi-graph-up-arrow', title: 'Métricas Exactas', desc: 'Analiza la tasa de ocupación de las instalaciones, horas pico y el uso detallado de recursos para una mejor toma de decisiones institucionales.', colorClass: 'text-warning' }
  ];

  public laboratorios = [
    { nombre: 'Lab de Química Central', capacidad: 20, equipamiento: ['Microscopios', 'Centrífugas', 'Espectrofotómetro'], icon: 'bi-droplet-half', color: 'text-success' },
    { nombre: 'Lab de Física Experimental', capacidad: 25, equipamiento: ['Osciloscopios', 'Generadores', 'Multímetros'], icon: 'bi-lightning-charge-fill', color: 'text-warning' },
    { nombre: 'Lab de Computación Avanzada', capacidad: 30, equipamiento: ['Workstations', 'Servidores', 'Impresoras 3D'], icon: 'bi-pc-display', color: 'text-primary' },
    { nombre: 'Lab de Biología Molecular', capacidad: 18, equipamiento: ['Incubadoras', 'Autoclaves', 'Microscopios'], icon: 'bi-bug-fill', color: 'text-danger' }
  ];

  public toggleFeature(index: number): void {
    this.activeFeatureIndex.set(index);
  }
}
