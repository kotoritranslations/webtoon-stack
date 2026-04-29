// src/app/api/upload/series/cover/route.ts
//
// Genera una presigned URL para que el cliente suba
// el cover de una serie DIRECTO a R2 sin tocar el servidor.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generatePresignedUploadUrl, generateFileKey } from "@/lib/r2";

const ALLOWED_TYPES = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// ─── POST /api/upload/series/cover ───────────────────────────────────────────
//
// Body JSON:
// {
//   fileName : string
//   fileSize : number   (bytes)
//   mimeType : string   (ej. "image/webp")
// }
//
// Respuesta:
// {
//   uploadUrl : string  — URL firmada para PUT directo a R2 (expira 15 min)
//   key       : string  — key del objeto en R2
//   publicUrl : string  — URL pública final (usar al crear la serie)
// }

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const { fileName, fileSize, mimeType } = (await request.json()) as {
            fileName: string;
            fileSize: number;
            mimeType: string;
        };

        if (!fileName || !fileSize || !mimeType) {
            return NextResponse.json(
                { error: "fileName, fileSize y mimeType son requeridos" },
                { status: 400 }
            );
        }

        if (!ALLOWED_TYPES.has(mimeType)) {
            return NextResponse.json(
                { error: "Formato no soportado. Usa JPG, PNG o WEBP" },
                { status: 400 }
            );
        }

        if (fileSize > MAX_FILE_SIZE_BYTES) {
            return NextResponse.json(
                { error: "El cover no puede superar los 10 MB" },
                { status: 400 }
            );
        }

        const key = generateFileKey(`series/${userId}/covers`, fileName);
        const uploadUrl = await generatePresignedUploadUrl(key, mimeType, 60 * 15);
        const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

        return NextResponse.json({ uploadUrl, key, publicUrl });
    } catch (error) {
        console.error("[upload/series/cover]", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}