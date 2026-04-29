import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ChapterReader } from "@/components/reader/ChapterReader";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string; chapterNumber: string }>;
}) {
    const { slug, chapterNumber } = await params;
    const chapter = await prisma.chapter.findFirst({
        where: {
            number: Number(chapterNumber),
            series: { slug, isPublished: true, isActive: true },
            isPublished: true,
        },
        select: {
            number: true,
            title: true,
            series: { select: { title: true } },
        },
    });
    if (!chapter) return {};
    const chapterLabel = `Cap. ${Number(chapter.number)}${chapter.title ? ` — ${chapter.title}` : ""}`;
    return {
        title: `${chapterLabel} · ${chapter.series.title}`,
    };
}

export default async function ChapterPage({
    params,
}: {
    params: Promise<{ slug: string; chapterNumber: string }>;
}) {
    const { slug, chapterNumber } = await params;

    const chapter = await prisma.chapter.findFirst({
        where: {
            number: Number(chapterNumber),
            isPublished: true,
            series: { slug, isPublished: true, isActive: true },
        },
        include: {
            pages: { orderBy: { order: "asc" } },
            series: {
                select: {
                    id: true,
                    slug: true,
                    title: true,
                    coverUrl: true,
                    readingDir: true,
                },
            },
        },
    });

    if (!chapter) notFound();

    const [prevChapter, nextChapter] = await Promise.all([
        prisma.chapter.findFirst({
            where: {
                seriesId: chapter.series.id,
                isPublished: true,
                number: { lt: chapter.number },
            },
            orderBy: { number: "desc" },
            select: { number: true, title: true },
        }),
        prisma.chapter.findFirst({
            where: {
                seriesId: chapter.series.id,
                isPublished: true,
                number: { gt: chapter.number },
            },
            orderBy: { number: "asc" },
            select: { number: true, title: true },
        }),
    ]);

    const pages = chapter.pages.map((p) => ({
        id: p.id,
        order: p.order,
        imageUrl: p.imageUrl,
        width: p.width,
        height: p.height,
    }));

    return (
        <ChapterReader
            seriesSlug={slug}
            seriesTitle={chapter.series.title}
            chapterNumber={Number(chapter.number)}
            chapterTitle={chapter.title}
            authorNote={chapter.authorNote}
            pages={pages}
            prevChapter={
                prevChapter
                    ? { number: Number(prevChapter.number), title: prevChapter.title }
                    : null
            }
            nextChapter={
                nextChapter
                    ? { number: Number(nextChapter.number), title: nextChapter.title }
                    : null
            }
        />
    );
}