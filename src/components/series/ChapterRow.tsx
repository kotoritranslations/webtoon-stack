"use client";

// src/components/series/ChapterRow.tsx

import Link from "next/link";
import { Eye, Heart, Clock } from "@phosphor-icons/react";

interface ChapterRowProps {
    href: string;
    number: number;
    title: string | null;
    publishedAt: string | null;
    viewsCount: number;
    likesCount: number;
    isLast: boolean;
}

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

export function ChapterRow({
    href,
    number,
    title,
    publishedAt,
    viewsCount,
    likesCount,
    isLast,
}: ChapterRowProps) {
    return (
        <Link
            href={href}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
                padding: "0.875rem 1.25rem",
                backgroundColor: "var(--color-layer-2)",
                borderBottom: isLast ? "none" : "1px solid var(--color-layer-3)",
                textDecoration: "none",
                transition: "background-color 0.1s",
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-layer-3)";
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-layer-2)";
            }}
        >
            {/* Número + título */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", minWidth: 0 }}>
                <span
                    style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        fontVariantNumeric: "tabular-nums",
                        color: "var(--color-text-3)",
                        flexShrink: 0,
                        minWidth: "2.5rem",
                    }}
                >
                    Cap. {number}
                </span>
                <span
                    style={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "var(--color-text-1)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {title ?? `Capítulo ${number}`}
                </span>
            </div>

            {/* Stats */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    flexShrink: 0,
                    fontSize: "0.75rem",
                    color: "var(--color-text-3)",
                }}
            >
                <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Eye size={12} />
                    {formatCount(viewsCount)}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Heart size={12} />
                    {formatCount(likesCount)}
                </span>
                {publishedAt && (
                    <span
                        style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}
                        className="hidden sm:flex"
                    >
                        <Clock size={12} />
                        {timeAgo(publishedAt)}
                    </span>
                )}
            </div>
        </Link>
    );
}