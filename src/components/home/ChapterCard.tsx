import Image from "next/image";
import Link from "next/link";

interface Chapter {
    number: number;
    title: string | null;
    publishedAt: Date | null;
    timeAgo: string;
}

interface ChapterCardProps {
    seriesHref: string;
    coverUrl: string | null;
    seriesTitle: string;
    chapters: Chapter[];
}

export function ChapterCard({
    seriesHref,
    coverUrl,
    seriesTitle,
    chapters,
}: ChapterCardProps) {
    return (
        <div className="flex flex-col gap-1.5">
            {/* Portada */}
            <Link
                href={seriesHref}
                className="group relative block overflow-hidden rounded-[8px]"
                style={{ aspectRatio: "2/3" }}
            >
                {coverUrl ? (
                    <Image
                        src={coverUrl}
                        alt={seriesTitle}
                        fill
                        className="object-cover transition-transform duration-200 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                    />
                ) : (
                    <div
                        className="h-full w-full"
                        style={{ backgroundColor: "var(--color-layer-3)" }}
                    />
                )}
            </Link>

            {/* Título de la serie */}
            <p
                className="line-clamp-1 px-0.5 text-xs font-semibold"
                style={{ color: "var(--color-text-1)" }}
            >
                {seriesTitle}
            </p>

            {/* Botones de capítulos */}
            <div className="flex flex-col gap-1">
                {chapters.map((ch) => (
                    <Link
                        key={ch.number}
                        href={`${seriesHref}/chapter/${ch.number}`}
                        className="flex items-center justify-between rounded-[6px] px-2 py-1.5 transition-colors hover:opacity-80"
                        style={{ backgroundColor: "var(--color-layer-2)" }}
                    >
                        <span
                            className="line-clamp-1 text-[10px] font-medium"
                            style={{ color: "var(--color-text-1)" }}
                        >
                            {ch.title ? `Cap. ${ch.number}: ${ch.title}` : `Cap. ${ch.number}`}
                        </span>
                        <span
                            className="ml-2 flex-shrink-0 text-[10px]"
                            style={{ color: "var(--color-text-3)" }}
                        >
                            {ch.timeAgo}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}