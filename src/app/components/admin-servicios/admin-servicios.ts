import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicioService } from '../../services/servicio.service';
import { Servicio } from '../../models/servicio';

@Component({
  selector: 'app-admin-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-servicios.html',
  styleUrl: './admin-servicios.css',
})
export class AdminServicios implements OnInit {
  servicios: Servicio[] = [];
  cargando = true;
  error = '';
  mensaje = '';
  editando = false;
  editandoId: number | null = null;

  nombre = '';
  descripcion = '';
  duracionMinutos = 30;
  precioBase = 0;

  constructor(private servicioService: ServicioService) {}

  ngOnInit(): void {
    this.cargarServicios();
  }

  cargarServicios(): void {
    this.cargando = true;
    this.error = '';
    this.servicioService.obtenerServicios().subscribe({
      next: (data) => {
        this.servicios = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al listar servicios:', err);
        this.cargando = false;
        this.error = 'No se pudieron cargar los servicios. Verifica que el backend esté corriendo.';
      },
    });
  }

  nueva(): void {
    this.editando = false;
    this.editandoId = null;
    this.nombre = '';
    this.descripcion = '';
    this.duracionMinutos = 30;
    this.precioBase = 0;
  }

  editar(s: Servicio): void {
    this.editando = true;
    this.editandoId = s.id;
    this.nombre = s.nombre;
    this.descripcion = s.descripcion ?? '';
    this.duracionMinutos = s.duracionMinutos;
    this.precioBase = s.precioBase;
  }

  guardar(): void {
    if (!this.nombre.trim() || !this.duracionMinutos || this.precioBase <= 0) {
      this.error = 'Nombre, duración y precio son obligatorios.';
      return;
    }
    this.error = '';
    const servicio: Servicio = {
      id: this.editandoId ?? 0,
      nombre: this.nombre.trim(),
      descripcion: this.descripcion.trim() || undefined,
      duracionMinutos: this.duracionMinutos,
      precioBase: this.precioBase,
    };
    if (this.editando && this.editandoId != null) {
      this.servicioService.actualizarServicio(this.editandoId, servicio).subscribe({
        next: (actualizado) => {
          const idx = this.servicios.findIndex((s) => s.id === actualizado.id);
          if (idx >= 0) this.servicios[idx] = actualizado;
          this.mensaje = `Servicio ${actualizado.nombre} actualizado.`;
          this.nueva();
        },
        error: (err) => {
          console.error('Error al actualizar servicio:', err);
          this.error = 'No se pudo actualizar el servicio.';
        },
      });
    } else {
      this.servicioService.crearServicio(servicio).subscribe({
        next: (nuevo) => {
          this.servicios.push(nuevo);
          this.mensaje = `Servicio ${nuevo.nombre} creado.`;
          this.nueva();
        },
        error: (err) => {
          console.error('Error al crear servicio:', err);
          this.error = 'No se pudo crear el servicio.';
        },
      });
    }
  }

  eliminar(s: Servicio): void {
    if (!confirm(`¿Eliminar el servicio ${s.nombre}?`)) return;
    this.servicioService.eliminarServicio(s.id).subscribe({
      next: () => {
        this.servicios = this.servicios.filter((x) => x.id !== s.id);
        this.mensaje = `Servicio ${s.nombre} eliminado.`;
      },
      error: (err) => {
        console.error('Error al eliminar servicio:', err);
        this.error = 'No se pudo eliminar el servicio.';
      },
    });
  }
}