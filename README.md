# KARnet

## Prérequis

- Docker
- Docker Compose

## Installation

1. Copier le fichier d'environnement et renseigner les valeurs réelles :
   ```bash
   cp .env.example .env
   ```
2. Démarrer les services :
   ```bash
   docker compose up -d
   ```

`docker-compose.yml` refuse de démarrer si une variable requise manque dans `.env` — c'est voulu, pour éviter de tourner avec des identifiants par défaut.

## Services

| Service    | Port (local uniquement) | Rôle                          |
|------------|--------------------------|-------------------------------|
| database   | —                        | PostgreSQL/PostGIS            |
| directus   | 127.0.0.1:8055           | CMS / API                     |
| neo4j      | 127.0.0.1:7474, 7687     | Base de graphe                |

Les ports sont bindés sur `127.0.0.1` : en production, passer par un reverse proxy (TLS + auth) plutôt que d'exposer ces ports directement sur Internet.

## Données

Toutes les données persistantes vivent sous `./data/` (ignoré par git) :
- `data/database` — PostgreSQL
- `data/uploads`, `data/extensions` — Directus
- `data/neo4j`, `data/neo4j-logs` — Neo4j

## Migration Neo4j vers la production

```bash
# sur la source (dev)
docker compose stop neo4j
tar czf neo4j-data.tar.gz -C data neo4j neo4j-logs

# sur le serveur de production (même arborescence de projet)
tar xzf neo4j-data.tar.gz -C data
docker compose up -d neo4j
```

Si des erreurs de permissions apparaissent après extraction (l'image Neo4j tourne avec l'utilisateur non-root `7474`) :
```bash
sudo chown -R 7474:7474 data/neo4j data/neo4j-logs
```

## Sécurité

- Toutes les variables sensibles (mots de passe, clés Directus, identifiants Neo4j) doivent être définies dans `.env` (jamais commité).
- Neo4j n'autorise que les procédures APOC nécessaires (`apoc.coll.*`, `apoc.map.*`, `apoc.text.*`, `apoc.meta.*`, `apoc.load.json`, `apoc.export.csv.*`, `apoc.import.csv`) plutôt que `apoc.*` en entier.
- Le certificat `./certs/ca.crt` est monté en lecture seule dans Directus.
