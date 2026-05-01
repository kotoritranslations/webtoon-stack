// src/app/api/library/route.ts
//
// GET /api/library
//
// Query params:
//   q          — búsqueda por título
//   genre      — slug del género
//   format     — webtoon | manga | manhwa | comic | novel
//   status     — ongoing | completed | hiatus | canceled
//   ageRating  — all | teen | mature
//   sort       — popular | recent | updated | most_chapters
//   cursor     — paginación cursor-based
//   limit      — default 24, max 48

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const VALID_FORMAT = ["webtoon", "manga", "manhwa", "comic", "novel"] as const;
const VALID_STATUS = ["ongoing", "completed", "hiatus", "canceled"] as const;
const VALID_AGE = ["all", "teen", "mature"] as const;
const VALID_SORT = ["popular", "recent", "updated", "most_chapters"] as const;

type Sort = (typeof VALID_SORT)[number];

function buildOrderBy(sort: Sort): Prisma.SeriesOrderByWithRelationInput[] {
    switch (sort) {
        case "popular": return [{ viewsCount: "desc" }, { likesCount: "desc" }];
        case "recent": return [{ createdAt: "desc" }];
        case "updated": return [{ updatedAt: "desc" }];
        case "most_chapters": return [{ chaptersCount: "desc" }];
        default: return [{ createdAt: "desc" }];
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const q = searchParams.get("q")?.trim() ?? "";
        const genre = searchParams.get("genre") ?? "";
        const format = searchParams.get("format") ?? "";
        const status = searchParams.get("status") ?? "";
        const ageRating = searchParams.get("ageRating") ?? "";
        const sortParam = searchParams.get("sort") ?? "popular";
        const cursor = searchParams.get("cursor") ?? "";
        const limit = Math.min(parseInt(searchParams.get("limit") ?? "24"), 48);

        const sort = VALID_SORT.includes(sortParam as Sort) ? (sortParam as Sort) : "popular";

        // ── Construcción del where ────────────────────────────────────────────
        const where: Prisma.SeriesWhereInput = {
            isPublished: true,
            isActive: true,
            ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
            ...(format && VALID_FORMAT.includes(format as typeof VALID_FORMAT[number])
                ? { format }
                : {}),
            ...(status && VALID_STATUS.includes(status as typeof VALID_STATUS[number])
                ? { status }
                : {}),
            ...(ageRating && VALID_AGE.includes(ageRating as typeof VALID_AGE[number])
                ? { ageRating }
                : {}),
            ...(genre ? {
                genres: {
                    some: { genre: { slug: genre } },
                },
            } : {}),
        };

        // ── Query ─────────────────────────────────────────────────────────────
        const series = await prisma.series.findMany({
            where,
            orderBy: buildOrderBy(sort),
            take: limit + 1,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            select: {
                id: true,
                title: true,
                slug: true,
                synopsis: true,
                coverUrl: true,
                status: true,
                ageRating: true,
                format: true,
                viewsCount: true,
                likesCount: true,
                bookmarksCount: true,
                chaptersCount: true,
                createdAt: true,
                updatedAt: true,
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

        // ── Total aproximado (sin cursor para el conteo) ──────────────────────
        const total = await prisma.series.count({ where });

        return NextResponse.json({ series: items, nextCursor, total });
    } catch (error) {
        console.error("[GET /api/library]", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}