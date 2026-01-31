# 🗄️ Configuración de Supabase - SYNAPSE Medical Platform

## 📍 Credenciales del Proyecto

| Campo | Valor |
|-------|-------|
| **Project ID** | `wxtnuxlzogcizssdjnio` |
| **Project URL** | `https://wxtnuxlzogcizssdjnio.supabase.co` |
| **Anon Key** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4dG51eGx6b2djaXpzc2RqbmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MTI4NzQsImV4cCI6MjA4NTM4ODg3NH0.7n-3h9KQD7X9-uYE6fMHt7Pmfmdx3y5kZ7yo5AKdV94` |
| **Región** | `us-east-1` |
| **Estado** | ✅ ACTIVE_HEALTHY |

---

## 📊 Diagrama de Base de Datos

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SYNAPSE DATABASE                               │
└─────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐
    │   auth.users     │  (Supabase Auth - automático)
    │   ────────────   │
    │   id (UUID) PK   │
    │   email          │
    │   password       │
    └────────┬─────────┘
             │
             │ 1:1
             ▼
    ┌──────────────────┐         ┌──────────────────┐
    │  user_profiles   │         │  user_settings   │
    │  ──────────────  │         │  ──────────────  │
    │  id (FK users)   │         │  id (FK users)   │
    │  display_name    │         │  fsrs_retention  │
    │  university      │         │  daily_new_limit │
    │  career_year     │         │  theme           │
    │  specialty       │         │  notifications   │
    └──────────────────┘         └──────────────────┘
             │
             │ 1:N
             ▼
    ┌──────────────────┐
    │ flashcard_decks  │
    │ ───────────────  │
    │ id (UUID) PK     │
    │ user_id (FK)     │
    │ name             │
    │ subject          │
    │ color, icon      │
    └────────┬─────────┘
             │
             │ 1:N
             ▼
    ┌──────────────────────────────────────────────────┐
    │                   flashcards                      │
    │   ─────────────────────────────────────────────  │
    │   id (UUID) PK                                   │
    │   deck_id (FK flashcard_decks)                   │
    │   user_id (FK users)                             │
    │                                                  │
    │   -- Contenido --                                │
    │   front, back (TEXT)                             │
    │   card_type (BASIC|CLOZE|IMAGE_OCCLUSION|MC)     │
    │   priority (CRITICAL|HIGH|NORMAL|LOW)            │
    │                                                  │
    │   -- Depth-on-Demand --                          │
    │   key_point, clinical_pearl, pathophysiology     │
    │                                                  │
    │   -- FSRS State --                               │
    │   state (NEW|LEARNING|REVIEW|RELEARNING)         │
    │   difficulty (0-10)                              │
    │   stability (días)                               │
    │   retrievability (0-1)                           │
    │   due_date, last_review                          │
    │   reps, lapses                                   │
    └────────┬─────────────────────────────────────────┘
             │
             │ 1:N
             ▼
    ┌──────────────────┐         ┌──────────────────┐
    │   review_logs    │         │  study_sessions  │
    │   ────────────   │         │  ──────────────  │
    │   card_id (FK)   │         │  user_id (FK)    │
    │   rating         │         │  deck_id (FK)    │
    │   duration_ms    │         │  duration_mins   │
    │   state_before   │         │  cards_studied   │
    │   state_after    │         │  cards_correct   │
    │   reviewed_at    │         │  exam_mode       │
    └──────────────────┘         └──────────────────┘


    ┌──────────────────┐         ┌──────────────────┐
    │    documents     │         │      exams       │
    │   ────────────   │         │   ────────────   │
    │   user_id (FK)   │         │   user_id (FK)   │
    │   name, file_path│         │   name, subject  │
    │   file_type      │         │   exam_date      │
    │   is_processed   │         │   deck_ids[]     │
    │   chunks_count   │         │   is_completed   │
    └──────────────────┘         └──────────────────┘


    ┌─────────────────────────────────────────────────┐
    │              GRAPH VIEW TABLES                   │
    ├─────────────────────────────────────────────────┤
    │                                                 │
    │  ┌──────────────────┐                           │
    │  │ medical_concepts │                           │
    │  │ ───────────────  │                           │
    │  │ id (UUID)        │                           │
    │  │ name             │                           │
    │  │ type (SYMPTOM|   │                           │
    │  │   PATHOLOGY|DRUG │                           │
    │  │   |ANATOMY|...)  │                           │
    │  │ icd10_code       │                           │
    │  │ atc_code         │                           │
    │  └────────┬─────────┘                           │
    │           │                                     │
    │           │ N:N                                 │
    │           ▼                                     │
    │  ┌────────────────────────┐                     │
    │  │ concept_relationships  │                     │
    │  │ ────────────────────   │                     │
    │  │ source_concept_id (FK) │                     │
    │  │ target_concept_id (FK) │                     │
    │  │ relationship_type      │                     │
    │  │ weight (0-1)           │                     │
    │  └────────────────────────┘                     │
    │                                                 │
    └─────────────────────────────────────────────────┘
```

---

## 📋 Tablas Creadas

### 1. `user_profiles` - Perfil del Usuario
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID (PK, FK→auth.users) | ID del usuario |
| display_name | TEXT | Nombre para mostrar |
| avatar_url | TEXT | URL del avatar |
| university | TEXT | Universidad |
| career_year | INTEGER (1-7) | Año de carrera |
| specialty_interest | TEXT | Especialidad de interés |
| study_hours_goal | INTEGER | Meta de horas de estudio diarias |

### 2. `flashcard_decks` - Mazos de Tarjetas
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID (PK) | ID del mazo |
| user_id | UUID (FK) | Propietario |
| name | TEXT | Nombre del mazo |
| subject | TEXT | Materia (Cardiología, Anatomía...) |
| color | TEXT | Color del mazo (#hex) |
| icon | TEXT | Emoji del mazo |
| is_public | BOOLEAN | ¿Es público? |
| cards_count | INTEGER | Total de tarjetas |

### 3. `flashcards` - Tarjetas con FSRS
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID (PK) | ID de la tarjeta |
| deck_id | UUID (FK) | Mazo al que pertenece |
| front | TEXT | Pregunta |
| back | TEXT | Respuesta |
| card_type | ENUM | BASIC, CLOZE, IMAGE_OCCLUSION, MULTIPLE_CHOICE |
| priority | ENUM | CRITICAL, HIGH, NORMAL, LOW |
| **key_point** | TEXT | Concepto clave (Depth-on-Demand nivel 1) |
| **clinical_pearl** | TEXT | Perla clínica (nivel 2) |
| **pathophysiology** | TEXT | Fisiopatología (nivel 3) |
| **state** | ENUM | NEW, LEARNING, REVIEW, RELEARNING |
| **difficulty** | REAL | 0-10, dificultad FSRS |
| **stability** | REAL | Días hasta olvidar |
| **retrievability** | REAL | Probabilidad de recordar (0-1) |
| **due_date** | TIMESTAMPTZ | Próxima revisión |
| reps | INTEGER | Número de repeticiones |
| lapses | INTEGER | Veces olvidada |

### 4. `review_logs` - Historial de Revisiones
| Campo | Tipo | Descripción |
|-------|------|-------------|
| card_id | UUID (FK) | Tarjeta revisada |
| rating | ENUM | AGAIN, HARD, GOOD, EASY |
| review_duration_ms | INTEGER | Tiempo de respuesta |
| state_before/after | ENUM | Estado antes/después |
| difficulty_before/after | REAL | Dificultad antes/después |
| reviewed_at | TIMESTAMPTZ | Fecha de revisión |

### 5. `study_sessions` - Sesiones de Estudio
| Campo | Tipo | Descripción |
|-------|------|-------------|
| user_id | UUID (FK) | Usuario |
| deck_id | UUID (FK) | Mazo estudiado |
| duration_minutes | INTEGER | Duración |
| cards_studied | INTEGER | Tarjetas estudiadas |
| cards_correct | INTEGER | Respuestas correctas |
| exam_mode | BOOLEAN | ¿Modo examen? |

### 6. `documents` - Documentos para RAG
| Campo | Tipo | Descripción |
|-------|------|-------------|
| name | TEXT | Nombre del archivo |
| file_path | TEXT | Ruta en Storage |
| file_type | TEXT | pdf, image, txt |
| is_processed | BOOLEAN | ¿Procesado para RAG? |
| chunks_count | INTEGER | Fragmentos indexados |

### 7. `medical_concepts` - Conceptos Médicos (Graph)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| name | TEXT | Nombre del concepto |
| type | ENUM | SYMPTOM, PATHOLOGY, DRUG, ANATOMY... |
| icd10_code | TEXT | Código CIE-10 |
| atc_code | TEXT | Código ATC (fármacos) |
| synonyms | TEXT[] | Sinónimos |

### 8. `concept_relationships` - Relaciones entre Conceptos
| Campo | Tipo | Descripción |
|-------|------|-------------|
| source_concept_id | UUID (FK) | Concepto origen |
| target_concept_id | UUID (FK) | Concepto destino |
| relationship_type | ENUM | CAUSED_BY, TREATED_WITH, SYMPTOM_OF... |
| weight | REAL | Fuerza de la relación (0-1) |

### 9. `user_settings` - Configuración del Usuario
| Campo | Tipo | Descripción |
|-------|------|-------------|
| fsrs_request_retention | REAL | Retención objetivo (0.9 = 90%) |
| fsrs_maximum_interval | INTEGER | Máximo días entre revisiones |
| daily_new_cards_limit | INTEGER | Límite de tarjetas nuevas/día |
| theme | TEXT | Tema (dark/light) |

### 10. `exams` - Exámenes Programados
| Campo | Tipo | Descripción |
|-------|------|-------------|
| name | TEXT | Nombre del examen |
| exam_date | DATE | Fecha del examen |
| deck_ids | UUID[] | Mazos relacionados |
| is_completed | BOOLEAN | ¿Ya pasó? |

---

## 🔒 Seguridad (RLS - Row Level Security)

**Todas las tablas tienen RLS habilitado** con las siguientes políticas:

- ✅ Los usuarios solo pueden ver/editar sus propios datos
- ✅ Los conceptos médicos globales (`user_id = NULL`) son visibles para todos
- ✅ Los mazos públicos (`is_public = TRUE`) son visibles para todos

---

## 🔧 Tipos ENUM Creados

```sql
-- Prioridad de tarjetas
CREATE TYPE card_priority AS ENUM ('CRITICAL', 'HIGH', 'NORMAL', 'LOW');

-- Estado de tarjeta (FSRS)
CREATE TYPE card_state AS ENUM ('NEW', 'LEARNING', 'REVIEW', 'RELEARNING');

-- Tipo de tarjeta
CREATE TYPE card_type AS ENUM ('BASIC', 'CLOZE', 'IMAGE_OCCLUSION', 'MULTIPLE_CHOICE');

-- Calificación de revisión
CREATE TYPE review_rating AS ENUM ('AGAIN', 'HARD', 'GOOD', 'EASY');

-- Tipo de concepto médico
CREATE TYPE concept_type AS ENUM ('SYMPTOM', 'PATHOLOGY', 'DRUG', 'PROCEDURE', 'ANATOMY', 'LAB_VALUE', 'CUSTOM');

-- Tipo de relación entre conceptos
CREATE TYPE relationship_type AS ENUM ('CAUSED_BY', 'CAUSES', 'TREATED_WITH', 'TREATS', 'LOCATED_IN', 'SYMPTOM_OF', 'CONTRAINDICATED_WITH', 'RELATED_TO');
```

---

## 📁 Próximos Pasos

1. **Crear archivo `.env`** con las credenciales
2. **Instalar Supabase Client** en el proyecto React
3. **Crear SupabaseContext** para la conexión
4. **Implementar autenticación** (signup/login)
5. **Implementar FSRS** con las tablas creadas

---

## 🔗 Links Útiles

- **Dashboard**: https://supabase.com/dashboard/project/wxtnuxlzogcizssdjnio
- **API Docs**: https://wxtnuxlzogcizssdjnio.supabase.co/rest/v1/
- **Auth**: https://wxtnuxlzogcizssdjnio.supabase.co/auth/v1/
