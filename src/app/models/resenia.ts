export interface Resenia {
  id: number;
  producto: { id: number; nombre?: string };
  usuario: { id: number; email?: string; nombreUsuario?: string };
  estrellas: number;
  comentario?: string;
  fechaCreacion?: string;
}