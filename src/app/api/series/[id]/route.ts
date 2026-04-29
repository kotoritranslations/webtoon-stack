// src/app/api/series/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFromR2 } from "@/lib/r2";

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
        if (series.creatorId !== session.user.id) {
            return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
        }

        // Eliminar archivos de R2 en paralelo (best effort — no bloquear si falla)
        const keysToDelete: string[] = [
            series.coverKey,
            series.bannerKey,
            ...series.chapters.flatMap((c) => c.pages.map((p) => p.imageKey)),
        ].filter(Boolean) as string[];

        await Promise.allSettled(keysToDelete.map((key) => deleteFromR2(key)));

        // Eliminar serie (cascade borra capítulos, páginas, likes, etc.)
        await prisma.series.delete({ where: { id } });

        // Decrementar contador del usuario
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