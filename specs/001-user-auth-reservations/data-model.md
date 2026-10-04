# Data Model: Autenticación y Reservas de Canchas

## User

Represents a registered person who may hold one active reservation.

| Field | Type | Rules |
|---|---|---|
| `id` | integer | Primary key, generated locally |
| `email` | text | Required, normalized to lowercase, unique |
| `passwordHash` | text | Required; never store the original password |
| `createdAt` | timestamp | Required |

Validation: email format is checked before creation; password has at least 8 characters;
duplicate email returns a friendly validation/conflict error.

## Session

Represents an active login for a user.

| Field | Type | Rules |
|---|---|---|
| `id` | integer | Primary key |
| `userId` | integer | Required foreign key to `User` |
| `tokenHash` | text | Required, unique; only its hash is persisted |
| `expiresAt` | timestamp | Required |
| `createdAt` | timestamp | Required |
| `revokedAt` | timestamp/null | Set when the user logs out |

An active session has no `revokedAt` and has not expired. Protected operations reject
missing, revoked or expired sessions.

## Court

Represents one fixed court in the closed catalog.

| Field | Type | Rules |
|---|---|---|
| `id` | integer | Stable primary key |
| `name` | text | Required and unique |

The seed contains exactly these names: Cancha Laureles, Cancha El Poblado, Cancha Belén,
Cancha Robledo and Cancha Envigado. No feature in this iteration can create, edit or
delete a court.

## Reservation

Represents one one-hour assignment of a court to a user.

| Field | Type | Rules |
|---|---|---|
| `id` | integer | Primary key |
| `userId` | integer | Required foreign key to `User` |
| `courtId` | integer | Required foreign key to `Court` |
| `date` | text | Required, `YYYY-MM-DD` in club local time |
| `startHour` | integer | Required, range 7..21; represents a block ending no later than 22:00 |
| `status` | text | `active` or `cancelled` |
| `createdAt` | timestamp | Required |
| `cancelledAt` | timestamp/null | Required when status is `cancelled` |

The end time is derived as `startHour + 1`; no multi-hour reservation is stored. Only
blocks from 07:00–08:00 through 21:00–22:00 are valid; blocks outside the operating
window are not displayed or reservable. A past active reservation is treated as historical
for display but is not cancellable. A cancelled reservation remains visible in the user's
history and releases its court block.

## Relationships and integrity rules

- One `User` has many historical reservations and at most one `Reservation` with
  `status = active`.
- One `Court` has many reservations over different dates and hours.
- One active court/date/start-hour combination can belong to at most one active reservation.
- A reservation can be created only when its session is active, its block is not in the
  past, its `startHour` is between 7 and 21, and no active reservation conflicts with the
  same court/date/start-hour.
- Reservation creation and its conflict checks occur in one database transaction.
- Suggested database constraints:
  - unique normalized user email;
  - unique active court/date/start-hour combination;
  - unique active reservation per user using a partial unique index;
  - check `startHour BETWEEN 7 AND 21`;
  - check `status IN ('active', 'cancelled')`.

## State transitions

```text
active ── cancel future reservation ──> cancelled
active ── time passes ────────────────> historical display (same stored active record)
cancelled ── repeated cancel attempt ─> rejected; state unchanged
```

Historical display is derived from the reservation date/time and status; it is not a third
write state. This keeps the model small while preserving the user's history.
