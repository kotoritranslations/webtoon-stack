"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="not-found-root">
            <div className="not-found-content">
                <p className="not-found-number" aria-label="Error 404">
                    404
                </p>

                <div className="not-found-divider" />

                <h1 className="not-found-headline">Página no encontrada</h1>

                <p className="not-found-subtext">
                    La ruta que buscas no existe o fue movida a otro lugar.
                </p>

                <div className="not-found-actions">
                    <Link href="/" className="not-found-btn-primary">
                        Ir al inicio
                    </Link>
                    <button
                        onClick={() => router.back()}
                        className="not-found-btn-ghost"
                    >
                        Volver atrás
                    </button>
                </div>
            </div>

            <style>{`
        .not-found-root {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--color-layer-1);
          font-family: var(--font-sans);
          padding: 2rem;
        }

        .not-found-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 360px;
          width: 100%;
        }

        .not-found-number {
          font-size: clamp(5rem, 16vw, 8rem);
          font-weight: 700;
          line-height: 1;
          letter-spacing: -0.06em;
          color: var(--color-layer-4);
          margin: 0;
          user-select: none;
        }

        .not-found-divider {
          width: 24px;
          height: 1px;
          background-color: var(--color-layer-4);
          margin: 1.75rem 0;
        }

        .not-found-headline {
          font-size: 1rem;
          font-weight: 500;
          color: var(--color-text-1);
          letter-spacing: -0.01em;
          margin: 0 0 0.5rem;
        }

        .not-found-subtext {
          font-size: 0.8125rem;
          color: var(--color-text-3);
          line-height: 1.65;
          margin: 0;
        }

        .not-found-actions {
          display: flex;
          gap: 8px;
          margin-top: 2rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .not-found-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 34px;
          padding: 0 1.25rem;
          border-radius: var(--radius-md);
          background-color: var(--color-text-1);
          color: var(--color-layer-1);
          font-size: 0.8125rem;
          font-weight: 500;
          font-family: var(--font-sans);
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: opacity 0.15s ease;
          white-space: nowrap;
        }
        .not-found-btn-primary:hover {
          opacity: 0.8;
        }

        .not-found-btn-ghost {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 34px;
          padding: 0 1.25rem;
          border-radius: var(--radius-md);
          background-color: transparent;
          color: var(--color-text-3);
          font-size: 0.8125rem;
          font-weight: 400;
          font-family: var(--font-sans);
          border: none;
          cursor: pointer;
          transition: color 0.15s ease;
          white-space: nowrap;
        }
        .not-found-btn-ghost:hover {
          color: var(--color-text-2);
        }
      `}</style>
        </div>
    );
}