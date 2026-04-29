// src/app/contact/page.tsx

import Link from "next/link";

export default function ContactPage() {
    return (
        <div
            className="min-h-screen px-4 py-12 sm:px-6 lg:px-8"
            style={{ backgroundColor: "var(--color-layer-1)" }}
        >
            <div className="mx-auto max-w-2xl">

                {/* Header */}
                <div className="mb-10">
                    <Link
                        href="/"
                        className="text-[12px] transition-colors mb-6 inline-block"
                        style={{ color: "var(--color-text-3)" }}
                    >
                        ← Volver
                    </Link>
                    <h1
                        className="text-[26px] font-bold tracking-[-0.04em]"
                        style={{ color: "var(--color-text-1)" }}
                    >
                        Contacto
                    </h1>
                    <p className="mt-4 text-[13px] leading-relaxed" style={{ color: "var(--color-text-2)" }}>
                        ¿Tienes alguna duda o necesitas ayuda? Escríbenos y te respondemos en un plazo de 1 a 3 días hábiles.
                    </p>
                </div>

                {/* Email */}
                <div
                    className="rounded-lg p-5"
                    style={{
                        backgroundColor: "var(--color-layer-2)",
                        border: "1px solid var(--color-layer-3)",
                    }}
                >
                    <p className="text-[13px] mb-2" style={{ color: "var(--color-text-2)" }}>
                        Correo de contacto
                    </p>
                    <a
                        href="mailto:contact@kisfer.com"
                        className="text-[15px] font-semibold transition-opacity hover:opacity-70"
                        style={{ color: "var(--color-text-1)" }}
                    >
                        contact@kisfer.com
                    </a>
                </div>

                {/* Help center nudge */}
                <p className="mt-6 text-[13px] leading-relaxed" style={{ color: "var(--color-text-3)" }}>
                    Antes de escribirnos, revisa nuestro{" "}
                    <Link href="/help" className="underline" style={{ color: "var(--color-text-2)" }}>
                        Centro de ayuda
                    </Link>
                    {" "}— es posible que tu duda ya tenga respuesta.
                </p>

                {/* Footer */}
                <div
                    className="mt-12 pt-6 text-[12px]"
                    style={{
                        borderTop: "1px solid var(--color-layer-3)",
                        color: "var(--color-text-3)",
                    }}
                >
                    <Link href="/report" style={{ color: "var(--color-text-2)" }} className="underline">
                        Reportar un problema
                    </Link>
                    {" · "}
                    <Link href="/terms" style={{ color: "var(--color-text-2)" }} className="underline">
                        Términos de uso
                    </Link>
                    {" · "}
                    <Link href="/privacy" style={{ color: "var(--color-text-2)" }} className="underline">
                        Privacidad
                    </Link>
                </div>

            </div>
        </div>
    );
}