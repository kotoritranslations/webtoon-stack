"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function toSlug(name: string) {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

const PALETTE = [
    "#ef4444", "#f97316", "#f59e0b", "#84cc16",
    "#22c55e", "#14b8a6", "#3b82f6", "#8b5cf6",
    "#ec4899", "#06b6d4", "#a855f7", "#64748b",
];

function randomColor() {
    return PALETTE[Math.floor(Math.random() * PALETTE.length)];
}

export async function createGenre(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { error: "No autorizado" };

    const name = (formData.get("name") as string)?.trim();
    if (!name || name.length < 2) return { error: "Nombre muy corto" };
    if (name.length > 40) return { error: "Nombre muy largo (máx 40 caracteres)" };

    const slug = toSlug(name);

    const exists = await prisma.genre.findFirst({
        where: { OR: [{ slug }, { name: { equals: name, mode: "insensitive" } }] },
    });
    if (exists) return { error: "Ya existe un género con ese nombre" };

    await prisma.genre.create({
        data: { name, slug, color: randomColor(), isActive: true },
    });

    revalidatePath("/dashboard/genres");
    return { success: true };
}

export async function deleteGenre(id: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "No autorizado" };

    // No eliminar si tiene series asociadas
    const inUse = await prisma.seriesGenre.count({ where: { genreId: id } });
    if (inUse > 0) return { error: `En uso por ${inUse} serie(s), no se puede eliminar` };

    await prisma.genre.delete({ where: { id } });
    revalidatePath("/dashboard/genres");
    return { success: true };
}