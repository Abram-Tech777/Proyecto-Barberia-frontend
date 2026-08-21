import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';
import { DetalleVenta } from '../models/detalle-venta';

@Injectable({
  providedIn: 'root',
})
export class DetalleVentaService {
  private apiUrl = 'http://localhost:8080/api/detalle-ventas';

  constructor(private http: HttpClient) {}

  listarPorVenta(ventaId: number): Observable<DetalleVenta[]> {
    return this.http.get<DetalleVenta[]>(`${this.apiUrl}/venta/${ventaId}`).pipe(timeout(10000));
  }
}