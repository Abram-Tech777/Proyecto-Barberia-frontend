export interface Devolucion {
  id?: number;
  detalleVenta: {
    id: number;
    cantidad?: number;
    precioUnitario?: number;
    producto?: { id: number; nombre?: string };
  };
  motivo: string;
  montoReembolso?: number;
  estado: string;
  fechaRegistro?: string;
}
