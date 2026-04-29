'use client';

// app/settings/_components/NotificationSection.tsx

import { useEffect, useState } from 'react';
import { CircleNotch, Check, Warning } from '@phosphor-icons/react';
import type { NotificationPrefs } from '../page';

// ─── Primitives ───────────────────────────────────────────────────────────────

function SectionCard({ children }: { children: React.ReactNode }) {
    return (
        <div className="overflow-hidden rounded-[var(--radius-lg)]" style={{ backgroundColor: 'var(--color-layer-2)' }}>
            {children}
        </div>
    );
}

function GroupHeader({ label }: { label: string }) {
    return (
        <div
            className="px-6 py-3 text-xs font-semibold uppercase tracking-widest"
            style={{
                color: 'var(--color-text-3)',
                backgroundColor: 'var(--color-layer-3)',
                letterSpacing: '0.08em',
            }}
        >
            {label}
        </div>
    );
}

function Toggle({
    checked, onChange,
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className="relative flex-shrink-0 transition-colors"
            style={{
                width: 36,
                height: 20,
                borderRadius: 999,
                backgroundColor: checked ? 'var(--color-text-1)' : 'var(--color-layer-4)',
                transition: 'background-color 0.15s ease',
            }}
        >
            <span
                className="absolute top-0.5 left-0.5 rounded-full transition-transform"
                style={{
                    width: 16,
                    height: 16,
                    backgroundColor: checked ? 'var(--color-layer-1)' : 'var(--color-text-3)',
                    transform: checked ? 'translateX(16px)' : 'translateX(0)',
                    transition: 'transform 0.15s ease, background-color 0.15s ease',
                }}
            />
        </button>
    );
}

function PrefRow({
    label, description, checked, onChange, first = false,
}: {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    first?: boolean;
}) {
    return (
        <div
            className="flex items-center justify-between gap-6 px-6 py-4"
            style={first ? undefined : { borderTop: '1px solid var(--color-layer-3)' }}
        >
            <div className="min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-1)' }}>{label}</p>
                {description && (
                    <p className="mt-0.5 text-xs leading-relaxed" style={{ color: 'var(--color-text-3)' }}>
                        {description}
                    </p>
                )}
            </div>
            <Toggle checked={checked} onChange={onChange} />
        </div>
    );
}

// ─── Prefs config ─────────────────────────────────────────────────────────────

const EMAIL_PREFS: { key: keyof NotificationPrefs; label: string; description?: string }[] = [
    { key: 'emailNewFollower', label: 'Nuevo seguidor', description: 'Cuando alguien empieza a seguirte.' },
    { key: 'emailNewChapter', label: 'Nuevo capítulo', description: 'Cuando una serie que sigues publica un capítulo.' },
    { key: 'emailNewComment', label: 'Nuevo comentario', description: 'Cuando alguien comenta en tu serie o capítulo.' },
    { key: 'emailCommentReply', label: 'Respuesta a comentario', description: 'Cuando alguien responde a tu comentario.' },
];

const PUSH_PREFS: { key: keyof NotificationPrefs; label: string; description?: string }[] = [
    { key: 'pushNewFollower', label: 'Nuevo seguidor' },
    { key: 'pushNewChapter', label: 'Nuevo capítulo' },
    { key: 'pushNewComment', label: 'Nuevo comentario' },
    { key: 'pushCommentReply', label: 'Respuesta a comentario' },
];

const DEFAULT_PREFS: NotificationPrefs = {
    emailNewFollower: true,
    emailNewChapter: true,
    emailNewComment: false,
    emailCommentReply: true,
    pushNewFollower: true,
    pushNewChapter: true,
    pushNewComment: true,
    pushCommentReply: true,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function NotificationSection() {
    const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/settings/notifications');
                if (!res.ok) throw new Error();
                const data = await res.json();
                setPrefs(data.prefs ?? DEFAULT_PREFS);
            } catch {
                // Si no hay prefs guardadas, usamos los defaults — no es error crítico
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const set = (key: keyof NotificationPrefs) => (value: boolean) => {
        setPrefs((p) => ({ ...p, [key]: value }));
        setError('');
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const res = await fetch('/api/settings/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(prefs),
            });
            if (!res.ok) throw new Error();
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch {
            setError('No se pudieron guardar las preferencias. Intenta de nuevo.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-3)' }}>
                <CircleNotch size={15} className="animate-spin" />
                <span>Cargando preferencias...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {error && (
                <div
                    className="flex items-center gap-2.5 rounded-[var(--radius-lg)] px-4 py-3 text-sm"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--color-error) 8%, transparent)', color: 'var(--color-error)' }}
                >
                    <Warning size={15} weight="fill" style={{ flexShrink: 0 }} />
                    {error}
                </div>
            )}

            {/* Email */}
            <SectionCard>
                <GroupHeader label="Por email" />
                {EMAIL_PREFS.map(({ key, label, description }, i) => (
                    <PrefRow
                        key={key}
                        first={i === 0}
                        label={label}
                        description={description}
                        checked={prefs[key]}
                        onChange={set(key)}
                    />
                ))}
            </SectionCard>

            {/* Push / In-app */}
            <SectionCard>
                <GroupHeader label="En la aplicación" />
                {PUSH_PREFS.map(({ key, label, description }, i) => (
                    <PrefRow
                        key={key}
                        first={i === 0}
                        label={label}
                        description={description}
                        checked={prefs[key]}
                        onChange={set(key)}
                    />
                ))}
            </SectionCard>

            {/* Save */}
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: 'var(--color-text-1)', color: 'var(--color-layer-0)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                >
                    {saving && <CircleNotch size={14} className="animate-spin" />}
                    {saved && <Check size={14} weight="bold" />}
                    {saved ? 'Guardado' : 'Guardar cambios'}
                </button>
            </div>
        </div>
    );
}