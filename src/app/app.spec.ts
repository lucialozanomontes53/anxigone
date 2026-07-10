import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';

import { DbConfig } from './core/persistence/db-schema';
import { APP_DB_CONFIG } from './core/persistence/indexed-db.adapter';
import { BlockingSessionIndexedDbRepository } from './features/emergency/repositories/blocking-session-indexeddb.repository';
import { BlockingSessionRepository } from './features/emergency/repositories/blocking-session.repository';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    const config: DbConfig = {
      name: `test-db-${crypto.randomUUID()}`,
      version: 1,
      stores: [{ name: 'blockingSessions', keyPath: 'id' }],
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: APP_DB_CONFIG, useValue: config },
        { provide: BlockingSessionRepository, useClass: BlockingSessionIndexedDbRepository },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('renders the app name in the header as a link to home', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector<HTMLAnchorElement>('.app-header__title');
    expect(title?.textContent).toContain('Espacio Seguro');
    expect(title?.getAttribute('href')).toBe('/');
  });

  it('renders a skip link targeting the main content', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const skipLink = compiled.querySelector<HTMLAnchorElement>('.skip-link');
    expect(skipLink?.getAttribute('href')).toBe('#main-content');
  });
});
