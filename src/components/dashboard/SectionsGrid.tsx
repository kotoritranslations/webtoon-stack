"use client";

// src/components/dashboard/SectionsGrid.tsx

import Link from "next/link";
import { ArrowRight, Books, Plus, BookBookmark, UsersThree, ChatCircle, Gear, Article, Tag } from "@phosphor-icons/react";

const SECTIONS = [
    { label: "Nueva serie", description: "Crea una nueva serie", href: "/dashboard/series/new", icon: Plus, highlight: true },
    { label: "Nuevo capítulo", description: "Agrega un capítulo a una serie", href: "/dashboard/chapters/new", icon: Article, highlight: true },
    { label: "Mis series", description: "Administra y edita tus series", href: "/dashboard/series", icon: Books, highlight: false },
    { label: "Mis capítulos", description: "Todos tus capítulos publicados", href: "/dashboard/chapters", icon: BookBookmark, highlight: false },
    { label: "Géneros", description: "Crea y administra géneros", href: "/dashboard/genres", icon: Tag, highlight: false }, // ← nuevo
    { label: "Seguidores", description: "Usuarios que siguen tu perfil", href: "/dashboard/followers", icon: UsersThree, highlight: false },
    { label: "Comentarios", description: "Lo que dice tu audiencia", href: "/dashboard/comments", icon: ChatCircle, highlight: false },
    { label: "Ajustes", description: "Perfil, redes sociales y más", href: "/settings", icon: Gear, highlight: false },
];

export function SectionsGrid() {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "0.5rem",
            }}
        >
            {SECTIONS.map(({ label, description, href, icon: Icon, highlight }) => (
                <Link
                    key={href}
                    href={href}
                    className="group"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "1rem",
                        borderRadius: "var(--radius-xl)",
                        backgroundColor: highlight ? "var(--color-layer-3)" : "var(--color-layer-2)",
                        border: highlight ? "1px solid var(--color-layer-4)" : "1px solid transparent",
                        textDecoration: "none",
                        transition: "background-color 0.15s",
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor =
                            highlight ? "var(--color-layer-4)" : "var(--color-layer-3)";
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor =
                            highlight ? "var(--color-layer-3)" : "var(--color-layer-2)";
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "2.25rem",
                            width: "2.25rem",
                            flexShrink: 0,
                            borderRadius: "var(--radius-lg)",
                            backgroundColor: highlight ? "var(--color-layer-4)" : "var(--color-layer-3)",
                        }}
                    >
                        <Icon
                            size={18}
                            weight={highlight ? "bold" : "regular"}
                            style={{ color: highlight ? "var(--color-text-1)" : "var(--color-text-2)" }}
                        />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-1)", lineHeight: 1, marginBottom: "0.3rem" }}>
                            {label}
                        </p>
                        <p style={{ fontSize: "0.75rem", color: "var(--color-text-3)", lineHeight: 1.35, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {description}
                        </p>
                    </div>

                    <ArrowRight
                        size={13}
                        weight="bold"
                        className="group-hover:opacity-100"
                        style={{ flexShrink: 0, color: "var(--color-text-3)", opacity: 0, transition: "opacity 0.15s" }}
                    />
                </Link>
            ))}
        </div>
    );
}