export interface Devolucion {
  id: number;
  cita: { id: number };
  montoReembolso: number;
  celularCliente: string;
  estado: string;
  fechaRegistro?: string;
}