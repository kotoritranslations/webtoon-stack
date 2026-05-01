// src/app/page.tsx

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Clock, Star, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { SeriesCard } from "@/components/home/SeriesCard";
import { ChapterCard } from "@/components/home/ChapterCard";
import { FeaturedSlider } from "@/components/home/FeaturedSlider";
import { HorizontalSlider } from "@/components/home/HorizontalSlider";

export const metadata = {
  title: "SITE — Lee series gratis",
  description:
    "Descubre miles de series de webtoon, manga y cómics. Lee los últimos capítulos publicados por tus creadores favoritos.",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `hace ${days}d`;
  return `hace ${Math.floor(days / 30)} mes`;
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getFeaturedSeries() {
  return prisma.series.findMany({
    where: { isPublished: true, isActive: true, coverUrl: { not: null } },
    orderBy: [{ bookmarksCount: "desc" }, { viewsCount: "desc" }],
    take: 18,
    select: {
      id: true,
      slug: true,
      title: true,
      synopsis: true,
      coverUrl: true,
      status: true,
      format: true,
      viewsCount: true,
      likesCount: true,
      chaptersCount: true,
      creator: { select: { username: true, displayName: true, avatar: true } },
      genres: {
        take: 2,
        select: { genre: { select: { name: true, color: true, slug: true } } },
      },
    },
  });
}

async function getRecentChapters() {
  const chapters = await prisma.chapter.findMany({
    where: {
      isPublished: true,
      series: { isPublished: true, isActive: true },
    },
    orderBy: { publishedAt: "desc" },
    take: 18,
    select: {
      id: true,
      number: true,
      title: true,
      slug: true,
      publishedAt: true,
      viewsCount: true,
      series: {
        select: {
          slug: true,
          title: true,
          coverUrl: true,
          creator: { select: { username: true } },
          genres: {
            take: 1,
            select: { genre: { select: { name: true, color: true } } },
          },
        },
      },
    },
  });

  return chapters.map((c) => ({
    ...c,
    number: Number(c.number),
    publishedAt: c.publishedAt ?? null,
  }));
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  href,
  hrefLabel = "Ver todo",
}: {
  icon: React.ReactNode;
  title: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <span style={{ color: "var(--color-accent)" }}>{icon}</span>
        <h2
          className="text-sm font-semibold tracking-tight"
          style={{ color: "var(--color-text-1)" }}
        >
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
          style={{ color: "var(--color-text-3)" }}
        >
          {hrefLabel}
          <ArrowRight size={12} />
        </Link>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [series, chapters] = await Promise.all([
    getFeaturedSeries(),
    getRecentChapters(),
  ]);

  return (
    <div
      className="flex flex-col gap-10 py-8"
      style={{ backgroundColor: "var(--color-layer-1)" }}
    >
      {/* Series destacadas */}
      <section>
        <SectionHeader
          icon={<Star size={15} weight="fill" />}
          title="Series destacadas"
          href="/library"
        />
        <FeaturedSlider items={series} />
      </section>

      {/* Últimos capítulos */}
      <section>
        <SectionHeader
          icon={<Clock size={15} weight="fill" />}
          title="Últimos capítulos"
          href="/chapters"
        />
        <HorizontalSlider>
          {chapters.map((chapter) => {
            const genre = chapter.series.genres[0]?.genre ?? null;
            const href = `/series/${chapter.series.slug}/chapter/${chapter.number}`;
            return (
              <ChapterCard
                key={chapter.id}
                href={href}
                coverUrl={chapter.series.coverUrl}
                seriesTitle={chapter.series.title}
                chapterNumber={chapter.number}
                chapterTitle={chapter.title}
                viewsCount={chapter.viewsCount}
                timeAgo={chapter.publishedAt ? timeAgo(chapter.publishedAt) : "—"}
                genre={genre}
              />
            );
          })}
        </HorizontalSlider>
      </section>
    </div>
  );
}