# Quickstart: Ejecutar y validar Autenticación y Reservas

Esta guía explica cómo ejecutar el backend y el frontend localmente, y cómo validar los
flujos descritos en [spec.md](./spec.md). Los comandos están escritos para macOS/Linux
con una terminal compatible con `bash` o `zsh`.

## Prerequisites

- Node.js 20 o superior.
- npm 10 o superior.
- Git.
- Puertos `3000` y `5173` disponibles.

La base de datos SQLite se crea automáticamente en `db/padel.db` cuando inicia el backend.
El backend también inicializa las cuatro tablas y siembra las cinco canchas fijas.

## 1. Instalar dependencias

Desde la raíz del repositorio:

```bash
cd "/Users/pacool84/Documents/Cursos de Platzi/Curso Spec Driven Development/my-project"
npm install --prefix backend
npm install --prefix frontend
```

El primer comando raíz `npm install` no es necesario porque el proyecto raíz solo contiene
scripts; las dependencias viven en `backend/` y `frontend/`.

## 2. Ejecutar el backend

Abre una primera terminal en la raíz del repositorio:

```bash
cd "/Users/pacool84/Documents/Cursos de Platzi/Curso Spec Driven Development/my-project/backend"
DATABASE_PATH=../db/padel.db PORT=3000 npm run dev
```

Resultado esperado:

```text
Padel reservations backend listening on port 3000
```

El backend expone la API en `http://localhost:3000`. Puedes comprobar que el catálogo está
disponible con:

```bash
curl http://localhost:3000/api/courts
```

La respuesta debe contener exactamente Cancha Laureles, Cancha El Poblado, Cancha Belén,
Cancha Robledo y Cancha Envigado.

## 3. Ejecutar el frontend

Mantén el backend ejecutándose y abre una segunda terminal:

```bash
cd "/Users/pacool84/Documents/Cursos de Platzi/Curso Spec Driven Development/my-project/frontend"
npm run dev
```

Abre la URL mostrada por Vite, normalmente:

```text
http://localhost:5173
```

El frontend está configurado para reenviar automáticamente las solicitudes `/api` a
`http://localhost:3000`. Por eso no se debe abrir el frontend con `file://` ni configurar
una URL de API manual para el desarrollo local.

## 4. Flujo manual de validación

### Registro y sesión

1. Abre `http://localhost:5173`.
2. Selecciona “Crear una cuenta”.
3. Registra un correo válido y una contraseña de al menos 8 caracteres.
4. Confirma que la sesión inicia automáticamente.
5. Cierra sesión y verifica que las áreas protegidas vuelven a solicitar autenticación.

Las credenciales inválidas y los correos duplicados deben mostrar mensajes amigables sin
stack traces ni detalles internos.

### Disponibilidad

1. Con sesión activa, selecciona una de las cinco canchas.
2. Selecciona una fecha futura.
3. Confirma que aparecen 15 bloques de una hora, desde 07:00–08:00 hasta 21:00–22:00,
   en formato de 24 horas.
4. Verifica que los bloques libres muestran “Disponible” y los ocupados “Reservado”.
5. Confirma que no aparecen bloques anteriores a las 07:00 ni posteriores o iguales a las
   22:00.
6. Consulta el día actual y confirma que los horarios ya transcurridos no pueden reservarse.

### Crear reserva y evitar colisiones

1. Selecciona un bloque futuro disponible y confirma la reserva.
2. Comprueba que el bloque deja de estar disponible.
3. Usa dos sesiones para intentar confirmar simultáneamente el mismo bloque.
4. Confirma que solo una solicitud tiene éxito y la otra recibe un conflicto amigable.
5. Intenta crear una segunda reserva con el usuario ganador.

La segunda reserva del mismo usuario debe rechazarse porque solo puede existir una reserva
activa por usuario.

### Mis reservas y cancelación

1. Abre “Mis reservas”.
2. Confirma que la reserva propia aparece con cancha, fecha, hora y estado.
3. Cancela una reserva futura y confirma la acción.
4. Verifica que permanece en el historial con estado “Cancelada”.
5. Comprueba que el bloque vuelve a estar disponible.

## 5. Ejecutar pruebas y build

Desde la raíz del repositorio, con o sin los servidores de desarrollo ejecutándose:

```bash
npm test
npm run build
```

`npm test` ejecuta las pruebas de contrato e integración del backend y las pruebas de UI
del frontend. `npm run build` compila TypeScript y genera el build de producción del
frontend.

También puedes ejecutar cada parte por separado:

```bash
npm --prefix backend test
npm --prefix frontend test
npm --prefix backend run build
npm --prefix frontend run build
```

## Solución de problemas

- **El puerto 3000 está ocupado**: inicia el backend con otro puerto y ajusta el proxy de
  Vite en `frontend/vite.config.ts`.
- **El frontend muestra errores de conexión**: confirma que el backend sigue ejecutándose
  en el puerto 3000 y que abriste el frontend en `http://localhost:5173`.
- **La base parece vacía**: detén el backend, confirma que usaste
  `DATABASE_PATH=../db/padel.db` desde `backend/` y vuelve a iniciarlo.
- **Falla la instalación de `better-sqlite3`**: verifica Node.js/npm y las herramientas de
  compilación nativas de tu sistema operativo.
- **Quieres reiniciar los datos locales**: detén el backend y elimina únicamente
  `db/padel.db`; se recreará al iniciar. Este archivo está ignorado por Git.

## Contract references

- HTTP request and response shapes: [contracts/api.md](./contracts/api.md)
- Entity constraints and transitions: [data-model.md](./data-model.md)
- Product acceptance scenarios: [spec.md](./spec.md)
