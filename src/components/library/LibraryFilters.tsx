"use client";

// src/components/library/LibraryFilters.tsx

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useRef, useEffect } from "react";
import {
    MagnifyingGlass,
    X,
    SortAscending,
} from "@phosphor-icons/react";

type Genre = { id: string; name: string; slug: string; color: string | null };

type Filters = {
    q: string;
    genre: string;
    format: string;
    status: string;
    ageRating: string;
    sort: string;
};

const FORMATS = [
    { value: "webtoon", label: "Webtoon" },
    { value: "manga", label: "Manga" },
    { value: "manhwa", label: "Manhwa" },
    { value: "comic", label: "Cómic" },
    { value: "novel", label: "Novela" },
];

const STATUSES = [
    { value: "ongoing", label: "En curso" },
    { value: "completed", label: "Completada" },
    { value: "hiatus", label: "En pausa" },
    { value: "canceled", label: "Cancelada" },
];

const AGE_RATINGS = [
    { value: "all", label: "Para todos" },
    { value: "teen", label: "Teen+" },
    { value: "mature", label: "Maduro" },
];

const SORTS = [
    { value: "popular", label: "Más populares" },
    { value: "recent", label: "Más recientes" },
    { value: "updated", label: "Actualizadas" },
    { value: "most_chapters", label: "Más capítulos" },
];

const STATUS_DOT: Record<string, string> = {
    ongoing: "#22c55e",
    completed: "#3b82f6",
    hiatus: "#f59e0b",
    canceled: "#ef4444",
};

interface LibraryFiltersProps {
    genres: Genre[];
    currentFilters: Filters;
}

export function LibraryFilters({ genres, currentFilters }: LibraryFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const searchRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Helpers ──────────────────────────────────────────────────────────────
    const pushFilter = useCallback(
        (updates: Partial<Filters & { page?: string }>) => {
            const params = new URLSearchParams(searchParams.toString());

            // Reset page on filter change (unless explicitly setting page)
            if (!("page" in updates)) params.delete("page");

            for (const [key, val] of Object.entries(updates)) {
                if (val) {
                    params.set(key, val);
                } else {
                    params.delete(key);
                }
            }

            startTransition(() => {
                router.push(`${pathname}?${params.toString()}`);
            });
        },
        [router, pathname, searchParams]
    );

    const toggleFilter = useCallback(
        (key: keyof Filters, value: string) => {
            const current = currentFilters[key];
            pushFilter({ [key]: current === value ? "" : value });
        },
        [currentFilters, pushFilter]
    );

    // ── Search con debounce ───────────────────────────────────────────────────
    useEffect(() => {
        if (searchRef.current && searchRef.current.value !== currentFilters.q) {
            searchRef.current.value = currentFilters.q;
        }
    }, [currentFilters.q]);

    function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            pushFilter({ q: e.target.value });
        }, 400);
    }

    // ── Active filters count ──────────────────────────────────────────────────
    const activeCount = [
        currentFilters.genre,
        currentFilters.format,
        currentFilters.status,
        currentFilters.ageRating,
        currentFilters.q,
    ].filter(Boolean).length;

    function clearAll() {
        startTransition(() => {
            router.push(pathname);
        });
        if (searchRef.current) searchRef.current.value = "";
    }

    // ── Chip helper ───────────────────────────────────────────────────────────
    function Chip({
        active,
        onClick,
        children,
        accentColor,
    }: {
        active: boolean;
        onClick: () => void;
        children: React.ReactNode;
        accentColor?: string;
    }) {
        return (
            <button
                type="button"
                onClick={onClick}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150"
                style={{
                    backgroundColor: active
                        ? accentColor
                            ? `color-mix(in srgb, ${accentColor} 18%, transparent)`
                            : "var(--color-layer-4)"
                        : "var(--color-layer-2)",
                    color: active
                        ? accentColor ?? "var(--color-text-1)"
                        : "var(--color-text-3)",
                    border: active
                        ? `1px solid color-mix(in srgb, ${accentColor ?? "var(--color-text-1)"} 35%, transparent)`
                        : "1px solid var(--color-layer-3)",
                    transform: active ? "scale(1.02)" : "scale(1)",
                }}
            >
                {children}
            </button>
        );
    }

    return (
        <div
            className="mb-8 space-y-4"
            style={{ opacity: isPending ? 0.6 : 1, transition: "opacity 0.15s" }}
        >
            {/* ── Search bar ─────────────────────────────────────────────────── */}
            <div className="relative">
                <MagnifyingGlass
                    size={16}
                    weight="bold"
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "var(--color-text-3)" }}
                />
                <input
                    ref={searchRef}
                    type="search"
                    defaultValue={currentFilters.q}
                    onChange={handleSearchChange}
                    placeholder="Buscar series..."
                    className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-all"
                    style={{
                        backgroundColor: "var(--color-layer-2)",
                        border: "1px solid var(--color-layer-3)",
                        color: "var(--color-text-1)",
                    }}
                />
            </div>

            {/* ── Filters row ────────────────────────────────────────────────── */}
            <div className="flex flex-wrap gap-x-6 gap-y-3">

                {/* Sort */}
                <div className="flex items-center gap-2">
                    <SortAscending size={14} style={{ color: "var(--color-text-3)", flexShrink: 0 }} />
                    <div className="flex flex-wrap gap-1.5">
                        {SORTS.map((s) => (
                            <Chip
                                key={s.value}
                                active={currentFilters.sort === s.value || (!currentFilters.sort && s.value === "popular")}
                                onClick={() => pushFilter({ sort: s.value })}
                            >
                                {s.label}
                            </Chip>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Second row: genre + format + status + age ──────────────────── */}
            <div className="flex flex-col gap-3">

                {/* Géneros */}
                {genres.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {genres.map((g) => (
                            <Chip
                                key={g.id}
                                active={currentFilters.genre === g.slug}
                                onClick={() => toggleFilter("genre", g.slug)}
                                accentColor={g.color ?? undefined}
                            >
                                {g.name}
                            </Chip>
                        ))}
                    </div>
                )}

                {/* Formato + Estado + Age Rating en la misma fila */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">

                    {/* Separador visual */}
                    <div className="flex flex-wrap gap-1.5">
                        {FORMATS.map((f) => (
                            <Chip
                                key={f.value}
                                active={currentFilters.format === f.value}
                                onClick={() => toggleFilter("format", f.value)}
                            >
                                {f.label}
                            </Chip>
                        ))}
                    </div>

                    <div
                        className="h-5 w-px hidden sm:block"
                        style={{ backgroundColor: "var(--color-layer-3)" }}
                    />

                    <div className="flex flex-wrap gap-1.5">
                        {STATUSES.map((s) => (
                            <Chip
                                key={s.value}
                                active={currentFilters.status === s.value}
                                onClick={() => toggleFilter("status", s.value)}
                                accentColor={STATUS_DOT[s.value]}
                            >
                                {currentFilters.status === s.value && (
                                    <span
                                        className="h-1.5 w-1.5 rounded-full"
                                        style={{ backgroundColor: STATUS_DOT[s.value] }}
                                    />
                                )}
                                {s.label}
                            </Chip>
                        ))}
                    </div>

                    <div
                        className="h-5 w-px hidden sm:block"
                        style={{ backgroundColor: "var(--color-layer-3)" }}
                    />

                    <div className="flex flex-wrap gap-1.5">
                        {AGE_RATINGS.map((a) => (
                            <Chip
                                key={a.value}
                                active={currentFilters.ageRating === a.value}
                                onClick={() => toggleFilter("ageRating", a.value)}
                            >
                                {a.label}
                            </Chip>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Clear filters ──────────────────────────────────────────────── */}
            {activeCount > 0 && (
                <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: "var(--color-text-3)" }}>
                        {activeCount} filtro{activeCount !== 1 ? "s" : ""} activo{activeCount !== 1 ? "s" : ""}
                    </span>
                    <button
                        type="button"
                        onClick={clearAll}
                        className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
                        style={{ color: "var(--color-text-2)" }}
                    >
                        <X size={11} weight="bold" />
                        Limpiar
                    </button>
                </div>
            )}
        </div>
    );
}