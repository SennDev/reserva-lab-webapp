export type EquipmentStatus = 'Disponible' | 'En Préstamo' | 'Mantenimiento' | 'Baja';

export interface Equipo {
  id: string;
  nombre: string;
  numero_serie: string;
  laboratorio: string;
  laboratorioId?: string | null;
  ubicacion?: string;
  estado: EquipmentStatus;
  cantidad_total: number;
  cantidad_disponible: number;
  icon: string;
  color: string;
}

export interface EquipoPayload {
  nombre: string;
  numero_serie: string;
  laboratorioId?: string | null;
  ubicacion: string;
  estado: EquipmentStatus;
  cantidad_total: number | null;
  cantidad_disponible: number | null;
}
