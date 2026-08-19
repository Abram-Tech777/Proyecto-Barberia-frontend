import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Barbero } from '../models/barbero';

@Injectable({
  providedIn: 'root',
})
export class BarberoService {
  private apiUrl = 'http://localhost:8080/api/barberos';

  constructor(private http: HttpClient) {}

  obtenerBarberosActivos(): Observable<Barbero[]> {
    return this.http.get<Barbero[]>(`${this.apiUrl}/activos`);
  }
}