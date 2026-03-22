export interface User {
  id_usuario: string;        // ID único (puede ser UUID o generado por BD)
  nombre_completo: string;
  matricula: string;         // 9 dígitos para estudiantes, o ID de empleado
  email: string;
  carrera_departamento: string;
  tipo_usuario: 'estudiante' | 'personal';
  rol: 'admin' | 'tecnico' | 'estudiante'; // Vital para ocultar/mostrar menús en el Dashboard
  avatarUrl?: string;        // Opcional (?) por si luego agregamos fotos de perfil
}
