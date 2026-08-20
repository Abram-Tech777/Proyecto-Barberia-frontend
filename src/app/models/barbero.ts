export interface Barbero {
  id: number;
  nombreCompleto: string;
  porcentajeComision?: number;
  usuario?: { id: number } | null;
  activo: boolean;
}