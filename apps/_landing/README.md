# KaRNet — page de garde / liste d'attente

Landing page Next.js 14 (App Router) + TypeScript + Tailwind CSS pour
`karnet.katolika.net`.

KaRNet est le futur rindrambaiko pastoraly (système pastoral) de
l'EKAR : inscription aux sacrements, suivi des fidèles, prise de
rendez-vous avec un prêtre, actualités et calendrier. Une paroisse
(non nommée pour l'instant) en est la paroisse pilote.

Cette page est le teaser provisoire du projet : elle collecte les
personnes intéressées à suivre son avancement (liste d'attente),
avant l'ouverture aux autres paroisses. La liste d'attente sert
surtout à annoncer l'avancement de l'appli et à inviter aux beta-tests
de fonctionnalités isolées.

## Démarrer en local

```bash
npm install
npm run dev
```

Ouvrir http://localhost:3000

## Build de production

```bash
npm run build
npm run start
```

Le projet a été buildé et vérifié (types stricts, génération statique,
route API) avant livraison.

## Lancer avec Docker

**Développement (hot-reload)** :

```bash
docker compose up
```

Le code local est monté dans le conteneur (`npm run dev`), les
modifications sont prises en compte à la volée.

**Production** :

```bash
docker build -t karnet-landing .
docker run -p 3000:3000 karnet-landing
```

Ouvrir http://localhost:3000. L'image de production utilise la sortie
`standalone` de Next.js (image finale `node:20-alpine`, sans
`node_modules` complet).

## Déploiement sur karnet.katolika.net

N'importe quel hébergeur Node.js convient (Vercel, un VPS avec PM2 +
Nginx, etc.) — le projet est un Next.js standard, pas de config
propriétaire.

**Sur le VPS existant (PM2 + Nginx, comme les autres apps Prestiggio) :**

```bash
git clone <repo> karnet-landing && cd karnet-landing
npm install
npm run build
pm2 start npm --name karnet-landing -- start -- -p <PORT_LIBRE>
```

Puis configurer un vhost Nginx Proxy Manager pointant
`karnet.katolika.net` vers `http://127.0.0.1:<PORT_LIBRE>`, avec
certificat SSL (Let's Encrypt).

## Formulaire d'inscription

Le formulaire envoie `{ phone, name, consent }` en `POST` vers
`/app/api/subscribe/route.ts`. Cette route **valide** les données
(format de numéro malgache, consentement obligatoire) et journalise
la demande, mais n'est **pas encore connectée** à un stockage
définitif. Avant la mise en production réelle, brancher cette route
sur :

- Directus (cohérent avec la stack Prestiggio déjà utilisée pour
  Fototra/Katolika.net), ou
- un service SMS/newsletter (ex. une table Postgres + un provider
  SMS malgache), ou
- une simple table du VPS existant.

Le point d'intégration est clairement marqué par un commentaire
`// TODO` dans `app/api/subscribe/route.ts`.

## Logos

Les deux badges fournis sont utilisés tels quels dans
`public/logos/` :
- `karnet-badge-cream.png` — badge fond crème (posé sur les sections
  bordeaux : héros, footer)
- `karnet-badge-burgundy.png` — badge fond bordeaux (posé sur les
  sections crème : en-tête, favicon, OG image)

## Accessibilité

- Lien d'évitement ("Miala amin'ny navigation…") vers le contenu principal
- Formulaire entièrement labellisé (`label` associés, `aria-describedby`,
  `aria-live` pour les messages d'état, `aria-invalid`)
- Contrastes de texte vérifiés ≥ 4.5:1 (≥ 3:1 pour les éléments UI
  non-textuels) sur toutes les combinaisons couleur/fond utilisées
- Focus clavier visible partout (anneau doré, `:focus-visible`)
- `prefers-reduced-motion` respecté (anime uniquement si l'utilisateur
  ne l'a pas désactivé)
- FAQ en `<details>/<summary>` natifs (utilisables au clavier sans JS)
- Champ piège à robots (honeypot) masqué proprement aux lecteurs d'écran

## SEO / AEO

- Meta title/description bilingues (malgache/français), Open Graph,
  Twitter Card
- `robots.ts`, `sitemap.ts`, `manifest.ts` générés par Next.js
- JSON-LD `WebSite` + `CatholicChurch` (layout) et `FAQPage` (section FAQ)
  pour améliorer la compréhension par les moteurs de réponse (AEO)
- Section FAQ répondant directement aux questions fréquentes en langage
  naturel, ancrée par les mêmes données que le JSON-LD `FAQPage`
