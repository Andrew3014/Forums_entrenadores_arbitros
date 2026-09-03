export type FormType = 'entrenador' | 'arbitro';

export type Gender = 'masculino' | 'femenino' | 'otro';

export interface FormData {
  tipo: FormType;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  genero: Gender;
  ci: string;
  nivel: string;
  ultimo_curso: string;
  tiempo_experiencia: string;
  club_entrena?: string;
  telefono: string;
}

export interface Submission extends FormData {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}