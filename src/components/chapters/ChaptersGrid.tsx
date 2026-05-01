"use client";

// src/components/chapters/ChaptersGrid.tsx

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen } from "@phosphor-icons/react";
import { ChapterCard } from "./ChapterCard";

type Genre = { id: string; name: string; slug: string; color: string | null };

type Chapter = {
    id: string;
    number: number;
    title: string | null;
    slug: string;
    publishedAt: string | null;
    viewsCount: number;
    likesCount: number;
    series: {
        id: string;
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

interface ChaptersGridProps {
    chapters: Chapter[];
    total: number;
    page: number;
    totalPages: number;
}

export function ChaptersGrid({ chapters, total, page, totalPages }: ChaptersGridProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    function buildPageUrl(targetPage: number) {
        const params = new URLSearchParams(searchParams.toString());
        if (targetPage === 1) {
            params.delete("page");
        } else {
            params.set("page", String(targetPage));
        }
        const qs = params.toString();
        return `${pathname}${qs ? `?${qs}` : ""}`;
    }

    // Empty state
    if (chapters.length === 0) {
        return (
            <div
                className="flex flex-col items-center justify-center rounded-2xl py-24 text-center"
                style={{ backgroundColor: "var(--color-layer-2)", border: "1px solid var(--color-layer-3)" }}
            >
                <BookOpen size={28} style={{ color: "var(--color-text-3)", marginBottom: "0.75rem" }} />
                <p className="text-sm font-medium" style={{ color: "var(--color-text-2)" }}>
                    No hay capítulos publicados aún
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* Grid */}
            <div
                className="grid gap-4"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}
            >
                {chapters.map((chapter) => (
                    <ChapterCard key={chapter.id} {...chapter} />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-between">
                    <Link
                        href={page > 1 ? buildPageUrl(page - 1) : "#"}
                        aria-disabled={page <= 1}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                        style={{
                            backgroundColor: "var(--color-layer-2)",
                            color: page <= 1 ? "var(--color-text-3)" : "var(--color-text-1)",
                            pointerEvents: page <= 1 ? "none" : "auto",
                            opacity: page <= 1 ? 0.4 : 1,
                            border: "1px solid var(--color-layer-3)",
                        }}
                    >
                        <ArrowLeft size={14} weight="bold" />
                        Anterior
                    </Link>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                            let pageNum: number;
                            if (totalPages <= 7) pageNum = i + 1;
                            else if (page <= 4) pageNum = i + 1;
                            else if (page >= totalPages - 3) pageNum = totalPages - 6 + i;
                            else pageNum = page - 3 + i;

                            const isActive = pageNum === page;
                            return (
                                <Link
                                    key={pageNum}
                                    href={buildPageUrl(pageNum)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors"
                                    style={{
                                        backgroundColor: isActive ? "var(--color-text-1)" : "var(--color-layer-2)",
                                        color: isActive ? "var(--color-layer-1)" : "var(--color-text-3)",
                                        border: "1px solid var(--color-layer-3)",
                                    }}
                                >
                                    {pageNum}
                                </Link>
                            );
                        })}
                    </div>

                    <Link
                        href={page < totalPages ? buildPageUrl(page + 1) : "#"}
                        aria-disabled={page >= totalPages}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                        style={{
                            backgroundColor: "var(--color-layer-2)",
                            color: page >= totalPages ? "var(--color-text-3)" : "var(--color-text-1)",
                            pointerEvents: page >= totalPages ? "none" : "auto",
                            opacity: page >= totalPages ? 0.4 : 1,
                            border: "1px solid var(--color-layer-3)",
                        }}
                    >
                        Siguiente
                        <ArrowRight size={14} weight="bold" />
                    </Link>
                </div>
            )}

            {/* Count */}
            <p
                className="mt-4 pb-10 text-center text-xs"
                style={{ color: "var(--color-text-3)" }}
            >
                Mostrando {(page - 1) * 24 + 1}–{Math.min(page * 24, total)} de {total.toLocaleString()} capítulos
            </p>
        </div>
    );
}