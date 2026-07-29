# directus-extension-song-search

Bundle Directus contenant :

- **Interface `song-search`** (UI écrite en **React 18**, montée dans un wrapper Vue minimal) : champ de recherche avec autocomplétion. À la sélection d'un résultat, le champ courant reçoit sa valeur et les autres champs du formulaire sont pré-remplis via `setFieldValue`.
- **Endpoint `/song-search-api`** : proxy serveur vers Elasticsearch (les extensions app ne peuvent pas appeler un serveur externe, et les credentials ES restent côté serveur).

## Installation

```bash
cd directus-extension-song-search
npm install
npm run build
```

Puis copier le dossier dans le répertoire des extensions de Directus :

```
extensions/
└── directus-extension-song-search/
    ├── package.json
    └── dist/
        ├── app.js
        └── api.js
```

En Docker : monter le dossier dans `/directus/extensions/` et redémarrer le conteneur.

## Configuration serveur (env du conteneur Directus)

```env
SONG_SEARCH_ES_URL=https://elasticsearch:9200
SONG_SEARCH_ES_API_KEY=xxxx            # ou SONG_SEARCH_ES_USER + SONG_SEARCH_ES_PASSWORD
SONG_SEARCH_ES_ALLOWED_INDEXES=songs
SONG_SEARCH_ES_FIELDS=title^3,artist^2,album

# Si le cluster ES utilise une CA privée :
NODE_EXTRA_CA_CERTS=/certs/ca.crt
```

## Configuration du champ

1. Créer/éditer un champ de type **string** (ex. `title`) et choisir l'interface **Recherche de chanson (Elasticsearch)**.
2. Options :
   - **Index Elasticsearch** : `songs` (doit être dans la whitelist).
   - **Champ ES stocké dans CE champ** : chemin dans `_source`, ex. `title`.
   - **Mapping** : JSON `{ "champ_directus": "chemin.dans._source" }`, ex. :

```json
{
	"artist": "artist",
	"album": "album",
	"year": "year",
	"duration": "duration_seconds"
}
```

## Pièges connus

- **React dans Directus** : le Data Studio est en Vue 3 ; React n'est pas supporté officiellement. Le wrapper `interface.vue` monte un root React (`react-dom/client`) et le démonte proprement dans `onBeforeUnmount`. Conséquence : les composants UI natifs de Directus (`v-input`, etc.) ne sont pas utilisables dans la partie React — le style est fait avec les variables CSS du thème (`--theme--*`).
- **`setFieldValue` multiple** : Directus n'applique que le dernier `setFieldValue` émis dans un même tick. Le wrapper attend `nextTick()` entre chaque émission.
- **`process.env.NODE_ENV`** : requis par React, remplacé au build via `@rollup/plugin-replace` (voir `extension.config.js`).
