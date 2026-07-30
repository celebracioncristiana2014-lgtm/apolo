# SYSTEM INSTRUCTIONS: App de Educación Teológica "Apologética Avanzada"

## 1. Contexto del Proyecto
El objetivo es construir una aplicación educativa (Web/Móvil) de nivel avanzado para una iglesia cristiana. La app debe permitir a los alumnos acceder a lecciones semanales basadas en el libro "No tengo suficiente fe para ser ateo", realizar lecturas y completar evaluaciones interactiva (quizzes) al final de cada clase.

## 2. Pila Tecnológica Solicitada (Tech Stack)
- **Frontend:** React Native (Expo) o Next.js (según el target principal del agente).
- **Backend/Base de Datos:** Supabase o Firebase (PostgreSQL/NoSQL).
- **UI:** Diseño limpio, minimalista, modo lectura cómodo (tipografía legible) y paleta de colores sobria.

## 3. Esquema de Base de Datos (Modelos)

### Modelo: `Module` (Módulo)
- `id` (UUID, primary key)
- `title` (String) - Ej: "Módulo 1: La Naturaleza de la Verdad"
- `order_index` (Int) - Para ordenar del 1 al 4

### Modelo: `Lesson` (Clase/Semana)
- `id` (UUID, primary key)
- `module_id` (UUID, foreign key)
- `week_number` (Int)
- `title` (String)
- `book_chapters` (String) - Ej: "Capítulos 1 y 2"
- `content_html` (Text) - El contenido de la clase

### Modelo: `QuizQuestion` (Preguntas de Evaluación)
- `id` (UUID, primary key)
- `lesson_id` (UUID, foreign key)
- `question_type` (Enum: MULTIPLE_CHOICE, TRUE_FALSE, OPEN_REFLECTION)
- `question_text` (String)
- `options` (JSON) - Para respuestas múltiples
- `correct_answer` (String)
- `biblical_support` (Text) - Explicación bíblica al fallar/acertar

## 4. Estructura de Datos Semilla (Syllabus Inicial)

**MÓDULO 1: La Naturaleza de la Verdad y la Existencia de Dios**
- Semana 1: La Verdad sobre la Realidad (Caps 1 y 2). 
  - Evaluación: Ley de la no contradicción, táctica del correcaminos.
- Semana 2: El Argumento Cosmológico (Cap 3).
- Semana 3: El Argumento Teleológico Macro (Cap 4).
- Semana 4: El Argumento Teleológico Micro y Moral (Caps 5 y 6).

**MÓDULO 2: Milagros y la Confiabilidad de los Manuscritos**
- Semana 5: La Posibilidad de los Milagros (Cap 8).
- Semana 6: Crítica Textual y Bibliología (Cap 9).
- Semana 7: Testigos Oculares y Arqueología (Cap 10).
- Semana 8: Criterios de Autenticidad Apostólica (Caps 11 y 12).

**MÓDULO 3: La Cristología y la Resurrección**
- Semana 9: Las Credenciales Mesiánicas (Cap 13).
- Semana 10: El Clímax de la Fe - La Resurrección (Cap 13).
- Semana 11: Jesús y la Autoridad de la Biblia (Cap 14).
- Semana 12: Síntesis del Puente Lógico de 12 puntos.

**MÓDULO 4: Apologética Cultural**
- Semana 13: Teodicea (El problema del mal).
- Semana 14: Cosmovisiones en Choque.
- Semana 15: Apologética y Evangelismo Relacional.
- Semana 16: Defensa en Vivo y Examen Final.

## 5. Tareas del Agente (Action Plan)
1. **Generar UI:** Crea los componentes de navegación (Dashboard del alumno, Vista de Módulos, Vista de Lectura y Motor de Quizzes).
2. **Setup BD:** Escribe los scripts SQL/ORM para crear las tablas mencionadas.
3. **Poblar BD:** Crea un archivo `seed` para insertar el Módulo 1 y la Semana 1.
4. **Testing UI:** Ejecuta las pruebas automatizadas del flujo: Login -> Ver Lección 1 -> Completar Quiz.