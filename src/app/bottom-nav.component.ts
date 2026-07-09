import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

type NavItemId = 'emergency' | 'tools' | 'journal' | 'organizer';

interface NavItem {
  readonly id: NavItemId;
  readonly path: string;
  readonly label: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { id: 'emergency', path: '/emergencia', label: 'Emergencia' },
  { id: 'tools', path: '/herramientas', label: 'Herramientas' },
  { id: 'journal', path: '/diario', label: 'Diario' },
  { id: 'organizer', path: '/organizador', label: 'Organizador' },
];

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomNavComponent {
  protected readonly items = NAV_ITEMS;
}
