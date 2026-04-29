// src/app/series/[slug]/page.tsx

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
    BookOpen,
    Eye,
    Heart,
    BookBookmark,
    Users,
    Clock,
    ArrowLeft,
    ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import { ChapterRow } from "@/components/series/ChapterRow";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const series = await prisma.series.findUnique({
        where: { slug, isPublished: true, isActive: true },
        select: { title: true, synopsis: true, coverUrl: true },
    });
    if (!series) return {};
    return {
        title: `${series.title} — Webtoon`,
        description: series.synopsis ?? `Lee ${series.title} gratis en Webtoon`,
        openGraph: {
            images: series.coverUrl ? [series.coverUrl] : [],
        },
    };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCount(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
}

function formatLabel(key: string, value: string): string {
    const maps: Record<string, Record<string, string>> = {
        status: { ongoing: "En curso", completed: "Completada", hiatus: "En pausa", canceled: "Cancelada" },
        ageRating: { all: "Para todos", teen: "Teen+", mature: "Maduro" },
        format: { webtoon: "Webtoon", manga: "Manga", manhwa: "Manhwa", comic: "Cómic", novel: "Novela" },
    };
    return maps[key]?.[value] ?? value;
}

const STATUS_COLOR: Record<string, string> = {
    ongoing: "#22c55e",
    completed: "#3b82f6",
    hiatus: "#f59e0b",
    canceled: "#ef4444",
};

const PAGE_SIZE = 30;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SeriesPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ page?: string }>;
}) {
    const { slug } = await params;
    const { page: pageParam } = await searchParams;
    const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10));

    // ── Fetch serie ──────────────────────────────────────────────────────────────
    const series = await prisma.series.findUnique({
        where: { slug, isPublished: true, isActive: true },
        include: {
            creator: {
                select: { id: true, username: true, displayName: true, avatar: true, followersCount: true },
            },
            genres: {
                include: { genre: { select: { id: true, name: true, slug: true, color: true } } },
            },
        },
    });

    if (!series) notFound();

    // ── Fetch capítulos paginados ────────────────────────────────────────────────
    const [chapters, totalChapters] = await Promise.all([
        prisma.chapter.findMany({
            where: { seriesId: series.id, isPublished: true },
            orderBy: { number: "asc" },
            skip: (currentPage - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
            select: {
                id: true,
                number: true,
                title: true,
                slug: true,
                publishedAt: true,
                viewsCount: true,
                likesCount: true,
            },
        }),
        prisma.chapter.count({
            where: { seriesId: series.id, isPublished: true },
        }),
    ]);

    const totalPages = Math.ceil(totalChapters / PAGE_SIZE);
    const genres = series.genres.map((g) => g.genre);

    return (
        <main style={{ backgroundColor: "var(--color-layer-1)", minHeight: "100vh" }}>

            {/* ── Banner ────────────────────────────────────────────────────────── */}
            <div
                className="relative w-full overflow-hidden"
                style={{ height: "280px", backgroundColor: "var(--color-layer-2)" }}
            >
                {series.bannerUrl ? (
                    <Image
                        src={series.bannerUrl}
                        alt={series.title}
                        fill
                        className="object-cover"
                        sizes="100vw"
                        priority
                    />
                ) : series.coverUrl ? (
                    <Image
                        src={series.coverUrl}
                        alt={series.title}
                        fill
                        className="object-cover blur-xl scale-110 opacity-40"
                        sizes="100vw"
                        priority
                    />
                ) : (
                    <div style={{ width: "100%", height: "100%", backgroundColor: "var(--color-layer-3)" }} />
                )}
                {/* Gradiente inferior */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: "linear-gradient(to bottom, transparent 30%, var(--color-layer-1) 100%)",
                    }}
                />
            </div>

            {/* ── Contenido principal ───────────────────────────────────────────── */}
            <div className="mx-auto max-w-4xl px-4 sm:px-6">

                {/* ── Cover + info header ─────────────────────────────────────────── */}
                <div className="flex gap-5 -mt-20 relative z-10">

                    {/* Cover */}
                    <div
                        className="flex-shrink-0 overflow-hidden shadow-xl"
                        style={{
                            width: "120px",
                            height: "180px",
                            borderRadius: "var(--radius-lg)",
                            backgroundColor: "var(--color-layer-3)",
                            border: "3px solid var(--color-layer-2)",
                        }}
                    >
                        {series.coverUrl ? (
                            <Image
                                src={series.coverUrl}
                                alt={series.title}
                                width={120}
                                height={180}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center">
                                <BookOpen size={32} style={{ color: "var(--color-text-3)" }} />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 pt-24">
                        {/* Géneros */}
                        {genres.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {genres.map((g) => (
                                    <Link
                                        key={g.id}
                                        href={`/explore?genre=${g.slug}`}
                                        className="text-[11px] font-medium px-2 py-0.5 rounded-full transition-opacity hover:opacity-80"
                                        style={{
                                            backgroundColor: `color-mix(in srgb, ${g.color ?? "#6b7280"} 15%, transparent)`,
                                            color: g.color ?? "var(--color-text-2)",
                                            border: `1px solid color-mix(in srgb, ${g.color ?? "#6b7280"} 30%, transparent)`,
                                        }}
                                    >
                                        {g.name}
                                    </Link>
                                ))}
                            </div>
                        )}

                        <h1
                            className="text-2xl font-bold sm:text-3xl"
                            style={{ color: "var(--color-text-1)", letterSpacing: "-0.03em", lineHeight: 1.15 }}
                        >
                            {series.title}
                        </h1>

                        {/* Creator */}
                        <Link
                            href={`/${series.creator.username}`}
                            className="mt-1.5 flex items-center gap-2 w-fit transition-opacity hover:opacity-80"
                        >
                            {series.creator.avatar ? (
                                <Image
                                    src={series.creator.avatar}
                                    alt={series.creator.displayName ?? series.creator.username ?? ""}
                                    width={20}
                                    height={20}
                                    className="rounded-full object-cover"
                                />
                            ) : (
                                <div
                                    className="h-5 w-5 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: "var(--color-layer-4)" }}
                                />
                            )}
                            <span className="text-sm" style={{ color: "var(--color-text-3)" }}>
                                {series.creator.displayName ?? series.creator.username}
                            </span>
                        </Link>
                    </div>
                </div>

                {/* ── Stats row ────────────────────────────────────────────────────── */}
                <div
                    className="mt-5 flex flex-wrap items-center gap-4 text-sm"
                    style={{ color: "var(--color-text-3)" }}
                >
                    {/* Status badge */}
                    <span
                        className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{
                            backgroundColor: `color-mix(in srgb, ${STATUS_COLOR[series.status] ?? "#6b7280"} 12%, transparent)`,
                            color: STATUS_COLOR[series.status] ?? "var(--color-text-3)",
                        }}
                    >
                        <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: STATUS_COLOR[series.status] ?? "#6b7280" }}
                        />
                        {formatLabel("status", series.status)}
                    </span>

                    <span style={{ color: "var(--color-layer-4)" }}>·</span>
                    <span>{formatLabel("format", series.format)}</span>

                    <span style={{ color: "var(--color-layer-4)" }}>·</span>
                    <span>{formatLabel("ageRating", series.ageRating)}</span>

                    <span style={{ color: "var(--color-layer-4)" }}>·</span>
                    <span className="flex items-center gap-1">
                        <Eye size={13} />
                        {formatCount(series.viewsCount)}
                    </span>

                    <span className="flex items-center gap-1">
                        <Heart size={13} />
                        {formatCount(series.likesCount)}
                    </span>

                    <span className="flex items-center gap-1">
                        <BookBookmark size={13} />
                        {formatCount(series.bookmarksCount)}
                    </span>

                    <span className="flex items-center gap-1">
                        <Users size={13} />
                        {formatCount(series.followersCount)}
                    </span>
                </div>

                {/* ── Sinopsis ─────────────────────────────────────────────────────── */}
                {series.synopsis && (
                    <p
                        className="mt-5 text-sm leading-relaxed"
                        style={{ color: "var(--color-text-2)", maxWidth: "65ch" }}
                    >
                        {series.synopsis}
                    </p>
                )}

                {/* ── Divider ──────────────────────────────────────────────────────── */}
                <div
                    className="mt-8 mb-6 h-px"
                    style={{ backgroundColor: "var(--color-layer-3)" }}
                />

                {/* ── Capítulos ────────────────────────────────────────────────────── */}
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock size={15} style={{ color: "var(--color-text-3)" }} />
                        <h2 className="text-sm font-semibold" style={{ color: "var(--color-text-1)" }}>
                            Capítulos
                        </h2>
                        <span
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: "var(--color-layer-3)", color: "var(--color-text-3)" }}
                        >
                            {totalChapters}
                        </span>
                    </div>
                </div>

                {/* Lista de capítulos */}
                {chapters.length === 0 ? (
                    <div
                        className="flex flex-col items-center justify-center rounded-xl py-16 text-center"
                        style={{ backgroundColor: "var(--color-layer-2)" }}
                    >
                        <BookOpen size={24} style={{ color: "var(--color-text-3)", marginBottom: "0.75rem" }} />
                        <p className="text-sm" style={{ color: "var(--color-text-3)" }}>
                            Aún no hay capítulos publicados
                        </p>
                    </div>
                ) : (
                    <div
                        className="overflow-hidden"
                        style={{
                            borderRadius: "var(--radius-xl)",
                            border: "1px solid var(--color-layer-3)",
                        }}
                    >
                        {chapters.map((chapter, index) => (
                            <ChapterRow
                                key={chapter.id}
                                href={`/series/${series.slug}/chapter/${Number(chapter.number)}`}
                                number={Number(chapter.number)}
                                title={chapter.title}
                                publishedAt={chapter.publishedAt?.toISOString() ?? null}
                                viewsCount={chapter.viewsCount}
                                likesCount={chapter.likesCount}
                                isLast={index === chapters.length - 1}
                            />
                        ))}
                    </div>
                )}

                {/* ── Paginación ───────────────────────────────────────────────────── */}
                {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between pb-16">
                        <Link
                            href={currentPage > 1 ? `/series/${slug}?page=${currentPage - 1}` : "#"}
                            aria-disabled={currentPage <= 1}
                            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                            style={{
                                backgroundColor: "var(--color-layer-2)",
                                color: currentPage <= 1 ? "var(--color-text-3)" : "var(--color-text-1)",
                                pointerEvents: currentPage <= 1 ? "none" : "auto",
                                opacity: currentPage <= 1 ? 0.4 : 1,
                            }}
                        >
                            <ArrowLeft size={14} weight="bold" />
                            Anterior
                        </Link>

                        <span className="text-sm" style={{ color: "var(--color-text-3)" }}>
                            Página {currentPage} de {totalPages}
                        </span>

                        <Link
                            href={currentPage < totalPages ? `/series/${slug}?page=${currentPage + 1}` : "#"}
                            aria-disabled={currentPage >= totalPages}
                            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                            style={{
                                backgroundColor: "var(--color-layer-2)",
                                color: currentPage >= totalPages ? "var(--color-text-3)" : "var(--color-text-1)",
                                pointerEvents: currentPage >= totalPages ? "none" : "auto",
                                opacity: currentPage >= totalPages ? 0.4 : 1,
                            }}
                        >
                            Siguiente
                            <ArrowRight size={14} weight="bold" />
                        </Link>
                    </div>
                )}

            </div>
        </main>
    );
}