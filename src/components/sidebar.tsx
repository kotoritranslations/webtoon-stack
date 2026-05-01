"use client";

// src/components/Sidebar.tsx

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSidebar } from "@/context/sidebar-context";
import {
    SquaresFour,
    Books,
    BookBookmark,
    UsersThree,
    ChatCircle,
    Gear,
    CaretRight,
    X,
    User,
    Question,
} from "@phosphor-icons/react";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard", icon: SquaresFour },
    { label: "Mis series", href: "/dashboard/series", icon: Books },
    { label: "Mis capítulos", href: "/dashboard/chapters", icon: BookBookmark },
    { label: "Seguidores", href: "/dashboard/followers", icon: UsersThree },
    { label: "Comentarios", href: "/dashboard/comments", icon: ChatCircle },
];

const BOTTOM_ITEMS = [
    { label: "Ayuda", href: "/help", icon: Question },
    { label: "Ajustes", href: "/settings", icon: Gear },
];

export function Sidebar() {
    const { mobileOpen, setMobileOpen, expanded, setExpanded } = useSidebar();
    const pathname = usePathname();
    const { data: session } = useSession();
    const username = (session?.user as any)?.username;

    const navItems = [
        ...(username ? [{ label: "Mi perfil", href: `/${username}`, icon: User }] : []),
        ...NAV_ITEMS,
    ];

    useEffect(() => {
        setMobileOpen(false);
    }, [pathname, setMobileOpen]);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [mobileOpen]);

    const isActive = (href: string) =>
        href === "/dashboard" ? pathname === href : pathname.startsWith(href);

    const itemStyle = (active: boolean): React.CSSProperties => ({
        backgroundColor: active ? "var(--color-layer-3)" : "transparent",
        color: active ? "var(--color-text-1)" : "var(--color-text-3)",
    });

    const onEnter = (e: React.MouseEvent, active: boolean) => {
        if (!active) {
            (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-layer-3)";
            (e.currentTarget as HTMLElement).style.color = "var(--color-text-1)";
        }
    };

    const onLeave = (e: React.MouseEvent, active: boolean) => {
        if (!active) {
            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--color-text-3)";
        }
    };

    const content = (isMobile = false) => (
        <>
            {/* Header con toggle / close */}
            <div
                className="flex h-12 w-full shrink-0 items-center border-b"
                style={{
                    borderColor: "var(--color-layer-3)",
                    justifyContent: isMobile || expanded ? "flex-end" : "center",
                    paddingInline: isMobile || expanded ? "0.75rem" : 0,
                }}
            >
                {isMobile ? (
                    <button
                        type="button"
                        onClick={() => setMobileOpen(false)}
                        className="flex h-7 w-7 items-center justify-center rounded-[4px]"
                        style={{ color: "var(--color-text-3)" }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-layer-3)";
                            (e.currentTarget as HTMLElement).style.color = "var(--color-text-1)";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                            (e.currentTarget as HTMLElement).style.color = "var(--color-text-3)";
                        }}
                        aria-label="Cerrar menú"
                    >
                        <X size={15} weight="bold" />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => setExpanded(!expanded)}
                        className={`flex h-7 w-7 items-center justify-center rounded-[4px] transition-transform duration-200 ${expanded ? "rotate-180" : "rotate-0"}`}
                        style={{ color: "var(--color-text-3)" }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-layer-3)";
                            (e.currentTarget as HTMLElement).style.color = "var(--color-text-1)";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                            (e.currentTarget as HTMLElement).style.color = "var(--color-text-3)";
                        }}
                        aria-label="Toggle sidebar"
                    >
                        <CaretRight size={13} weight="bold" />
                    </button>
                )}
            </div>

            {/* Main nav */}
            <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden px-2 py-2">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <NavItem
                            key={item.href}
                            href={item.href}
                            label={item.label}
                            icon={<item.icon size={18} weight={active ? "fill" : "regular"} />}
                            active={active}
                            expanded={expanded || isMobile}
                            style={itemStyle(active)}
                            onMouseEnter={(e) => onEnter(e, active)}
                            onMouseLeave={(e) => onLeave(e, active)}
                        />
                    );
                })}
            </nav>

            {/* Bottom nav */}
            <div
                className="sticky bottom-0 px-2 pb-4 pt-1"
                style={{ backgroundColor: "var(--color-layer-1)" }}
            >
                <div className="mb-1.5 h-px" style={{ backgroundColor: "var(--color-layer-3)" }} />
                <div className="flex flex-col gap-0.5">
                    {BOTTOM_ITEMS.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <NavItem
                                key={item.href}
                                href={item.href}
                                label={item.label}
                                icon={<item.icon size={18} weight={active ? "fill" : "regular"} />}
                                active={active}
                                expanded={expanded || isMobile}
                                style={itemStyle(active)}
                                onMouseEnter={(e) => onEnter(e, active)}
                                onMouseLeave={(e) => onLeave(e, active)}
                            />
                        );
                    })}
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* Overlay móvil */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Drawer móvil */}
            <aside
                className={`fixed left-0 top-0 z-50 flex h-screen w-56 flex-col border-r transition-transform duration-200 ease-in-out lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
                style={{ backgroundColor: "var(--color-layer-1)", borderColor: "var(--color-layer-3)" }}
            >
                {content(true)}
            </aside>

            {/* Sidebar desktop — z-50 para quedar sobre el navbar */}
            <aside
                className={`fixed left-0 top-0 z-50 hidden h-screen flex-col border-r transition-all duration-200 ease-in-out lg:flex ${expanded ? "w-52" : "w-14"}`}
                style={{ backgroundColor: "var(--color-layer-1)", borderColor: "var(--color-layer-3)" }}
            >
                {content(false)}
            </aside>
        </>
    );
}

function NavItem({
    href,
    label,
    icon,
    active,
    expanded,
    style,
    onMouseEnter,
    onMouseLeave,
}: {
    href: string;
    label: string;
    icon: React.ReactNode;
    active: boolean;
    expanded: boolean;
    style: React.CSSProperties;
    onMouseEnter: (e: React.MouseEvent) => void;
    onMouseLeave: (e: React.MouseEvent) => void;
}) {
    return (
        <Link
            href={href}
            className={`group relative flex h-9 items-center rounded-[4px] text-[13px] font-medium transition-colors duration-100 ${expanded ? "gap-3 px-2.5" : "justify-center px-0"}`}
            style={style}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {icon}
            {expanded && <span className="whitespace-nowrap">{label}</span>}

            {!expanded && (
                <div
                    className="pointer-events-none absolute left-[calc(100%+8px)] z-50 whitespace-nowrap rounded-[6px] px-2.5 py-1.5 text-[12px] font-medium opacity-0 transition-opacity duration-100 group-hover:opacity-100"
                    style={{ backgroundColor: "var(--color-layer-3)", color: "var(--color-text-1)" }}
                >
                    {label}
                </div>
            )}
        </Link>
    );
}