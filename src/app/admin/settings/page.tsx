// src/app/admin/settings/page.tsx

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSiteConfig } from "@/lib/actions/site-config";
import { AdminSettingsForm } from "@/components/admin/AdminSettingsForm";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";

export default async function AdminSettingsPage() {
    const session = await auth();

    if (!session?.user?.email) redirect("/login");
    if (session.user.email !== process.env.ADMIN_EMAIL) redirect("/");

    const config = await getSiteConfig();

    return (
        <div
            className="min-h-screen px-4 py-10 sm:px-6 lg:px-8"
            style={{ backgroundColor: "var(--color-layer-1)" }}
        >
            <div className="mx-auto max-w-2xl">

                {/* ── Header ────────────────────────────────────────────────────── */}
                <div className="mb-8">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.375rem" }}>
                        <ShieldCheck size={18} weight="duotone" style={{ color: "var(--color-text-3)" }} />
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-3)", fontWeight: 500 }}>
                            Panel de administración
                        </span>
                    </div>
                    <h1
                        style={{
                            fontSize: "clamp(1.25rem, 4vw, 1.75rem)",
                            fontWeight: 700,
                            letterSpacing: "-0.04em",
                            color: "var(--color-text-1)",
                        }}
                    >
                        Configuración del sitio
                    </h1>
                    <p style={{ marginTop: "0.375rem", fontSize: "0.875rem", color: "var(--color-text-3)" }}>
                        Personaliza la identidad y comportamiento de la plataforma.
                    </p>
                </div>

                {/* ── Form ──────────────────────────────────────────────────────── */}
                <AdminSettingsForm config={config} />

            </div>
        </div>
    );
}