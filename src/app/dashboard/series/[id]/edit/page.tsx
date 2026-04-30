// src/app/dashboard/series/[id]/edit/page.tsx

import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SeriesEditForm } from "@/components/series/SeriesEditForm";

export const metadata = {
    title: "Editar serie | Dashboard",
};

export default async function EditSeriesPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const { id } = await params;

    const [series, genres] = await Promise.all([
        prisma.series.findUnique({
            where: { id, creatorId: session.user.id },
            include: {
                genres: {
                    include: { genre: { select: { id: true, name: true, slug: true, color: true } } },
                },
            },
        }),
        prisma.genre.findMany({
            where: { isActive: true },
            select: { id: true, name: true, slug: true, color: true },
            orderBy: { name: "asc" },
        }),
    ]);

    if (!series) notFound();

    const seriesData = {
        id: series.id,
        title: series.title,
        synopsis: series.synopsis,
        coverUrl: series.coverUrl,
        coverKey: series.coverKey,
        bannerUrl: series.bannerUrl,
        bannerKey: series.bannerKey,
        status: series.status,
        ageRating: series.ageRating,
        format: series.format,
        readingDir: series.readingDir,
        isPublished: series.isPublished,
        genres: series.genres.map((g) => ({
            id: g.genre.id,
            name: g.genre.name,
            slug: g.genre.slug,
            color: g.genre.color,
        })),
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: "var(--color-layer-1)" }}>

            {/* ── Top bar ──────────────────────────────────────────────────────── */}
            <div
                style={{
                    backgroundColor: "var(--color-layer-0)",
                    borderBottom: "1px solid var(--color-layer-3)",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                }}
            >
                <div className="mx-auto max-w-2xl px-5 py-4 sm:px-8">
                    <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-3)" }}>
                        <Link
                            href="/dashboard"
                            className="transition-colors hover:text-[var(--color-text-2)]"
                            style={{ color: "var(--color-text-3)" }}
                        >
                            Dashboard
                        </Link>
                        <span>/</span>
                        <Link
                            href="/dashboard/series"
                            className="transition-colors hover:text-[var(--color-text-2)]"
                            style={{ color: "var(--color-text-3)" }}
                        >
                            Mis series
                        </Link>
                        <span>/</span>
                        <span
                            style={{
                                color: "var(--color-text-2)",
                                maxWidth: "160px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {series.title}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Header ───────────────────────────────────────────────────────── */}
            <div
                style={{
                    backgroundColor: "var(--color-layer-0)",
                    borderBottom: "1px solid var(--color-layer-3)",
                }}
            >
                <div className="mx-auto max-w-2xl px-5 pt-10 pb-8 sm:px-8">
                    <h1
                        className="text-2xl font-semibold"
                        style={{ color: "var(--color-text-1)", letterSpacing: "-0.025em" }}
                    >
                        Editar serie
                    </h1>
                    <p className="mt-1.5 text-sm" style={{ color: "var(--color-text-3)" }}>
                        {series.title}
                    </p>
                </div>
            </div>

            {/* ── Form ─────────────────────────────────────────────────────────── */}
            <div className="mx-auto max-w-2xl px-5 py-8 sm:px-8">
                <SeriesEditForm series={seriesData} allGenres={genres} />
            </div>
        </div>
    );
}