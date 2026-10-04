# Tasks: Autenticación y Reservas de Canchas

**Input**: Design documents from `specs/001-user-auth-reservations/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`,
`quickstart.md`

**Organization**: Tasks are grouped by user story so each story can be implemented and
validated independently after the foundational phase.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicializar los proyectos TypeScript y la estructura plana definida por la
constitución.

- [X] T001 Crear la estructura de directorios `backend/src`, `backend/tests`, `frontend/src`, `frontend/tests` y `db/migrations` según `specs/001-user-auth-reservations/plan.md`
- [X] T002 Inicializar `backend/package.json` y `frontend/package.json` con TypeScript, Node.js, Express, React y Tailwind CSS
- [X] T003 [P] Configurar `backend/tsconfig.json` y los scripts de desarrollo, compilación y pruebas del backend
- [X] T004 [P] Configurar `frontend/tsconfig.json`, Tailwind CSS y los scripts de desarrollo, compilación y pruebas del frontend
- [X] T005 [P] Configurar Vitest, React Testing Library y Supertest en `backend/vitest.config.ts`, `frontend/vitest.config.ts` y los manifiestos de cada proyecto
- [X] T006 [P] Crear `backend/.env.example` con la configuración local de sesión, base de datos y servidor sin incluir secretos reales

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Crear la persistencia, seguridad y middleware que necesitan todas las historias.

**⚠️ CRITICAL**: Ninguna historia de usuario puede comenzar antes de completar esta fase.

- [X] T007 Crear `db/migrations/001_initial.sql` con las tablas `users`, `sessions`, `courts` y `reservations`, incluyendo claves foráneas, `email` único, `startHour BETWEEN 0 AND 23` y `status IN ('active', 'cancelled')`
- [X] T008 [P] Implementar la conexión SQLite y ejecución de migraciones en `backend/src/db/connection.ts`, usando `db/padel.db` como archivo local
- [X] T009 [P] Crear el seed inmutable de las cinco canchas en `db/seed.ts`: Cancha Laureles, Cancha El Poblado, Cancha Belén, Cancha Robledo y Cancha Envigado
- [X] T010 Configurar en `db/migrations/001_initial.sql` los índices únicos parciales para impedir una reserva activa duplicada por cancha/fecha/hora y más de una reserva activa por usuario
- [X] T011 [P] Implementar los tipos compartidos de usuario, sesión, cancha, bloque horario y reserva en `backend/src/shared/types.ts`
- [X] T012 [P] Implementar hash y verificación de contraseñas con `bcryptjs` en `backend/src/auth/password.ts`; nunca persistir contraseñas originales
- [X] T013 Implementar creación, validación, expiración y revocación de sesiones mediante cookie opaca en `backend/src/auth/sessionService.ts`
- [X] T014 [P] Implementar respuestas de error `{ code, message }` sin stack traces en `backend/src/http/errors.ts`
- [X] T015 Implementar el middleware de sesión activa y autorización en `backend/src/http/authMiddleware.ts`, devolviendo `401` para sesiones ausentes, revocadas o expiradas
- [X] T016 Implementar la aplicación Express base, parseo JSON y registro de rutas en `backend/src/server.ts`
- [X] T017 [P] Crear el cliente HTTP y la traducción de errores amigables en `frontend/src/services/apiClient.ts`
- [X] T018 [P] Crear el estado base de sesión y las rutas protegidas de UI en `frontend/src/app/session.tsx` y `frontend/src/app/routes.tsx`

**Checkpoint**: Base de datos, seguridad, sesión, errores y arranque de ambas aplicaciones
están listos para implementar historias.

---

## Phase 3: User Story 1 - Registrarse e iniciar sesión (Priority: P1) 🎯 MVP

**Goal**: Permitir registro, inicio y cierre de sesión, y proteger las áreas que requieren
una sesión activa.

**Independent Test**: Registrar una cuenta, iniciar sesión, acceder a una ruta protegida,
cerrar sesión e intentar acceder nuevamente; las credenciales inválidas y correos
duplicados deben mostrar mensajes seguros.

### Tests for User Story 1

- [X] T019 [P] [US1] Crear pruebas de contrato para `POST /api/auth/register`, `POST /api/auth/login` y `POST /api/auth/logout` en `backend/tests/contract/auth.test.ts`
- [X] T020 [P] [US1] Crear pruebas de integración para registro, sesión protegida, credenciales inválidas, correo duplicado y cierre de sesión en `backend/tests/integration/auth.test.ts`
- [X] T021 [P] [US1] Crear pruebas de interacción para formularios de registro, inicio y cierre de sesión en `frontend/tests/auth.test.tsx`

### Implementation for User Story 1

- [X] T022 [US1] Implementar registro, normalización de correo, validación de contraseña de al menos 8 caracteres y creación automática de sesión en `backend/src/auth/authService.ts`
- [X] T023 [US1] Implementar inicio y cierre de sesión en `backend/src/auth/authService.ts`, incluyendo rechazo `401` para credenciales inválidas y revocación de sesión
- [X] T024 [US1] Crear las rutas `/api/auth/register`, `/api/auth/login` y `/api/auth/logout` en `backend/src/auth/authRoutes.ts` conforme a `specs/001-user-auth-reservations/contracts/api.md`
- [X] T025 [P] [US1] Crear las páginas y componentes de autenticación en `frontend/src/pages/RegisterPage.tsx`, `frontend/src/pages/LoginPage.tsx` y `frontend/src/components/AuthForm.tsx`
- [X] T026 [US1] Integrar el estado de sesión, redirecciones y mensajes de error en `frontend/src/app/routes.tsx` y `frontend/src/app/session.tsx`

**Checkpoint**: US1 es demostrable de forma independiente y deja protegidas las áreas de
disponibilidad y reservas.

---

## Phase 4: User Story 2 - Consultar disponibilidad de una cancha (Priority: P1)

**Goal**: Mostrar el catálogo cerrado y la grilla de 24 bloques horarios con estados
disponible, reservado o no reservable por pasado.

**Independent Test**: Con sesión activa, seleccionar cada cancha y una fecha; verificar los
24 bloques, sus estados y que los horarios pasados no puedan reservarse.

### Tests for User Story 2

- [X] T027 [P] [US2] Crear pruebas de contrato para `GET /api/courts` y `GET /api/courts/:courtId/availability?date=YYYY-MM-DD` en `backend/tests/contract/courts.test.ts`
- [X] T028 [P] [US2] Crear pruebas de integración para catálogo exacto, grilla de 24 bloques, reservas ocupadas y horarios pasados en `backend/tests/integration/availability.test.ts`
- [X] T029 [P] [US2] Crear pruebas de interacción para selección de cancha, fecha y estados de la grilla en `frontend/tests/availability.test.tsx`

### Implementation for User Story 2

- [X] T030 [P] [US2] Implementar consulta del catálogo fijo en `backend/src/courts/courtService.ts` y asegurar que solo existan las cinco canchas definidas
- [X] T031 [US2] Implementar generación de los 24 bloques y cálculo de `available`, `reserved` y `reservable` en `backend/src/courts/availabilityService.ts`, usando la zona horaria local del club
- [X] T032 [US2] Crear las rutas `GET /api/courts` y `GET /api/courts/:courtId/availability` en `backend/src/courts/courtRoutes.ts`, protegiendo la disponibilidad completa con sesión activa
- [X] T033 [P] [US2] Crear el catálogo y selector de canchas en `frontend/src/components/CourtList.tsx` y `frontend/src/pages/AvailabilityPage.tsx`
- [X] T034 [P] [US2] Crear el selector de fecha y la grilla de bloques de una hora en `frontend/src/components/DatePicker.tsx` y `frontend/src/components/AvailabilityGrid.tsx`
- [X] T035 [US2] Integrar estados de carga, vacío, reservado, no reservable y error amigable en `frontend/src/pages/AvailabilityPage.tsx`

**Checkpoint**: US1 y US2 permiten autenticarse y consultar la disponibilidad completa de
las cinco canchas sin crear reservas todavía.

---

## Phase 5: User Story 3 - Crear una reserva (Priority: P1)

**Goal**: Confirmar reservas futuras de una hora sin colisiones y con máximo una reserva
activa por usuario.

**Independent Test**: Confirmar un bloque futuro disponible; intentar reservar el mismo
bloque desde dos sesiones y verificar que solo una operación triunfa; intentar una segunda
reserva con el mismo usuario y verificar el conflicto.

### Tests for User Story 3

- [X] T036 [P] [US3] Crear pruebas de contrato para `POST /api/reservations` en `backend/tests/contract/reservations-create.test.ts`
- [X] T037 [P] [US3] Crear pruebas de integración para fecha pasada, bloque inválido, reserva activa duplicada y revalidación de colisión en `backend/tests/integration/reservation-create.test.ts`
- [X] T038 [P] [US3] Crear prueba de concurrencia que intente reservar la misma cancha/fecha/hora desde dos sesiones en `backend/tests/integration/reservation-concurrency.test.ts`
- [X] T039 [P] [US3] Crear pruebas de interacción para confirmación exitosa, reserva ocupada y mensajes `409` en `frontend/tests/reservation-create.test.tsx`

### Implementation for User Story 3

- [X] T040 [US3] Implementar la transacción de creación y revalidación de sesión, pasado, bloque entero, colisión y reserva activa por usuario en `backend/src/reservations/reservationService.ts`
- [X] T041 [US3] Mapear violaciones de índices únicos a `409 Conflict` y errores de entrada a `400 Bad Request` en `backend/src/reservations/reservationService.ts` y `backend/src/http/errors.ts`
- [X] T042 [US3] Crear `POST /api/reservations` en `backend/src/reservations/reservationRoutes.ts` con el contrato definido en `specs/001-user-auth-reservations/contracts/api.md`
- [X] T043 [US3] Crear el formulario de confirmación de reserva en `frontend/src/components/ReservationForm.tsx` e integrarlo con `frontend/src/pages/AvailabilityPage.tsx`
- [X] T044 [US3] Mostrar confirmación, bloqueo actualizado y mensajes amigables de conflicto en `frontend/src/components/ReservationFeedback.tsx`

**Checkpoint**: US1, US2 y US3 entregan el flujo central completo de autenticación,
consulta y creación segura de reservas.

---

## Phase 6: User Story 4 - Consultar y cancelar mis reservas (Priority: P2)

**Goal**: Mostrar únicamente las reservas propias, conservar canceladas en historial y
permitir cancelar reservas futuras propias.

**Independent Test**: Consultar reservas futuras e históricas, cancelar una futura propia,
verificar que permanece como `Cancelada` y que el bloque se libera; comprobar que no se
pueden cancelar reservas pasadas, canceladas o ajenas.

### Tests for User Story 4

- [X] T045 [P] [US4] Crear pruebas de contrato para `GET /api/reservations` y `POST /api/reservations/:reservationId/cancel` en `backend/tests/contract/reservations-manage.test.ts`
- [X] T046 [P] [US4] Crear pruebas de integración para propiedad, agrupación futura/histórica, cancelación, historial `cancelled` y cancelación repetida en `backend/tests/integration/reservation-manage.test.ts`
- [X] T047 [P] [US4] Crear pruebas de interacción para el panel “Mis reservas” y confirmación de cancelación en `frontend/tests/reservations.test.tsx`

### Implementation for User Story 4

- [X] T048 [US4] Implementar consulta de reservas propias agrupadas en futuras e históricas, mostrando cancha, fecha, hora y estado en `backend/src/reservations/reservationQueryService.ts`
- [X] T049 [US4] Implementar cancelación transaccional de reserva futura propia, conservando el registro con `status = 'cancelled'` y `cancelledAt` en `backend/src/reservations/reservationService.ts`
- [X] T050 [US4] Crear `GET /api/reservations` y `POST /api/reservations/:reservationId/cancel` en `backend/src/reservations/reservationRoutes.ts`, sin exponer reservas de terceros
- [X] T051 [P] [US4] Crear el panel de reservas futuras e historial en `frontend/src/pages/MyReservationsPage.tsx` y `frontend/src/components/ReservationList.tsx`
- [X] T052 [US4] Crear confirmación de cancelación, actualización del historial y liberación visual del bloque en `frontend/src/components/CancelReservationDialog.tsx` y `frontend/src/pages/MyReservationsPage.tsx`

**Checkpoint**: Las cuatro historias quedan funcionales y cada usuario puede gestionar
únicamente sus propias reservas.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validar la solución completa y mantenerla alineada con la constitución.

- [X] T053 [P] Ejecutar los escenarios de `specs/001-user-auth-reservations/quickstart.md` y corregir cualquier diferencia observable
- [X] T054 [P] Revisar que todos los errores visibles en `frontend/src/` sean amigables y que nunca se rendericen stack traces
- [X] T055 [P] Revisar que todas las rutas protegidas usen sesión activa y que la propiedad de reservas se valide en `backend/src/`
- [X] T056 Ejecutar la suite completa de pruebas y comprobar los criterios SC-001 a SC-007 en `backend/tests/` y `frontend/tests/`
- [X] T057 Revisar la estructura final contra `.specify/memory/constitution.md` y confirmar que no se añadieron pagos, administración, notificaciones, reservas múltiples ni matchmaking

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No tiene dependencias; crea los proyectos y herramientas base.
- **Foundational (Phase 2)**: Depende de Setup y bloquea todas las historias.
- **US1 (Phase 3)**: Depende de Foundational; es el primer incremento demostrable.
- **US2 (Phase 4)**: Depende de Foundational y de la sesión de US1 para disponibilidad protegida.
- **US3 (Phase 5)**: Depende de US1 y US2; necesita sesión, catálogo y grilla.
- **US4 (Phase 6)**: Depende de US3 para contar con reservas creadas y cancelables.
- **Polish (Phase 7)**: Depende de las historias que se quieran entregar.

### User Story Dependencies

```text
Foundational
    └── US1: Autenticación
          └── US2: Disponibilidad
                └── US3: Crear reserva
                      └── US4: Mis reservas y cancelación
```

### Parallel Opportunities

- T003–T006 pueden ejecutarse en paralelo después de T002 porque modifican archivos de
  configuración distintos.
- T008, T009, T011, T012, T014, T017 y T018 pueden ejecutarse en paralelo después de T007,
  siempre que sus archivos sean independientes.
- Dentro de cada historia, las pruebas de contrato, integración y UI marcadas `[P]` pueden
  prepararse en paralelo antes de la implementación.
- T025, T033–T034, T043 y T051 son tareas de UI que pueden repartirse después de contar con
  el contrato del backend correspondiente.
- Con varios desarrolladores, US2 puede comenzar después de la sesión base de US1 mientras
  US1 termina su UI; US3 y US4 conservan sus dependencias funcionales indicadas arriba.

## Implementation Strategy

### MVP First

1. Completar Setup y Foundational.
2. Completar US1 para tener registro, login y protección de sesión.
3. Validar US1 de forma independiente.
4. Para el MVP de reservas del club, continuar inmediatamente con US2 y US3, porque la
   autenticación por sí sola no permite consultar ni reservar una cancha.

### Incremental Delivery

1. Setup + Foundational: plataforma mínima lista.
2. US1: autenticación y sesión demostrables.
3. US2: disponibilidad de las cinco canchas.
4. US3: creación segura sin doble reserva.
5. US4: historial y cancelación.
6. Polish: validación final contra quickstart, checklist y constitución.

## Notes

- Todas las tareas usan checkbox, ID secuencial, marcador de paralelismo cuando aplica,
  etiqueta de historia cuando corresponde y una ruta concreta.
- `[P]` indica que la tarea puede ejecutarse en paralelo sin depender de archivos incompletos.
- Las pruebas se incluyen porque el plan y los criterios de éxito exigen validar contratos,
  concurrencia y flujos de usuario.
- No se crea una tarea de recuperación de contraseña, pagos, administración, notificaciones,
  reservas de más de una hora o matchmaking porque están fuera de alcance.

## Phase 8: Convergence

**Purpose**: Cerrar las brechas encontradas al comparar la implementación con la
especificación, el plan y la constitución.

- [X] T058 Ejecutar la migración versionada `db/migrations/001_initial.sql` desde `backend/src/db/connection.ts` para que el esquema de arranque no permanezca duplicado (T007/T008, partial)
- [X] T059 Reutilizar `db/seed.ts` desde `backend/src/db/connection.ts` y conservar allí la siembra exacta de las cinco canchas (T009, partial)
- [X] T060 Añadir una restricción de datos compatible con reservas históricas que impida más de una reserva activa futura por usuario y cubrirla en `backend/tests/integration/reservations.test.ts` (T010, missing)
- [X] T061 Migrar `frontend/tailwind.config.js` y `frontend/postcss.config.js` a configuración ejecutable compatible con TypeScript, o documentar una alternativa TypeScript equivalente, para cumplir la Constitution II (Constitution II, contradicts, CRITICAL)
- [X] T062 Extraer el selector de fecha de `frontend/src/pages/AvailabilityPage.tsx` al componente `frontend/src/components/DatePicker.tsx` y mantener sus pruebas de interacción (T034, partial)
