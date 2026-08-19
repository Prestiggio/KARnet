# Configuration RGPD / mentions légales

Les pages légales (`privacy`, `terms`, `legal-notice` dans `components/static/`) chargent leurs variables `{props.data.MA_CLE}` depuis `rgpd.json`, situé dans ce dossier.

`rgpd.json` **n'est pas versionné** (voir `.gitignore` à la racine de `apps/www`) car il contient les informations d'identité légale réelles de l'opérateur : raison sociale, adresse, numéros d'enregistrement, coordonnées de l'hébergeur, etc.

## Après un nouveau clone

`rgpd.json` n'existe pas encore : les pages légales n'affichent alors pas leurs variables tant qu'il n'est pas créé.

1. Copier le gabarit anonymisé :

   ```bash
   cp "rgpd-example.json" "rgpd.json"
   ```

2. Remplacer chaque valeur d'exemple dans `rgpd.json` par l'information réelle correspondante (`rgpd-example.json` liste toutes les clés attendues et sert de référence).
3. Ne jamais commiter `rgpd.json` une fois complété si l'instance est privée — il reste ignoré par git par défaut, ne pas forcer son ajout.

## Ajouter une nouvelle clé

Toute nouvelle clé `{props.data.MA_CLE}` référencée depuis un `.mdx` de `components/static/` doit être ajoutée à la fois dans `rgpd.json` (valeur réelle) et dans `rgpd-example.json` (valeur anonymisée), pour que le gabarit reste complet.
