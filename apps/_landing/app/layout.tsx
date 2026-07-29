import type { Metadata, Viewport } from "next";
import "@fontsource/bricolage-grotesque/500.css";
import "@fontsource/bricolage-grotesque/700.css";
import "@fontsource/bricolage-grotesque/800.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "./globals.css";
import ParallaxEffects from "@/components/ParallaxEffects";

const siteUrl = "https://karnet.katolika.net";
const title = "KaRNet — Rindrambaiko Pastoralin'ny EKAR";
const description =
  "KaRNet dia tambazotra ho an'ny paroasy katolika malagasy: fisoratana amin'ny sakramenta, fanentanana ny kristianina, fotoam-pihaonana amin'ny pretra, vaovao ary fandaharam-potoana. Ny fisoratana anarana eto dia hampahafantatra anao ny fivoaran'ny appli sy hahazoana tombon-dahiny amin'ny andrana teknika.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s · KaRNet",
  },
  description,
  applicationName: "KaRNet",
  keywords: [
    "KaRNet",
    "tambazotra paroasy katolika",
    "sakramenta",
    "fanentanana kristianina",
    "EKAR",
    "eglizy katolika Madagasikara",
    "fiangonana katolika",
  ],
  authors: [{ name: "EKAR" }],
  category: "Community",
  alternates: {
    canonical: "/",
    languages: {
      fr: "/",
      mg: "/",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "KaRNet",
    title,
    description,
    locale: "mg_MG",
    alternateLocale: ["fr_FR"],
    images: [
      {
        url: "/logos/karnet-badge-burgundy.png",
        width: 1024,
        height: 1024,
        alt: "Marika KaRNet — sary K†R volamena amin'ny mena lava",
      },
    ],
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: ["/logos/karnet-badge-burgundy.png"],
  },
  icons: {
    icon: [
      { url: "/logos/karnet-badge-cream.png", sizes: "1024x1024", type: "image/png" },
    ],
    apple: [{ url: "/logos/karnet-badge-cream.png" }],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#670E2E",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "KaRNet",
  url: siteUrl,
  inLanguage: ["mg", "fr"],
  publisher: {
    "@type": "Organization",
    name: "EKAR",
    address: {
      "@type": "PostalAddress",
      addressCountry: "MG",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-cream font-body text-ink antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-burgundy focus:px-4 focus:py-3 focus:text-cream focus:shadow-lg"
        >
          Miala amin'ny navigation, mankany amin'ny votoaty
        </a>
        {children}
        <ParallaxEffects />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
