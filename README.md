# Checklist CYTMA 2027 A: proyecto LLM on premise

Tablero web, pensado para celulares, donde el equipo del proyecto ve las tareas de la presentación en CYTMA 2027 A, quién las tiene y en qué estado están (Pendiente, En curso, Hecha). Cualquiera con el link puede cambiar estados, editar, borrar o agregar tareas. No hay login.

Los cambios se guardan en Netlify Blobs y los ve todo el equipo: la página se actualiza sola cada 15 segundos y cada vez que se vuelve a abrir.

## Desplegar en Netlify (una sola vez)

1. En Netlify: **Add new project → Import an existing project → GitHub** y elegí este repositorio.
2. Dejá la configuración tal como la propone Netlify. Todo está en `netlify.toml`: se publica la carpeta `public`, la función está en `netlify/functions` y no hay comando de build.
3. **Deploy**. Netlify instala `@netlify/blobs` desde `package.json` y publica la función `/api/tasks`.
4. Opcional: en la configuración del proyecto, cambiá el nombre por uno corto (por ejemplo `cytma2027-llm`) para que el link quede `https://cytma2027-llm.netlify.app`.
5. Compartí el link por WhatsApp. El botón de compartir de la página abre el menú de Android.

Cada `git push` a `main` vuelve a desplegar. **Las tareas y sus estados no se pierden al redesplegar.**

> No uses el despliegue por arrastrar y soltar (Netlify Drop): no publica la función y la página queda en «Modo local», guardando solo en cada teléfono.

## Cómo se usa

- **Franja de días**: muestra cada día hasta el cierre de SIGEVA. Las barritas son las tareas de ese día: gris pendiente, amarillo en curso, verde hecha, rojo atrasada. Tocar un día lleva a sus tareas.
- **Días colapsados**: muestran su estado (Completo, En curso o Pendiente). Los días pasados con todo hecho se colapsan solos.
- **Tocar una tarea** abre el detalle: un toque en Pendiente, En curso o Hecha cambia el estado. Desde ahí también se edita o se borra. Al borrar aparece **Deshacer** durante unos segundos.
- **Agregar tarea**: el botón "+" de abajo a la derecha. Mientras se hace scroll se amplía con el texto.
- **Filtros**: por persona (los chips) y por estado (tocando los contadores).
- **¿Quién sos?**: cada uno elige su nombre una vez, queda guardado en su teléfono y se registra quién hizo cada cambio.

## Cambiar textos, personas o las tareas iniciales

Todo está en `public/js/config.js`: título, fecha de cierre, aviso, personas, feriados y la lista inicial de tareas.

Las tareas iniciales se cargan **solo la primera vez** que se abre la página desplegada. Después, la lista vive en Netlify Blobs y se edita desde la propia página. Para empezar de cero con la lista de `config.js`, cambiá el valor de `STORE` en `netlify/functions/tasks.mjs` (por ejemplo, a `tablero-cytma-2027-v2`) y hacé push.

Para corregir tareas ya guardadas sin borrar lo que hizo el equipo, se usa una migración en `netlify/migrations/`. Cada una corre una sola vez, en la primera visita después del despliegue. Solo cambia los campos que nadie editó desde la app, los estados solo avanzan y no recrea tareas borradas. Hay tres: `2026-11-09-roles.mjs` (cambio de roles), `2026-11-10-avance.mjs` (FPI-002 y nota subidos al SPI, horas, fechas de lo que falta en SIGEVA y la tarea del rubro de Colab) y `2026-11-10-colab.mjs` (esa tarea pasa a miércoles o jueves).

## Estructura

```
public/
  index.html        página
  styles.css        estilos
  js/config.js      configuración y tareas iniciales
  js/core.js        reglas de las tareas (las usan la página y la función)
  js/app.js         interfaz
netlify/functions/
  tasks.mjs         API: GET /api/tasks y POST /api/tasks
netlify/migrations/ cambios únicos sobre las tareas ya guardadas
netlify.toml
package.json
```

La API guarda una entrada por tarea, así dos personas que actualizan tareas distintas al mismo tiempo no se pisan. Si dos personas cambian **la misma** tarea a la vez, queda el último cambio.

## Probar en la computadora

```
npm install
npx netlify-cli dev
```

Abre `http://localhost:8888` con la función y un almacenamiento local de prueba.
