"use client";

// src/components/Footer.tsx
import Link from "next/link";

const LEGAL = [
    { label: "Términos", href: "/terms" },
    { label: "Privacidad", href: "/privacy" },
    { label: "DMCA", href: "/dmca" },
    { label: "Contacto", href: "/contact" },
];

export function Footer() {
    return (
        <footer
            className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6"
            style={{ borderTop: "1px solid var(--color-border)" }}
        >
            <p className="text-xs" style={{ color: "var(--color-text-3)" }}>
                © {new Date().getFullYear()} SITE. Todos los derechos reservados.
            </p>

            <nav className="flex items-center gap-4">
                {LEGAL.map(({ label, href }) => (
                    <Link
                        key={href}
                        href={href}
                        className="text-xs transition-opacity hover:opacity-70"
                        style={{ color: "var(--color-text-3)" }}
                    >
                        {label}
                    </Link>
                ))}
            </nav>
        </footer>
    );
}