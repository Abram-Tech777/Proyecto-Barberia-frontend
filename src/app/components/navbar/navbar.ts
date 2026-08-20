import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Usuario } from '../../models/usuario';

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
  private subscription: any;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {
    this.cartCount$ = this.cartService.getContador();
  }

  ngOnInit(): void {
    this.subscription = this.authService.getUsuario().subscribe((u) => {
      this.usuario = u;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
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
}