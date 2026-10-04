# Research: Autenticación y Reservas de Canchas

## Decisión 1: Sesiones locales persistidas en SQLite

**Decision**: Mantener sesiones mediante un identificador opaco en una cookie y una fila
correspondiente en SQLite, con expiración y revocación al cerrar sesión.

**Rationale**: El proyecto es local, tiene una sola instancia y ya requiere SQLite. Esta
opción evita depender de un servicio externo, permite invalidar sesiones explícitamente y
mantiene la información de autenticación en el backend. La cookie no debe contener datos
de usuario ni credenciales.

**Alternatives considered**: Guardar tokens de sesión en `localStorage` se descarta porque
expone credenciales de sesión a scripts del navegador. Un proveedor externo de identidad se
descarta por estar fuera del alcance y añadir una integración no requerida.

## Decisión 2: Hash de contraseñas, nunca contraseñas en texto plano

**Decision**: Persistir únicamente un hash de la contraseña usando `bcryptjs`, comparando
la contraseña recibida contra el hash durante el inicio de sesión.

**Rationale**: La especificación exige autenticación con contraseña y la constitución exige
no exponer información sensible. Un hash con sal evita guardar la contraseña original y es
adecuado para el alcance local sin añadir un servicio de identidad.

**Alternatives considered**: Guardar contraseñas directamente se descarta por inseguro.
OAuth y recuperación de contraseña se descartan porque no forman parte de esta iteración.

## Decisión 3: Integridad de reservas en una transacción

**Decision**: Crear una reserva dentro de una transacción SQLite que valide sesión, fecha,
estado activo, colisión de cancha y límite de una reserva activa por usuario. La base de
datos tendrá índices únicos parciales para reforzar ambas invariantes.

**Rationale**: Una validación separada de la escritura deja una ventana de carrera entre
dos usuarios. La transacción y los índices hacen que la regla crítica de no doble reserva
sea verificable incluso bajo acciones simultáneas.

**Alternatives considered**: Confiar solo en una comprobación previa de la interfaz se
descarta porque no protege contra solicitudes concurrentes. Un bloqueo distribuido se
descarta porque el proyecto usa una sola instancia local y no requiere infraestructura
externa.

## Decisión 4: Representación de bloques de tiempo

**Decision**: Representar cada reserva con `date` en formato `YYYY-MM-DD`, `startHour` como
entero de 7 a 21 y duración fija de una hora. La grilla genera 15 bloques, desde
07:00–08:00 hasta 21:00–22:00; los bloques fuera de esa ventana no se muestran. Los
bloques se interpretan en la zona horaria local del club.

**Rationale**: La especificación solo permite bloques enteros de una hora y una grilla
diaria acotada al horario operativo del club. Separar fecha y hora facilita validar pasado,
generar los 15 bloques y aplicar índices únicos sin introducir intervalos arbitrarios.

**Alternatives considered**: Mantener 24 bloques de 00:00 a 24:00 se descarta porque
expondría horarios fuera de operación. Guardar rangos libres de inicio y fin permitiría
duraciones no permitidas y aumentaría la complejidad. Guardar timestamps UTC sin una
política de zona horaria explícita podría mostrar bloques incorrectos alrededor del cambio
de día.

## Decisión 5: Catálogo fijo sembrado por el backend

**Decision**: Definir las cinco canchas como datos iniciales inmutables y exponerlas para
consulta sin crear una funcionalidad administrativa.

**Rationale**: Cumple el catálogo cerrado y permite que reservas e interfaz usen
identificadores consistentes. La ausencia de operaciones de alta, edición o eliminación
mantiene el alcance dentro de `spec.md`.

**Alternatives considered**: Un CRUD administrativo se descarta explícitamente como
non-goal. Permitir nombres libres en reservas se descarta porque rompería la identidad del
catálogo.

## Decisión 6: Contratos HTTP simples y errores semánticos

**Decision**: Exponer rutas REST mínimas para autenticación, canchas, disponibilidad y
reservas. Las respuestas de error contendrán un código estable y un mensaje seguro para la
interfaz.

**Rationale**: El frontend y backend se pueden probar de forma independiente y la UI puede
traducir conflictos sin mostrar detalles internos. Los códigos 400, 401 y 409 se alinean
con la constitución.

**Alternatives considered**: GraphQL o una capa de API más amplia se descartan por
sobreingeniería para el catálogo y los flujos de esta iteración.
