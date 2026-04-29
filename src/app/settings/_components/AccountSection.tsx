'use client';

// app/settings/_components/AccountSection.tsx

import type { UserData } from '../page';

function SectionCard({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="overflow-hidden rounded-[var(--radius-lg)]"
            style={{ backgroundColor: 'var(--color-layer-2)' }}
        >
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

export default function AccountSection({ user }: { user: UserData }) {
    return (
        <div className="space-y-6">

            {/* Email */}
            <SectionCard>
                <SectionRow first title="Email" description="Tu email de acceso. Gestionado por tu proveedor de login.">
                    <div className="flex w-full items-center gap-3">
                        <input
                            type="email"
                            value={user.email}
                            disabled
                            className="min-w-0 flex-1 rounded-[var(--radius-md)] px-3 py-2 text-sm opacity-60"
                            style={{
                                backgroundColor: 'var(--color-layer-3)',
                                color: 'var(--color-text-3)',
                                fontFamily: 'var(--font-sans)',
                                cursor: 'default',
                            }}
                        />
                        <span
                            className="flex-shrink-0 rounded-[var(--radius-xs)] px-2 py-0.5 text-[11px] font-medium"
                            style={{
                                backgroundColor: 'color-mix(in srgb, var(--color-success) 8%, transparent)',
                                color: 'var(--color-success)',
                            }}
                        >
                            Verificado
                        </span>
                    </div>
                </SectionRow>
            </SectionCard>

            {/* Danger zone */}
            <div
                className="rounded-[var(--radius-lg)] p-6"
                style={{ backgroundColor: 'color-mix(in srgb, var(--color-error) 4%, transparent)' }}
            >
                <h3 className="mb-4 text-[13px] font-medium" style={{ color: 'var(--color-error)' }}>
                    Zona de peligro
                </h3>

                <div className="flex items-center justify-between gap-6">
                    <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text-1)' }}>
                            Eliminar cuenta
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed" style={{ color: 'var(--color-text-3)' }}>
                            Esta acción es permanente. Se eliminarán todos tus datos y series publicadas.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="flex-shrink-0 rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium transition-colors"
                        style={{
                            backgroundColor: 'color-mix(in srgb, var(--color-error) 8%, transparent)',
                            color: 'var(--color-error)',
                            fontFamily: 'var(--font-sans)',
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = 'color-mix(in srgb, var(--color-error) 16%, transparent)';
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = 'color-mix(in srgb, var(--color-error) 8%, transparent)';
                        }}
                    >
                        Eliminar cuenta
                    </button>
                </div>
            </div>
        </div>
    );
}