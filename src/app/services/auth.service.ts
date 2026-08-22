import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, timeout } from 'rxjs';
import { Usuario } from '../models/usuario';
import { LoginRequest } from '../models/login-request';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private usuarioUrl = 'http://localhost:8080/api/usuarios';
  private readonly SESSION_KEY = 'barberia_usuario';
  private readonly CREDS_KEY = 'barberia_creds';
  private usuarioSubject = new BehaviorSubject<Usuario | null>(this.getSesion());

  constructor(private http: HttpClient) {}

  login(correo: string, clave: string): Observable<Usuario> {
    const body: LoginRequest = { correo, clave };
    return this.http.post<Usuario>(`${this.apiUrl}/login`, body).pipe(
      timeout(10000),
      tap(() => this.guardarCredenciales(correo, clave))
    );
  }

  loginConGoogle(idToken: string): Observable<{ usuario: Usuario; clave: string }> {
    return this.http
      .post<{ usuario: Usuario; clave: string }>(`${this.apiUrl}/google`, { idToken })
      .pipe(timeout(15000));
  }

  registrar(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.usuarioUrl}/registro`, usuario).pipe(timeout(10000));
  }

  guardarSesion(usuario: Usuario): void {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(usuario));
    this.usuarioSubject.next(usuario);
  }

  guardarCredenciales(correo: string, clave: string): void {
    localStorage.setItem(this.CREDS_KEY, JSON.stringify({ correo, clave }));
  }

  logout(): void {
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.CREDS_KEY);
    this.usuarioSubject.next(null);
  }

  getSesion(): Usuario | null {
    const raw = localStorage.getItem(this.SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  getUsuario(): Observable<Usuario | null> {
    return this.usuarioSubject.asObservable();
  }

  isAuthenticated(): boolean {
    return this.getSesion() !== null;
  }

  esAdmin(): boolean {
    const usuario = this.getSesion();
    return usuario !== null && usuario.rol === 'ADMIN';
  }

  esBarbero(): boolean {
    const usuario = this.getSesion();
    return usuario !== null && usuario.rol === 'BARBERO';
  }
}