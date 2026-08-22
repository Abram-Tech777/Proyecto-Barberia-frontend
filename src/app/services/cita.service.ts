import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';
import { Cita } from '../models/cita';

@Injectable({
  providedIn: 'root',
})
export class CitaService {
  private apiUrl = 'http://localhost:8080/api/citas';

  constructor(private http: HttpClient) {}

  reservarCita(cita: Cita): Observable<Cita> {
    return this.http.post<Cita>(`${this.apiUrl}/reservar`, cita).pipe(timeout(10000));
  }

  listarCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(this.apiUrl).pipe(timeout(10000));
  }

  listarPorBarbero(barberoId: number): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/barbero/${barberoId}`).pipe(timeout(10000));
  }

  listarPendientes(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/pendientes`).pipe(timeout(10000));
  }

  actualizarCita(id: number, cita: Cita): Observable<Cita> {
    return this.http.put<Cita>(`${this.apiUrl}/${id}`, cita).pipe(timeout(10000));
  }

  cambiarEstado(id: number, estado: string, barberoId?: number): Observable<Cita> {
    let params = new HttpParams();
    if (barberoId != null) {
      params = params.set('barberoId', String(barberoId));
    }
    return this.http
      .put<Cita>(`${this.apiUrl}/${id}/estado`, { estado }, { params })
      .pipe(timeout(10000));
  }

  eliminarCita(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(timeout(10000));
  }

  listarMias(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/mias`).pipe(timeout(10000));
  }

  pagarCita(id: number, monto: number, metodoPago: string): Observable<Cita> {
    return this.http
      .post<Cita>(`${this.apiUrl}/${id}/pagar`, { monto, metodoPago })
      .pipe(timeout(10000));
  }
}