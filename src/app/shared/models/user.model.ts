export type TipoUsuario = 'estudiante' | 'tecnico' | 'admin' | 'personal';
export type UserRole = 'admin' | 'tecnico' | 'estudiante';

export interface User {
  id_usuario: string;
  nombre?: string;
  apellidos?: string;
  nombre_completo: string;
  matricula: string;
  email: string;
  carrera?: string;
  carrera_departamento?: string;
  tipo_usuario: TipoUsuario;
  rol: UserRole;
  avatarUrl?: string | null;
}

export interface CurrentUserUpdatePayload {
  nombre?: string;
  apellidos?: string;
  carrera?: string;
  carrera_departamento?: string;
  avatarUrl?: string | null;
}
