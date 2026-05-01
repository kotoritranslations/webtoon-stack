// src/app/api/series/route.ts

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fileExistsInR2, deleteFromR2 } from "@/lib/r2";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

async function uniqueSlug(base: string): Promise<string> {
    let slug = slugify(base);
    let attempt = 0;

    while (true) {
        const candidate = attempt === 0 ? slug : `${slug}-${attempt}`;
        const exists = await prisma.series.findUnique({
            where: { slug: candidate },
            select: { id: true },
        });
        if (!exists) return candidate;
        attempt++;
    }
}

// ─── POST /api/series ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const creatorId = session.user.id;

        const body = (await request.json()) as {
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
        };

        // ── Validaciones básicas ────────────────────────────────────────────────
        if (!body.title?.trim()) {
            return NextResponse.json(
                { error: "El título es requerido" },
                { status: 400 }
            );
        }

        if (!body.coverUrl || !body.coverKey) {
            return NextResponse.json(
                { error: "El cover es requerido" },
                { status: 400 }
            );
        }

        // ── Validar enums ───────────────────────────────────────────────────────
        const VALID_STATUS = ["ongoing", "completed", "hiatus", "canceled"];
        const VALID_AGE = ["all", "teen", "mature"];
        const VALID_FORMAT = ["webtoon", "manga", "manhwa", "comic", "novel"];
        const VALID_DIR = ["ltr", "rtl"];

        if (body.status && !VALID_STATUS.includes(body.status)) {
            return NextResponse.json({ error: "Status inválido" }, { status: 400 });
        }
        if (body.ageRating && !VALID_AGE.includes(body.ageRating)) {
            return NextResponse.json(
                { error: "Age rating inválido" },
                { status: 400 }
            );
        }
        if (body.format && !VALID_FORMAT.includes(body.format)) {
            return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
        }
        if (body.readingDir && !VALID_DIR.includes(body.readingDir)) {
            return NextResponse.json(
                { error: "Dirección de lectura inválida" },
                { status: 400 }
            );
        }

        // ── Verificar que el cover existe en R2 ─────────────────────────────────
        const coverExists = await fileExistsInR2(body.coverKey);
        if (!coverExists) {
            return NextResponse.json(
                { error: "El cover no se encontró en el storage. Vuelve a subirlo." },
                { status: 400 }
            );
        }

        // ── Verificar banner si viene ───────────────────────────────────────────
        if (body.bannerKey) {
            const bannerExists = await fileExistsInR2(body.bannerKey);
            if (!bannerExists) {
                return NextResponse.json(
                    {
                        error: "El banner no se encontró en el storage. Vuelve a subirlo.",
                    },
                    { status: 400 }
                );
            }
        }

        // ── Verificar géneros ───────────────────────────────────────────────────
        const genreIds = body.genreIds ?? [];
        if (genreIds.length > 0) {
            const existingGenres = await prisma.genre.findMany({
                where: { id: { in: genreIds }, isActive: true },
                select: { id: true },
            });
            if (existingGenres.length !== genreIds.length) {
                return NextResponse.json(
                    { error: "Uno o más géneros no son válidos" },
                    { status: 400 }
                );
            }
        }

        // ── Crear la serie ──────────────────────────────────────────────────────
        const slug = await uniqueSlug(body.title);

        const series = await prisma.series.create({
            data: {
                creatorId,
                title: body.title.trim(),
                slug,
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
                genres:
                    genreIds.length > 0
                        ? { create: genreIds.map((genreId) => ({ genreId })) }
                        : undefined,
            },
            include: {
                genres: { include: { genre: true } },
            },
        });

        // ── Actualizar contador en el usuario ───────────────────────────────────
        await prisma.user.update({
            where: { id: creatorId },
            data: { totalSeries: { increment: 1 } },
        });

        // ── Revalidar caché — solo si la serie se publica de inmediato ──────────
        if (body.isPublished) {
            revalidatePath("/");
            revalidatePath("/library");
            revalidatePath("/series");
        }

        return NextResponse.json({ series }, { status: 201 });
    } catch (error) {
        console.error("[POST /api/series]", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

// ─── GET /api/series ──────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const creatorId = searchParams.get("creatorId");
        const format = searchParams.get("format");
        const status = searchParams.get("status");
        const cursor = searchParams.get("cursor");
        const limit = Math.min(
            parseInt(searchParams.get("limit") ?? "20"),
            50
        );

        const where = {
            isPublished: true,
            isActive: true,
            ...(creatorId ? { creatorId } : {}),
            ...(format ? { format } : {}),
            ...(status ? { status } : {}),
        };

        const series = await prisma.series.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: limit + 1,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatar: true,
                    },
                },
                genres: {
                    include: {
                        genre: {
                            select: { id: true, name: true, slug: true, color: true },
                        },
                    },
                },
            },
        });

        const hasMore = series.length > limit;
        const items = hasMore ? series.slice(0, limit) : series;
        const nextCursor = hasMore ? items[items.length - 1].id : null;

        return NextResponse.json({ series: items, nextCursor });
    } catch (error) {
        console.error("[GET /api/series]", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}