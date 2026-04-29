// app/api/settings/banner/route.ts

import { auth } from '@/lib/auth';
import { generatePresignedUploadUrl, generateFileKey } from '@/lib/r2';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id)
        return Response.json({ error: 'No autorizado' }, { status: 401 });

    const { fileName, fileSize, mimeType } = await req.json();

    if (!fileName || !fileSize || !mimeType)
        return Response.json({ error: 'fileName, fileSize y mimeType son requeridos' }, { status: 400 });

    if (!ALLOWED_TYPES.has(mimeType))
        return Response.json({ error: 'Formato no válido. Usa JPG, PNG o WebP.' }, { status: 400 });

    if (fileSize > MAX_SIZE)
        return Response.json({ error: 'El banner no puede superar 5MB.' }, { status: 400 });

    const key = generateFileKey(`users/${session.user.id}/banner`, fileName);
    const uploadUrl = await generatePresignedUploadUrl(key, mimeType, 60 * 15);

    return Response.json({ uploadUrl, key });
}