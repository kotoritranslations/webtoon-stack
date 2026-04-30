// src/app/dashboard/chapters/[id]/edit/page.tsx

import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChapterEditForm } from "@/components/chapters/ChapterEditForm";

export const metadata = {
    title: "Editar capítulo | Dashboard",
};

export default async function EditChapterPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const { id } = await params;

    const chapter = await prisma.chapter.findUnique({
        where: { id },
        include: {
            series: {
                select: { id: true, title: true, slug: true, creatorId: true },
            },
            pages: {
                orderBy: { order: "asc" },
                select: {
                    id: true,
                    order: true,
                    imageUrl: true,
                    imageKey: true,
                    fileSize: true,
                },
            },
        },
    });

    if (!chapter) notFound();
    if (chapter.series.creatorId !== session.user.id) notFound();

    const chapterData = {
        id: chapter.id,
        number: Number(chapter.number),
        title: chapter.title,
        authorNote: chapter.authorNote,
        isPublished: chapter.isPublished,
        seriesId: chapter.series.id,
        seriesTitle: chapter.series.title,
        pages: chapter.pages.map((p) => ({
            id: p.id,
            order: p.order,
            imageUrl: p.imageUrl,
            imageKey: p.imageKey,
            fileSize: p.fileSize,
        })),
    };

    const chapterLabel = `Cap. ${Number(chapter.number)}${chapter.title ? ` — ${chapter.title}` : ""}`;

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
                        <span
                            style={{
                                color: "var(--color-text-2)",
                                maxWidth: "180px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {chapterLabel}
                        </span>
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
                        Editar capítulo
                    </h1>
                    <div className="mt-1.5 flex items-center gap-1.5">
                        <Link
                            href={`/series/${chapter.series.slug}`}
                            className="text-sm transition-colors hover:text-[var(--color-text-2)]"
                            style={{ color: "var(--color-text-3)" }}
                        >
                            {chapter.series.title}
                        </Link>
                        <span style={{ color: "var(--color-text-3)", fontSize: "0.875rem" }}>·</span>
                        <span className="text-sm" style={{ color: "var(--color-text-3)" }}>
                            {chapterLabel}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Form ─────────────────────────────────────────────────────────── */}
            <div className="mx-auto max-w-2xl px-5 py-8 sm:px-8">
                <ChapterEditForm chapter={chapterData} />
            </div>
        </div>
    );
}