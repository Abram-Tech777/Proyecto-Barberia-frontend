import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BarberoService } from '../../services/barbero.service';
import { CitaService } from '../../services/cita.service';
import { AuthService } from '../../services/auth.service';
import { Barbero } from '../../models/barbero';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservas.component.html',
  styleUrl: './reservas.component.css',
})
export class ReservasComponent implements OnInit {
  barberos: Barbero[] = [];
  cargandoBarberos = true;

  nombreCliente = '';
  celularCliente = '';
  barberoId = 0;
  fechaHora = '';
  montoTotal?: number;

  enviando = false;
  mensajeExito = '';
  error = '';
  errorBarberos = '';

  constructor(
    private barberoService: BarberoService,
    private citaService: CitaService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.getSesion();
    if (usuario) {
      this.nombreCliente = usuario.nombreUsuario ?? '';
      this.celularCliente = usuario.telefono ?? '';
    }
    this.barberoService.obtenerBarberosActivos().subscribe({
      next: (data) => {
        this.barberos = data;
        if (this.barberos.length > 0) {
          this.barberoId = this.barberos[0].id;
        }
        this.cargandoBarberos = false;
      },
      error: (err) => {
        console.error('Error al obtener barberos:', err);
        this.cargandoBarberos = false;
        this.errorBarberos = 'No se pudieron cargar los barberos. Verifica que el backend esté corriendo.';
      },
    });
  }

  reservar(): void {
    this.mensajeExito = '';
    this.error = '';

    if (!this.nombreCliente || !this.celularCliente || !this.barberoId || !this.fechaHora) {
      this.error = 'Completa todos los campos obligatorios.';
      return;
    }

    const horaInicio = this.fechaHora + ':00';
    const fecha = new Date(this.fechaHora);
    const horaFin = new Date(fecha.getTime() + 60 * 60000);
    const horaFinStr = this.formatLocalDateTime(horaFin);

    this.enviando = true;
    this.citaService.reservarCita({
      barbero: { id: this.barberoId },
      nombreCliente: this.nombreCliente,
      celularCliente: this.celularCliente,
      horaInicio,
      horaFin: horaFinStr,
      montoTotal: this.montoTotal ?? 0,
    }).subscribe({
      next: (cita) => {
        this.enviando = false;
        this.mensajeExito = `¡Cita registrada con éxito! Código #${cita.id}. Te contactaremos para confirmar.`;
        this.resetForm();
      },
      error: (err) => {
        console.error('Error al reservar cita:', err);
        this.enviando = false;
        this.error = 'No se pudo registrar la cita. Verifica que el backend esté corriendo.';
      },
    });
  }

  private formatLocalDateTime(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  private resetForm(): void {
    this.nombreCliente = '';
    this.celularCliente = '';
    this.fechaHora = '';
    this.montoTotal = undefined;
  }
}