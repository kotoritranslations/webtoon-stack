// app/api/settings/notifications/route.ts

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

const PREF_FIELDS = {
    emailNewFollower: true,
    emailNewChapter: true,
    emailNewComment: true,
    emailCommentReply: true,
    pushNewFollower: true,
    pushNewChapter: true,
    pushNewComment: true,
    pushCommentReply: true,
} as const;

// ─── GET /api/settings/notifications ─────────────────────────────────────────
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    const prefs = await prisma.notificationPreference.findUnique({
        where: { userId: session.user.id },
        select: PREF_FIELDS,
    });

    // Si no existe aún, devolvemos null — el cliente usa sus defaults
    return Response.json({ prefs: prefs ?? null });
}

// ─── PATCH /api/settings/notifications ───────────────────────────────────────
export async function PATCH(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();

    // Solo permitimos los campos conocidos — ignoramos cualquier otro
    const data: Partial<Record<keyof typeof PREF_FIELDS, boolean>> = {};
    for (const key of Object.keys(PREF_FIELDS) as (keyof typeof PREF_FIELDS)[]) {
        if (typeof body[key] === 'boolean') data[key] = body[key];
    }

    const prefs = await prisma.notificationPreference.upsert({
        where: { userId: session.user.id },
        create: { userId: session.user.id, ...data },
        update: data,
        select: PREF_FIELDS,
    });

    return Response.json({ prefs });
}