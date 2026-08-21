import { Component } from '@angular/core';

@Component({
  selector: 'app-whatsapp-button',
  standalone: true,
  imports: [],
  templateUrl: './whatsapp-button.html',
  styleUrl: './whatsapp-button.css',
})
export class WhatsappButton {
  numeroBot = '14155238886';
  mensajeInicial = '¡Hola Iron & Oak! Quiero ver las opciones.';
  enlace = `https://wa.me/${this.numeroBot}?text=` + encodeURIComponent(this.mensajeInicial);
}