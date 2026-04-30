"use client";

// src/components/chapters/ChaptersList.tsx

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Eye,
    EyeSlash,
    PencilSimple,
    Trash,
    CircleNotch,
    Warning,
    X,
    CheckCircle,
    CaretDown,
    CaretUp,
    BookBookmark,
    ArrowsDownUp,
    Plus,
} from "@phosphor-icons/react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SeriesOption {
    id: string;
    title: string;
}

interface ChapterItem {
    id: string;
    number: number;
    title: string | null;
    slug: string;
    isPublished: boolean;
    publishedAt: string | null;
    viewsCount: number;
    likesCount: number;
    seriesId: string;
    seriesTitle: string;
    seriesSlug: string;
}

interface ChaptersListProps {
    initialChapters: ChapterItem[];
    series: SeriesOption[];
}

type SortKey = "number" | "publishedAt" | "viewsCount";
type SortDir = "asc" | "desc";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCount(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
}

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `hace ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `hace ${days}d`;
    return `hace ${Math.floor(days / 30)} mes`;
}

// ─── Delete modal ─────────────────────────────────────────────────────────────

function DeleteModal({
    number,
    onConfirm,
    onCancel,
    loading,
}: {
    number: number;
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}) {
    return (
        <div
            style={{
                position: "fixed", inset: 0, zIndex: 100,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "1rem",
                backgroundColor: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(4px)",
            }}
            onClick={onCancel}
        >
            <div
                style={{
                    width: "100%", maxWidth: "400px",
                    borderRadius: "var(--radius-xl)",
                    border: "1px solid var(--color-layer-3)",
                    backgroundColor: "var(--color-layer-1)",
                    padding: "1.5rem",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                        <Warning size={20} weight="fill" style={{ color: "var(--color-error)", flexShrink: 0 }} />
                        <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-text-1)" }}>
                            Eliminar capítulo
                        </h3>
                    </div>
                    <button type="button" onClick={onCancel}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-3)", padding: "0.25rem" }}>
                        <X size={16} weight="bold" />
                    </button>
                </div>

                <p style={{ fontSize: "0.875rem", color: "var(--color-text-2)", lineHeight: 1.6, marginBottom: "0.5rem" }}>
                    ¿Eliminar el <strong style={{ color: "var(--color-text-1)" }}>Capítulo {number}</strong>?
                </p>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-3)", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                    Se eliminarán todas las páginas e imágenes. No se puede deshacer.
                </p>

                <div style={{ display: "flex", gap: "0.625rem" }}>
                    <button type="button" onClick={onCancel} disabled={loading}
                        style={{
                            flex: 1, padding: "0.625rem",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--color-layer-4)",
                            backgroundColor: "transparent",
                            color: "var(--color-text-2)",
                            fontSize: "0.875rem", fontWeight: 500,
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.5 : 1,
                            fontFamily: "var(--font-sans)",
                        }}>
                        Cancelar
                    </button>
                    <button type="button" onClick={onConfirm} disabled={loading}
                        style={{
                            flex: 1, padding: "0.625rem",
                            borderRadius: "var(--radius-md)",
                            border: "none",
                            backgroundColor: "var(--color-error)",
                            color: "#fff",
                            fontSize: "0.875rem", fontWeight: 500,
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.7 : 1,
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                            fontFamily: "var(--font-sans)",
                        }}>
                        {loading
                            ? <><CircleNotch size={14} weight="bold" style={{ animation: "spin 0.8s linear infinite" }} /> Eliminando...</>
                            : "Sí, eliminar"
                        }
                    </button>
                </div>
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

// ─── Chapter row ──────────────────────────────────────────────────────────────

function ChapterRow({
    chapter,
    onTogglePublish,
    onDeleteRequest,
    loadingId,
}: {
    chapter: ChapterItem;
    onTogglePublish: (id: string, current: boolean) => void;
    onDeleteRequest: (chapter: ChapterItem) => void;
    loadingId: string | null;
}) {
    const isLoading = loadingId === chapter.id;

    const actionBtn: React.CSSProperties = {
        display: "flex", alignItems: "center", justifyContent: "center",
        width: "2rem", height: "2rem",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-layer-4)",
        backgroundColor: "transparent",
        color: "var(--color-text-2)",
        cursor: isLoading ? "not-allowed" : "pointer",
        opacity: isLoading ? 0.5 : 1,
        transition: "all 0.15s",
        fontFamily: "var(--font-sans)",
    };

    return (
        <div
            style={{
                display: "flex", alignItems: "center", gap: "1rem",
                padding: "0.75rem 1rem",
                borderBottom: "1px solid var(--color-layer-3)",
                backgroundColor: "var(--color-layer-2)",
                transition: "background-color 0.1s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-layer-3)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-layer-2)")}
        >
            {/* Número */}
            <span
                style={{
                    fontSize: "0.75rem", fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                    color: "var(--color-text-3)",
                    flexShrink: 0, minWidth: "2.5rem",
                }}
            >
                {chapter.number}
            </span>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span
                        style={{
                            fontSize: "0.875rem", fontWeight: 500,
                            color: "var(--color-text-1)",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}
                    >
                        {chapter.title ?? `Capítulo ${chapter.number}`}
                    </span>
                    <span
                        style={{
                            fontSize: "0.6875rem", fontWeight: 500,
                            padding: "0.15rem 0.5rem",
                            borderRadius: "var(--radius-full)",
                            flexShrink: 0,
                            backgroundColor: chapter.isPublished
                                ? "color-mix(in srgb, #22c55e 12%, transparent)"
                                : "var(--color-layer-4)",
                            color: chapter.isPublished ? "#22c55e" : "var(--color-text-3)",
                        }}
                    >
                        {chapter.isPublished ? "Publicado" : "Borrador"}
                    </span>
                </div>

                <div
                    style={{
                        display: "flex", alignItems: "center", gap: "0.625rem",
                        marginTop: "0.25rem",
                        fontSize: "0.75rem", color: "var(--color-text-3)",
                    }}
                >
                    <Link
                        href={`/series/${chapter.seriesSlug}`}
                        style={{ color: "var(--color-text-3)", textDecoration: "none", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text-2)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-3)")}
                    >
                        {chapter.seriesTitle}
                    </Link>
                    <span>·</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Eye size={11} /> {formatCount(chapter.viewsCount)}
                    </span>
                    {chapter.publishedAt && (
                        <>
                            <span>·</span>
                            <span>{timeAgo(chapter.publishedAt)}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexShrink: 0 }}>
                {/* Editar */}
                <Link
                    href={`/dashboard/chapters/${chapter.id}/edit`}
                    title="Editar capítulo"
                    style={{ ...actionBtn, textDecoration: "none" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-layer-4)"; (e.currentTarget as HTMLElement).style.color = "var(--color-text-1)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--color-text-2)"; }}
                >
                    <PencilSimple size={14} weight="bold" />
                </Link>

                {/* Publicar/despublicar */}
                <button
                    type="button"
                    title={chapter.isPublished ? "Despublicar" : "Publicar"}
                    onClick={() => onTogglePublish(chapter.id, chapter.isPublished)}
                    disabled={isLoading}
                    style={{
                        ...actionBtn,
                        color: chapter.isPublished ? "#22c55e" : "var(--color-text-2)",
                    }}
                    onMouseEnter={(e) => { if (!isLoading) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-layer-4)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                >
                    {isLoading
                        ? <CircleNotch size={14} weight="bold" style={{ animation: "spin 0.8s linear infinite" }} />
                        : chapter.isPublished
                            ? <Eye size={14} weight="bold" />
                            : <EyeSlash size={14} weight="bold" />
                    }
                </button>

                {/* Eliminar */}
                <button
                    type="button"
                    title="Eliminar capítulo"
                    onClick={() => onDeleteRequest(chapter)}
                    disabled={isLoading}
                    style={{ ...actionBtn, color: "var(--color-text-3)" }}
                    onMouseEnter={(e) => {
                        if (!isLoading) {
                            (e.currentTarget as HTMLElement).style.backgroundColor = "color-mix(in srgb, var(--color-error) 10%, transparent)";
                            (e.currentTarget as HTMLElement).style.borderColor = "color-mix(in srgb, var(--color-error) 30%, transparent)";
                            (e.currentTarget as HTMLElement).style.color = "var(--color-error)";
                        }
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                        (e.currentTarget as HTMLElement).style.borderColor = "var(--color-layer-4)";
                        (e.currentTarget as HTMLElement).style.color = "var(--color-text-3)";
                    }}
                >
                    <Trash size={14} weight="bold" />
                </button>
            </div>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ChaptersList({ initialChapters, series }: ChaptersListProps) {
    const router = useRouter();

    const [chapters, setChapters] = useState<ChapterItem[]>(initialChapters);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ChapterItem | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

    // ── Filtros y orden
    const [filterSeriesId, setFilterSeriesId] = useState<string>("all");
    const [sortKey, setSortKey] = useState<SortKey>("number");
    const [sortDir, setSortDir] = useState<SortDir>("asc");

    const showToast = (msg: string, type: "success" | "error") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ── Filtrado + orden ─────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let list = filterSeriesId === "all"
            ? chapters
            : chapters.filter((c) => c.seriesId === filterSeriesId);

        list = [...list].sort((a, b) => {
            let va: number, vb: number;
            if (sortKey === "number") {
                va = a.number; vb = b.number;
            } else if (sortKey === "publishedAt") {
                va = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
                vb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
            } else {
                va = a.viewsCount; vb = b.viewsCount;
            }
            return sortDir === "asc" ? va - vb : vb - va;
        });

        return list;
    }, [chapters, filterSeriesId, sortKey, sortDir]);

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortDir("asc"); }
    };

    // ── Toggle publish ───────────────────────────────────────────────────────────
    const handleTogglePublish = async (id: string, current: boolean) => {
        setLoadingId(id);
        try {
            const res = await fetch(`/api/chapters/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isPublished: !current }),
            });
            if (!res.ok) throw new Error();
            setChapters((prev) => prev.map((c) => c.id === id ? { ...c, isPublished: !current } : c));
            showToast(current ? "Capítulo despublicado" : "Capítulo publicado", "success");
        } catch {
            showToast("Error al cambiar visibilidad", "error");
        } finally {
            setLoadingId(null);
        }
    };

    // ── Delete ───────────────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            const res = await fetch(`/api/chapters/${deleteTarget.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            setChapters((prev) => prev.filter((c) => c.id !== deleteTarget.id));
            showToast("Capítulo eliminado", "success");
            router.refresh();
        } catch {
            showToast("Error al eliminar", "error");
        } finally {
            setDeleteLoading(false);
            setDeleteTarget(null);
        }
    };

    // ── Sort button helper ───────────────────────────────────────────────────────
    const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
        <button
            type="button"
            onClick={() => toggleSort(k)}
            style={{
                display: "flex", alignItems: "center", gap: "0.25rem",
                padding: "0.25rem 0.625rem",
                borderRadius: "var(--radius-md)",
                border: `1px solid ${sortKey === k ? "var(--color-layer-4)" : "transparent"}`,
                backgroundColor: sortKey === k ? "var(--color-layer-3)" : "transparent",
                color: sortKey === k ? "var(--color-text-1)" : "var(--color-text-3)",
                fontSize: "0.75rem", fontWeight: 500,
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
            }}
        >
            {label}
            {sortKey === k
                ? sortDir === "asc"
                    ? <CaretUp size={11} weight="bold" />
                    : <CaretDown size={11} weight="bold" />
                : <ArrowsDownUp size={11} />
            }
        </button>
    );

    if (chapters.length === 0) {
        return (
            <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                padding: "4rem 1rem",
                borderRadius: "var(--radius-xl)",
                border: "1px dashed var(--color-layer-4)",
                textAlign: "center",
            }}>
                <BookBookmark size={32} weight="thin" style={{ color: "var(--color-text-3)", marginBottom: "1rem" }} />
                <p style={{ fontSize: "0.9375rem", fontWeight: 500, color: "var(--color-text-2)", marginBottom: "0.375rem" }}>
                    Aún no tienes capítulos
                </p>
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-3)", marginBottom: "1.5rem" }}>
                    Crea tu primer capítulo para empezar a publicar
                </p>
                <Link
                    href="/dashboard/chapters/new"
                    style={{
                        display: "flex", alignItems: "center", gap: "0.5rem",
                        padding: "0.625rem 1.25rem",
                        borderRadius: "var(--radius-md)",
                        backgroundColor: "var(--color-text-1)",
                        color: "var(--color-layer-1)",
                        fontSize: "0.875rem", fontWeight: 500,
                        textDecoration: "none",
                    }}
                >
                    <Plus size={15} weight="bold" />
                    Nuevo capítulo
                </Link>
            </div>
        );
    }

    return (
        <>
            {/* ── Toolbar ──────────────────────────────────────────────────────── */}
            <div
                style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    flexWrap: "wrap", gap: "0.75rem",
                    marginBottom: "0.75rem",
                }}
            >
                {/* Filtro por serie */}
                <div style={{ position: "relative" }}>
                    <select
                        value={filterSeriesId}
                        onChange={(e) => setFilterSeriesId(e.target.value)}
                        style={{
                            appearance: "none",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--color-layer-4)",
                            backgroundColor: "var(--color-layer-2)",
                            padding: "0.375rem 2rem 0.375rem 0.75rem",
                            color: "var(--color-text-1)",
                            fontSize: "0.8125rem",
                            outline: "none",
                            cursor: "pointer",
                            fontFamily: "var(--font-sans)",
                        }}
                    >
                        <option value="all">Todas las series</option>
                        {series.map((s) => (
                            <option key={s.id} value={s.id}>{s.title}</option>
                        ))}
                    </select>
                    <CaretDown size={12} weight="bold" style={{ position: "absolute", right: "0.625rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-3)", pointerEvents: "none" }} />
                </div>

                {/* Sort buttons */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <SortBtn k="number" label="Número" />
                    <SortBtn k="publishedAt" label="Fecha" />
                    <SortBtn k="viewsCount" label="Vistas" />
                </div>
            </div>

            {/* ── Count ────────────────────────────────────────────────────────── */}
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-3)", marginBottom: "0.5rem" }}>
                {filtered.length} capítulo{filtered.length !== 1 ? "s" : ""}
                {filterSeriesId !== "all" && " en esta serie"}
            </p>

            {/* ── List ─────────────────────────────────────────────────────────── */}
            {filtered.length === 0 ? (
                <div style={{
                    padding: "2rem", textAlign: "center",
                    borderRadius: "var(--radius-xl)",
                    border: "1px dashed var(--color-layer-4)",
                }}>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-3)" }}>
                        No hay capítulos en esta serie
                    </p>
                </div>
            ) : (
                <div style={{ borderRadius: "var(--radius-xl)", border: "1px solid var(--color-layer-3)", overflow: "hidden" }}>
                    {filtered.map((chapter) => (
                        <ChapterRow
                            key={chapter.id}
                            chapter={chapter}
                            onTogglePublish={handleTogglePublish}
                            onDeleteRequest={setDeleteTarget}
                            loadingId={loadingId}
                        />
                    ))}
                </div>
            )}

            {/* Delete modal */}
            {deleteTarget && (
                <DeleteModal
                    number={deleteTarget.number}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                    loading={deleteLoading}
                />
            )}

            {/* Toast */}
            {toast && (
                <div style={{
                    position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)",
                    zIndex: 200,
                    display: "flex", alignItems: "center", gap: "0.5rem",
                    padding: "0.625rem 1rem",
                    borderRadius: "var(--radius-full)",
                    backgroundColor: toast.type === "success" ? "var(--color-layer-3)" : "color-mix(in srgb, var(--color-error) 15%, var(--color-layer-2))",
                    border: `1px solid ${toast.type === "success" ? "var(--color-layer-4)" : "color-mix(in srgb, var(--color-error) 30%, transparent)"}`,
                    color: toast.type === "success" ? "var(--color-text-1)" : "var(--color-error)",
                    fontSize: "0.875rem", fontWeight: 500,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
                    whiteSpace: "nowrap",
                }}>
                    {toast.type === "success"
                        ? <CheckCircle size={15} weight="fill" />
                        : <Warning size={15} weight="fill" />
                    }
                    {toast.msg}
                </div>
            )}

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </>
    );
}