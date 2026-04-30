// src/app/page.tsx

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { BookOpen, Clock, Star, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { GenreBar } from "@/components/home/GenreBar";
import { SeriesCard } from "@/components/home/SeriesCard";
import { ChapterCard } from "@/components/home/ChapterCard";
import { ContinueReading } from "@/components/home/ContinueReading";

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

async function getGenres() {
  return prisma.genre.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, color: true },
  });
}

async function getFeaturedSeries() {
  return prisma.series.findMany({
    where: { isPublished: true, isActive: true, coverUrl: { not: null } },
    orderBy: [{ bookmarksCount: "desc" }, { viewsCount: "desc" }],
    take: 12,
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

async function getContinueReading(userId: string) {
  const history = await prisma.readHistory.findMany({
    where: { userId, completed: false },
    orderBy: { updatedAt: "desc" },
    take: 6,
    select: {
      lastPageOrder: true,
      updatedAt: true,
      chapter: {
        select: {
          id: true,
          number: true,
          title: true,
          slug: true,
          series: {
            select: {
              slug: true,
              title: true,
              coverUrl: true,
              chaptersCount: true,
            },
          },
        },
      },
    },
  });

  return history.map((h) => ({
    ...h,
    chapter: { ...h.chapter, number: Number(h.chapter.number) },
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
    <div className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span style={{ color: "var(--color-accent)" }}>{icon}</span>
        <h2
          className="text-base font-semibold tracking-tight"
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

// ─── Featured series ──────────────────────────────────────────────────────────

async function FeaturedSeriesSection() {
  const series = await getFeaturedSeries();
  if (series.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
      <SectionHeader
        icon={<Star size={16} weight="fill" />}
        title="Series destacadas"
        href="/explore"
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {series.map((s) => (
          <SeriesCard key={s.id} series={s} />
        ))}
      </div>
    </section>
  );
}

// ─── Recent chapters ──────────────────────────────────────────────────────────

async function RecentChaptersSection() {
  const chapters = await getRecentChapters();

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <SectionHeader
        icon={<Clock size={16} weight="fill" />}
        title="Últimos capítulos"
        href="/explore?sort=latest"
      />
      {chapters.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
        </div>
      )}
    </section>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-[12px] py-20 text-center"
      style={{ backgroundColor: "var(--color-layer-2)" }}
    >
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-[8px]"
        style={{ backgroundColor: "var(--color-layer-3)" }}
      >
        <BookOpen size={22} style={{ color: "var(--color-text-3)" }} />
      </div>
      <p className="text-sm font-medium" style={{ color: "var(--color-text-1)" }}>
        Aún no hay capítulos publicados
      </p>
      <p className="mt-1 text-xs" style={{ color: "var(--color-text-3)" }}>
        Vuelve pronto, los creadores están trabajando en ello.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [session, genres] = await Promise.all([auth(), getGenres()]);

  const continueReading = session?.user?.id
    ? await getContinueReading(session.user.id)
    : [];

  return (
    <div style={{ backgroundColor: "var(--color-layer-1)" }}>
      {/* GenreBar sticky — ahora es lo primero */}
      <div
        className="sticky top-0 z-10"
        style={{
          backgroundColor: "var(--color-layer-1)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <GenreBar genres={genres} />
      </div>

      <div className="pt-8">
        {continueReading.length > 0 && (
          <ContinueReading items={continueReading} />
        )}
        <FeaturedSeriesSection />
        <RecentChaptersSection />
      </div>
    </div>
  );
}