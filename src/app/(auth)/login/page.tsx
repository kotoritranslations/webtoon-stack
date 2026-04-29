// src/app/(auth)/login/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import {
    GoogleLogo,
    EnvelopeSimple,
    LockSimple,
    CircleNotch,
    Books,
} from "@phosphor-icons/react";

export default function LoginPage() {
    const [loadingGoogle, setLoadingGoogle] = useState(false);

    const handleGoogle = async () => {
        setLoadingGoogle(true);
        await signIn("google", { callbackUrl: "/dashboard" });
    };

    const inputStyle: React.CSSProperties = {
        width: "100%",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-layer-4)",
        backgroundColor: "var(--color-layer-3)",
        padding: "0.75rem 1rem 0.75rem 2.75rem",
        color: "var(--color-text-3)",
        fontSize: "0.875rem",
        outline: "none",
        fontFamily: "var(--font-sans)",
        cursor: "not-allowed",
        opacity: 0.5,
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "var(--color-layer-1)",
                padding: "1.5rem",
            }}
        >
            <div style={{ width: "100%", maxWidth: "380px" }}>

                {/* ── Logo / Brand ─────────────────────────────────────────────── */}
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "2.75rem",
                            height: "2.75rem",
                            borderRadius: "var(--radius-lg)",
                            backgroundColor: "var(--color-layer-3)",
                            marginBottom: "1rem",
                        }}
                    >
                        <Books size={22} weight="duotone" style={{ color: "var(--color-text-1)" }} />
                    </div>
                    <h1
                        style={{
                            fontSize: "1.25rem",
                            fontWeight: 700,
                            letterSpacing: "-0.03em",
                            color: "var(--color-text-1)",
                            marginBottom: "0.375rem",
                        }}
                    >
                        Bienvenido de vuelta
                    </h1>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-3)" }}>
                        Inicia sesión para continuar
                    </p>
                </div>

                {/* ── Card ─────────────────────────────────────────────────────── */}
                <div
                    style={{
                        backgroundColor: "var(--color-layer-0)",
                        borderRadius: "var(--radius-xl)",
                        border: "1px solid var(--color-layer-3)",
                        padding: "1.5rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                    }}
                >
                    {/* Google */}
                    <button
                        type="button"
                        onClick={handleGoogle}
                        disabled={loadingGoogle}
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.625rem",
                            padding: "0.75rem 1rem",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--color-layer-4)",
                            backgroundColor: "var(--color-layer-2)",
                            color: "var(--color-text-1)",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            cursor: loadingGoogle ? "not-allowed" : "pointer",
                            opacity: loadingGoogle ? 0.7 : 1,
                            transition: "background-color 0.15s, border-color 0.15s",
                            fontFamily: "var(--font-sans)",
                        }}
                        onMouseEnter={(e) => {
                            if (!loadingGoogle) {
                                (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-layer-3)";
                            }
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-layer-2)";
                        }}
                    >
                        {loadingGoogle ? (
                            <CircleNotch size={18} weight="bold" style={{ animation: "spin 0.8s linear infinite" }} />
                        ) : (
                            <GoogleLogo size={18} weight="bold" />
                        )}
                        {loadingGoogle ? "Redirigiendo..." : "Continuar con Google"}
                    </button>

                    {/* Divider */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-layer-3)" }} />
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-3)" }}>
                            o inicia con email
                        </span>
                        <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-layer-3)" }} />
                    </div>

                    {/* Email/password — próximamente */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                        <div style={{ position: "relative" }}>
                            <EnvelopeSimple
                                size={16}
                                weight="regular"
                                style={{
                                    position: "absolute",
                                    left: "0.875rem",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "var(--color-text-3)",
                                    pointerEvents: "none",
                                    opacity: 0.5,
                                }}
                            />
                            <input type="email" placeholder="tu@email.com" disabled style={inputStyle} />
                        </div>

                        <div style={{ position: "relative" }}>
                            <LockSimple
                                size={16}
                                weight="regular"
                                style={{
                                    position: "absolute",
                                    left: "0.875rem",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "var(--color-text-3)",
                                    pointerEvents: "none",
                                    opacity: 0.5,
                                }}
                            />
                            <input type="password" placeholder="Contraseña" disabled style={inputStyle} />
                        </div>

                        <div style={{ position: "relative" }}>
                            <button
                                type="button"
                                disabled
                                style={{
                                    width: "100%",
                                    padding: "0.75rem 1rem",
                                    borderRadius: "var(--radius-md)",
                                    border: "1px solid transparent",
                                    backgroundColor: "var(--color-text-1)",
                                    color: "var(--color-layer-1)",
                                    fontSize: "0.875rem",
                                    fontWeight: 500,
                                    cursor: "not-allowed",
                                    opacity: 0.3,
                                    fontFamily: "var(--font-sans)",
                                }}
                            >
                                Iniciar sesión
                            </button>
                            <span
                                style={{
                                    position: "absolute",
                                    top: "50%",
                                    right: "0.875rem",
                                    transform: "translateY(-50%)",
                                    fontSize: "0.6875rem",
                                    fontWeight: 600,
                                    padding: "0.2rem 0.5rem",
                                    borderRadius: "var(--radius-full)",
                                    backgroundColor: "var(--color-layer-3)",
                                    color: "var(--color-text-3)",
                                    letterSpacing: "0.02em",
                                    pointerEvents: "none",
                                }}
                            >
                                Próximamente
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Footer ───────────────────────────────────────────────────── */}
                <p
                    style={{
                        textAlign: "center",
                        marginTop: "1.25rem",
                        fontSize: "0.8125rem",
                        color: "var(--color-text-3)",
                    }}
                >
                    ¿No tienes cuenta?{" "}
                    <Link
                        href="/register"
                        style={{ color: "var(--color-text-2)", fontWeight: 500, textDecoration: "none" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text-1)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-2)")}
                    >
                        Regístrate
                    </Link>
                </p>
            </div>

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}