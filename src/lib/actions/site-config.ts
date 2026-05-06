"use server";

// src/lib/actions/site-config.ts

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function isAdmin(email?: string | null) {
    const adminEmail = process.env.ADMIN_EMAIL;
    return !!adminEmail && email === adminEmail;
}

// ─── Leer config ──────────────────────────────────────────────────────────────

export async function getSiteConfig() {
    const config = await prisma.siteConfig.findUnique({
        where: { id: "default" },
    });

    return config ?? {
        id: "default",
        siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? "Mi Sitio",
        siteDescription: null,
        siteTagline: null,
        siteUrl: null,
        logoUrl: null,
        logoDarkUrl: null,
        faviconUrl: null,
        socialTwitter: null,
        socialInstagram: null,
        socialYoutube: null,
        socialTiktok: null,
        socialWebsite: null,
        allowRegistration: true,
        maintenanceMode: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

// ─── Guardar config ───────────────────────────────────────────────────────────

export async function updateSiteConfig(data: {
    siteName?: string;
    siteDescription?: string;
    siteTagline?: string;
    siteUrl?: string;
    logoUrl?: string;
    logoDarkUrl?: string;
    faviconUrl?: string;
    socialTwitter?: string;
    socialInstagram?: string;
    socialYoutube?: string;
    socialTiktok?: string;
    socialWebsite?: string;
    allowRegistration?: boolean;
    maintenanceMode?: boolean;
}) {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) {
        throw new Error("No autorizado");
    }

    const config = await prisma.siteConfig.upsert({
        where: { id: "default" },
        update: data,
        create: { id: "default", ...data },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/");

    return config;
}