import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ServicioService } from '../../services/servicio.service';
import { DescuentoService } from '../../services/descuento.service';
import { Servicio } from '../../models/servicio';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './servicios.component.html',
  styleUrl: './servicios.component.css',
})
export class ServiciosComponent implements OnInit {
  servicios: Servicio[] = [];
  cargando = true;
  error = '';

  constructor(
    private servicioService: ServicioService,
    private descuentoService: DescuentoService
  ) {}

  ngOnInit(): void {
    this.descuentoService.cargarPromociones();
    this.servicioService.obtenerServicios().subscribe({
      next: (data) => {
        this.servicios = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al obtener servicios:', err);
        this.cargando = false;
        this.error = 'No se pudieron cargar los servicios. Verifica que el backend esté corriendo.';
      },
    });
  }

  porcentajeDescuento(s: Servicio): number {
    return this.descuentoService.porcentajeServicio(s.id);
  }

  precioFinal(s: Servicio): number {
    return this.descuentoService.precioFinalServicio(s);
  }
}