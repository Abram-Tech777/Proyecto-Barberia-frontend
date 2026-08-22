import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BarberoService } from '../../services/barbero.service';
import { CitaService } from '../../services/cita.service';
import { AuthService } from '../../services/auth.service';
import { ServicioService } from '../../services/servicio.service';
import { DescuentoService } from '../../services/descuento.service';
import { Barbero } from '../../models/barbero';
import { Servicio } from '../../models/servicio';
import { Cita } from '../../models/cita';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reservas.component.html',
  styleUrl: './reservas.component.css',
})
export class ReservasComponent implements OnInit {
  paso = 1;
  barberos: Barbero[] = [];
  servicios: Servicio[] = [];
  cargando = true;
  errorCarga = '';

  barberoId = 0;
  servicioId = 0;
  filtroBarbero = '';
  fecha = '';
  hora = '';
  horasDisponibles: string[] = [];

  nombreCliente = '';
  celularCliente = '';

  enviando = false;
  citaRegistrada: Cita | null = null;
  error = '';

  constructor(
    private barberoService: BarberoService,
    private citaService: CitaService,
    private servicioService: ServicioService,
    private authService: AuthService,
    private descuentoService: DescuentoService
  ) {}

  ngOnInit(): void {
    this.descuentoService.cargarPromociones();
    const usuario = this.authService.getSesion();
    if (usuario) {
      this.nombreCliente = usuario.nombreUsuario ?? '';
      this.celularCliente = usuario.telefono ?? '';
    }
    this.horasDisponibles = this.generarHoras();
    const hoy = new Date();
    this.fecha = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

    let pendientes = 2;
    const terminar = () => {
      pendientes--;
      if (pendientes === 0) this.cargando = false;
    };
    this.barberoService.obtenerBarberosActivos().subscribe({
      next: (data) => {
        this.barberos = data;
        if (this.barberos.length === 1) {
          this.barberoId = this.barberos[0].id;
        }
        terminar();
      },
      error: () => {
        this.errorCarga =
          'No se pudieron cargar los barberos. Verifica que el backend esté corriendo.';
        terminar();
      },
    });
    this.servicioService.obtenerServicios().subscribe({
      next: (data) => {
        this.servicios = data;
        terminar();
      },
      error: () => {
        this.errorCarga =
          'No se pudieron cargar los servicios. Verifica que el backend esté corriendo.';
        terminar();
      },
    });
  }

  get barberoSeleccionado(): Barbero | null {
    return this.barberos.find((b) => b.id === this.barberoId) ?? null;
  }

  porcentajeDescuentoServicio(s: Servicio): number {
    return this.descuentoService.porcentajeServicio(s.id);
  }

  precioFinalServicio(s: Servicio): number {
    return this.descuentoService.precioFinalServicio(s);
  }

  get barberosFiltrados(): Barbero[] {
    const texto = this.normalizar(this.filtroBarbero);
    if (!texto) return this.barberos;
    return this.barberos.filter((b) => this.normalizar(b.nombreCompleto ?? '').includes(texto));
  }

  private normalizar(valor: string): string {
    return valor.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }

  get servicioSeleccionado(): Servicio | null {
    return this.servicios.find((s) => s.id === this.servicioId) ?? null;
  }

  get minFecha(): string {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  }

  get fechaFormateada(): string {
    if (!this.fecha || !this.hora) return '';
    const [y, m, d] = this.fecha.split('-').map(Number);
    const [hh, mm] = this.hora.split(':').map(Number);
    const fecha = new Date(y, m - 1, d, hh, mm);
    return fecha.toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }

  seleccionarBarbero(id: number): void {
    this.barberoId = id;
  }

  seleccionarServicio(id: number): void {
    this.servicioId = id;
  }

  esHoraPasada(hora: string): boolean {
    if (this.fecha !== this.minFecha) return false;
    const ahora = new Date();
    const [hh, mm] = hora.split(':').map(Number);
    return hh * 60 + mm <= ahora.getHours() * 60 + ahora.getMinutes();
  }

  irAPaso(paso: number): void {
    if (paso < this.paso) {
      this.paso = paso;
      return;
    }
    if (paso === 2 && !this.barberoId) return;
    if (paso === 3 && (!this.barberoId || !this.servicioId)) return;
    this.paso = paso;
  }

  siguiente(): void {
    this.irAPaso(this.paso + 1);
  }

  reservar(): void {
    this.error = '';
    if (!this.barberoId || !this.servicioId || !this.fecha || !this.hora) {
      this.error = 'Completa todos los pasos de la reserva.';
      return;
    }
    if (!this.nombreCliente.trim() || !this.celularCliente.trim()) {
      this.error = 'Ingresa tu nombre y celular de contacto.';
      return;
    }
    if (this.esHoraPasada(this.hora)) {
      this.error = 'La hora seleccionada ya pasó. Elige otra.';
      return;
    }
    const horaInicio = `${this.fecha}T${this.hora}:00`;
    this.enviando = true;
    this.citaService
      .reservarCita({
        barbero: { id: this.barberoId },
        servicio: { id: this.servicioId },
        nombreCliente: this.nombreCliente.trim(),
        celularCliente: this.celularCliente.trim(),
        horaInicio,
        horaFin: horaInicio,
      })
      .subscribe({
        next: (cita) => {
          this.enviando = false;
          this.citaRegistrada = cita;
        },
        error: (err) => {
          console.error('Error al reservar cita:', err);
          this.enviando = false;
          const detalle = err?.error?.message ? ` ${err.error.message}` : '';
          this.error = `No se pudo registrar la reserva.${detalle}`;
        },
      });
  }

  formatearFechaHora(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  nuevaReserva(): void {
    this.paso = 1;
    this.barberoId = 0;
    this.servicioId = 0;
    this.filtroBarbero = '';
    this.hora = '';
    this.citaRegistrada = null;
    this.error = '';
  }

  private generarHoras(): string[] {
    const horas: string[] = [];
    for (let h = 9; h <= 19; h++) {
      horas.push(`${String(h).padStart(2, '0')}:00`);
      horas.push(`${String(h).padStart(2, '0')}:30`);
    }
    return horas;
  }
}
