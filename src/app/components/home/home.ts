import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ServicioService } from '../../services/servicio.service';
import { Servicio } from '../../models/servicio';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  servicios: Servicio[] = [];
  cargando = true;

  constructor(private servicioService: ServicioService) {}

  ngOnInit(): void {
    this.servicioService.obtenerServicios().subscribe({
      next: (data) => {
        this.servicios = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar servicios:', err);
        this.cargando = false;
      },
    });
  }
}