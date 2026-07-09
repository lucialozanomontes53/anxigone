import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { BottomNavComponent } from './bottom-nav.component';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet, BottomNavComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly appName = 'Espacio Seguro';
}
