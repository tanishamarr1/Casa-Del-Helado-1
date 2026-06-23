# La Casa Del Helado — Sitio Web Oficial

Sitio web profesional y panel administrativo completo para La Casa Del Helado, heladería artesanal en Santo Domingo, República Dominicana.

---

## Estructura de Archivos

```
lacasadelhelado/
├── index.html              ← Sitio web principal
├── supabase-setup.sql      ← Script SQL para crear tablas
├── README.md               ← Esta guía
│
├── assets/
│   └── favicon.svg         ← Ícono del sitio
│
├── js/
│   ├── supabase.js         ← Cliente Supabase (configura aquí tus keys)
│   ├── products.js         ← Carga y filtra productos del menú
│   ├── cart.js             ← Carrito + pedidos + WhatsApp
│   └── main.js             ← Scroll effects, nav, mobile menu
│
└── admin/
    ├── login.html          ← Login del administrador
    └── index.html          ← Panel completo de administración
```

---

## PASO 1: Crear proyecto en Supabase

1. Ve a **https://supabase.com** y crea una cuenta gratuita.
2. Haz clic en **"New Project"**.
3. Pon un nombre (ej: `lacasadelhelado`) y una contraseña segura.
4. Selecciona la región más cercana (ej: **US East** o **South America**).
5. Espera ~2 minutos a que se cree el proyecto.

---

## PASO 2: Obtener tus claves API

1. En tu proyecto Supabase, ve a **Settings → API**.
2. Copia:
   - **Project URL**: `https://xxxxxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJ...` (la clave larga)

---

## PASO 3: Configurar las claves en el proyecto

Abre el archivo `js/supabase.js` y reemplaza:

```javascript
const SUPABASE_URL = 'https://TU_PROYECTO.supabase.co';
const SUPABASE_KEY = 'TU_ANON_PUBLIC_KEY';
```

Con tus valores reales, por ejemplo:

```javascript
const SUPABASE_URL = 'https://abcdefghijklmnop.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6...';
```

---

## PASO 4: Crear las tablas en Supabase

1. En tu proyecto Supabase, ve a **SQL Editor**.
2. Crea un **New Query**.
3. Copia y pega todo el contenido del archivo `supabase-setup.sql`.
4. Haz clic en **Run**.

Esto creará:
- Tabla `productos` con RLS configurado
- Tabla `pedidos` con RLS configurado
- Datos de muestra del menú

---

## PASO 5: Crear el bucket de imágenes

1. En Supabase ve a **Storage → New bucket**.
2. Nombre: `productos`
3. Marca como **Public bucket** (para que las imágenes sean visibles).
4. Clic en **Save**.

---

## PASO 6: Crear el usuario administrador

1. En Supabase ve a **Authentication → Users → Invite User**.
2. Ingresa el correo del administrador (ej: `admin@lacasadelhelado.com`).
3. El usuario recibirá un email para establecer su contraseña.
4. También puedes crear el usuario desde **Authentication → Add User** y establecer contraseña manualmente.

---

## PASO 7: Configurar WhatsApp del negocio

En el archivo `js/cart.js`, línea ~73, cambia el número:

```javascript
const WHATSAPP_NUMBER = '18091234567'; // ← Tu número real con código de país
```

Ejemplo para República Dominicana:
```javascript
const WHATSAPP_NUMBER = '18095551234'; // +1 (809) 555-1234
```

---

## PASO 8: Actualizar información del negocio

En `index.html` busca y actualiza:

- **Número de teléfono** (busca `18091234567`)
- **Dirección** en la sección de ubicación
- **Google Maps** iframe con tu ubicación real
- **Redes sociales** (busca los links de Instagram, Facebook, Twitter)
- **Email** del negocio

---

## PASO 9: Publicar el sitio

### Opción A: Netlify (Gratis, Recomendado)
1. Ve a **https://netlify.com** y crea cuenta.
2. Arrastra la carpeta completa `lacasadelhelado/` a Netlify Drop.
3. Tu sitio queda en línea al instante con URL gratuita.
4. Para dominio propio: Netlify → Domain Settings → Add custom domain.

### Opción B: Vercel (Gratis)
1. Ve a **https://vercel.com**.
2. Sube el proyecto desde GitHub o arrastra la carpeta.

### Opción C: GitHub Pages (Gratis)
1. Sube el proyecto a un repositorio en GitHub.
2. Ve a Settings → Pages → Deploy from branch: `main`.

### Opción D: cPanel / Hosting dominicano
1. Accede a tu cPanel o FTP.
2. Sube todos los archivos a la carpeta `public_html/`.

---

## Funcionalidades incluidas

### Sitio web (index.html)
- Hero animado con propuesta de valor
- Menú digital con íconos por categoría
- Filtros por categoría (Helados, Batidas, Jugos, Tostadas, Otros)
- Búsqueda de productos en tiempo real
- Carrito de compras con persistencia local
- Modal de pedido con formulario completo
- Envío automático por WhatsApp con formato organizado
- Guardado de pedido en Supabase
- Mapa de Google Maps integrado
- Botón flotante de WhatsApp
- Diseño responsive (móvil, tablet, desktop)
- Animaciones suaves al hacer scroll
- SEO básico

### Panel Admin (admin/)
- Login seguro con Supabase Auth
- Dashboard con estadísticas en tiempo real
- Gestión completa de productos (CRUD)
- Vista de todos los pedidos con filtros por estado
- Cambio de estado de pedidos (Pendiente → Preparando → Entregado)
- Búsqueda de productos

---

## Personalización de colores

Los colores principales están definidos en `index.html` dentro de `<style>`:

```css
:root {
  --rose: #E8A0B4;        /* Rosa principal */
  --rose-light: #F5D0DC;  /* Rosa claro */
  --rose-dark: #C97A94;   /* Rosa oscuro (botones) */
  --lilac: #C4A8D4;       /* Lila */
  --cream: #FDF6F0;       /* Fondo crema */
}
```

---

## Soporte técnico

Si hay algún problema con Supabase, el sitio muestra automáticamente los productos de muestra incluidos en `js/products.js` para que siempre tenga contenido visible.

---

*Desarrollado con HTML5, Tailwind CSS, JavaScript Vanilla y Supabase.*
