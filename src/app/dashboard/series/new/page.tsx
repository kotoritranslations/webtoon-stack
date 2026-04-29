// src/app/dashboard/series/new/page.tsx

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SeriesCreateForm } from "@/components/series/SeriesCreateForm";

export const metadata = {
    title: "Nueva serie | Dashboard",
    description: "Crea una nueva serie de webtoon, manga o cómic",
};

export default async function NewSeriesPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    // Verificar que el usuario existe y es creador
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true },
    });

    if (!user) redirect("/login");

    // Géneros activos para el selector
    const genres = await prisma.genre.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true, color: true },
        orderBy: { name: "asc" },
    });

    return (
        <div className="min-h-screen" style={{ backgroundColor: "var(--color-layer-1)" }}>

            {/* ── Top bar ──────────────────────────────────────────────────────────── */}
            <div
                style={{
                    backgroundColor: "var(--color-layer-0)",
                    borderBottom: "1px solid var(--color-layer-3)",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                }}
            >
                <div className="mx-auto max-w-2xl px-5 py-4 sm:px-8">
                    <div className="flex items-center justify-between">
                        <div
                            className="flex items-center gap-2 text-sm"
                            style={{ color: "var(--color-text-3)" }}
                        >
                            <Link
                                href="/dashboard"
                                className="transition-colors hover:text-[var(--color-text-2)]"
                                style={{ color: "var(--color-text-3)" }}
                            >
                                Dashboard
                            </Link>
                            <span>/</span>
                            <Link
                                href="/dashboard/series"
                                className="transition-colors hover:text-[var(--color-text-2)]"
                                style={{ color: "var(--color-text-3)" }}
                            >
                                Series
                            </Link>
                            <span>/</span>
                            <span style={{ color: "var(--color-text-2)" }}>Nueva</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Header ───────────────────────────────────────────────────────────── */}
            <div
                style={{
                    backgroundColor: "var(--color-layer-0)",
                    borderBottom: "1px solid var(--color-layer-3)",
                }}
            >
                <div className="mx-auto max-w-2xl px-5 pt-10 pb-8 sm:px-8">
                    <h1
                        className="text-2xl font-semibold"
                        style={{ color: "var(--color-text-1)", letterSpacing: "-0.025em" }}
                    >
                        Nueva serie
                    </h1>
                    <p className="mt-1.5 text-sm" style={{ color: "var(--color-text-3)" }}>
                        Completa la información para publicar tu serie.
                    </p>
                </div>
            </div>

            {/* ── Formulario ───────────────────────────────────────────────────────── */}
            <div className="mx-auto max-w-2xl px-5 py-8 sm:px-8">
                <SeriesCreateForm genres={genres} />
            </div>
        </div>
    );
}