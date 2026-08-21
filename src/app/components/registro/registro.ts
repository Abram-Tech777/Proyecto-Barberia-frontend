import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuario';

@Component({
  standalone: true,
  selector: 'app-registro',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  nombreUsuario = '';
  email = '';
  clave = '';
  telefono = '';
  recibirPromociones = false;

  cargando = false;
  error = '';
  exito = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  registrar(): void {
    this.error = '';
    this.exito = '';

    if (!this.nombreUsuario || !this.email || !this.clave || !this.telefono) {
      this.error = 'Completa todos los campos.';
      return;
    }

    const usuario: Usuario = {
      nombreUsuario: this.nombreUsuario,
      contrasenia: this.clave,
      email: this.email,
      telefono: this.telefono,
      rol: 'CLIENTE_TIENDA',
      tipoRegistro: 'LOCAL',
      recibirPromociones: this.recibirPromociones,
      activo: true,
    };

    this.cargando = true;
    this.authService.registrar(usuario).subscribe({
      next: (creado) => {
        this.cargando = false;
        this.exito = '¡Cuenta creada con éxito! Inicia sesión para continuar.';
        setTimeout(() => this.router.navigate(['/login']), 1200);
      },
      error: (err) => {
        console.error('Error al registrar:', err);
        this.cargando = false;
        this.error = 'No se pudo crear la cuenta. Verifica que el correo o teléfono no estén en uso.';
      },
    });
  }
}