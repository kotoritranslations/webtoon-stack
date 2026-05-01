"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Upload,
    X,
    CircleNotch,
    ArrowLeft,
    ArrowRight,
    Warning,
    Images,
    DotsSixVertical,
    CheckCircle,
    CaretDown,
    Plus,
} from "@phosphor-icons/react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Series {
    id: string;
    title: string;
    slug: string;
    coverUrl: string | null;
    chaptersCount: number;
}

interface ChapterCreateFormProps {
    series: Series[];
    defaultSeriesId?: string;
}

interface PageFile {
    id: string;
    file: File;
    preview: string;
    order: number;
    status: "pending" | "uploading" | "done" | "error";
    progress: number;
    imageUrl?: string;
    imageKey?: string;
    errorMsg?: string;
}

interface CreatedChapter {
    number: number;
    seriesSlug: string;
    isPublished: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractPageNumber(filename: string): number {
    const name = filename.replace(/\.[^.]+$/, "");
    const match = name.match(/(\d+)/g);
    if (!match) return 9999;
    return parseInt(match[match.length - 1], 10);
}

function sortByFilename(files: File[]): File[] {
    return [...files].sort((a, b) => {
        const na = extractPageNumber(a.name);
        const nb = extractPageNumber(b.name);
        return na - nb;
    });
}

async function pLimit<T>(
    tasks: (() => Promise<T>)[],
    concurrency: number,
    onEach?: (index: number, result: T) => void
): Promise<T[]> {
    const results: T[] = new Array(tasks.length);
    let index = 0;

    async function worker() {
        while (index < tasks.length) {
            const i = index++;
            results[i] = await tasks[i]();
            onEach?.(i, results[i]);
        }
    }

    await Promise.all(Array.from({ length: concurrency }, worker));
    return results;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ChapterCreateForm({ series, defaultSeriesId }: ChapterCreateFormProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragCounter = useRef(0);

    // ── Form state
    const [selectedSeriesId, setSelectedSeriesId] = useState(defaultSeriesId ?? series[0]?.id ?? "");
    const [chapterNumber, setChapterNumber] = useState("");
    const [chapterTitle, setChapterTitle] = useState("");
    const [authorNote, setAuthorNote] = useState("");
    const [isPublished, setIsPublished] = useState(true);

    // ── Pages state
    const [pages, setPages] = useState<PageFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    // ── Upload / result state
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [createdChapter, setCreatedChapter] = useState<CreatedChapter | null>(null);

    // ── Drag reorder
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    // ─── Add files ──────────────────────────────────────────────────────────────
    const addFiles = useCallback((incoming: File[]) => {
        const valid = incoming.filter((f) =>
            f.type.match(/^image\/(jpeg|jpg|png|webp)$/)
        );
        if (valid.length !== incoming.length) {
            setError(`${incoming.length - valid.length} archivo(s) ignorados — solo JPG, PNG o WEBP`);
        }
        const sorted = sortByFilename(valid);
        setPages((prev) => {
            const existing = new Set(prev.map((p) => p.file.name));
            const newPages: PageFile[] = sorted
                .filter((f) => !existing.has(f.name))
                .map((file, i) => ({
                    id: `${file.name}-${Date.now()}-${i}`,
                    file,
                    preview: URL.createObjectURL(file),
                    order: prev.length + i + 1,
                    status: "pending",
                    progress: 0,
                }));
            const merged = [...prev, ...newPages];
            return merged.map((p, i) => ({ ...p, order: i + 1 }));
        });
    }, []);

    // ─── Remove page ────────────────────────────────────────────────────────────
    const removePage = (id: string) => {
        setPages((prev) => {
            const filtered = prev.filter((p) => p.id !== id);
            return filtered.map((p, i) => ({ ...p, order: i + 1 }));
        });
    };

    // ─── Drag reorder ───────────────────────────────────────────────────────────
    const onDragStart = (index: number) => { dragItem.current = index; };
    const onDragEnter = (index: number) => { dragOverItem.current = index; };
    const onDragEnd = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        if (dragItem.current === dragOverItem.current) return;
        setPages((prev) => {
            const updated = [...prev];
            const [moved] = updated.splice(dragItem.current!, 1);
            updated.splice(dragOverItem.current!, 0, moved);
            return updated.map((p, i) => ({ ...p, order: i + 1 }));
        });
        dragItem.current = null;
        dragOverItem.current = null;
    };

    // ─── Zone drag & drop ───────────────────────────────────────────────────────
    const onZoneDragOver = (e: React.DragEvent) => { e.preventDefault(); };
    const onZoneDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        dragCounter.current++;
        setIsDragging(true);
    };
    const onZoneDragLeave = () => {
        dragCounter.current--;
        if (dragCounter.current === 0) setIsDragging(false);
    };
    const onZoneDrop = (e: React.DragEvent) => {
        e.preventDefault();
        dragCounter.current = 0;
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length) addFiles(files);
    };

    // ─── Upload single page ─────────────────────────────────────────────────────
    const uploadPage = async (
        page: PageFile,
        presigned: { uploadUrl: string; key: string; publicUrl: string }
    ): Promise<{ imageUrl: string; imageKey: string }> => {
        await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.upload.addEventListener("progress", (e) => {
                if (e.lengthComputable) {
                    const pct = Math.round((e.loaded / e.total) * 100);
                    setPages((prev) =>
                        prev.map((p) => p.id === page.id ? { ...p, progress: pct, status: "uploading" } : p)
                    );
                }
            });
            xhr.addEventListener("load", () => {
                if (xhr.status >= 200 && xhr.status < 300) resolve();
                else reject(new Error(`R2 error ${xhr.status}`));
            });
            xhr.addEventListener("error", () => reject(new Error("Error de red")));
            xhr.addEventListener("abort", () => reject(new Error("Cancelado")));
            xhr.open("PUT", presigned.uploadUrl);
            xhr.setRequestHeader("Content-Type", page.file.type);
            xhr.send(page.file);
        });
        return { imageUrl: presigned.publicUrl, imageKey: presigned.key };
    };

    // ─── Reset form ─────────────────────────────────────────────────────────────
    const resetForm = () => {
        setCreatedChapter(null);
        setPages([]);
        setChapterNumber("");
        setChapterTitle("");
        setAuthorNote("");
        setIsPublished(true);
        setError(null);
    };

    // ─── Submit ─────────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!selectedSeriesId) { setError("Selecciona una serie"); return; }
        if (!chapterNumber || isNaN(parseFloat(chapterNumber))) { setError("El número de capítulo es requerido"); return; }
        if (pages.length === 0) { setError("Agrega al menos una página"); return; }

        setIsUploading(true);

        try {
            // 1. Presigned URLs
            const presignRes = await fetch("/api/upload/chapters/pages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pages: pages.map((p) => ({
                        fileName: p.file.name,
                        fileSize: p.file.size,
                        mimeType: p.file.type,
                    })),
                }),
            });

            if (!presignRes.ok) {
                const data = await presignRes.json();
                throw new Error(data.error || "Error obteniendo URLs de subida");
            }

            const { pages: presignedPages } = await presignRes.json() as {
                pages: { uploadUrl: string; key: string; publicUrl: string; fileName: string }[];
            };

            const presignedMap = new Map(presignedPages.map((p) => [p.fileName, p]));

            // 2. Subir páginas (concurrencia 3)
            const uploadTasks = pages.map((page) => async () => {
                const presigned = presignedMap.get(page.file.name);
                if (!presigned) throw new Error(`No se encontró URL para ${page.file.name}`);
                try {
                    const result = await uploadPage(page, presigned);
                    setPages((prev) =>
                        prev.map((p) => p.id === page.id ? { ...p, status: "done", progress: 100, ...result } : p)
                    );
                    return { page, ...result };
                } catch (err: any) {
                    setPages((prev) =>
                        prev.map((p) => p.id === page.id ? { ...p, status: "error", errorMsg: err.message } : p)
                    );
                    throw err;
                }
            });

            await pLimit(uploadTasks, 3);

            const failed = pages.filter((p) => p.status === "error");
            if (failed.length > 0) throw new Error(`${failed.length} página(s) fallaron al subir`);

            // 3. Crear capítulo en DB
            const currentPages = await new Promise<PageFile[]>((resolve) => {
                setPages((prev) => { resolve(prev); return prev; });
            });

            const createRes = await fetch("/api/chapters", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    seriesId: selectedSeriesId,
                    number: parseFloat(chapterNumber),
                    title: chapterTitle.trim() || null,
                    authorNote: authorNote.trim() || null,
                    isPublished,
                    pages: currentPages.map((p) => ({
                        order: p.order,
                        imageUrl: p.imageUrl!,
                        imageKey: p.imageKey!,
                        fileSize: p.file.size,
                    })),
                }),
            });

            if (!createRes.ok) {
                const data = await createRes.json();
                throw new Error(data.error || "Error creando el capítulo");
            }

            const { chapter } = await createRes.json();
            const selectedSeries = series.find((s) => s.id === selectedSeriesId)!;

            setCreatedChapter({
                number: chapter.number,
                seriesSlug: selectedSeries.slug,
                isPublished,
            });
            setIsUploading(false);

        } catch (err: any) {
            setError(err.message || "Error al crear el capítulo");
            setIsUploading(false);
        }
    };

    // ── Styles
    const inputStyle: React.CSSProperties = {
        width: "100%",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-layer-4)",
        backgroundColor: "var(--color-layer-2)",
        padding: "0.75rem 1rem",
        color: "var(--color-text-1)",
        fontSize: "0.875rem",
        outline: "none",
        transition: "border-color 0.15s",
        fontFamily: "var(--font-sans)",
    };

    const labelStyle: React.CSSProperties = {
        fontSize: "0.8125rem",
        fontWeight: 500,
        color: "var(--color-text-2)",
        marginBottom: "0.5rem",
        display: "block",
    };

    const doneCount = pages.filter((p) => p.status === "done").length;
    const submitDisabled = isUploading || !selectedSeriesId || !chapterNumber || pages.length === 0;

    // ─── Success screen ──────────────────────────────────────────────────────────
    if (createdChapter) {
        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "1.5rem",
                    padding: "3rem 1rem",
                    textAlign: "center",
                }}
            >
                <div
                    style={{
                        width: "3.5rem",
                        height: "3.5rem",
                        borderRadius: "var(--radius-full)",
                        backgroundColor: "color-mix(in srgb, var(--color-text-1) 8%, transparent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <CheckCircle size={30} weight="fill" style={{ color: "var(--color-text-1)" }} />
                </div>

                <div>
                    <h2
                        style={{
                            fontSize: "1.125rem",
                            fontWeight: 600,
                            color: "var(--color-text-1)",
                            marginBottom: "0.375rem",
                        }}
                    >
                        Capítulo {createdChapter.number} creado
                    </h2>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-3)" }}>
                        {createdChapter.isPublished
                            ? "Ya está visible para los lectores."
                            : "Guardado como borrador — puedes publicarlo cuando quieras."}
                    </p>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center", width: "100%", maxWidth: "360px" }}>
                    <a
                        href={`/series/${createdChapter.seriesSlug}/chapter/${createdChapter.number}`}
                        style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                            padding: "0.75rem 1.25rem",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--color-layer-4)",
                            backgroundColor: "var(--color-layer-2)",
                            color: "var(--color-text-2)",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            textDecoration: "none",
                        }}
                    >
                        <ArrowRight size={15} weight="bold" />
                        Ver capítulo
                    </a>

                    <button
                        type="button"
                        onClick={resetForm}
                        style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                            padding: "0.75rem 1.5rem",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid transparent",
                            backgroundColor: "var(--color-text-1)",
                            color: "var(--color-layer-1)",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            cursor: "pointer",
                            fontFamily: "var(--font-sans)",
                        }}
                    >
                        <Plus size={15} weight="bold" />
                        Agregar otro
                    </button>
                </div>
            </div >
        );
    }

    // ─── Form ────────────────────────────────────────────────────────────────────
    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

            {/* ── Seleccionar serie ──────────────────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={labelStyle}>
                    Serie <span style={{ color: "var(--color-error)" }}>*</span>
                </label>
                {series.length === 0 ? (
                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-3)" }}>
                        No tienes series. <a href="/dashboard/series/new" style={{ color: "var(--color-text-2)", textDecoration: "underline" }}>Crea una primero</a>.
                    </p>
                ) : (
                    <div style={{ position: "relative" }}>
                        <select
                            value={selectedSeriesId}
                            onChange={(e) => setSelectedSeriesId(e.target.value)}
                            disabled={isUploading}
                            style={{ ...inputStyle, appearance: "none", paddingRight: "2.5rem", cursor: "pointer" }}
                            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-text-3)")}
                            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-layer-4)")}
                        >
                            {series.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.title} — {s.chaptersCount} cap{s.chaptersCount !== 1 ? "ítulos" : "ítulo"}
                                </option>
                            ))}
                        </select>
                        <CaretDown
                            size={14}
                            weight="bold"
                            style={{
                                position: "absolute", right: "1rem", top: "50%",
                                transform: "translateY(-50%)",
                                color: "var(--color-text-3)", pointerEvents: "none",
                            }}
                        />
                    </div>
                )}
            </div>

            {/* ── Número y título ────────────────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label style={labelStyle}>
                        Número <span style={{ color: "var(--color-error)" }}>*</span>
                    </label>
                    <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        value={chapterNumber}
                        onChange={(e) => setChapterNumber(e.target.value)}
                        placeholder="1"
                        disabled={isUploading}
                        style={inputStyle}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-text-3)")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-layer-4)")}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label style={labelStyle}>
                        Título <span style={{ color: "var(--color-text-3)", fontWeight: 400 }}>(opcional)</span>
                    </label>
                    <input
                        type="text"
                        value={chapterTitle}
                        onChange={(e) => setChapterTitle(e.target.value)}
                        placeholder="Ej: El comienzo"
                        maxLength={120}
                        disabled={isUploading}
                        style={inputStyle}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-text-3)")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-layer-4)")}
                    />
                </div>
            </div>

            {/* ── Nota del autor ────────────────────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={labelStyle}>
                    Nota <span style={{ color: "var(--color-text-3)", fontWeight: 400 }}>(opcional)</span>
                </label>
                <textarea
                    value={authorNote}
                    onChange={(e) => setAuthorNote(e.target.value)}
                    placeholder="Algo que quieras decirle a tus lectores..."
                    rows={3}
                    maxLength={500}
                    disabled={isUploading}
                    style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65 }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-text-3)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-layer-4)")}
                />
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-3)", textAlign: "right" }}>
                    {authorNote.length} / 500
                </span>
            </div>

            {/* ── Drop zone ─────────────────────────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>
                        Páginas <span style={{ color: "var(--color-error)" }}>*</span>
                    </label>
                    {pages.length > 0 && (
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-3)" }}>
                            {pages.length} página{pages.length !== 1 ? "s" : ""} · arrastra para reordenar
                        </span>
                    )}
                </div>

                <div
                    onDragOver={onZoneDragOver}
                    onDragEnter={onZoneDragEnter}
                    onDragLeave={onZoneDragLeave}
                    onDrop={onZoneDrop}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    style={{
                        cursor: isUploading ? "default" : "pointer",
                        borderRadius: "var(--radius-lg)",
                        border: `1.5px dashed ${isDragging ? "var(--color-text-2)" : "var(--color-layer-4)"}`,
                        backgroundColor: isDragging
                            ? "color-mix(in srgb, var(--color-text-1) 4%, transparent)"
                            : "var(--color-layer-2)",
                        padding: "2rem",
                        textAlign: "center",
                        transition: "border-color 0.15s, background-color 0.15s",
                    }}
                >
                    <Images size={32} weight="thin" style={{ margin: "0 auto 0.75rem", color: "var(--color-text-3)" }} />
                    <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
                        {pages.length === 0 ? "Arrastra tus páginas aquí o haz clic" : "Agregar más páginas"}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-3)" }}>
                        JPG, PNG, WEBP · se ordenan automáticamente por nombre
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        multiple
                        style={{ display: "none" }}
                        onChange={(e) => {
                            const files = Array.from(e.target.files ?? []);
                            if (files.length) addFiles(files);
                            e.target.value = "";
                        }}
                    />
                </div>

                {/* Grid de páginas */}
                {pages.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: "0.5rem" }}>
                        {pages.map((page, index) => (
                            <div
                                key={page.id}
                                draggable={!isUploading}
                                onDragStart={() => onDragStart(index)}
                                onDragEnter={() => onDragEnter(index)}
                                onDragEnd={onDragEnd}
                                onDragOver={(e) => e.preventDefault()}
                                style={{
                                    position: "relative",
                                    aspectRatio: "2/3",
                                    borderRadius: "var(--radius-md)",
                                    overflow: "hidden",
                                    backgroundColor: "var(--color-layer-3)",
                                    cursor: isUploading ? "default" : "grab",
                                    border: page.status === "error"
                                        ? "1px solid var(--color-error)"
                                        : "1px solid var(--color-layer-4)",
                                }}
                            >
                                <img
                                    src={page.preview}
                                    alt={`Página ${page.order}`}
                                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                />

                                {(page.status === "uploading" || page.status === "pending") && isUploading && (
                                    <div style={{
                                        position: "absolute", inset: 0,
                                        backgroundColor: "rgba(0,0,0,0.5)",
                                        display: "flex", flexDirection: "column",
                                        alignItems: "center", justifyContent: "center", gap: "0.375rem",
                                    }}>
                                        {page.status === "uploading" ? (
                                            <>
                                                <CircleNotch size={18} weight="bold" style={{ color: "#fff", animation: "spin 0.8s linear infinite" }} />
                                                <span style={{ fontSize: "0.6875rem", color: "#fff", fontVariantNumeric: "tabular-nums" }}>
                                                    {page.progress}%
                                                </span>
                                            </>
                                        ) : (
                                            <CircleNotch size={18} weight="bold" style={{ color: "rgba(255,255,255,0.4)" }} />
                                        )}
                                    </div>
                                )}

                                {page.status === "done" && (
                                    <div style={{
                                        position: "absolute", inset: 0,
                                        backgroundColor: "rgba(0,0,0,0.3)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        <CheckCircle size={20} weight="fill" style={{ color: "#4ade80" }} />
                                    </div>
                                )}

                                {page.status === "error" && (
                                    <div style={{
                                        position: "absolute", inset: 0,
                                        backgroundColor: "rgba(0,0,0,0.5)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        <Warning size={20} weight="fill" style={{ color: "var(--color-error)" }} />
                                    </div>
                                )}

                                <div style={{
                                    position: "absolute", bottom: "0.25rem", left: "0.25rem",
                                    borderRadius: "var(--radius-xs)",
                                    backgroundColor: "rgba(0,0,0,0.6)",
                                    padding: "0.125rem 0.375rem",
                                    fontSize: "0.6875rem",
                                    fontWeight: 600,
                                    color: "#fff",
                                    fontVariantNumeric: "tabular-nums",
                                }}>
                                    {page.order}
                                </div>

                                {!isUploading && (
                                    <div style={{ position: "absolute", top: "0.25rem", left: "0.25rem", color: "rgba(255,255,255,0.7)" }}>
                                        <DotsSixVertical size={14} weight="bold" />
                                    </div>
                                )}

                                {!isUploading && (
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); removePage(page.id); }}
                                        style={{
                                            position: "absolute", top: "0.25rem", right: "0.25rem",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            width: "1.25rem", height: "1.25rem",
                                            borderRadius: "var(--radius-xs)",
                                            border: "none",
                                            backgroundColor: "rgba(0,0,0,0.6)",
                                            color: "#fff",
                                            cursor: "pointer",
                                            padding: 0,
                                        }}
                                    >
                                        <X size={10} weight="bold" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Progress general */}
                {isUploading && pages.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--color-text-3)" }}>Subiendo páginas...</span>
                            <span style={{ fontSize: "0.75rem", color: "var(--color-text-2)", fontVariantNumeric: "tabular-nums" }}>
                                {doneCount} / {pages.length}
                            </span>
                        </div>
                        <div style={{ height: "2px", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-layer-4)", overflow: "hidden" }}>
                            <div style={{
                                height: "100%",
                                width: `${Math.round((doneCount / pages.length) * 100)}%`,
                                borderRadius: "var(--radius-full)",
                                backgroundColor: "var(--color-text-1)",
                                transition: "width 0.3s ease",
                            }} />
                        </div>
                    </div>
                )}
            </div>

            {/* ── Publicar ──────────────────────────────────────────────────────── */}
            <label
                style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    cursor: isUploading ? "default" : "pointer",
                    padding: "1rem",
                    borderRadius: "var(--radius-md)",
                    border: `1px solid ${isPublished ? "var(--color-layer-4)" : "var(--color-layer-3)"}`,
                    backgroundColor: isPublished ? "var(--color-layer-2)" : "transparent",
                    transition: "all 0.15s",
                }}
            >
                <span
                    onClick={() => !isUploading && setIsPublished(!isPublished)}
                    style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        height: "1rem", width: "1rem", marginTop: "0.1rem", flexShrink: 0,
                        borderRadius: "var(--radius-xs)",
                        border: `1.5px solid ${isPublished ? "var(--color-text-1)" : "var(--color-layer-4)"}`,
                        backgroundColor: isPublished ? "var(--color-text-1)" : "transparent",
                        transition: "all 0.15s",
                    }}
                >
                    {isPublished && (
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                            <path d="M1 3.5L3.5 6L8 1" stroke="var(--color-layer-1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </span>
                <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} style={{ display: "none" }} />
                <div>
                    <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-text-1)", marginBottom: "0.25rem" }}>
                        Publicar capítulo
                    </p>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-3)", lineHeight: 1.5 }}>
                        {isPublished
                            ? "El capítulo será visible para los lectores inmediatamente"
                            : "Se guardará como borrador — lo puedes publicar después"}
                    </p>
                </div>
            </label>

            {/* ── Error ─────────────────────────────────────────────────────────── */}
            {error && (
                <div style={{
                    borderRadius: "var(--radius-md)",
                    border: "1px solid color-mix(in srgb, var(--color-error) 25%, transparent)",
                    backgroundColor: "color-mix(in srgb, var(--color-error) 8%, transparent)",
                    padding: "0.75rem 1rem",
                    display: "flex", alignItems: "center", gap: "0.625rem",
                }}>
                    <Warning size={16} weight="bold" style={{ color: "var(--color-error)", flexShrink: 0 }} />
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-error)" }}>{error}</p>
                </div>
            )}

            {/* ── Actions ───────────────────────────────────────────────────────── */}
            <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
                <button
                    type="button"
                    onClick={() => router.back()}
                    disabled={isUploading}
                    style={{
                        display: "flex", alignItems: "center", gap: "0.5rem",
                        padding: "0.75rem 1.25rem",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--color-layer-4)",
                        backgroundColor: "transparent",
                        color: "var(--color-text-2)",
                        fontSize: "0.875rem", fontWeight: 500,
                        cursor: isUploading ? "not-allowed" : "pointer",
                        opacity: isUploading ? 0.5 : 1,
                        transition: "all 0.15s",
                        fontFamily: "var(--font-sans)",
                    }}
                    onMouseEnter={(e) => { if (!isUploading) { (e.currentTarget as HTMLElement).style.borderColor = "var(--color-text-3)"; (e.currentTarget as HTMLElement).style.color = "var(--color-text-1)"; } }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--color-layer-4)"; (e.currentTarget as HTMLElement).style.color = "var(--color-text-2)"; }}
                >
                    <ArrowLeft size={15} weight="bold" />
                    Cancelar
                </button>

                <button
                    type="submit"
                    disabled={submitDisabled}
                    style={{
                        flex: 1,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                        padding: "0.75rem 1.5rem",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid transparent",
                        backgroundColor: "var(--color-text-1)",
                        color: "var(--color-layer-1)",
                        fontSize: "0.875rem", fontWeight: 500,
                        cursor: submitDisabled ? "not-allowed" : "pointer",
                        opacity: submitDisabled ? 0.4 : 1,
                        transition: "opacity 0.15s",
                        fontFamily: "var(--font-sans)",
                    }}
                >
                    {isUploading ? (
                        <>
                            <CircleNotch size={16} weight="bold" style={{ animation: "spin 0.8s linear infinite" }} />
                            Subiendo {doneCount}/{pages.length}...
                        </>
                    ) : (
                        <>
                            <Upload size={16} weight="bold" />
                            Crear capítulo {pages.length > 0 ? `· ${pages.length} páginas` : ""}
                        </>
                    )}
                </button>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </form>
    );
}