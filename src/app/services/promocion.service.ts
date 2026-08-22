import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';
import { Promocion } from '../models/promocion';

@Injectable({
  providedIn: 'root',
})
export class PromocionService {
  private apiUrl = 'http://localhost:8080/api/promociones';

  constructor(private http: HttpClient) {}

  listarPromociones(): Observable<Promocion[]> {
    return this.http.get<Promocion[]>(this.apiUrl).pipe(timeout(10000));
  }

  listarActivas(): Observable<Promocion[]> {
    return this.http.get<Promocion[]>(`${this.apiUrl}/activos`).pipe(timeout(10000));
  }

  listarVigentesHoy(): Observable<Promocion[]> {
    return this.http.get<Promocion[]>(`${this.apiUrl}/vigentes-hoy`).pipe(timeout(10000));
  }

  crearPromocion(promocion: Promocion): Observable<Promocion> {
    return this.http.post<Promocion>(`${this.apiUrl}/crear`, promocion).pipe(timeout(10000));
  }

  notificarPorCorreo(id: number): Observable<{ enviados: number }> {
    return this.http
      .post<{ enviados: number }>(`${this.apiUrl}/${id}/notificar`, {})
      .pipe(timeout(60000));
  }

  actualizarPromocion(id: number, promocion: Promocion): Observable<Promocion> {
    return this.http.put<Promocion>(`${this.apiUrl}/${id}`, promocion).pipe(timeout(10000));
  }

  eliminarPromocion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(timeout(10000));
  }
}