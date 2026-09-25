FA-23 GRADIENTE — MÓDULO INDEPENDIENTE
==========================================

Archivos:
- gradient-data.js   Datos maestros de la digitalización.
- gradient-engine.js Motor matemático.
- gradient-view.html  Pantalla de análisis.
- gradient-view.css   Estilo visual.

Instalación:
1. Copiar esta carpeta "gradient" dentro de la carpeta raíz del TOLD.
2. Debe existir ../data/FA23-Gradiente.png desde gradient-view.html.
3. Abrir gradient-view.html para probar el motor independientemente.

Entradas continuas:
- Takeoff Factor: 2–10
- Pressure Altitude: 0–8000 ft
- Gross Weight: 10000–19000 lb
- Tailwind: 0–40 kt

El motor interpola entre las curvas digitalizadas cuando el valor es intermedio.
No extrapola fuera del dominio de las curvas.
