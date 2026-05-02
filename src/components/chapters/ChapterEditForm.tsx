"use client";

// src/components/chapters/ChapterEditForm.tsx

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    X,
    CircleNotch,
    ArrowLeft,
    Warning,
    CheckCircle,
    Images,
    DotsSixVertical,
    Plus,
    ArrowUp,
    ArrowDown,
} from "@phosphor-icons/react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExistingPage {
    id: string;
    order: number;
    imageUrl: string;
    imageKey: string;
    fileSize: number | null;
}

interface ChapterData {
    id: string;
    number: number;
    title: string | null;
    authorNote: string | null;
    isPublished: boolean;
    seriesId: string;
    seriesTitle: string;
    pages: ExistingPage[];
}

interface ChapterEditFormProps {
    chapter: ChapterData;
}

interface PageItem {
    localId: string;
    existingId?: string;
    imageUrl: string;
    imageKey: string;
    fileSize: number | null;
    file?: File;
    preview: string;
    order: number;
    status: "idle" | "uploading" | "done" | "error";
    progress: number;
    errorMsg?: string;
    isNew: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractPageNumber(filename: string): number {
    const name = filename.replace(/\.[^.]+$/, "");
    const match = name.match(/(\d+)/g);
    if (!match) return 9999;
    return parseInt(match[match.length - 1], 10);
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

// ─── Convertir imagen a WebP 800px ───────────────────────────────────────────

async function convertToWebP(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);

            const MAX_WIDTH = 800;
            const scale = img.naturalWidth > MAX_WIDTH ? MAX_WIDTH / img.naturalWidth : 1;
            const width = Math.round(img.naturalWidth * scale);
            const height = Math.round(img.naturalHeight * scale);

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            if (!ctx) return reject(new Error("Canvas no disponible"));

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (!blob) return reject(new Error(`No se pudo convertir: ${file.name}`));
                    const baseName = file.name.replace(/\.[^.]+$/, "");
                    resolve(new File([blob], `${baseName}.webp`, { type: "image/webp" }));
                },
                "image/webp",
                0.88
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error(`No se pudo leer: ${file.name}`));
        };

        img.src = objectUrl;
    });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ChapterEditForm({ chapter }: ChapterEditFormProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    const dragCounter = useRef(0);

    // ── Form state
    const [number, setNumber] = useState(String(chapter.number));
    const [title, setTitle] = useState(chapter.title ?? "");
    const [authorNote, setAuthorNote] = useState(chapter.authorNote ?? "");
    const [isPublished, setIsPublished] = useState(chapter.isPublished);

    // ── Pages state
    const [pages, setPages] = useState<PageItem[]>(
        chapter.pages
            .sort((a, b) => a.order - b.order)
            .map((p) => ({
                localId: p.id,
                existingId: p.id,
                imageUrl: p.imageUrl,
                imageKey: p.imageKey,
                fileSize: p.fileSize,
                preview: p.imageUrl,
                order: p.order,
                status: "idle",
                progress: 0,
                isNew: false,
            }))
    );

    const [deletedIds, setDeletedIds] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isConverting, setIsConverting] = useState(false);

    // ── Submit state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadStep, setUploadStep] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // ─── Mover página con flechas ────────────────────────────────────────────────
    const movePage = (index: number, direction: "up" | "down") => {
        setPages((prev) => {
            const updated = [...prev];
            const targetIndex = direction === "up" ? index - 1 : index + 1;
            if (targetIndex < 0 || targetIndex >= updated.length) return prev;
            [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
            return updated.map((p, i) => ({ ...p, order: i + 1 }));
        });
    };

    // ─── Add new files ──────────────────────────────────────────────────────────
    const addFiles = useCallback(async (incoming: File[]) => {
        const valid = incoming.filter((f) => f.type.match(/^image\/(jpeg|jpg|png|webp)$/));
        if (valid.length === 0) return;

        const sorted = [...valid].sort((a, b) => extractPageNumber(a.name) - extractPageNumber(b.name));

        setIsConverting(true);
        let converted: File[];
        try {
            converted = await Promise.all(sorted.map(convertToWebP));
        } catch (err: any) {
            setError(err.message || "Error al procesar imágenes");
            setIsConverting(false);
            return;
        }
        setIsConverting(false);

        setPages((prev) => {
            const existingNames = new Set(prev.filter((p) => p.isNew).map((p) => p.file!.name));
            const newItems: PageItem[] = converted
                .filter((f) => !existingNames.has(f.name))
                .map((file, i) => ({
                    localId: `new-${file.name}-${Date.now()}-${i}`,
                    imageUrl: "",
                    imageKey: "",
                    fileSize: file.size,
                    file,
                    preview: URL.createObjectURL(file),
                    order: prev.length + i + 1,
                    status: "idle" as const,
                    progress: 0,
                    isNew: true,
                }));

            const merged = [...prev, ...newItems];
            return merged.map((p, i) => ({ ...p, order: i + 1 }));
        });
    }, []);

    // ─── Remove page ────────────────────────────────────────────────────────────
    const removePage = (localId: string) => {
        setPages((prev) => {
            const page = prev.find((p) => p.localId === localId);
            if (page?.existingId) {
                setDeletedIds((ids) => [...ids, page.existingId!]);
            }
            const filtered = prev.filter((p) => p.localId !== localId);
            return filtered.map((p, i) => ({ ...p, order: i + 1 }));
        });
    };

    // ─── Drag reorder ────────────────────────────────────────────────────────────
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

    // ─── Zone drag & drop ────────────────────────────────────────────────────────
    const onZoneDragOver = (e: React.DragEvent) => e.preventDefault();
    const onZoneDragEnter = (e: React.DragEvent) => { e.preventDefault(); dragCounter.current++; setIsDragging(true); };
    const onZoneDragLeave = () => { dragCounter.current--; if (dragCounter.current === 0) setIsDragging(false); };
    const onZoneDrop = (e: React.DragEvent) => {
        e.preventDefault(); dragCounter.current = 0; setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length) addFiles(files);
    };

    // ─── Upload single page ──────────────────────────────────────────────────────
    const uploadPage = async (
        page: PageItem,
        presigned: { uploadUrl: string; key: string; publicUrl: string }
    ): Promise<{ imageUrl: string; imageKey: string }> => {
        await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.upload.addEventListener("progress", (e) => {
                if (e.lengthComputable) {
                    const pct = Math.round((e.loaded / e.total) * 100);
                    setPages((prev) => prev.map((p) =>
                        p.localId === page.localId ? { ...p, progress: pct, status: "uploading" } : p
                    ));
                }
            });
            xhr.addEventListener("load", () =>
                xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`R2 error ${xhr.status}`))
            );
            xhr.addEventListener("error", () => reject(new Error("Error de red")));
            xhr.open("PUT", presigned.uploadUrl);
            xhr.setRequestHeader("Content-Type", "image/webp");
            xhr.send(page.file!);
        });
        return { imageUrl: presigned.publicUrl, imageKey: presigned.key };
    };

    // ─── Submit ─────────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!number || isNaN(parseFloat(number))) { setError("Número de capítulo inválido"); return; }
        if (pages.length === 0) { setError("Se requiere al menos una página"); return; }

        setIsSubmitting(true);
        setUploadProgress(0);

        try {
            const newPages = pages.filter((p) => p.isNew);
            let uploadedMap = new Map<string, { imageUrl: string; imageKey: string }>();

            if (newPages.length > 0) {
                setUploadStep(`Preparando ${newPages.length} página(s) nueva(s)...`);

                const presignRes = await fetch("/api/upload/chapters/pages", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        pages: newPages.map((p) => ({
                            fileName: p.file!.name,
                            fileSize: p.file!.size,
                            mimeType: "image/webp",
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
                setUploadStep("Subiendo páginas nuevas...");

                const doneCount = { v: 0 };
                const tasks = newPages.map((page) => async () => {
                    const presigned = presignedMap.get(page.file!.name)!;
                    const result = await uploadPage(page, presigned);
                    doneCount.v++;
                    setUploadProgress(Math.round((doneCount.v / newPages.length) * 60));
                    setPages((prev) => prev.map((p) =>
                        p.localId === page.localId
                            ? { ...p, status: "done", progress: 100, imageUrl: result.imageUrl, imageKey: result.imageKey }
                            : p
                    ));
                    return { localId: page.localId, ...result };
                });

                const uploaded = await pLimit(tasks, 3);
                uploadedMap = new Map(uploaded.map((u) => [u.localId, { imageUrl: u.imageUrl, imageKey: u.imageKey }]));
            }

            setUploadStep("Guardando cambios...");
            setUploadProgress(70);

            const currentPages = await new Promise<PageItem[]>((resolve) => {
                setPages((prev) => { resolve(prev); return prev; });
            });

            const pagesPayload = currentPages.map((p) => ({
                id: p.existingId,
                order: p.order,
                imageUrl: p.isNew ? (uploadedMap.get(p.localId)?.imageUrl ?? p.imageUrl) : p.imageUrl,
                imageKey: p.isNew ? (uploadedMap.get(p.localId)?.imageKey ?? p.imageKey) : p.imageKey,
                fileSize: p.fileSize,
            }));

            const res = await fetch(`/api/chapters/${chapter.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    number: parseFloat(number),
                    title: title.trim() || null,
                    authorNote: authorNote.trim() || null,
                    isPublished,
                    pages: pagesPayload,
                    deletedPageIds: deletedIds,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Error guardando cambios");
            }

            const { chapter: updated } = await res.json();

            setUploadProgress(100);
            setSuccess(true);
            setDeletedIds([]);

            setPages(
                updated.pages.map((p: any) => ({
                    localId: p.id,
                    existingId: p.id,
                    imageUrl: p.imageUrl,
                    imageKey: p.imageKey,
                    fileSize: p.fileSize,
                    preview: p.imageUrl,
                    order: p.order,
                    status: "idle" as const,
                    progress: 0,
                    isNew: false,
                }))
            );

            router.refresh();
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || "Error al guardar");
        } finally {
            setIsSubmitting(false);
            setUploadProgress(0);
            setUploadStep("");
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

    const isBusy = isSubmitting || isConverting;
    const newCount = pages.filter((p) => p.isNew).length;
    const doneCount = pages.filter((p) => p.status === "done").length;
    const submitDisabled = isBusy || pages.length === 0;

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

            {/* ── Número y título ──────────────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label style={labelStyle}>
                        Número <span style={{ color: "var(--color-error)" }}>*</span>
                    </label>
                    <input
                        type="number" step="0.5" min="0.5"
                        value={number} onChange={(e) => setNumber(e.target.value)}
                        disabled={isBusy} style={inputStyle}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-text-3)")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-layer-4)")}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label style={labelStyle}>
                        Título <span style={{ color: "var(--color-text-3)", fontWeight: 400 }}>(opcional)</span>
                    </label>
                    <input
                        type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ej: El comienzo" maxLength={120}
                        disabled={isBusy} style={inputStyle}
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
                    value={authorNote} onChange={(e) => setAuthorNote(e.target.value)}
                    rows={3} maxLength={500} disabled={isBusy}
                    style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65 }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-text-3)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-layer-4)")}
                />
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-3)", textAlign: "right" }}>
                    {authorNote.length} / 500
                </span>
            </div>

            {/* ── Páginas ───────────────────────────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>
                        Páginas <span style={{ color: "var(--color-error)" }}>*</span>
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        {newCount > 0 && (
                            <span style={{ fontSize: "0.75rem", color: "#22c55e" }}>
                                +{newCount} nueva{newCount !== 1 ? "s" : ""}
                            </span>
                        )}
                        {deletedIds.length > 0 && (
                            <span style={{ fontSize: "0.75rem", color: "var(--color-error)" }}>
                                -{deletedIds.length} eliminada{deletedIds.length !== 1 ? "s" : ""}
                            </span>
                        )}
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-3)" }}>
                            {pages.length} total
                        </span>
                    </div>
                </div>

                {/* Drop zone */}
                <div
                    onDragOver={onZoneDragOver}
                    onDragEnter={onZoneDragEnter}
                    onDragLeave={onZoneDragLeave}
                    onDrop={onZoneDrop}
                    onClick={() => !isBusy && fileInputRef.current?.click()}
                    style={{
                        cursor: isBusy ? "default" : "pointer",
                        borderRadius: "var(--radius-lg)",
                        border: `1.5px dashed ${isDragging ? "var(--color-text-2)" : "var(--color-layer-4)"}`,
                        backgroundColor: isDragging
                            ? "color-mix(in srgb, var(--color-text-1) 4%, transparent)"
                            : "var(--color-layer-2)",
                        padding: "1.25rem 2rem",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem",
                        transition: "border-color 0.15s, background-color 0.15s",
                    }}
                >
                    {isConverting ? (
                        <>
                            <CircleNotch size={18} weight="bold" style={{ color: "var(--color-text-3)", animation: "spin 0.8s linear infinite" }} />
                            <div>
                                <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-2)" }}>
                                    Procesando imágenes...
                                </p>
                                <p style={{ fontSize: "0.75rem", color: "var(--color-text-3)" }}>
                                    Convirtiendo a WebP · 800px
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <Plus size={18} weight="thin" style={{ color: "var(--color-text-3)" }} />
                            <div>
                                <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-2)" }}>
                                    Agregar más páginas
                                </p>
                                <p style={{ fontSize: "0.75rem", color: "var(--color-text-3)" }}>
                                    JPG, PNG, WEBP · se convierten a WebP 800px
                                </p>
                            </div>
                        </>
                    )}
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
                                key={page.localId}
                                draggable={!isBusy}
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
                                    cursor: isBusy ? "default" : "grab",
                                    border: page.isNew
                                        ? "2px solid #22c55e"
                                        : "1px solid var(--color-layer-4)",
                                }}
                            >
                                <img
                                    src={page.preview}
                                    alt={`Página ${page.order}`}
                                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                />

                                {/* Upload overlay */}
                                {page.status === "uploading" && (
                                    <div style={{
                                        position: "absolute", inset: 0,
                                        backgroundColor: "rgba(0,0,0,0.5)",
                                        display: "flex", flexDirection: "column",
                                        alignItems: "center", justifyContent: "center", gap: "0.25rem",
                                    }}>
                                        <CircleNotch size={18} weight="bold" style={{ color: "#fff", animation: "spin 0.8s linear infinite" }} />
                                        <span style={{ fontSize: "0.6875rem", color: "#fff", fontVariantNumeric: "tabular-nums" }}>{page.progress}%</span>
                                    </div>
                                )}

                                {/* New badge */}
                                {page.isNew && page.status === "idle" && (
                                    <div style={{
                                        position: "absolute", top: "0.25rem", left: "0.25rem",
                                        borderRadius: "var(--radius-xs)",
                                        backgroundColor: "#22c55e",
                                        padding: "0.1rem 0.35rem",
                                        fontSize: "0.625rem", fontWeight: 700, color: "#fff",
                                    }}>
                                        NEW
                                    </div>
                                )}

                                {/* Número de orden */}
                                <div style={{
                                    position: "absolute", bottom: "0.25rem", left: "0.25rem",
                                    borderRadius: "var(--radius-xs)",
                                    backgroundColor: "rgba(0,0,0,0.6)",
                                    padding: "0.125rem 0.375rem",
                                    fontSize: "0.6875rem", fontWeight: 600, color: "#fff",
                                    fontVariantNumeric: "tabular-nums",
                                }}>
                                    {page.order}
                                </div>

                                {/* Controles: flechas + eliminar */}
                                {!isBusy && (
                                    <div style={{
                                        position: "absolute", top: "0.25rem", right: "0.25rem",
                                        display: "flex", flexDirection: "column", gap: "0.2rem",
                                    }}>
                                        {/* Eliminar */}
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); removePage(page.localId); }}
                                            title="Eliminar"
                                            style={{
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                width: "1.25rem", height: "1.25rem",
                                                borderRadius: "var(--radius-xs)", border: "none",
                                                backgroundColor: "rgba(0,0,0,0.65)",
                                                color: "#fff", cursor: "pointer", padding: 0,
                                            }}
                                        >
                                            <X size={10} weight="bold" />
                                        </button>

                                        {/* Subir */}
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); movePage(index, "up"); }}
                                            disabled={index === 0}
                                            title="Mover arriba"
                                            style={{
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                width: "1.25rem", height: "1.25rem",
                                                borderRadius: "var(--radius-xs)", border: "none",
                                                backgroundColor: "rgba(0,0,0,0.65)",
                                                color: index === 0 ? "rgba(255,255,255,0.25)" : "#fff",
                                                cursor: index === 0 ? "default" : "pointer",
                                                padding: 0,
                                            }}
                                        >
                                            <ArrowUp size={10} weight="bold" />
                                        </button>

                                        {/* Bajar */}
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); movePage(index, "down"); }}
                                            disabled={index === pages.length - 1}
                                            title="Mover abajo"
                                            style={{
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                width: "1.25rem", height: "1.25rem",
                                                borderRadius: "var(--radius-xs)", border: "none",
                                                backgroundColor: "rgba(0,0,0,0.65)",
                                                color: index === pages.length - 1 ? "rgba(255,255,255,0.25)" : "#fff",
                                                cursor: index === pages.length - 1 ? "default" : "pointer",
                                                padding: 0,
                                            }}
                                        >
                                            <ArrowDown size={10} weight="bold" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Hint de reorden */}
                {pages.length > 1 && !isBusy && (
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-3)", textAlign: "center" }}>
                        Usa las flechas ↑↓ en cada imagen o arrastra para reordenar
                    </p>
                )}

                {/* Progress bar de subida */}
                {isSubmitting && newCount > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--color-text-3)" }}>{uploadStep}</span>
                            <span style={{ fontSize: "0.75rem", color: "var(--color-text-2)", fontVariantNumeric: "tabular-nums" }}>
                                {doneCount} / {newCount}
                            </span>
                        </div>
                        <div style={{ height: "2px", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-layer-4)", overflow: "hidden" }}>
                            <div style={{
                                height: "100%", width: `${uploadProgress}%`,
                                borderRadius: "var(--radius-full)",
                                backgroundColor: "var(--color-text-1)",
                                transition: "width 0.3s ease",
                            }} />
                        </div>
                    </div>
                )}
            </div>

            {/* ── Publicar ──────────────────────────────────────────────────────── */}
            <label style={{
                display: "flex", alignItems: "flex-start", gap: "0.75rem",
                cursor: isBusy ? "default" : "pointer",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                border: `1px solid ${isPublished ? "var(--color-layer-4)" : "var(--color-layer-3)"}`,
                backgroundColor: isPublished ? "var(--color-layer-2)" : "transparent",
                transition: "all 0.15s",
            }}>
                <span
                    onClick={() => !isBusy && setIsPublished(!isPublished)}
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
                        Capítulo publicado
                    </p>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-3)", lineHeight: 1.5 }}>
                        {isPublished ? "Visible para los lectores" : "Guardado como borrador"}
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

            {/* ── Success ───────────────────────────────────────────────────────── */}
            {success && (
                <div style={{
                    borderRadius: "var(--radius-md)",
                    border: "1px solid color-mix(in srgb, #22c55e 25%, transparent)",
                    backgroundColor: "color-mix(in srgb, #22c55e 8%, transparent)",
                    padding: "0.75rem 1rem",
                    display: "flex", alignItems: "center", gap: "0.625rem",
                }}>
                    <CheckCircle size={16} weight="fill" style={{ color: "#22c55e", flexShrink: 0 }} />
                    <p style={{ fontSize: "0.8125rem", color: "#22c55e" }}>Cambios guardados correctamente</p>
                </div>
            )}

            {/* ── Actions ───────────────────────────────────────────────────────── */}
            <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
                <button
                    type="button" onClick={() => router.back()} disabled={isBusy}
                    style={{
                        display: "flex", alignItems: "center", gap: "0.5rem",
                        padding: "0.75rem 1.25rem",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--color-layer-4)",
                        backgroundColor: "transparent",
                        color: "var(--color-text-2)",
                        fontSize: "0.875rem", fontWeight: 500,
                        cursor: isBusy ? "not-allowed" : "pointer",
                        opacity: isBusy ? 0.5 : 1,
                        fontFamily: "var(--font-sans)",
                    }}
                    onMouseEnter={(e) => { if (!isBusy) { (e.currentTarget as HTMLElement).style.borderColor = "var(--color-text-3)"; (e.currentTarget as HTMLElement).style.color = "var(--color-text-1)"; } }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--color-layer-4)"; (e.currentTarget as HTMLElement).style.color = "var(--color-text-2)"; }}
                >
                    <ArrowLeft size={15} weight="bold" />
                    Cancelar
                </button>

                <button
                    type="submit" disabled={submitDisabled}
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
                        fontFamily: "var(--font-sans)",
                    }}
                >
                    {isConverting ? (
                        <><CircleNotch size={16} weight="bold" style={{ animation: "spin 0.8s linear infinite" }} /> Procesando imágenes...</>
                    ) : isSubmitting ? (
                        <><CircleNotch size={16} weight="bold" style={{ animation: "spin 0.8s linear infinite" }} /> {uploadStep || "Guardando..."}</>
                    ) : (
                        "Guardar cambios"
                    )}
                </button>
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </form>
    );
}