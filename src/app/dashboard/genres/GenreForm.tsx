"use client";

import { useRef, useState, useTransition } from "react";
import { createGenre } from "./actions";
import { Plus } from "@phosphor-icons/react";

export function GenreForm() {
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const ref = useRef<HTMLFormElement>(null);

    function handleSubmit(formData: FormData) {
        setError(null);
        startTransition(async () => {
            const result = await createGenre(formData);
            if (result?.error) {
                setError(result.error);
            } else {
                ref.current?.reset();
            }
        });
    }

    return (
        <form ref={ref} action={handleSubmit}>
            <div className="flex gap-2">
                <input
                    name="name"
                    placeholder="Nombre del género"
                    maxLength={40}
                    required
                    className="flex-1 rounded-[8px] px-3 py-2 text-sm outline-none transition-colors"
                    style={{
                        backgroundColor: "var(--color-layer-2)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text-1)",
                    }}
                    onFocus={e =>
                        (e.currentTarget.style.borderColor = "var(--color-accent)")
                    }
                    onBlur={e =>
                        (e.currentTarget.style.borderColor = "var(--color-border)")
                    }
                />
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-1.5 rounded-[8px] px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: "var(--color-accent, #474747)", color: "#fff" }}
                >
                    <Plus size={14} weight="bold" />
                    {isPending ? "Creando..." : "Crear"}
                </button>
            </div>
            {error && (
                <p className="mt-2 text-xs" style={{ color: "#ef4444" }}>
                    {error}
                </p>
            )}
        </form>
    );
}