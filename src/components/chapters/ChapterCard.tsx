// src/components/chapters/ChapterCard.tsx

import Link from "next/link";
import Image from "next/image";
import { Eye, Heart, BookOpen, Clock } from "@phosphor-icons/react/dist/ssr";

type Genre = { id: string; name: string; slug: string; color: string | null };

type ChapterCardProps = {
    id: string;
    number: number;
    title: string | null;
    slug: string;
    publishedAt: string | null;
    viewsCount: number;
    likesCount: number;
    series: {
        title: string;
        slug: string;
        coverUrl: string | null;
        format: string;
        ageRating: string;
        creator: {
            username: string | null;
            displayName: string | null;
        };
        genres: { genre: Genre }[];
    };
};

const FORMAT_LABEL: Record<string, string> = {
    webtoon: "Webtoon",
    manga: "Manga",
    manhwa: "Manhwa",
    comic: "Cómic",
    novel: "Novela",
};

function formatCount(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
}

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);

    if (mins < 60) return `hace ${mins}m`;
    if (hours < 24) return `hace ${hours}h`;
    if (days < 7) return `hace ${days}d`;
    return new Date(iso).toLocaleDateString("es", { day: "numeric", month: "short" });
}

export function ChapterCard({
    number,
    title,
    slug,
    publishedAt,
    viewsCount,
    likesCount,
    series,
}: ChapterCardProps) {
    const chapterHref = `/series/${series.slug}/chapter/${number}`;
    const seriesHref = `/series/${series.slug}`;
    const topGenres = series.genres.slice(0, 2).map((g) => g.genre);

    return (
        <div
            className="group flex flex-col overflow-hidden transition-transform duration-200 hover:-translate-y-0.5"
            style={{
                borderRadius: "var(--radius-xl)",
                backgroundColor: "var(--color-layer-2)",
                border: "1px solid var(--color-layer-3)",
            }}
        >
            {/* Cover — lleva a la serie */}
            <Link href={seriesHref} className="relative block overflow-hidden" style={{ aspectRatio: "2/3", backgroundColor: "var(--color-layer-3)", flexShrink: 0 }}>
                {series.coverUrl ? (
                    <Image
                        src={series.coverUrl}
                        alt={series.title}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 15vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <BookOpen size={28} style={{ color: "var(--color-text-3)" }} />
                    </div>
                )}

                {/* Hover overlay */}
                <div
                    className="absolute inset-0 flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)" }}
                >
                    <div className="flex items-center gap-2 text-white text-[10px]">
                        <span className="flex items-center gap-0.5"><Eye size={10} />{formatCount(viewsCount)}</span>
                        <span className="flex items-center gap-0.5"><Heart size={10} />{formatCount(likesCount)}</span>
                    </div>
                </div>

                {/* Badges */}
                {series.ageRating === "mature" && (
                    <div
                        className="absolute top-1.5 right-1.5 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase"
                        style={{ backgroundColor: "rgba(239,68,68,0.85)", color: "#fff", backdropFilter: "blur(4px)" }}
                    >
                        +18
                    </div>
                )}
                <div
                    className="absolute top-1.5 left-1.5 rounded px-1.5 py-0.5 text-[9px] font-medium uppercase"
                    style={{ backgroundColor: "rgba(0,0,0,0.55)", color: "rgba(255,255,255,0.9)", backdropFilter: "blur(4px)" }}
                >
                    {FORMAT_LABEL[series.format] ?? series.format}
                </div>

                {/* Chapter number pill — encima del cover */}
                <div
                    className="absolute bottom-1.5 left-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ backgroundColor: "rgba(0,0,0,0.7)", color: "#fff", backdropFilter: "blur(4px)" }}
                >
                    Cap. {number}
                </div>
            </Link>

            {/* Info */}
            <div className="flex flex-1 flex-col gap-1 p-3">
                {/* Serie title */}
                <Link
                    href={seriesHref}
                    className="line-clamp-1 text-sm font-semibold leading-snug transition-opacity hover:opacity-70"
                    style={{ color: "var(--color-text-1)", letterSpacing: "-0.01em" }}
                >
                    {series.title}
                </Link>

                {/* Chapter title o fallback */}
                <Link
                    href={chapterHref}
                    className="line-clamp-1 text-[11px] transition-opacity hover:opacity-70"
                    style={{ color: "var(--color-text-3)" }}
                >
                    {title ? title : `Capítulo ${number}`}
                </Link>

                {/* Genres */}
                {topGenres.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                        {topGenres.map((g) => (
                            <span
                                key={g.id}
                                className="rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                                style={{
                                    backgroundColor: `color-mix(in srgb, ${g.color ?? "#6b7280"} 14%, transparent)`,
                                    color: g.color ?? "var(--color-text-3)",
                                }}
                            >
                                {g.name}
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer: creator + time */}
                <div className="mt-auto flex items-center justify-between pt-1.5">
                    <span className="truncate text-[10px]" style={{ color: "var(--color-text-3)" }}>
                        {series.creator.displayName ?? series.creator.username ?? "Anónimo"}
                    </span>
                    {publishedAt && (
                        <span
                            className="flex items-center gap-0.5 text-[10px] shrink-0 ml-1"
                            style={{ color: "var(--color-text-3)" }}
                        >
                            <Clock size={10} />
                            {timeAgo(publishedAt)}
                        </span>
                    )}
                </div>
            </div>

            {/* CTA — leer capítulo */}
            <Link
                href={chapterHref}
                className="flex items-center justify-center py-2 text-[11px] font-semibold transition-colors"
                style={{
                    borderTop: "1px solid var(--color-layer-3)",
                    color: "var(--color-text-2)",
                    backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-layer-3)";
                    (e.currentTarget as HTMLElement).style.color = "var(--color-text-1)";
                }}
                onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "var(--color-text-2)";
                }}
            >
                Leer capítulo →
            </Link>
        </div>
    );
}