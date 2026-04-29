"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  Globe, 
  InstagramLogo, 
  DiscordLogo,
  CheckCircle 
} from "@phosphor-icons/react";

type AccessLevel = "free" | "member" | "premium";

interface HeroBannerProps {
  creatorName: string;
  creatorBio: string;
  creatorImage: string;
  bannerImage: string;
  stats: {
    total: number;
    free: number;
    member: number;
    premium: number;
  };
  subscriberCount: number;
  userAccessLevel: AccessLevel;
}

export function HeroBanner({
  creatorName,
  creatorBio,
  creatorImage,
  bannerImage,
  userAccessLevel,
}: HeroBannerProps) {
  const hasAccess = userAccessLevel !== "free";

  return (
    <div className="relative w-full">
      {/* Banner Image - Full width con gradient hacia abajo */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-900 sm:h-56 lg:h-64 dark:bg-gray-900 light:bg-gray-100">
        <Image
          src={bannerImage}
          alt="Banner"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient oscuro hacia abajo para que se desvanezca */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-950 dark:to-gray-950 light:to-gray-50" />
        </div>

      {/* Container del perfil */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Profile Info */}
        <div className="relative -mt-12 sm:-mt-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 pb-8 border-b border-gray-800/50 dark:border-gray-800/50 light:border-gray-200">
            {/* Avatar + Info */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-5">
              {/* Avatar */}
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 overflow-hidden rounded-full border-4 border-gray-950 bg-gray-900 dark:border-gray-950 dark:bg-gray-900 light:border-white light:bg-gray-100 shadow-xl flex-shrink-0">
                <Image
                  src={creatorImage}
                  alt={creatorName}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Name + Bio + Social */}
              <div className="flex-1 min-w-0 pb-1">
                {/* Nombre con verificado */}
                <div className="flex items-center gap-2 mb-1.5">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white dark:text-white light:text-black">
                    {creatorName}
                  </h1>
                  <CheckCircle 
                    size={24} 
                    weight="fill" 
                    className="text-blue-500 dark:text-blue-500 light:text-blue-600 flex-shrink-0" 
                  />
                </div>
                
                {/* Bio */}
                <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600 max-w-2xl mb-3 leading-relaxed">
                  {creatorBio}
                </p>

                {/* Social Links */}
                <div className="flex items-center gap-2">
                  <a
                    href="https://example.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-900 transition-colors dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-900 light:text-gray-600 light:hover:text-black light:hover:bg-gray-100"
                    title="Website"
                  >
                    <Globe size={18} weight="bold" />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-900 transition-colors dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-900 light:text-gray-600 light:hover:text-black light:hover:bg-gray-100"
                    title="Instagram"
                  >
                    <InstagramLogo size={18} weight="bold" />
                  </a>
                  <a
                    href="https://discord.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-900 transition-colors dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-900 light:text-gray-600 light:hover:text-black light:hover:bg-gray-100"
                    title="Discord"
                  >
                    <DiscordLogo size={18} weight="bold" />
                  </a>
                </div>
              </div>
            </div>

            {/* Subscribe Button */}
            <div className="flex-shrink-0 pb-1">
              {!hasAccess ? (
                <Link
                  href="/subscribe"
                  className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-black transition-all hover:bg-gray-100 dark:bg-white dark:text-black dark:hover:bg-gray-100 light:bg-black light:text-white light:hover:bg-gray-800"
                >
                  Suscribirse
                </Link>
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-medium text-emerald-400">
                    {userAccessLevel === "premium" ? "Premium" : "Miembro"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}