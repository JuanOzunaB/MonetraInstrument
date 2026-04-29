# Guía del instrumento — Para qué sirve cada fase

> **Propósito de este documento:** Explicar qué datos recoge cada sección del instrumento y qué decisiones de producto o diseño te habilita tomar para construir Monetra.

---

## 1. Landing — Registro de sesión

**Qué es:** Pantalla de entrada donde el participante ingresa su nombre y elige el tipo de evaluación.

**Qué recoge:**
- Nombre del participante
- Tipo de sesión: `usuario` / `experto` / `benchmark`

**Para qué me sirve:**
- Segmentar los resultados en el dashboard — separa el feedback de usuarios finales del criterio técnico de expertos
- Agrupar múltiples sesiones del mismo participante si repite la evaluación

**Señal clave:** Si hay pocas sesiones de tipo `experto`, los criterios técnicos tienen menos peso estadístico — busca mínimo 3 expertos.

---

## 2. Sección A — Tarea de voz (Track usuario)

**Qué es:** El participante dicta transacciones financieras en voz ("compré 10 mil de queso") y el sistema las clasifica. Puede confirmar, corregir o rechazar cada resultado.

**Qué recoge:**
- Transcript del audio (lo que dijo el usuario)
- Tipo de transacción clasificado (gasto, ingreso, préstamo dado/recibido)
- Monto y descripción parseados por el LLM
- Categoría asignada automáticamente
- Si el usuario tuvo que corregir (correctionMode activado)

**Para qué me sirve:**
- **Validar el flujo core:** ¿STT → LLM → confirmación funciona de punta a punta con usuarios reales?
- **Medir precisión percibida:** Si los usuarios confirman sin corregir, el modelo clasifica bien al primer intento
- **Detectar casos límite:** Frases o acentos que el sistema no entiende bien quedan registrados en el transcript
- **Validar el flujo de corrección:** ¿Entendieron cómo usarlo? ¿Fue suficiente para recuperar errores?

**Señal clave:** Ratio correcciones / confirmaciones directas. Si > 30% de las transacciones requirieron corrección, el modelo o el STT tiene problemas con el vocabulario financiero colombiano.

---

## 3. Sección B — Cuestionario SUS (Track usuario)

**Qué es:** 9 preguntas de usabilidad en escala Likert 1–5, adaptadas del System Usability Scale estándar.

**Qué recoge:**
- Respuestas `sus_1` a `sus_9` (puntuación 1–5 por pregunta)

**Para qué me sirve:**
- Calcular un **score de usabilidad global** con metodología académica validada
- Comparar contra benchmarks de industria (promedio apps = 68, apps buenas = 80+)
- Identificar qué aspecto específico falla (complejidad percibida, confianza, curva de aprendizaje)

**Interpretación del score:**
| Rango | Significado | Acción |
|-------|-------------|--------|
| < 50 | Inaceptable | Rediseñar flujo completo |
| 50–68 | Por debajo del promedio | Iterar fuerte en UX |
| 68–80 | Aceptable | Pulir, escalar features |
| > 80 | Bueno | El flujo funciona, invertir en nuevas funcionalidades |

**Señal clave:** Las preguntas impares (1,3,5,7,9) son positivas y las pares (2,4,6,8) son negativas — si una pregunta negativa tiene score promedio alto, ese aspecto es un problema real.

---

## 4. Sección C — Preferencias de producto (Track usuario)

**Qué es:** El participante indica qué features quiere y cómo prefiere interactuar con la app.

**Qué recoge:**

*Features deseadas (7 checkboxes):*
- Entrada manual de gastos
- Exportar a CSV
- Gestión de préstamos y deudas
- Presupuesto por categoría
- Resumen semanal automático
- Widget en pantalla de inicio
- Análisis de hábitos con IA

*Preferencias de interacción (3 grupos de radio):*
- Modo de gestión de préstamos (automático / híbrido / manual / no me interesa)
- Modo de pago de tarjeta (automático / con confirmación / simple / no aplica)
- Preferencia de input (solo voz → solo manual, escala de 5 pasos)

**Para qué me sirve:**
- **Priorizar el roadmap:** Las features con más del 60% de selección son prioridad alta para el MVP+1
- **Decidir si construir el módulo de préstamos:** Si la mayoría elige "no me interesa", no es prioritario
- **Definir la experiencia de entrada:** Si "mostly_manual" o "half_half" son mayoría, hay que construir entrada manual antes del lanzamiento, no solo voz
- **Descubrir expectativas no evidentes:** El widget y los resúmenes semanales pueden ser más valorados de lo esperado

**Señal clave:** Si más del 50% elige "solo voz" o "mayormente voz" en input_pref → apuesta por voz como canal principal está validada.

---

## 5. Evaluación de experto

**Qué es:** Un experto (desarrollador, diseñador UX, o especialista financiero) evalúa la app en 6 criterios técnicos y de valor, con puntuación 1–5 o "No lo tengo claro".

**Qué recoge:**

| Criterio | Qué evalúa |
|----------|------------|
| `expert_stt` | Precisión del reconocimiento de voz en español colombiano y jerga financiera |
| `expert_llm` | Coherencia de la clasificación (distingue gasto de ingreso, préstamo de pago) |
| `expert_ux` | Claridad e intuitividad del flujo confirmar/corregir/rechazar |
| `expert_context` | Adaptación a la realidad financiera colombiana (COP, vocabulario local) |
| `expert_tech` | Viabilidad técnica de la arquitectura para escalar |
| `expert_value` | Valor real para el usuario / diferenciación competitiva |

**Para qué me sirve:**
- **Detectar gaps que usuarios no ven:** Un usuario puede confirmar sin notar que el LLM clasificó mal; el experto sí lo detecta
- **Validar la arquitectura antes de escalar:** Si `expert_tech` < 3 promedio, hay problemas estructurales que resolver antes de crecer
- **Identificar el cuello de botella más crítico:** El criterio con menor puntuación promedio = próxima prioridad de ingeniería
- **Evidencia académica:** Combinado con el SUS, da cobertura tanto cuantitativa como cualitativa para la tesis

**Señal clave:** Criterio con puntuación promedio más baja entre todos los expertos = punto de mejora prioritario para la siguiente iteración.

---

## 6. Benchmark técnico

**Qué es:** Comparativa automatizada de proveedores LLM usando 8 frases de prueba en español colombiano, ejecutadas en paralelo contra OpenAI y Groq.

**Qué recoge por cada frase × proveedor:**
- Si clasificó correctamente el tipo de transacción (`success: true/false`)
- Latencia de respuesta en milisegundos
- El intent parseado completo (tipo, monto, descripción, categoría)
- Mensaje de error si falló

**Las 8 frases de prueba cubren:**
- 5 gastos (diferentes vocabularios: "compré", "me gasté", "pagué", "tanqueé")
- 2 ingresos ("me depositaron el sueldo", "cobré al cliente")
- 1 préstamo dado ("le presté 30 mil")
- 1 préstamo recibido ("Juan me prestó 20 mil")

**Para qué me sirve:**
- **Decidir qué proveedor LLM usar en producción:** Accuracy vs. latencia
- **Detectar qué tipos de frase fallan:** Si los ingresos fallan más que los gastos, el prompt necesita ajuste
- **Tener datos para justificar la elección técnica** en la tesis con números reales
- **Comparar costo-beneficio:** Groq es gratis/más barato pero ¿la precisión es aceptable?

**Señal clave:**
- Si OpenAI tiene > 85% accuracy y Groq < 70% → OpenAI para producción aunque sea más caro
- Si latencia de Groq < 500ms y OpenAI > 1000ms con accuracy similar → Groq para mejor UX

---

## 7. Dashboard — Vista de resultados

**Qué es:** Panel de análisis que agrega todos los datos de todas las sesiones en tiempo real.

**Qué muestra:**
- KPIs: total de sesiones, score SUS promedio, accuracy del LLM, latencia promedio
- Distribución de respuestas SUS por pregunta
- Puntuaciones expertas por criterio
- Features más votadas (ranking)
- Preferencia de input (gráfico de distribución)
- Latencia por proveedor LLM
- Tabla de sesiones recientes

**Para qué me sirve:**
- **Sacar conclusiones de tesis** con visualizaciones listas para incluir en el documento
- **Detectar tendencias** entre sesiones (¿mejora la percepción con versiones más pulidas?)
- **Cruzar datos:** ¿Los usuarios que corrieron más correcciones dieron SUS más bajo?
- **Tener una fuente única de verdad** sin necesidad de exportar ni procesar datos manualmente

**Señal clave:** Si el SUS promedio y el accuracy del LLM van en la misma dirección (ambos altos o ambos bajos), la tecnología y la UX están alineadas. Si divergen, hay un problema de diseño que el buen modelo no puede compensar.

---

## Resumen de decisiones por fase

| Sección | Decisión que habilita |
|---------|----------------------|
| Landing | Segmentación de participantes |
| A — Voz | ¿El flujo core funciona? ¿El modelo es suficientemente preciso? |
| B — SUS | ¿La UX es aceptable para lanzar? |
| C — Preferencias | ¿Qué construir después? ¿Solo voz o también entrada manual? |
| Experto | ¿La arquitectura escala? ¿Qué componente mejorar primero? |
| Benchmark | ¿Qué proveedor LLM va a producción? |
| Dashboard | ¿Qué conclusiones puedo sostener con datos para la tesis? |
