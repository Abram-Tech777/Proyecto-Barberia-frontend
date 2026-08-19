import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { ServiciosComponent } from './components/servicios/servicios.component';
import { ReservasComponent } from './components/reservas/reservas.component';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'servicios', component: ServiciosComponent },
  { path: 'reservas', component: ReservasComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];