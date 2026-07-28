# Análisis de RenoERP - Sistema de Gestión de Eventos

## Propósito General
**RenoERP** es una aplicación de gestión integral para eventos religiosos y campamentos. Permite administrar de manera centralizada:
- Asistentes/Camperos y su información
- Equipos y asignaciones
- Personal de staff y pagos
- Transacciones de ingresos/gastos
- Juegos y puntuaciones
- Hospedaje (asignación de cuartos)
- Información de iglesias

---

## Arquitectura de Base de Datos

### Tabla Central: `events`
- **Propósito**: Define cada evento/campamento
- **Campos clave**: id, userId (propietario), name, startDate, endDate, location
- **Relación**: Muchos modelos dependen de eventId

### Tablas de Participantes

#### 1. **attendees** (Camperos/Asistentes)
- Información personal: nombre, edad, talla de camiseta, sexo, teléfono
- **church**: Iglesia de procedencia (OPCIONAL - texto libre)
- **roomId**: Referencia a cuarto asignado (OPCIONAL)
- **teamId**: Referencia a equipo asignado (OPCIONAL)
- Contactos de emergencia (2 contactos)
- Información de pagos integrada: totalAmount, amountPaid, discount, status

#### 2. **staff** (Personal)
- Similar a attendees pero para el personal
- **leadTeamId**: Equipo que lidera (OPCIONAL)
- **category**: Ministerio/rol (texto libre)
- También tiene información de pagos integrada

### Tablas de Organización

#### 3. **teams** (Equipos)
- name, color (para identificación visual)
- **country**: País (OPCIONAL - código ISO)
- Usado para agrupar camperos y staff

#### 4. **churches** (Iglesias)
- Referencia de iglesias
- Texto simple para identificación

#### 5. **rooms** (Cuartos/Hospedaje)
- name, capacity (capacidad de hospedaje)

### Tablas de Transacciones

#### 6. **transactions** (Movimientos financieros)
- **type**: 'income' | 'expense'
- **categoryId**: Referencia a categoría
- **amount, description, date**
- **paymentMethod**: 'cash' | 'transfer' | 'deposit'
- Registro de TODOS los movimientos de dinero

#### 7. **categories** (Categorías financieras)
- **type**: 'income' | 'expense' | 'both'
- name, color, icon
- Se auto-crean para pagos de camperos

### Tablas de Pagos

#### 8. **attendeePayments** (Pagos de camperos)
- Registro detallado de cada pago
- Vinculado a campero y usuario

#### 9. **staffPayments** (Pagos de staff)
- Similar a attendeePayments

### Tablas de Juegos

#### 10. **games** (Juegos/Competencias)
- name, description, gameDate

#### 11. **gameScores** (Puntuaciones)
- gameId, teamId, points
- Registra puntos por equipo en cada juego

### Tabla de Control

#### 12. **eventMembers** (Miembros del evento)
- eventId, userId, role ('admin' | 'member')
- Control de permisos para compartir eventos

---

## Diagrama de Relaciones Principales

```
events
├── attendees (userId, eventId)
│   ├── attendeePayments (attendeeId, eventId)
│   ├── teamId → teams (eventId)
│   └── roomId → rooms (eventId)
├── staff (userId, eventId)
│   ├── staffPayments (staffId, eventId)
│   └── leadTeamId → teams (eventId)
├── teams (eventId)
├── churches (eventId)
├── rooms (eventId)
├── categories (userId, eventId)
├── transactions (userId, eventId, categoryId)
├── games (eventId)
├── gameScores (gameId, teamId, eventId)
└── eventMembers (eventId, userId)
```

---

## Módulos de la Aplicación

### 1. **Dashboard** (`/app/(app)/page.tsx`)
- Resumen de métricas del evento actual
- Cantidad de asistentes, ingresos, gastos
- Información general del evento

### 2. **Attendees** (`/app/(app)/attendees/page.tsx`)
- CRUD completo de camperos
- Gestión de pagos
- Asignación de cuartos y equipos
- Check-in
- Filtros avanzados

### 3. **Staff** (`/app/(app)/staff/page.tsx`)
- Similar a attendees
- Gestión de personal del evento
- Pagos a staff

### 4. **Teams** (`/app/(app)/teams/page.tsx`)
- Crear y gestionar equipos
- Asignar color y país
- Ver miembros del equipo

### 5. **Rooms** (`/app/(app)/rooms/page.tsx`)
- Crear cuartos/hospedaje
- Asignar capacidad
- Visualizar asignaciones

### 6. **Churches** (`/app/(app)/churches/page.tsx`)
- Gestión de iglesias
- Referencia para camperos y staff

### 7. **Categories** (`/app/(app)/categories/page.tsx`)
- Categorías de transacciones
- Se auto-crean para ingresos de pagos

### 8. **Transactions** (`/app/(app)/transactions/page.tsx`)
- Registro completo de ingresos/gastos
- Filtrado por categoría y tipo

### 9. **Games** (`/app/(app)/games/page.tsx`)
- Crear juegos/competencias
- Registrar puntuaciones por equipo

---

## Flujo de Datos y Dependencias

### Orden de Creación Recomendado:
1. **Event**: Crear evento (obligatorio)
2. **Teams**: Crear equipos (OPCIONAL pero recomendado)
3. **Rooms**: Crear cuartos (OPCIONAL)
4. **Churches**: Agregar iglesias (OPCIONAL)
5. **Attendees**: Registrar camperos (pueden asignarse a teams/rooms)
6. **Staff**: Registrar personal
7. **Categories**: Se crean automáticamente o manualmente
8. **Transactions**: Registrar movimientos
9. **Games**: Crear juegos

### Relaciones Opcionales:
- **attendees.church**: No requiere existencia en tabla churches (es texto libre)
- **attendees.teamId**: OPCIONAL - campero puede no estar en equipo
- **attendees.roomId**: OPCIONAL - campero puede no estar asignado a cuarto
- **staff.leadTeamId**: OPCIONAL - staff puede no liderar equipo

---

## Problemas Encontrados en Migración

### 1. **Falta de eventId en componentes clientes**
- Componentes como `AttendeeClient` no pasaban `eventId` a funciones de acciones
- Línea 143 en `attendees-client.tsx`: `getAllAttendees(userId)` debería ser `getAllAttendees(userId, currentEventId)`

### 2. **Context de Evento No Seteado**
- `useEventContext()` devuelve `currentEventId` pero podría ser undefined
- Necesita validación y manejo de error

### 3. **Campos OPTIONAL ahora son NOT NULL con DEFAULT**
- Algunos campos como `eventId` se hicieron NOT NULL pero con DEFAULT 1
- Necesita refactorización en componentes

---

## Plan de Reparación

Módulos a reparar por orden:
1. **Dashboard** - Base de toda la app
2. **Attendees** - Módulo principal
3. **Staff** - Similar estructura
4. **Teams** - Datos de soporte
5. **Rooms** - Datos de soporte
6. **Churches** - Datos de soporte
7. **Categories** - Se crea automáticamente
8. **Transactions** - Depende de categorías
9. **Games** - Independiente
