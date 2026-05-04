// src/app/chapters/page.tsx

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";
import { ChaptersGrid } from "@/components/chapters/ChaptersGrid";

export const metadata: Metadata = {
    title: `Últimos capítulos — ${siteConfig.name}`,
    description: `Los capítulos más recientes de todas las series publicadas en ${siteConfig.name}.`,
};

const PAGE_SIZE = 24;

type SearchParams = {
    page?: string;
};

export default async function ChaptersPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const sp = await searchParams;
    const page = Math.max(1, parseInt(sp.page ?? "1", 10));

    const [chaptersRaw, total] = await Promise.all([
        prisma.chapter.findMany({
            where: {
                isPublished: true,
                series: { isPublished: true, isActive: true },
            },
            orderBy: { publishedAt: "desc" },
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
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
                            select: { username: true, displayName: true },
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
        }),
        prisma.chapter.count({
            where: {
                isPublished: true,
                series: { isPublished: true, isActive: true },
            },
        }),
    ]);

    const totalPages = Math.ceil(total / PAGE_SIZE);

    // Serializar fechas
    const chapters = chaptersRaw.map((c) => ({
        ...c,
        number: Number(c.number),
        publishedAt: c.publishedAt?.toISOString() ?? null,
    }));

    return (
        <main style={{ backgroundColor: "var(--color-layer-1)", minHeight: "100vh" }}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">

                {/* Header */}
                <div className="mb-8">
                    <h1
                        className="text-3xl font-bold tracking-tight"
                        style={{ color: "var(--color-text-1)", letterSpacing: "-0.03em" }}
                    >
                        Últimos capítulos
                    </h1>
                    <p className="mt-1 text-sm" style={{ color: "var(--color-text-3)" }}>
                        {total > 0
                            ? `${total.toLocaleString()} capítulo${total !== 1 ? "s" : ""} publicado${total !== 1 ? "s" : ""}`
                            : "No hay capítulos publicados aún"}
                    </p>
                </div>

                <ChaptersGrid
                    chapters={chapters}
                    total={total}
                    page={page}
                    totalPages={totalPages}
                />
            </div>
        </main>
    );
}