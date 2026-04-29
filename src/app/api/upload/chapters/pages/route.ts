// src/app/api/upload/chapters/pages/route.ts
//
// Genera presigned URLs para que el cliente suba
// páginas de un capítulo DIRECTO a R2.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generatePresignedUploadUrl, generateFileKey } from "@/lib/r2";

const ALLOWED_TYPES = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
]);

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB por página

// ─── POST /api/upload/chapters/pages ─────────────────────────────────────────
//
// Body JSON:
// {
//   pages: {
//     fileName : string
//     fileSize : number
//     mimeType : string
//   }[]
// }
//
// Respuesta:
// {
//   pages: {
//     uploadUrl : string
//     key       : string
//     publicUrl : string
//     fileName  : string  — para identificar en el cliente
//   }[]
// }

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const { pages } = (await request.json()) as {
            pages: { fileName: string; fileSize: number; mimeType: string }[];
        };

        if (!Array.isArray(pages) || pages.length === 0) {
            return NextResponse.json({ error: "Se requiere al menos una página" }, { status: 400 });
        }

        if (pages.length > 200) {
            return NextResponse.json({ error: "Máximo 200 páginas por capítulo" }, { status: 400 });
        }

        // Validar cada página
        for (const page of pages) {
            if (!page.fileName || !page.fileSize || !page.mimeType) {
                return NextResponse.json({ error: "fileName, fileSize y mimeType son requeridos" }, { status: 400 });
            }
            if (!ALLOWED_TYPES.has(page.mimeType)) {
                return NextResponse.json(
                    { error: `Formato no soportado: ${page.fileName}. Usa JPG, PNG o WEBP` },
                    { status: 400 }
                );
            }
            if (page.fileSize > MAX_FILE_SIZE_BYTES) {
                return NextResponse.json(
                    { error: `${page.fileName} supera el límite de 20 MB` },
                    { status: 400 }
                );
            }
        }

        // Generar presigned URLs en paralelo
        const results = await Promise.all(
            pages.map(async (page) => {
                const key = generateFileKey(`chapters/${userId}/pages`, page.fileName);
                const uploadUrl = await generatePresignedUploadUrl(key, page.mimeType, 60 * 30); // 30 min
                const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
                return { uploadUrl, key, publicUrl, fileName: page.fileName };
            })
        );

        return NextResponse.json({ pages: results });
    } catch (error) {
        console.error("[upload/chapters/pages]", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}