// src/app/api/chapters/[id]/route.ts
// Agrega PUT para actualizar info + páginas del capítulo

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFromR2 } from "@/lib/r2";

// ─── PATCH /api/chapters/[id] ─────────────────────────────────────────────────
// Body: { isPublished: boolean }

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await request.json() as { isPublished?: boolean };

        const chapter = await prisma.chapter.findUnique({
            where: { id },
            select: { series: { select: { creatorId: true } } },
        });

        if (!chapter)
            return NextResponse.json({ error: "No encontrado" }, { status: 404 });
        if (chapter.series.creatorId !== session.user.id)
            return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

        const updated = await prisma.chapter.update({
            where: { id },
            data: {
                ...(body.isPublished !== undefined ? {
                    isPublished: body.isPublished,
                    publishedAt: body.isPublished ? new Date() : null,
                } : {}),
            },
            select: { id: true, isPublished: true, publishedAt: true },
        });

        return NextResponse.json({ chapter: updated });
    } catch (error) {
        console.error("[PATCH /api/chapters/:id]", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

// ─── PUT /api/chapters/[id] ───────────────────────────────────────────────────
//
// Body JSON:
// {
//   number     : number
//   title      : string | null
//   authorNote : string | null
//   isPublished: boolean
//   pages: {
//     // Página existente que se conserva:
//     id?       : string
//     order     : number
//     imageUrl  : string
//     imageKey  : string
//     fileSize? : number | null
//     // Página nueva (recién subida, sin id):
//     // no tiene id
//   }[]
//   deletedPageIds: string[]  — ids de páginas existentes a eliminar
// }

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        const body = await request.json() as {
            number: number;
            title?: string | null;
            authorNote?: string | null;
            isPublished?: boolean;
            pages: {
                id?: string;
                order: number;
                imageUrl: string;
                imageKey: string;
                fileSize?: number | null;
            }[];
            deletedPageIds?: string[];
        };

        if (body.number === undefined || isNaN(body.number))
            return NextResponse.json({ error: "Número de capítulo inválido" }, { status: 400 });

        if (!Array.isArray(body.pages) || body.pages.length === 0)
            return NextResponse.json({ error: "Se requiere al menos una página" }, { status: 400 });

        // ── Verificar propiedad ───────────────────────────────────────────────────
        const chapter = await prisma.chapter.findUnique({
            where: { id },
            select: {
                seriesId: true,
                number: true,
                series: { select: { creatorId: true } },
                pages: { select: { id: true, imageKey: true } },
            },
        });

        if (!chapter)
            return NextResponse.json({ error: "No encontrado" }, { status: 404 });
        if (chapter.series.creatorId !== session.user.id)
            return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

        // ── Verificar número duplicado (si cambió) ────────────────────────────────
        if (body.number !== Number(chapter.number)) {
            const exists = await prisma.chapter.findUnique({
                where: { seriesId_number: { seriesId: chapter.seriesId, number: body.number } },
                select: { id: true },
            });
            if (exists)
                return NextResponse.json(
                    { error: `Ya existe el capítulo ${body.number} en esta serie` },
                    { status: 409 }
                );
        }

        const deletedIds = body.deletedPageIds ?? [];

        // Keys de páginas eliminadas para borrar de R2
        const deletedKeys = chapter.pages
            .filter((p) => deletedIds.includes(p.id))
            .map((p) => p.imageKey);

        // ── Transacción ───────────────────────────────────────────────────────────
        const updated = await prisma.$transaction(async (tx) => {
            // Eliminar páginas borradas
            if (deletedIds.length > 0) {
                await tx.page.deleteMany({ where: { id: { in: deletedIds }, chapterId: id } });
            }

            // Actualizar orden de páginas existentes
            const existingPages = body.pages.filter((p) => p.id);
            for (const p of existingPages) {
                await tx.page.update({
                    where: { id: p.id },
                    data: { order: p.order },
                });
            }

            // Crear páginas nuevas
            const newPages = body.pages.filter((p) => !p.id);
            if (newPages.length > 0) {
                await tx.page.createMany({
                    data: newPages.map((p) => ({
                        chapterId: id,
                        order: p.order,
                        imageUrl: p.imageUrl,
                        imageKey: p.imageKey,
                        fileSize: p.fileSize ?? null,
                    })),
                });
            }

            // Actualizar capítulo
            const slug = `capitulo-${body.number}`.replace(".", "-");
            return tx.chapter.update({
                where: { id },
                data: {
                    number: body.number,
                    title: body.title?.trim() || null,
                    slug,
                    authorNote: body.authorNote?.trim() || null,
                    isPublished: body.isPublished ?? false,
                    publishedAt: body.isPublished ? new Date() : null,
                },
                include: {
                    pages: { orderBy: { order: "asc" } },
                },
            });
        });

        // ── Borrar imágenes eliminadas de R2 (best effort) ────────────────────────
        if (deletedKeys.length > 0) {
            await Promise.allSettled(deletedKeys.map((k) => deleteFromR2(k)));
        }

        return NextResponse.json({ chapter: updated });
    } catch (error) {
        console.error("[PUT /api/chapters/:id]", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

// ─── DELETE /api/chapters/[id] ────────────────────────────────────────────────

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        const chapter = await prisma.chapter.findUnique({
            where: { id },
            select: {
                seriesId: true,
                series: { select: { creatorId: true } },
                pages: { select: { imageKey: true } },
            },
        });

        if (!chapter)
            return NextResponse.json({ error: "No encontrado" }, { status: 404 });
        if (chapter.series.creatorId !== session.user.id)
            return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

        await Promise.allSettled(chapter.pages.map((p) => deleteFromR2(p.imageKey)));
        await prisma.chapter.delete({ where: { id } });
        await prisma.series.update({
            where: { id: chapter.seriesId },
            data: { chaptersCount: { decrement: 1 } },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DELETE /api/chapters/:id]", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}