import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cita } from '../models/cita';

@Injectable({
  providedIn: 'root',
})
export class CitaService {
  private apiUrl = 'http://localhost:8080/api/citas';

  constructor(private http: HttpClient) {}

  reservarCita(cita: Cita): Observable<Cita> {
    return this.http.post<Cita>(`${this.apiUrl}/reservar`, cita);
  }
}