export interface DetalleVenta {
  id?: number;
  producto: { id: number; nombre?: string };
  cantidad: number;
  precioUnitario: number;
}