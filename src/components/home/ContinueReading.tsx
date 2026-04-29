// src/components/home/ContinueReading.tsx

import Image from "next/image";
import Link from "next/link";
import { PlayCircle } from "@phosphor-icons/react/dist/ssr";

interface ContinueReadingItem {
    lastPageOrder: number;
    updatedAt: Date;
    chapter: {
        id: string;
        number: number;
        title: string | null;
        slug: string;
        series: {
            slug: string;
            title: string;
            coverUrl: string | null;
            chaptersCount: number;
        };
    };
}

interface ContinueReadingProps {
    items: ContinueReadingItem[];
}

export function ContinueReading({ items }: ContinueReadingProps) {
    if (items.length === 0) return null;

    return (
        <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
            {/* Header */}
            <div className="mb-4 flex items-center gap-2">
                <PlayCircle
                    size={16}
                    weight="fill"
                    style={{ color: "var(--color-accent)" }}
                />
                <h2
                    className="text-base font-semibold tracking-tight"
                    style={{ color: "var(--color-text-1)" }}
                >
                    Continuar leyendo
                </h2>
            </div>

            {/* Scroll horizontal de cards */}
            <div
                className="flex gap-3 overflow-x-auto pb-2"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {items.map((item) => {
                    const { chapter } = item;
                    const href = `/series/${chapter.series.slug}/chapter/${chapter.number}`;

                    return (
                        <Link
                            key={chapter.id}
                            href={href}
                            className="group relative flex-shrink-0 overflow-hidden rounded-[10px] transition-transform duration-200 hover:-translate-y-0.5"
                            style={{
                                width: 140,
                                border: "1px solid var(--color-border)",
                                backgroundColor: "var(--color-layer-2)",
                            }}
                        >
                            {/* Cover */}
                            <div
                                className="relative overflow-hidden"
                                style={{ aspectRatio: "2/3" }}
                            >
                                {chapter.series.coverUrl ? (
                                    <Image
                                        src={chapter.series.coverUrl}
                                        alt={chapter.series.title}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        sizes="140px"
                                    />
                                ) : (
                                    <div
                                        className="h-full w-full"
                                        style={{ backgroundColor: "var(--color-layer-3)" }}
                                    />
                                )}

                                {/* Overlay oscuro */}
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background:
                                            "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 55%)",
                                    }}
                                />

                                {/* Ícono de play */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                    <div
                                        className="flex h-10 w-10 items-center justify-center rounded-full"
                                        style={{ backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}
                                    >
                                        <PlayCircle size={24} weight="fill" color="#fff" />
                                    </div>
                                </div>

                                {/* Info abajo del cover */}
                                <div className="absolute bottom-0 left-0 right-0 p-2">
                                    <p
                                        className="line-clamp-1 text-[10px] font-semibold"
                                        style={{ color: "#fff" }}
                                    >
                                        {chapter.series.title}
                                    </p>
                                    <p
                                        className="text-[9px]"
                                        style={{ color: "rgba(255,255,255,0.7)" }}
                                    >
                                        Cap. {chapter.number}
                                        {chapter.title ? `: ${chapter.title}` : ""}
                                    </p>
                                </div>
                            </div>

                            {/* Barra de progreso */}
                            <div
                                className="h-0.5 w-full"
                                style={{ backgroundColor: "var(--color-layer-3)" }}
                            >
                                <div
                                    className="h-full"
                                    style={{
                                        backgroundColor: "var(--color-accent)",
                                        // Estimamos 20 páginas por cap como default si no hay datos
                                        width: `${Math.min((item.lastPageOrder / 20) * 100, 95)}%`,
                                    }}
                                />
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}