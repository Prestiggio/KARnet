# Développer des extensions Directus

Le conteneur `directus/directus:12.1.1` embarque Node mais pas npm/npx (image
allégée). Pour installer des dépendances, scaffolder une nouvelle extension
ou lancer un script ponctuel (ex. backfill), utiliser le service dédié
`directus-dev` du `docker-compose.yml` à la racine du repo.

Ce service :
- tourne sur `node:22-alpine` (même version de Node que le conteneur Directus) ;
- monte `./apps/_directus/extensions` sur `/workspace`, donc tout ce qui y est
  créé/modifié est immédiatement visible par Directus (`EXTENSIONS_AUTO_RELOAD`) ;
- expose les mêmes variables d'environnement que le conteneur `directus`
  (`ADMIN_EMAIL`/`ADMIN_PASSWORD`, `ELASTICSEARCH_*`, `NEO4J_*`) et
  `DIRECTUS_URL=http://directus:8055` pour joindre l'API depuis le réseau
  Docker interne ;
- est sous le profil `dev` : il ne démarre pas avec un `docker compose up`
  classique.

## Lancer le conteneur de dev

```bash
# one-shot, supprimé en sortie
docker compose --profile dev run --rm directus-dev sh

# ou en arrière-plan, puis s'y connecter à la demande
docker compose --profile dev up -d directus-dev
docker compose exec directus-dev sh
```

## Scaffolder une nouvelle extension

Depuis un shell dans `directus-dev` (working dir = `/workspace`, soit
`apps/_directus/extensions` côté hôte) :

```bash
npx create-directus-extension@latest
```

## Développer une extension existante

```bash
cd search_song       # ou une autre extension
npm install
npm run dev           # build en watch, sans minification
```