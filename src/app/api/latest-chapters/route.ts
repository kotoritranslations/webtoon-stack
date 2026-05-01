// src/app/api/latest-chapters/route.ts
//
// GET /api/latest-chapters
//
// Query params:
//   format   — webtoon | manga | manhwa | comic | novel
//   genre    — slug del género
//   cursor   — paginación cursor-based
//   limit    — default 24, max 48

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const format = searchParams.get("format") ?? "";
        const genre = searchParams.get("genre") ?? "";
        const cursor = searchParams.get("cursor") ?? "";
        const limit = Math.min(parseInt(searchParams.get("limit") ?? "24"), 48);

        const VALID_FORMAT = ["webtoon", "manga", "manhwa", "comic", "novel"];

        const chapters = await prisma.chapter.findMany({
            where: {
                isPublished: true,
                series: {
                    isPublished: true,
                    isActive: true,
                    ...(format && VALID_FORMAT.includes(format) ? { format } : {}),
                    ...(genre ? { genres: { some: { genre: { slug: genre } } } } : {}),
                },
            },
            orderBy: { publishedAt: "desc" },
            take: limit + 1,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            select: {
                id: true,
                number: true,
                title: true,
                slug: true,
                publishedAt: true,
                viewsCount: true,
                likesCount: true,
                series: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        coverUrl: true,
                        format: true,
                        ageRating: true,
                        creator: {
                            select: {
                                username: true,
                                displayName: true,
                            },
                        },
                        genres: {
                            include: {
                                genre: {
                                    select: { id: true, name: true, slug: true, color: true },
                                },
                            },
                            take: 2,
                        },
                    },
                },
            },
        });

        const hasMore = chapters.length > limit;
        const items = hasMore ? chapters.slice(0, limit) : chapters;
        const nextCursor = hasMore ? items[items.length - 1].id : null;

        return NextResponse.json({ chapters: items, nextCursor });
    } catch (error) {
        console.error("[GET /api/latest-chapters]", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}