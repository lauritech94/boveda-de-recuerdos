# 🔮 La Bóveda de Recuerdos

Experiencia interactiva inspirada en las esferas de recuerdos de *Inside Out*.
**30 bolas físicas con etiqueta NFC** → cada una abre un minijuego → al superarlo se desbloquea una **foto + un mensaje personal**. Al completar las 30, aparece el **recuerdo final**.

---

> ### ⚡ ¿Acabas de descargar un ZIP y no sabes qué hacer?
> **No lo arrastres a GitHub tal cual.** Primero **descomprímelo**, entra en la carpeta que se crea y sube **los archivos de dentro** (`README.md`, `package.json`, `src/`, `public/`…). Si subes el ZIP, la web no funcionará. Guía completa en el [paso 2](#2-subir-el-código-a-github).

## 📑 Índice

1. [Requisitos](#1-requisitos)
2. [Subir el código a GitHub](#2-subir-el-código-a-github)
3. [Ejecutar el proyecto en tu ordenador](#3-ejecutar-el-proyecto-en-tu-ordenador)
4. [Rellenar los 30 recuerdos (fotos y textos)](#4-rellenar-los-30-recuerdos-fotos-y-textos)
5. [Publicar la web en internet](#5-publicar-la-web-en-internet)
6. [Grabar las etiquetas NFC](#6-grabar-las-etiquetas-nfc)
7. [Estructura del proyecto](#7-estructura-del-proyecto)
8. [Problemas frecuentes](#8-problemas-frecuentes)

---

## 1. Requisitos

| Qué | Para qué | Dónde |
|---|---|---|
| **Node.js 18 o superior** | Ejecutar y compilar la web | <https://nodejs.org> (descarga la versión LTS) |
| **Git** | Subir el código a GitHub | <https://git-scm.com/downloads> |
| **Cuenta de GitHub** | Guardar el código y publicar la web | <https://github.com/signup> |
| **Editor de código** (recomendado) | Modificar archivos | [VS Code](https://code.visualstudio.com) |

Para comprobar que están instalados, abre la terminal y escribe:

```bash
node -v    # debe mostrar algo como v20.11.0
git --version
```

---

## 2. Subir el código a GitHub

### Paso 1 · Crear el repositorio vacío

1. Entra en <https://github.com/new>
2. **Repository name**: `boveda-de-recuerdos`
3. Elige **Private** (privado) si no quieres que nadie más lo vea. 
   ⚠️ *Si quieres publicarlo gratis con GitHub Pages, debe ser **Public**, o tener GitHub Pro.*
4. **NO** marques "Add a README file" (ya tienes uno).
5. Pulsa **Create repository**.

### Paso 2 · Subir los archivos

Tienes dos opciones. La **A** es la más sencilla si no has usado Git nunca.

<details open>
<summary><b>Opción A · Arrastrar archivos desde el navegador (sin terminal)</b></summary>

> ### ❌ NO subas el ZIP
> Si arrastras el `boveda-de-recuerdos.zip` tal cual, GitHub lo guardará como **un archivo comprimido** dentro del repositorio. La web **no funcionará**: nadie puede leer el código de dentro, y GitHub Pages no sabrá qué hacer con él.
>
> Primero hay que **descomprimir** y subir lo que hay **dentro**.

**Paso a paso:**

1. **Descomprime el ZIP**: haz clic derecho sobre el archivo → *Extraer todo* (Windows) o doble clic (Mac). Obtendrás una carpeta, por ejemplo `boveda-de-recuerdos/`.
2. **Abre esa carpeta.** Tienes que ver directamente archivos como `README.md`, `package.json`, `index.html` y las carpetas `src/` y `public/`.
   - ✅ Correcto: entras en la carpeta y ves `package.json`
   - ❌ Incorrecto: solo ves otra carpeta con el mismo nombre (entra un nivel más)
3. **Borra la carpeta `node_modules`** si existe (es enorme y no hace falta subirla). También puedes borrar `dist/`.
4. Selecciona **todo** lo que hay dentro (Ctrl+A / Cmd+A) — `README.md`, `package.json`, `index.html`, `src/`, `public/`, `.github/`, `.gitignore`…
5. En tu repositorio recién creado, pulsa el enlace **"uploading an existing file"**.
6. **Arrastra esa selección** (los archivos sueltos, no el ZIP) a la ventana.
7. Abajo escribe un mensaje (ej. *Primera versión*) y pulsa **Commit changes**.

**Cómo debe quedar tu repositorio al terminar:**

```
boveda-de-recuerdos/
├── .github/workflows/deploy.yml   ← importante, hace la publicación automática
├── .gitignore
├── README.md
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── public/
└── src/
```

> ⚠️ **La carpeta `.github` es la más importante** y a veces el navegador no la arrastra por empezar con un punto (la considera "oculta"). Si no aparece en la lista de archivos subidos, créala a mano:
> 1. Botón **Add file → Create new file**
> 2. Como nombre escribe la ruta completa: `.github/workflows/deploy.yml`
> 3. Copia dentro el contenido de ese mismo archivo del proyecto
> 4. **Commit changes**
>
> Sin ese archivo, la web **no se publicará** en GitHub Pages.

> 💡 Si en tu ordenador no ves carpetas que empiezan por punto, actívalas: en el explorador de Windows → pestaña *Vista* → marca *Elementos ocultos*. En Mac: en el Finder pulsa `Cmd + Mayús + .`

</details>

<details>
<summary><b>Opción B · Con la terminal (recomendado para seguir trabajando)</b></summary>

Abre la terminal **dentro de la carpeta del proyecto** y ejecuta línea a línea:

```bash
# 1. Inicializar el repositorio
git init

# 2. Añadir todos los archivos (node_modules se ignora solo gracias a .gitignore)
git add .

# 3. Primer guardado
git commit -m "Primera versión: La Bóveda de Recuerdos"

# 4. Usar 'main' como rama principal
git branch -M main

# 5. Conectar con tu repositorio de GitHub (cambia TU-USUARIO)
git remote add origin https://github.com/TU-USUARIO/boveda-de-recuerdos.git

# 6. Subirlo
git push -u origin main
```

Te pedirá usuario y contraseña: en la contraseña **no vale tu clave normal**, hay que usar un *Personal Access Token*. Créalo en <https://github.com/settings/tokens> → *Generate new token (classic)* → marca la casilla **repo** → copia el token y pégalo como contraseña.

</details>

### Paso 3 · Guardar cambios más adelante

Cada vez que modifiques algo:

```bash
git add .
git commit -m "Añadidas fotos de los recuerdos 1 al 10"
git push
```

---

## 3. Ejecutar el proyecto en tu ordenador

Dentro de la carpeta del proyecto:

```bash
npm install      # solo la primera vez: descarga las dependencias
npm run dev      # arranca la web en modo desarrollo
```

Abre el enlace que aparece (normalmente <http://localhost:5173>). Los cambios que hagas en el código se ven al instante.

**Otros comandos:**

```bash
npm run build    # genera la web final en la carpeta dist/
npm run preview  # prueba el resultado compilado
```

> 💡 **Probar desde el móvil en casa:** ejecuta `npm run dev -- --host` y abre en el móvil la dirección `http://192.168.x.x:5173` que aparece en la terminal (ambos en el mismo WiFi).

---

## 4. Rellenar los 30 recuerdos (fotos y textos)

### 4.1 · Usar el panel de edición (lo más cómodo)

1. Abre la web y pulsa **⚙️ Editar fichas** (o añade `?editar=1` a la URL).
2. Despliega cada esfera y rellena:
   - **Foto** (subir archivo o pegar una URL)
   - **Mensaje personal** que verá tu hermana
   - **Título, emoción, época y pista**
   - **Ajustes del juego**: el año secreto, el apodo del Wordle, la fecha del candado, las preguntas del trivial…
3. Pulsa **Exportar JSON** → se descargará el archivo **`recuerdos.json`**.

### 4.2 · Publicar ese contenido para que lo vea tu hermana ⚠️ IMPORTANTE

El panel guarda los cambios **solo en tu navegador**. Para que las fotos y textos aparezcan en el móvil de tu hermana:

1. Coge el archivo **`recuerdos.json`** que acabas de exportar.
2. Colócalo dentro de la carpeta **`public/`** del proyecto (debe quedar como `public/recuerdos.json`).
3. Sube el cambio a GitHub:
   ```bash
   git add .
   git commit -m "Contenido de los 30 recuerdos"
   git push
   ```

La web carga automáticamente ese archivo al abrirse. 👌

> Si prefieres escribir los textos directamente en el código, están en **`src/data/memories.ts`**.

### 4.3 · Consejo sobre las fotos

- Las fotos subidas se comprimen, pero 30 fotos grandes pueden hacer el `recuerdos.json` muy pesado.
- **Alternativa recomendada:** mete las fotos en la carpeta `public/fotos/` (por ejemplo `public/fotos/01.jpg`) y en el panel escribe la URL `fotos/01.jpg` en vez de subir el archivo. Así todo va mucho más ligero.

---

## 5. Publicar la web en internet

Necesitas una URL pública para poder grabarla en las etiquetas NFC. Elige **una** opción:

### Opción A · GitHub Pages (gratis, ya configurado) ⭐

El repositorio incluye `.github/workflows/deploy.yml`, que compila y publica solo.

1. En tu repositorio: **Settings** → **Pages** (menú lateral).
2. En **Source**, elige **GitHub Actions**.
3. Haz cualquier `git push` a la rama `main` (o ve a la pestaña **Actions** y lanza el flujo a mano).
4. Espera 1-2 minutos. Tu web estará en:
   ```
   https://TU-USUARIO.github.io/boveda-de-recuerdos/
   ```

> El proyecto se compila en **un único archivo HTML**, por eso funciona en subcarpetas sin configurar nada más.

### Opción B · Netlify (muy fácil, admite repos privados)

1. Entra en <https://app.netlify.com> → **Add new site** → **Import an existing project**.
2. Conecta tu GitHub y elige el repositorio.
3. Configuración: **Build command** `npm run build` · **Publish directory** `dist`.
4. **Deploy**. Te dará una URL tipo `https://nombre-aleatorio.netlify.app` (puedes cambiar el nombre en *Site settings*).

### Opción C · Vercel

1. Entra en <https://vercel.com/new>, importa el repositorio.
2. Detecta Vite automáticamente → pulsa **Deploy**.

---

## 6. Grabar las etiquetas NFC

Cada esfera tiene su propia dirección: se añade `?bola=NÚMERO` al final de tu URL.

```
https://TU-USUARIO.github.io/boveda-de-recuerdos/?bola=1     ← esfera 1
https://TU-USUARIO.github.io/boveda-de-recuerdos/?bola=2     ← esfera 2
...
https://TU-USUARIO.github.io/boveda-de-recuerdos/?bola=30    ← esfera 30
```

**Cómo grabarlas:**

1. Consigue etiquetas **NTAG213/215** (las típicas pegatinas NFC).
2. Instala una app gratuita: **NFC Tools** (Android e iOS).
3. En la app: **Escribir** → **Añadir un registro** → **URL** → pega la dirección de esa bola.
4. Pulsa **Escribir** y acerca la etiqueta al móvil.
5. *(Opcional)* Usa **Bloquear etiqueta** para que no se pueda modificar.
6. Mete la etiqueta dentro de la bola y **anota el número** en ella.

> 📋 En el panel de edición → **Imprimir fichas** tienes las 30 fichas con su URL, su reto y casillas para marcar ☐ Foto ☐ Texto ☐ NFC ☐ Bola montada. Ideal para no perderte.

**iPhone:** el lector NFC funciona solo (iPhone XS o posterior) acercando la parte superior trasera. **Android:** activa NFC en Ajustes.

---

## 7. Estructura del proyecto

```
├── public/
│   ├── recuerdos.json      ← (lo añades tú) contenido publicado: fotos + textos
│   └── fotos/              ← (opcional) tus imágenes
├── src/
│   ├── App.tsx             ← pantalla principal: la bóveda y las estanterías
│   ├── data/
│   │   ├── memories.ts     ← ⭐ LOS 30 RECUERDOS (títulos, pistas, textos, juegos)
│   │   └── store.ts        ← guardado, progreso, exportar/importar
│   ├── components/
│   │   ├── Sphere.tsx           ← la esfera de recuerdo (SVG)
│   │   ├── MemoryExperience.tsx ← pista → reto → revelación
│   │   ├── Editor.tsx           ← panel de edición de las 30 fichas
│   │   └── PrintSheets.tsx      ← fichas imprimibles
│   └── games/
│       ├── registry.tsx    ← catálogo de minijuegos y sus opciones
│       ├── set1.tsx        ← juegos 1-10
│       ├── set2.tsx        ← juegos 11-20
│       └── set3.tsx        ← juegos 21-31
└── .github/workflows/deploy.yml  ← publicación automática
```

**Para cambiar qué juego tiene cada bola:** edita el campo `gameKey` en `src/data/memories.ts` (o cámbialo desde el panel de edición, que es más fácil).

---

## 8. Problemas frecuentes

| Problema | Solución |
|---|---|
| `npm: command not found` | No tienes Node.js instalado → <https://nodejs.org> |
| La web se ve en blanco | Abre la consola del navegador (F12) y mira el error. Suele ser un `npm install` que falta. |
| Mi hermana no ve las fotos | No publicaste `public/recuerdos.json` → repite el [paso 4.2](#42--publicar-ese-contenido-para-que-lo-vea-tu-hermana-️-importante). |
| "No se pudo guardar: las fotos ocupan demasiado" | Usa URLs de imagen (`fotos/01.jpg`) en lugar de subir archivos. |
| GitHub Pages da 404 | En *Settings → Pages* el **Source** debe ser **GitHub Actions**. Revisa que el flujo terminó en verde en la pestaña *Actions*. |
| La etiqueta NFC no abre nada | Comprueba que grabaste una **URL completa** (con `https://`) y que el NFC está activado. |
| Quiero reiniciar el progreso | Botón **Reiniciar progreso** al final de la página (no borra fotos ni textos). |
| El progreso aparece vacío en otro móvil | Es normal: el progreso se guarda en cada dispositivo. Tu hermana debe usar siempre el mismo móvil. |

---

## 💛 Antes del gran día: lista de comprobación

- [ ] Las 30 fichas tienen foto y mensaje personal
- [ ] El recuerdo final está escrito
- [ ] `public/recuerdos.json` subido a GitHub
- [ ] La web pública abre bien **desde el móvil**
- [ ] Las 30 etiquetas NFC grabadas y probadas una a una
- [ ] Cada etiqueta dentro de su bola, con su número apuntado
- [ ] Progreso reiniciado para que ella empiece desde cero

¡Que la disfrute! 🔮
