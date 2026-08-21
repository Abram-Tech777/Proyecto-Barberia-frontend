import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentaService } from '../../services/venta.service';
import { DetalleVentaService } from '../../services/detalle-venta.service';
import { Venta } from '../../models/venta';
import { DetalleVenta } from '../../models/detalle-venta';

@Component({
  selector: 'app-admin-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-ventas.html',
  styleUrl: './admin-ventas.css',
})
export class AdminVentas implements OnInit {
  ventas: Venta[] = [];
  cargando = true;
  error = '';
  mensaje = '';
  estados = ['PENDIENTE_PAGO', 'PAGADO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO'];
  detalleVisible: number | null = null;
  detallesMap: { [ventaId: number]: DetalleVenta[] } = {};

  constructor(
    private ventaService: VentaService,
    private detalleVentaService: DetalleVentaService
  ) {}

  ngOnInit(): void {
    this.cargarVentas();
  }

  cargarVentas(): void {
    this.cargando = true;
    this.error = '';
    this.ventaService.listarVentas().subscribe({
      next: (data) => {
        this.ventas = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al listar ventas:', err);
        this.cargando = false;
        this.error = 'No se pudieron cargar las ventas. Verifica que el backend esté corriendo.';
      },
    });
  }

  cambiarEstado(venta: Venta, nuevoEstado: string): void {
    this.mensaje = '';
    this.error = '';
    const copia: Venta = { ...venta, estadoPedido: nuevoEstado };
    this.ventaService.actualizarVenta(venta.id!, copia).subscribe({
      next: (actualizado) => {
        Object.assign(venta, actualizado);
        this.mensaje = `Venta #${venta.id} actualizada a ${nuevoEstado}.`;
      },
      error: (err) => {
        console.error('Error al cambiar estado de venta:', err);
        this.error = 'No se pudo actualizar el estado de la venta.';
      },
    });
  }

  toggleDetalle(ventaId: number): void {
    if (this.detalleVisible === ventaId) {
      this.detalleVisible = null;
      return;
    }
    this.detalleVisible = ventaId;
    if (!this.detallesMap[ventaId]) {
      this.detalleVentaService.listarPorVenta(ventaId).subscribe({
        next: (detalles) => {
          this.detallesMap[ventaId] = detalles;
        },
        error: (err) => {
          console.error('Error al cargar detalle de venta:', err);
          this.error = 'No se pudo cargar el detalle de la venta.';
        },
      });
    }
  }

  formatearFecha(iso: string | undefined): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toLocaleString('es-PE');
  }
}