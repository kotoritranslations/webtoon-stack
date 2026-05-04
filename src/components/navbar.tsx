"use client";

// src/components/Navbar.tsx

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { User, SignOut, Gear, BookOpen, SquaresFour } from "@phosphor-icons/react";
import { NotificationsDropdown } from "@/components/notifications/NotificationsDropdown";
import { siteConfig } from "@/config/site";

export function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === "loading";
  const username = session?.user?.username;
  const avatar = session?.user?.avatar ?? session?.user?.image;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut({ callbackUrl: "/", redirect: true });
    router.refresh();
  };

  const handleSignIn = async () => {
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <nav
      className="sticky top-0 z-40 flex h-12 w-full items-center justify-between px-4"
      style={{
        backgroundColor: "var(--color-layer-1)",
        borderBottom: "1px solid var(--color-layer-3)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="flex items-center transition-opacity hover:opacity-70"
        >
          {siteConfig.logoUrl ? (
            <Image
              src={siteConfig.logoUrl}
              alt={siteConfig.name}
              width={80}
              height={28}
              className="object-contain"
              style={{ maxHeight: 28 }}
              priority
            />
          ) : (
            <span
              className="text-sm font-bold tracking-[-0.05em]"
              style={{ color: "var(--color-text-1)" }}
            >
              {siteConfig.name}
            </span>
          )}
        </Link>

        {/* Nav links */}
        <div className="hidden items-center gap-1 sm:flex">
          <NavLink href="/library">Biblioteca</NavLink>
          <NavLink href="/chapters">Capítulos</NavLink>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <ThemeToggle />

        {isLoading ? (
          <div
            className="h-7 w-7 animate-pulse rounded-full"
            style={{ backgroundColor: "var(--color-layer-3)" }}
          />
        ) : session ? (
          <>
            <NotificationsDropdown />

            {/* Avatar dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center justify-center rounded-full opacity-90 transition-opacity hover:opacity-100 focus:outline-none"
              >
                {avatar ? (
                  <Image
                    src={avatar}
                    alt={session.user?.name || "Usuario"}
                    width={28}
                    height={28}
                    className="rounded-full object-cover"
                    style={{ width: 28, height: 28, flexShrink: 0 }}
                  />
                ) : (
                  <div
                    className="flex items-center justify-center rounded-full text-xs font-semibold"
                    style={{
                      width: 28,
                      height: 28,
                      flexShrink: 0,
                      backgroundColor: "var(--color-layer-3)",
                      color: "var(--color-text-2)",
                    }}
                  >
                    {session.user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 z-[100] w-52 overflow-hidden"
                  style={{
                    top: "calc(100% + 6px)",
                    backgroundColor: "var(--color-layer-2)",
                    borderRadius: "var(--radius-xl)",
                    border: "1px solid var(--color-layer-3)",
                  }}
                >
                  {/* User info */}
                  <div
                    className="px-3 py-2.5"
                    style={{ borderBottom: "1px solid var(--color-layer-3)" }}
                  >
                    <p
                      className="truncate text-[13px] font-semibold leading-tight tracking-[-0.01em]"
                      style={{ color: "var(--color-text-1)" }}
                    >
                      {session.user?.name}
                    </p>
                    <p
                      className="mt-0.5 truncate text-[11px]"
                      style={{ color: "var(--color-text-3)" }}
                    >
                      {session.user?.email}
                    </p>
                  </div>

                  {/* Options */}
                  <div className="flex flex-col p-1">
                    {username && (
                      <DropdownItem
                        href={`/${username}`}
                        icon={<User size={14} />}
                        label="Mi perfil"
                        onClick={() => setDropdownOpen(false)}
                      />
                    )}
                    <DropdownItem
                      href="/dashboard"
                      icon={<SquaresFour size={14} />}
                      label="Dashboard"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <DropdownItem
                      href="/library"
                      icon={<BookOpen size={14} />}
                      label="Biblioteca"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <DropdownItem
                      href="/settings"
                      icon={<Gear size={14} />}
                      label="Ajustes"
                      onClick={() => setDropdownOpen(false)}
                    />
                  </div>

                  {/* Sign out */}
                  <div
                    className="p-1"
                    style={{ borderTop: "1px solid var(--color-layer-3)" }}
                  >
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-2.5 py-2 text-[13px] transition-colors"
                      style={{
                        borderRadius: "var(--radius-sm)",
                        color: "var(--color-text-3)",
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
                      <SignOut size={14} />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleSignIn}
              className="flex items-center px-3 py-1.5 text-[12px] font-medium transition-colors"
              style={{
                borderRadius: "var(--radius-md)",
                color: "var(--color-text-3)",
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
              Iniciar sesión
            </button>
            <Link
              href="/register"
              className="flex items-center px-3 py-1.5 text-[12px] font-semibold transition-opacity hover:opacity-80"
              style={{
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-text-1)",
                color: "var(--color-layer-1)",
              }}
            >
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-[var(--radius-md)] px-3 py-1.5 text-[13px] font-medium transition-colors"
      style={{ color: "var(--color-text-3)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-layer-2)";
        (e.currentTarget as HTMLElement).style.color = "var(--color-text-1)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
        (e.currentTarget as HTMLElement).style.color = "var(--color-text-3)";
      }}
    >
      {children}
    </Link>
  );
}

function DropdownItem({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 px-2.5 py-2 text-[13px] transition-colors"
      style={{
        borderRadius: "var(--radius-sm)",
        color: "var(--color-text-2)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-layer-3)";
        (e.currentTarget as HTMLElement).style.color = "var(--color-text-1)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
        (e.currentTarget as HTMLElement).style.color = "var(--color-text-2)";
      }}
    >
      {icon}
      {label}
    </Link>
  );
}