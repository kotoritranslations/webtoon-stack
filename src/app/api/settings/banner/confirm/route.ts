// app/api/settings/banner/confirm/route.ts

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { fileExistsInR2, deleteFromR2, extractKeyFromUrl } from '@/lib/r2';

const PUBLIC_URL = process.env.R2_PUBLIC_URL!;

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id)
        return Response.json({ error: 'No autorizado' }, { status: 401 });

    const { key } = await req.json();
    if (!key)
        return Response.json({ error: 'key es requerido' }, { status: 400 });

    const exists = await fileExistsInR2(key);
    if (!exists)
        return Response.json({ error: 'El archivo aún no está en R2.' }, { status: 404 });

    const current = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { banner: true },
    });
    if (current?.banner) {
        const oldKey = extractKeyFromUrl(current.banner);
        if (oldKey) await deleteFromR2(oldKey);
    }

    const url = `${PUBLIC_URL}/${key}`;
    await prisma.user.update({
        where: { id: session.user.id },
        data: { banner: url },
    });

    return Response.json({ url }, { headers: { 'Cache-Control': 'no-store' } });
}