import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-hub',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-hub.html',
  styleUrl: './admin-hub.css',
})
export class AdminHub {
  modulos = [
    { ruta: '/admin/usuarios', titulo: 'Usuarios', desc: 'Asigna roles y gestiona cuentas', icono: 'users' },
    { ruta: '/admin/barberos', titulo: 'Barberos', desc: 'Equipo, comisiones y estado', icono: 'barbero' },
    { ruta: '/admin/servicios', titulo: 'Servicios', desc: 'Catálogo de cortes y precios', icono: 'servicio' },
    { ruta: '/admin/citas', titulo: 'Citas', desc: 'Valida y gestiona reservas', icono: 'cita' },
    { ruta: '/admin/productos', titulo: 'Productos', desc: 'Tienda, stock y categorías', icono: 'producto' },
    { ruta: '/admin/ventas', titulo: 'Ventas', desc: 'Pedidos y estado de entrega', icono: 'venta' },
    { ruta: '/admin/devoluciones', titulo: 'Devoluciones', desc: 'Reembolsos por celular', icono: 'devolucion' },
    { ruta: '/admin/promociones', titulo: 'Promociones', desc: 'Descuentos y fechas vigentes', icono: 'promocion' },
    { ruta: '/admin/resenias', titulo: 'Reseñas', desc: 'Valoraciones de productos', icono: 'resenia' },
  ];

  modulosVisibles = this.modulos;

  constructor(private authService: AuthService) {
    if (this.authService.esBarbero()) {
      const permitidos = ['Servicios', 'Citas', 'Productos', 'Promociones'];
      this.modulosVisibles = this.modulos.filter((m) => permitidos.includes(m.titulo));
    }
  }
}