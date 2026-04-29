"use client";

// src/components/notifications/NotificationsDropdown.tsx

import { useEffect, useRef, useState, useCallback } from "react";
import { Bell, Check, ArrowsClockwise } from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface NotificationData {
    actorId?: string;
    actorAvatar?: string;
    seriesSlug?: string;
    chapterSlug?: string;
    chapterId?: string;
    commentId?: string;
    [key: string]: unknown;
}

interface Notification {
    id: string;
    type: string;
    title: string;
    body: string;
    isRead: boolean;
    createdAt: string;
    data: NotificationData | null;
}

interface ApiResponse {
    notifications: Notification[];
    nextCursor: string | null;
    unreadCount: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "ahora";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d`;
    return new Date(dateStr).toLocaleDateString("es", { day: "numeric", month: "short" });
}

function notificationHref(n: Notification): string {
    const d = n.data;
    if (!d) return "#";
    if (n.type === "new_follower" && d.actorId) return `/${d.actorId}`;
    if (n.type === "new_chapter" && d.seriesSlug && d.chapterSlug)
        return `/series/${d.seriesSlug}/${d.chapterSlug}`;
    if ((n.type === "new_comment" || n.type === "comment_reply") && d.seriesSlug)
        return `/series/${d.seriesSlug}`;
    return "#";
}

function NotifIcon({ type, avatar }: { type: string; avatar?: string }) {
    const size = 32;

    if (avatar) {
        return (
            <Image
                src={avatar}
                alt=""
                width={size}
                height={size}
                className="rounded-full object-cover flex-shrink-0"
                style={{ width: size, height: size }}
            />
        );
    }

    const iconMap: Record<string, { bg: string; color: string; label: string }> = {
        new_follower: { bg: "var(--color-layer-3)", color: "var(--color-text-2)", label: "👤" },
        new_chapter: { bg: "var(--color-layer-3)", color: "var(--color-text-2)", label: "📖" },
        new_comment: { bg: "var(--color-layer-3)", color: "var(--color-text-2)", label: "💬" },
        comment_reply: { bg: "var(--color-layer-3)", color: "var(--color-text-2)", label: "↩" },
    };

    const cfg = iconMap[type] ?? iconMap.new_follower;

    return (
        <div
            className="flex items-center justify-center rounded-full text-[13px] flex-shrink-0"
            style={{ width: size, height: size, backgroundColor: cfg.bg, color: cfg.color }}
        >
            {cfg.label}
        </div>
    );
}

// ─── Componente principal ─────────────────────────────────────────────────────

const POLL_INTERVAL = 60_000; // 1 minuto

export function NotificationsDropdown() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [markingAll, setMarkingAll] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── Fetch ─────────────────────────────────────────────────────────────────

    const fetchNotifications = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await fetch("/api/notifications?unread=false");
            if (!res.ok) return;
            const data: ApiResponse = await res.json();
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch {
            // silencioso
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    // ── Polling ───────────────────────────────────────────────────────────────

    useEffect(() => {
        fetchNotifications(true); // fetch inicial silencioso

        intervalRef.current = setInterval(() => {
            fetchNotifications(true);
        }, POLL_INTERVAL);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [fetchNotifications]);

    // ── Click outside ─────────────────────────────────────────────────────────

    useEffect(() => {
        if (!open) return;
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    // ── Al abrir, re-fetch para datos frescos ─────────────────────────────────

    const handleOpen = () => {
        setOpen((prev) => {
            if (!prev) fetchNotifications(false);
            return !prev;
        });
    };

    // ── Marcar una como leída ─────────────────────────────────────────────────

    const markRead = async (id: string) => {
        // Optimistic update
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        await fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "mark_read", id }),
        });
    };

    // ── Marcar todas como leídas ──────────────────────────────────────────────

    const markAllRead = async () => {
        if (unreadCount === 0) return;
        setMarkingAll(true);
        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "mark_all_read" }),
            });
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } finally {
            setMarkingAll(false);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell button */}
            <button
                type="button"
                onClick={handleOpen}
                className="relative flex items-center justify-center rounded-full transition-opacity opacity-70 hover:opacity-100 focus:outline-none"
                style={{ width: 28, height: 28 }}
                aria-label="Notificaciones"
            >
                <Bell size={17} style={{ color: "var(--color-text-2)" }} />
                {unreadCount > 0 && (
                    <span
                        className="absolute flex items-center justify-center rounded-full text-[9px] font-bold leading-none"
                        style={{
                            top: 0,
                            right: 0,
                            minWidth: 14,
                            height: 14,
                            padding: "0 3px",
                            backgroundColor: "#E84040",
                            color: "#fff",
                        }}
                    >
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div
                    className="absolute right-0 z-[100] flex flex-col overflow-hidden"
                    style={{
                        top: "calc(100% + 6px)",
                        width: 320,
                        maxHeight: 480,
                        backgroundColor: "var(--color-layer-2)",
                        border: "1px solid var(--color-layer-3)",
                        borderRadius: "var(--radius-xl)",
                    }}
                >
                    {/* Header */}
                    <div
                        className="flex items-center justify-between px-3 py-2.5 flex-shrink-0"
                        style={{ borderBottom: "1px solid var(--color-layer-3)" }}
                    >
                        <span
                            className="text-[13px] font-semibold tracking-[-0.01em]"
                            style={{ color: "var(--color-text-1)" }}
                        >
                            Notificaciones
                        </span>

                        <div className="flex items-center gap-1">
                            {/* Refresh manual */}
                            <button
                                type="button"
                                onClick={() => fetchNotifications(false)}
                                disabled={loading}
                                className="flex items-center justify-center rounded opacity-50 hover:opacity-100 transition-opacity focus:outline-none"
                                style={{ width: 24, height: 24 }}
                                title="Actualizar"
                            >
                                <ArrowsClockwise
                                    size={13}
                                    style={{
                                        color: "var(--color-text-3)",
                                        animation: loading ? "spin 0.8s linear infinite" : "none",
                                    }}
                                />
                            </button>

                            {/* Marcar todas */}
                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={markAllRead}
                                    disabled={markingAll}
                                    className="flex items-center gap-1 px-2 py-1 text-[11px] rounded transition-colors focus:outline-none"
                                    style={{
                                        color: "var(--color-text-3)",
                                        borderRadius: "var(--radius-sm)",
                                    }}
                                    onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-layer-3)";
                                        (e.currentTarget as HTMLElement).style.color = "var(--color-text-1)";
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                                        (e.currentTarget as HTMLElement).style.color = "var(--color-text-3)";
                                    }}
                                >
                                    <Check size={11} />
                                    Leer todas
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Lista */}
                    <div className="overflow-y-auto flex-1" style={{ overscrollBehavior: "contain" }}>
                        {loading && notifications.length === 0 ? (
                            <div className="flex flex-col gap-2 p-3">
                                {[...Array(4)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex gap-2.5 p-2 animate-pulse"
                                        style={{ borderRadius: "var(--radius-md)" }}
                                    >
                                        <div
                                            className="rounded-full flex-shrink-0"
                                            style={{ width: 32, height: 32, backgroundColor: "var(--color-layer-3)" }}
                                        />
                                        <div className="flex-1 flex flex-col gap-1.5">
                                            <div style={{ height: 11, width: "60%", backgroundColor: "var(--color-layer-3)", borderRadius: 4 }} />
                                            <div style={{ height: 11, width: "90%", backgroundColor: "var(--color-layer-3)", borderRadius: 4 }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : notifications.length === 0 ? (
                            <div
                                className="flex flex-col items-center justify-center py-10 px-4 text-center"
                                style={{ color: "var(--color-text-3)" }}
                            >
                                <Bell size={28} style={{ opacity: 0.4, marginBottom: 8 }} />
                                <p className="text-[13px]">Sin notificaciones aún</p>
                            </div>
                        ) : (
                            <div className="flex flex-col p-1.5 gap-0.5">
                                {notifications.map((n) => (
                                    <NotificationItem
                                        key={n.id}
                                        notification={n}
                                        onRead={markRead}
                                        onClose={() => setOpen(false)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}

// ─── NotificationItem ─────────────────────────────────────────────────────────

function NotificationItem({
    notification: n,
    onRead,
    onClose,
}: {
    notification: Notification;
    onRead: (id: string) => void;
    onClose: () => void;
}) {
    const href = notificationHref(n);
    const avatar = n.data?.actorAvatar as string | undefined;

    const handleClick = () => {
        if (!n.isRead) onRead(n.id);
        onClose();
    };

    return (
        <Link
            href={href}
            onClick={handleClick}
            className="flex items-start gap-2.5 px-2.5 py-2 transition-colors"
            style={{
                borderRadius: "var(--radius-md)",
                backgroundColor: n.isRead ? "transparent" : "var(--color-layer-3)",
                opacity: n.isRead ? 0.7 : 1,
                textDecoration: "none",
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-layer-3)";
                (e.currentTarget as HTMLElement).style.opacity = "1";
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = n.isRead ? "transparent" : "var(--color-layer-3)";
                (e.currentTarget as HTMLElement).style.opacity = n.isRead ? "0.7" : "1";
            }}
        >
            <NotifIcon type={n.type} avatar={avatar} />

            <div className="flex-1 min-w-0">
                <p
                    className="text-[12px] font-semibold leading-tight truncate"
                    style={{ color: "var(--color-text-1)" }}
                >
                    {n.title}
                </p>
                <p
                    className="text-[12px] leading-snug mt-0.5"
                    style={{
                        color: "var(--color-text-2)",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {n.body}
                </p>
                <p
                    className="text-[11px] mt-1"
                    style={{ color: "var(--color-text-3)" }}
                >
                    {timeAgo(n.createdAt)}
                </p>
            </div>

            {/* Punto de no leído */}
            {!n.isRead && (
                <div
                    className="flex-shrink-0 rounded-full mt-1.5"
                    style={{ width: 7, height: 7, backgroundColor: "#E84040" }}
                />
            )}
        </Link>
    );
}