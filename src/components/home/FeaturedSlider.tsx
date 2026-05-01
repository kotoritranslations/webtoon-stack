"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, Books } from "@phosphor-icons/react";

interface Series {
    id: string;
    slug: string;
    title: string;
    synopsis: string | null;
    coverUrl: string | null;
    status: string;
    viewsCount: number;
    chaptersCount: number;
    creator: {
        username: string | null;
        displayName: string | null;
    };
    genres: {
        genre: { name: string; color: string | null; slug: string };
    }[];
}

const STATUS_LABELS: Record<string, string> = {
    ongoing: "En curso",
    completed: "Completo",
    hiatus: "Hiatus",
    canceled: "Cancelado",
};

function formatViews(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
}

export function FeaturedSlider({ items }: { items: Series[] }) {
    const loopedItems = [...items, ...items, ...items];
    const totalReal = items.length;

    const trackRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [activeIndex, setActiveIndex] = useState(totalReal);
    const activeIndexRef = useRef(totalReal);
    const isUserScrolling = useRef(false);
    const userScrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isJumping = useRef(false);

    const scrollToIndexInstant = useCallback((i: number) => {
        const el = itemRefs.current[i];
        const track = trackRef.current;
        if (!el || !track) return;
        const elCenter = el.offsetLeft + el.offsetWidth / 2;
        track.scrollLeft = elCenter - track.clientWidth / 2;
    }, []);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        const handleScroll = () => {
            if (isJumping.current) return;

            const trackCenter = track.scrollLeft + track.clientWidth / 2;
            let closest = 0;
            let minDist = Infinity;

            itemRefs.current.forEach((el, i) => {
                if (!el) return;
                const elCenter = el.offsetLeft + el.offsetWidth / 2;
                const dist = Math.abs(trackCenter - elCenter);
                if (dist < minDist) {
                    minDist = dist;
                    closest = i;
                }
            });

            setActiveIndex(closest);
            activeIndexRef.current = closest;

            if (closest < totalReal) {
                isJumping.current = true;
                scrollToIndexInstant(closest + totalReal);
                activeIndexRef.current = closest + totalReal;
                setActiveIndex(closest + totalReal);
                setTimeout(() => { isJumping.current = false; }, 50);
            } else if (closest >= totalReal * 2) {
                isJumping.current = true;
                scrollToIndexInstant(closest - totalReal);
                activeIndexRef.current = closest - totalReal;
                setActiveIndex(closest - totalReal);
                setTimeout(() => { isJumping.current = false; }, 50);
            }
        };

        track.addEventListener("scroll", handleScroll, { passive: true });
        return () => track.removeEventListener("scroll", handleScroll);
    }, [items, totalReal, scrollToIndexInstant]);

    useEffect(() => {
        scrollToIndexInstant(totalReal);
    }, [totalReal, scrollToIndexInstant]);

    const scrollToIndex = useCallback((i: number) => {
        itemRefs.current[i]?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
        });
    }, []);

    const startAutoplay = useCallback(() => {
        if (autoplayRef.current !== null) clearInterval(autoplayRef.current);
        if (items.length <= 1) return;

        autoplayRef.current = setInterval(() => {
            if (isUserScrolling.current) return;
            const next = activeIndexRef.current + 1;
            scrollToIndex(next);
        }, 3500);
    }, [items.length, scrollToIndex]);

    useEffect(() => {
        startAutoplay();
        return () => {
            if (autoplayRef.current !== null) clearInterval(autoplayRef.current);
        };
    }, [startAutoplay]);

    const handlePointerDown = () => {
        isUserScrolling.current = true;
        if (userScrollTimeout.current !== null) clearTimeout(userScrollTimeout.current);
    };

    const handlePointerUp = () => {
        userScrollTimeout.current = setTimeout(() => {
            isUserScrolling.current = false;
            startAutoplay();
        }, 1500);
    };

    return (
        <div
            ref={trackRef}
            className="flex gap-3 overflow-x-auto px-4 sm:px-6"
            style={{
                scrollbarWidth: "none",
                scrollSnapType: "x mandatory",
                WebkitOverflowScrolling: "touch",
            }}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
        >
            {loopedItems.map((series, i) => {
                const isActive = i === activeIndex;
                const primaryGenre = series.genres[0]?.genre ?? null;

                return (
                    <div
                        key={`${series.id}-${i}`}
                        ref={(el) => { itemRefs.current[i] = el; }}
                        className="shrink-0 overflow-hidden rounded-2xl transition-all duration-500 ease-in-out"
                        style={{
                            scrollSnapAlign: "center",
                            width: isActive ? "min(480px, 92vw)" : "min(200px, 44vw)",
                            height: "min(260px, 56vw)",
                            backgroundColor: "var(--color-layer-2)",
                        }}
                    >
                        {isActive ? (
                            <Link href={`/series/${series.slug}`} className="flex h-full w-full">
                                <div
                                    className="relative shrink-0 overflow-hidden rounded-2xl"
                                    style={{ width: "min(200px, 44vw)", height: "100%" }}
                                >
                                    {series.coverUrl ? (
                                        <Image
                                            src={series.coverUrl}
                                            alt={series.title}
                                            fill
                                            className="object-cover"
                                            sizes="200px"
                                        />
                                    ) : (
                                        <div
                                            className="flex h-full items-center justify-center"
                                            style={{ backgroundColor: "var(--color-layer-3)" }}
                                        >
                                            <Books size={28} style={{ color: "var(--color-text-3)" }} />
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-1 flex-col justify-between p-3">
                                    <div className="flex flex-col gap-1.5">
                                        {primaryGenre && (
                                            <span
                                                className="w-fit rounded-[4px] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
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
                                            className="line-clamp-2 text-sm font-bold leading-snug"
                                            style={{ color: "var(--color-text-1)" }}
                                        >
                                            {series.title}
                                        </p>
                                        {series.synopsis && (
                                            <p
                                                className="line-clamp-2 text-[10px] leading-relaxed"
                                                style={{ color: "var(--color-text-3)" }}
                                            >
                                                {series.synopsis}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <span
                                                className="flex items-center gap-1 text-[10px]"
                                                style={{ color: "var(--color-text-3)" }}
                                            >
                                                <Eye size={10} />
                                                {formatViews(series.viewsCount)}
                                            </span>
                                            <span
                                                className="flex items-center gap-1 text-[10px]"
                                                style={{ color: "var(--color-text-3)" }}
                                            >
                                                <Books size={10} />
                                                {series.chaptersCount} caps
                                            </span>
                                        </div>
                                        <span
                                            className="text-[9px] font-medium"
                                            style={{ color: "var(--color-text-3)" }}
                                        >
                                            {STATUS_LABELS[series.status] ?? series.status}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <button
                                type="button"
                                onClick={() => scrollToIndex(i)}
                                className="relative h-full w-full overflow-hidden rounded-2xl"
                            >
                                {series.coverUrl ? (
                                    <Image
                                        src={series.coverUrl}
                                        alt={series.title}
                                        fill
                                        className="object-cover transition-all duration-500"
                                        sizes="200px"
                                        style={{ filter: "grayscale(100%) brightness(0.6)" }}
                                    />
                                ) : (
                                    <div
                                        className="flex h-full items-center justify-center"
                                        style={{ backgroundColor: "var(--color-layer-3)" }}
                                    >
                                        <Books size={24} style={{ color: "var(--color-text-3)" }} />
                                    </div>
                                )}
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
}