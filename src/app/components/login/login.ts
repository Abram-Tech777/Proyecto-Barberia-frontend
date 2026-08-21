import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  correo = '';
  clave = '';
  cargando = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ingresar(): void {
    this.error = '';
    if (!this.correo || !this.clave) {
      this.error = 'Ingresa tu correo y tu clave.';
      return;
    }

    this.cargando = true;
    this.authService.login(this.correo, this.clave).subscribe({
      next: (usuario) => {
        this.cargando = false;
        this.authService.guardarSesion(usuario);
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Error al iniciar sesión:', err);
        this.cargando = false;
        this.error = 'Credenciales incorrectas. Verifica tu correo y clave.';
      },
    });
  }
}