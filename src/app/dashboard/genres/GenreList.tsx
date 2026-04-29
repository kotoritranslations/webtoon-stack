"use client";

import { useState, useTransition } from "react";
import { deleteGenre } from "./actions";
import { Trash } from "@phosphor-icons/react";

interface Genre {
    id: string;
    name: string;
    slug: string;
    color: string | null;
    _count: { seriesGenres: number };
}

export function GenreList({ genres }: { genres: Genre[] }) {
    const [isPending, startTransition] = useTransition();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function handleDelete(id: string) {
        setDeletingId(id);
        setErrors({});
        startTransition(async () => {
            const result = await deleteGenre(id);
            if (result?.error) {
                setErrors(prev => ({ ...prev, [id]: result.error! }));
            }
            setDeletingId(null);
        });
    }

    if (genres.length === 0) {
        return (
            <p className="py-8 text-center text-sm" style={{ color: "var(--color-text-3)" }}>
                Aún no hay géneros. ¡Crea el primero!
            </p>
        );
    }

    return (
        <ul className="flex flex-col gap-1.5">
            {genres.map((g) => (
                <li
                    key={g.id}
                    className="flex items-center justify-between rounded-[8px] px-3 py-2.5"
                    style={{
                        backgroundColor: "var(--color-layer-2)",
                        border: "1px solid var(--color-border)",
                    }}
                >
                    <div className="flex items-center gap-2.5">
                        {/* Dot de color */}
                        <span
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: g.color ?? "#64748b" }}
                        />
                        <span className="text-sm font-medium" style={{ color: "var(--color-text-1)" }}>
                            {g.name}
                        </span>
                        <span className="text-xs" style={{ color: "var(--color-text-3)" }}>
                            /{g.slug}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs" style={{ color: "var(--color-text-3)" }}>
                            {g._count.seriesGenres} serie{g._count.seriesGenres !== 1 ? "s" : ""}
                        </span>
                        {errors[g.id] && (
                            <span className="text-xs" style={{ color: "#ef4444" }}>
                                {errors[g.id]}
                            </span>
                        )}
                        <button
                            onClick={() => handleDelete(g.id)}
                            disabled={isPending && deletingId === g.id}
                            className="flex h-7 w-7 items-center justify-center rounded-[6px] transition-colors disabled:opacity-40"
                            style={{ color: "var(--color-text-3)" }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.backgroundColor = "#ef444420";
                                (e.currentTarget as HTMLElement).style.color = "#ef4444";
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                                (e.currentTarget as HTMLElement).style.color = "var(--color-text-3)";
                            }}
                            title="Eliminar género"
                        >
                            <Trash size={14} />
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );
}