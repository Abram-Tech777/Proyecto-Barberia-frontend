import { DetalleVenta } from './detalle-venta';

export interface Venta {
  id?: number;
  comprador?: { id: number };
  citaAsociada?: { id: number } | null;
  fechaTransaccion?: string;
  montoTotal: number;
  medioPago: string;
  tipoDespacho: string;
  origenOrden: string;
  direccionEnvio?: { id: number } | null;
  coordenadasEnvio?: string;
  referenciaDireccion?: string;
  costoEnvio?: number;
  igv?: number;
  estadoPedido: string;
  detalles?: DetalleVenta[];
}