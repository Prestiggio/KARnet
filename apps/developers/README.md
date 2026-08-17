K@Rnet - Référence de l'API pour les développeurs

Application [Next.js](https://nextjs.org) qui sert la documentation de l'API K@Rnet via [Scalar](https://github.com/scalar/scalar) ([app/reference/route.js](app/reference/route.js)), à partir du fichier [public/openapi.json](public/openapi.json).

## Mode développement

### En local (Node)

```bash
npm install
npm run dev
```

Le site est disponible sur [http://localhost:3000](http://localhost:3000) (rechargement automatique à chaque modification, ex. `app/page.tsx`).

### Via Docker

```bash
docker compose up
```

Lance le service `dev` défini dans [docker-compose.yml](docker-compose.yml), avec bind-mount du code source (hot-reload). Le site est disponible sur [http://localhost:3001](http://localhost:3001) (port publié `3001` → conteneur `3000`, pour ne pas entrer en conflit avec `apps/_landing` qui utilise déjà le `3000`).

## Mode production

L'app utilise `output: "standalone"` ([next.config.ts](next.config.ts)), donc `next start` ne fonctionne pas directement — il faut lancer le serveur standalone généré par le build.

### En local / sur un serveur (Node + PM2)

```bash
npm install
npm run build      # génère .next/standalone puis copie public/ et .next/static (script postbuild)
npm run start       # équivaut à: node .next/standalone/server.js
```

Le port par défaut est `3000` ; surchargeable via la variable d'environnement `PORT` :

```bash
PORT=3002 npm run start
```

Pour un déploiement supervisé avec [PM2](https://pm2.keymetrics.io/), utiliser [ecosystem.config.js](ecosystem.config.js) (port `3002` par défaut, modifiable dans le fichier) :

```bash
npm run build
pm2 start ecosystem.config.js
pm2 logs karnet-developers
pm2 restart karnet-developers
```

### Via Docker

```bash
docker build -t karnet-developers --target runner .
docker run -p 3000:3000 -e PORT=3000 karnet-developers
```

Le [Dockerfile](Dockerfile) construit une image multi-stage (`deps` → `builder` → `runner`) et exécute le serveur standalone en tant qu'utilisateur non-root (`nextjs`).

## Ressources

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Scalar API Reference](https://github.com/scalar/scalar/tree/main/packages/nextjs-api-reference)
