// src/middleware.ts

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // ← agrega esta línea

export default auth((req) => {
    const { pathname } = req.nextUrl;

    if (pathname.startsWith("/admin")) {
        if (!req.auth?.user?.email) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail || req.auth.user.email !== adminEmail) {
            return NextResponse.redirect(new URL("/", req.url));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/admin/:path*"],
};