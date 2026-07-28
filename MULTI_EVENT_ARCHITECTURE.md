# Arquitectura Multi-Evento - Guía de Implementación

## Premisas
- ✅ Usuarios se registran con Gmail (OAuth)
- ✅ Solo ADMINS crean eventos
- ✅ Solo ves eventos a los que fuiste INVITADO
- ✅ Minimizar costos de BD (Neon serverless)
- ✅ Escalable a múltiples campamentos/eventos

---

## Modelo de Datos (SIMPLE y EFICIENTE)

### Tablas Nuevas (Solo 2)

```typescript
// 1. EVENTS - Crean solo admins
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),           // "Campamento Verano 2026"
  adminId: text('adminId').notNull(),     // email del creador
  description: text('description'),
  country: text('country'),
  city: text('city'),
  startDate: date('startDate'),
  endDate: date('endDate'),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// 2. EVENT_MEMBERS - Control de acceso
export const eventMembers = pgTable('event_members', {
  id: serial('id').primaryKey(),
  eventId: integer('eventId').notNull(),
  userId: text('userId').notNull(),
  role: text('role').notNull(),           // 'admin' | 'leader' | 'coordinator' | 'viewer'
  status: text('status').notNull().default('active'),
  invitedAt: timestamp('invitedAt').notNull().defaultNow(),
  acceptedAt: timestamp('acceptedAt'),
})
```

### Tablas Modificadas (Agregar `eventId`)

```typescript
// PATRÓN: Todas las tablas agregan eventId
export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  eventId: integer('eventId').notNull(),  // ← NUEVO
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  // ... resto igual
})
```

---

## Flujo de Acceso (LO MÁS IMPORTANTE)

### 1. Login
```
Usuario hace login con Gmail
  ↓
Sistema busca: SELECT * FROM eventMembers WHERE userId = email
  ↓
Si NO hay → Mostrar "No tienes eventos" (crear uno si eres admin)
Si hay → Mostrar lista de eventos donde es miembro
```

### 2. Seleccionar Evento
```
Usuario elige evento del dropdown
  ↓
Sistema guarda eventId en contexto/localStorage
  ↓
TODOS los queries filtran automáticamente:
  WHERE eventId = $1
  ↓
El usuario SOLO ve datos de ese evento
```

---

## Roles y Permisos

| Rol | Crear | Ver | Editar | Ejemplo |
|-----|-------|-----|--------|---------|
| **admin** | Todo | Todo | Todo | Creador evento |
| **leader** | Equipos | Su equipo | Su equipo | Líder de grupo |
| **coordinator** | Nada | Todo | Categorías | Gestor finanzas |
| **viewer** | Nada | Dashboards | Nada | Observador |

---

## Implementación Faseada

### **FASE 1: BD + Schema**
1. Crear tablas `events` y `eventMembers`
2. Agregar `eventId` a todas las tablas
3. Migración: crear evento "Default" para usuario actual
4. Índices: `CREATE INDEX idx_event_members_userId ON event_members(userId)`

### **FASE 2: Hooks y Context**
1. `useEventContext()` - evento actual
2. `useMyEvents()` - obtener mis eventos
3. Modificar todos los hooks para filtrar por eventId

### **FASE 3: UI**
1. `EventSelector` en header (dropdown)
2. Mostrar rol: "(ADMIN)" o "(LEADER)"
3. Botón "Crear Evento" solo si es admin

### **FASE 4: Acciones**
1. Crear evento
2. Invitar personas (por email)
3. Asignar roles
4. Remover miembros

---

## Costos BD (INSIGNIFICANTE)

**Antes**: ~100 filas + datos = $0.10-$0.20/mes  
**Después**: +50 eventos + 100 relaciones = $0.25/mes  
**Extra**: ~$0.05-$0.10/mes (NADA)

---

## Seguridad (IMPORTANTE)

```typescript
// ✅ SIEMPRE validar en backend
const canAccess = await db.select()
  .from(eventMembers)
  .where(and(
    eq(eventMembers.userId, user.id),
    eq(eventMembers.eventId, eventId)
  ))

if (!canAccess) throw new Error('No access')
```

---

## Ejemplo: Crear Evento

```typescript
// POST /api/events
export async function POST(req: Request) {
  const user = await getUser()
  
  // 1. Crear evento
  const [event] = await db.insert(events).values({
    name: req.body.name,
    adminId: user.id,
    startDate: req.body.startDate,
  }).returning()
  
  // 2. Agregar admin como miembro
  await db.insert(eventMembers).values({
    eventId: event.id,
    userId: user.id,
    role: 'admin',
    status: 'active',
  })
  
  return event
}
```

---

## Queries Optimizadas

```sql
-- Ver mis eventos
SELECT e.*, em.role FROM events e
JOIN eventMembers em ON e.id = em.eventId
WHERE em.userId = $1
ORDER BY e.createdAt DESC;

-- Ver dashboard de evento
SELECT COUNT(*) as attendees FROM attendees
WHERE eventId = $1;

-- Ver mis equipos (si soy leader)
SELECT * FROM teams
WHERE eventId = $1 AND userId = $2;
```

---

## Resumen

**Lo esencial:**
- Cada usuario ve SOLO eventos donde fue invitado
- Cada evento es independiente (su propio conjunto de datos)
- Admin crea eventos e invita personas
- Todo filtra automáticamente por `eventId`
- Costo BD: prácticamente igual
- Seguridad: validada en backend
