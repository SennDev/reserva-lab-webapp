import { Component } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { Navbar } from '../../partials/navbar/navbar';
import { Footer } from '../../partials/footer/footer';

@Component({
  selector: 'app-about-screen',
  standalone: true,
  imports: [SHARED_IMPORTS, Navbar, Footer],
  templateUrl: './about-screen.html',
  styleUrl: './about-screen.scss'
})
export class AboutScreen {
  readonly team = [
    {
      name: 'Gerson Emmanuel Contreras',
      role: 'Product Owner & Frontend Architect',
      contribution: 'Lidera la visión del producto y la arquitectura UI/UX en Angular, implementando el sistema de diseño Neomórfico y la gestión de estado.'
    },
    {
      name: 'Bernardo Palacios Caballero',
      role: 'Backend Developer & API Design',
      contribution: 'Responsable de la arquitectura de la base de datos relacional y el desarrollo de la API RESTful segura utilizando Django y Python.'
    },
    {
      name: 'Pablo Iván Ibarra Valencia',
      role: 'DevOps & QA Engineer',
      contribution: 'Encargado del despliegue en la nube (Vercel/Render), integración continua, pruebas de calidad y optimización del rendimiento.'
    },
    {
      name: 'Dulce, Evelin & Elizabeth',
      role: 'UX/UI Research & Data Modeling',
      contribution: 'Especialistas en la definición de reglas de negocio, modelado de datos, documentación y validación de la experiencia de usuario.'
    }
  ];

  readonly pillars = [
    {
      icon: 'bi bi-bullseye',
      title: 'Resolver un problema académico real',
      description: 'ReservaLab nace para eliminar la fricción, los choques de horario y la desorganización en la asignación de espacios de la FCC BUAP.'
    },
    {
      icon: 'bi bi-people-fill',
      title: 'Unificar la experiencia universitaria',
      description: 'La plataforma concentra solicitudes, aprobaciones, disponibilidad y trazabilidad en un solo entorno digital transparente.'
    },
    {
      icon: 'bi bi-lightning-charge-fill',
      title: 'Operación digital altamente escalable',
      description: 'Diseñada desde el día uno con una arquitectura modular lista para integrarse con sistemas institucionales más grandes.'
    }
  ];

  readonly technologies = [
    'Angular 17+',
    'Signals',
    'SCSS Advanced',
    'Neumorphism UI',
    'Django REST',
    'Python',
    'MySQL',
    'JWT Security'
  ];
}
