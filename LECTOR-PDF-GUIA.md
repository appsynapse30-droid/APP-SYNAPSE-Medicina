# 📚 Lector de PDF - Biblioteca Synapse

## ✨ Nueva Funcionalidad Implementada

Se ha integrado un **lector de PDF profesional** completo en la sección de Biblioteca, permitiendo visualizar y estudiar documentos PDF directamente en la aplicación.

---

## 🎯 Características Principales

### 📄 Visor de PDF Completo
- ✅ Visualización de PDFs nativos en el navegador
- ✅ Navegación página por página
- ✅ Zoom dinámico (25% - 300%)
- ✅ Rotación de documentos
- ✅ Modo pantalla completa
- ✅ Barra de progreso visual
- ✅ Búsqueda en documento (próximamente activa)
- ✅ Descarga de documentos

### 🎨 Interfaz Premium
- Controles intuitivos y fáciles de usar
- Indicadores de página actual
- Atajos de teclado para navegación rápida
- Diseño responsive adaptativo
- Estados de carga y error elegantes

### 🤖 Integración con IA
- Panel lateral con asistente médico
- Análisis contextual por página
- Generación de flashcards automáticas
- Resúmenes inteligentes
- Mapas mentales del contenido

---

## 🚀 Cómo Usar

### 1️⃣ Subir un PDF

1. Ve a la sección **Biblioteca** en el menú lateral
2. Haz clic en el botón **"Subir Documento"**
3. Selecciona uno o varios archivos PDF de tu computadora
4. Opcionalmente, asigna:
   - Una colección (ej: "Cardiología", "Neurología")
   - Etiquetas (ej: "Año 2", "Examen")
5. Haz clic en **"Subir X archivo(s)"**

### 2️⃣ Visualizar un PDF

1. Desde la **Biblioteca**, haz clic en cualquier documento con tipo **PDF**
2. El documento se abrirá en el lector profesional
3. Usa los controles de la barra superior para:
   - **← →** : Navegar entre páginas
   - **+ -** : Ajustar zoom
   - **🔄** : Rotar documento
   - **🔍** : Buscar texto (próximamente)
   - **⛶** : Modo pantalla completa
   - **⬇** : Descargar PDF

### 3️⃣ Atajos de Teclado

| Tecla | Acción |
|-------|--------|
| `→` o `↓` | Página siguiente |
| `←` o `↑` | Página anterior |
| `+` o `=` | Aumentar zoom |
| `-` | Reducir zoom |
| `F` | Pantalla completa |

### 4️⃣ Interactuar con el Asistente IA

- El **panel derecho** muestra el Tutor Médico que lee el contenido
- Haz preguntas sobre conceptos específicos de la página actual
- Solicita resúmenes, flashcards o mapas mentales
- El contexto se actualiza automáticamente con cada página

---

## 📋 Tipos de Documentos Soportados

| Tipo | Icono | Descripción |
|------|-------|-------------|
| **PDF** | 📄 | Archivos PDF con lector completo |
| **NOTA** | 📝 | Notas personales con editor |
| **IMG** | 🖼️ | Imágenes y diagramas médicos |

---

## 🔧 Tecnología Utilizada

- **react-pdf**: Renderizado de PDFs en React
- **pdfjs**: Motor de renderizado de Mozilla
- **Base64 Storage**: Almacenamiento local de PDFs
- **LocalStorage**: Persistencia de documentos

---

## 💡 Tips y Mejores Prácticas

### ✨ Para Mejor Rendimiento:
- Los PDFs se almacenan en tu navegador (LocalStorage)
- PDFs grandes (>10MB) pueden tardar más en cargar
- Se recomienda usar PDFs optimizados para web

### 📚 Organización Eficiente:
1. **Usa colecciones** para agrupar por tema (Cardiología, Neuro, etc.)
2. **Añade etiquetas** para clasificación cruzada (Año 2, Examen, etc.)
3. **Nombres descriptivos** para encontrar documentos rápidamente

### 🎓 Estudio Efectivo:
- Usa el **asistente IA** para aclarar conceptos complejos
- Genera **flashcards** automáticamente de cada capítulo
- Crea **mapas mentales** para visualizar conexiones
- Marca páginas importantes con el botón de **bookmark**

---

## 🐛 Solución de Problemas

### ❌ "Error al cargar el documento PDF"
- Verifica que el archivo sea un PDF válido
- Intenta subir el archivo nuevamente
- Asegúrate de que el PDF no esté corrupto

### ❌ Documento se ve borroso
- Aumenta el zoom usando los controles `+`
- Verifica la calidad del PDF original
- Algunos PDFs escaneados pueden tener baja resolución

### ❌ Página no responde
- Refresca la página del navegador
- El localStorage puede estar lleno (límite ~10MB)
- Considera eliminar documentos antiguos

---

## 🎯 Próximas Mejoras

- [ ] Búsqueda de texto dentro del PDF activa
- [ ] Resaltado de texto con colores
- [ ] Anotaciones y notas sobre el PDF
- [ ] Exportación de resúmenes
- [ ] Vista de miniaturas de páginas
- [ ] OCR para PDFs escaneados

---

## 📞 Soporte

Si encuentras algún problema o tienes sugerencias:
- Reporta bugs en el sistema
- Sugiere nuevas funcionalidades
- Comparte tu feedback

---

**¡Disfruta estudiando con Synapse! 🧠✨**
