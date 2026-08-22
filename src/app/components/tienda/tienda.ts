import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { DescuentoService } from '../../services/descuento.service';
import { Producto } from '../../models/producto';


@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
    private cartService: CartService,
    private authService: AuthService,
    private descuentoService: DescuentoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.descuentoService.cargarPromociones();
    this.cargarProductos();
  }

  porcentajeDescuento(p: Producto): number {
    return this.descuentoService.porcentajeProducto(p.id);
  }

  precioFinal(p: Producto): number {
    return this.descuentoService.precioFinalProducto(p);
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
    if (!this.authService.getSesion()) {
      this.router.navigate(['/login']);
      return;
    }
    this.cartService.agregar(p, 1);
    this.mensaje = `${p.nombre} agregado al carrito.`;
    setTimeout(() => (this.mensaje = ''), 2500);
  }

  sinStock(p: Producto): boolean {
    return p.stock <= 0;
  }

  sinImagenLocal: { [id: number]: boolean } = {};

  imagenProducto(p: Producto): string {
    if (p.imagenUrl) return this.productoService.urlImagen(p.imagenUrl);
    if (!this.sinImagenLocal[p.id]) return `img/productos/${p.id}.jpg`;
    return '';
  }

  marcarSinImagen(p: Producto): void {
    this.sinImagenLocal[p.id] = true;
  }

  urlImagen(ruta?: string): string {
    return this.productoService.urlImagen(ruta);
  }
}