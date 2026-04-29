"use client";

// src/components/series/SeriesList.tsx

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    BookOpen,
    Plus,
    Eye,
    EyeSlash,
    PencilSimple,
    Trash,
    BookBookmark,
    CircleNotch,
    Warning,
    X,
    CheckCircle,
} from "@phosphor-icons/react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SeriesItem {
    id: string;
    slug: string;
    title: string;
    coverUrl: string | null;
    status: string;
    format: string;
    isPublished: boolean;
    chaptersCount: number;
    viewsCount: number;
    likesCount: number;
    createdAt: string;
    updatedAt: string;
}

interface SeriesListProps {
    initialSeries: SeriesItem[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCount(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
}

const STATUS_LABELS: Record<string, string> = {
    ongoing: "En curso",
    completed: "Completada",
    hiatus: "En pausa",
    canceled: "Cancelada",
};

const FORMAT_LABELS: Record<string, string> = {
    webtoon: "Webtoon",
    manga: "Manga",
    manhwa: "Manhwa",
    comic: "Cómic",
    novel: "Novela",
};

// ─── Delete confirm modal ─────────────────────────────────────────────────────

function DeleteModal({
    title,
    onConfirm,
    onCancel,
    loading,
}: {
    title: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}) {
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem",
                backgroundColor: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(4px)",
            }}
            onClick={onCancel}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "400px",
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
                            Eliminar serie
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onCancel}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-3)", padding: "0.25rem" }}
                    >
                        <X size={16} weight="bold" />
                    </button>
                </div>

                <p style={{ fontSize: "0.875rem", color: "var(--color-text-2)", lineHeight: 1.6, marginBottom: "0.5rem" }}>
                    ¿Seguro que quieres eliminar{" "}
                    <strong style={{ color: "var(--color-text-1)" }}>{title}</strong>?
                </p>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-3)", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                    Se eliminarán todos los capítulos, páginas e imágenes. Esta acción no se puede deshacer.
                </p>

                <div style={{ display: "flex", gap: "0.625rem" }}>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: "0.625rem",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--color-layer-4)",
                            backgroundColor: "transparent",
                            color: "var(--color-text-2)",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.5 : 1,
                            fontFamily: "var(--font-sans)",
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: "0.625rem",
                            borderRadius: "var(--radius-md)",
                            border: "none",
                            backgroundColor: "var(--color-error)",
                            color: "#fff",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.7 : 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                            fontFamily: "var(--font-sans)",
                        }}
                    >
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

// ─── Series row ───────────────────────────────────────────────────────────────

function SeriesRow({
    series,
    onTogglePublish,
    onDeleteRequest,
    loadingId,
}: {
    series: SeriesItem;
    onTogglePublish: (id: string, current: boolean) => void;
    onDeleteRequest: (series: SeriesItem) => void;
    loadingId: string | null;
}) {
    const isLoading = loadingId === series.id;

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "0.875rem 1rem",
                borderBottom: "1px solid var(--color-layer-3)",
                backgroundColor: "var(--color-layer-2)",
                transition: "background-color 0.1s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-layer-3)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-layer-2)")}
        >
            {/* Cover */}
            <Link href={`/series/${series.slug}`}>
                <div
                    style={{
                        width: "40px",
                        height: "56px",
                        borderRadius: "var(--radius-sm)",
                        overflow: "hidden",
                        flexShrink: 0,
                        backgroundColor: "var(--color-layer-4)",
                    }}
                >
                    {series.coverUrl ? (
                        <Image
                            src={series.coverUrl}
                            alt={series.title}
                            width={40}
                            height={56}
                            style={{ objectFit: "cover", width: "100%", height: "100%" }}
                        />
                    ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                            <BookOpen size={14} style={{ color: "var(--color-text-3)" }} />
                        </div>
                    )}
                </div>
            </Link>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <Link
                        href={`/series/${series.slug}`}
                        style={{ textDecoration: "none" }}
                    >
                        <span
                            style={{
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                color: "var(--color-text-1)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                display: "block",
                                maxWidth: "200px",
                            }}
                        >
                            {series.title}
                        </span>
                    </Link>

                    {/* Published badge */}
                    <span
                        style={{
                            fontSize: "0.6875rem",
                            fontWeight: 500,
                            padding: "0.15rem 0.5rem",
                            borderRadius: "var(--radius-full)",
                            backgroundColor: series.isPublished
                                ? "color-mix(in srgb, #22c55e 12%, transparent)"
                                : "var(--color-layer-4)",
                            color: series.isPublished ? "#22c55e" : "var(--color-text-3)",
                        }}
                    >
                        {series.isPublished ? "Publicada" : "Borrador"}
                    </span>
                </div>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        marginTop: "0.3rem",
                        fontSize: "0.75rem",
                        color: "var(--color-text-3)",
                    }}
                >
                    <span>{FORMAT_LABELS[series.format] ?? series.format}</span>
                    <span>·</span>
                    <span>{STATUS_LABELS[series.status] ?? series.status}</span>
                    <span>·</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <BookBookmark size={11} />
                        {series.chaptersCount}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Eye size={11} />
                        {formatCount(series.viewsCount)}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexShrink: 0 }}>
                {/* Nuevo capítulo */}
                <Link
                    href={`/dashboard/chapters/new?seriesId=${series.id}`}
                    title="Nuevo capítulo"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "2rem",
                        height: "2rem",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--color-layer-4)",
                        backgroundColor: "transparent",
                        color: "var(--color-text-2)",
                        textDecoration: "none",
                        transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-layer-4)";
                        (e.currentTarget as HTMLElement).style.color = "var(--color-text-1)";
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "var(--color-text-2)";
                    }}
                >
                    <Plus size={14} weight="bold" />
                </Link>

                {/* Editar */}
                <Link
                    href={`/dashboard/series/${series.id}/edit`}
                    title="Editar serie"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "2rem",
                        height: "2rem",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--color-layer-4)",
                        backgroundColor: "transparent",
                        color: "var(--color-text-2)",
                        textDecoration: "none",
                        transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-layer-4)";
                        (e.currentTarget as HTMLElement).style.color = "var(--color-text-1)";
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "var(--color-text-2)";
                    }}
                >
                    <PencilSimple size={14} weight="bold" />
                </Link>

                {/* Publicar/despublicar */}
                <button
                    type="button"
                    title={series.isPublished ? "Despublicar" : "Publicar"}
                    onClick={() => onTogglePublish(series.id, series.isPublished)}
                    disabled={isLoading}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "2rem",
                        height: "2rem",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--color-layer-4)",
                        backgroundColor: "transparent",
                        color: series.isPublished ? "#22c55e" : "var(--color-text-2)",
                        cursor: isLoading ? "not-allowed" : "pointer",
                        opacity: isLoading ? 0.5 : 1,
                        transition: "all 0.15s",
                        fontFamily: "var(--font-sans)",
                    }}
                    onMouseEnter={(e) => {
                        if (!isLoading) {
                            (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-layer-4)";
                        }
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                    }}
                >
                    {isLoading
                        ? <CircleNotch size={14} weight="bold" style={{ animation: "spin 0.8s linear infinite" }} />
                        : series.isPublished
                            ? <Eye size={14} weight="bold" />
                            : <EyeSlash size={14} weight="bold" />
                    }
                </button>

                {/* Eliminar */}
                <button
                    type="button"
                    title="Eliminar serie"
                    onClick={() => onDeleteRequest(series)}
                    disabled={isLoading}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "2rem",
                        height: "2rem",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--color-layer-4)",
                        backgroundColor: "transparent",
                        color: "var(--color-text-3)",
                        cursor: isLoading ? "not-allowed" : "pointer",
                        opacity: isLoading ? 0.5 : 1,
                        transition: "all 0.15s",
                        fontFamily: "var(--font-sans)",
                    }}
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

export function SeriesList({ initialSeries }: SeriesListProps) {
    const router = useRouter();
    const [series, setSeries] = useState<SeriesItem[]>(initialSeries);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<SeriesItem | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

    const showToast = (msg: string, type: "success" | "error") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ── Toggle publish ───────────────────────────────────────────────────────────
    const handleTogglePublish = async (id: string, current: boolean) => {
        setLoadingId(id);
        try {
            const res = await fetch(`/api/series/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isPublished: !current }),
            });
            if (!res.ok) throw new Error();
            setSeries((prev) =>
                prev.map((s) => (s.id === id ? { ...s, isPublished: !current } : s))
            );
            showToast(current ? "Serie despublicada" : "Serie publicada", "success");
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
            const res = await fetch(`/api/series/${deleteTarget.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            setSeries((prev) => prev.filter((s) => s.id !== deleteTarget.id));
            showToast("Serie eliminada", "success");
            router.refresh();
        } catch {
            showToast("Error al eliminar", "error");
        } finally {
            setDeleteLoading(false);
            setDeleteTarget(null);
        }
    };

    if (series.length === 0) {
        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4rem 1rem",
                    borderRadius: "var(--radius-xl)",
                    border: "1px dashed var(--color-layer-4)",
                    textAlign: "center",
                }}
            >
                <BookOpen size={32} weight="thin" style={{ color: "var(--color-text-3)", marginBottom: "1rem" }} />
                <p style={{ fontSize: "0.9375rem", fontWeight: 500, color: "var(--color-text-2)", marginBottom: "0.375rem" }}>
                    Aún no tienes series
                </p>
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-3)", marginBottom: "1.5rem" }}>
                    Crea tu primera serie y empieza a publicar capítulos
                </p>
                <Link
                    href="/dashboard/series/new"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.625rem 1.25rem",
                        borderRadius: "var(--radius-md)",
                        backgroundColor: "var(--color-text-1)",
                        color: "var(--color-layer-1)",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        textDecoration: "none",
                    }}
                >
                    <Plus size={15} weight="bold" />
                    Nueva serie
                </Link>
            </div>
        );
    }

    return (
        <>
            <div
                style={{
                    borderRadius: "var(--radius-xl)",
                    border: "1px solid var(--color-layer-3)",
                    overflow: "hidden",
                }}
            >
                {series.map((s, index) => (
                    <SeriesRow
                        key={s.id}
                        series={s}
                        onTogglePublish={handleTogglePublish}
                        onDeleteRequest={setDeleteTarget}
                        loadingId={loadingId}
                    />
                ))}
            </div>

            {/* Delete modal */}
            {deleteTarget && (
                <DeleteModal
                    title={deleteTarget.title}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                    loading={deleteLoading}
                />
            )}

            {/* Toast */}
            {toast && (
                <div
                    style={{
                        position: "fixed",
                        bottom: "1.5rem",
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 200,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.625rem 1rem",
                        borderRadius: "var(--radius-full)",
                        backgroundColor: toast.type === "success" ? "var(--color-layer-3)" : "color-mix(in srgb, var(--color-error) 15%, var(--color-layer-2))",
                        border: `1px solid ${toast.type === "success" ? "var(--color-layer-4)" : "color-mix(in srgb, var(--color-error) 30%, transparent)"}`,
                        color: toast.type === "success" ? "var(--color-text-1)" : "var(--color-error)",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
                        whiteSpace: "nowrap",
                    }}
                >
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