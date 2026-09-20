# Sistema de Reservas de Pádel Constitution

## Core Principles

### I. Alcance de Dominio Cerrado

El sistema MUST gestionar exclusivamente las cinco canchas fijas: Cancha Laureles,
Cancha El Poblado, Cancha Belén, Cancha Robledo y Cancha Envigado. Las reservas MUST
operar con bloques de tiempo expresados en formato de 24 horas. No se MUST introducir
entidades, funcionalidades o flujos de negocio fuera del alcance documentado en `spec.md`.
Esta restricción mantiene el producto simple y evita que se construya código no solicitado.

### II. Stack TypeScript y Estructura Plana

Todo el código MUST estar escrito en TypeScript. La interfaz MUST usar React y Tailwind
CSS; el backend MUST usar Node.js con Express; la persistencia MUST usar SQLite local en
`padel.db`, mediante `better-sqlite3` o sentencias SQL puras, sin ORMs pesados. El código
MUST organizarse de forma plana en `/frontend`, `/backend` y `/db`, evitando Clean
Architecture y patrones complejos. La estructura favorece el mantenimiento directo y
reduce la sobreingeniería.

### III. Reservas Sin Colisiones y Con Sesión

Toda operación de reserva MUST requerir un usuario autenticado con sesión activa. Antes
de escribir cualquier reserva, el backend MUST validar que la cancha seleccionada esté
libre durante el bloque solicitado. Bajo ninguna circunstancia se puede persistir una
reserva que colisione con otra; los conflictos MUST responder con HTTP `409 Conflict`.
Esta es la garantía crítica de integridad del sistema.

### IV. Validación y Errores Orientados al Usuario

El backend MUST validar las entradas y devolver códigos HTTP semánticos: `400` para
peticiones inválidas, `401` para solicitudes no autenticadas y `409` para conflictos de
reserva. La interfaz MUST traducir los errores técnicos a mensajes amigables y MUST
ocultar stack traces y detalles internos. Los mensajes MUST explicar acciones útiles,
por ejemplo: “La cancha ya fue reservada en este horario”.

### V. Simplicidad Funcional y Convenciones Consistentes

La implementación MUST priorizar funciones puras, componentes funcionales y Hooks de
React; las clases solo se permiten cuando una dependencia las exija. Las funciones y
variables MUST usar `camelCase`, y las interfaces y tipos MUST usar `PascalCase`. Cada
decisión de diseño MUST justificar su complejidad frente a una solución más simple, para
mantener el sistema fácil de entender y probar.

## Technology and Structure Constraints

La solución MUST respetar el stack y la estructura definidos en los principios. La base
de datos local será el archivo `padel.db` dentro del ámbito de `/db`. No se MUST añadir
pasarelas de pago, perfiles complejos, integraciones externas u otras capacidades “por si
acaso”. La fuente de verdad para cualquier funcionalidad es `spec.md`; si una solicitud
contradice esta constitución o revela una falla lógica en la especificación, el trabajo
MUST detenerse y MUST solicitar la actualización de `spec.md` antes de modificar código.

## Development Workflow and Quality Gates

Cada cambio MUST poder rastrearse a una necesidad documentada en `spec.md`. Antes de
considerar una funcionalidad terminada, se MUST verificar la autenticación del flujo de
reserva, la validación previa a la escritura, la prevención de doble reserva, los códigos
HTTP semánticos y la traducción de errores en la UI. Las revisiones MUST comprobar el
catálogo cerrado, el stack, la estructura plana y las convenciones de nomenclatura. No se
aceptan cambios que introduzcan código sombra o que omitan las validaciones críticas.

## Governance

Esta constitución prevalece sobre prácticas locales en conflicto. Toda enmienda MUST
documentar su impacto, actualizar la versión y conservar la fecha de última modificación.
Los cambios que eliminen o redefinan reglas existentes requieren un incremento MAJOR;
los que agreguen un principio o amplíen materialmente una regla requieren MINOR; las
aclaraciones sin cambio semántico requieren PATCH. La fecha de ratificación representa la
adopción original y no cambia con enmiendas; la fecha de última enmienda MUST actualizarse
cuando cambie el contenido.

Cada revisión de especificación, plan, tareas o código MUST comprobar el cumplimiento de
esta constitución. Si existe una contradicción entre una petición y la constitución, el
cambio MUST detenerse: primero se MUST enmendar la constitución y/o `spec.md` con su
justificación. El cumplimiento se revisa antes de aceptar cualquier implementación.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): provide original adoption date | **Last Amended**: 2026-09-20
