// src/app/page.tsx

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Clock, Star, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { ChapterCard } from "@/components/home/ChapterCard";
import { FeaturedSlider } from "@/components/home/FeaturedSlider";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: `${siteConfig.name} — ${siteConfig.description}`,
  description: siteConfig.tagline,
};

export const revalidate = 300;

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

async function getFeaturedSeries() {
  return prisma.series.findMany({
    where: { isPublished: true, isActive: true, coverUrl: { not: null } },
    orderBy: { createdAt: "desc" }, // ← más recientes
    take: 7,                        // ← solo 7
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
  const series = await prisma.series.findMany({
    where: { isPublished: true, isActive: true, coverUrl: { not: null } },
    orderBy: { updatedAt: "desc" },
    take: 18,
    select: {
      id: true,
      slug: true,
      title: true,
      coverUrl: true,
      chapters: {
        where: { isPublished: true },
        orderBy: { number: "desc" },
        take: 2,
        select: {
          number: true,
          title: true,
          publishedAt: true,
        },
      },
    },
  });

  return series.filter((s) => s.chapters.length > 0);
}

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

export default async function HomePage() {
  const [series, recentSeries] = await Promise.all([
    getFeaturedSeries(),
    getRecentChapters(),
  ]);

  return (
    <div
      className="flex flex-col gap-10 py-8"
      style={{ backgroundColor: "var(--color-layer-1)" }}
    >
      <section>
        <FeaturedSlider items={series} />
      </section>

      <section>
        <div className="mx-auto w-full max-w-[1280px] grid grid-cols-2 gap-3 px-4 sm:grid-cols-3 sm:px-6 md:grid-cols-4 lg:grid-cols-6">
          {recentSeries.map((s) => (
            <ChapterCard
              key={s.id}
              seriesHref={`/series/${s.slug}`}
              coverUrl={s.coverUrl}
              seriesTitle={s.title}
              chapters={s.chapters.map((ch) => ({
                number: Number(ch.number),
                title: ch.title,
                publishedAt: ch.publishedAt,
                timeAgo: ch.publishedAt ? timeAgo(ch.publishedAt) : "—",
              }))}
            />
          ))}
        </div>
      </section>
    </div>
  );
}