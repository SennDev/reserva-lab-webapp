export type LabStatus = 'Disponible' | 'En Mantenimiento' | 'Ocupado';

export interface Laboratorio {
  id: string;
  nombre: string;
  edificio: string;
  tipo: string;
  capacidad: number;
  estado: LabStatus;
  equipamiento: string[];
  icon: string;
  color: string;
}

export interface LaboratorioPayload {
  nombre: string;
  edificio: string;
  tipo: string;
  capacidad: number | null;
  estado: LabStatus;
  equipamiento: string;
}
