import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';
import { Resenia } from '../models/resenia';

@Injectable({
  providedIn: 'root',
})
export class ReseniaService {
  private apiUrl = 'http://localhost:8080/api/resenias';

  constructor(private http: HttpClient) {}

  listarResenias(): Observable<Resenia[]> {
    return this.http.get<Resenia[]>(this.apiUrl).pipe(timeout(10000));
  }

  listarPorProducto(productoId: number): Observable<Resenia[]> {
    return this.http.get<Resenia[]>(`${this.apiUrl}/producto/${productoId}`).pipe(timeout(10000));
  }

  eliminarResenia(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(timeout(10000));
  }
}