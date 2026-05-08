export type LoanStatus = 'Pendiente' | 'Aprobado' | 'Rechazado' | 'Devuelto';
export type LoanStatusUpdate = Extract<LoanStatus, 'Aprobado' | 'Rechazado' | 'Devuelto'>;

export interface Prestamo {
  id: string;
  equipo: string;
  equipoId?: string | null;
  numero_serie: string;
  fecha: string;
  fecha_iso?: string;
  horario: string;
  proyecto: string;
  motivo: string;
  cantidad: number;
  estado: LoanStatus;
  solicitante: string;
  solicitanteId?: string | null;
}

export interface PrestamoPayload {
  equipoId: string;
  fecha: string;
  horario: string;
  proyecto: string;
  motivo: string;
  cantidad: number | null;
  solicitanteId?: string;
}
