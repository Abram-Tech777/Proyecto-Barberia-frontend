import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ServicioService } from '../../services/servicio.service';
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

  constructor(private servicioService: ServicioService) {}

  ngOnInit(): void {
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
}