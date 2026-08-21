export interface Producto {
  id: number;
  nombre: string;
  marca: string;
  descripcionCorta: string;
  descripcionLarga?: string;
  imagenUrl?: string;
  precio: number;
  stock: number;
  stockMinimo?: number;
  categoria?: string;
}