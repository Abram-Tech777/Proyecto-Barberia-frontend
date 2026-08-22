import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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
  cuentas: { id: number; email: string; rol: string }[] = [];
  cargando = true;
  error = '';
  mensaje = '';
  editando = false;
  editandoId: number | null = null;

  nombreCompleto = '';
  porcentajeComision = 0;
  activo = true;
  usuarioVinculadoId: number | null = null;

  constructor(
    private barberoService: BarberoService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.cargarBarberos();
    this.cargarCuentas();
  }

  cargarCuentas(): void {
    this.http.get<any[]>('http://localhost:8080/api/usuarios').subscribe({
      next: (data) => {
        this.cuentas = data
          .filter((u) => u.rol === 'BARBERO' || u.rol === 'ADMIN')
          .map((u) => ({ id: u.id, email: u.email, rol: u.rol }));
      },
      error: () => {
        console.error('No se pudieron cargar las cuentas de usuario.');
      },
    });
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
    this.usuarioVinculadoId = null;
  }

  editar(b: Barbero): void {
    this.editando = true;
    this.editandoId = b.id;
    this.nombreCompleto = b.nombreCompleto;
    this.porcentajeComision = b.porcentajeComision ?? 0;
    this.activo = b.activo;
    this.usuarioVinculadoId = b.usuario?.id ?? null;
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
      usuario: this.usuarioVinculadoId ? { id: this.usuarioVinculadoId } : null,
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
    if (!confirm(`¿Eliminar al barbero ${b.nombreCompleto}? Esta acción solo es posible si no tiene citas registradas.`)) return;
    this.barberoService.eliminarBarbero(b.id).subscribe({
      next: () => {
        this.error = '';
        this.barberos = this.barberos.filter((x) => x.id !== b.id);
        this.mensaje = `Barbero ${b.nombreCompleto} eliminado.`;
      },
      error: (err) => {
        console.error('Error al eliminar barbero:', err);
        const detalle = (err?.error && typeof err.error.message === 'string') ? ` ${err.error.message}` : '';
        this.error = `No se pudo eliminar el barbero.${detalle}`;
        this.mensaje = '';
      },
    });
  }

  toggleActivo(b: Barbero): void {
    const accion = b.activo ? 'desactivar' : 'activar';
    if (!confirm(`¿${accion.charAt(0).toUpperCase()}${accion.slice(1)} al barbero ${b.nombreCompleto}?`)) return;
    this.barberoService.actualizarBarbero(b.id, { ...b, activo: !b.activo }).subscribe({
      next: (actualizado) => {
        this.error = '';
        const idx = this.barberos.findIndex((x) => x.id === actualizado.id);
        if (idx >= 0) this.barberos[idx] = actualizado;
        this.mensaje = `Barbero ${actualizado.nombreCompleto} ${actualizado.activo ? 'activado' : 'desactivado'}.`;
      },
      error: (err) => {
        console.error('Error al cambiar estado del barbero:', err);
        this.error = 'No se pudo cambiar el estado del barbero.';
      },
    });
  }
}