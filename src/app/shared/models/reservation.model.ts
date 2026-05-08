export type ReservationStatus = 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Completada';
export type ReservationStatusUpdate = Extract<
  ReservationStatus,
  'Aprobada' | 'Rechazada' | 'Completada'
>;

export interface Reserva {
  id: string;
  lab: string;
  laboratorioId?: string | null;
  fecha: string;
  fecha_iso?: string;
  horario: string;
  materia: string;
  motivo: string;
  estado: ReservationStatus;
  solicitante: string;
  solicitanteId?: string | null;
}

export interface ReservaPayload {
  laboratorioId: string;
  fecha: string;
  horario: string;
  materia: string;
  motivo: string;
  solicitanteId?: string;
}
