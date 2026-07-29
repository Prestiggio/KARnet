import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KaRNet — Rindrambaiko Pastoralin'ny EKAR",
    short_name: "KaRNet",
    description:
      "Tambazotra ho an'ny paroasy katolika: sakramenta, fanentanana ny kristianina, fotoam-pihaonana amin'ny pretra.",
    start_url: "/",
    display: "standalone",
    background_color: "#F2EEDC",
    theme_color: "#670E2E",
    icons: [
      {
        src: "/logos/karnet-badge-cream.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logos/karnet-badge-burgundy.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
