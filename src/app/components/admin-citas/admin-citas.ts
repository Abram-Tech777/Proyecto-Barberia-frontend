import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitaService } from '../../services/cita.service';
import { Cita } from '../../models/cita';

@Component({
  selector: 'app-admin-citas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-citas.html',
  styleUrl: './admin-citas.css',
})
export class AdminCitas implements OnInit {
  citas: Cita[] = [];
  cargando = true;
  error = '';
  mensaje = '';
  estados = ['PENDIENTE_VALIDAR', 'CONFIRMADA', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA'];
  soloPendientes = false;

  constructor(private citaService: CitaService) {}

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas(): void {
    this.cargando = true;
    this.error = '';
    const observable = this.soloPendientes ? this.citaService.listarPendientes() : this.citaService.listarCitas();
    observable.subscribe({
      next: (data) => {
        this.citas = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al listar citas:', err);
        this.cargando = false;
        this.error = 'No se pudieron cargar las citas. Verifica que el backend esté corriendo.';
      },
    });
  }

  cambiarEstado(cita: Cita, nuevoEstado: string): void {
    this.mensaje = '';
    this.error = '';
    const copia: Cita = { ...cita, estado: nuevoEstado };
    this.citaService.actualizarCita(cita.id!, copia).subscribe({
      next: (actualizado) => {
        Object.assign(cita, actualizado);
        this.mensaje = `Cita #${cita.id} actualizada a ${nuevoEstado}.`;
      },
      error: (err) => {
        console.error('Error al cambiar estado de cita:', err);
        this.error = 'No se pudo actualizar el estado de la cita.';
      },
    });
  }

  eliminar(cita: Cita): void {
    if (!confirm(`¿Eliminar la cita #${cita.id} de ${cita.nombreCliente}?`)) return;
    this.citaService.eliminarCita(cita.id!).subscribe({
      next: () => {
        this.citas = this.citas.filter((c) => c.id !== cita.id);
        this.mensaje = `Cita #${cita.id} eliminada.`;
      },
      error: (err) => {
        console.error('Error al eliminar cita:', err);
        this.error = 'No se pudo eliminar la cita.';
      },
    });
  }

  formatearFecha(iso: string | undefined): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toLocaleString('es-PE');
  }
}