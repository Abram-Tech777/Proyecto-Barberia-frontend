import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { ServiciosComponent } from './components/servicios/servicios.component';
import { ReservasComponent } from './components/reservas/reservas.component';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { AdminUsuarios } from './components/admin-usuarios/admin-usuarios';
import { AdminHub } from './components/admin-hub/admin-hub';
import { AdminBarberos } from './components/admin-barberos/admin-barberos';
import { AdminServicios } from './components/admin-servicios/admin-servicios';
import { AdminCitas } from './components/admin-citas/admin-citas';
import { AdminProductos } from './components/admin-productos/admin-productos';
import { AdminVentas } from './components/admin-ventas/admin-ventas';
import { AdminDevoluciones } from './components/admin-devoluciones/admin-devoluciones';
import { AdminPromociones } from './components/admin-promociones/admin-promociones';
import { AdminResenias } from './components/admin-resenias/admin-resenias';
import { Tienda } from './components/tienda/tienda';
import { Carrito } from './components/carrito/carrito';
import { adminGuard } from './guards/admin-guard';
import { panelGuard } from './guards/panel-guard';
import { clienteGuard } from './guards/cliente-guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'servicios', component: ServiciosComponent },
  { path: 'tienda', component: Tienda },
  { path: 'carrito', component: Carrito, canActivate: [clienteGuard] },
  { path: 'reservas', component: ReservasComponent, canActivate: [clienteGuard] },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'admin', component: AdminHub, canActivate: [panelGuard] },
  { path: 'admin/usuarios', component: AdminUsuarios, canActivate: [adminGuard] },
  { path: 'admin/barberos', component: AdminBarberos, canActivate: [adminGuard] },
  { path: 'admin/servicios', component: AdminServicios, canActivate: [panelGuard] },
  { path: 'admin/citas', component: AdminCitas, canActivate: [panelGuard] },
  { path: 'admin/productos', component: AdminProductos, canActivate: [panelGuard] },
  { path: 'admin/ventas', component: AdminVentas, canActivate: [adminGuard] },
  { path: 'admin/devoluciones', component: AdminDevoluciones, canActivate: [adminGuard] },
  { path: 'admin/promociones', component: AdminPromociones, canActivate: [panelGuard] },
  { path: 'admin/resenias', component: AdminResenias, canActivate: [adminGuard] },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];