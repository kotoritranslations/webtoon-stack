import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Tag, ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { GenreForm } from "./GenreForm";
import { GenreList } from "./GenreList";

export const metadata = { title: "Géneros — Dashboard" };

export default async function GenresPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const genres = await prisma.genre.findMany({
        orderBy: { name: "asc" },
        select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            _count: { select: { seriesGenres: true } },
        },
    });

    return (
        <div
            className="min-h-screen px-4 py-10 sm:px-6 lg:px-8"
            style={{ backgroundColor: "var(--color-layer-1)" }}
        >
            <div className="mx-auto max-w-2xl">

                {/* Back */}
                <Link
                    href="/dashboard"
                    className="mb-6 inline-flex items-center gap-1.5 text-xs transition-colors hover:text-[var(--color-text-2)]"
                    style={{ color: "var(--color-text-3)" }}
                >
                    <ArrowLeft size={13} weight="bold" />
                    Dashboard
                </Link>

                {/* Header */}
                <div className="mb-8 flex items-center gap-3">
                    <div
                        className="flex h-9 w-9 items-center justify-center rounded-[8px]"
                        style={{ backgroundColor: "var(--color-layer-2)" }}
                    >
                        <Tag size={18} style={{ color: "var(--color-accent, #7c3aed)" }} />
                    </div>
                    <div>
                        <h1
                            className="text-lg font-bold tracking-tight"
                            style={{ color: "var(--color-text-1)" }}
                        >
                            Géneros
                        </h1>
                        <p className="text-xs" style={{ color: "var(--color-text-3)" }}>
                            {genres.length} género{genres.length !== 1 ? "s" : ""} en total
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div
                    className="mb-6 rounded-[10px] p-4"
                    style={{
                        backgroundColor: "var(--color-layer-2)",
                        border: "1px solid var(--color-border)",
                    }}
                >
                    <p className="mb-3 text-xs font-medium" style={{ color: "var(--color-text-2)" }}>
                        Nuevo género
                    </p>
                    <GenreForm />
                </div>

                {/* Lista */}
                <GenreList genres={genres} />
            </div>
        </div>
    );
}