// src/lib/notifications.ts
//
// Helper centralizado para crear notificaciones.
// Llamar desde cualquier action/route que dispare un evento.
//
// Uso:
//   await createNotification(prisma, {
//     userId: follower.id,
//     type: "new_follower",
//     actorId: currentUser.id,
//   });

import type { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type NotificationType =
    | "new_follower"   // alguien siguió al creador
    | "new_chapter"    // nuevo capítulo en una serie seguida
    | "new_comment"    // comentario en su serie/capítulo
    | "comment_reply"; // respuesta a su comentario

interface BaseNotificationInput {
    /** Usuario que RECIBE la notificación */
    userId: string;
    type: NotificationType;
    /** Usuario que GENERA la acción (quien sigue, comenta, etc.) */
    actorId?: string;
    actorName?: string;
    actorAvatar?: string;
}

interface NewFollowerInput extends BaseNotificationInput {
    type: "new_follower";
}

interface NewChapterInput extends BaseNotificationInput {
    type: "new_chapter";
    seriesId: string;
    seriesTitle: string;
    seriesSlug: string;
    chapterId: string;
    chapterNumber: number;
    chapterTitle?: string;
    chapterSlug: string;
}

interface NewCommentInput extends BaseNotificationInput {
    type: "new_comment";
    seriesId?: string;
    seriesTitle?: string;
    chapterId?: string;
    commentId: string;
    commentPreview: string;
}

interface CommentReplyInput extends BaseNotificationInput {
    type: "comment_reply";
    commentId: string;
    parentCommentId: string;
    commentPreview: string;
    seriesId?: string;
    chapterId?: string;
}

export type CreateNotificationInput =
    | NewFollowerInput
    | NewChapterInput
    | NewCommentInput
    | CommentReplyInput;

// ─── Builders de título/cuerpo ────────────────────────────────────────────────

function buildNotification(input: CreateNotificationInput): {
    title: string;
    body: string;
    data: Prisma.InputJsonValue;
} {
    const actor = input.actorName ?? "Alguien";

    switch (input.type) {
        case "new_follower":
            return {
                title: "Nuevo seguidor",
                body: `${actor} ha comenzado a seguirte.`,
                data: {
                    actorId: input.actorId,
                    actorAvatar: input.actorAvatar,
                } as Prisma.InputJsonValue,
            };

        case "new_chapter":
            return {
                title: input.seriesTitle,
                body: `Capítulo ${input.chapterNumber}${input.chapterTitle ? `: ${input.chapterTitle}` : ""} ya disponible.`,
                data: {
                    seriesId: input.seriesId,
                    seriesSlug: input.seriesSlug,
                    chapterId: input.chapterId,
                    chapterSlug: input.chapterSlug,
                    chapterNumber: input.chapterNumber,
                } as Prisma.InputJsonValue,
            };

        case "new_comment":
            return {
                title: "Nuevo comentario",
                body: `${actor}: "${input.commentPreview.slice(0, 80)}${input.commentPreview.length > 80 ? "…" : ""}"`,
                data: {
                    commentId: input.commentId,
                    seriesId: input.seriesId,
                    chapterId: input.chapterId,
                    actorId: input.actorId,
                    actorAvatar: input.actorAvatar,
                } as Prisma.InputJsonValue,
            };

        case "comment_reply":
            return {
                title: "Respuesta a tu comentario",
                body: `${actor}: "${input.commentPreview.slice(0, 80)}${input.commentPreview.length > 80 ? "…" : ""}"`,
                data: {
                    commentId: input.commentId,
                    parentCommentId: input.parentCommentId,
                    seriesId: input.seriesId,
                    chapterId: input.chapterId,
                    actorId: input.actorId,
                    actorAvatar: input.actorAvatar,
                } as Prisma.InputJsonValue,
            };
    }
}

// ─── Función principal ────────────────────────────────────────────────────────

/**
 * Crea una notificación en la DB.
 * No lanza si falla — loguea el error silenciosamente para no
 * interrumpir el flujo principal (publicar capítulo, seguir, etc.)
 */
export async function createNotification(
    db: PrismaClient,
    input: CreateNotificationInput
): Promise<void> {
    try {
        // No notificar al propio usuario
        if (input.actorId && input.actorId === input.userId) return;

        // Verificar preferencias del usuario
        const prefs = await db.notificationPreference.findUnique({
            where: { userId: input.userId },
        });

        // Si tiene preferencias configuradas, respetar push
        if (prefs) {
            const pushEnabled =
                (input.type === "new_follower" && prefs.pushNewFollower) ||
                (input.type === "new_chapter" && prefs.pushNewChapter) ||
                (input.type === "new_comment" && prefs.pushNewComment) ||
                (input.type === "comment_reply" && prefs.pushCommentReply);

            if (!pushEnabled) return;
        }

        const { title, body, data } = buildNotification(input);

        await db.notification.create({
            data: {
                userId: input.userId,
                type: input.type,
                title,
                body,
                data,
            },
        });
    } catch (error) {
        console.error("[createNotification] Error:", error);
    }
}

/**
 * Crea notificaciones en bulk (ej: nuevo capítulo → todos los seguidores).
 * Usa createMany para una sola query.
 */
export async function createBulkNotifications(
    db: PrismaClient,
    inputs: CreateNotificationInput[]
): Promise<void> {
    try {
        if (inputs.length === 0) return;

        const notifications = inputs
            .filter((input) => !input.actorId || input.actorId !== input.userId)
            .map((input) => {
                const { title, body, data } = buildNotification(input);
                return {
                    userId: input.userId,
                    type: input.type,
                    title,
                    body,
                    data,
                };
            });

        if (notifications.length === 0) return;

        await db.notification.createMany({ data: notifications });
    } catch (error) {
        console.error("[createBulkNotifications] Error:", error);
    }
}