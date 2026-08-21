import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../models/producto';

@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-productos.html',
  styleUrl: './admin-productos.css',
})
export class AdminProductos implements OnInit {
  productos: Producto[] = [];
  cargando = true;
  error = '';
  mensaje = '';
  editando = false;
  editandoId: number | null = null;

  categorias = ['MAQUINARIA', 'ESTILIZADO', 'PERFUMERIA', 'OTROS'];

  nombre = '';
  marca = '';
  descripcionCorta = '';
  descripcionLarga = '';
  imagenUrl = '';
  precio = 0;
  stock = 0;
  stockMinimo = 0;
  categoria = 'OTROS';
  imagenSubiendo = false;

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  urlImagen(ruta?: string): string {
    return this.productoService.urlImagen(ruta);
  }

  alSeleccionarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const archivo = input.files[0];
    if (!archivo.type.startsWith('image/')) {
      this.error = 'Solo se permiten archivos de imagen.';
      return;
    }
    this.imagenSubiendo = true;
    this.error = '';
    this.productoService.subirImagen(archivo).subscribe({
      next: (res) => {
        this.imagenUrl = res.imagenUrl;
        this.imagenSubiendo = false;
        this.mensaje = 'Imagen subida correctamente.';
      },
      error: (err) => {
        console.error('Error al subir imagen:', err);
        this.imagenSubiendo = false;
        this.error = 'No se pudo subir la imagen. Verifica que el backend esté corriendo.';
      },
    });
    input.value = '';
  }

  cargarProductos(): void {
    this.cargando = true;
    this.error = '';
    this.productoService.listarProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al listar productos:', err);
        this.cargando = false;
        this.error = 'No se pudieron cargar los productos. Verifica que el backend esté corriendo.';
      },
    });
  }

  nueva(): void {
    this.editando = false;
    this.editandoId = null;
    this.nombre = '';
    this.marca = '';
    this.descripcionCorta = '';
    this.descripcionLarga = '';
    this.imagenUrl = '';
    this.precio = 0;
    this.stock = 0;
    this.stockMinimo = 0;
    this.categoria = 'OTROS';
  }

  editar(p: Producto): void {
    this.editando = true;
    this.editandoId = p.id;
    this.nombre = p.nombre;
    this.marca = p.marca;
    this.descripcionCorta = p.descripcionCorta;
    this.descripcionLarga = p.descripcionLarga ?? '';
    this.imagenUrl = p.imagenUrl ?? '';
    this.precio = p.precio;
    this.stock = p.stock;
    this.stockMinimo = p.stockMinimo ?? 0;
    this.categoria = p.categoria ?? 'OTROS';
  }

  guardar(): void {
    if (!this.nombre.trim() || !this.marca.trim() || this.precio <= 0 || this.stock < 0) {
      this.error = 'Nombre, marca, precio y stock son obligatorios.';
      return;
    }
    this.error = '';
    const producto: Producto = {
      id: this.editandoId ?? 0,
      nombre: this.nombre.trim(),
      marca: this.marca.trim(),
      descripcionCorta: this.descripcionCorta.trim(),
      descripcionLarga: this.descripcionLarga.trim() || undefined,
      imagenUrl: this.imagenUrl.trim() || undefined,
      precio: this.precio,
      stock: this.stock,
      stockMinimo: this.stockMinimo,
      categoria: this.categoria,
    };
    if (this.editando && this.editandoId != null) {
      this.productoService.actualizarProducto(this.editandoId, producto).subscribe({
        next: (actualizado) => {
          const idx = this.productos.findIndex((p) => p.id === actualizado.id);
          if (idx >= 0) this.productos[idx] = actualizado;
          this.mensaje = `Producto ${actualizado.nombre} actualizado.`;
          this.nueva();
        },
        error: (err) => {
          console.error('Error al actualizar producto:', err);
          this.error = 'No se pudo actualizar el producto.';
        },
      });
    } else {
      this.productoService.crearProducto(producto).subscribe({
        next: (nuevo) => {
          this.productos.push(nuevo);
          this.mensaje = `Producto ${nuevo.nombre} creado.`;
          this.nueva();
        },
        error: (err) => {
          console.error('Error al crear producto:', err);
          this.error = 'No se pudo crear el producto.';
        },
      });
    }
  }

  eliminar(p: Producto): void {
    if (!confirm(`¿Eliminar el producto ${p.nombre}?`)) return;
    this.productoService.eliminarProducto(p.id).subscribe({
      next: () => {
        this.productos = this.productos.filter((x) => x.id !== p.id);
        this.mensaje = `Producto ${p.nombre} eliminado.`;
      },
      error: (err) => {
        console.error('Error al eliminar producto:', err);
        this.error = 'No se pudo eliminar el producto.';
      },
    });
  }

  stockBajo(p: Producto): boolean {
    const minimo = p.stockMinimo ?? 0;
    return minimo > 0 && p.stock <= minimo;
  }
}