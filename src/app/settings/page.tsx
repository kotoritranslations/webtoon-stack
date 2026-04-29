'use client';

// app/settings/page.tsx

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { User, ShieldWarning, Bell, CircleNotch, Warning } from '@phosphor-icons/react';

import ProfileSection from './_components/ProfileSection';
import AccountSection from './_components/AccountSection';
import NotificationSection from './_components/NotificationSection';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Section = 'profile' | 'account' | 'notifications';

export interface UserData {
    id: string;
    email: string;
    displayName: string | null;
    username: string | null;
    bio: string | null;
    avatar: string | null;
    banner: string | null;
    socialTwitter: string | null;
    socialInstagram: string | null;
    socialYoutube: string | null;
    socialTiktok: string | null;
    socialWebsite: string | null;
}

export interface NotificationPrefs {
    emailNewFollower: boolean;
    emailNewChapter: boolean;
    emailNewComment: boolean;
    emailCommentReply: boolean;
    pushNewFollower: boolean;
    pushNewChapter: boolean;
    pushNewComment: boolean;
    pushCommentReply: boolean;
}

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV: { id: Section; label: string; Icon: React.ElementType }[] = [
    { id: 'profile', label: 'Perfil público', Icon: User },
    { id: 'notifications', label: 'Notificaciones', Icon: Bell },
    { id: 'account', label: 'Cuenta', Icon: ShieldWarning },
];

const SECTION_META: Record<Section, { title: string; description: string }> = {
    profile: { title: 'Perfil público', description: 'Así te verán otros usuarios en la plataforma.' },
    notifications: { title: 'Notificaciones', description: 'Controla qué avisos quieres recibir y cómo.' },
    account: { title: 'Cuenta', description: 'Configuración de tu cuenta y opciones avanzadas.' },
};

const VALID: Section[] = ['profile', 'notifications', 'account'];

// ─── Inner ────────────────────────────────────────────────────────────────────

function SettingsContent() {
    const searchParams = useSearchParams();

    const [activeSection, setActiveSection] = useState<Section>(() => {
        const s = searchParams.get('section') as Section;
        return VALID.includes(s) ? s : 'profile';
    });

    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');

    useEffect(() => {
        const s = searchParams.get('section') as Section;
        if (VALID.includes(s)) setActiveSection(s);
    }, [searchParams]);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/settings/profile');
                if (!res.ok) throw new Error();
                const data = await res.json();
                setUser(data.user);
            } catch {
                setFetchError('No se pudieron cargar tus datos. Recarga la página.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleUpdate = useCallback((partial: Partial<UserData>) => {
        setUser((u) => (u ? { ...u, ...partial } : u));
    }, []);

    const meta = SECTION_META[activeSection];

    return (
        <div className="mx-auto max-w-2xl pb-24 pt-20 px-4 sm:px-6">

            {/* Page header */}
            <div className="mb-8">
                <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--color-text-1)' }}>
                    Configuración
                </h1>
                <p className="mt-1 text-sm" style={{ color: 'var(--color-text-3)' }}>
                    Gestiona tu perfil y preferencias de la cuenta.
                </p>
            </div>

            {/* Tabs */}
            <div
                className="mb-8 flex gap-1 rounded-[var(--radius-lg)] p-1"
                style={{ backgroundColor: 'var(--color-layer-2)' }}
            >
                {NAV.map(({ id, label, Icon }) => {
                    const isActive = activeSection === id;
                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setActiveSection(id)}
                            className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-all"
                            style={{
                                backgroundColor: isActive ? 'var(--color-layer-1)' : 'transparent',
                                color: isActive ? 'var(--color-text-1)' : 'var(--color-text-3)',
                                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                            }}
                        >
                            <Icon size={14} weight={isActive ? 'fill' : 'regular'} />
                            <span className="hidden sm:inline">{label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Section header */}
            <div className="mb-6 pb-5" style={{ borderBottom: '1px solid var(--color-layer-3)' }}>
                <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-1)' }}>
                    {meta.title}
                </h2>
                <p className="mt-0.5 text-sm" style={{ color: 'var(--color-text-3)' }}>
                    {meta.description}
                </p>
            </div>

            {/* Notifications — no necesita userData */}
            {activeSection === 'notifications' && <NotificationSection />}

            {/* Loading */}
            {activeSection !== 'notifications' && loading && (
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-3)' }}>
                    <CircleNotch size={15} className="animate-spin" />
                    <span>Cargando...</span>
                </div>
            )}

            {/* Error */}
            {activeSection !== 'notifications' && fetchError && (
                <div
                    className="flex items-center gap-2.5 rounded-[var(--radius-lg)] px-4 py-3 text-sm"
                    style={{
                        backgroundColor: 'color-mix(in srgb, var(--color-error) 8%, transparent)',
                        color: 'var(--color-error)',
                    }}
                >
                    <Warning size={15} weight="fill" style={{ flexShrink: 0 }} />
                    {fetchError}
                </div>
            )}

            {/* Sections con userData */}
            {activeSection !== 'notifications' && !loading && !fetchError && user && (
                <>
                    {activeSection === 'profile' && <ProfileSection user={user} onUpdate={handleUpdate} />}
                    {activeSection === 'account' && <AccountSection user={user} />}
                </>
            )}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center gap-2 text-sm" style={{ color: 'var(--color-text-3)' }}>
                    <CircleNotch size={15} className="animate-spin" />
                    <span>Cargando...</span>
                </div>
            }
        >
            <SettingsContent />
        </Suspense>
    );
}