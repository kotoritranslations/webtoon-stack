// src/app/dashboard/page.tsx

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UsersThree, Books, Eye, Heart } from "@phosphor-icons/react/dist/ssr";
import { SectionsGrid } from "@/components/dashboard/SectionsGrid";

// ─── Stat card (server — no interactivity needed) ─────────────────────────────

function StatCard({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: number;
    icon: React.ElementType;
}) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                padding: "1rem 1.25rem",
                borderRadius: "var(--radius-xl)",
                backgroundColor: "var(--color-layer-2)",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-3)" }}>{label}</span>
                <Icon size={14} weight="duotone" style={{ color: "var(--color-text-3)" }} />
            </div>
            <span
                style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "var(--color-text-1)",
                    letterSpacing: "-0.04em",
                    fontVariantNumeric: "tabular-nums",
                    lineHeight: 1,
                }}
            >
                {value.toLocaleString("es-MX")}
            </span>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            displayName: true,
            name: true,
            followersCount: true,
            totalSeries: true,
        },
    });

    if (!user) redirect("/login");

    const seriesAgg = await prisma.series.aggregate({
        where: { creatorId: user.id },
        _sum: { viewsCount: true, likesCount: true },
    });

    const totalViews = seriesAgg._sum.viewsCount ?? 0;
    const totalLikes = seriesAgg._sum.likesCount ?? 0;
    const firstName = (user.displayName ?? user.name ?? "ahí").split(" ")[0];

    return (
        <div
            className="min-h-screen px-4 py-10 sm:px-6 lg:px-8"
            style={{ backgroundColor: "var(--color-layer-1)" }}
        >
            <div className="mx-auto max-w-4xl">

                {/* ── Header ──────────────────────────────────────────────────────── */}
                <div className="mb-8">
                    <h1
                        style={{
                            fontSize: "clamp(1.25rem, 4vw, 1.75rem)",
                            fontWeight: 700,
                            letterSpacing: "-0.04em",
                            color: "var(--color-text-1)",
                        }}
                    >
                        Hola, {firstName}
                    </h1>
                    <p style={{ marginTop: "0.375rem", fontSize: "0.875rem", color: "var(--color-text-3)" }}>
                        ¿Qué quieres hacer hoy?
                    </p>
                </div>

                {/* ── Stats ───────────────────────────────────────────────────────── */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                        gap: "0.625rem",
                        marginBottom: "2rem",
                    }}
                >
                    <StatCard label="Seguidores" value={user.followersCount} icon={UsersThree} />
                    <StatCard label="Series" value={user.totalSeries} icon={Books} />
                    <StatCard label="Vistas totales" value={totalViews} icon={Eye} />
                    <StatCard label="Likes totales" value={totalLikes} icon={Heart} />
                </div>

                {/* ── Sections ────────────────────────────────────────────────────── */}
                <SectionsGrid />

            </div>
        </div>
    );
}