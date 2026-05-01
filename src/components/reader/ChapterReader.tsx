"use client";

// src/components/reader/ChapterReader.tsx

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    ArrowLineLeft,
    Books,
    Rows,
    SquaresFour,
    CaretLeft,
    CaretRight,
    List,
    X,
} from "@phosphor-icons/react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Page {
    id: string;
    order: number;
    imageUrl: string;
    width: number | null;
    height: number | null;
}

interface ChapterNav {
    number: number;
    title: string | null;
}

interface ChapterReaderProps {
    seriesSlug: string;
    seriesTitle: string;
    chapterNumber: number;
    chapterTitle: string | null;
    authorNote: string | null;
    pages: Page[];
    prevChapter: ChapterNav | null;
    nextChapter: ChapterNav | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ChapterReader({
    seriesSlug,
    seriesTitle,
    chapterNumber,
    chapterTitle,
    authorNote,
    pages,
    prevChapter,
    nextChapter,
}: ChapterReaderProps) {
    const router = useRouter();

    const [mode, setMode] = useState<"scroll" | "paginated">("scroll");
    const [currentPage, setCurrentPage] = useState(0);
    const [barsVisible, setBarsVisible] = useState(true);
    const lastScrollY = useRef(0);
    const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [showPageList, setShowPageList] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        if (mode !== "scroll") return;

        const onScroll = () => {
            const y = window.scrollY;
            const max = document.documentElement.scrollHeight - window.innerHeight;

            setScrollProgress(max > 0 ? Math.round((y / max) * 100) : 0);

            if (y < 80) {
                setBarsVisible(true);
            } else if (y > lastScrollY.current + 8) {
                setBarsVisible(false);
            } else if (y < lastScrollY.current - 8) {
                setBarsVisible(true);
            }

            lastScrollY.current = y;

            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
            scrollTimeout.current = setTimeout(() => setBarsVisible(true), 2500);
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        };
    }, [mode]);

    useEffect(() => {
        if (mode !== "paginated") return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight" || e.key === "ArrowDown") goNextPage();
            if (e.key === "ArrowLeft" || e.key === "ArrowUp") goPrevPage();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [mode, currentPage, pages.length]);

    const goNextPage = useCallback(() => {
        if (currentPage < pages.length - 1) {
            setCurrentPage((p) => p + 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [currentPage, pages.length]);

    const goPrevPage = useCallback(() => {
        if (currentPage > 0) {
            setCurrentPage((p) => p - 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [currentPage]);

    const switchMode = (newMode: "scroll" | "paginated") => {
        setMode(newMode);
        setCurrentPage(0);
        window.scrollTo({ top: 0 });
        setBarsVisible(true);
    };

    const barBase: React.CSSProperties = {
        position: "fixed",
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: "color-mix(in srgb, var(--color-layer-0) 92%, transparent)",
        backdropFilter: "blur(12px)",
        borderColor: "var(--color-layer-3)",
        transition: "transform 0.25s ease, opacity 0.25s ease",
        transform: barsVisible ? "translateY(0)" : undefined,
        opacity: barsVisible ? 1 : 0,
        pointerEvents: barsVisible ? "auto" : "none",
    };

    const chapterLabel = `Cap. ${chapterNumber}${chapterTitle ? ` — ${chapterTitle}` : ""}`;
    const progressPct = mode === "scroll" ? scrollProgress : Math.round(((currentPage + 1) / pages.length) * 100);

    return (
        <div style={{ backgroundColor: "var(--color-layer-0)", minHeight: "100vh" }}>
            {/* ── TOP BAR ───────────────────────────────────────────────────────── */}
            <header
                style={{
                    ...barBase,
                    top: 0,
                    transform: barsVisible ? "translateY(0)" : "translateY(-100%)",
                    borderBottom: "1px solid var(--color-layer-3)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        maxWidth: "720px",
                        margin: "0 auto",
                        padding: "0.625rem 1rem",
                    }}
                >
                    <Link
                        href={`/series/${seriesSlug}`}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "2rem",
                            height: "2rem",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--color-layer-3)",
                            backgroundColor: "var(--color-layer-2)",
                            color: "var(--color-text-2)",
                            flexShrink: 0,
                            textDecoration: "none",
                        }}
                    >
                        <ArrowLineLeft size={15} weight="bold" />
                    </Link>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                            style={{
                                fontSize: "0.6875rem",
                                color: "var(--color-text-3)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                lineHeight: 1,
                                marginBottom: "0.2rem",
                            }}
                        >
                            {seriesTitle}
                        </p>
                        <p
                            style={{
                                fontSize: "0.8125rem",
                                fontWeight: 600,
                                color: "var(--color-text-1)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                lineHeight: 1,
                            }}
                        >
                            {chapterLabel}
                        </p>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--color-layer-3)",
                            overflow: "hidden",
                            flexShrink: 0,
                        }}
                    >
                        {(["scroll", "paginated"] as const).map((m) => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => switchMode(m)}
                                title={m === "scroll" ? "Scroll continuo" : "Paginado"}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "2rem",
                                    height: "2rem",
                                    border: "none",
                                    backgroundColor: mode === m ? "var(--color-layer-3)" : "transparent",
                                    color: mode === m ? "var(--color-text-1)" : "var(--color-text-3)",
                                    cursor: "pointer",
                                    transition: "background-color 0.15s",
                                }}
                            >
                                {m === "scroll" ? <Rows size={14} weight="bold" /> : <SquaresFour size={14} weight="bold" />}
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowPageList(!showPageList)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "2rem",
                            height: "2rem",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--color-layer-3)",
                            backgroundColor: showPageList ? "var(--color-layer-3)" : "var(--color-layer-2)",
                            color: "var(--color-text-2)",
                            cursor: "pointer",
                            flexShrink: 0,
                        }}
                    >
                        {showPageList ? <X size={14} weight="bold" /> : <List size={14} weight="bold" />}
                    </button>
                </div>

                <div style={{ height: "2px", backgroundColor: "var(--color-layer-3)" }}>
                    <div
                        style={{
                            height: "100%",
                            width: `${progressPct}%`,
                            backgroundColor: "var(--color-accent, var(--color-text-1))",
                            transition: "width 0.3s ease",
                        }}
                    />
                </div>
            </header>

            {/* ── PAGE LIST PANEL ───────────────────────────────────────────────── */}
            {showPageList && (
                <div
                    style={{
                        position: "fixed",
                        top: "60px",
                        right: "1rem",
                        zIndex: 49,
                        width: "200px",
                        maxHeight: "60vh",
                        overflowY: "auto",
                        borderRadius: "var(--radius-xl)",
                        border: "1px solid var(--color-layer-3)",
                        backgroundColor: "var(--color-layer-1)",
                        padding: "0.5rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.25rem",
                    }}
                >
                    {pages.map((page, i) => (
                        <button
                            key={page.id}
                            type="button"
                            onClick={() => {
                                if (mode === "paginated") {
                                    setCurrentPage(i);
                                    window.scrollTo({ top: 0 });
                                } else {
                                    document.getElementById(`page-${i}`)?.scrollIntoView({ behavior: "smooth" });
                                }
                                setShowPageList(false);
                            }}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.625rem",
                                padding: "0.375rem 0.5rem",
                                borderRadius: "var(--radius-md)",
                                border: "none",
                                backgroundColor: (mode === "paginated" && currentPage === i) ? "var(--color-layer-3)" : "transparent",
                                color: "var(--color-text-2)",
                                fontSize: "0.8125rem",
                                cursor: "pointer",
                                textAlign: "left",
                                width: "100%",
                            }}
                        >
                            <div
                                style={{
                                    width: "28px",
                                    height: "40px",
                                    borderRadius: "var(--radius-xs)",
                                    overflow: "hidden",
                                    flexShrink: 0,
                                    backgroundColor: "var(--color-layer-3)",
                                }}
                            >
                                <img
                                    src={page.imageUrl}
                                    alt={`Página ${i + 1}`}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            </div>
                            <span style={{ color: "var(--color-text-2)", fontVariantNumeric: "tabular-nums" }}>
                                Pág. {i + 1}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* ── CONTENT ───────────────────────────────────────────────────────── */}
            <div style={{ paddingTop: "56px", paddingBottom: "80px" }}>
                {mode === "scroll" ? (
                    <div
                        style={{
                            maxWidth: "720px",
                            margin: "0 auto",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        {pages.map((page, i) => (
                            <div key={page.id} id={`page-${i}`} style={{ width: "100%", lineHeight: 0 }}>
                                <img
                                    src={page.imageUrl}
                                    alt={`Página ${page.order}`}
                                    style={{ width: "100%", height: "auto", display: "block" }}
                                    loading={i < 3 ? "eager" : "lazy"}
                                />
                            </div>
                        ))}

                        {authorNote && (
                            <div
                                style={{
                                    margin: "2rem 1rem",
                                    padding: "1.25rem",
                                    borderRadius: "var(--radius-xl)",
                                    border: "1px solid var(--color-layer-3)",
                                    backgroundColor: "var(--color-layer-2)",
                                }}
                            >
                                <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-3)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                    Nota
                                </p>
                                <p style={{ fontSize: "0.875rem", color: "var(--color-text-2)", lineHeight: 1.7 }}>
                                    {authorNote}
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 1rem" }}>
                        {pages[currentPage] && (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                                <img
                                    src={pages[currentPage].imageUrl}
                                    alt={`Página ${currentPage + 1}`}
                                    style={{ width: "100%", height: "auto", display: "block", borderRadius: "var(--radius-md)" }}
                                />
                                {currentPage === pages.length - 1 && authorNote && (
                                    <div
                                        style={{
                                            width: "100%",
                                            padding: "1.25rem",
                                            borderRadius: "var(--radius-xl)",
                                            border: "1px solid var(--color-layer-3)",
                                            backgroundColor: "var(--color-layer-2)",
                                        }}
                                    >
                                        <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-3)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                            Nota
                                        </p>
                                        <p style={{ fontSize: "0.875rem", color: "var(--color-text-2)", lineHeight: 1.7 }}>
                                            {authorNote}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div
                            style={{
                                position: "fixed",
                                top: "56px",
                                left: 0,
                                bottom: "80px",
                                width: "35%",
                                cursor: currentPage > 0 ? "w-resize" : "default",
                                zIndex: 10,
                            }}
                            onClick={goPrevPage}
                        />
                        <div
                            style={{
                                position: "fixed",
                                top: "56px",
                                right: 0,
                                bottom: "80px",
                                width: "35%",
                                cursor: currentPage < pages.length - 1 ? "e-resize" : "default",
                                zIndex: 10,
                            }}
                            onClick={goNextPage}
                        />
                    </div>
                )}
            </div>

            {/* ── BOTTOM BAR ────────────────────────────────────────────────────── */}
            <footer
                style={{
                    ...barBase,
                    bottom: 0,
                    transform: barsVisible ? "translateY(0)" : "translateY(100%)",
                    borderTop: "1px solid var(--color-layer-3)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0.75rem",
                        maxWidth: "720px",
                        margin: "0 auto",
                        padding: "0.75rem 1rem",
                    }}
                >
                    {prevChapter ? (
                        <Link
                            href={`/series/${seriesSlug}/chapter/${prevChapter.number}`}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "0.5rem 0.875rem",
                                borderRadius: "var(--radius-md)",
                                border: "1px solid var(--color-layer-3)",
                                backgroundColor: "var(--color-layer-2)",
                                color: "var(--color-text-2)",
                                fontSize: "0.8125rem",
                                fontWeight: 500,
                                textDecoration: "none",
                                flexShrink: 0,
                            }}
                        >
                            <CaretLeft size={13} weight="bold" />
                            Cap. {prevChapter.number}
                        </Link>
                    ) : (
                        <div style={{ flex: "0 0 auto", width: "80px" }} />
                    )}

                    <div style={{ flex: 1, textAlign: "center" }}>
                        {mode === "paginated" ? (
                            <span style={{ fontSize: "0.8125rem", color: "var(--color-text-3)", fontVariantNumeric: "tabular-nums" }}>
                                {currentPage + 1} / {pages.length}
                            </span>
                        ) : (
                            <span style={{ fontSize: "0.8125rem", color: "var(--color-text-3)", fontVariantNumeric: "tabular-nums" }}>
                                {progressPct}%
                            </span>
                        )}
                    </div>

                    {nextChapter ? (
                        <Link
                            href={`/series/${seriesSlug}/chapter/${nextChapter.number}`}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "0.5rem 0.875rem",
                                borderRadius: "var(--radius-md)",
                                border: "1px solid var(--color-layer-3)",
                                backgroundColor: "var(--color-layer-2)",
                                color: "var(--color-text-2)",
                                fontSize: "0.8125rem",
                                fontWeight: 500,
                                textDecoration: "none",
                                flexShrink: 0,
                            }}
                        >
                            Cap. {nextChapter.number}
                            <CaretRight size={13} weight="bold" />
                        </Link>
                    ) : (
                        <Link
                            href={`/series/${seriesSlug}`}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "0.5rem 0.875rem",
                                borderRadius: "var(--radius-md)",
                                border: "1px solid var(--color-layer-3)",
                                backgroundColor: "var(--color-layer-2)",
                                color: "var(--color-text-2)",
                                fontSize: "0.8125rem",
                                fontWeight: 500,
                                textDecoration: "none",
                                flexShrink: 0,
                            }}
                        >
                            <Books size={13} weight="bold" />
                            Ver serie
                        </Link>
                    )}
                </div>
            </footer>
        </div>
    );
}