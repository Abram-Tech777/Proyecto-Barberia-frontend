import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { BotFlotante } from './components/bot-flotante/bot-flotante';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, BotFlotante],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}