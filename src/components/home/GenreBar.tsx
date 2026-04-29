"use client";

// src/components/home/GenreBar.tsx

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

interface Genre {
    id: string;
    name: string;
    slug: string;
    color: string | null;
}

interface GenreBarProps {
    genres: Genre[];
}

export function GenreBar({ genres }: GenreBarProps) {
    const searchParams = useSearchParams();
    const activeGenre = searchParams.get("genre") ?? "all";
    const scrollRef = useRef<HTMLDivElement>(null);

    function scroll(dir: "left" | "right") {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });
    }

    const allGenres = [{ id: "all", name: "Todo", slug: "all", color: null }, ...genres];

    return (
        <div className="relative flex items-center">
            {/* Botón izquierda */}
            <button
                onClick={() => scroll("left")}
                aria-label="Scroll izquierda"
                className="absolute left-0 z-10 flex h-full items-center justify-center px-2 transition-opacity hover:opacity-70"
                style={{
                    background:
                        "linear-gradient(to right, var(--color-layer-1) 60%, transparent)",
                    minWidth: "48px",
                }}
            >
                <CaretLeft size={14} style={{ color: "var(--color-text-2)" }} />
            </button>

            {/* Chips scrollables */}
            <div
                ref={scrollRef}
                className="flex items-center gap-2 overflow-x-auto px-10 py-3"
                style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    WebkitOverflowScrolling: "touch",
                }}
            >
                {allGenres.map((genre) => {
                    const isActive = activeGenre === genre.slug;
                    const href =
                        genre.slug === "all" ? "/" : `/?genre=${genre.slug}`;

                    return (
                        <Link
                            key={genre.id}
                            href={href}
                            scroll={false}
                            className="flex-shrink-0 rounded-[8px] px-3.5 py-1.5 text-xs font-medium transition-all duration-150"
                            style={
                                isActive
                                    ? {
                                        backgroundColor: "var(--color-text-1)",
                                        color: "var(--color-layer-1)",
                                    }
                                    : {
                                        backgroundColor: "var(--color-layer-2)",
                                        color: "var(--color-text-2)",
                                        border: "1px solid var(--color-border)",
                                    }
                            }
                        >
                            {genre.name}
                        </Link>
                    );
                })}
            </div>

            {/* Botón derecha */}
            <button
                onClick={() => scroll("right")}
                aria-label="Scroll derecha"
                className="absolute right-0 z-10 flex h-full items-center justify-center px-2 transition-opacity hover:opacity-70"
                style={{
                    background:
                        "linear-gradient(to left, var(--color-layer-1) 60%, transparent)",
                    minWidth: "48px",
                }}
            >
                <CaretRight size={14} style={{ color: "var(--color-text-2)" }} />
            </button>
        </div>
    );
}