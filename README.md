# 🧪 ReservaLab - Sistema de Gestión de Espacios (v.0.1 Alpha)

<p align="center">
  <img src="https://raw.githubusercontent.com/SennDev/reserva-lab-webapp/master/src/assets/logo_placeholder.png" alt="Logo ReservaLab" width="180"/>
</p>

**Una solución web premium y minimalista para la administración de laboratorios y equipos en la Facultad de Ciencias de la Computación (FCC).** ✨

ReservaLab nace para optimizar la interacción entre estudiantes, técnicos y administrativos, ofreciendo un entorno digital intuitivo basado en **Neomorfismo**, diseñado específicamente para las necesidades académicas de la BUAP.

---

## 🌐 Ver la Demo en Vivo

¡Explora la arquitectura frontend y el diseño interactivo aquí! 👇

**[https://senndev.github.io/reserva-lab-webapp/](https://senndev.github.io/reserva-lab-webapp/)**

---

## 🔥 Características (v.0.1 Alpha)

* **Dashboard Inteligente:** Visión general de métricas clave (ocupación global, reservas activas y préstamos) con widgets dinámicos e interactivos.
* **Catálogo de Laboratorios:** Listado completo de espacios con filtrado en tiempo real, detalles de equipamiento fijo y badges de disponibilidad.
* **Gestión de Reservas:** Historial detallado estilo "Inbox" con jerarquía visual por materia, solicitante y estados (Aprobada, Pendiente, Rechazada).
* **Inventario de Equipos:** Módulo administrativo para el control de hardware con rastreo de números de serie (S/N) y ubicación.
* **Diseño Neomórfico High-End:**
    * Interfaz "Soft UI" con sombras profundas y transiciones fluidas.
    * **Responsividad Premium:** Adaptación total desde monitores 4K hasta pantallas móviles.
    * Componentes interactivos con feedback visual inmediato.
* **Validación de Negocio:** Formulario de reservas con bloqueo inteligente de fechas pasadas para asegurar solicitudes coherentes.

---

## 🚀 Estado y Próximos Pasos (Fase 3)

El proyecto ha concluido su **Fase 2 (Arquitectura UI)**. Las prioridades actuales para la siguiente etapa son:

1.  **Integración con Backend (Django):** 🔌 Sustituir los servicios simulados por peticiones HTTP reales a la base de datos.
2.  **Sistema de Autenticación Real:** 🔐 Implementar JWT para el control de acceso según roles (Admin, Técnico, Alumno).
3.  **Notificaciones en Tiempo Real:** 🔔 Avisos automáticos sobre el cambio de estado en las solicitudes de reserva.
4.  **Generación de Reportes:** 📊 Exportación de estadísticas de uso de laboratorios en formato PDF/Excel.

---

## 💻 Pila Tecnológica

* **Frontend:** Angular 17+ (Componentes Standalone & Signals)
* **Estilos:** SCSS Avanzado (Mixins, Variables, Clamp functions)
* **Iconografía:** Bootstrap Icons
* **Enrutamiento:** Angular Router con `HashLocationStrategy` (Optimizado para GitHub Pages)
* **Despliegue:** GitHub Pages

---

## 🛠️ Cómo Correr Localmente

1.  Clona el repositorio:
    ```bash
    git clone [https://github.com/SennDev/reserva-lab-webapp.git](https://github.com/SennDev/reserva-lab-webapp.git)
    ```
2.  Entra al directorio:
    ```bash
    cd reserva-lab-webapp
    ```
3.  Instala las dependencias:
    ```bash
    npm install
    ```
4.  Levanta el servidor de desarrollo:
    ```bash
    ng serve
    ```
5.  Abre `http://localhost:4200/` en tu navegador.

---

## 👥 Equipo de Desarrollo

Este proyecto es el resultado del esfuerzo colaborativo de:

* **Dulce Aranza**
* **Gerson Emmanuel (SennDev)**
* **Evelin Estrella**
* **Pablo Iván**
* **Elizabeth**
* **Bernardo**

---

*Proyecto desarrollado para la materia de Desarrollo de Sitios Web - FCC BUAP 2026*
