// src/app/api/chapters/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── POST /api/chapters ───────────────────────────────────────────────────────
//
// Body JSON:
// {
//   seriesId   : string
//   number     : number
//   title      : string | null
//   authorNote : string | null
//   isPublished: boolean
//   pages: {
//     order    : number
//     imageUrl : string
//     imageKey : string
//     width    : number | null
//     height   : number | null
//     fileSize : number | null
//   }[]
// }

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const body = (await request.json()) as {
            seriesId: string;
            number: number;
            title?: string | null;
            authorNote?: string | null;
            isPublished?: boolean;
            pages: {
                order: number;
                imageUrl: string;
                imageKey: string;
                width?: number | null;
                height?: number | null;
                fileSize?: number | null;
            }[];
        };

        // ── Validaciones ──────────────────────────────────────────────────────────
        if (!body.seriesId) {
            return NextResponse.json({ error: "seriesId es requerido" }, { status: 400 });
        }
        if (body.number === undefined || body.number === null || isNaN(body.number)) {
            return NextResponse.json({ error: "El número de capítulo es requerido" }, { status: 400 });
        }
        if (!Array.isArray(body.pages) || body.pages.length === 0) {
            return NextResponse.json({ error: "Se requiere al menos una página" }, { status: 400 });
        }

        // ── Verificar que la serie pertenece al usuario ────────────────────────────
        const series = await prisma.series.findUnique({
            where: { id: body.seriesId },
            select: { id: true, creatorId: true },
        });

        if (!series) {
            return NextResponse.json({ error: "Serie no encontrada" }, { status: 404 });
        }
        if (series.creatorId !== userId) {
            return NextResponse.json({ error: "No tienes permiso sobre esta serie" }, { status: 403 });
        }

        // ── Verificar que el número no está duplicado ─────────────────────────────
        const existing = await prisma.chapter.findUnique({
            where: { seriesId_number: { seriesId: body.seriesId, number: body.number } },
            select: { id: true },
        });

        if (existing) {
            return NextResponse.json(
                { error: `Ya existe el capítulo ${body.number} en esta serie` },
                { status: 409 }
            );
        }

        // ── Generar slug ──────────────────────────────────────────────────────────
        const slug = `capitulo-${body.number}`.replace(".", "-");

        // ── Crear capítulo + páginas en una transacción ───────────────────────────
        const chapter = await prisma.$transaction(async (tx) => {
            const newChapter = await tx.chapter.create({
                data: {
                    seriesId: body.seriesId,
                    number: body.number,
                    title: body.title?.trim() || null,
                    slug,
                    authorNote: body.authorNote?.trim() || null,
                    isPublished: body.isPublished ?? false,
                    publishedAt: body.isPublished ? new Date() : null,
                    pages: {
                        create: body.pages.map((p) => ({
                            order: p.order,
                            imageUrl: p.imageUrl,
                            imageKey: p.imageKey,
                            width: p.width ?? null,
                            height: p.height ?? null,
                            fileSize: p.fileSize ?? null,
                        })),
                    },
                },
                include: {
                    pages: { orderBy: { order: "asc" } },
                },
            });

            // Actualizar contador de capítulos en la serie
            await tx.series.update({
                where: { id: body.seriesId },
                data: { chaptersCount: { increment: 1 } },
            });

            return newChapter;
        });

        return NextResponse.json({ chapter }, { status: 201 });
    } catch (error) {
        console.error("[POST /api/chapters]", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}