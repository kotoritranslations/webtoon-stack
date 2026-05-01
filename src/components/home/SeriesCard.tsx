// src/components/home/SeriesCard.tsx

import Image from "next/image";
import Link from "next/link";
import { Eye, Books } from "@phosphor-icons/react/dist/ssr";

interface SeriesCardProps {
    series: {
        id: string;
        slug: string;
        title: string;
        synopsis: string | null;
        coverUrl: string | null;
        status: string;
        format: string;
        viewsCount: number;
        likesCount: number;
        chaptersCount: number;
        creator: {
            username: string | null;
            displayName: string | null;
            avatar: string | null;
        };
        genres: {
            genre: { name: string; color: string | null; slug: string };
        }[];
    };
}

const STATUS_LABELS: Record<string, string> = {
    ongoing: "En curso",
    completed: "Completo",
    hiatus: "Hiatus",
    canceled: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
    ongoing: "#22c55e",
    completed: "#3b82f6",
    hiatus: "#f59e0b",
    canceled: "#ef4444",
};

function formatViews(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
}

export function SeriesCard({ series }: SeriesCardProps) {
    const primaryGenre = series.genres[0]?.genre ?? null;
    const statusColor = STATUS_COLORS[series.status] ?? "#6b7280";

    return (
        <Link
            href={`/series/${series.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-[10px] transition-transform duration-200 hover:-translate-y-0.5 shrink-0"
            style={{
                width: "clamp(140px, 18vw, 220px)",
                backgroundColor: "var(--color-layer-2)",
                border: "1px solid var(--color-border)",
            }}
        >
            {/* Cover */}
            <div className="relative overflow-hidden" style={{ aspectRatio: "2/3" }}>
                {series.coverUrl ? (
                    <Image
                        src={series.coverUrl}
                        alt={series.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 40vw, 18vw"
                    />
                ) : (
                    <div
                        className="flex h-full items-center justify-center"
                        style={{ backgroundColor: "var(--color-layer-3)" }}
                    >
                        <Books size={28} style={{ color: "var(--color-text-3)" }} />
                    </div>
                )}

                {/* Overlay en hover */}
                <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    style={{
                        background:
                            "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)",
                    }}
                />

                {/* Badge de estado */}
                <div
                    className="absolute left-2 top-2 rounded-[4px] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
                    style={{
                        backgroundColor: statusColor,
                        color: "#fff",
                    }}
                >
                    {STATUS_LABELS[series.status] ?? series.status}
                </div>

                {/* Stats en hover */}
                <div
                    className="absolute bottom-0 left-0 right-0 flex items-center gap-2 p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                >
                    <span
                        className="flex items-center gap-1 text-[10px] font-medium"
                        style={{ color: "rgba(255,255,255,0.9)" }}
                    >
                        <Eye size={10} />
                        {formatViews(series.viewsCount)}
                    </span>
                    {series.chaptersCount > 0 && (
                        <span
                            className="flex items-center gap-1 text-[10px] font-medium"
                            style={{ color: "rgba(255,255,255,0.9)" }}
                        >
                            <Books size={10} />
                            {series.chaptersCount} caps
                        </span>
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-1 p-2">
                <p
                    className="line-clamp-2 text-xs font-semibold leading-tight"
                    style={{ color: "var(--color-text-1)" }}
                >
                    {series.title}
                </p>

                {primaryGenre && (
                    <span
                        className="w-fit rounded-[4px] px-1.5 py-0.5 text-[9px] font-medium"
                        style={{
                            backgroundColor: primaryGenre.color
                                ? `${primaryGenre.color}22`
                                : "var(--color-layer-3)",
                            color: primaryGenre.color ?? "var(--color-text-3)",
                        }}
                    >
                        {primaryGenre.name}
                    </span>
                )}

                <p
                    className="text-[10px]"
                    style={{ color: "var(--color-text-3)" }}
                >
                    {series.creator.displayName ?? series.creator.username ?? "Creador"}
                </p>
            </div>
        </Link>
    );
}