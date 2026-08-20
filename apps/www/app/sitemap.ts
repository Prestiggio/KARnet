import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";

const baseUrl = process.env.BETTER_AUTH_URL;

const pages = ["/", "/legal-notice", "/terms", "/privacy"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.flatMap((page) => {
    const languages = Object.fromEntries(
      routing.locales.map((locale) => [locale, `${baseUrl}${getPathname({ locale, href: page })}`])
    );
    languages["x-default"] = `${baseUrl}${getPathname({ locale: routing.defaultLocale, href: page })}`;

    return routing.locales.map((locale) => ({
      url: `${baseUrl}${getPathname({ locale, href: page })}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: page === "/" ? 1 : 0.5,
      alternates: { languages },
    }));
  });
}