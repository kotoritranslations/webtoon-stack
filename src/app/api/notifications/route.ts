// src/app/api/notifications/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

// ─── GET /api/notifications ───────────────────────────────────────────────────
//
// Query params:
//   cursor   — id de la última notificación (paginación cursor-based)
//   unread   — "true" para solo no leídas
//
// Responde:
//   {
//     notifications : Notification[]
//     nextCursor    : string | null
//     unreadCount   : number
//   }

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const { searchParams } = new URL(request.url);
        const cursor = searchParams.get("cursor");
        const unreadOnly = searchParams.get("unread") === "true";

        const [notifications, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where: {
                    userId,
                    ...(unreadOnly ? { isRead: false } : {}),
                },
                orderBy: { createdAt: "desc" },
                take: PAGE_SIZE + 1, // +1 para saber si hay más
                ...(cursor
                    ? {
                        cursor: { id: cursor },
                        skip: 1,
                    }
                    : {}),
            }),
            prisma.notification.count({
                where: { userId, isRead: false },
            }),
        ]);

        const hasMore = notifications.length > PAGE_SIZE;
        const items = hasMore ? notifications.slice(0, PAGE_SIZE) : notifications;
        const nextCursor = hasMore ? items[items.length - 1].id : null;

        return NextResponse.json({
            notifications: items,
            nextCursor,
            unreadCount,
        });
    } catch (error) {
        console.error("[GET /api/notifications]", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

// ─── PATCH /api/notifications ─────────────────────────────────────────────────
//
// Body JSON:
//   { action: "mark_read",     id: string }   — marca una como leída
//   { action: "mark_all_read"               }  — marca todas como leídas
//
// Responde:
//   { success: true }

export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const body = await request.json() as {
            action: "mark_read" | "mark_all_read";
            id?: string;
        };

        if (body.action === "mark_read") {
            if (!body.id) {
                return NextResponse.json({ error: "id requerido" }, { status: 400 });
            }

            // Verificar que la notificación pertenece al usuario
            await prisma.notification.updateMany({
                where: { id: body.id, userId },
                data: { isRead: true, readAt: new Date() },
            });

            return NextResponse.json({ success: true });
        }

        if (body.action === "mark_all_read") {
            await prisma.notification.updateMany({
                where: { userId, isRead: false },
                data: { isRead: true, readAt: new Date() },
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
    } catch (error) {
        console.error("[PATCH /api/notifications]", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}