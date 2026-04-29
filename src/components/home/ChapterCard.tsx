// src/components/home/ChapterCard.tsx

import Image from "next/image";
import Link from "next/link";
import { Eye } from "@phosphor-icons/react/dist/ssr";

interface ChapterCardProps {
    href: string;
    coverUrl: string | null;
    seriesTitle: string;
    chapterNumber: number;
    chapterTitle: string | null;
    viewsCount: number;
    timeAgo: string;
    genre: { name: string; color: string | null } | null;
}

function formatViews(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
}

export function ChapterCard({
    href,
    coverUrl,
    seriesTitle,
    chapterNumber,
    chapterTitle,
    viewsCount,
    timeAgo,
    genre,
}: ChapterCardProps) {
    return (
        <Link
            href={href}
            className="group flex items-center gap-3 rounded-[10px] p-2 transition-colors duration-150 hover:bg-[var(--color-layer-2)]"
        >
            {/* Cover thumbnail */}
            <div
                className="relative flex-shrink-0 overflow-hidden rounded-[6px]"
                style={{ width: 68, height: 96 }}
            >
                {coverUrl ? (
                    <Image
                        src={coverUrl}
                        alt={seriesTitle}
                        fill
                        className="object-cover transition-transform duration-200 group-hover:scale-105"
                        sizes="68px"
                    />
                ) : (
                    <div
                        className="h-full w-full"
                        style={{ backgroundColor: "var(--color-layer-3)" }}
                    />
                )}

                {/* Número de capítulo sobre la imagen */}
                <div
                    className="absolute bottom-1 left-1 rounded-[3px] px-1 py-0.5 text-[9px] font-bold"
                    style={{
                        backgroundColor: "rgba(0,0,0,0.75)",
                        color: "#fff",
                        backdropFilter: "blur(2px)",
                    }}
                >
                    #{chapterNumber}
                </div>
            </div>

            {/* Info */}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                {/* Título de la serie */}
                <p
                    className="line-clamp-1 text-xs font-semibold leading-tight"
                    style={{ color: "var(--color-text-1)" }}
                >
                    {seriesTitle}
                </p>

                {/* Título del capítulo */}
                <p
                    className="line-clamp-1 text-xs"
                    style={{ color: "var(--color-text-2)" }}
                >
                    {chapterTitle
                        ? `Cap. ${chapterNumber}: ${chapterTitle}`
                        : `Capítulo ${chapterNumber}`}
                </p>

                {/* Meta row */}
                <div className="flex items-center gap-2 pt-0.5">
                    {genre && (
                        <span
                            className="rounded-[4px] px-1.5 py-0.5 text-[9px] font-medium"
                            style={{
                                backgroundColor: genre.color
                                    ? `${genre.color}22`
                                    : "var(--color-layer-3)",
                                color: genre.color ?? "var(--color-text-3)",
                            }}
                        >
                            {genre.name}
                        </span>
                    )}

                    <span
                        className="flex items-center gap-0.5 text-[10px]"
                        style={{ color: "var(--color-text-3)" }}
                    >
                        <Eye size={10} />
                        {formatViews(viewsCount)}
                    </span>

                    <span
                        className="text-[10px]"
                        style={{ color: "var(--color-text-3)" }}
                    >
                        {timeAgo}
                    </span>
                </div>
            </div>
        </Link>
    );
}