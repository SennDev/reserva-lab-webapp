import { TipoUsuario, User } from './user.model';

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RegisterPayload {
  nombre: string;
  apellidos: string;
  matricula: string;
  email: string;
  carrera: string;
  tipo_usuario: TipoUsuario;
  password: string;
  confirm_password: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface TokenRefreshResponse {
  access: string;
  refresh?: string;
}
