export interface Usuario {
  id?: number;
  nombreUsuario?: string;
  contrasenia?: string;
  email: string;
  telefono?: string;
  rol: string;
  tipoRegistro: string;
  idGoogle?: string;
  recibirPromociones: boolean;
  activo: boolean;
}