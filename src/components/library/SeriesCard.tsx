// src/components/library/SeriesCard.tsx

import Link from "next/link";
import Image from "next/image";
import { Eye, Heart, BookOpen, BookBookmark } from "@phosphor-icons/react/dist/ssr";

type Genre = { id: string; name: string; slug: string; color: string | null };

type SeriesCardProps = {
    slug: string;
    title: string;
    synopsis: string | null;
    coverUrl: string | null;
    status: string;
    ageRating: string;
    format: string;
    viewsCount: number;
    likesCount: number;
    bookmarksCount: number;
    chaptersCount: number;
    genres: { genre: Genre }[];
    creator: {
        username: string | null;
        displayName: string | null;
        avatar: string | null;
    };
};

const STATUS_COLOR: Record<string, string> = {
    ongoing: "#22c55e",
    completed: "#3b82f6",
    hiatus: "#f59e0b",
    canceled: "#ef4444",
};

const STATUS_LABEL: Record<string, string> = {
    ongoing: "En curso",
    completed: "Completada",
    hiatus: "En pausa",
    canceled: "Cancelada",
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

export function SeriesCard({
    slug,
    title,
    synopsis,
    coverUrl,
    status,
    ageRating,
    format,
    viewsCount,
    likesCount,
    bookmarksCount,
    chaptersCount,
    genres,
    creator,
}: SeriesCardProps) {
    const topGenres = genres.slice(0, 2).map((g) => g.genre);
    const statusColor = STATUS_COLOR[status] ?? "#6b7280";

    return (
        <Link
            href={`/series/${slug}`}
            className="group flex flex-col overflow-hidden transition-transform duration-200 hover:-translate-y-0.5"
            style={{
                borderRadius: "var(--radius-xl)",
                backgroundColor: "var(--color-layer-2)",
                border: "1px solid var(--color-layer-3)",
            }}
        >
            {/* Cover */}
            <div
                className="relative overflow-hidden"
                style={{
                    aspectRatio: "2/3",
                    backgroundColor: "var(--color-layer-3)",
                    flexShrink: 0,
                }}
            >
                {coverUrl ? (
                    <Image
                        src={coverUrl}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 15vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <BookOpen size={28} style={{ color: "var(--color-text-3)" }} />
                    </div>
                )}

                {/* Overlay con stats al hacer hover */}
                <div
                    className="absolute inset-0 flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{
                        background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)",
                    }}
                >
                    <div className="flex items-center gap-2 text-white text-[10px]">
                        <span className="flex items-center gap-0.5">
                            <Eye size={10} />
                            {formatCount(viewsCount)}
                        </span>
                        <span className="flex items-center gap-0.5">
                            <Heart size={10} />
                            {formatCount(likesCount)}
                        </span>
                        <span className="flex items-center gap-0.5">
                            <BookBookmark size={10} />
                            {formatCount(bookmarksCount)}
                        </span>
                    </div>
                </div>

                {/* Age rating badge — solo si es mature */}
                {ageRating === "mature" && (
                    <div
                        className="absolute top-1.5 right-1.5 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase"
                        style={{
                            backgroundColor: "rgba(239,68,68,0.85)",
                            color: "#fff",
                            backdropFilter: "blur(4px)",
                        }}
                    >
                        +18
                    </div>
                )}

                {/* Format badge */}
                <div
                    className="absolute top-1.5 left-1.5 rounded px-1.5 py-0.5 text-[9px] font-medium uppercase"
                    style={{
                        backgroundColor: "rgba(0,0,0,0.55)",
                        color: "rgba(255,255,255,0.9)",
                        backdropFilter: "blur(4px)",
                    }}
                >
                    {FORMAT_LABEL[format] ?? format}
                </div>
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col gap-1.5 p-3">
                {/* Title */}
                <h3
                    className="line-clamp-2 text-sm font-semibold leading-snug"
                    style={{ color: "var(--color-text-1)", letterSpacing: "-0.01em" }}
                >
                    {title}
                </h3>

                {/* Creator */}
                <p
                    className="text-[11px] truncate"
                    style={{ color: "var(--color-text-3)" }}
                >
                    {creator.displayName ?? creator.username ?? "Anónimo"}
                </p>

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

                {/* Footer: status + chapters */}
                <div className="mt-auto flex items-center justify-between pt-1.5">
                    <span
                        className="flex items-center gap-1 text-[10px] font-medium"
                        style={{ color: statusColor }}
                    >
                        <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: statusColor }}
                        />
                        {STATUS_LABEL[status] ?? status}
                    </span>

                    <span
                        className="flex items-center gap-0.5 text-[10px]"
                        style={{ color: "var(--color-text-3)" }}
                    >
                        <BookOpen size={10} />
                        {chaptersCount} cap.
                    </span>
                </div>
            </div>
        </Link>
    );
}