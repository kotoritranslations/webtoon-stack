"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    TwitterLogo,
    InstagramLogo,
    YoutubeLogo,
    TiktokLogo,
    Globe,
    UserPlus,
    UserMinus,
    BookOpen,
    Users,
    Clock,
} from "@phosphor-icons/react";
import type { CreatorProfile, SeriesItem, RecentChapterItem } from "@/app/[username]/page";

// ============================================
// HELPERS
// ============================================

function timeAgo(dateStr: string | null): string {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `hace ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `hace ${days}d`;
    const months = Math.floor(days / 30);
    return `hace ${months} mes${months > 1 ? "es" : ""}`;
}

function formatCount(n: number): string {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
    ongoing: { label: "En curso", color: "#22c55e" },
    completed: { label: "Completado", color: "#3b82f6" },
    hiatus: { label: "En pausa", color: "#f59e0b" },
    canceled: { label: "Cancelado", color: "#ef4444" },
};

// ============================================
// PROPS
// ============================================

interface CreatorProfileClientProps {
    creator: CreatorProfile;
    seriesList: SeriesItem[];
    recentChapters: RecentChapterItem[];
    initialTab: "series" | "chapters";
    initialIsFollowing: boolean;
    isOwner: boolean;
    isAuthenticated: boolean;
}

// ============================================
// SUB-COMPONENTS
// ============================================

function SeriesCard({ series, username }: { series: SeriesItem; username: string }) {
    const statusInfo = STATUS_LABEL[series.status] ?? { label: series.status, color: "#6b7280" };
    const mainGenre = series.genres[0]?.genre;

    return (
        <Link
            href={`/${username}/${series.slug}`}
            className="group flex flex-col overflow-hidden rounded-[10px] transition-transform duration-200 hover:-translate-y-0.5"
            style={{ backgroundColor: "var(--color-layer-2)" }}
        >
            {/* Cover */}
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-900">
                {series.coverUrl ? (
                    <Image
                        src={series.coverUrl}
                        alt={series.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                ) : (
                    <div
                        className="flex h-full w-full items-center justify-center"
                        style={{ backgroundColor: "var(--color-layer-3)" }}
                    >
                        <BookOpen size={32} style={{ color: "var(--color-text-3)" }} />
                    </div>
                )}

                {/* Status badge */}
                <div className="absolute left-2 top-2">
                    <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                        style={{ backgroundColor: statusInfo.color }}
                    >
                        {statusInfo.label}
                    </span>
                </div>

                {/* Genre badge */}
                {mainGenre && (
                    <div className="absolute bottom-2 left-2">
                        <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                            style={{ backgroundColor: mainGenre.color ?? "#6b7280" }}
                        >
                            {mainGenre.name}
                        </span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-1 p-3">
                <h3
                    className="line-clamp-2 text-[13px] font-semibold leading-snug"
                    style={{ color: "var(--color-text-1)" }}
                >
                    {series.title}
                </h3>
                <div
                    className="flex items-center gap-2 text-[11px]"
                    style={{ color: "var(--color-text-3)" }}
                >
                    <span>{series.chaptersCount} caps.</span>
                    <span>·</span>
                    <span>{formatCount(series.viewsCount)} vistas</span>
                </div>
            </div>
        </Link>
    );
}

function ChapterRow({ chapter, username }: { chapter: RecentChapterItem; username: string }) {
    const mainGenre = chapter.series.genres[0]?.genre;

    return (
        <Link
            href={`/${username}/${chapter.series.slug}/${chapter.slug}`}
            className="group flex items-center gap-3 rounded-[10px] p-3 transition-colors"
            style={{ backgroundColor: "var(--color-layer-2)" }}
        >
            {/* Series cover thumbnail */}
            <div className="relative h-14 w-10 flex-shrink-0 overflow-hidden rounded-[6px] bg-gray-900">
                {chapter.series.coverUrl ? (
                    <Image
                        src={chapter.series.coverUrl}
                        alt={chapter.series.title}
                        fill
                        className="object-cover"
                        sizes="40px"
                    />
                ) : (
                    <div
                        className="flex h-full w-full items-center justify-center"
                        style={{ backgroundColor: "var(--color-layer-3)" }}
                    >
                        <BookOpen size={14} style={{ color: "var(--color-text-3)" }} />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p
                    className="truncate text-[12px] font-medium"
                    style={{ color: "var(--color-text-3)" }}
                >
                    {chapter.series.title}
                    {mainGenre && (
                        <span
                            className="ml-1.5 inline-block rounded-full px-1.5 py-px text-[10px] font-medium text-white"
                            style={{ backgroundColor: mainGenre.color ?? "#6b7280" }}
                        >
                            {mainGenre.name}
                        </span>
                    )}
                </p>
                <p
                    className="truncate text-[13px] font-semibold"
                    style={{ color: "var(--color-text-1)" }}
                >
                    Cap. {chapter.number}
                    {chapter.title ? ` — ${chapter.title}` : ""}
                </p>
            </div>

            {/* Meta */}
            <div
                className="flex flex-shrink-0 flex-col items-end gap-0.5 text-[11px]"
                style={{ color: "var(--color-text-3)" }}
            >
                <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {timeAgo(chapter.publishedAt)}
                </span>
                <span>{formatCount(chapter.viewsCount)} vistas</span>
            </div>
        </Link>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function CreatorProfileClient({
    creator,
    seriesList,
    recentChapters,
    initialTab,
    initialIsFollowing,
    isOwner,
    isAuthenticated,
}: CreatorProfileClientProps) {
    const [tab, setTab] = useState<"series" | "chapters">(initialTab);
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isPending, startTransition] = useTransition();

    const socials = [
        { key: "twitter", href: creator.socialTwitter, Icon: TwitterLogo },
        { key: "instagram", href: creator.socialInstagram, Icon: InstagramLogo },
        { key: "youtube", href: creator.socialYoutube, Icon: YoutubeLogo },
        { key: "tiktok", href: creator.socialTiktok, Icon: TiktokLogo },
        { key: "website", href: creator.socialWebsite, Icon: Globe },
    ].filter((s) => s.href);

    async function handleFollow() {
        if (!isAuthenticated) {
            window.location.href = "/login";
            return;
        }

        // Optimistic update
        setIsFollowing((prev) => !prev);

        startTransition(async () => {
            try {
                const res = await fetch(`/api/creators/${creator.username}/follow`, {
                    method: isFollowing ? "DELETE" : "POST",
                });
                if (!res.ok) {
                    // Revert on error
                    setIsFollowing((prev) => !prev);
                }
            } catch {
                setIsFollowing((prev) => !prev);
            }
        });
    }

    return (
        <div className="mx-auto max-w-3xl pb-16">
            {/* ── BANNER ── */}
            <div className="relative h-40 w-full overflow-hidden sm:h-52" style={{ backgroundColor: "var(--color-layer-2)" }}>
                {creator.banner ? (
                    <Image
                        src={creator.banner}
                        alt="Banner"
                        fill
                        className="object-cover"
                        priority
                        sizes="100vw"
                    />
                ) : (
                    <div
                        className="h-full w-full"
                        style={{
                            background:
                                "linear-gradient(135deg, var(--color-layer-3) 0%, var(--color-layer-2) 100%)",
                        }}
                    />
                )}
            </div>

            {/* ── HEADER INFO ── */}
            <div className="px-4 sm:px-6">
                {/* Avatar row */}
                <div className="flex items-end justify-between">
                    {/* Avatar */}
                    <div
                        className="relative -mt-10 h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border-4 sm:-mt-12 sm:h-24 sm:w-24"
                        style={{ borderColor: "var(--color-layer-1)" }}
                    >
                        {creator.avatar ? (
                            <Image
                                src={creator.avatar}
                                alt={creator.displayName ?? creator.username}
                                fill
                                className="object-cover"
                                sizes="96px"
                            />
                        ) : (
                            <div
                                className="flex h-full w-full items-center justify-center text-2xl font-bold uppercase"
                                style={{
                                    backgroundColor: "var(--color-layer-3)",
                                    color: "var(--color-text-2)",
                                }}
                            >
                                {(creator.displayName ?? creator.username).charAt(0)}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="mb-1 flex items-center gap-2">
                        {isOwner ? (
                            <Link
                                href="/dashboard/settings"
                                className="rounded-[8px] px-4 py-2 text-[13px] font-semibold transition-colors"
                                style={{
                                    backgroundColor: "var(--color-layer-3)",
                                    color: "var(--color-text-1)",
                                }}
                            >
                                Editar perfil
                            </Link>
                        ) : (
                            <button
                                onClick={handleFollow}
                                disabled={isPending}
                                className="flex items-center gap-1.5 rounded-[8px] px-4 py-2 text-[13px] font-semibold transition-all disabled:opacity-60"
                                style={
                                    isFollowing
                                        ? {
                                            backgroundColor: "var(--color-layer-3)",
                                            color: "var(--color-text-1)",
                                        }
                                        : {
                                            backgroundColor: "var(--color-accent)",
                                            color: "#fff",
                                        }
                                }
                            >
                                {isFollowing ? (
                                    <>
                                        <UserMinus size={15} weight="bold" />
                                        Siguiendo
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={15} weight="bold" />
                                        Seguir
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Name + username */}
                <div className="mt-3">
                    <h1
                        className="text-[18px] font-bold tracking-tight sm:text-[20px]"
                        style={{ color: "var(--color-text-1)" }}
                    >
                        {creator.displayName ?? creator.username}
                    </h1>
                    <p className="text-[13px]" style={{ color: "var(--color-text-3)" }}>
                        @{creator.username}
                    </p>
                </div>

                {/* Bio */}
                {creator.bio && (
                    <p
                        className="mt-2.5 max-w-xl text-[13px] leading-relaxed"
                        style={{ color: "var(--color-text-2)" }}
                    >
                        {creator.bio}
                    </p>
                )}

                {/* Stats */}
                <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <Users size={14} style={{ color: "var(--color-text-3)" }} />
                        <span className="text-[13px] font-semibold" style={{ color: "var(--color-text-1)" }}>
                            {formatCount(creator.followersCount)}
                        </span>
                        <span className="text-[13px]" style={{ color: "var(--color-text-3)" }}>
                            seguidores
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <BookOpen size={14} style={{ color: "var(--color-text-3)" }} />
                        <span className="text-[13px] font-semibold" style={{ color: "var(--color-text-1)" }}>
                            {creator.totalSeries}
                        </span>
                        <span className="text-[13px]" style={{ color: "var(--color-text-3)" }}>
                            series
                        </span>
                    </div>
                </div>

                {/* Socials */}
                {socials.length > 0 && (
                    <div className="mt-3 flex items-center gap-3">
                        {socials.map(({ key, href, Icon }) => (
                            <a
                                key={key}
                                href={href!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="transition-opacity hover:opacity-70"
                                style={{ color: "var(--color-text-3)" }}
                            >
                                <Icon size={18} />
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {/* ── TABS ── */}
            <div
                className="mt-6 flex border-b px-4 sm:px-6"
                style={{ borderColor: "var(--color-border)" }}
            >
                {(["series", "chapters"] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className="relative mr-6 pb-3 text-[13px] font-semibold transition-colors"
                        style={{
                            color: tab === t ? "var(--color-text-1)" : "var(--color-text-3)",
                        }}
                    >
                        {t === "series" ? "Series" : "Últimos capítulos"}
                        {tab === t && (
                            <span
                                className="absolute bottom-0 left-0 h-0.5 w-full rounded-full"
                                style={{ backgroundColor: "var(--color-accent)" }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* ── CONTENT ── */}
            <div className="mt-5 px-4 sm:px-6">
                {tab === "series" && (
                    <>
                        {seriesList.length === 0 ? (
                            <EmptyState
                                icon={<BookOpen size={24} style={{ color: "var(--color-text-3)" }} />}
                                title="Sin series publicadas"
                                sub="Este creador aún no ha publicado ninguna serie"
                            />
                        ) : (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                {seriesList.map((series) => (
                                    <SeriesCard key={series.id} series={series} username={creator.username} />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {tab === "chapters" && (
                    <>
                        {recentChapters.length === 0 ? (
                            <EmptyState
                                icon={<Clock size={24} style={{ color: "var(--color-text-3)" }} />}
                                title="Sin capítulos recientes"
                                sub="No hay capítulos publicados todavía"
                            />
                        ) : (
                            <div className="flex flex-col gap-2">
                                {recentChapters.map((chapter) => (
                                    <ChapterRow key={chapter.id} chapter={chapter} username={creator.username} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function EmptyState({
    icon,
    title,
    sub,
}: {
    icon: React.ReactNode;
    title: string;
    sub: string;
}) {
    return (
        <div
            className="flex flex-col items-center justify-center rounded-[10px] py-24 text-center"
            style={{ backgroundColor: "var(--color-layer-2)" }}
        >
            <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-[8px]"
                style={{ backgroundColor: "var(--color-layer-3)" }}
            >
                {icon}
            </div>
            <h3
                className="text-[14px] font-semibold"
                style={{ color: "var(--color-text-1)" }}
            >
                {title}
            </h3>
            <p
                className="mt-1.5 max-w-xs text-[13px] leading-relaxed"
                style={{ color: "var(--color-text-3)" }}
            >
                {sub}
            </p>
        </div>
    );
}