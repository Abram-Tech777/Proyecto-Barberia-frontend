import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario';

@Component({
  standalone: true,
  selector: 'app-admin-usuarios',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-usuarios.html',
  styleUrl: './admin-usuarios.css',
})
export class AdminUsuarios implements OnInit {
  usuarios: Usuario[] = [];
  cargando = true;
  error = '';
  mensaje = '';

  roles = ['CLIENTE_TIENDA', 'BARBERO', 'ADMIN'];

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.error = '';
    this.usuarioService.listarUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al listar usuarios:', err);
        this.cargando = false;
        this.error = 'No se pudieron cargar los usuarios. Verifica que el backend esté corriendo.';
      },
    });
  }

  cambiarRol(usuario: Usuario, nuevoRol: string): void {
    this.mensaje = '';
    const copia: Usuario = { ...usuario, rol: nuevoRol };
    this.usuarioService.actualizarUsuario(usuario.id!, copia).subscribe({
      next: (actualizado) => {
        Object.assign(usuario, actualizado);
        this.mensaje = `Rol de ${usuario.nombreUsuario ?? usuario.email} actualizado a ${nuevoRol}.`;
      },
      error: (err) => {
        console.error('Error al cambiar rol:', err);
        this.error = 'No se pudo actualizar el rol.';
      },
    });
  }
}