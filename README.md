# Webtoon Stack

Una plataforma open source para publicar y leer webtoons, manga, manhwa y cómics. Construida con Next.js, Prisma y Cloudflare R2. Lista para desplegar en Vercel + Neon o en tu propio VPS.

---

## ✨ Features

- 🔐 Autenticación con Google (NextAuth)
- 👤 Perfiles públicos de creadores
- 📖 Soporte para webtoon, manga, manhwa, comic y novela
- 🖼️ Almacenamiento de imágenes con Cloudflare R2
- ❤️ Likes, comentarios, bookmarks e historial de lectura
- 🔔 Sistema de notificaciones
- 🛡️ Panel de administración en `/admin/settings`
- 🌐 Compatible con Vercel + Neon o VPS propio

---

## 🛠️ Stack

| Tecnología | Uso |
|---|---|
| [Next.js](https://nextjs.org/) | Framework principal |
| [TypeScript](https://www.typescriptlang.org/) | Tipado estático |
| [Tailwind CSS](https://tailwindcss.com/) | Estilos |
| [Prisma](https://www.prisma.io/) | ORM |
| [PostgreSQL](https://www.postgresql.org/) | Base de datos |
| [NextAuth.js](https://next-auth.js.org/) | Autenticación |
| [Cloudflare R2](https://www.cloudflare.com/products/r2/) | Almacenamiento de imágenes |

---

## 🚀 Instalación

### Prerequisitos

- Node.js 18+
- PostgreSQL (local, [Neon](https://neon.tech) u otro proveedor)
- Cuenta de Google Cloud (para OAuth)
- Cuenta de Cloudflare (para R2)

---

### 1. Clona el repositorio

```bash
git clone https://github.com/tu-usuario/webtoon-stack.git
cd webtoon-stack
```

---

### 2. Instala dependencias

```bash
npm install
# o
pnpm install
```

---

### 3. Configura las variables de entorno

Crea un archivo `.env` en la raíz del proyecto copiando el ejemplo:

```bash
cp .env.example .env
```

Luego llena cada variable:

```env
# -----------------------------------------------
# BASE DE DATOS
# -----------------------------------------------
# Cadena de conexión de PostgreSQL
# Ejemplo local:      postgresql://user:password@localhost:5432/webtoon
# Ejemplo Neon:       postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require
DATABASE_URL=

# -----------------------------------------------
# NEXTAUTH
# -----------------------------------------------
# Genera un secret seguro con: openssl rand -base64 32
NEXTAUTH_SECRET=

# En producción pon "true", en desarrollo déjalo vacío o "false"
AUTH_TRUST_HOST=

# URL base de tu aplicación
# Desarrollo:   http://localhost:3000
# Producción:   https://tudominio.com
NEXTAUTH_URL=

# -----------------------------------------------
# GOOGLE OAUTH
# Para obtenerlos: https://console.cloud.google.com
# Crea un proyecto → Credenciales → OAuth 2.0
# URI de redirección: [NEXTAUTH_URL]/api/auth/callback/google
# -----------------------------------------------
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# -----------------------------------------------
# CLOUDFLARE R2 (almacenamiento de imágenes)
# Panel de Cloudflare → R2 → Tu bucket
# -----------------------------------------------
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=

# URL pública de tu bucket R2 (con dominio personalizado o el de R2)
NEXT_PUBLIC_R2_PUBLIC_URL=
R2_PUBLIC_URL=

# -----------------------------------------------
# APP
# -----------------------------------------------
NEXT_PUBLIC_APP_NAME=Webtoon Stack
NEXT_PUBLIC_APP_URL=http://localhost:3000

# -----------------------------------------------
# ADMIN
# El email que tendrá acceso al panel /admin
# -----------------------------------------------
ADMIN_EMAIL=
```

> 💡 **Tip:** Hay muchos tutoriales en YouTube sobre cómo configurar Google OAuth y Cloudflare R2. Busca "NextAuth Google OAuth setup" y "Cloudflare R2 Next.js".

---

### 4. Configura la base de datos

Ejecuta las migraciones de Prisma para crear todas las tablas:

```bash
npx prisma migrate deploy
```

O en desarrollo, si quieres crear una migración nueva:

```bash
npx prisma migrate dev --name init
```

Opcionalmente, abre Prisma Studio para ver tu base de datos:

```bash
npx prisma studio
```

---

### 5. Corre el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

### 6. Configura CORS en Cloudflare R2

Para que el navegador pueda subir y cargar imágenes desde tu dominio, necesitas configurar CORS en tu bucket de R2. Sin esto, las imágenes no van a funcionar.

Ve a **Cloudflare Dashboard → R2 → Tu bucket → Settings → CORS Policy** y pega lo siguiente:

```json
[
  {
    "AllowedOrigins": [
      "https://tudominio.com"
    ],
    "AllowedMethods": [
      "GET",
      "HEAD",
      "PUT",
      "POST"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

> ⚠️ Reemplaza `https://tudominio.com` con la URL real de tu aplicación. Si usas Vercel, sería algo como `https://mi-proyecto.vercel.app`. En desarrollo puedes agregar `http://localhost:3000` como origen adicional en el array.

---

## ⚙️ Panel de administración

Una vez que hayas iniciado sesión con el email definido en `ADMIN_EMAIL`, accede al panel en:

```
http://localhost:3000/admin/settings
```

Desde ahí puedes configurar el nombre del sitio, descripción, redes sociales, permitir/bloquear registros y más.

---

## 🤖 Personalización con IA

Este proyecto está pensado para que lo hagas tuyo. Puedes usar **Claude**, **ChatGPT** u otra IA para modificar el diseño, cambiar la estructura, agregar funciones nuevas o adaptar la plataforma a tu comunidad.

Algunas ideas de lo que puedes pedirle a una IA:

- *"Cambia el color principal del tema a morado"*
- *"Agrega un sistema de ratings con estrellas a las series"*
- *"Crea una página de ranking de los webtoons más vistos"*
- *"Agrega soporte para capítulos en formato PDF"*

Para mejores resultados, comparte con la IA el archivo relevante y describe exactamente qué quieres cambiar. El schema de Prisma (`prisma/schema.prisma`) es un buen punto de partida si quieres agregar nuevos modelos.

---

## ☁️ Despliegue

### Opción A — Vercel + Neon (recomendado para empezar)

1. Crea una base de datos en [neon.tech](https://neon.tech) y copia la `DATABASE_URL`.
2. Importa el repositorio en [vercel.com](https://vercel.com).
3. Agrega todas las variables de entorno en **Settings → Environment Variables**.
4. Despliega. Vercel se encarga del resto.

### Opción B — VPS propio

1. Clona el repo en tu servidor.
2. Configura el `.env` igual que en desarrollo.
3. Construye la aplicación:

```bash
npm run build
npm start
```

4. Usa un proxy inverso como **Nginx** o **Caddy** para apuntar tu dominio al puerto 3000.

---

## 📁 Estructura del proyecto (resumen)

```
├── app/                  # Rutas y páginas (Next.js App Router)
├── components/           # Componentes reutilizables
├── lib/                  # Utilidades, auth, db
├── prisma/
│   └── schema.prisma     # Modelos de la base de datos
├── public/               # Archivos estáticos
└── .env.example          # Variables de entorno de ejemplo
```

---

## 🤝 Contribuir

¡Los PRs son bienvenidos! Si encuentras un bug o tienes una idea, abre un issue.

1. Haz fork del repositorio
2. Crea una rama: `git checkout -b feat/mi-feature`
3. Haz commit: `git commit -m 'feat: agrego mi feature'`
4. Push: `git push origin feat/mi-feature`
5. Abre un Pull Request

---

## 📄 Licencia

MIT — úsalo, modifícalo y compártelo libremente.

---

> Si lo usas en tu proyecto, ¡una estrella en GitHub siempre se agradece! ⭐
