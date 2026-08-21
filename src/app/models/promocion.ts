export interface Promocion {
  id: number;
  nombre: string;
  porcentajeDescuento?: number;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
  servicios?: { id: number }[];
  productos?: { id: number }[];
}