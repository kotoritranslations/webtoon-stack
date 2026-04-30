// src/app/api/series/[id]/route.ts
// Agrega el método PUT para actualizar todos los campos de la serie

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFromR2, fileExistsInR2 } from "@/lib/r2";

// ─── PATCH /api/series/[id] ───────────────────────────────────────────────────
// Body: { isPublished: boolean }

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json() as { isPublished?: boolean };

        const series = await prisma.series.findUnique({
            where: { id },
            select: { creatorId: true },
        });

        if (!series) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
        if (series.creatorId !== session.user.id) {
            return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
        }

        const updated = await prisma.series.update({
            where: { id },
            data: {
                ...(body.isPublished !== undefined ? { isPublished: body.isPublished } : {}),
            },
            select: { id: true, isPublished: true },
        });

        return NextResponse.json({ series: updated });
    } catch (error) {
        console.error("[PATCH /api/series/:id]", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

// ─── PUT /api/series/[id] ─────────────────────────────────────────────────────
// Actualiza todos los campos de la serie
//
// Body JSON:
// {
//   title       : string
//   synopsis    : string | null
//   coverUrl    : string
//   coverKey    : string
//   bannerUrl   : string | null
//   bannerKey   : string | null
//   status      : string
//   ageRating   : string
//   format      : string
//   readingDir  : string
//   genreIds    : string[]
//   isPublished : boolean
//   // Si cambia cover/banner, pasar las keys viejas para limpiar R2:
//   oldCoverKey : string | null
//   oldBannerKey: string | null
// }

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const body = await request.json() as {
            title: string;
            synopsis?: string | null;
            coverUrl: string;
            coverKey: string;
            bannerUrl?: string | null;
            bannerKey?: string | null;
            status?: string;
            ageRating?: string;
            format?: string;
            readingDir?: string;
            genreIds?: string[];
            isPublished?: boolean;
            oldCoverKey?: string | null;
            oldBannerKey?: string | null;
        };

        // ── Validaciones ──────────────────────────────────────────────────────────
        if (!body.title?.trim()) {
            return NextResponse.json({ error: "El título es requerido" }, { status: 400 });
        }
        if (!body.coverUrl || !body.coverKey) {
            return NextResponse.json({ error: "El cover es requerido" }, { status: 400 });
        }

        const VALID_STATUS = ["ongoing", "completed", "hiatus", "canceled"];
        const VALID_AGE = ["all", "teen", "mature"];
        const VALID_FORMAT = ["webtoon", "manga", "manhwa", "comic", "novel"];
        const VALID_DIR = ["ltr", "rtl"];

        if (body.status && !VALID_STATUS.includes(body.status)) return NextResponse.json({ error: "Status inválido" }, { status: 400 });
        if (body.ageRating && !VALID_AGE.includes(body.ageRating)) return NextResponse.json({ error: "Age rating inválido" }, { status: 400 });
        if (body.format && !VALID_FORMAT.includes(body.format)) return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
        if (body.readingDir && !VALID_DIR.includes(body.readingDir)) return NextResponse.json({ error: "Dirección inválida" }, { status: 400 });

        // ── Verificar propiedad ───────────────────────────────────────────────────
        const existing = await prisma.series.findUnique({
            where: { id },
            select: { creatorId: true, coverKey: true, bannerKey: true },
        });

        if (!existing) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
        if (existing.creatorId !== session.user.id) return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

        // ── Verificar que el cover existe en R2 (solo si cambió) ──────────────────
        if (body.coverKey !== existing.coverKey) {
            const exists = await fileExistsInR2(body.coverKey);
            if (!exists) return NextResponse.json({ error: "Cover no encontrado en storage" }, { status: 400 });
        }

        if (body.bannerKey && body.bannerKey !== existing.bannerKey) {
            const exists = await fileExistsInR2(body.bannerKey);
            if (!exists) return NextResponse.json({ error: "Banner no encontrado en storage" }, { status: 400 });
        }

        // ── Verificar géneros ─────────────────────────────────────────────────────
        const genreIds = body.genreIds ?? [];
        if (genreIds.length > 0) {
            const found = await prisma.genre.findMany({
                where: { id: { in: genreIds }, isActive: true },
                select: { id: true },
            });
            if (found.length !== genreIds.length) {
                return NextResponse.json({ error: "Uno o más géneros no son válidos" }, { status: 400 });
            }
        }

        // ── Actualizar en transacción ─────────────────────────────────────────────
        const updated = await prisma.$transaction(async (tx) => {
            // Reemplazar géneros
            await tx.seriesGenre.deleteMany({ where: { seriesId: id } });

            return tx.series.update({
                where: { id },
                data: {
                    title: body.title.trim(),
                    synopsis: body.synopsis?.trim() ?? null,
                    coverUrl: body.coverUrl,
                    coverKey: body.coverKey,
                    bannerUrl: body.bannerUrl ?? null,
                    bannerKey: body.bannerKey ?? null,
                    status: body.status ?? "ongoing",
                    ageRating: body.ageRating ?? "all",
                    format: body.format ?? "webtoon",
                    readingDir: body.readingDir ?? "ltr",
                    isPublished: body.isPublished ?? false,
                    genres: genreIds.length > 0
                        ? { create: genreIds.map((genreId) => ({ genreId })) }
                        : undefined,
                },
                include: {
                    genres: { include: { genre: true } },
                },
            });
        });

        // ── Limpiar imágenes viejas de R2 (best effort) ───────────────────────────
        const keysToDelete = [
            body.oldCoverKey !== body.coverKey ? body.oldCoverKey : null,
            body.oldBannerKey !== body.bannerKey ? body.oldBannerKey : null,
        ].filter(Boolean) as string[];

        if (keysToDelete.length > 0) {
            await Promise.allSettled(keysToDelete.map((k) => deleteFromR2(k)));
        }

        return NextResponse.json({ series: updated });
    } catch (error) {
        console.error("[PUT /api/series/:id]", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

// ─── DELETE /api/series/[id] ──────────────────────────────────────────────────

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const series = await prisma.series.findUnique({
            where: { id },
            select: {
                creatorId: true,
                coverKey: true,
                bannerKey: true,
                chapters: {
                    select: {
                        pages: { select: { imageKey: true } },
                    },
                },
            },
        });

        if (!series) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
        if (series.creatorId !== session.user.id) return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

        const keysToDelete: string[] = [
            series.coverKey,
            series.bannerKey,
            ...series.chapters.flatMap((c) => c.pages.map((p) => p.imageKey)),
        ].filter(Boolean) as string[];

        await Promise.allSettled(keysToDelete.map((key) => deleteFromR2(key)));

        await prisma.series.delete({ where: { id } });

        await prisma.user.update({
            where: { id: session.user.id },
            data: { totalSeries: { decrement: 1 } },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DELETE /api/series/:id]", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}