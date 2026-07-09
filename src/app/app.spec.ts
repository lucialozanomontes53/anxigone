import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
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
