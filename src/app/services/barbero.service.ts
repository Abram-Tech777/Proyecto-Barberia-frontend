import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, timeout } from 'rxjs';
import { Barbero } from '../models/barbero';
import { EstadisticasBarbero } from '../models/estadisticas-barbero';

@Injectable({
  providedIn: 'root',
})
export class BarberoService {
  private apiUrl = 'http://localhost:8080/api/barberos';

  constructor(private http: HttpClient) {}

  obtenerBarberosActivos(): Observable<Barbero[]> {
    return this.http.get<Barbero[]>(`${this.apiUrl}/activos`).pipe(timeout(10000));
  }

  listarBarberos(): Observable<Barbero[]> {
    return this.http.get<Barbero[]>(this.apiUrl).pipe(timeout(10000));
  }

  obtenerPerfilPorUsuario(usuarioId: number): Observable<Barbero | null> {
    return this.http
      .get<Barbero>(`${this.apiUrl}/por-usuario/${usuarioId}`)
      .pipe(timeout(10000), catchError(() => of(null)));
  }

  obtenerEstadisticas(barberoId: number): Observable<EstadisticasBarbero> {
    return this.http.get<EstadisticasBarbero>(`${this.apiUrl}/${barberoId}/estadisticas`).pipe(timeout(10000));
  }

  crearBarbero(barbero: Barbero): Observable<Barbero> {
    return this.http.post<Barbero>(`${this.apiUrl}/registrar`, barbero).pipe(timeout(10000));
  }

  actualizarBarbero(id: number, barbero: Barbero): Observable<Barbero> {
    return this.http.put<Barbero>(`${this.apiUrl}/${id}`, barbero).pipe(timeout(10000));
  }

  eliminarBarbero(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(timeout(10000));
  }
}
