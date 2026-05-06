"use client";

// src/components/admin/AdminSettingsForm.tsx

import { useState, useTransition } from "react";
import { updateSiteConfig } from "@/lib/actions/site-config";
import { FloppyDisk, Globe, InstagramLogo, TwitterLogo, YoutubeLogo, TiktokLogo, Link, Users, Warning } from "@phosphor-icons/react";

type SiteConfig = Awaited<ReturnType<typeof import("@/lib/actions/site-config").getSiteConfig>>;

// ─── Componentes internos ─────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div
            style={{
                borderRadius: "var(--radius-xl)",
                backgroundColor: "var(--color-layer-2)",
                padding: "1.25rem",
                marginBottom: "0.5rem",
            }}
        >
            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-3)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {title}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {children}
            </div>
        </div>
    );
}

function Field({
    label,
    name,
    value,
    onChange,
    placeholder,
    icon: Icon,
    textarea,
}: {
    label: string;
    name: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    icon?: React.ElementType;
    textarea?: boolean;
}) {
    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "0.5rem 0.75rem",
        borderRadius: "var(--radius-lg)",
        backgroundColor: "var(--color-layer-3)",
        border: "1px solid transparent",
        color: "var(--color-text-1)",
        fontSize: "0.8125rem",
        outline: "none",
        transition: "border-color 0.15s",
        resize: textarea ? "vertical" : undefined,
        minHeight: textarea ? "80px" : undefined,
        fontFamily: "inherit",
    };

    return (
        <div>
            <label style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: "var(--color-text-2)", marginBottom: "0.375rem", fontWeight: 500 }}>
                {Icon && <Icon size={12} />}
                {label}
            </label>
            {textarea ? (
                <textarea
                    name={name}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-layer-4)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "transparent"; }}
                />
            ) : (
                <input
                    type="text"
                    name={name}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-layer-4)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "transparent"; }}
                />
            )}
        </div>
    );
}

function Toggle({
    label,
    description,
    checked,
    onChange,
    icon: Icon,
}: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (val: boolean) => void;
    icon?: React.ElementType;
}) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {Icon && <Icon size={14} style={{ color: "var(--color-text-3)" }} />}
                <div>
                    <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-1)" }}>{label}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-3)" }}>{description}</p>
                </div>
            </div>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                style={{
                    flexShrink: 0,
                    width: "2.25rem",
                    height: "1.25rem",
                    borderRadius: "9999px",
                    backgroundColor: checked ? "var(--color-text-1)" : "var(--color-layer-4)",
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                    transition: "background-color 0.2s",
                }}
            >
                <span
                    style={{
                        position: "absolute",
                        top: "2px",
                        left: checked ? "calc(100% - 18px)" : "2px",
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        backgroundColor: checked ? "var(--color-layer-1)" : "var(--color-text-3)",
                        transition: "left 0.2s",
                    }}
                />
            </button>
        </div>
    );
}

// ─── Form principal ───────────────────────────────────────────────────────────

export function AdminSettingsForm({ config }: { config: SiteConfig }) {
    const [isPending, startTransition] = useTransition();
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [fields, setFields] = useState({
        siteName: config.siteName ?? "",
        siteDescription: config.siteDescription ?? "",
        siteTagline: config.siteTagline ?? "",
        siteUrl: config.siteUrl ?? "",
        logoUrl: config.logoUrl ?? "",
        logoDarkUrl: config.logoDarkUrl ?? "",
        faviconUrl: config.faviconUrl ?? "",
        socialTwitter: config.socialTwitter ?? "",
        socialInstagram: config.socialInstagram ?? "",
        socialYoutube: config.socialYoutube ?? "",
        socialTiktok: config.socialTiktok ?? "",
        socialWebsite: config.socialWebsite ?? "",
        allowRegistration: config.allowRegistration,
        maintenanceMode: config.maintenanceMode,
    });

    const set = (key: keyof typeof fields) => (val: string | boolean) =>
        setFields((prev) => ({ ...prev, [key]: val }));

    function handleSubmit() {
        setError(null);
        setSaved(false);
        startTransition(async () => {
            try {
                await updateSiteConfig(fields);
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            } catch (e) {
                setError(e instanceof Error ? e.message : "Error al guardar");
            }
        });
    }

    return (
        <div>
            {/* Identidad */}
            <Section title="Identidad">
                <Field label="Nombre del sitio" name="siteName" value={fields.siteName} onChange={set("siteName")} placeholder="Mi Webtoon" icon={Globe} />
                <Field label="Descripción" name="siteDescription" value={fields.siteDescription} onChange={set("siteDescription")} placeholder="Lee series gratis..." textarea />
                <Field label="Tagline" name="siteTagline" value={fields.siteTagline} onChange={set("siteTagline")} placeholder="Descubre miles de series..." />
                <Field label="URL del sitio" name="siteUrl" value={fields.siteUrl} onChange={set("siteUrl")} placeholder="https://tusitio.com" icon={Link} />
                <Field label="URL del logo" name="logoUrl" value={fields.logoUrl} onChange={set("logoUrl")} placeholder="/logo.svg" />
                <Field label="URL del logo (modo oscuro)" name="logoDarkUrl" value={fields.logoDarkUrl} onChange={set("logoDarkUrl")} placeholder="/logo-dark.svg" />
                <Field label="URL del favicon" name="faviconUrl" value={fields.faviconUrl} onChange={set("faviconUrl")} placeholder="/favicon.ico" />
            </Section>

            {/* Redes sociales */}
            <Section title="Redes sociales">
                <Field label="Twitter / X" name="socialTwitter" value={fields.socialTwitter} onChange={set("socialTwitter")} placeholder="@usuario" icon={TwitterLogo} />
                <Field label="Instagram" name="socialInstagram" value={fields.socialInstagram} onChange={set("socialInstagram")} placeholder="@usuario" icon={InstagramLogo} />
                <Field label="YouTube" name="socialYoutube" value={fields.socialYoutube} onChange={set("socialYoutube")} placeholder="URL del canal" icon={YoutubeLogo} />
                <Field label="TikTok" name="socialTiktok" value={fields.socialTiktok} onChange={set("socialTiktok")} placeholder="@usuario" icon={TiktokLogo} />
                <Field label="Sitio web" name="socialWebsite" value={fields.socialWebsite} onChange={set("socialWebsite")} placeholder="https://..." icon={Link} />
            </Section>

            {/* Comportamiento */}
            <Section title="Comportamiento">
                <Toggle
                    label="Permitir registro"
                    description="Los usuarios pueden crear cuentas nuevas"
                    checked={fields.allowRegistration}
                    onChange={set("allowRegistration") as (v: boolean) => void}
                    icon={Users}
                />
                <Toggle
                    label="Modo mantenimiento"
                    description="Solo el admin puede acceder al sitio"
                    checked={fields.maintenanceMode}
                    onChange={set("maintenanceMode") as (v: boolean) => void}
                    icon={Warning}
                />
            </Section>

            {/* Feedback + botón */}
            {error && (
                <p style={{ fontSize: "0.8125rem", color: "var(--color-red)", marginBottom: "0.75rem" }}>
                    {error}
                </p>
            )}

            <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.625rem 1.25rem",
                    borderRadius: "var(--radius-lg)",
                    backgroundColor: saved ? "var(--color-layer-3)" : "var(--color-text-1)",
                    color: saved ? "var(--color-text-1)" : "var(--color-layer-1)",
                    border: "none",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    cursor: isPending ? "not-allowed" : "pointer",
                    opacity: isPending ? 0.6 : 1,
                    transition: "background-color 0.2s, opacity 0.2s",
                    width: "100%",
                    justifyContent: "center",
                }}
            >
                <FloppyDisk size={15} weight="bold" />
                {isPending ? "Guardando..." : saved ? "¡Guardado!" : "Guardar cambios"}
            </button>
        </div>
    );
}