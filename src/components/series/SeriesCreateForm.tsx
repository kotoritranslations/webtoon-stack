"use client";

// src/components/series/SeriesCreateForm.tsx

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Upload,
    X,
    CircleNotch,
    Image as ImageIcon,
    Books,
    ArrowLeft,
    CheckCircle,
    Warning,
    CaretDown,
    Eye,
} from "@phosphor-icons/react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Genre {
    id: string;
    name: string;
    slug: string;
    color?: string | null;
}

interface SeriesCreateFormProps {
    genres: Genre[];
}

type SeriesStatus = "ongoing" | "completed" | "hiatus" | "canceled";
type AgeRating = "all" | "teen" | "mature";
type SeriesFormat = "webtoon" | "manga" | "manhwa" | "comic" | "novel";
type ReadingDir = "ltr" | "rtl";

interface UploadedImage {
    file: File;
    preview: string;
    key: string;
    publicUrl: string;
}

interface CreatedSeries {
    id: string;
    slug: string;
    title: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: SeriesStatus; label: string; description: string }[] = [
    { value: "ongoing", label: "En curso", description: "Se publican capítulos regularmente" },
    { value: "completed", label: "Completada", description: "Historia finalizada" },
    { value: "hiatus", label: "En pausa", description: "Pausada temporalmente" },
    { value: "canceled", label: "Cancelada", description: "No continuará" },
];

const AGE_OPTIONS: { value: AgeRating; label: string; description: string }[] = [
    { value: "all", label: "Para todos", description: "Apto para todas las edades" },
    { value: "teen", label: "Teen+", description: "Recomendado 13 años en adelante" },
    { value: "mature", label: "Maduro", description: "Solo para adultos" },
];

const FORMAT_OPTIONS: { value: SeriesFormat; label: string }[] = [
    { value: "webtoon", label: "Webtoon" },
    { value: "manga", label: "Manga" },
    { value: "manhwa", label: "Manhwa" },
    { value: "comic", label: "Cómic" },
    { value: "novel", label: "Novela" },
];

const DIR_OPTIONS: { value: ReadingDir; label: string; description: string }[] = [
    { value: "ltr", label: "Izquierda → Derecha", description: "Webtoon, Manhwa, Cómic" },
    { value: "rtl", label: "Derecha → Izquierda", description: "Manga japonés" },
];

const UPLOAD_STEPS: [number, string][] = [
    [85, "Creando serie..."],
    [60, "Subiendo banner..."],
    [30, "Subiendo cover..."],
    [0, "Iniciando..."],
];

const getUploadStep = (progress: number) =>
    UPLOAD_STEPS.find(([min]) => progress >= min)?.[1] ?? "Iniciando...";

// ─── Upload helper ────────────────────────────────────────────────────────────

async function uploadViaPresignedUrl(
    file: File,
    endpoint: "/api/upload/series/cover" | "/api/upload/series/banner",
    onProgress?: (pct: number) => void
): Promise<{ key: string; publicUrl: string }> {
    const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
        }),
    });

    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error obteniendo URL de subida");
    }

    const { uploadUrl, key, publicUrl } = await res.json();

    await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable && onProgress) {
                onProgress(Math.round((e.loaded / e.total) * 100));
            }
        });
        xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else reject(new Error(`R2 respondió con status ${xhr.status}`));
        });
        xhr.addEventListener("error", () => reject(new Error("Error de red al subir imagen")));
        xhr.addEventListener("abort", () => reject(new Error("Subida cancelada")));
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
    });

    return { key, publicUrl };
}

// ─── Image Drop Zone ──────────────────────────────────────────────────────────

function ImageDropZone({
    label,
    hint,
    aspectClass,
    value,
    onChange,
    onRemove,
    maxMB,
    required,
}: {
    label: string;
    hint: string;
    aspectClass: string;
    value: UploadedImage | null;
    onChange: (file: File) => void;
    onRemove: () => void;
    maxMB: number;
    required?: boolean;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const validate = (file: File): boolean => {
        setLocalError(null);
        if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
            setLocalError("Solo JPG, PNG o WEBP");
            return false;
        }
        if (file.size > maxMB * 1024 * 1024) {
            setLocalError(`Máximo ${maxMB} MB`);
            return false;
        }
        return true;
    };

    const handleFile = (file: File) => {
        if (validate(file)) onChange(file);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-2)" }}>
                    {label}
                    {required && <span style={{ color: "var(--color-error)", marginLeft: "0.25rem" }}>*</span>}
                </label>
                {localError && (
                    <span style={{ fontSize: "0.75rem", color: "var(--color-error)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Warning size={12} weight="bold" />
                        {localError}
                    </span>
                )}
            </div>

            {!value ? (
                <div
                    className={aspectClass}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                    onClick={() => inputRef.current?.click()}
                    style={{
                        cursor: "pointer",
                        borderRadius: "var(--radius-lg)",
                        border: `1.5px dashed ${isDragging ? "var(--color-text-2)" : "var(--color-layer-4)"}`,
                        backgroundColor: isDragging
                            ? "color-mix(in srgb, var(--color-text-1) 4%, transparent)"
                            : "var(--color-layer-2)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.625rem",
                        transition: "border-color 0.15s, background-color 0.15s",
                        padding: "2rem",
                    }}
                >
                    <Upload size={28} weight="thin" style={{ color: "var(--color-text-3)" }} />
                    <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
                            {hint}
                        </p>
                        <p style={{ fontSize: "0.75rem", color: "var(--color-text-3)" }}>
                            JPG, PNG, WEBP · máx {maxMB} MB
                        </p>
                    </div>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        style={{ display: "none" }}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                    />
                </div>
            ) : (
                <div style={{ position: "relative" }}>
                    <div
                        className={aspectClass}
                        style={{
                            borderRadius: "var(--radius-lg)",
                            overflow: "hidden",
                            backgroundColor: "var(--color-layer-2)",
                        }}
                    >
                        <img
                            src={value.preview}
                            alt={label}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={onRemove}
                        style={{
                            position: "absolute",
                            top: "0.5rem",
                            right: "0.5rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "1.75rem",
                            height: "1.75rem",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--color-layer-4)",
                            backgroundColor: "color-mix(in srgb, var(--color-layer-0) 80%, transparent)",
                            backdropFilter: "blur(8px)",
                            color: "var(--color-text-2)",
                            cursor: "pointer",
                        }}
                    >
                        <X size={14} weight="bold" />
                    </button>
                    <div style={{
                        position: "absolute",
                        bottom: "0.5rem",
                        left: "0.5rem",
                        borderRadius: "var(--radius-xs)",
                        backgroundColor: "color-mix(in srgb, var(--color-layer-0) 80%, transparent)",
                        backdropFilter: "blur(8px)",
                        padding: "0.25rem 0.5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                    }}>
                        <ImageIcon size={12} weight="duotone" style={{ color: "var(--color-text-3)" }} />
                        <span style={{ fontSize: "0.6875rem", color: "var(--color-text-2)" }}>
                            {(value.file.size / (1024 * 1024)).toFixed(1)} MB
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Select component ─────────────────────────────────────────────────────────

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
                <CaretDown
                    size={14}
                    weight="bold"
                    style={{
                        position: "absolute",
                        right: "1rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--color-text-3)",
                        pointerEvents: "none",
                    }}
                />
            </div>
        </div>
    );
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function SeriesCreateForm({ genres }: SeriesCreateFormProps) {
    const router = useRouter();

    const [cover, setCover] = useState<UploadedImage | null>(null);
    const [banner, setBanner] = useState<UploadedImage | null>(null);
    const [title, setTitle] = useState("");
    const [synopsis, setSynopsis] = useState("");
    const [status, setStatus] = useState<SeriesStatus>("ongoing");
    const [ageRating, setAgeRating] = useState<AgeRating>("all");
    const [format, setFormat] = useState<SeriesFormat>("webtoon");
    const [readingDir, setReadingDir] = useState<ReadingDir>("ltr");
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [isPublished, setIsPublished] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [createdSeries, setCreatedSeries] = useState<CreatedSeries | null>(null);

    const makePreview = (file: File): string => URL.createObjectURL(file);

    const handleCoverSelect = (file: File) => {
        setCover({ file, preview: makePreview(file), key: "", publicUrl: "" });
    };

    const handleBannerSelect = (file: File) => {
        setBanner({ file, preview: makePreview(file), key: "", publicUrl: "" });
    };

    const toggleGenre = (id: string) => {
        setSelectedGenres((prev) =>
            prev.includes(id) ? prev.filter((g) => g !== id) : prev.length < 5 ? [...prev, id] : prev
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!title.trim()) { setError("El título es requerido"); return; }
        if (!cover) { setError("El cover es requerido"); return; }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            setUploadProgress(5);
            const coverResult = await uploadViaPresignedUrl(
                cover.file,
                "/api/upload/series/cover",
                (pct) => setUploadProgress(Math.round(pct * 0.35))
            );

            let bannerResult: { key: string; publicUrl: string } | null = null;
            if (banner) {
                setUploadProgress(40);
                bannerResult = await uploadViaPresignedUrl(
                    banner.file,
                    "/api/upload/series/banner",
                    (pct) => setUploadProgress(40 + Math.round(pct * 0.3))
                );
            }

            setUploadProgress(75);
            const res = await fetch("/api/series", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim(),
                    synopsis: synopsis.trim() || null,
                    coverUrl: coverResult.publicUrl,
                    coverKey: coverResult.key,
                    bannerUrl: bannerResult?.publicUrl ?? null,
                    bannerKey: bannerResult?.key ?? null,
                    status,
                    ageRating,
                    format,
                    readingDir,
                    genreIds: selectedGenres,
                    isPublished,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Error creando la serie");
            }

            const { series } = await res.json();
            setUploadProgress(100);
            setCreatedSeries({ id: series.id, slug: series.slug, title: series.title });
            setIsUploading(false);
        } catch (err: any) {
            setError(err.message || "Error al crear la serie");
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

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

    const sectionStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
    };

    const dividerStyle: React.CSSProperties = {
        height: "1px",
        backgroundColor: "var(--color-layer-3)",
        margin: "0.5rem 0",
    };

    const submitDisabled = isUploading || !cover || !title.trim();

    // ─── Success screen ──────────────────────────────────────────────────────────
    if (createdSeries) {
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
                        {createdSeries.title}
                    </h2>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-3)" }}>
                        {isPublished
                            ? "Tu serie ya es visible para los lectores."
                            : "Guardada como borrador — puedes publicarla cuando quieras."}
                    </p>
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: "0.75rem",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        width: "100%",
                        maxWidth: "360px",
                    }}
                >
                    <a
                        href={`/series/${createdSeries.slug}`}
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
                        <Eye size={15} weight="bold" />
                        Ver serie
                    </a>

                    <a
                        href={`/dashboard/chapters/new?seriesId=${createdSeries.id}`}
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
                            textDecoration: "none",
                            fontFamily: "var(--font-sans)",
                        }}
                    >
                        <Upload size={15} weight="bold" />
                        Subir capítulo
                    </a>
                </div >
            </div >
        );
    }

    // ─── Form ────────────────────────────────────────────────────────────────────
    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

            {/* ── Imágenes ────────────────────────────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div style={{ maxWidth: "200px" }}>
                    <ImageDropZone
                        label="Cover"
                        hint="Arrastra o selecciona"
                        aspectClass="cover-zone"
                        value={cover}
                        onChange={handleCoverSelect}
                        onRemove={() => setCover(null)}
                        maxMB={10}
                        required
                    />
                </div>
                <ImageDropZone
                    label="Banner"
                    hint="Arrastra o selecciona el banner"
                    aspectClass="banner-zone"
                    value={banner}
                    onChange={handleBannerSelect}
                    onRemove={() => setBanner(null)}
                    maxMB={15}
                />
            </div>

            <div style={dividerStyle} />

            {/* ── Título ──────────────────────────────────────────────────────────── */}
            <div style={sectionStyle}>
                <label htmlFor="title" style={labelStyle}>
                    Título <span style={{ color: "var(--color-error)" }}>*</span>
                </label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nombre de tu serie"
                    maxLength={120}
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-text-3)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-layer-4)")}
                />
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-3)", textAlign: "right" }}>
                    {title.length} / 120
                </span>
            </div>

            {/* ── Sinopsis ─────────────────────────────────────────────────────────── */}
            <div style={sectionStyle}>
                <label htmlFor="synopsis" style={labelStyle}>
                    Sinopsis{" "}
                    <span style={{ color: "var(--color-text-3)", fontWeight: 400 }}>(opcional)</span>
                </label>
                <textarea
                    id="synopsis"
                    value={synopsis}
                    onChange={(e) => setSynopsis(e.target.value)}
                    placeholder="Describe de qué trata tu serie..."
                    rows={5}
                    maxLength={2000}
                    style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65 }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-text-3)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-layer-4)")}
                />
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-3)", textAlign: "right" }}>
                    {synopsis.length} / 2000
                </span>
            </div>

            <div style={dividerStyle} />

            {/* ── Clasificación ────────────────────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                <SelectField label="Formato" value={format} onChange={setFormat} options={FORMAT_OPTIONS} />
                <SelectField label="Estado" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
                <SelectField label="Clasificación de edad" value={ageRating} onChange={setAgeRating} options={AGE_OPTIONS} />
                <SelectField label="Dirección de lectura" value={readingDir} onChange={setReadingDir} options={DIR_OPTIONS} />
            </div>

            <div style={dividerStyle} />

            {/* ── Géneros ───────────────────────────────────────────────────────────── */}
            <div style={sectionStyle}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <label style={labelStyle}>Géneros</label>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-3)" }}>
                        {selectedGenres.length} / 5 seleccionados
                    </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {genres.map((genre) => {
                        const isSelected = selectedGenres.includes(genre.id);
                        const isDisabled = !isSelected && selectedGenres.length >= 5;
                        return (
                            <button
                                key={genre.id}
                                type="button"
                                onClick={() => toggleGenre(genre.id)}
                                disabled={isDisabled}
                                style={{
                                    padding: "0.375rem 0.875rem",
                                    borderRadius: "var(--radius-full)",
                                    border: `1px solid ${isSelected ? (genre.color ?? "var(--color-text-2)") : "var(--color-layer-4)"}`,
                                    backgroundColor: isSelected
                                        ? `color-mix(in srgb, ${genre.color ?? "var(--color-text-2)"} 12%, transparent)`
                                        : "var(--color-layer-2)",
                                    color: isSelected ? (genre.color ?? "var(--color-text-1)") : "var(--color-text-2)",
                                    fontSize: "0.8125rem",
                                    fontWeight: isSelected ? 500 : 400,
                                    cursor: isDisabled ? "not-allowed" : "pointer",
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

            {/* ── Publicar ──────────────────────────────────────────────────────────── */}
            <label
                style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    cursor: "pointer",
                    padding: "1rem",
                    borderRadius: "var(--radius-md)",
                    border: `1px solid ${isPublished ? "var(--color-layer-4)" : "var(--color-layer-3)"}`,
                    backgroundColor: isPublished ? "var(--color-layer-2)" : "transparent",
                    transition: "all 0.15s",
                }}
            >
                <span
                    onClick={() => setIsPublished(!isPublished)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "1rem",
                        width: "1rem",
                        marginTop: "0.1rem",
                        flexShrink: 0,
                        borderRadius: "var(--radius-xs)",
                        border: `1.5px solid ${isPublished ? "var(--color-text-1)" : "var(--color-layer-4)"}`,
                        backgroundColor: isPublished ? "var(--color-text-1)" : "transparent",
                        transition: "all 0.15s",
                    }}
                >
                    {isPublished && (
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                            <path
                                d="M1 3.5L3.5 6L8 1"
                                stroke="var(--color-layer-1)"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    )}
                </span>
                <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    style={{ display: "none" }}
                />
                <div>
                    <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-text-1)", marginBottom: "0.25rem" }}>
                        Publicar serie
                    </p>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-3)", lineHeight: 1.5 }}>
                        {isPublished
                            ? "Tu serie será visible para todos inmediatamente"
                            : "La serie se guardará como borrador — la puedes publicar después"}
                    </p>
                </div>
            </label>

            {/* ── Error ─────────────────────────────────────────────────────────────── */}
            {error && (
                <div
                    style={{
                        borderRadius: "var(--radius-md)",
                        border: "1px solid color-mix(in srgb, var(--color-error) 25%, transparent)",
                        backgroundColor: "color-mix(in srgb, var(--color-error) 8%, transparent)",
                        padding: "0.75rem 1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.625rem",
                    }}
                >
                    <Warning size={16} weight="bold" style={{ color: "var(--color-error)", flexShrink: 0 }} />
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-error)" }}>{error}</p>
                </div>
            )}

            {/* ── Progress ──────────────────────────────────────────────────────────── */}
            {isUploading && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-3)" }}>
                            {getUploadStep(uploadProgress)}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-2)", fontVariantNumeric: "tabular-nums" }}>
                            {uploadProgress}%
                        </span>
                    </div>
                    <div
                        style={{
                            height: "2px",
                            borderRadius: "var(--radius-full)",
                            backgroundColor: "var(--color-layer-4)",
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                height: "100%",
                                width: `${uploadProgress}%`,
                                borderRadius: "var(--radius-full)",
                                backgroundColor: "var(--color-text-1)",
                                transition: "width 0.4s ease",
                            }}
                        />
                    </div>
                </div>
            )}

            {/* ── Actions ───────────────────────────────────────────────────────────── */}
            <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
                <button
                    type="button"
                    onClick={() => router.back()}
                    disabled={isUploading}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.75rem 1.25rem",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--color-layer-4)",
                        backgroundColor: "transparent",
                        color: "var(--color-text-2)",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        cursor: isUploading ? "not-allowed" : "pointer",
                        opacity: isUploading ? 0.5 : 1,
                        transition: "all 0.15s",
                        fontFamily: "var(--font-sans)",
                    }}
                    onMouseEnter={(e) => {
                        if (!isUploading) {
                            e.currentTarget.style.borderColor = "var(--color-text-3)";
                            e.currentTarget.style.color = "var(--color-text-1)";
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--color-layer-4)";
                        e.currentTarget.style.color = "var(--color-text-2)";
                    }}
                >
                    <ArrowLeft size={15} weight="bold" />
                    Cancelar
                </button>

                <button
                    type="submit"
                    disabled={submitDisabled}
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
                        cursor: submitDisabled ? "not-allowed" : "pointer",
                        opacity: submitDisabled ? 0.4 : 1,
                        transition: "opacity 0.15s",
                        fontFamily: "var(--font-sans)",
                    }}
                >
                    {isUploading ? (
                        <>
                            <CircleNotch size={16} weight="bold" style={{ animation: "spin 0.8s linear infinite" }} />
                            {getUploadStep(uploadProgress)}
                        </>
                    ) : (
                        <>
                            <Books size={16} weight="duotone" />
                            Crear serie
                        </>
                    )}
                </button>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .cover-zone { aspect-ratio: 2/3; width: 100%; }
                .banner-zone { aspect-ratio: 16/5; width: 100%; }
            `}</style>
        </form>
    );
}