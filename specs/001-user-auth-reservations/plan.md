# Implementation Plan: Autenticación y Reservas de Canchas

**Branch**: `001-user-auth-reservations` | **Date**: 2026-10-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-user-auth-reservations/spec.md`

## Summary

Construir una aplicación web TypeScript para registrar usuarios, mantener sesiones,
consultar la disponibilidad de las cinco canchas y gestionar reservas de una hora. El
backend Express usará SQLite local con acceso SQL directo y transacciones para garantizar
que nunca exista doble reserva ni más de una reserva activa por usuario. React y Tailwind
proporcionarán las pantallas de autenticación, disponibilidad y “Mis reservas”.

## Technical Context

**Language/Version**: TypeScript 5.x en frontend y backend

**Primary Dependencies**: React, Tailwind CSS, Node.js, Express, `better-sqlite3`,
`bcryptjs`, Vitest, React Testing Library y Supertest

**Storage**: SQLite local en `db/padel.db`, con tablas de usuarios, sesiones, reservas y
catálogo fijo de canchas

**Testing**: Vitest para pruebas unitarias e integración; React Testing Library para
interacción de UI; Supertest para contratos HTTP; pruebas de concurrencia sobre reservas

**Target Platform**: Navegador web moderno y servidor Node.js local

**Project Type**: Aplicación web con frontend y backend

**Performance Goals**: Las consultas de disponibilidad y las acciones de reserva deben
responder normalmente en menos de 1 segundo; una cancelación debe reflejarse en nuevas
consultas en menos de 5 segundos.

**Constraints**: El catálogo contiene exactamente cinco canchas; cada reserva dura una
hora; solo hay una reserva activa por usuario; toda reserva requiere sesión; la
disponibilidad diaria se limita a 15 bloques entre 07:00 y 22:00, con inicios válidos de
07:00 a 21:00; las fechas y horas usan la zona horaria local del club; no se permiten
ORMs pesados ni servicios externos.

**Scale/Scope**: Una instancia local, cinco canchas, 15 bloques diarios por cancha y un
volumen inicial pequeño de usuarios; no se diseña escalado horizontal en esta iteración.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Stack y lenguaje**: PASS. El plan usa TypeScript, React, Tailwind, Node.js, Express y
  SQLite con `better-sqlite3`.
- **Estructura plana**: PASS. El código se limitará a `/frontend`, `/backend` y `/db`, sin
  capas arquitectónicas innecesarias.
- **Catálogo cerrado y tiempo**: PASS. Las cinco canchas se definirán como datos fijos y
  los 15 bloques serán de una hora en formato de 24 horas, desde 07:00–08:00 hasta
  21:00–22:00.
- **Prevención de colisiones**: PASS. La creación validará disponibilidad dentro de una
  transacción y contará con índices únicos de integridad.
- **Autenticación**: PASS. Las rutas protegidas exigirán una sesión activa.
- **Errores**: PASS. Se usarán respuestas 400, 401 y 409 según la causa, con mensajes
  amigables en la UI y sin stack traces.
- **Cero código sombra**: PASS. El diseño cubre únicamente los requisitos de `spec.md`;
  pagos, administración, notificaciones, reservas múltiples y matchmaking quedan fuera.

## Project Structure

### Documentation (this feature)

```text
specs/001-user-auth-reservations/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── api.md
└── tasks.md                    # generado por $speckit-tasks
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── auth/
│   ├── reservations/
│   ├── courts/
│   ├── db/
│   └── server.ts
└── tests/
    ├── integration/
    └── unit/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── app/
└── tests/

db/
├── migrations/
└── seed.ts
```

**Structure Decision**: Se adopta la estructura web con `/frontend`, `/backend` y `/db`
exigida por la constitución. El backend mantiene módulos funcionales pequeños, el acceso
SQL queda en `/backend/src/db` y el archivo persistido vive en `/db/padel.db`. No se añade
una capa de repositorios o Clean Architecture.

## Complexity Tracking

No hay violaciones de la constitución que requieran justificación.
