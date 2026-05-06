// src/config/site.ts
import { getSiteConfig } from "@/lib/actions/site-config";

// ─── Estático (fallback y compatibilidad con imports existentes) ──────────────
export const siteConfig = {
    name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Kotori Translations",
    description: "Lee series gratis",
    tagline: "Descubre miles de series de webtoon, manga y cómics.",
    url: process.env.NEXTAUTH_URL ?? "https://tusitio.com",
    logoUrl: null as string | null,
    logoDarkUrl: null as string | null,
};

// ─── Dinámico (usa DB, para server components) ────────────────────────────────
export async function getSiteSettings() {
    const config = await getSiteConfig();

    return {
        name: config.siteName ?? siteConfig.name,
        description: config.siteDescription ?? siteConfig.description,
        tagline: config.siteTagline ?? siteConfig.tagline,
        url: config.siteUrl ?? siteConfig.url,
        logoUrl: config.logoUrl ?? null,
        logoDarkUrl: config.logoDarkUrl ?? null,
        faviconUrl: config.faviconUrl ?? null,
        social: {
            twitter: config.socialTwitter ?? null,
            instagram: config.socialInstagram ?? null,
            youtube: config.socialYoutube ?? null,
            tiktok: config.socialTiktok ?? null,
            website: config.socialWebsite ?? null,
        },
        allowRegistration: config.allowRegistration,
        maintenanceMode: config.maintenanceMode,
    };
}
