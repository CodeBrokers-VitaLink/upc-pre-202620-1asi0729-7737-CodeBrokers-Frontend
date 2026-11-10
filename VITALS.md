# Referencias de las mediciones iniciales

Los limites de entrada son decisiones del producto para detectar errores de captura,
no fronteras de lo biologicamente posible ni criterios de normalidad. Se aplican
al registro inicial de pacientes, tanto en Angular como en el backend.

| Medicion | Entrada admitida |
| --- | --- |
| Frecuencia cardiaca | 20-300 bpm |
| Saturacion | 1-100 % |
| Glucosa | 20-1000 mg/dL |
| Sistolica | 40-300 mmHg |
| Diastolica | 20-200 mmHg |

La sistolica debe superar la diastolica. Las alertas no bloquean valores dentro
del rango de entrada. No se modifica ninguna medicion historica.

Los indicadores se limitan a adultos (18 anos o mas). Para frecuencia cardiaca se
usa la referencia de adulto en reposo 60-100; la alerta alta por debajo de 40 o desde
150 es una regla orientativa del producto, no un diagnostico ni un umbral universal.
Para saturacion: 95-100 de referencia, 89-94 revisar y hasta 88 alerta alta. La
altitud, condiciones individuales y precision del dispositivo requieren contexto.
Para glucosa: menos de 55 o desde 300 genera alerta alta orientativa; 55 a menos
de 70 requiere revision. No se etiqueta como normal una glucosa sin contexto de
ayuno/alimentacion. Un unico valor alto no diagnostica cetoacidosis.
Para presion, ambos valores determinan la clasificacion: mas de 180 sistolica o
120 diastolica genera alerta alta; 90 a menos de 120 y 60 a menos de 80 se muestran
en rango de referencia; otros valores requieren revision. La ausencia de una
alerta alta no descarta una urgencia segun sintomas o contexto.

Fuentes consultadas:
- https://www.heart.org/en/health-topics/high-blood-pressure/the-facts-about-high-blood-pressure/all-about-heart-rate-pulse
- https://www.heart.org/en/healthy-living/exercise-and-physical-activity/fitness-basics/target-heart-rates
- https://medlineplus.gov/lab-tests/pulse-oximetry/
- https://www.cdc.gov/diabetes/treatment/treatment-low-blood-sugar-hypoglycemia.html
- https://www.cdc.gov/diabetes/diabetes-testing/index.html
- https://www.cdc.gov/diabetes/about/diabetic-ketoacidosis.html
- https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings
