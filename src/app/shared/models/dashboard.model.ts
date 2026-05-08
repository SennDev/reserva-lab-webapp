export interface DashboardStat {
  title: string;
  value: string | number;
  subtext: string;
  icon: string;
  color: string;
}

export interface DashboardReserva {
  lab: string;
  materia: string;
  fecha: string;
  estado: 'Confirmada' | 'Pendiente' | 'Rechazada';
  badgeClass: string;
}

export interface DashboardSummaryResponse {
  stats: DashboardStat[];
  proximas_reservas: DashboardReserva[];
  ocupacion_global: number;
}
