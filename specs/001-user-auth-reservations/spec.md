# Feature Specification: Autenticación y Reservas de Canchas

**Feature Branch**: `001-user-auth-reservations`

**Created**: 2026-09-20

**Status**: Draft

**Input**: User description: "Autenticación de usuarios, exploración de canchas,
creación y gestión de reservas de pádel"

## Clarifications

### Session 2026-09-26

- Q: Después de cancelar una reserva futura, ¿debe permanecer visible en “Mis reservas”
  con estado “Cancelada”? → A: Sí; la reserva permanece visible en el historial con
  estado “Cancelada”.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrarse e iniciar sesión (Priority: P1)

Como visitante, quiero registrarme con mi correo electrónico y contraseña e iniciar sesión
para acceder de forma segura a la disponibilidad y a mis reservas.

**Why this priority**: La sesión activa es un requisito para consultar la disponibilidad
completa y para cualquier operación de reserva.

**Independent Test**: Se puede probar creando una cuenta, cerrando la sesión e iniciándola
nuevamente con credenciales válidas, y verificando que las áreas protegidas cambian de
acceso según el estado de la sesión.

**Acceptance Scenarios**:

1. **Given** un visitante sin cuenta, **When** proporciona un correo válido y una
   contraseña válida, **Then** el sistema crea su cuenta y establece una sesión activa.
2. **Given** un usuario registrado, **When** proporciona credenciales válidas,
   **Then** el sistema inicia su sesión y le permite acceder a la disponibilidad completa.
3. **Given** un usuario registrado, **When** proporciona credenciales inválidas,
   **Then** el sistema rechaza el acceso y muestra un mensaje amigable sin revelar
   información sensible.
4. **Given** un visitante sin sesión activa, **When** intenta consultar la disponibilidad
   completa o reservar, **Then** el sistema solicita autenticarse.

---

### User Story 2 - Consultar disponibilidad de una cancha (Priority: P1)

Como usuario autenticado, quiero seleccionar una de las cinco canchas y una fecha para
consultar sus bloques horarios disponibles o reservados.

**Why this priority**: La consulta de disponibilidad es el paso necesario para elegir un
turno válido y evitar intentos de reserva sobre horarios ocupados.

**Independent Test**: Se puede probar iniciando sesión, seleccionando cada cancha y una
fecha, y verificando que se muestra una grilla de 24 bloques de una hora con su estado.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado, **When** abre el catálogo de canchas, **Then** ve
   exactamente Cancha Laureles, Cancha El Poblado, Cancha Belén, Cancha Robledo y
   Cancha Envigado.
2. **Given** una cancha seleccionada, **When** el usuario elige una fecha válida,
   **Then** el sistema muestra los 24 bloques de una hora de ese día.
3. **Given** que existe una reserva en un bloque, **When** el usuario consulta esa fecha
   y cancha, **Then** el bloque aparece claramente como “Reservado”.
4. **Given** que no existe una reserva en un bloque futuro, **When** el usuario consulta
   esa fecha y cancha, **Then** el bloque aparece claramente como “Disponible”.
5. **Given** una fecha u hora pasada, **When** el usuario consulta la grilla,
   **Then** esos bloques no se presentan como reservables.

---

### User Story 3 - Crear una reserva (Priority: P1)

Como usuario autenticado, quiero seleccionar un bloque disponible y confirmar una reserva
de una hora para asegurar mi turno.

**Why this priority**: Crear una reserva es el valor central del sistema y debe proteger la
integridad de los horarios compartidos.

**Independent Test**: Se puede probar seleccionando un bloque futuro disponible y
confirmándolo, y luego verificando que la reserva aparece en las reservas propias y que el
bloque deja de estar disponible.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado sin reserva activa, **When** confirma un bloque futuro
   disponible de una hora, **Then** el sistema crea la reserva y muestra una confirmación.
2. **Given** que otro usuario reserva el bloque después de que fue visualizado,
   **When** el primer usuario intenta confirmar ese mismo bloque, **Then** la operación es
   rechazada, no se crea ninguna reserva y se muestra que el horario ya fue reservado.
3. **Given** un usuario con una reserva activa, **When** intenta crear otra reserva,
   **Then** el sistema rechaza la operación y explica que solo puede tener una reserva
   activa a la vez.
4. **Given** un bloque pasado o una selección que no representa una hora completa,
   **When** el usuario intenta confirmar, **Then** el sistema rechaza la operación y
   muestra un mensaje claro.

---

### User Story 4 - Consultar y cancelar mis reservas (Priority: P2)

Como usuario autenticado, quiero consultar mis reservas futuras y pasadas y cancelar una
reserva futura para mantener mi agenda actualizada.

**Why this priority**: La gestión posterior permite al usuario controlar su propia agenda
sin acceder ni modificar reservas de otras personas.

**Independent Test**: Se puede probar consultando una reserva propia futura y una pasada,
verificando sus datos, y cancelando la futura para confirmar que el turno vuelve a quedar
disponible.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado, **When** abre “Mis reservas”, **Then** ve sus reservas
   futuras y su historial de reservas pasadas, cada una con cancha, fecha y hora.
2. **Given** una reserva futura propia, **When** el usuario la selecciona y confirma la
   cancelación, **Then** la reserva queda cancelada, permanece visible en el historial
   con estado “Cancelada” y el bloque puede volver a mostrarse como disponible.
3. **Given** una reserva de otro usuario, **When** el usuario intenta verla o cancelarla,
   **Then** el sistema no permite acceder ni modificarla.
4. **Given** una reserva pasada propia, **When** el usuario la consulta,
   **Then** puede verla en su historial, pero no puede cancelarla.

### Edge Cases

- Dos usuarios pueden intentar confirmar el mismo bloque casi simultáneamente; solo una
  confirmación puede tener éxito y la otra debe recibir un conflicto amigable.
- Un correo ya registrado debe impedir la creación de una cuenta duplicada y mostrar una
  instrucción útil para iniciar sesión.
- Un correo con formato inválido, una contraseña vacía o una selección incompleta deben
  rechazarse antes de completar la operación.
- Si el usuario pierde su sesión antes de confirmar o cancelar, la operación debe
  rechazarse y solicitar un nuevo inicio de sesión.
- Si una fecha no tiene reservas, la grilla debe mostrar todos sus bloques futuros como
  disponibles y los bloques pasados como no reservables.
- Una cancelación repetida o sobre una reserva ya cancelada debe dejar el estado consistente
  y mostrar un mensaje claro.
- El cambio de día debe respetar el límite entre las 23:00 y las 00:00 sin crear bloques
  de más de una hora ni duplicar horarios.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST permitir registrar una cuenta con correo electrónico y contraseña.
- **FR-002**: System MUST validar que el correo tenga un formato válido y que la contraseña
  cumpla el mínimo definido para el producto antes de crear la cuenta.
- **FR-003**: System MUST impedir cuentas duplicadas para el mismo correo y mostrar un
  mensaje amigable.
- **FR-004**: System MUST permitir iniciar y cerrar sesión con las credenciales registradas.
- **FR-005**: System MUST restringir la visualización de la disponibilidad completa y todas
  las operaciones de reserva a usuarios con sesión activa.
- **FR-006**: System MUST listar exactamente las cinco canchas del catálogo cerrado:
  Cancha Laureles, Cancha El Poblado, Cancha Belén, Cancha Robledo y Cancha Envigado.
- **FR-007**: System MUST permitir seleccionar una fecha y una cancha para consultar sus
  bloques horarios.
- **FR-008**: System MUST mostrar 24 bloques consecutivos de una hora, expresados en formato
  de 24 horas, con estado “Disponible” o “Reservado” cuando corresponda.
- **FR-009**: System MUST impedir que fechas y horarios pasados puedan reservarse.
- **FR-010**: System MUST permitir confirmar únicamente bloques completos de una hora que
  estén disponibles.
- **FR-011**: System MUST revalidar la disponibilidad inmediatamente antes de confirmar
  una reserva.
- **FR-012**: System MUST rechazar con un mensaje claro cualquier confirmación que colisione
  con una reserva existente y MUST evitar que se persista la reserva rechazada.
- **FR-013**: System MUST limitar a una el número de reservas activas por usuario.
- **FR-014**: System MUST permitir que cada usuario consulte únicamente sus propias
  reservas, separadas entre futuras e históricas, mostrando cancha, fecha, hora y estado.
- **FR-015**: System MUST permitir cancelar una reserva futura propia después de una
  confirmación explícita y MUST conservarla en el historial con estado “Cancelada”.
- **FR-016**: System MUST impedir la cancelación de reservas pasadas, de reservas de terceros
  y de reservas que ya no estén activas.
- **FR-017**: System MUST traducir errores técnicos y conflictos a mensajes amigables sin
  exponer detalles internos al usuario.
- **FR-018**: System MUST mantener disponibles las reglas de acceso, propiedad y colisión
  aunque dos usuarios interactúen con el mismo horario simultáneamente.

### Key Entities *(include if feature involves data)*

- **Usuario**: Persona registrada que se identifica mediante un correo electrónico y una
  contraseña, y que puede mantener una sesión activa.
- **Cancha**: Espacio reservado perteneciente al catálogo fijo de cinco canchas, identificado
  por su nombre.
- **Reserva**: Asignación de una cancha a un usuario en una fecha y un bloque completo de
  una hora, con estado activa, cancelada o histórica según corresponda.
- **Bloque horario**: Intervalo de una hora dentro de un día, expresado en formato de 24
  horas y asociado a una cancha.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Al menos el 95% de los usuarios de prueba pueden registrarse e iniciar
  sesión correctamente en menos de 2 minutos.
- **SC-002**: El 100% de los usuarios autenticados de prueba pueden identificar una cancha,
  una fecha y el estado de sus 24 bloques horarios sin asistencia externa.
- **SC-003**: El 100% de los intentos de confirmación sobre bloques ocupados son rechazados
  sin crear reservas duplicadas, incluso durante pruebas con acciones simultáneas.
- **SC-004**: Al menos el 95% de los usuarios de prueba pueden completar una reserva futura
  válida en menos de 3 minutos desde el inicio de sesión.
- **SC-005**: El 100% de las cuentas de prueba solo puede consultar y gestionar sus propias
  reservas, y nunca las de otros usuarios.
- **SC-006**: Al menos el 95% de las cancelaciones futuras confirmadas liberan el bloque
  para futuras consultas en menos de 5 segundos.
- **SC-007**: El 100% de los intentos sobre fechas pasadas, bloques incompletos o usuarios
  sin sesión recibe una respuesta comprensible y ninguna reserva inválida queda creada.

## Assumptions

- La contraseña debe tener al menos 8 caracteres; el producto no incluye recuperación de
  contraseña en esta iteración.
- Una “reserva activa” es una reserva futura no cancelada; las reservas pasadas y las
  reservas canceladas permanecen visibles como historial.
- La grilla de un día contiene los bloques de 00:00–01:00 hasta 23:00–00:00; un bloque
  cuyo inicio coincide con la hora actual se considera no reservable si ya comenzó.
- Las fechas y horas se interpretan según la zona horaria local del club.
- El catálogo de canchas es inmutable y no requiere una interfaz para administrarlo.
- El pago se realiza presencialmente y no forma parte de este feature.

## Out of Scope

- Pasarela o procesamiento de pagos integrados.
- Panel web de administración para crear, editar o eliminar canchas.
- Notificaciones externas por correo, SMS o WhatsApp.
- Reservas de más de una hora continua en una sola operación.
- Matchmaking, búsqueda de compañeros de juego o gestión de torneos.
