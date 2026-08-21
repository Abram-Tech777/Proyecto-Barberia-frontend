import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, CarritoItem } from '../../services/cart.service';
import { VentaService } from '../../services/venta.service';
import { AuthService } from '../../services/auth.service';
import { Venta } from '../../models/venta';
import { DetalleVenta } from '../../models/detalle-venta';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
})
export class Carrito implements OnInit {
  items: CarritoItem[] = [];
  usuario: Usuario | null = null;
  medioPago = 'EFECTIVO';
  mediosPago = ['EFECTIVO', 'YAPE', 'PLIN', 'TARJETA'];
  enviando = false;
  error = '';
  mensaje = '';
  compraExitosa = false;
  ultimoTotal = 0;

  yapeQr = 'assets/yape-qr.png';
  numeroYape = '924 121 667';
  numeroPlin = '924 121 667';

  cardNumber = '';
  cardNombre = '';
  cardExpiry = '';
  cardCvv = '';

  constructor(
    private cartService: CartService,
    private ventaService: VentaService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.items = this.cartService.getItemsActuales();
    this.usuario = this.authService.getSesion();
  }

  get total(): number {
    return this.items.reduce((a, b) => a + b.producto.precio * b.cantidad, 0);
  }

  cambiarCantidad(id: number, cantidad: number): void {
    this.cartService.cambiarCantidad(id, cantidad);
    this.items = this.cartService.getItemsActuales();
  }

  quitar(id: number): void {
    this.cartService.quitar(id);
    this.items = this.cartService.getItemsActuales();
  }

  urlImagen(ruta?: string): string {
    if (!ruta) return '';
    if (ruta.startsWith('http://') || ruta.startsWith('https://')) return ruta;
    return `http://localhost:8080${ruta.startsWith('/') ? ruta : '/' + ruta}`;
  }

  formatearNumeroTarjeta(): void {
    const digitos = this.cardNumber.replace(/\D/g, '').slice(0, 16);
    this.cardNumber = digitos.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  formatearVencimiento(): void {
    const v = this.cardExpiry.replace(/\D/g, '').slice(0, 4);
    this.cardExpiry = v.length > 2 ? v.slice(0, 2) + '/' + v.slice(2) : v;
  }

  confirmarCompra(): void {
    if (!this.usuario || this.items.length === 0) return;
    this.error = '';
    this.enviando = true;

    const detalles: DetalleVenta[] = this.items.map((i) => ({
      producto: { id: i.producto.id },
      cantidad: i.cantidad,
      precioUnitario: i.producto.precio,
    }));

    const venta: Venta = {
      comprador: { id: this.usuario.id! },
      montoTotal: this.total,
      medioPago: this.medioPago,
      tipoDespacho: 'RECOJO_TIENDA',
      origenOrden: 'WEB',
      estadoPedido: 'PENDIENTE_PAGO',
      detalles,
    };

    this.ventaService.registrarVenta(venta).subscribe({
      next: (v) => {
        this.enviando = false;
        this.ultimoTotal = v.montoTotal;
        this.compraExitosa = true;
        this.cartService.vaciar();
        this.items = [];
      },
      error: (err) => {
        console.error('Error al registrar venta:', err);
        this.enviando = false;
        this.error = 'No se pudo procesar la compra. Verifica que el backend esté corriendo.';
      },
    });
  }

  seguirComprando(): void {
    this.router.navigate(['/tienda']);
  }
}