import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, CarritoItem } from '../../services/cart.service';
import { VentaService } from '../../services/venta.service';
import { AuthService } from '../../services/auth.service';
import { DescuentoService } from '../../services/descuento.service';
import { DireccionEnvioService } from '../../services/direccion-envio.service';
import { Venta } from '../../models/venta';
import { DetalleVenta } from '../../models/detalle-venta';
import { Usuario } from '../../models/usuario';
import { DireccionEnvio } from '../../models/direccion-envio';

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
  ultimoEstado = '';

  tipoDespacho: 'RECOJO_TIENDA' | 'ENVIO_DOMICILIO' = 'RECOJO_TIENDA';
  costoEnvioDomicilio = 10;
  direcciones: DireccionEnvio[] = [];
  direccionId = 0;
  mostrarFormDireccion = false;
  guardandoDireccion = false;

  nuevaDir: DireccionEnvio = this.direccionVacia();

  yapeQr = 'yape-qr.png';
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
    private descuentoService: DescuentoService,
    private direccionService: DireccionEnvioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.descuentoService.cargarPromociones();
    this.items = this.cartService.getItemsActuales();
    this.usuario = this.authService.getSesion();
    if (this.usuario?.id) {
      this.cargarDirecciones();
    }
  }

  cargarDirecciones(): void {
    if (!this.usuario?.id) return;
    this.direccionService.listarPorUsuario(this.usuario.id).subscribe({
      next: (data) => {
        this.direcciones = data ?? [];
        if (this.direcciones.length > 0 && !this.direccionId) {
          this.direccionId = this.direcciones[0].id!;
        }
      },
      error: () => (this.direcciones = []),
    });
  }

  cambiarDespacho(tipo: 'RECOJO_TIENDA' | 'ENVIO_DOMICILIO'): void {
    this.tipoDespacho = tipo;
    if (tipo === 'ENVIO_DOMICILIO') this.cargarDirecciones();
  }

  get direccionSeleccionada(): DireccionEnvio | null {
    return this.direcciones.find((d) => d.id === this.direccionId) ?? null;
  }

  abrirFormDireccion(): void {
    this.nuevaDir = this.direccionVacia();
    this.mostrarFormDireccion = true;
  }

  cerrarFormDireccion(): void {
    this.mostrarFormDireccion = false;
  }

  guardarDireccion(): void {
    if (!this.usuario?.id) return;
    const d = this.nuevaDir;
    if (!d.nombreDireccion.trim() || !d.direccion.trim() || !d.distrito.trim()
        || !d.provincia.trim() || !d.departamento.trim() || !d.telefonoContacto.trim()) {
      this.error = 'Completa todos los campos obligatorios de la dirección.';
      return;
    }
    this.guardandoDireccion = true;
    const payload: DireccionEnvio = { ...d, usuario: { id: this.usuario.id } };
    this.direccionService.registrar(payload).subscribe({
      next: (creada) => {
        this.guardandoDireccion = false;
        this.mostrarFormDireccion = false;
        this.error = '';
        this.cargarDirecciones();
        setTimeout(() => {
          this.direccionId = creada.id ?? 0;
        });
      },
      error: () => {
        this.guardandoDireccion = false;
        this.error = 'No se pudo guardar la dirección. Intenta de nuevo.';
      },
    });
  }

  private direccionVacia(): DireccionEnvio {
    return {
      nombreDireccion: '',
      direccion: '',
      distrito: '',
      provincia: 'Lima',
      departamento: 'Lima',
      telefonoContacto: '',
    };
  }

  get subtotal(): number {
    return Math.round(
      this.items.reduce((a, i) => a + this.precioUnitarioItem(i) * i.cantidad, 0) * 100
    ) / 100;
  }

  get igv(): number {
    return Math.round(this.subtotal * 0.18 * 100) / 100;
  }

  get costoEnvio(): number {
    return this.tipoDespacho === 'ENVIO_DOMICILIO' ? this.costoEnvioDomicilio : 0;
  }

  get total(): number {
    return Math.round((this.subtotal + this.igv + this.costoEnvio) * 100) / 100;
  }

  porcentajeItem(item: CarritoItem): number {
    return this.descuentoService.porcentajeProducto(item.producto.id);
  }

  precioUnitarioItem(item: CarritoItem): number {
    return this.descuentoService.precioFinalProducto(item.producto);
  }

  subtotalLinea(item: CarritoItem): number {
    return Math.round(this.precioUnitarioItem(item) * item.cantidad * 100) / 100;
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

  sinImagenLocal: { [id: number]: boolean } = {};

  imagenItem(item: CarritoItem): string {
    const p = item.producto;
    if (p.imagenUrl) return this.urlImagen(p.imagenUrl);
    if (!this.sinImagenLocal[p.id]) return `img/productos/${p.id}.jpg`;
    return '';
  }

  marcarSinImagen(item: CarritoItem): void {
    this.sinImagenLocal[item.producto.id] = true;
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
    if (this.tipoDespacho === 'ENVIO_DOMICILIO' && !this.direccionId) {
      this.error = 'Selecciona o agrega una dirección para el despacho por motorizado.';
      return;
    }
    this.enviando = true;

    const detalles: DetalleVenta[] = this.items.map((i) => ({
      producto: { id: i.producto.id },
      cantidad: i.cantidad,
      precioUnitario: this.precioUnitarioItem(i),
    }));

    const venta: Venta = {
      comprador: { id: this.usuario.id! },
      montoTotal: this.total,
      igv: this.igv,
      costoEnvio: this.costoEnvio,
      medioPago: this.medioPago,
      tipoDespacho: this.tipoDespacho,
      origenOrden: 'WEB',
      estadoPedido: this.medioPago === 'EFECTIVO' ? 'PENDIENTE_PAGO' : 'PAGADO',
      detalles,
    };
    if (this.tipoDespacho === 'ENVIO_DOMICILIO') {
      venta.direccionEnvio = { id: this.direccionId };
    }

    this.ventaService.registrarVenta(venta).subscribe({
      next: (v) => {
        this.enviando = false;
        this.ultimoTotal = v.montoTotal;
        this.ultimoEstado = v.estadoPedido ?? 'PENDIENTE_PAGO';
        this.compraExitosa = true;
        this.cartService.vaciar();
        this.items = [];
      },
      error: (err) => {
        console.error('Error al registrar venta:', err);
        this.enviando = false;
        this.error = err?.error?.message
          ? err.error.message
          : 'No se pudo procesar la compra. Verifica que el backend esté corriendo.';
      },
    });
  }

  seguirComprando(): void {
    this.router.navigate(['/tienda']);
  }
}
