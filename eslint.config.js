// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const boundaries = require('eslint-plugin-boundaries');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    plugins: { boundaries },
    settings: {
      'boundaries/include': ['src/app/**/*.ts'],
      'boundaries/elements': [
        { type: 'app-root', partialMatch: false, pattern: 'src/app/*.ts' },
        { type: 'core', pattern: 'src/app/core/*' },
        { type: 'shared', pattern: 'src/app/shared/*' },
        { type: 'feature', pattern: 'src/app/features/*', capture: ['feature'] },
      ],
    },
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            {
              from: { element: { types: 'core' } },
              allow: { to: { element: { types: 'core' } } },
            },
            {
              from: { element: { types: 'shared' } },
              allow: { to: { element: { types: ['shared', 'core'] } } },
            },
            {
              from: { element: { types: 'feature' } },
              allow: {
                to: [
                  { element: { types: ['shared', 'core'] } },
                  { element: { types: 'feature', captured: { feature: '{{feature}}' } } },
                ],
              },
            },
            {
              from: { element: { types: 'app-root' } },
              allow: { to: { element: { types: ['core', 'shared', 'feature'] } } },
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
]);
