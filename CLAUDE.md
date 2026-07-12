# CLAUDE.md — Espacio Seguro

Fuente de verdad del proyecto. **Antes de implementar cualquier funcionalidad**:
1. Lee este archivo.
2. Verifica que tu approach es compatible con las reglas de aquí.
3. Si tomas una decisión arquitectónica relevante, actualiza este archivo en el mismo commit.

No asumas que las instrucciones del encargo original se repetirán: este documento es el que manda.

---

## Visión del producto

**Espacio Seguro** es un refugio emocional digital para personas con ansiedad, tendencia a sobrepensar y bucles de pensamiento. No es una app de productividad ni un tracker más: es el sitio al que se acude *en medio* de un desbordamiento emocional para encontrar alivio, y el sitio al que se vuelve entre episodios para organizar la mente y entender los propios patrones.

## Objetivos

- Ofrecer regulación emocional inmediata ante una crisis de ansiedad (botón de emergencia).
- Dar herramientas para diferenciar hechos, interpretaciones y miedos (diario, verificación de realidad).
- Reducir la carga mental organizando pensamientos sueltos (brain dump → acción/espera/soltar).
- Ayudar a identificar la necesidad emocional real detrás de un impulso o una demanda aparente.
- Acompañar sin generar dependencia: gamificación que refuerza el autocuidado sin explotar mecanismos adictivos.
- Funcionar 100% local y offline: los datos de la persona no salen de su dispositivo.

## Filosofía del producto

- **Refugio emocional**: el tono siempre es cálido, nunca clínico ni alarmista. Ni siquiera el botón de pánico usa rojo puro.
- **Regulación emocional**: cada herramienta (respiración, grounding, autocompasión) está basada en técnicas de TCC/mindfulness reconocidas, no inventadas.
- **Organización mental**: reducir la carga cognitiva es en sí mismo un acto terapéutico (brain dump, categorización).
- **Autocompasión**: el lenguaje de la app nunca culpabiliza ("¿qué necesito ahora?", nunca "¿por qué has vuelto a hacer esto?").
- **Bienestar digital**: sin scroll infinito, sin notificaciones ansiógenas, sin métricas de vanidad. La gamificación refuerza constancia, no uso compulsivo.

---

## Stack tecnológico

| Área | Elección | Notas |
|---|---|---|
| Framework | Angular 21.2.19, standalone components | Sin NgModules. |
| Lenguaje | TypeScript 5.9, `strict: true` + `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature` | Prohibido `any`. |
| Change detection | Zoneless (`provideZonelessChangeDetection`) | Sin zone.js (no está ni en `package.json`). |
| Estado | Signals + `SignalStore` propio (`core/state/signal-store.ts`) | Sin NgRx, sin `@ngrx/signals` (decisión explícita, ver ADR-03). |
| Persistencia | IndexedDB vía [`idb`](https://github.com/jakearchibald/idb) | Encapsulado en `core/persistence`, nunca importado fuera de ahí. |
| Router | Angular Router, lazy `loadChildren`/`loadComponent` por feature, `@defer` en vistas pesadas | |
| Estilos | SCSS, mobile-first, custom properties como design tokens (`src/styles/_tokens.scss`) | Soporta `prefers-color-scheme: dark` y `prefers-reduced-motion`. |
| CDK | A11y (`LiveAnnouncer` ya en uso: respiración, grounding, cuenta atrás) | Overlay/Layout/Drag-Drop se añaden solo si una feature futura los necesita de verdad (ver ADR-11 sobre por qué `mental-organizer` no usa Drag-Drop). |
| PWA | `@angular/pwa` (service worker + manifest) | App 100% offline, sin backend. |
| Testing | Vitest (builder nativo `@angular/build:unit-test`) + Angular Testing Library + `fake-indexeddb` | Cobertura mínima 90% (`coverageThresholds` en `angular.json`). |
| Lint | ESLint 9 (flat config) + `angular-eslint` + `eslint-plugin-boundaries` | Boundaries fuerza los límites entre `core`/`shared`/`features`. |

---

## Reglas arquitectónicas

Clean Architecture por capas, dependencias apuntando siempre hacia el dominio:

```
presentation (pages/components) → application (stores/use-cases) → domain (models) ← infrastructure (repositories)
```

- `domain` (modelos de cada feature) no importa nada de Angular ni de `infrastructure`.
- Los stores dependen de **interfaces** de repositorio, nunca de la implementación IndexedDB concreta (Dependency Inversion). La implementación concreta se inyecta con un `InjectionToken`.
- `features/*` **no se importan entre sí**. Todo lo compartido vive en `shared` o `core`. Esto lo verifica `eslint-plugin-boundaries` (ver `eslint.config.js`): una feature solo puede importar de `shared`, `core` o de sí misma.
- Los componentes (`pages`/`components`) no contienen lógica de negocio: leen signals del store y despachan intents. Toda regla de negocio vive en la store o en un use-case de `services/`.
- Todo componente usa `ChangeDetectionStrategy.OnPush` (obligatorio dado el zoneless).
- Prohibido: `any`, lógica de negocio acoplada a IndexedDB, lógica de negocio en componentes, código duplicado.

## Convenciones

- **Nombres de archivo**: `kebab-case`, sufijo por tipo (`*.model.ts`, `*.store.ts`, `*.repository.ts`, `*.use-case.ts`, `*.component.ts` solo si no es una page).
- **Selectores**: componentes `app-kebab-case` (elemento), directivas `appCamelCase` (atributo).
- **Cada feature** sigue esta estructura interna: `pages/`, `components/`, `stores/`, `services/`, `repositories/`, `models/`, y specs colocados (`*.spec.ts` junto al archivo que testean).
- **Value objects compartidos** (`shared/models`): `EmotionType`, `Intensity` (branded 1-10), `EnergyLevel`, `ISODateString`, `BreathingPattern`, `GroundingStep`. Nunca declarar estos tipos de nuevo dentro de una feature.
- **Ids vs. etiquetas**: los ids de catálogos cerrados (`EmotionType`, `BreathingPatternId`) se mantienen en ASCII minúsculas (persistidos, comparables). Las etiquetas visibles (con tildes/mayúsculas) viven en un `*_LABELS: Record<Id, string>` separado (ver `EMOTION_LABELS`) — nunca renderizar el id directamente en la UI.
- **Servicios de borde testeables** (`core/services`): `ClockService` (envuelve `new Date()`) e `IdGeneratorService` (envuelve `crypto.randomUUID()`) se inyectan en vez de llamarse directamente, para poder controlar tiempo/ids en tests.
- **Páginas raíz sin feature**: una página sin dominio propio que solo enlaza a features (p. ej. `home.page.ts`) vive directamente en `src/app/` (no dentro de `features/`), clasificada como `app-root` a efectos de `eslint-plugin-boundaries`.
- **Commits**: Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`, `perf:`).
- **Tests**: colocados junto al archivo (`x.ts` + `x.spec.ts`), no en una carpeta `__tests__` separada. Componentes con `input()`/`output()` de signals se testean con `@testing-library/angular/zoneless` (no la entrada por defecto) + `bindings: [inputBinding(...), outputBinding(...)]`. Para código con `setInterval`, usar `vi.useFakeTimers()` + `await vi.advanceTimersByTimeAsync(ms)` seguido de `fixture.detectChanges()` (no `fixture.whenStable()`, que puede colgarse en zoneless). Si esa finalización dispara además un guardado en IndexedDB (p. ej. un handler `(completed)` que persiste), `fake-indexeddb` agenda sus propios `setTimeout` internos: hace falta "drenarlos" con varias llamadas `await advance(50)` (avance positivo, no `advance(0)`) antes de volver a `vi.useRealTimers()` y asegurar con `findBy*`.
- **Fake timers en tests de flujo largo (varias pantallas)**: activar `vi.useFakeTimers()` para el test completo, antes del `render()`, rompe el polling interno de todos los `findBy*` posteriores (dependen de mecanismos de tiempo real). Patrón correcto: completar con timers reales y el `user` por defecto todos los pasos que dependan de `findByRole`/`findByText` (navegación, formularios); solo activar `vi.useFakeTimers()` justo antes del paso que monta el `setInterval` a controlar, creando ahí un `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })` aparte; desde ese punto usar únicamente `getByRole`/`getByText` síncronos + `advance()` manual; volver a `vi.useRealTimers()` antes del siguiente `findBy*`. Añadir siempre un `afterEach(() => vi.useRealTimers())` global en el spec como red de seguridad: si un test con fake timers cuelga y salta el timeout de Vitest, la línea que restaura los timers reales nunca se ejecuta y contamina los tests siguientes del mismo archivo.

## Modelo de dominio

Value objects compartidos: `EmotionType` (catálogo cerrado), `Intensity` (1-10), `EnergyLevel` (`low|medium|high`), `ISODateString`.

| Feature | Entidad | Campos clave |
|---|---|---|
| `emergency` | `EmergencyEvent` | situation, emotion, intensity, need, techniquesUsed[], waitingModeActivated, resolvedAt |
| `emergency` | `BlockingSession` | emergencyEventId, mode (`normal｜shielded`), reason, blockedApps[], durationMin, startedAt, endsAt, status (`active｜completed｜cancelled`), attemptCount, reflection |
| `journal` | `JournalEntry` | date, emotion, intensity, situation, facts, interpretations, fears, alternatives, needs |
| `mental-organizer` | `BrainDumpItem` | content, category (`null` hasta clasificar, luego `action｜waiting｜not-my-control｜release`), createdAt, resolvedAt |
| `uncertainty-box` | `UncertaintyEntry` | worryText, createdAt, revisitAt, review (`null` hasta desbloquear: stillImportant, resolvedItself, asSeriousAsExpected), reviewedAt |
| `crisis-plan` | `CrisisPlan` (documento singleton, `id: 'default'`) | warningSigns[], worseningTriggers[], helpfulActions[], reminders[], reasonsNotToAct[], supportContacts (`SupportContact[]`: name, phone, note), updatedAt |
| `reality-list` | `RealityPhrase` | text, isFavorite, isPriority, createdAt |
| `relationship-anxiety` | `RealityCheck` | evidence, assumptions, alternativeExplanations, friendAdvice |
| `relationship-anxiety` | `WaitingBoxItem` | worryText, createdAt, revisitAt, resolved |
| `relationship-anxiety` | `ImpulseLogEntry` | type (`write｜check-messages｜search-answers`), timestamp, resisted |
| `activities` | `Activity` | title, description, energyLevel, category, durationMin, tags[] |
| `emotional-tools` | `ToolSession` | toolType (`breathing｜grounding`; `self-compassion｜uncertainty` se añadirán cuando existan esas técnicas standalone), techniqueId, durationSec, completedAt |
| `emotional-tools` | `BreathingPattern` (config) | inhaleSec, holdSec, exhaleSec, holdAfterExhaleSec |
| `emotional-tracker` | `DailyCheckIn` | date, mood, anxiety, energy, stress, sleepHours, activitiesDone[] |
| `personal-library` | `LibraryEntry` | type (`reflection｜quote｜learning｜achievement｜reminder`), content, tags[], favorite, createdAt |
| `needs-analysis` | `NeedAnalysis` | apparentNeed, realNeeds[] (calma, seguridad, validación, cercanía, descanso, comprensión), suggestedActions[] |
| `gamification` | `Streak`, `Achievement`, `WeeklyGoal` | streakType/currentCount/longestCount, achievementId/unlockedAt, goalText/progress/targetDate |

Cada entidad tendrá, al implementarse su feature: interfaz de repositorio en `domain`, implementación `IndexedDbRepository<T>` en `infrastructure`, y su store de Signals correspondiente.

## Decisiones arquitectónicas (ADRs)

- **ADR-01 — Zoneless en vez de zone.js**: Angular 21 lo soporta de forma estable. Combinado con Signals + OnPush, elimina el overhead de detección de cambios global. Coherente con el requisito de que la app "se sienta instantánea".
- **ADR-02 — Angular CLI estándar, no Nx**: una sola app no justifica un monorepo. Los límites arquitectónicos se imponen con `eslint-plugin-boundaries` en vez de con el tooling de un monorepo.
- **ADR-03 — Signal Store propio en vez de NgRx o `@ngrx/signals`**: el encargo pide evitar NgRx explícitamente. Se descartó también `@ngrx/signals` para no dejar ambigüedad, aunque técnicamente no es el NgRx clásico. `core/state/signal-store.ts` da `select()`, `patch()`, `setState()`, `updateState()` en <60 líneas.
- **ADR-04 — `idb` como driver de IndexedDB**: wrapper promise-based de ~1.2kb (Jake Archibald), no es un ORM (no añade query language). Vive solo en `core/persistence`. La configuración (nombre/versión/stores) se inyecta vía `APP_DB_CONFIG` (`InjectionToken`) para poder sustituirla en tests sin tocar el esquema real.
- **ADR-05 — `APP_DB_STORES` empieza vacío**: no se declaran stores para entidades que aún no existen en código. Cada feature añade su `StoreDefinition` a `core/persistence/db-schema.ts` al implementarse. **Regla obligatoria ligada**: cada vez que se añade/cambia una entrada de `APP_DB_STORES`, hay que subir `DB_VERSION` en el mismo commit — si no, los navegadores que ya abrieron la app con una versión anterior nunca ejecutan el `upgrade` que crea el store nuevo, y sus operaciones fallan con `NotFoundError: object store was not found` (bug real encontrado verificando `journal` en el navegador).
- **ADR-06 — Gráficas hechas a mano (SVG) en vez de librería de charting**: para 2-3 tipos de gráfica simples (seguimiento emocional) no se justifica una dependencia de terceros. Vive en `shared/ui/chart`.
- **ADR-07 — Vitest nativo + Angular Testing Library + `fake-indexeddb`**: Angular 21 integra Vitest de forma first-class (reemplaza Karma). `fake-indexeddb` se carga globalmente en `src/test-setup.ts` para poder testear repositorios sin un navegador real. Cobertura mínima 90% forzada en `angular.json` (`coverageThresholds`).
- **ADR-08 — Paleta cálida, no clínica**: verde salvia (`--color-primary`) + terracota suave (`--color-danger`) en vez de rojo/azul clínicos. Soporta `prefers-color-scheme: dark` y `prefers-reduced-motion` desde el primer commit por el contexto de uso (ansiedad, posible uso nocturno).
- **ADR-09 — Widgets de regulación en `shared/ui`, no en una feature**: `BreathingTimerComponent`, `GroundingGuideComponent` y `CountdownTimerComponent` los usan tanto `emergency` como (más adelante) `emotional-tools`. Como las features no pueden importarse entre sí, estos widgets — y los datos de referencia clínicos que consumen (`BREATHING_PATTERNS`, `GROUNDING_5_4_3_2_1_STEPS`) — viven en `shared`, sin lógica de negocio ni persistencia propia; cada feature decide qué hacer con sus eventos `completed`/`finished`.
- **ADR-10 — Flujo de `emergency` como una sola página con estado derivado**: en vez de sub-rutas con guards, `EmergencyPage` deriva la vista (`intake｜toolbox｜waiting-setup｜waiting-mode｜resolved`) de un `computed` sobre el estado de `EmergencyStore`. Más simple de testear y suficiente para un wizard de un solo dispositivo sin necesidad de URLs profundas.
- **ADR-11 — `mental-organizer` clasifica con botones, no con CDK Drag-Drop**: la carpeta de arquitectura preveía Drag-Drop para mover pensamientos entre columnas, pero arrastrar con puntero no tiene equivalente accesible por defecto (teclado/lector de pantalla) y las señales computed (`actionItems`, `waitingItems`, ...) derivadas del store no combinan bien con la mutación in-place que hace `moveItemInArray`/`transferArrayItem`. Se optó por un botón por categoría en cada item sin clasificar (100% accesible, trivial de testear). Drag-Drop queda abierto como mejora progresiva futura, no como bloqueante del MVP.
- **ADR-12 — Navegación principal como bottom nav fija, no solo desde la home**: `BottomNavComponent` (`src/app/bottom-nav.component.ts`, junto a `home.page.ts` por ser shell sin dominio propio) vive en el shell (`app.html`) y se ve en todas las páginas. Los 4 iconos son SVG de línea dibujados a mano (sin librería de iconos) para mantener el paquete ligero y consistente con el resto del design system. El item "Emergencia" lleva `--color-danger` permanente (no solo en estado activo) para que el acceso a la crisis sea siempre reconocible de un vistazo. **`position: fixed`, no `sticky`** (ver ADR-13): `.app-main` reserva el espacio con `padding-bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px) + var(--space-5))`.
- **ADR-13 — `position: fixed` en vez de `sticky` para la bottom nav**: la primera versión usaba `position: sticky` como hijo directo del `:host` flex de `App`. Safari en iOS tiene bugs conocidos con `sticky` dentro de un contenedor flex (no se pega de forma fiable, o se comporta de forma inconsistente al hacer scroll) — confirmado por un usuario probando en iPhone real, no reproducible en el emulador de este entorno. Se cambió a `position: fixed; bottom:0; left:0; right:0`, el patrón estándar y más compatible para barras de navegación inferior en web, sacando el elemento del flujo y reservando su altura (`--bottom-nav-height`, token en `_tokens.scss`) como padding en `.app-main`.
- **ADR-14 — Alcance honesto de "Modo Blindado": compromiso in-app, no bloqueo real de apps del sistema operativo**: el encargo original pedía bloqueo de apps a nivel de SO (Android: monitorización de app en primer plano, servicios en segundo plano, recuperación tras arranque/cierre forzado, notificación persistente; iOS: Family Controls / Managed Settings / Device Activity / Screen Time). Ninguno de esos mecanismos es alcanzable desde una PWA: un navegador no tiene API para leer qué app está en primer plano en el dispositivo, no puede ejecutar un servicio en segundo plano que sobreviva al cierre de la pestaña, y iOS en particular restringe las Screen Time APIs a apps nativas firmadas con el entitlement de Family Controls — no existen para web. Implementar la funcionalidad "tal cual" habría significado simularla con una falsa sensación de seguridad, lo contrario del espíritu de la app. Se construyó en su lugar el subconjunto máximo honesto: un compromiso de fricción dentro de la propia PWA — pantalla de bloqueo sin botones de salida, cuenta atrás no pausable (ver ADR-15), disuasión best-effort de abandono de pestaña (`visibilitychange`/`blur` cuentan como intento, `beforeunload` avisa en modo blindado), y persistencia en IndexedDB que restaura el bloqueo activo si se cierra y reabre la PWA. La limitación se documenta aquí y debe quedar clara para el usuario final en la copy de la pantalla de confirmación (ver ADR-16).
- **ADR-15 — `BlockingSessionStore` con scope `root`, no de ruta**: a diferencia del resto de stores de `emergency` (provistos en `emergency.routes.ts`), `BlockingSessionStore`/`BlockingSessionRepository` se registran en `app.config.ts` (`providedIn: 'root'`). Un bloqueo activo tiene que sobrevivir a la navegación fuera de `/emergencia` (el usuario puede ir a `/diario` u `/organizador` desde la pantalla de bloqueo) y mostrarse como banner persistente en toda la app (`ActiveBlockingBannerComponent`, en el shell `app.html`). Si el store fuera de ruta, se destruiría y perdería el estado en memoria al salir de la feature.
- **ADR-16 — `hideControls` en `CountdownTimerComponent`**: el widget compartido siempre exponía sus propios botones "Empezar"/"Detener". Al reusarlo en `BlockingLockComponent` con `autoStart`, "Detener" seguía siendo pulsable y permitía pausar indefinidamente una cuenta atrás que, en Modo Blindado, no debe poder interrumpirse de ninguna forma — encontrado probando manualmente en navegador, no por los tests (que no ejercitaban el botón nativo del widget en ese contexto). Se añadió `hideControls = input(false)` que oculta ambos botones vía `@if` en la plantilla; `blocking-lock.component.html` lo activa siempre (`[hideControls]="true"`), independientemente del modo, porque en Modo Normal la única vía de cancelación soportada es el botón dedicado "Cancelar bloqueo" del propio `BlockingLockComponent`, no los controles internos del temporizador.
- **ADR-17 — Estado derivado sin cron/timers en Caja de Incertidumbre**: `deriveUncertaintyStatus(entry, referenceNow)` es una función pura (sin Angular, sin `SignalStore`) que compara `revisitAt` con una hora de referencia; nunca se persiste un estado "sellada/desbloqueada/revisada" en IndexedDB, se deriva en cada lectura. `UncertaintyBoxStore` es route-scoped y captura `referenceNow` con `ClockService.now()` solo en `loadEntries()`, sin `setInterval`: al ser route-scoped, simplemente se recaptura cada vez que se visita la página, que es suficiente para una funcionalidad que no necesita contar hacia atrás en tiempo real (a diferencia de Modo Blindado).
- **ADR-18 — Inmutabilidad de una preocupación sellada impuesta en la API de la store, no solo en la plantilla**: `UncertaintyBoxStore` no expone ningún método `updateEntry`/`deleteEntry`. El único camino de escritura tras `addEntry` es `reviewEntry(id, review)`, que comprueba internamente `deriveUncertaintyStatus(entry, referenceNow) === 'unlockable'` antes de guardar; si la entrada sigue sellada, no hace nada. Así, aunque alguien se salte la UI (o un test llame al método directamente), el sellado sigue siendo real.
- **ADR-19 — `CrisisPlan` como documento singleton reutilizando `IndexedDbRepository<T>` genérico**: en vez de crear un repositorio especial "de documento único", `CrisisPlan` se persiste como una colección de un elemento con id fijo (`DEFAULT_CRISIS_PLAN_ID = 'default'`), usando `findById`/`save` del mismo `IndexedDbRepository<T>` que usan el resto de entidades. `crisis-plan.routes.ts` usa una ruta contenedora (`path: ''` con `providers` compartidos) con dos rutas hijas (`''` para editar, `'activar'` para la activación de solo lectura) — así ambas pantallas comparten la misma instancia de `CrisisPlanStore` sin duplicar la configuración de providers, y las URLs finales quedan `/plan-de-crisis` y `/plan-de-crisis/activar`.
- **ADR-20 — `EditableStringListComponent` extraído a `shared/ui`**: se extrajo en el momento de su 5º uso simultáneo dentro de `CrisisPlanEditPage` (señales de alerta, cosas que empeoran, cosas que ayudan, recordatorios, razones para no actuar) — regla de tres ampliamente satisfecha. La chip-list de `blocking-setup.component.ts` (apps a evitar en Modo Blindado, un solo uso) se deja como está: extraerla ahora sería una abstracción sin un segundo consumidor real.
- **ADR-21 — FAB global "No estoy bien" (`CrisisFabComponent`)**: componente `app-root` (vive en `src/app/`, no dentro de una feature) añadido al shell (`app.html`) junto a `app-active-blocking-banner`/`app-bottom-nav`, siguiendo el mismo patrón de "UI visible en toda la app". A diferencia del banner de bloqueo activo, no necesita estado propio: es un enlace fijo a `/plan-de-crisis/activar`. Se posiciona `position: fixed` en la esquina inferior derecha, por encima de la bottom nav (`z-index: 60` vs. `50`), sin lógica de ocultación condicional por ruta (pulsarlo desde su propia pantalla de destino es simplemente un no-op de navegación).

## Roadmap

- **Fase 0 — Fundación** ✅ (este commit): workspace, TS strict, zoneless, ESLint boundaries, Vitest + ATL + fake-indexeddb, PWA, design tokens, `core/persistence`, `core/state`, shell de la app, este `CLAUDE.md`.
- **Fase 1 — MVP** ✅ **completa**: `emergency` ✅, `emotional-tools` (respiración + grounding) ✅, `journal` ✅, `mental-organizer` ✅.
- **Fase 2**: `emotional-tracker` (gráficas SVG), `gamification` ligera (rachas), `personal-library`.
- **Fase 3**: `relationship-anxiety`, `needs-analysis`, `activities`.
- **Fase 4 — Pulido**: auditoría WCAG AA completa, auditoría de rendimiento (Lighthouse ≥95), gamificación completa, animaciones de transición.
- **Fase 5 — futuro**: ver "Versión 2.0 con IA" abajo.

### Iniciativa "herramienta activa contra rumiación e impulsividad" (10 funcionalidades, sin IA)

Encargo posterior a la Fase 1 y a Modo Blindado, para que la app no sea solo un lugar de registro sino que ayude a interrumpir ciclos de ansiedad. Se entrega por bloques con checkpoint del usuario entre cada uno.

- **Bloque 1 ✅ (0.7.0)**: `uncertainty-box` (Caja de Incertidumbre, prioritaria) + `crisis-plan` (Mi Plan de Crisis + FAB global "No estoy bien").
- **Bloque 2 ✅ (0.8.0)**: `reality-list` (Mi Lista de Realidad, `/lista-de-realidad`).
- **Bloque 3 (pendiente)**: `victories` (Registro de Victorias, `/logros`).
- **Bloque 4 (pendiente)**: `activities` (Banco Personal de Actividades, `/actividades`) — implementa lo que la Fase 3 original reservaba para `activities`.
- **Bloque 5 (pendiente)**: `wellbeing-goals` (Objetivos Emocionales, `/objetivos`).
- **Bloque 6 (pendiente)**: `anti-rumination-mode` (Ya He Pensado Suficiente, `/ya-he-pensado-suficiente`) — pantalla dedicada, no ocultación cross-cutting real (decisión acordada con el usuario).
- **Bloque 7 (pendiente)**: `night-mode` (Modo Noche Ansiosa, `/noche-dificil`) — pantalla dedicada simplificada; sin reproductor de audio (no hay infraestructura de audio en el proyecto, se documentará como limitación explícita si se implementa).
- **Bloque 8 (pendiente)**: `trigger-map` (Mapa de Desencadenantes, `/mis-patrones`) + `core/pattern-log` — la única pieza que necesita agregar datos de otras features; diseño: `TriggerCategory` vive en `shared/models` (no en `core`, que no puede importar de `shared`), `core/pattern-log` guarda `category` como `string` sin tipar, cada feature que escribe valida con `isTriggerCategory` antes de llamar.
- **Bloque 9 (pendiente)**: Pantalla Principal Adaptativa — cambio en `home.page.ts` (no es una feature nueva), sin nuevo store persistido.

Nota de alcance: `victories` y `wellbeing-goals` se solapan conceptualmente con la `gamification` (`Streak`/`Achievement`/`WeeklyGoal`) ya reservada en la Fase 2 de este roadmap; se implementa solo el subconjunto pedido explícitamente en el encargo, no `gamification` completa. Si en el futuro se construye `gamification` con más profundidad (insignias, rachas visuales), debería extender estas entidades en vez de duplicarlas.

### MVP (Fase 1)

Botón de emergencia + caja de herramientas emocionales (respiración + grounding) + diario emocional + organizador mental. Es el subconjunto que responde directamente a la promesa del producto: abrir la app en medio de un desbordamiento y encontrar alivio inmediato.

### Versión 2.0 con IA (no implementar todavía)

Todo detrás de un `featureFlags.ai` opt-in en `core/config`, sin cambiar la arquitectura de dominio (entran como capa de "sugerencias" sobre las use-cases existentes):

- Diario: detección de distorsiones cognitivas (catastrofismo, lectura de mente) en "interpretaciones".
- Organizador mental: sugerencia automática de categoría al pegar un brain dump largo.
- Ansiedad relacional: generación de explicaciones alternativas personalizadas a partir de la evidencia registrada.
- Actividades: recomendación adaptativa según qué actividades bajaron más la ansiedad históricamente.
- "¿Qué necesito realmente?": mapeo semántico necesidad aparente → real más rico que el árbol de reglas fijo.
- Seguimiento emocional: detección de correlaciones (sueño↔ansiedad) y resúmenes semanales en lenguaje natural.
- Emergencia: sugerencia de técnica de regulación por similitud con episodios pasados que funcionaron.

## Historial de cambios

- **0.1.0** (2026-07-09): Bootstrap del proyecto. Workspace Angular 21 + arquitectura Clean Architecture (`core`/`shared`/`features`), TS strict + zoneless, ESLint boundaries, Vitest + Angular Testing Library + fake-indexeddb (cobertura ≥90%), PWA, design tokens SCSS mobile-first, shell de la app, `core/persistence` (adapter `idb` + repository base) y `core/state` (signal store base). Sin features de producto todavía (Fase 0 de la Fase 1 en adelante).
- **0.2.0** (2026-07-09): Primera feature completa de la Fase 1: `emergency` (botón de emergencia). Incluye las 4 preguntas guiadas, caja de herramientas (respiración box breathing, grounding 5-4-3-2-1, cuenta atrás de calma, pausa de autocompasión), modo especial "Espera antes de actuar" (temporizador + reflexión guiada + registro de impulso resistido/no resistido) y resolución del evento. Añade los widgets compartidos `BreathingTimerComponent`, `GroundingGuideComponent`, `CountdownTimerComponent` (`shared/ui`), los servicios `ClockService`/`IdGeneratorService` (`core/services`), y la `home.page.ts` de navegación. Verificado manualmente en navegador (móvil/desktop, claro/oscuro). 88 tests, cobertura ≥90%.
- **0.3.0** (2026-07-09): `emotional-tools` (caja de herramientas emocionales standalone, fuera de una crisis): menú de 3 patrones de respiración (box, 4-7-8, diafragmática) + grounding 5-4-3-2-1, reutilizando los widgets de `shared/ui`; cada sesión completada se persiste como `ToolSession`. 96 tests acumulados.
- **0.4.0** (2026-07-09): `journal` (diario emocional): formulario con separación hechos/interpretaciones/miedos/alternativas/necesidades, historial expandible con `<details>` y borrado de entradas. Corrige un bug real encontrado verificando en navegador: `DB_VERSION` no subía al añadir stores nuevos, así que un navegador con la BD ya creada nunca recibía el store de la feature nueva (`NotFoundError`) — ver ADR-05. 109 tests acumulados.
- **0.5.0** (2026-07-09): `mental-organizer` (organizador mental / brain dump), completando la Fase 1 (MVP): bandeja de captura rápida + clasificación en Acción/Espera/No depende de mí/Soltar mediante botones accesibles (ver ADR-11 sobre por qué no Drag-Drop), con "Resuelto"/"Eliminar" por item. 124 tests acumulados, cobertura ≥90%, verificado en navegador end-to-end para las 4 features de la Fase 1.
- **0.5.1** (2026-07-09): el título del header ("Espacio Seguro") enlaza a la home desde cualquier página.
- **0.5.2** (2026-07-09): navegación principal como bottom nav fija (sticky) en las 4 features de la Fase 1, con iconos de línea dibujados a mano y el ítem de Emergencia siempre en color de alerta (ver ADR-12). 129 tests acumulados, cobertura ≥90%.
- **0.5.3** (2026-07-09): corrige el "safe area" de iOS — faltaba `viewport-fit=cover` en el `<meta name="viewport">`, así que `env(safe-area-inset-*)` no resolvía nunca y la bottom nav quedaba pegada al borde, chocando con la barra de gestos del iPhone. Se añade también `env(safe-area-inset-top)` al header y meta tags `apple-mobile-web-app-*` + `apple-touch-icon` para el modo standalone en iOS.
- **0.5.4** (2026-07-10): la bottom nav seguía viéndose mal en iPhone real tras 0.5.3. Causa real: `position: sticky` como hijo directo de un flex container es poco fiable en Safari/iOS. Cambiada a `position: fixed` (ver ADR-13), con `.app-main` reservando el espacio vía `padding-bottom`.
- **0.6.0** (2026-07-10): "Modo Blindado" dentro de "Espera antes de actuar". Sustituye `ImpulseWaitingRecord` por `BlockingSession` (ver modelo de dominio) con `BlockingSessionStore` de scope `root` (ADR-15) para sobrevivir a la navegación. Flujo: `blocking-setup` (modo normal/blindado, motivo, apps a evitar, duración) → `blocking-confirm` (solo en modo blindado, copy exacta de compromiso irreversible) → `blocking-lock` (cuenta atrás no pausable — `hideControls`, ver ADR-16 —, herramientas de respiración/grounding y accesos a diario/organizador inline, sin botón de cancelar en modo blindado) → reflexión final (¿cómo te sientes ahora?, ¿ha disminuido la urgencia?, ¿sigues queriendo abrir la app?, ¿te ha ayudado la pausa?), que se guarda en el historial. Añade `ActiveBlockingBannerComponent` (banner global persistente en todo el shell mientras hay un bloqueo activo) y disuasión best-effort de abandono (`visibilitychange`/`blur` cuentan como intento; `beforeunload` avisa en modo blindado). Documenta explícitamente que no existe bloqueo real de apps a nivel de sistema operativo — inalcanzable desde una PWA — y que esta es la versión honesta de la funcionalidad (ver ADR-14). 153 tests acumulados, cobertura ≥90%, verificado manualmente en navegador (el bug de "Detener" pausando el bloqueo blindado se encontró y corrigió en esta misma verificación, no en los tests).
- **0.7.0** (2026-07-12): primer bloque de la iniciativa "herramienta activa contra rumiación e impulsividad": `uncertainty-box` (Caja de Incertidumbre) — preocupaciones selladas hasta una fecha de revisión (mañana/+3 días/+1 semana/personalizada), inmutables mientras están selladas (ver ADR-17, ADR-18), con reflexión final y estadísticas simples. `crisis-plan` (Mi Plan de Crisis) — 5 listas editables (señales de alerta, cosas que empeoran, cosas que ayudan, recordatorios, razones para no actuar) + contactos de apoyo, documento singleton (ver ADR-19), con una pantalla de activación de solo lectura ("No estoy bien") que embebe respiración/grounding de `shared/ui`. Nuevo componente compartido `EditableStringListComponent` (ver ADR-20). Nuevo FAB global `CrisisFabComponent` visible en toda la app (ver ADR-21). `DB_VERSION` 4→5 (`uncertaintyEntries`, `crisisPlans`). Ambas features enlazadas desde la home. 200 tests acumulados, cobertura ≥90%, verificado manualmente en navegador (FAB visible junto al banner de bloqueo activo sin solaparse, sellado de preocupaciones, plan de crisis persistiendo entre setup y activación).
- **0.8.0** (2026-07-12): segundo bloque: `reality-list` (Mi Lista de Realidad, `/lista-de-realidad`) — frases guardadas para volver a los hechos, con `RandomPhraseCardComponent` que muestra una frase al azar (priorizando las marcadas como prioritarias si existen), y toggles de favorita/prioritaria por frase. `DB_VERSION` 5→6 (`realityPhrases`). Enlazada desde la home. 225 tests acumulados, cobertura ≥90%, verificado manualmente en navegador (guardar frase, marcar favorita/prioritaria, frase aleatoria priorizando las marcadas, eliminar).
