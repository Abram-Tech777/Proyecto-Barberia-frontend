export interface Cita {
  id?: number;
  barbero: { id: number; nombreCompleto?: string };
  nombreCliente: string;
  celularCliente: string;
  horaInicio: string;
  horaFin: string;
  estado?: string;
  codigoPago?: string;
  tipoPago?: string;
  montoTotal?: number;
  montoAbonado?: number;
  saldoPendiente?: number;
  selloAplicado?: boolean;
  fechaCreacion?: string;
}