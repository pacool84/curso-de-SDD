# HTTP API Contract: Autenticación y Reservas

All JSON responses use UTF-8. Error responses use the shape:

```json
{
  "code": "stable_error_code",
  "message": "Mensaje seguro para el usuario"
}
```

The server MUST NOT return stack traces, password hashes or session tokens in response
bodies. Session authentication uses an opaque cookie set by the server.

## Authentication

### `POST /api/auth/register`

Creates an account and starts an authenticated session.

Request:

```json
{
  "email": "user@example.com",
  "password": "correct-horse"
}
```

Responses:

- `201 Created`: `{ "user": { "id": 1, "email": "user@example.com" } }` and a session
  cookie.
- `400 Bad Request`: invalid email or password policy.
- `409 Conflict`: email already registered.

### `POST /api/auth/login`

Authenticates an existing user.

Responses:

- `200 OK`: public user identity and a session cookie.
- `400 Bad Request`: malformed request.
- `401 Unauthorized`: credentials are invalid.

### `POST /api/auth/logout`

Revokes the current session.

Responses:

- `204 No Content`: session revoked.
- `401 Unauthorized`: no active session.

## Courts and availability

### `GET /api/courts`

Returns the immutable five-court catalog. The catalog may be displayed without a session;
full availability remains protected.

Response `200 OK`:

```json
{
  "courts": [
    { "id": 1, "name": "Cancha Laureles" },
    { "id": 2, "name": "Cancha El Poblado" },
    { "id": 3, "name": "Cancha Belén" },
    { "id": 4, "name": "Cancha Robledo" },
    { "id": 5, "name": "Cancha Envigado" }
  ]
}
```

### `GET /api/courts/:courtId/availability?date=YYYY-MM-DD`

Returns the 15 one-hour blocks for the selected court and local date, from 07:00–08:00
through 21:00–22:00. Blocks outside this operating window are not returned.

Responses:

- `200 OK`: `{ "court": {...}, "date": "YYYY-MM-DD", "blocks": [...] }`.
- `400 Bad Request`: invalid date or court identifier.
- `401 Unauthorized`: no active session.
- `404 Not Found`: court does not belong to the closed catalog.

Each block has this shape:

```json
{
  "startHour": 14,
  "endHour": 15,
  "status": "available",
  "reservable": true
}
```

The availability response contains exactly 15 blocks with `startHour` values from 7
through 21. A reservation request with a `startHour` outside that range is invalid and
returns `400 Bad Request`.

`status` is `available` or `reserved`; past blocks have `reservable: false` even when no
reservation exists.

## Reservations

### `POST /api/reservations`

Creates one future, one-hour reservation after revalidating all constraints inside one
transaction.

Request:

```json
{
  "courtId": 1,
  "date": "2026-09-28",
  "startHour": 14
}
```

Responses:

- `201 Created`: created reservation with court, date, time and `active` status.
- `400 Bad Request`: malformed, past or non-hourly block.
- `401 Unauthorized`: no active session.
- `409 Conflict`: court block is occupied or user already has an active reservation.

### `GET /api/reservations`

Returns only the current user's reservations, grouped by future and history. Each item
includes court name, date, start/end time and status. Cancelled reservations remain in
history with status `cancelled`.

Response `200 OK`:

```json
{
  "upcoming": [],
  "history": [
    {
      "id": 10,
      "courtName": "Cancha Laureles",
      "date": "2026-09-20",
      "startHour": 14,
      "endHour": 15,
      "status": "cancelled"
    }
  ]
}
```

`401 Unauthorized` is returned without an active session.

### `POST /api/reservations/:reservationId/cancel`

Cancels a future active reservation owned by the current user. It changes the status to
`cancelled` rather than deleting the record.

Responses:

- `200 OK`: cancelled reservation, including its court, date, time and status.
- `401 Unauthorized`: no active session.
- `404 Not Found`: reservation is not owned by the user or does not exist.
- `409 Conflict`: reservation is already cancelled or has already become historical.
