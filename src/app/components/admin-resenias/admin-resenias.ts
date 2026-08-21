import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReseniaService } from '../../services/resenia.service';
import { Resenia } from '../../models/resenia';

@Component({
  selector: 'app-admin-resenias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-resenias.html',
  styleUrl: './admin-resenias.css',
})
export class AdminResenias implements OnInit {
  resenias: Resenia[] = [];
  cargando = true;
  error = '';
  mensaje = '';

  constructor(private reseniaService: ReseniaService) {}

  ngOnInit(): void {
    this.cargarResenias();
  }

  cargarResenias(): void {
    this.cargando = true;
    this.error = '';
    this.reseniaService.listarResenias().subscribe({
      next: (data) => {
        this.resenias = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al listar reseñas:', err);
        this.cargando = false;
        this.error = 'No se pudieron cargar las reseñas. Verifica que el backend esté corriendo.';
      },
    });
  }

  eliminar(r: Resenia): void {
    if (!confirm('¿Eliminar esta reseña?')) return;
    this.reseniaService.eliminarResenia(r.id).subscribe({
      next: () => {
        this.resenias = this.resenias.filter((x) => x.id !== r.id);
        this.mensaje = 'Reseña eliminada.';
      },
      error: (err) => {
        console.error('Error al eliminar reseña:', err);
        this.error = 'No se pudo eliminar la reseña.';
      },
    });
  }

  formatearFecha(iso: string | undefined): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toLocaleString('es-PE');
  }
}