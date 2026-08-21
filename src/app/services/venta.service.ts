import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';
import { Venta } from '../models/venta';

@Injectable({
  providedIn: 'root',
})
export class VentaService {
  private apiUrl = 'http://localhost:8080/api/ventas';

  constructor(private http: HttpClient) {}

  listarVentas(): Observable<Venta[]> {
    return this.http.get<Venta[]>(this.apiUrl).pipe(timeout(10000));
  }

  registrarVenta(venta: Venta): Observable<Venta> {
    return this.http.post<Venta>(`${this.apiUrl}/registrar`, venta).pipe(timeout(10000));
  }

  actualizarVenta(id: number, venta: Venta): Observable<Venta> {
    return this.http.put<Venta>(`${this.apiUrl}/${id}`, venta).pipe(timeout(10000));
  }
}