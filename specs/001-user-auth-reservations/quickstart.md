# Quickstart: Validación de Autenticación y Reservas

Esta guía valida los flujos descritos en [spec.md](./spec.md) sin depender de servicios
externos. Los comandos exactos de instalación se concretarán cuando se creen los proyectos
de `/frontend` y `/backend`; los escenarios y resultados esperados son obligatorios.

## Prerequisites

- Node.js y npm disponibles localmente.
- Dependencias del frontend y backend instaladas.
- Base SQLite local inicializada con las cinco canchas.
- Servidor backend y frontend ejecutándose en modo desarrollo.

## Automated validation

Run the complete test suite from the repository root:

```bash
npm test
```

Expected result: unit, integration, HTTP contract and UI tests pass, including the
concurrency test that attempts to reserve the same court/date/hour from two sessions.

## Manual end-to-end scenarios

### 1. Registration and session protection

1. Open the application without a session.
2. Confirm that the five-court catalog can be identified but full availability and booking
   actions require authentication.
3. Register with a valid email and an eight-character-or-longer password.
4. Confirm that the session starts and the availability screen is accessible.
5. Log out and confirm that protected views and actions require login again.

Expected result: invalid credentials and duplicate emails show friendly messages without
revealing sensitive details.

### 2. Availability grid

1. Choose each of the five courts.
2. Choose a future date.
3. Confirm that the grid shows exactly 24 one-hour blocks using 24-hour notation.
4. Verify that occupied blocks show “Reservado” and free future blocks show “Disponible”.
5. Choose the current date and verify that past blocks cannot be reserved.

Expected result: the displayed court names match the closed catalog exactly.

### 3. Successful reservation

1. Use an authenticated user with no active reservation.
2. Select a future available one-hour block.
3. Confirm the reservation.
4. Open “Mis reservas”.

Expected result: the reservation is listed with court, date, time and active status; the
same block is no longer available.

### 4. Collision and one-active-reservation rules

1. Open the same future block from two authenticated users.
2. Submit both confirmations as close together as possible.
3. Confirm that exactly one request succeeds and the other receives a friendly conflict.
4. From the successful user, attempt a second reservation.

Expected result: no duplicate active reservations exist and the second reservation is
rejected because the user already has an active reservation.

### 5. Cancellation and history

1. From “Mis reservas”, select a future reservation owned by the current user.
2. Confirm cancellation.
3. Refresh the list and availability grid.

Expected result: the reservation remains in history with status “Cancelada”, the block can
be reserved again, and a past or third-party reservation cannot be cancelled.

## Contract references

- HTTP request and response shapes: [contracts/api.md](./contracts/api.md)
- Entity constraints and transitions: [data-model.md](./data-model.md)
- Product acceptance scenarios: [spec.md](./spec.md)
