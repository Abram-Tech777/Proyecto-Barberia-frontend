export interface Cita {
  id?: number;
  barbero: { id: number };
  nombreCliente: string;
  celularCliente: string;
  horaInicio: string;
  horaFin: string;
  estado?: string;
  montoTotal?: number;
}