import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DevolucionService } from '../../services/devolucion.service';
import { Devolucion } from '../../models/devolucion';

@Component({
  selector: 'app-admin-devoluciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-devoluciones.html',
  styleUrl: './admin-devoluciones.css',
})
export class AdminDevoluciones implements OnInit {
  devoluciones: Devolucion[] = [];
  cargando = true;
  error = '';
  mensaje = '';
  estados = ['PENDIENTE', 'PROCESADO', 'RECHAZADO'];

  constructor(private devolucionService: DevolucionService) {}

  ngOnInit(): void {
    this.cargarDevoluciones();
  }

  cargarDevoluciones(): void {
    this.cargando = true;
    this.error = '';
    this.devolucionService.listarDevoluciones().subscribe({
      next: (data) => {
        this.devoluciones = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al listar devoluciones:', err);
        this.cargando = false;
        this.error = 'No se pudieron cargar las devoluciones. Verifica que el backend esté corriendo.';
      },
    });
  }

  cambiarEstado(devolucion: Devolucion, nuevoEstado: string): void {
    this.mensaje = '';
    this.error = '';
    const copia: Devolucion = { ...devolucion, estado: nuevoEstado };
    this.devolucionService.actualizarDevolucion(devolucion.id, copia).subscribe({
      next: (actualizado) => {
        Object.assign(devolucion, actualizado);
        this.mensaje = `Devolución #${devolucion.id} actualizada a ${nuevoEstado}.`;
      },
      error: (err) => {
        console.error('Error al cambiar estado de devolución:', err);
        this.error = 'No se pudo actualizar el estado de la devolución.';
      },
    });
  }

  formatearFecha(iso: string | undefined): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toLocaleString('es-PE');
  }
}