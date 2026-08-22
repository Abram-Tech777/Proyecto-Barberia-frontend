import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BarberoService } from '../../services/barbero.service';
import { CartService } from '../../services/cart.service';
import { CitaService } from '../../services/cita.service';
import { Usuario } from '../../models/usuario';
import { Cita } from '../../models/cita';
import { VentaService } from '../../services/venta.service';

interface NotificacionPedido {
  ventaId: number;
  estado: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, OnDestroy {
  usuario: Usuario | null = null;
  cartCount$: Observable<number>;
  puedeVerPanelBarbero = false;

  notificaciones: Cita[] = [];
  notificacionesPedidos: NotificacionPedido[] = [];
  campanaAbierta = false;
  get contadorNotificaciones(): number {
    return this.notificaciones.length + this.notificacionesPedidos.length;
  }

  private subscription: any;
  private pollingTimer: any;

  constructor(
    private authService: AuthService,
    private barberoService: BarberoService,
    private cartService: CartService,
    private citaService: CitaService,
    private ventaService: VentaService,
    private router: Router
  ) {
    this.cartCount$ = this.cartService.getContador();
  }

  ngOnInit(): void {
    this.subscription = this.authService.getUsuario().subscribe((u) => {
      this.usuario = u;
      this.puedeVerPanelBarbero = false;
      this.campanaAbierta = false;
      if (u?.rol === 'BARBERO') {
        this.puedeVerPanelBarbero = true;
      } else if (u?.rol === 'ADMIN' && u.id) {
        this.barberoService.obtenerPerfilPorUsuario(u.id).subscribe((perfil) => {
          this.puedeVerPanelBarbero = !!perfil && this.usuario?.rol === 'ADMIN';
        });
      }
      if (this.esClienteLogeado()) {
        this.cargarNotificaciones();
        this.cargarPedidos();
        this.pollingTimer = setInterval(() => {
          this.cargarNotificaciones();
          this.cargarPedidos();
        }, 30000);
      } else {
        this.detenerPolling();
        this.notificaciones = [];
        this.notificacionesPedidos = [];
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.detenerPolling();
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  esCliente(): boolean {
    return (
      this.usuario === null ||
      this.usuario.rol === 'CLIENTE_TIENDA' ||
      this.usuario.rol === 'CLIENTE_BOT'
    );
  }

  esClienteLogeado(): boolean {
    return this.usuario !== null && this.usuario.rol === 'CLIENTE_TIENDA';
  }

  toggleCampana(): void {
    this.campanaAbierta = !this.campanaAbierta;
    if (this.campanaAbierta) {
      this.cargarNotificaciones();
      this.cargarPedidos();
    }
  }

  cerrarCampana(): void {
    this.campanaAbierta = false;
  }

  irAMisReservas(): void {
    this.campanaAbierta = false;
    this.router.navigate(['/mis-reservas']);
  }

  irAMisCompras(): void {
    this.campanaAbierta = false;
    this.router.navigate(['/mis-compras']);
  }

  private claveVistos(): string {
    return `barberia_ventas_vistas_u${this.usuario?.id ?? 0}`;
  }

  private cargarPedidos(): void {
    if (!this.usuario?.id) return;
    this.ventaService.listarPorComprador(this.usuario.id).subscribe({
      next: (ventas) => {
        let vistos: string[] = [];
        try {
          vistos = JSON.parse(localStorage.getItem(this.claveVistos()) ?? '[]');
        } catch {
          vistos = [];
        }
        const nuevas: NotificacionPedido[] = [];
        for (const v of ventas ?? []) {
          if ((v.estadoPedido === 'EN_CAMINO' || v.estadoPedido === 'ENTREGADO') && v.id) {
            const clave = `${v.id}:${v.estadoPedido}`;
            if (!vistos.includes(clave)) {
              nuevas.push({ ventaId: v.id, estado: v.estadoPedido });
            }
          }
        }
        this.notificacionesPedidos = nuevas;
      },
      error: () => {},
    });
  }

  marcarPedidosVistos(): void {
    const claves = this.notificacionesPedidos.map((n) => `${n.ventaId}:${n.estado}`);
    let vistos: string[] = [];
    try {
      vistos = JSON.parse(localStorage.getItem(this.claveVistos()) ?? '[]');
    } catch {
      vistos = [];
    }
    const combinado = Array.from(new Set([...vistos, ...claves]));
    localStorage.setItem(this.claveVistos(), JSON.stringify(combinado));
    this.notificacionesPedidos = [];
  }

  formatearFechaCorta(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString('es-PE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private cargarNotificaciones(): void {
    this.citaService.listarMias().subscribe({
      next: (citas) => {
        const ahora = Date.now();
        this.notificaciones = citas
          .filter(
            (c) =>
              c.estado === 'CONFIRMADA' &&
              c.horaInicio &&
              new Date(c.horaInicio).getTime() >= ahora
          )
          .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
      },
      error: () => {},
    });
  }

  private detenerPolling(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }
}
