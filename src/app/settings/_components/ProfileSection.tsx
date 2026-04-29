'use client';

// app/settings/_components/ProfileSection.tsx

import { useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
    Camera, Globe, TwitterLogo, InstagramLogo, YoutubeLogo,
    TiktokLogo, Warning, CircleNotch, Image as ImageIcon, Check,
} from '@phosphor-icons/react';
import type { UserData } from '../page';

// ─── Primitives ───────────────────────────────────────────────────────────────

function SectionCard({ children }: { children: React.ReactNode }) {
    return (
        <div className="overflow-hidden rounded-[var(--radius-lg)]" style={{ backgroundColor: 'var(--color-layer-2)' }}>
            {children}
        </div>
    );
}

function SectionRow({
    title, description, children, first = false,
}: {
    title: string; description?: string; children: React.ReactNode; first?: boolean;
}) {
    return (
        <div
            className="grid grid-cols-5 gap-8 px-6 py-5"
            style={first ? undefined : { borderTop: '1px solid var(--color-layer-3)' }}
        >
            <div className="col-span-2">
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-1)' }}>{title}</p>
                {description && (
                    <p className="mt-0.5 text-xs leading-relaxed" style={{ color: 'var(--color-text-3)' }}>
                        {description}
                    </p>
                )}
            </div>
            <div className="col-span-3 flex items-center">{children}</div>
        </div>
    );
}

function Input({
    prefix, error, ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> & { prefix?: React.ReactNode; error?: string }) {
    return (
        <div className="w-full">
            <div
                className="flex overflow-hidden rounded-[var(--radius-md)] transition-colors"
                style={{
                    backgroundColor: 'var(--color-layer-3)',
                    border: error ? '1px solid color-mix(in srgb, var(--color-error) 40%, transparent)' : 'none',
                }}
                onFocusCapture={(e) => { if (!error) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-layer-4)'; }}
                onBlurCapture={(e) => { if (!error) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-layer-3)'; }}
            >
                {prefix && (
                    <span
                        className="flex items-center px-3 text-xs"
                        style={{
                            borderRight: '1px solid var(--color-layer-4)',
                            color: 'var(--color-text-3)',
                            backgroundColor: 'var(--color-layer-4)',
                        }}
                    >
                        {prefix}
                    </span>
                )}
                <input
                    {...props}
                    className="w-full bg-transparent px-3 py-2 text-sm focus:outline-none disabled:opacity-40"
                    style={{ color: 'var(--color-text-1)', fontFamily: 'var(--font-sans)' }}
                />
            </div>
            {error && <p className="mt-1 text-xs" style={{ color: 'var(--color-error)' }}>{error}</p>}
        </div>
    );
}

function Textarea({ error, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
    return (
        <div className="w-full">
            <textarea
                {...props}
                className="w-full resize-none rounded-[var(--radius-md)] px-3 py-2 text-sm transition-colors focus:outline-none"
                style={{
                    backgroundColor: 'var(--color-layer-3)',
                    color: 'var(--color-text-1)',
                    fontFamily: 'var(--font-sans)',
                    border: error ? '1px solid color-mix(in srgb, var(--color-error) 40%, transparent)' : 'none',
                }}
                onFocus={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-layer-4)'; }}
                onBlur={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-layer-3)'; }}
            />
            {error && <p className="mt-1 text-xs" style={{ color: 'var(--color-error)' }}>{error}</p>}
        </div>
    );
}

function SaveButton({ loading, saved }: { loading?: boolean; saved?: boolean }) {
    return (
        <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-text-1)', color: 'var(--color-layer-0)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
        >
            {loading && <CircleNotch size={14} className="animate-spin" />}
            {saved && <Check size={14} weight="bold" />}
            {saved ? 'Guardado' : 'Guardar cambios'}
        </button>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProfileSection({
    user, onUpdate,
}: {
    user: UserData;
    onUpdate: (u: Partial<UserData>) => void;
}) {
    const { update: updateSession } = useSession();

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        displayName: user.displayName ?? '',
        username: user.username ?? '',
        bio: user.bio ?? '',
        socialTwitter: user.socialTwitter ?? '',
        socialInstagram: user.socialInstagram ?? '',
        socialYoutube: user.socialYoutube ?? '',
        socialTiktok: user.socialTiktok ?? '',
        socialWebsite: user.socialWebsite ?? '',
    });

    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar);
    const [bannerPreview, setBannerPreview] = useState<string | null>(user.banner);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [error, setError] = useState('');
    const [usernameError, setUsernameError] = useState('');

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((f) => ({ ...f, [key]: e.target.value }));
        if (key === 'username') setUsernameError('');
        setError('');
    };

    async function uploadImage(
        file: File,
        endpoint: string,
        confirmEndpoint: string,
        onPreview: (url: string) => void,
        onDone: (url: string) => void,
        onError: () => void,
        maxMB: number,
    ) {
        if (file.size > maxMB * 1024 * 1024) {
            setError(`El archivo no puede superar ${maxMB}MB.`);
            return;
        }
        onPreview(URL.createObjectURL(file));
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName: file.name, fileSize: file.size, mimeType: file.type }),
            });
            const { uploadUrl, key, error: apiError } = await res.json();
            if (!res.ok) throw new Error(apiError);

            const r2 = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
            if (!r2.ok) throw new Error('Error subiendo archivo');

            const confirm = await fetch(confirmEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key }),
            });
            const { url, error: confirmError } = await confirm.json();
            if (!confirm.ok) throw new Error(confirmError);

            onDone(url);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error subiendo archivo');
            onError();
        }
    }

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingAvatar(true);
        await uploadImage(
            file,
            '/api/settings/avatar',
            '/api/settings/avatar/confirm',
            setAvatarPreview,
            (url) => { setAvatarPreview(url); onUpdate({ avatar: url }); updateSession({ avatar: url }); },
            () => setAvatarPreview(user.avatar),
            2,
        );
        setUploadingAvatar(false);
        e.target.value = '';
    };

    const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingBanner(true);
        await uploadImage(
            file,
            '/api/settings/banner',
            '/api/settings/banner/confirm',
            setBannerPreview,
            (url) => { setBannerPreview(url); onUpdate({ banner: url }); },
            () => setBannerPreview(user.banner),
            5,
        );
        setUploadingBanner(false);
        e.target.value = '';
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setUsernameError('');
        setSaving(true);
        try {
            const res = await fetch('/api/settings/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) {
                if (res.status === 409) { setUsernameError(data.error); return; }
                throw new Error(data.error);
            }
            onUpdate(data.user);
            await updateSession({ username: data.user.username, name: data.user.displayName });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error guardando cambios');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="space-y-6">

            {error && (
                <div
                    className="flex items-center gap-2.5 rounded-[var(--radius-lg)] px-4 py-3 text-sm"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--color-error) 8%, transparent)', color: 'var(--color-error)' }}
                >
                    <Warning size={15} weight="fill" style={{ flexShrink: 0 }} />
                    {error}
                </div>
            )}

            <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
            <input ref={bannerInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleBannerChange} />

            {/* Imágenes */}
            <SectionCard>
                <SectionRow first title="Foto de perfil" description="JPG, PNG o WebP. Máximo 2MB.">
                    <div className="flex items-center gap-4">
                        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--color-layer-4)' }}>
                            {avatarPreview
                                ? <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                                : <div className="flex h-full w-full items-center justify-center text-base font-semibold" style={{ color: 'var(--color-text-2)' }}>
                                    {(user.displayName || user.username || '?').charAt(0).toUpperCase()}
                                </div>
                            }
                            {uploadingAvatar && (
                                <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--color-layer-0) 60%, transparent)' }}>
                                    <CircleNotch size={15} className="animate-spin" style={{ color: 'var(--color-text-1)' }} />
                                </div>
                            )}
                        </div>
                        <button
                            type="button" onClick={() => avatarInputRef.current?.click()} disabled={uploadingAvatar}
                            className="flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm transition-colors disabled:opacity-50"
                            style={{ backgroundColor: 'var(--color-layer-3)', color: 'var(--color-text-2)' }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-layer-4)'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-layer-3)'; }}
                        >
                            <Camera size={14} /> Cambiar foto
                        </button>
                    </div>
                </SectionRow>

                <SectionRow title="Banner" description="Recomendado 1600×400px. Máximo 5MB.">
                    <div className="flex w-full items-center gap-4">
                        <div className="relative h-12 w-32 flex-shrink-0 overflow-hidden rounded-[var(--radius-md)]" style={{ backgroundColor: 'var(--color-layer-4)' }}>
                            {bannerPreview
                                ? <img src={bannerPreview} alt="Banner" className="h-full w-full object-cover" />
                                : <div className="flex h-full w-full items-center justify-center"><ImageIcon size={16} style={{ color: 'var(--color-text-3)' }} /></div>
                            }
                            {uploadingBanner && (
                                <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--color-layer-0) 60%, transparent)' }}>
                                    <CircleNotch size={13} className="animate-spin" style={{ color: 'var(--color-text-1)' }} />
                                </div>
                            )}
                        </div>
                        <button
                            type="button" onClick={() => bannerInputRef.current?.click()} disabled={uploadingBanner}
                            className="flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm transition-colors disabled:opacity-50"
                            style={{ backgroundColor: 'var(--color-layer-3)', color: 'var(--color-text-2)' }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-layer-4)'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-layer-3)'; }}
                        >
                            <ImageIcon size={14} /> Subir banner
                        </button>
                    </div>
                </SectionRow>
            </SectionCard>

            {/* Info básica */}
            <SectionCard>
                <SectionRow first title="Nombre visible" description="Tu nombre público en la plataforma.">
                    <Input placeholder="Tu nombre" value={form.displayName} onChange={set('displayName')} maxLength={60} />
                </SectionRow>
                <SectionRow title="Usuario" description="Tu URL única en la plataforma.">
                    <Input prefix="@" placeholder="usuario" value={form.username} onChange={set('username')} maxLength={30} error={usernameError} />
                </SectionRow>
                <SectionRow title="Biografía" description="Máximo 200 caracteres.">
                    <div className="w-full">
                        <Textarea rows={3} placeholder="Cuéntale a tus seguidores quién eres..." value={form.bio} onChange={set('bio')} maxLength={200} />
                        <p className="mt-1 text-right text-xs" style={{ color: 'var(--color-text-3)' }}>{form.bio.length}/200</p>
                    </div>
                </SectionRow>
            </SectionCard>

            {/* Redes sociales — sin Facebook ya que no está en el nuevo schema */}
            <SectionCard>
                {([
                    { key: 'socialTwitter', label: 'Twitter / X', Icon: TwitterLogo, placeholder: 'https://twitter.com/usuario' },
                    { key: 'socialInstagram', label: 'Instagram', Icon: InstagramLogo, placeholder: 'https://instagram.com/usuario' },
                    { key: 'socialYoutube', label: 'YouTube', Icon: YoutubeLogo, placeholder: 'https://youtube.com/@canal' },
                    { key: 'socialTiktok', label: 'TikTok', Icon: TiktokLogo, placeholder: 'https://tiktok.com/@usuario' },
                    { key: 'socialWebsite', label: 'Sitio web', Icon: Globe, placeholder: 'https://tu-sitio.com' },
                ] as const).map(({ key, label, Icon, placeholder }, i) => (
                    <SectionRow key={key} first={i === 0} title={label}>
                        <Input prefix={<Icon size={14} />} type="url" placeholder={placeholder} value={form[key]} onChange={set(key)} />
                    </SectionRow>
                ))}
            </SectionCard>

            <div className="flex justify-end">
                <SaveButton loading={saving} saved={saved} />
            </div>
        </form>
    );
}