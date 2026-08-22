export interface Cita {
  id?: number;
  barbero?: { id: number; nombreCompleto?: string } | null;
  servicio?: { id: number; nombre?: string; duracionMinutos?: number; precioBase?: number } | null;
  nombreCliente: string;
  celularCliente: string;
  horaInicio: string;
  horaFin: string;
  estado?: string;
  codigoPago?: string;
  tipoPago?: string;
  metodoPago?: string;
  montoTotal?: number;
  montoAbonado?: number;
  saldoPendiente?: number;
  selloAplicado?: boolean;
  fechaCreacion?: string;
}