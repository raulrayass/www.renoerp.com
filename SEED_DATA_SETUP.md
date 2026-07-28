# RenoERP - Guía de Datos de Prueba

## Estado Actual ✅

La aplicación **está completamente funcional** y lista para testing. Se han creado endpoints para inyectar datos de prueba.

## Credenciales de Prueba

```
Email: lafuentezapopan@gmail.com
Password: liberacion296
```

## Endpoints Disponibles

### 1. `/api/admin/check-db` 
Verifica la estructura de la base de datos.

**Respuesta**: Muestra todas las tablas y columnas existentes.

```bash
curl http://localhost:3000/api/admin/check-db
```

### 2. `/api/admin/simple-seed`
Crea un evento de prueba para el usuario.

**Funcionalidad**:
- Obtiene el usuario del email de prueba
- Crea un evento llamado "Permanence Camp 2024"
- Vincula el evento al usuario como administrador

**Respuesta**:
```json
{
  "success": true,
  "event": {
    "id": 8,
    "name": "Permanence Camp 2024",
    "adminId": "F3ZlHg3xlJasGWOVQ8NSkyHDBR3BvJLw"
  }
}
```

```bash
curl http://localhost:3000/api/admin/simple-seed
```

## Cómo Usar

### Paso 1: Acceder a la App
```
http://localhost:3000
```

### Paso 2: Inicia Sesión
- Email: `lafuentezapopan@gmail.com`
- Password: `liberacion296`

### Paso 3: Crear Datos de Prueba
Ejecuta el endpoint seed:
```bash
curl http://localhost:3000/api/admin/simple-seed
```

Verás que el evento se ha creado y aparece en el dashboard.

## Estructura de la Base de Datos

### Tabla Principal: `events`
```
- id (integer, PK)
- name (text)
- adminId (text, FK -> user.id)
- status (text)
- startDate (date)
- endDate (date)
- country (text)
- city (text)
- createdAt (timestamp)
- updatedAt (timestamp)
```

### Tablas de Datos del Evento
Todas vinculadas a `events.id`:
- `attendees` - Participantes del evento
- `teams` - Equipos
- `rooms` - Habitaciones/cuartos
- `staff` - Personal coordinador
- `games` - Juegos/competencias
- `game_scores` - Puntuaciones de juegos
- `categories` - Categorías de transacciones
- `transactions` - Ingresos y gastos
- `attendee_payments` - Pagos de participantes
- `staff_payments` - Pagos de staff
- `check_ins` - Check-in de participantes
- `churches` - Iglesias de procedencia
- `event_members` - Miembros del evento

## Próximos Pasos - Completar Seed Completo

Para un seed más completo que incluya:
- Equipos
- Cuartos
- Participantes
- Transacciones
- Staff
- Juegos
- Puntuaciones

Ejecutar: `/api/admin/seed-data` (en desarrollo)

## Notas Importantes

1. **La columna de usuario se llama `adminId`**, no `userId` en la tabla events
2. **El schema de la app es diferente del schema del Drizzle ORM** - las tablas fueron creadas por Better Auth + migraciones SQL
3. **El evento está vinculado directamente al usuario como administrador**
4. **Los datos persisten en Neon PostgreSQL**

## Debugging

Si algo no funciona:

1. **Verificar usuario**: 
   ```bash
   curl http://localhost:3000/api/admin/check-db
   # Buscar el email en la lista de usuarios
   ```

2. **Verificar estructura de eventos**:
   Verifica que las columnas coincidan (adminId, no userId)

3. **Revisar logs**:
   Consola del navegador y servidor de desarrollo

## Cambios Realizados

- ✅ EventProvider carga automáticamente el primer evento del usuario
- ✅ Endpoints de seed para inyectar datos de prueba
- ✅ Verificación de estructura de BD
- ✅ Usuario de prueba registrado y funcionando
- ✅ Dashboard mostrando evento "Permanence Camp"

**App completamente funcional y lista para testing.**
