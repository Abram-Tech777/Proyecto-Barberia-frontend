import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';
import { Devolucion } from '../models/devolucion';

@Injectable({
  providedIn: 'root',
})
export class DevolucionService {
  private apiUrl = 'http://localhost:8080/api/devoluciones';

  constructor(private http: HttpClient) {}

  listarDevoluciones(): Observable<Devolucion[]> {
    return this.http.get<Devolucion[]>(this.apiUrl).pipe(timeout(10000));
  }

  actualizarDevolucion(id: number, devolucion: Devolucion): Observable<Devolucion> {
    return this.http.put<Devolucion>(`${this.apiUrl}/${id}`, devolucion).pipe(timeout(10000));
  }
}