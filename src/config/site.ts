// src/config/site.ts

export const siteConfig = {
    // ─── Identidad ─────────────────────────────────────────────
    // Cambia estos valores para personalizar tu instalación
    name: "SITE",
    description: "Lee series gratis",
    tagline: "Descubre miles de series de webtoon, manga y cómics de creadores independientes.",
    url: "https://tusitio.com",

    // ─── Logo ───────────────────────────────────────────────────
    // Opción A: pon tus archivos en /public y ajusta las rutas
    // Opción B: deja en null y se usará `name` como logo de texto
    logoUrl: null as string | null,       // ej: "/logo.svg"
    logoDarkUrl: null as string | null,   // ej: "/logo-dark.svg" (opcional)
} as const;