import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../services/producto.service';
import { CartService } from '../../services/cart.service';
import { Producto } from '../../models/producto';

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tienda.html',
  styleUrl: './tienda.css',
})
export class Tienda implements OnInit {
  productos: Producto[] = [];
  cargando = true;
  error = '';
  mensaje = '';
  categoriaSeleccionada = 'TODOS';
  categorias = ['TODOS', 'MAQUINARIA', 'ESTILIZADO', 'PERFUMERIA', 'OTROS'];

  constructor(
    private productoService: ProductoService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargando = true;
    this.error = '';
    const observable = this.categoriaSeleccionada === 'TODOS'
      ? this.productoService.listarProductos()
      : this.productoService.listarPorCategoria(this.categoriaSeleccionada);
    observable.subscribe({
      next: (data) => {
        this.productos = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.cargando = false;
        this.error = 'No se pudieron cargar los productos. Verifica que el backend esté corriendo.';
      },
    });
  }

  cambiarCategoria(categoria: string): void {
    this.categoriaSeleccionada = categoria;
    this.cargarProductos();
  }

  agregarAlCarrito(p: Producto): void {
    if (p.stock <= 0) return;
    this.cartService.agregar(p, 1);
    this.mensaje = `${p.nombre} agregado al carrito.`;
    setTimeout(() => (this.mensaje = ''), 2500);
  }

  sinStock(p: Producto): boolean {
    return p.stock <= 0;
  }

  urlImagen(ruta?: string): string {
    return this.productoService.urlImagen(ruta);
  }
}