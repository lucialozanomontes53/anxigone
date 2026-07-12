import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-crisis-fab',
  imports: [RouterLink],
  templateUrl: './crisis-fab.component.html',
  styleUrl: './crisis-fab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrisisFabComponent {}
