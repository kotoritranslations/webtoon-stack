// src/app/dashboard/series/page.tsx

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Plus, Books } from "@phosphor-icons/react/dist/ssr";
import { SeriesList } from "@/components/series/SeriesList";

export const metadata = {
    title: "Mis series | Dashboard",
};

export default async function DashboardSeriesPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const series = await prisma.series.findMany({
        where: { creatorId: session.user.id, isActive: true },
        orderBy: { updatedAt: "desc" },
        select: {
            id: true,
            slug: true,
            title: true,
            coverUrl: true,
            status: true,
            format: true,
            isPublished: true,
            chaptersCount: true,
            viewsCount: true,
            likesCount: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    // Serializar fechas para el client component
    const serialized = series.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
    }));

    return (
        <div className="min-h-screen" style={{ backgroundColor: "var(--color-layer-1)" }}>

            {/* ── Top bar ──────────────────────────────────────────────────────── */}
            <div
                style={{
                    backgroundColor: "var(--color-layer-0)",
                    borderBottom: "1px solid var(--color-layer-3)",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                }}
            >
                <div className="mx-auto max-w-3xl px-5 py-4 sm:px-8">
                    <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-3)" }}>
                        <Link
                            href="/dashboard"
                            className="transition-colors hover:text-[var(--color-text-2)]"
                            style={{ color: "var(--color-text-3)" }}
                        >
                            Dashboard
                        </Link>
                        <span>/</span>
                        <span style={{ color: "var(--color-text-2)" }}>Mis series</span>
                    </div>
                </div>
            </div>

            {/* ── Header ───────────────────────────────────────────────────────── */}
            <div
                style={{
                    backgroundColor: "var(--color-layer-0)",
                    borderBottom: "1px solid var(--color-layer-3)",
                }}
            >
                <div className="mx-auto max-w-3xl px-5 pt-8 pb-6 sm:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "2.25rem",
                                    height: "2.25rem",
                                    borderRadius: "var(--radius-lg)",
                                    backgroundColor: "var(--color-layer-3)",
                                }}
                            >
                                <Books size={18} weight="duotone" style={{ color: "var(--color-text-2)" }} />
                            </div>
                            <div>
                                <h1
                                    className="text-xl font-semibold"
                                    style={{ color: "var(--color-text-1)", letterSpacing: "-0.025em" }}
                                >
                                    Mis series
                                </h1>
                                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-3)" }}>
                                    {series.length} {series.length === 1 ? "serie" : "series"}
                                </p>
                            </div>
                        </div>

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
                    </div>
                </div>
            </div>

            {/* ── Lista ────────────────────────────────────────────────────────── */}
            <div className="mx-auto max-w-3xl px-5 py-6 sm:px-8">
                <SeriesList initialSeries={serialized} />
            </div>
        </div>
    );
}