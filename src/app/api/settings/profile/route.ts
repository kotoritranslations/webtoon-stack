// app/api/settings/profile/route.ts

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// ─── GET /api/settings/profile ───────────────────────────────────────────────
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            email: true,
            displayName: true,
            username: true,
            bio: true,
            avatar: true,
            banner: true,
            socialTwitter: true,
            socialInstagram: true,
            socialYoutube: true,
            socialTiktok: true,
            socialWebsite: true,
        },
    });

    if (!user) {
        return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return Response.json({ user });
}

// ─── PATCH /api/settings/profile ─────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const {
        displayName,
        username,
        bio,
        socialTwitter,
        socialInstagram,
        socialYoutube,
        socialTiktok,
        socialWebsite,
    } = body;

    // ── Validar username ──────────────────────────────────────────────────────
    if (username !== undefined) {
        const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
        if (!usernameRegex.test(username)) {
            return Response.json(
                { error: 'El usuario solo puede contener letras, números, _ y -. Entre 3 y 30 caracteres.' },
                { status: 400 },
            );
        }

        const existing = await prisma.user.findUnique({
            where: { username },
            select: { id: true },
        });

        if (existing && existing.id !== session.user.id) {
            return Response.json(
                { error: 'Ese nombre de usuario ya está en uso.' },
                { status: 409 },
            );
        }
    }

    // ── Validar bio ───────────────────────────────────────────────────────────
    if (bio && bio.length > 200) {
        return Response.json(
            { error: 'La biografía no puede superar los 200 caracteres.' },
            { status: 400 },
        );
    }

    // ── Actualizar ────────────────────────────────────────────────────────────
    const updated = await prisma.user.update({
        where: { id: session.user.id },
        data: {
            ...(displayName !== undefined && { displayName: displayName.trim() }),
            ...(username !== undefined && { username: username.trim() }),
            ...(bio !== undefined && { bio: bio.trim() }),
            ...(socialTwitter !== undefined && { socialTwitter: socialTwitter.trim() }),
            ...(socialInstagram !== undefined && { socialInstagram: socialInstagram.trim() }),
            ...(socialYoutube !== undefined && { socialYoutube: socialYoutube.trim() }),
            ...(socialTiktok !== undefined && { socialTiktok: socialTiktok.trim() }),
            ...(socialWebsite !== undefined && { socialWebsite: socialWebsite.trim() }),
        },
        select: {
            id: true,
            displayName: true,
            username: true,
            bio: true,
            avatar: true,
            banner: true,
            socialTwitter: true,
            socialInstagram: true,
            socialYoutube: true,
            socialTiktok: true,
            socialWebsite: true,
        },
    });

    return Response.json({ user: updated });
}