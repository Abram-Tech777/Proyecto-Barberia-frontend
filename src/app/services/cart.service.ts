import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Producto } from '../models/producto';

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

  constructor() {
    const raw = localStorage.getItem('barberia_carrito');
    if (raw) {
      try {
        this.items = JSON.parse(raw);
        this.itemsSubject.next(this.items);
        this.contadorSubject.next(this.items.reduce((a, b) => a + b.cantidad, 0));
      } catch {
        localStorage.removeItem('barberia_carrito');
      }
    }
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

  private _guardar(): void {
    this.itemsSubject.next([...this.items]);
    this.contadorSubject.next(this.items.reduce((a, b) => a + b.cantidad, 0));
    localStorage.setItem('barberia_carrito', JSON.stringify(this.items));
  }
}