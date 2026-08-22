import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PromocionService } from '../../services/promocion.service';
import { Promocion } from '../../models/promocion';

@Component({
  selector: 'app-admin-promociones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-promociones.html',
  styleUrl: './admin-promociones.css',
})
export class AdminPromociones implements OnInit {
  promociones: Promocion[] = [];
  cargando = true;
  error = '';
  mensaje = '';
  editando = false;
  editandoId: number | null = null;
  notificandoId: number | null = null;

  nombre = '';
  porcentajeDescuento = 0;
  fechaInicio = '';
  fechaFin = '';
  activo = true;

  constructor(private promocionService: PromocionService) {}

  ngOnInit(): void {
    this.cargarPromociones();
  }

  cargarPromociones(): void {
    this.cargando = true;
    this.error = '';
    this.promocionService.listarPromociones().subscribe({
      next: (data) => {
        this.promociones = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al listar promociones:', err);
        this.cargando = false;
        this.error = 'No se pudieron cargar las promociones. Verifica que el backend esté corriendo.';
      },
    });
  }

  nueva(): void {
    this.editando = false;
    this.editandoId = null;
    this.nombre = '';
    this.porcentajeDescuento = 0;
    this.fechaInicio = new Date().toISOString().slice(0, 10);
    this.fechaFin = new Date().toISOString().slice(0, 10);
    this.activo = true;
  }

  editar(p: Promocion): void {
    this.editando = true;
    this.editandoId = p.id;
    this.nombre = p.nombre;
    this.porcentajeDescuento = p.porcentajeDescuento ?? 0;
    this.fechaInicio = p.fechaInicio;
    this.fechaFin = p.fechaFin;
    this.activo = p.activo;
  }

  guardar(): void {
    if (!this.nombre.trim() || !this.fechaInicio || !this.fechaFin) {
      this.error = 'Nombre y fechas son obligatorios.';
      return;
    }
    this.error = '';
    const promocion: Promocion = {
      id: this.editandoId ?? 0,
      nombre: this.nombre.trim(),
      porcentajeDescuento: this.porcentajeDescuento,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      activo: this.activo,
    };
    if (this.editando && this.editandoId != null) {
      this.promocionService.actualizarPromocion(this.editandoId, promocion).subscribe({
        next: (actualizado) => {
          const idx = this.promociones.findIndex((p) => p.id === actualizado.id);
          if (idx >= 0) this.promociones[idx] = actualizado;
          this.mensaje = `Promoción ${actualizado.nombre} actualizada.`;
          this.nueva();
        },
        error: (err) => {
          console.error('Error al actualizar promoción:', err);
          this.error = 'No se pudo actualizar la promoción.';
        },
      });
    } else {
      this.promocionService.crearPromocion(promocion).subscribe({
        next: (nuevo) => {
          this.promociones.push(nuevo);
          this.mensaje = `Promoción ${nuevo.nombre} creada.`;
          this.nueva();
        },
        error: (err) => {
          console.error('Error al crear promoción:', err);
          this.error = 'No se pudo crear la promoción.';
        },
      });
    }
  }

  eliminar(p: Promocion): void {
    if (!confirm(`¿Eliminar la promoción ${p.nombre}?`)) return;
    this.promocionService.eliminarPromocion(p.id).subscribe({
      next: () => {
        this.promociones = this.promociones.filter((x) => x.id !== p.id);
        this.mensaje = `Promoción ${p.nombre} eliminada.`;
      },
      error: (err) => {
        console.error('Error al eliminar promoción:', err);
        this.error = 'No se pudo eliminar la promoción.';
      },
    });
  }

  notificarPorCorreo(p: Promocion): void {
    if (!confirm(`¿Enviar la promoción "${p.nombre}" por correo a los clientes suscritos?`)) return;
    this.error = '';
    this.mensaje = '';
    this.notificandoId = p.id!;
    this.promocionService.notificarPorCorreo(p.id!).subscribe({
      next: ({ enviados }) => {
        this.notificandoId = null;
        this.mensaje = enviados > 0
          ? `Promoción "${p.nombre}" enviada a ${enviados} cliente(s).`
          : 'No hay clientes suscritos con recibirPromociones activo.';
      },
      error: () => {
        this.notificandoId = null;
        this.error = 'No se pudieron enviar los correos. Verifica la configuración SMTP.';
      },
    });
  }
}