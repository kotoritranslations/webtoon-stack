"use client";

import Link from "next/link";
import { Plus } from "@phosphor-icons/react";

export function NewSeriesButton() {
    return (
        <Link
            href="/dashboard/series/new"
            style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-text-1)",
                color: "var(--color-layer-1)",
                fontSize: "0.875rem",
                fontWeight: 500,
                textDecoration: "none",
                transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.85")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
        >
            <Plus size={15} weight="bold" />
            Nueva serie
        </Link>
    );
}