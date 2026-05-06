// src/components/NavbarWrapper.tsx

import { getSiteSettings } from "@/config/site";
import { Navbar } from "@/components/navbar";

export async function NavbarWrapper() {
    const site = await getSiteSettings();
    return <Navbar siteName={site.name} logoUrl={site.logoUrl ?? null} />;
}