// src/app/library/page.tsx

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { LibraryFilters } from "@/components/library/LibraryFilters";
import { LibraryGrid } from "@/components/library/LibraryGrid";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
    title: `Biblioteca — ${siteConfig.name}`,
    description: `Descubre webtoons, manga, manhwa y más. Filtra por género, formato y estado en ${siteConfig.name}.`,
};

type SearchParams = {
    q?: string;
    genre?: string;
    format?: string;
    status?: string;
    ageRating?: string;
    sort?: string;
    page?: string;
};

const PAGE_SIZE = 24;

export default async function LibraryPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const sp = await searchParams;

    const q = sp.q?.trim() ?? "";
    const genre = sp.genre ?? "";
    const format = sp.format ?? "";
    const status = sp.status ?? "";
    const ageRating = sp.ageRating ?? "";
    const sort = sp.sort ?? "popular";
    const page = Math.max(1, parseInt(sp.page ?? "1", 10));

    // ── Genres para el selector ───────────────────────────────────────────────
    const genres = await prisma.genre.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true, color: true },
    });

    // ── Fetch series con filtros (server-side primer render) ──────────────────
    const where = {
        isPublished: true,
        isActive: true,
        ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
        ...(format ? { format } : {}),
        ...(status ? { status } : {}),
        ...(ageRating ? { ageRating } : {}),
        ...(genre ? { genres: { some: { genre: { slug: genre } } } } : {}),
    };

    const orderBy =
        sort === "popular" ? [{ viewsCount: "desc" as const }, { likesCount: "desc" as const }]
            : sort === "recent" ? [{ createdAt: "desc" as const }]
                : sort === "updated" ? [{ updatedAt: "desc" as const }]
                    : sort === "most_chapters" ? [{ chaptersCount: "desc" as const }]
                        : [{ viewsCount: "desc" as const }];

    const [seriesRaw, total] = await Promise.all([
        prisma.series.findMany({
            where,
            orderBy,
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
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
                creator: {
                    select: { id: true, username: true, displayName: true, avatar: true },
                },
                genres: {
                    include: {
                        genre: { select: { id: true, name: true, slug: true, color: true } },
                    },
                },
            },
        }),
        prisma.series.count({ where }),
    ]);

    const totalPages = Math.ceil(total / PAGE_SIZE);

    // Serializar fechas
    const series = seriesRaw.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
    }));

    return (
        <main
            style={{
                backgroundColor: "var(--color-layer-1)",
                minHeight: "100vh",
            }}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">

                {/* ── Header ─────────────────────────────────────────────────── */}
                <div className="mb-8">
                    <h1
                        className="text-3xl font-bold tracking-tight"
                        style={{ color: "var(--color-text-1)", letterSpacing: "-0.03em" }}
                    >
                        Biblioteca
                    </h1>
                    <p className="mt-1 text-sm" style={{ color: "var(--color-text-3)" }}>
                        {total > 0
                            ? `${total.toLocaleString()} serie${total !== 1 ? "s" : ""} disponible${total !== 1 ? "s" : ""}`
                            : "Sin resultados para los filtros aplicados"}
                    </p>
                </div>

                {/* ── Filters (client component) ──────────────────────────────── */}
                <LibraryFilters
                    genres={genres}
                    currentFilters={{ q, genre, format, status, ageRating, sort }}
                />

                {/* ── Grid (client component con paginación) ──────────────────── */}
                <LibraryGrid
                    series={series}
                    total={total}
                    page={page}
                    totalPages={totalPages}
                    currentSlug={sp.genre ?? ""}
                />
            </div>
        </main>
    );
}