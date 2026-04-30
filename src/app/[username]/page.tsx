// app/[username]/page.tsx

import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreatorProfileClient } from "@/components/creator/CreatorProfileClient";

// ============================================
// TIPOS
// ============================================

export interface SeriesItem {
  id: string;
  slug: string;
  title: string;
  synopsis: string | null;
  coverUrl: string | null;
  status: string;
  format: string;
  viewsCount: number;
  likesCount: number;
  chaptersCount: number;
  bookmarksCount: number;
  genres: { genre: { id: string; name: string; slug: string; color: string | null } }[];
  creator: {
    id: string;
    username: string | null;
    displayName: string | null;
    avatar: string | null;
  };
}

export interface RecentChapterItem {
  id: string;
  number: number;
  title: string | null;
  slug: string;
  publishedAt: string | null;
  viewsCount: number;
  series: {
    id: string;
    slug: string;
    title: string;
    coverUrl: string | null;
    genres: { genre: { name: string; color: string | null } }[];
  };
}

export interface CreatorProfile {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatar: string | null;
  banner: string | null;
  followersCount: number;
  totalSeries: number;
  socialTwitter: string | null;
  socialInstagram: string | null;
  socialYoutube: string | null;
  socialTiktok: string | null;
  socialWebsite: string | null;
  createdAt: string;
}

// ============================================
// FETCH DATA
// ============================================

async function getCreatorData(username: string) {
  const creator = await prisma.user.findFirst({
    where: { username, isCreator: true },
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      avatar: true,
      image: true,
      banner: true,
      followersCount: true,
      totalSeries: true,
      socialTwitter: true,
      socialInstagram: true,
      socialYoutube: true,
      socialTiktok: true,
      socialWebsite: true,
      createdAt: true,
    },
  });

  return creator;
}

async function getSeriesList(creatorId: string): Promise<SeriesItem[]> {
  const series = await prisma.series.findMany({
    where: { creatorId, isPublished: true, isActive: true },
    orderBy: { updatedAt: "desc" },
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
      bookmarksCount: true,
      genres: {
        select: {
          genre: {
            select: { id: true, name: true, slug: true, color: true },
          },
        },
      },
      creator: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
        },
      },
    },
  });

  return series;
}

async function getRecentChapters(creatorId: string): Promise<RecentChapterItem[]> {
  const chapters = await prisma.chapter.findMany({
    where: {
      series: { creatorId, isPublished: true, isActive: true },
      isPublished: true,
    },
    orderBy: { publishedAt: "desc" },
    take: 20,
    select: {
      id: true,
      number: true,
      title: true,
      slug: true,
      publishedAt: true,
      viewsCount: true,
      series: {
        select: {
          id: true,
          slug: true,
          title: true,
          coverUrl: true,
          genres: {
            take: 1,
            select: {
              genre: { select: { name: true, color: true } },
            },
          },
        },
      },
    },
  });

  return chapters.map((c) => ({
    ...c,
    number: Number(c.number),
    publishedAt: c.publishedAt?.toISOString() ?? null,
  }));
}

async function getFollowStatus(userId: string, creatorId: string) {
  const follow = await prisma.follow.findUnique({
    where: { userId_creatorId: { userId, creatorId } },
    select: { id: true },
  });
  return !!follow;
}

// ============================================
// PAGE
// ============================================

interface PageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function CreatorPage({ params, searchParams }: PageProps) {
  const { username } = await params;
  const { tab } = await searchParams;

  const [session, creator] = await Promise.all([auth(), getCreatorData(username)]);

  if (!creator) notFound();

  const userId = session?.user?.id as string | undefined;
  const isOwner = userId === creator.id;
  const isAuthenticated = !!session?.user;

  const [seriesList, recentChapters, isFollowing] = await Promise.all([
    getSeriesList(creator.id),
    getRecentChapters(creator.id),
    userId && !isOwner ? getFollowStatus(userId, creator.id) : Promise.resolve(false),
  ]);

  const creatorProfile: CreatorProfile = {
    ...creator,
    username: creator.username ?? username,
    avatar: creator.avatar ?? creator.image ?? null,
    createdAt: creator.createdAt.toISOString(),
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-layer-1)" }}>
      <CreatorProfileClient
        creator={creatorProfile}
        seriesList={seriesList}
        recentChapters={recentChapters}
        initialTab={(tab === "chapters" ? "chapters" : "series") as "series" | "chapters"}
        initialIsFollowing={isFollowing}
        isOwner={isOwner}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}

// ============================================
// METADATA
// ============================================

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params;

  const creator = await prisma.user.findFirst({
    where: { username, isCreator: true },
    select: { displayName: true, username: true, bio: true },
  });

  if (!creator) return { title: "Creador no encontrado" };

  const name = creator.displayName || creator.username;

  return {
    title: `${name} — SITE`,
    description: creator.bio || `Perfil de ${name}. Descubre sus series y últimos capítulos.`,
    openGraph: {
      title: `${name} — SITE`,
      description: creator.bio || `Perfil de ${name}`,
    },
  };
}