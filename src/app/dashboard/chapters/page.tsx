// src/app/dashboard/chapters/page.tsx

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Plus, BookBookmark } from "@phosphor-icons/react/dist/ssr";
import { ChaptersList } from "@/components/chapters/ChaptersList";

export const metadata = {
    title: "Mis capítulos | Dashboard",
};

export default async function DashboardChaptersPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    // Series del creador para el filtro
    const series = await prisma.series.findMany({
        where: { creatorId: session.user.id, isActive: true },
        select: { id: true, title: true, slug: true },
        orderBy: { title: "asc" },
    });

    const seriesIds = series.map((s) => s.id);

    // Todos los capítulos de sus series
    const chapters = await prisma.chapter.findMany({
        where: { seriesId: { in: seriesIds } },
        orderBy: { number: "asc" },
        select: {
            id: true,
            number: true,
            title: true,
            slug: true,
            isPublished: true,
            publishedAt: true,
            viewsCount: true,
            likesCount: true,
            seriesId: true,
            series: { select: { title: true, slug: true } },
        },
    });

    const totalChapters = chapters.length;

    // Serializar para client component
    const serialized = chapters.map((c) => ({
        id: c.id,
        number: Number(c.number),
        title: c.title,
        slug: c.slug,
        isPublished: c.isPublished,
        publishedAt: c.publishedAt?.toISOString() ?? null,
        viewsCount: c.viewsCount,
        likesCount: c.likesCount,
        seriesId: c.seriesId,
        seriesTitle: c.series.title,
        seriesSlug: c.series.slug,
    }));

    const seriesOptions = series.map((s) => ({ id: s.id, title: s.title }));

    return (
        <div className="min-h-screen" style={{ backgroundColor: "var(--color-layer-1)" }}>

            {/* ── Top bar ──────────────────────────────────────────────────────── */}
            <div
                style={{
                    backgroundColor: "var(--color-layer-0)",
                    borderBottom: "1px solid var(--color-layer-3)",
                    position: "sticky", top: 0, zIndex: 10,
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
                        <span style={{ color: "var(--color-text-2)" }}>Mis capítulos</span>
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
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    width: "2.25rem", height: "2.25rem",
                                    borderRadius: "var(--radius-lg)",
                                    backgroundColor: "var(--color-layer-3)",
                                }}
                            >
                                <BookBookmark size={18} weight="duotone" style={{ color: "var(--color-text-2)" }} />
                            </div>
                            <div>
                                <h1
                                    className="text-xl font-semibold"
                                    style={{ color: "var(--color-text-1)", letterSpacing: "-0.025em" }}
                                >
                                    Mis capítulos
                                </h1>
                                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-3)" }}>
                                    {totalChapters} {totalChapters === 1 ? "capítulo" : "capítulos"} en total
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/dashboard/chapters/new"
                            className="hover:opacity-85"
                            style={{
                                display: "flex", alignItems: "center", gap: "0.5rem",
                                padding: "0.5rem 1rem",
                                borderRadius: "var(--radius-md)",
                                backgroundColor: "var(--color-text-1)",
                                color: "var(--color-layer-1)",
                                fontSize: "0.875rem", fontWeight: 500,
                                textDecoration: "none",
                                transition: "opacity 0.15s",
                            }}
                        >
                            <Plus size={15} weight="bold" />
                            Nuevo capítulo
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Lista ────────────────────────────────────────────────────────── */}
            <div className="mx-auto max-w-3xl px-5 py-6 sm:px-8">
                <ChaptersList initialChapters={serialized} series={seriesOptions} />
            </div>
        </div>
    );
}