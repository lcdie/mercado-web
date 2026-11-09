# 📱 Cómo poner esta web online (gratis) para que cualquier móvil la abra por un enlace

Esta carpeta es una web **independiente** del repositorio del proyecto. Solo tiene 3 archivos:

- `index.html` — la página
- `style.css` — los estilos
- `app.js` — las gráficas interactivas

No toca ni modifica tu repositorio `/home/luis/proyecto-mercado-10-octubre`.

---

## Opción A: GitHub Pages (gratis, permanente, recomendado)

1. Crea un repositorio nuevo en GitHub, por ejemplo `mercado-10-octubre-web`.
2. Sube los 3 archivos (`index.html`, `style.css`, `app.js`) a ese repositorio.
3. Ve a **Settings → Pages**.
4. En **Build and deployment → Source**, elige **Deploy from a branch** y selecciona `main` (o `master`) y la carpeta `/ (root)`.
5. Haz clic en **Save**.
6. En unos minutos, GitHub te dará un enlace como: `https://TU_USUARIO.github.io/mercado-10-octubre-web/`
7. Ese enlace se abre desde cualquier móvil.

---

## Opción B: Netlify Drop (gratis, sin configurar nada, arrastra y listo)

1. Ve a https://app.netlify.com/drop
2. Arrastra la carpeta `mercado-web/` (o los 3 archivos sueltos) a la zona de despliegue.
3. En segundos te dará un enlace público tipo `https://nombre-aleatorio.netlify.app`.
4. Ese enlace funciona en cualquier móvil.

---

## Opción C: Prueba rápida en tu misma red WiFi (solo tú y tu móvil)

Si solo quieres probarlo tú mismo en tu móvil conectado a la misma WiFi:

1. Abre una terminal en la carpeta de la web:
   ```bash
   cd /tmp/opencode/mercado-web
   python3 -m http.server 8000
   ```
2. Averigua la IP de tu computadora (ej. `192.168.1.15`).
3. En el móvil, abre: `http://192.168.1.15:8000`
   *(Solo funciona mientras tu computadora esté encendida y en la misma WiFi).*

---

## ¿Qué hace la web en el móvil?

- ✅ Diseño responsive (se adapta al ancho de pantalla)
- ✅ Botones grandes para tocar con el dedo
- ✅ Gráficas interactivas (Chart.js) que se pueden tocar y explorar
- ✅ Botón "Compartir en WhatsApp" (en Android funciona nativamente; en otros se copia el enlace)
- ✅ Botón "↑ volver arriba"
- ✅ Animaciones al cargar

---

## ⚠️ Importante

Esta web **no hace commit ni push a tu repositorio del proyecto**. Es un sitio aparte. Si quieres actualizarla, edita los archivos en `/tmp/opencode/mercado-web/` y vuelve a subirlos al hosting que elijas.
