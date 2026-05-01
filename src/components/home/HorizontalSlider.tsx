"use client";

// src/components/home/HorizontalSlider.tsx

import { useRef } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

export function HorizontalSlider({ children }: { children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);

    const scroll = (dir: "left" | "right") => {
        if (!ref.current) return;
        ref.current.scrollBy({ left: dir === "right" ? 320 : -320, behavior: "smooth" });
    };

    return (
        <div className="group relative">
            {/* Botón izquierda */}
            <button
                type="button"
                onClick={() => scroll("left")}
                className="absolute left-1 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                style={{
                    backgroundColor: "var(--color-layer-2)",
                    border: "1px solid var(--color-layer-3)",
                    color: "var(--color-text-1)",
                }}
                aria-label="Anterior"
            >
                <CaretLeft size={14} weight="bold" />
            </button>

            {/* Track */}
            <div
                ref={ref}
                className="flex gap-3 overflow-x-auto scroll-smooth px-4 pb-2 sm:px-6"
                style={{ scrollbarWidth: "none" }}
            >
                {children}
            </div>

            {/* Botón derecha */}
            <button
                type="button"
                onClick={() => scroll("right")}
                className="absolute right-1 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                style={{
                    backgroundColor: "var(--color-layer-2)",
                    border: "1px solid var(--color-layer-3)",
                    color: "var(--color-text-1)",
                }}
                aria-label="Siguiente"
            >
                <CaretRight size={14} weight="bold" />
            </button>
        </div>
    );
}