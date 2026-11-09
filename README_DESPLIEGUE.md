# Cómo publicar esta web

Esta carpeta es un sitio **estático** independiente del repositorio del proyecto.
No necesita build, servidor Node ni base de datos: solo HTML, CSS, JS e imágenes.

## Contenido

```
index.html                  Página principal
style.css                   Estilos y diseño responsive
app.js                      Gráficas interactivas y controles
favicon.svg                 Icono del sitio
img/                        Las 5 gráficas originales del repositorio
vendor/chart.umd.min.js     Chart.js 4.4.7 (local, sin CDN)
vendor/hammer.min.js        Soporte táctil para Chart.js
vendor/chartjs-plugin-zoom.min.js  Zoom y arrastre de gráficas
README_DESPLIEGUE.md        Este archivo
```

Las librerías están incluidas en `vendor/`, así que la web funciona sin depender
de un CDN y no se rompe si el visitante tiene bloqueadores de terceros.

## Publicación — GitHub Pages (enlace público)

El repositorio de esta web es `lcdie/mercado-web`. El remoto ya está configurado
por SSH:

```bash
git remote -v
# origin  git@github.com:lcdie/mercado-web.git (fetch)
# origin  git@github.com:lcdie/mercado-web.git (push)
```

Si por alguna razón apareciera un remoto HTTPS (`https://github.com/...`), se
cambia a SSH con:

```bash
git remote set-url origin git@github.com:lcdie/mercado-web.git
```

Publicar los cambios (desde el clon de trabajo `mercado-web-clone/`):

```bash
cd /tmp/opencode/mercado-web-clone
git add .
git commit -m "Web interactiva: datos verificados y mejoras móviles"
git push -u origin main
```

Luego, en GitHub:

1. Abrir <https://github.com/lcdie/mercado-web/settings/pages>.
2. En **Build and deployment → Source**, elegir **Deploy from a branch**.
3. Rama: `main`; carpeta: `/ (root)`.
4. Guardar y esperar 1–2 minutos.

La dirección pública queda:

**https://lcdie.github.io/mercado-web/**

Se puede abrir desde cualquier teléfono y compartir con el botón «Compartir»
(usa el menú nativo del móvil o copia el enlace).

### Si GitHub pide usuario y contraseña

Eso significa que el remoto sigue en HTTPS. Verificar con `git remote -v` y
cambiarlo a SSH como se indicó arriba. La clave SSH debe estar cargada:

```bash
ssh -T git@github.com
# Hola lcdie! Has authenticated successfully...
```

## Comprobaciones antes de publicar

- [ ] Las 5 gráficas se dibujan y responden al pasar el mouse o tocar.
- [ ] Las pestañas «Interactiva» / «Original del repo» cambian de vista.
- [ ] Los botones de filtro (media/mediana, top-4, dona/barras) actualizan la gráfica.
- [ ] El menú móvil abre y cierra.
- [ ] El botón «Compartir» funciona o copia el enlace.
- [ ] Las imágenes originales abren en el visor y se pueden ampliar.
- [ ] No hay errores en la consola del navegador.

## Nota sobre los datos

Las gráficas interactivas usan las cifras del **informe final** (122
publicaciones confirmadas). Las imágenes de `img/` son las que genera
`graficos/generar_graficas.py` en el repositorio original y, por usar una
clasificación algo distinta, muestran algunos `n` diferentes. Esa diferencia
está explicada en la sección «Nota técnica» de la propia web.

Esta web **no modifica** el repositorio del proyecto: solo enlaza a él.
