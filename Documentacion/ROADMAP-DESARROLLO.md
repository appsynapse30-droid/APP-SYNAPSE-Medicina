# 🗺️ SYNAPSE Medical Platform - Roadmap de Desarrollo

> **Última actualización:** 4 de febrero de 2026  
> **Estado del proyecto:** En desarrollo activo (Alpha)

---

## 📊 Resumen Ejecutivo

SYNAPSE es una plataforma de estudio médico que combina flashcards con repetición espaciada (FSRS), casos clínicos simulados, biblioteca de documentos y asistente de IA. El proyecto tiene una **base frontend sólida** pero requiere integración completa con el backend de Supabase.

### Estado Actual
| Área | Progreso | Notas |
|------|----------|-------|
| UI/UX Frontend | ██████████ 90% | Componentes completos, diseño pulido |
| Backend Supabase | ██░░░░░░░░ 20% | Schema creado, sin integración real |
| Funcionalidades Core | █████░░░░░ 50% | Funcionan con localStorage |
| Autenticación | ███░░░░░░░ 30% | Bypass temporal para desarrollo |

---

## 1️⃣ BACKEND (Supabase)

### ✅ Completado
- [x] Proyecto Supabase creado (`wxtnuxlzogcizssdjnio`)
- [x] Schema de base de datos diseñado (10 tablas)
- [x] Tipos ENUM definidos (card_state, card_type, etc.)
- [x] RLS (Row Level Security) configurado
- [x] Archivo `.env` con credenciales
- [x] Cliente Supabase configurado (`src/config/supabase.js`)

### 🔴 Pendiente Crítico

#### 1.1 Autenticación Real
```
Prioridad: 🔴 CRÍTICA
Esfuerzo: ~4 horas
```
- [ ] Remover bypass de autenticación en `AuthContext.jsx`
- [ ] Implementar flujo de registro completo con verificación de email
- [ ] Implementar flujo de login con manejo de errores
- [ ] Implementar recuperación de contraseña
- [ ] Guardar perfil de usuario en `user_profiles`
- [ ] Sincronizar `user_settings` con Supabase
- [ ] Manejar sesión persistente correctamente

#### 1.2 Integración de Biblioteca con Storage
```
Prioridad: 🔴 CRÍTICA
Esfuerzo: ~6 horas
```
- [ ] Crear bucket de Storage `documents` en Supabase
- [ ] Implementar upload de PDFs a Supabase Storage
- [ ] Guardar metadatos en tabla `documents`
- [ ] Implementar descarga de documentoshttps://reactjs.org/link/react-devtools
2
AuthContext.jsx:357 Uncaught Error: useAuth must be used within an AuthProvider
    at useAuth (AuthContext.jsx:357:15)
    at LibraryProvider (LibraryContext.jsx:38:39)
chunk-RPCDYKBN.js?v=ff3efcb7:14032 The above error occurred in the <LibraryProvider> component:

    at LibraryProvider (http://localhost:3000/src/context/LibraryContext.jsx?t=1770420137646:47:35)
    at StudyStatsProvider (http://localhost:3000/src/context/StudyStatsContext.jsx:38:38)
    at SettingsProvider (http://localhost:3000/src/context/SettingsContext.jsx:89:36)
    at Router (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=ff3efcb7:4544:15)
    at BrowserRouter (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=ff3efcb7:5290:5)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
chunk-RPCDYKBN.js?v=ff3efcb7:19413 Uncaught Error: useAuth must be used within an AuthProvider
    at useAuth (AuthContext.jsx:357:15)
    at LibraryProvider (LibraryContext.jsx:38:39)

- [ ] Migrar de localStorage a Supabase
- [ ] Manejar límites de tamaño de archivos
- [ ] Implementar eliminación de archivos (Storage + DB)

#### 1.3 Sistema de Flashcards con FSRS
```
Prioridad: 🔴 CRÍTICA
Esfuerzo: ~8 horas
```
- [ ] CRUD de mazos (`flashcard_decks`)
- [ ] CRUD de tarjetas (`flashcards`)
- [ ] Guardar estado FSRS en Supabase (difficulty, stability, due_date)
- [ ] Registrar revisiones en `review_logs`
- [ ] Guardar sesiones de estudio en `study_sessions`
- [ ] Sincronización bidireccional (offline support futuro)

#### 1.4 Calendario con Persistencia
```
Prioridad: 🟡 MEDIA
Esfuerzo: ~3 horas
```
- [ ] Crear tabla `calendar_events` (no existe aún)
- [ ] Migrar eventos de localStorage a Supabase
- [ ] Sincronizar cambios en tiempo real

#### 1.5 Casos Clínicos Backend
```
Prioridad: 🟡 MEDIA
Esfuerzo: ~4 horas
```
- [ ] Crear tabla `clinical_cases` (no existe aún)
- [ ] Migrar datos de `ClinicalCasesContext.jsx`
- [ ] Implementar progreso de casos por usuario

### 🟡 Pendiente Secundario

#### 1.6 Edge Functions
```
Prioridad: 🟡 MEDIA
Esfuerzo: ~6 horas
```
- [ ] Función para procesar PDFs (extracción de texto)
- [ ] Función para generar embeddings de documentos
- [ ] Función para generar flashcards con IA
- [ ] Función para el asistente de IA (proxy a OpenAI/Claude)

#### 1.7 Graph View (Conceptos Médicos)
```
Prioridad: 🟢 BAJA
Esfuerzo: ~8 horas
```
- [ ] Poblar `medical_concepts` con datos iniciales
- [ ] Implementar relaciones en `concept_relationships`
- [ ] API para buscar conceptos relacionados
- [ ] Visualización de grafo en frontend

---

## 2️⃣ FRONTEND

### ✅ Completado
- [x] Layout principal con Sidebar y TopBar
- [x] Dashboard con estadísticas y tips de estudio
- [x] Biblioteca de documentos (UI completa)
- [x] Visor de PDFs con react-pdf
- [x] Calendario interactivo
- [x] Página de configuración
- [x] Casos clínicos (simulaciones)
- [x] Sistema de temas (dark mode)
- [x] Diseño responsive para móvil
- [x] Modales de confirmación para eliminar

### 🔴 Pendiente Crítico

#### 2.1 Página de Flashcards
```
Prioridad: 🔴 CRÍTICA
Esfuerzo: ~10 horas
Ruta: /flashcards
```
- [ ] Vista de mazos (grid de tarjetas)
- [ ] Crear/editar/eliminar mazos
- [ ] Vista de tarjetas dentro de un mazo
- [ ] Editor de tarjetas (front/back, tipo, prioridad)
- [ ] Modo de estudio con FSRS integrado
- [ ] Estadísticas por mazo

#### 2.2 Integración Real de Contextos
```
Prioridad: 🔴 CRÍTICA
Esfuerzo: ~6 horas
```
- [ ] `LibraryContext` → Supabase (Storage + DB)
- [ ] `CalendarContext` → Supabase
- [ ] `ClinicalCasesContext` → Supabase
- [ ] `StudyStatsContext` → Supabase
- [ ] `SettingsContext` → Supabase (`user_settings`)

#### 2.3 Mejoras en Autenticación UI
```
Prioridad: 🔴 CRÍTICA
Esfuerzo: ~3 horas
```
- [ ] Pantalla de verificación de email
- [ ] Pantalla de recuperar contraseña
- [ ] Mejor manejo de errores en login/registro
- [ ] Estado de carga durante autenticación

### 🟡 Pendiente Secundario

#### 2.4 Mejoras en StudyAI
```
Prioridad: 🟡 MEDIA
Esfuerzo: ~5 horas
```
- [ ] Conectar con API real de IA (OpenAI/Claude)
- [ ] Contexto de documentos (RAG)
- [ ] Historial de conversaciones
- [ ] Generación de flashcards desde chat

#### 2.5 Mejoras en Analytics
```
Prioridad: 🟡 MEDIA
Esfuerzo: ~4 horas
```
- [ ] Gráficas con datos reales de `review_logs`
- [ ] Heatmap de actividad semanal
- [ ] Predicciones de rendimiento
- [ ] Exportar reportes

#### 2.6 Mejoras en DocumentReader
```
Prioridad: 🟡 MEDIA
Esfuerzo: ~4 horas
```
- [ ] Anotaciones en PDF
- [ ] Resaltado de texto
- [ ] Bookmarks / marcadores
- [ ] Modo nocturno para lectura

#### 2.7 Vista de Grafo de Conceptos
```
Prioridad: 🟢 BAJA
Esfuerzo: ~8 horas
```
- [ ] Componente de visualización de grafo (D3.js/vis.js)
- [ ] Navegación interactiva de conceptos
- [ ] Relaciones entre flashcards y conceptos

### 🟢 Mejoras Futuras

#### 2.8 PWA y Offline Support
```
Prioridad: 🟢 BAJA
Esfuerzo: ~6 horas
```
- [ ] Service Worker para cache
- [ ] Sincronización offline
- [ ] Instalable como app

#### 2.9 Accesibilidad
```
Prioridad: 🟢 BAJA
Esfuerzo: ~4 horas
```
- [ ] Navegación por teclado
- [ ] Screen reader support
- [ ] Alto contraste

---

## 3️⃣ FUNCIONALIDADES DE LA APP

### ✅ Funcionalidades Completas

| Funcionalidad | Estado | Notas |
|---------------|--------|-------|
| Dashboard con estadísticas | ✅ | Tips rotativos, métricas, calendario |
| Biblioteca de documentos | ✅ | Subir, ver, eliminar (localStorage) |
| Visor de PDFs | ✅ | Zoom, navegación, thumbnails |
| Calendario de eventos | ✅ | Crear, editar, eliminar (localStorage) |
| Casos clínicos | ✅ | Simulaciones interactivas |
| Configuración | ✅ | Perfil, tema, notificaciones |
| Navegación responsive | ✅ | Sidebar colapsable, móvil-ready |

### 🔴 Funcionalidades Críticas Pendientes

#### 3.1 Sistema de Flashcards Completo
```
Prioridad: 🔴 CRÍTICA
Dependencias: Backend 1.3, Frontend 2.1
```
**Descripción:** Sistema de tarjetas de estudio con algoritmo FSRS para repetición espaciada inteligente.

**Características requeridas:**
- [ ] Crear mazos por asignatura (Cardiología, Neurología, etc.)
- [ ] 4 tipos de tarjetas: Básica, Cloze, Imagen, Opción Múltiple
- [ ] Prioridad de tarjetas (Crítica, Alta, Normal, Baja)
- [ ] Programación automática basada en FSRS
- [ ] Modo estudio con calificación (Fácil, Bien, Difícil, Repetir)
- [ ] Estadísticas de retención por tarjeta
- [ ] Depth-on-Demand: Key Point → Clinical Pearl → Pathophysiology

#### 3.2 Persistencia de Datos en la Nube
```
Prioridad: 🔴 CRÍTICA
Dependencias: Backend 1.1-1.5
```
**Descripción:** Migrar todos los datos de localStorage a Supabase.

**Datos a migrar:**
- [ ] Documentos de biblioteca (archivos + metadatos)
- [ ] Eventos del calendario
- [ ] Progreso de casos clínicos
- [ ] Estadísticas de estudio
- [ ] Configuración de usuario

#### 3.3 Autenticación Completa
```
Prioridad: 🔴 CRÍTICA
Dependencias: Backend 1.1
```
**Descripción:** Flujo completo de autenticación de usuarios.

**Características requeridas:**
- [ ] Registro con email/contraseña
- [ ] Verificación de email
- [ ] Login con credenciales
- [ ] Recuperar contraseña
- [ ] Cerrar sesión
- [ ] Persistencia de sesión

### 🟡 Funcionalidades Secundarias Pendientes

#### 3.4 Asistente de IA Funcional
```
Prioridad: 🟡 MEDIA
Dependencias: Backend 1.6
```
**Descripción:** Chat con IA para resolver dudas médicas con contexto de documentos.

**Características requeridas:**
- [ ] Chat con modelo de IA (GPT-4 / Claude)
- [ ] Contexto de documentos subidos (RAG)
- [ ] Generación de flashcards desde respuestas
- [ ] Historial de conversaciones
- [ ] Modo de examen (preguntas aleatorias)

#### 3.5 Exámenes y Evaluaciones
```
Prioridad: 🟡 MEDIA
Dependencias: Backend 1.3
```
**Descripción:** Sistema de exámenes programados y modo de evaluación.

**Características requeridas:**
- [ ] Crear exámenes con fecha objetivo
- [ ] Asociar mazos a exámenes
- [ ] Modo de estudio intensivo pre-examen
- [ ] Estadísticas de preparación
- [ ] Notificaciones de repaso

#### 3.6 Notas y Anotaciones
```
Prioridad: 🟡 MEDIA
Dependencias: Backend 1.2
```
**Descripción:** Sistema de notas integrado con documentos.

**Características requeridas:**
- [ ] Crear notas de texto
- [ ] Vincular notas a documentos
- [ ] Vincular notas a flashcards
- [ ] Editor rich text
- [ ] Búsqueda en notas

### 🟢 Funcionalidades Futuras (Backlog)

| Funcionalidad | Descripción |
|---------------|-------------|
| **Vista de Grafo** | Visualización de conceptos médicos relacionados |
| **Colaboración** | Compartir mazos públicos entre usuarios |
| **Importar Anki** | Migrar mazos desde Anki |
| **OCR de Imágenes** | Extraer texto de notas manuscritas |
| **Pomodoro Timer** | Timer integrado para técnica Pomodoro |
| **Gamificación** | Logros, badges, streaks avanzados |
| **Modo Dark/Light Auto** | Basado en hora del día |
| **Exportar a PDF** | Exportar flashcards y notas |
| **Integración Calendario** | Sync con Google Calendar |
| **App Móvil Nativa** | React Native / Capacitor |

---

## 📅 Cronograma Sugerido

### Sprint 1: Fundamentos (1-2 semanas)
1. ✅ Autenticación real con Supabase
2. ✅ CRUD de flashcard_decks y flashcards
3. ✅ Página de Flashcards en frontend

### Sprint 2: Persistencia (1-2 semanas)
1. ✅ Migrar LibraryContext a Supabase Storage
2. ✅ Migrar CalendarContext a Supabase
3. ✅ Sincronizar SettingsContext

### Sprint 3: Estudio (1-2 semanas)
1. ✅ FSRS completo con persistencia
2. ✅ Modo estudio de flashcards
3. ✅ Estadísticas en Analytics

### Sprint 4: IA y Extras (2-3 semanas)
1. ✅ Integración con OpenAI/Claude
2. ✅ Generación de flashcards con IA
3. ✅ Sistema de exámenes

---

## 🔗 Recursos

| Recurso | URL |
|---------|-----|
| Supabase Dashboard | https://supabase.com/dashboard/project/wxtnuxlzogcizssdjnio |
| Documentación FSRS | https://github.com/open-spaced-repetition/fsrs4anki |
| React-PDF Docs | https://react-pdf.org/ |
| Lucide Icons | https://lucide.dev/icons/ |

---

## 📝 Notas Adicionales

### Arquitectura Actual

```
src/
├── components/        # Componentes reutilizables
│   ├── layout/       # Sidebar, TopBar, Navbar
│   ├── cases/        # Componentes de casos clínicos
│   └── study/        # Componentes de estudio
├── context/          # Estado global (8 providers)
│   ├── AuthContext.jsx       # Autenticación (bypass temporal)
│   ├── CalendarContext.jsx   # Eventos (localStorage)
│   ├── ClinicalCasesContext.jsx
│   ├── FSRSContext.jsx       # Algoritmo FSRS
│   ├── LibraryContext.jsx    # Documentos (localStorage)
│   ├── SettingsContext.jsx   # Configuración (localStorage)
│   ├── StudyStatsContext.jsx
│   └── SupabaseContext.jsx   # Cliente Supabase
├── pages/            # 12 páginas principales
└── config/           # Configuración Supabase
```

### Decisiones de Diseño

1. **localStorage temporal:** Permite desarrollo frontend sin depender de backend
2. **Bypass de auth:** UUID fijo para desarrollo (`0f39ddfe-517a-4ca6-870c-8d1e76d47ec1`)
3. **Context API:** Estado global sin Redux para simplicidad
4. **CSS Variables:** Sistema de diseño cohesivo con temas

---

> 📌 **Próximo paso:** Comenzar con Sprint 1 - Implementar autenticación real
