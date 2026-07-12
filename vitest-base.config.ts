import { defineConfig } from 'vitest/config';

/**
 * Cargado automáticamente por el builder `@angular/build:unit-test` (ver `runnerConfig`
 * en angular.json). Sube el timeout por test por defecto: bajo la carga de la suite
 * completa (muchos archivos de test en paralelo), tests que hacen varias interacciones
 * de usuario seguidas pueden superar los 5000ms por defecto sin que haya ningún bug real.
 */
export default defineConfig({
  test: {
    testTimeout: 15000,
  },
});
