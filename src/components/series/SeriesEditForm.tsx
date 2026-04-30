"use client";

// src/components/series/SeriesEditForm.tsx

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Upload,
    X,
    CircleNotch,
    Image as ImageIcon,
    ArrowLeft,
    Warning,
    CaretDown,
    CheckCircle,
} from "@phosphor-icons/react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Genre {
    id: string;
    name: string;
    slug: string;
    color?: string | null;
}

interface SeriesData {
    id: string;
    title: string;
    synopsis: string | null;
    coverUrl: string | null;
    coverKey: string | null;
    bannerUrl: string | null;
    bannerKey: string | null;
    status: string;
    ageRating: string;
    format: string;
    readingDir: string;
    isPublished: boolean;
    genres: { id: string; name: string; slug: string; color: string | null }[];
}

interface SeriesEditFormProps {
    series: SeriesData;
    allGenres: Genre[];
}

type SeriesStatus = "ongoing" | "completed" | "hiatus" | "canceled";
type AgeRating = "all" | "teen" | "mature";
type SeriesFormat = "webtoon" | "manga" | "manhwa" | "comic" | "novel";
type ReadingDir = "ltr" | "rtl";

interface PendingImage {
    file: File;
    preview: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
    { value: "ongoing", label: "En curso", description: "Se publican capítulos regularmente" },
    { value: "completed", label: "Completada", description: "Historia finalizada" },
    { value: "hiatus", label: "En pausa", description: "Pausada temporalmente" },
    { value: "canceled", label: "Cancelada", description: "No continuará" },
];

const AGE_OPTIONS = [
    { value: "all", label: "Para todos", description: "Apto para todas las edades" },
    { value: "teen", label: "Teen+", description: "Recomendado 13 años en adelante" },
    { value: "mature", label: "Maduro", description: "Solo para adultos" },
];

const FORMAT_OPTIONS = [
    { value: "webtoon", label: "Webtoon" },
    { value: "manga", label: "Manga" },
    { value: "manhwa", label: "Manhwa" },
    { value: "comic", label: "Cómic" },
    { value: "novel", label: "Novela" },
];

const DIR_OPTIONS = [
    { value: "ltr", label: "Izquierda → Derecha", description: "Webtoon, Manhwa, Cómic" },
    { value: "rtl", label: "Derecha → Izquierda", description: "Manga japonés" },
];

// ─── Upload helper ────────────────────────────────────────────────────────────

async function uploadViaPresignedUrl(
    file: File,
    endpoint: string,
    onProgress?: (pct: number) => void
): Promise<{ key: string; publicUrl: string }> {
    const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileSize: file.size, mimeType: file.type }),
    });

    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error obteniendo URL de subida");
    }

    const { uploadUrl, key, publicUrl } = await res.json();

    await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
        });
        xhr.addEventListener("load", () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`R2 error ${xhr.status}`)));
        xhr.addEventListener("error", () => reject(new Error("Error de red")));
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
    });

    return { key, publicUrl };
}

// ─── Select field ─────────────────────────────────────────────────────────────

function SelectField<T extends string>({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: T;
    onChange: (v: T) => void;
    options: { value: T; label: string; description?: string }[];
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-2)" }}>
                {label}
            </label>
            <div style={{ position: "relative" }}>
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value as T)}
                    style={{
                        width: "100%",
                        appearance: "none",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--color-layer-4)",
                        backgroundColor: "var(--color-layer-2)",
                        padding: "0.75rem 2.5rem 0.75rem 1rem",
                        color: "var(--color-text-1)",
                        fontSize: "0.875rem",
                        outline: "none",
                        cursor: "pointer",
                        fontFamily: "var(--font-sans)",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-text-3)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-layer-4)")}
                >
                    {options.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}{o.description ? ` — ${o.description}` : ""}
                        </option>
                    ))}
                </select>
                <CaretDown size={14} weight="bold" style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-3)", pointerEvents: "none" }} />
            </div>
        </div>
    );
}

// ─── Image field ──────────────────────────────────────────────────────────────

function ImageField({
    label,
    required,
    currentUrl,
    pending,
    onSelect,
    onRemovePending,
    onClearCurrent,
    maxMB,
    aspectStyle,
}: {
    label: string;
    required?: boolean;
    currentUrl: string | null;
    pending: PendingImage | null;
    onSelect: (file: File) => void;
    onRemovePending: () => void;
    onClearCurrent: () => void;
    maxMB: number;
    aspectStyle: React.CSSProperties;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const validate = (file: File) => {
        setLocalError(null);
        if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) { setLocalError("Solo JPG, PNG o WEBP"); return false; }
        if (file.size > maxMB * 1024 * 1024) { setLocalError(`Máximo ${maxMB} MB`); return false; }
        return true;
    };

    const preview = pending?.preview ?? currentUrl;
    const hasImage = !!preview;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-2)" }}>
                    {label}{required && <span style={{ color: "var(--color-error)", marginLeft: "0.25rem" }}>*</span>}
                    {pending && <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", color: "#22c55e" }}>· nueva imagen seleccionada</span>}
                </label>
                {localError && (
                    <span style={{ fontSize: "0.75rem", color: "var(--color-error)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Warning size={12} weight="bold" />
                        {localError}
                    </span>
                )}
            </div>

            {!hasImage ? (
                <div
                    style={{
                        ...aspectStyle,
                        cursor: "pointer",
                        borderRadius: "var(--radius-lg)",
                        border: `1.5px dashed ${isDragging ? "var(--color-text-2)" : "var(--color-layer-4)"}`,
                        backgroundColor: isDragging ? "color-mix(in srgb, var(--color-text-1) 4%, transparent)" : "var(--color-layer-2)",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.625rem",
                        transition: "border-color 0.15s, background-color 0.15s",
                        padding: "2rem",
                    }}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f && validate(f)) onSelect(f); }}
                    onClick={() => inputRef.current?.click()}
                >
                    <Upload size={28} weight="thin" style={{ color: "var(--color-text-3)" }} />
                    <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-2)", textAlign: "center" }}>
                        Arrastra o selecciona
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-3)" }}>JPG, PNG, WEBP · máx {maxMB} MB</p>
                    <input ref={inputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" style={{ display: "none" }}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f && validate(f)) onSelect(f); }} />
                </div>
            ) : (
                <div style={{ position: "relative", ...aspectStyle, borderRadius: "var(--radius-lg)", overflow: "hidden", backgroundColor: "var(--color-layer-2)" }}>
                    <img src={preview} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />

                    {/* Acciones */}
                    <div style={{ position: "absolute", top: "0.5rem", right: "0.5rem", display: "flex", gap: "0.375rem" }}>
                        {/* Cambiar imagen */}
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            style={{
                                display: "flex", alignItems: "center", gap: "0.375rem",
                                padding: "0.25rem 0.625rem",
                                borderRadius: "var(--radius-sm)",
                                border: "none",
                                backgroundColor: "color-mix(in srgb, var(--color-layer-0) 85%, transparent)",
                                backdropFilter: "blur(8px)",
                                color: "var(--color-text-1)",
                                fontSize: "0.75rem", fontWeight: 500,
                                cursor: "pointer",
                            }}
                        >
                            <ImageIcon size={12} weight="duotone" />
                            Cambiar
                        </button>

                        {/* Quitar */}
                        <button
                            type="button"
                            onClick={() => pending ? onRemovePending() : onClearCurrent()}
                            style={{
                                display: "flex", alignItems: "center", justifyContent: "center",
                                width: "1.75rem", height: "1.75rem",
                                borderRadius: "var(--radius-sm)",
                                border: "none",
                                backgroundColor: "color-mix(in srgb, var(--color-layer-0) 85%, transparent)",
                                backdropFilter: "blur(8px)",
                                color: "var(--color-text-2)",
                                cursor: "pointer",
                            }}
                        >
                            <X size={12} weight="bold" />
                        </button>
                    </div>

                    <input ref={inputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" style={{ display: "none" }}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f && validate(f)) onSelect(f); }} />
                </div>
            )}
        </div>
    );
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function SeriesEditForm({ series, allGenres }: SeriesEditFormProps) {
    const router = useRouter();

    // ── Imágenes
    const [currentCoverUrl, setCurrentCoverUrl] = useState(series.coverUrl);
    const [currentCoverKey, setCurrentCoverKey] = useState(series.coverKey);
    const [currentBannerUrl, setCurrentBannerUrl] = useState(series.bannerUrl);
    const [currentBannerKey, setCurrentBannerKey] = useState(series.bannerKey);
    const [pendingCover, setPendingCover] = useState<PendingImage | null>(null);
    const [pendingBanner, setPendingBanner] = useState<PendingImage | null>(null);

    // ── Info
    const [title, setTitle] = useState(series.title);
    const [synopsis, setSynopsis] = useState(series.synopsis ?? "");

    // ── Clasificación
    const [status, setStatus] = useState<SeriesStatus>(series.status as SeriesStatus);
    const [ageRating, setAgeRating] = useState<AgeRating>(series.ageRating as AgeRating);
    const [format, setFormat] = useState<SeriesFormat>(series.format as SeriesFormat);
    const [readingDir, setReadingDir] = useState<ReadingDir>(series.readingDir as ReadingDir);


    // ── Géneros
    const [selectedGenres, setSelectedGenres] = useState<string[]>(series.genres.map((g) => g.id));

    // ── Visibilidad
    const [isPublished, setIsPublished] = useState(series.isPublished);

    // ── UI
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStep, setUploadStep] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const toggleGenre = (id: string) => {
        setSelectedGenres((prev) =>
            prev.includes(id) ? prev.filter((g) => g !== id) : prev.length < 5 ? [...prev, id] : prev
        );
    };

    // ─── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!title.trim()) { setError("El título es requerido"); return; }
        if (!currentCoverUrl && !pendingCover) { setError("El cover es requerido"); return; }

        setIsSubmitting(true);
        setUploadProgress(0);

        try {
            let coverUrl = currentCoverUrl!;
            let coverKey = currentCoverKey!;
            let bannerUrl = currentBannerUrl ?? null;
            let bannerKey = currentBannerKey ?? null;

            const oldCoverKey = series.coverKey;
            const oldBannerKey = series.bannerKey;

            // ── Subir nuevo cover si cambió ──────────────────────────────────────
            if (pendingCover) {
                setUploadStep("Subiendo cover...");
                const result = await uploadViaPresignedUrl(
                    pendingCover.file,
                    "/api/upload/series/cover",
                    (pct) => setUploadProgress(Math.round(pct * 0.4))
                );
                coverUrl = result.publicUrl;
                coverKey = result.key;
            }

            // ── Subir nuevo banner si cambió ─────────────────────────────────────
            if (pendingBanner) {
                setUploadStep("Subiendo banner...");
                const result = await uploadViaPresignedUrl(
                    pendingBanner.file,
                    "/api/upload/series/banner",
                    (pct) => setUploadProgress(40 + Math.round(pct * 0.3))
                );
                bannerUrl = result.publicUrl;
                bannerKey = result.key;
            }

            // ── Actualizar en DB ─────────────────────────────────────────────────
            setUploadStep("Guardando cambios...");
            setUploadProgress(75);

            const res = await fetch(`/api/series/${series.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim(),
                    synopsis: synopsis.trim() || null,
                    coverUrl,
                    coverKey,
                    bannerUrl,
                    bannerKey,
                    status,
                    ageRating,
                    format,
                    readingDir,
                    genreIds: selectedGenres,
                    isPublished,
                    oldCoverKey: pendingCover ? oldCoverKey : null,
                    oldBannerKey: pendingBanner ? oldBannerKey : null,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Error guardando cambios");
            }

            setUploadProgress(100);
            setSuccess(true);
            setPendingCover(null);
            setPendingBanner(null);

            // Actualizar estado local con las nuevas keys/urls
            setCurrentCoverUrl(coverUrl);
            setCurrentCoverKey(coverKey);
            setCurrentBannerUrl(bannerUrl);
            setCurrentBannerKey(bannerKey);

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

    // ── Shared styles
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

    const dividerStyle: React.CSSProperties = {
        height: "1px",
        backgroundColor: "var(--color-layer-3)",
        margin: "0.5rem 0",
    };

    const submitDisabled = isSubmitting || !title.trim() || (!currentCoverUrl && !pendingCover);

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

            {/* ── Imágenes ─────────────────────────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div style={{ maxWidth: "200px" }}>
                    <ImageField
                        label="Cover"
                        required
                        currentUrl={currentCoverUrl}
                        pending={pendingCover}
                        onSelect={(f) => setPendingCover({ file: f, preview: URL.createObjectURL(f) })}
                        onRemovePending={() => setPendingCover(null)}
                        onClearCurrent={() => { setCurrentCoverUrl(null); setCurrentCoverKey(null); }}
                        maxMB={10}
                        aspectStyle={{ aspectRatio: "2/3", width: "100%" }}
                    />
                </div>

                <ImageField
                    label="Banner"
                    currentUrl={currentBannerUrl}
                    pending={pendingBanner}
                    onSelect={(f) => setPendingBanner({ file: f, preview: URL.createObjectURL(f) })}
                    onRemovePending={() => setPendingBanner(null)}
                    onClearCurrent={() => { setCurrentBannerUrl(null); setCurrentBannerKey(null); }}
                    maxMB={15}
                    aspectStyle={{ aspectRatio: "16/5", width: "100%" }}
                />
            </div>

            <div style={dividerStyle} />

            {/* ── Título ──────────────────────────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label htmlFor="title" style={labelStyle}>
                    Título <span style={{ color: "var(--color-error)" }}>*</span>
                </label>
                <input
                    id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nombre de tu serie" maxLength={120} disabled={isSubmitting}
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-text-3)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-layer-4)")}
                />
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-3)", textAlign: "right" }}>
                    {title.length} / 120
                </span>
            </div>

            {/* ── Sinopsis ─────────────────────────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label htmlFor="synopsis" style={labelStyle}>
                    Sinopsis <span style={{ color: "var(--color-text-3)", fontWeight: 400 }}>(opcional)</span>
                </label>
                <textarea
                    id="synopsis" value={synopsis} onChange={(e) => setSynopsis(e.target.value)}
                    placeholder="Describe de qué trata tu serie..." rows={5} maxLength={2000}
                    disabled={isSubmitting}
                    style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65 }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-text-3)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-layer-4)")}
                />
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-3)", textAlign: "right" }}>
                    {synopsis.length} / 2000
                </span>
            </div>

            <div style={dividerStyle} />

            {/* ── Clasificación ────────────────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                <SelectField
                    label="Formato"
                    value={format}
                    onChange={(v) => setFormat(v as SeriesFormat)}
                    options={FORMAT_OPTIONS}
                />
                <SelectField
                    label="Estado"
                    value={status}
                    onChange={(v) => setStatus(v as SeriesStatus)}
                    options={STATUS_OPTIONS}
                />
                <SelectField
                    label="Clasificación de edad"
                    value={ageRating}
                    onChange={(v) => setAgeRating(v as AgeRating)}
                    options={AGE_OPTIONS}
                />
                <SelectField
                    label="Dirección de lectura"
                    value={readingDir}
                    onChange={(v) => setReadingDir(v as ReadingDir)}
                    options={DIR_OPTIONS}
                />
            </div>

            <div style={dividerStyle} />

            {/* ── Géneros ──────────────────────────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <label style={labelStyle}>Géneros</label>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-3)" }}>
                        {selectedGenres.length} / 5
                    </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {allGenres.map((genre) => {
                        const isSelected = selectedGenres.includes(genre.id);
                        const isDisabled = !isSelected && selectedGenres.length >= 5;
                        return (
                            <button
                                key={genre.id} type="button"
                                onClick={() => toggleGenre(genre.id)}
                                disabled={isDisabled || isSubmitting}
                                style={{
                                    padding: "0.375rem 0.875rem",
                                    borderRadius: "var(--radius-full)",
                                    border: `1px solid ${isSelected ? (genre.color ?? "var(--color-text-2)") : "var(--color-layer-4)"}`,
                                    backgroundColor: isSelected ? `color-mix(in srgb, ${genre.color ?? "var(--color-text-2)"} 12%, transparent)` : "var(--color-layer-2)",
                                    color: isSelected ? (genre.color ?? "var(--color-text-1)") : "var(--color-text-2)",
                                    fontSize: "0.8125rem",
                                    fontWeight: isSelected ? 500 : 400,
                                    cursor: isDisabled || isSubmitting ? "not-allowed" : "pointer",
                                    opacity: isDisabled ? 0.4 : 1,
                                    transition: "all 0.15s",
                                }}
                            >
                                {genre.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div style={dividerStyle} />

            {/* ── Publicar ─────────────────────────────────────────────────────── */}
            <label
                style={{
                    display: "flex", alignItems: "flex-start", gap: "0.75rem",
                    cursor: isSubmitting ? "default" : "pointer",
                    padding: "1rem",
                    borderRadius: "var(--radius-md)",
                    border: `1px solid ${isPublished ? "var(--color-layer-4)" : "var(--color-layer-3)"}`,
                    backgroundColor: isPublished ? "var(--color-layer-2)" : "transparent",
                    transition: "all 0.15s",
                }}
            >
                <span
                    onClick={() => !isSubmitting && setIsPublished(!isPublished)}
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
                        Serie publicada
                    </p>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-3)", lineHeight: 1.5 }}>
                        {isPublished ? "Visible para todos los lectores" : "Guardada como borrador"}
                    </p>
                </div>
            </label>

            {/* ── Error ────────────────────────────────────────────────────────── */}
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

            {/* ── Success ──────────────────────────────────────────────────────── */}
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

            {/* ── Progress ─────────────────────────────────────────────────────── */}
            {isSubmitting && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-3)" }}>{uploadStep}</span>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-2)", fontVariantNumeric: "tabular-nums" }}>
                            {uploadProgress}%
                        </span>
                    </div>
                    <div style={{ height: "2px", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-layer-4)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${uploadProgress}%`, borderRadius: "var(--radius-full)", backgroundColor: "var(--color-text-1)", transition: "width 0.4s ease" }} />
                    </div>
                </div>
            )}

            {/* ── Actions ──────────────────────────────────────────────────────── */}
            <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
                <button
                    type="button"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                    style={{
                        display: "flex", alignItems: "center", gap: "0.5rem",
                        padding: "0.75rem 1.25rem",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--color-layer-4)",
                        backgroundColor: "transparent",
                        color: "var(--color-text-2)",
                        fontSize: "0.875rem", fontWeight: 500,
                        cursor: isSubmitting ? "not-allowed" : "pointer",
                        opacity: isSubmitting ? 0.5 : 1,
                        transition: "all 0.15s",
                        fontFamily: "var(--font-sans)",
                    }}
                    onMouseEnter={(e) => { if (!isSubmitting) { (e.currentTarget as HTMLElement).style.borderColor = "var(--color-text-3)"; (e.currentTarget as HTMLElement).style.color = "var(--color-text-1)"; } }}
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
                    {isSubmitting
                        ? <><CircleNotch size={16} weight="bold" style={{ animation: "spin 0.8s linear infinite" }} /> {uploadStep || "Guardando..."}</>
                        : "Guardar cambios"
                    }
                </button>
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </form>
    );
}