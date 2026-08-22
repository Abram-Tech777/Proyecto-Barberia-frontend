import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Producto } from '../models/producto';
import { Usuario } from '../models/usuario';
import { AuthService } from './auth.service';

export interface CarritoItem {
  producto: Producto;
  cantidad: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private items: CarritoItem[] = [];
  private itemsSubject = new BehaviorSubject<CarritoItem[]>([]);
  private contadorSubject = new BehaviorSubject<number>(0);
  private claveActual: string | null = null;

  constructor(private authService: AuthService) {
    const legado = localStorage.getItem('barberia_carrito');
    if (legado) {
      localStorage.removeItem('barberia_carrito');
    }
    this.authService.getUsuario().subscribe((usuario) => this.cambiarUsuario(usuario));
  }

  getItems(): Observable<CarritoItem[]> {
    return this.itemsSubject.asObservable();
  }

  getContador(): Observable<number> {
    return this.contadorSubject.asObservable();
  }

  getItemsActuales(): CarritoItem[] {
    return [...this.items];
  }

  agregar(producto: Producto, cantidad = 1): void {
    const existente = this.items.find((i) => i.producto.id === producto.id);
    if (existente) {
      existente.cantidad += cantidad;
    } else {
      this.items.push({ producto, cantidad });
    }
    this._guardar();
  }

  quitar(id: number): void {
    this.items = this.items.filter((i) => i.producto.id !== id);
    this._guardar();
  }

  cambiarCantidad(id: number, cantidad: number): void {
    const item = this.items.find((i) => i.producto.id === id);
    if (item) {
      item.cantidad = cantidad;
      if (item.cantidad <= 0) {
        this.quitar(id);
        return;
      }
      this._guardar();
    }
  }

  vaciar(): void {
    this.items = [];
    this._guardar();
  }

  getTotal(): number {
    return this.items.reduce((a, b) => a + b.producto.precio * b.cantidad, 0);
  }

  private cambiarUsuario(usuario: Usuario | null): void {
    if (!usuario?.id) {
      this.claveActual = null;
      this.items = [];
      this._notificar();
      return;
    }
    this.claveActual = `barberia_carrito_u${usuario.id}`;
    this.items = [];
    const raw = localStorage.getItem(this.claveActual);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
          this.items = data.filter(
            (i) => i && i.producto && typeof i.producto.id === 'number' && i.cantidad > 0
          );
        }
      } catch {
        localStorage.removeItem(this.claveActual);
      }
    }
    this._notificar();
  }

  private _guardar(): void {
    this._notificar();
    if (this.claveActual) {
      localStorage.setItem(this.claveActual, JSON.stringify(this.items));
    }
  }

  private _notificar(): void {
    this.itemsSubject.next([...this.items]);
    this.contadorSubject.next(this.items.reduce((a, b) => a + b.cantidad, 0));
  }
}
