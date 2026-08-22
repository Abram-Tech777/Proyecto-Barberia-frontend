import { AfterViewInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID = '609478426254-6918e91rtn564urm7pck33clplr8dbon.apps.googleusercontent.com';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements AfterViewInit {
  correo = '';
  clave = '';
  cargando = false;
  error = '';
  googleError = '';

  private intentosGoogle = 0;

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

  ngAfterViewInit(): void {
    this.inicializarGoogle();
  }

  private inicializarGoogle(): void {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (resp: any) => this.loginConGoogle(resp?.credential),
      });
      const contenedor = document.getElementById('googleBtn');
      if (contenedor) {
        window.google.accounts.id.renderButton(contenedor, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: 320,
          locale: 'es-419',
        });
      }
      return;
    }
    if (this.intentosGoogle++ < 20) {
      setTimeout(() => this.inicializarGoogle(), 300);
    } else {
      this.googleError = 'No se pudo cargar Google. Revisa tu conexión e intenta de nuevo.';
    }
  }

  loginConGoogle(idToken: string): void {
    if (!idToken) return;
    this.error = '';
    this.googleError = '';
    this.cargando = true;
    this.authService.loginConGoogle(idToken).subscribe({
      next: ({ usuario, clave }) => {
        this.cargando = false;
        this.authService.guardarSesion(usuario);
        this.authService.guardarCredenciales(usuario.email ?? '', clave);
        this.router.navigate(['/']);
      },
      error: () => {
        this.cargando = false;
        this.error = 'No se pudo iniciar sesión con Google. Intenta otra vez.';
      },
    });
  }
}
