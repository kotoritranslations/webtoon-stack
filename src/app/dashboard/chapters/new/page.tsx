import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChapterCreateForm } from "@/components/chapters/ChapterCreateForm";

export const metadata = {
    title: "Nuevo capítulo | Dashboard",
};

export default async function NewChapterPage({
    searchParams,
}: {
    searchParams: Promise<{ seriesId?: string }>;
}) {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const { seriesId } = await searchParams;

    const series = await prisma.series.findMany({
        where: { creatorId: session.user.id, isActive: true },
        select: {
            id: true,
            title: true,
            slug: true,
            coverUrl: true,
            chaptersCount: true,
        },
        orderBy: { updatedAt: "desc" },
    });

    if (series.length === 0) {
        redirect("/dashboard/series/new");
    }

    const defaultSeriesId = series.find((s) => s.id === seriesId)?.id ?? series[0].id;

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
                <div className="mx-auto max-w-2xl px-5 py-4 sm:px-8">
                    <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-3)" }}>
                        <Link
                            href="/dashboard"
                            className="transition-colors hover:text-[var(--color-text-2)]"
                            style={{ color: "var(--color-text-3)" }}
                        >
                            Dashboard
                        </Link>
                        <span>/</span>
                        <Link
                            href="/dashboard/chapters"
                            className="transition-colors hover:text-[var(--color-text-2)]"
                            style={{ color: "var(--color-text-3)" }}
                        >
                            Capítulos
                        </Link>
                        <span>/</span>
                        <span style={{ color: "var(--color-text-2)" }}>Nuevo</span>
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
                <div className="mx-auto max-w-2xl px-5 pt-10 pb-8 sm:px-8">
                    <h1
                        className="text-2xl font-semibold"
                        style={{ color: "var(--color-text-1)", letterSpacing: "-0.025em" }}
                    >
                        Nuevo capítulo
                    </h1>
                    <p className="mt-1.5 text-sm" style={{ color: "var(--color-text-3)" }}>
                        Sube las páginas y elige la serie a la que pertenece.
                    </p>
                </div>
            </div>

            {/* ── Form ─────────────────────────────────────────────────────────── */}
            <div className="mx-auto max-w-2xl px-5 py-8 sm:px-8">
                <ChapterCreateForm series={series} defaultSeriesId={defaultSeriesId} />
            </div>
        </div>
    );
}