export interface Barbero {
  id: number;
  nombreCompleto: string;
  porcentajeComision?: number;
  usuario?: { id: number } | null;
  usuarioEmail?: string | null;
  usuarioRol?: string | null;
  activo: boolean;
}