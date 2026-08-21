import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BarberoService } from '../../services/barbero.service';
import { Barbero } from '../../models/barbero';

@Component({
  selector: 'app-admin-barberos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-barberos.html',
  styleUrl: './admin-barberos.css',
})
export class AdminBarberos implements OnInit {
  barberos: Barbero[] = [];
  cargando = true;
  error = '';
  mensaje = '';
  editando = false;
  editandoId: number | null = null;

  nombreCompleto = '';
  porcentajeComision = 0;
  activo = true;

  constructor(private barberoService: BarberoService) {}

  ngOnInit(): void {
    this.cargarBarberos();
  }

  cargarBarberos(): void {
    this.cargando = true;
    this.error = '';
    this.barberoService.listarBarberos().subscribe({
      next: (data) => {
        this.barberos = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al listar barberos:', err);
        this.cargando = false;
        this.error = 'No se pudieron cargar los barberos. Verifica que el backend esté corriendo.';
      },
    });
  }

  nueva(): void {
    this.editando = false;
    this.editandoId = null;
    this.nombreCompleto = '';
    this.porcentajeComision = 0;
    this.activo = true;
  }

  editar(b: Barbero): void {
    this.editando = true;
    this.editandoId = b.id;
    this.nombreCompleto = b.nombreCompleto;
    this.porcentajeComision = b.porcentajeComision ?? 0;
    this.activo = b.activo;
  }

  guardar(): void {
    if (!this.nombreCompleto.trim()) {
      this.error = 'El nombre del barbero es obligatorio.';
      return;
    }
    this.error = '';
    const barbero: Barbero = {
      id: this.editandoId ?? 0,
      nombreCompleto: this.nombreCompleto.trim(),
      porcentajeComision: this.porcentajeComision,
      activo: this.activo,
    };
    if (this.editando && this.editandoId != null) {
      this.barberoService.actualizarBarbero(this.editandoId, barbero).subscribe({
        next: (actualizado) => {
          const idx = this.barberos.findIndex((b) => b.id === actualizado.id);
          if (idx >= 0) this.barberos[idx] = actualizado;
          this.mensaje = `Barbero ${actualizado.nombreCompleto} actualizado.`;
          this.nueva();
        },
        error: (err) => {
          console.error('Error al actualizar barbero:', err);
          this.error = 'No se pudo actualizar el barbero.';
        },
      });
    } else {
      this.barberoService.crearBarbero(barbero).subscribe({
        next: (nuevo) => {
          this.barberos.push(nuevo);
          this.mensaje = `Barbero ${nuevo.nombreCompleto} registrado.`;
          this.nueva();
        },
        error: (err) => {
          console.error('Error al crear barbero:', err);
          this.error = 'No se pudo registrar el barbero.';
        },
      });
    }
  }

  eliminar(b: Barbero): void {
    if (!confirm(`¿Eliminar al barbero ${b.nombreCompleto}?`)) return;
    this.barberoService.eliminarBarbero(b.id).subscribe({
      next: () => {
        this.barberos = this.barberos.filter((x) => x.id !== b.id);
        this.mensaje = `Barbero ${b.nombreCompleto} eliminado.`;
      },
      error: (err) => {
        console.error('Error al eliminar barbero:', err);
        this.error = 'No se pudo eliminar el barbero.';
      },
    });
  }
}