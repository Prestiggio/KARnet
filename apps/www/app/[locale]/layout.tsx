import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from 'next-intl';
import { routing } from "@/i18n/routing";
import { getLocale, getTranslations } from "next-intl/server";
import { LG_COUNTRIES } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const Barlow = localFont({
  src: [
    { path: "../../medias/fonts/Barlow-Thin.ttf", weight: "100", style: "normal" },
    { path: "../../medias/fonts/Barlow-ThinItalic.ttf", weight: "100", style: "italic" },
    { path: "../../medias/fonts/Barlow-ExtraLight.ttf", weight: "200", style: "normal" },
    { path: "../../medias/fonts/Barlow-ExtraLightItalic.ttf", weight: "200", style: "italic" },
    { path: "../../medias/fonts/Barlow-Light.ttf", weight: "300", style: "normal" },
    { path: "../../medias/fonts/Barlow-LightItalic.ttf", weight: "300", style: "italic" },
    { path: "../../medias/fonts/Barlow-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../medias/fonts/Barlow-Italic.ttf", weight: "400", style: "italic" },
    { path: "../../medias/fonts/Barlow-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../medias/fonts/Barlow-MediumItalic.ttf", weight: "500", style: "italic" },
    { path: "../../medias/fonts/Barlow-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../medias/fonts/Barlow-SemiBoldItalic.ttf", weight: "600", style: "italic" },
    { path: "../../medias/fonts/Barlow-Bold.ttf", weight: "700", style: "normal" },
    { path: "../../medias/fonts/Barlow-BoldItalic.ttf", weight: "700", style: "italic" },
    { path: "../../medias/fonts/Barlow-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "../../medias/fonts/Barlow-ExtraBoldItalic.ttf", weight: "800", style: "italic" },
    { path: "../../medias/fonts/Barlow-Black.ttf", weight: "900", style: "normal" },
    { path: "../../medias/fonts/Barlow-BlackItalic.ttf", weight: "900", style: "italic" },
  ],
  variable: "--font-barlow",
});

export async function generateMetadata() {

  const [locale, __] = await Promise.all([getLocale(), getTranslations()])
  const base = process.env.BETTER_AUTH_URL

  return {
    metadataBase: new URL(process.env.BETTER_AUTH_URL as string),
    title: __('Katolika, Eglizy en ligne'),
    description: __(`Midira amin'ny paroasinao`),
    alternates: {
      canonical: `${base}/${locale}`,
      languages: {
        mg: "/mg",
        fr: "/fr",
        en: "/en",
        "x-default": "/mg",
      },
    },
    openGraph: {
      url: `/${locale}`,
      type: "website",
      siteName: __('Katolika, Eglizy en ligne'),
      locale: LG_COUNTRIES[locale as keyof typeof LG_COUNTRIES],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => LG_COUNTRIES[l as keyof typeof LG_COUNTRIES]),
    },
  }
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${Barlow.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
