# Lucia — backend du calendrier à rebours

API NestJS du calendrier quotidien **16 août 2026 → 10 septembre 2026** (26 jours).
Chaque jour propose un memory de photos ; la récompense du jour se débloque une fois la partie terminée.
Le jeu tourne côté Angular : le backend ne fournit que la configuration du jour, la validation de complétion et la récompense.

## Démarrage

```bash
npm install
cp .env.example .env          # puis renseigner USER_LOGIN, USER_PIN et JWT_SECRET
openssl rand -base64 48       # valeur à coller dans JWT_SECRET
mkdir -p data/photos          # y déposer 1.webp, 2.webp, ... 18.webp
npm run start:dev
```

Au démarrage, le seed (idempotent) crée les lignes `Day` manquantes et synchronise la table `photos`
avec le contenu réel de `PHOTOS_PATH`. Pour l'exécuter seul : `npm run seed`.

## Variables d'environnement

| Variable         | Défaut                   | Rôle                                                         |
| ---------------- | ------------------------ | ------------------------------------------------------------ |
| `PORT`           | `3000`                   | Port d'écoute                                                |
| `TIMEZONE`       | `Europe/Paris`           | Fuseau du calcul de « aujourd'hui » côté serveur             |
| `CORS_ORIGINS`   | toutes                   | Origines autorisées, séparées par des virgules               |
| `TRUST_PROXY`    | `0`                      | Nombre de reverse proxies devant l'app (1 derrière CapRover) |
| `USER_LOGIN`     | —                        | Identifiant unique (aucun utilisateur en base)               |
| `USER_PIN`       | —                        | PIN à 4 chiffres                                             |
| `JWT_SECRET`     | —                        | Secret de signature, 32 caractères minimum                   |
| `JWT_EXPIRES_IN` | `365d`                   | Durée de vie du token                                        |
| `DATABASE_PATH`  | `./data/database.sqlite` | Fichier SQLite                                               |
| `PHOTOS_PATH`    | `./data/photos`          | Dossier des photos                                           |
| `AUTO_SEED`      | `true`                   | Seed automatique au démarrage                                |

L'application refuse de démarrer si `USER_LOGIN`, `USER_PIN` ou `JWT_SECRET` sont absents ou invalides.

## Endpoints

Toutes les routes exigent `Authorization: Bearer <jwt>`, sauf `POST /auth/login` et `GET /health`.

| Méthode | Route                  | Description                                                                              |
| ------- | ---------------------- | ---------------------------------------------------------------------------------------- |
| `POST`  | `/auth/login`          | `{ login, pin }` → `{ accessToken, tokenType, expiresIn }`. 5 tentatives/min max.        |
| `GET`   | `/days/today`          | Config du jour : difficulté, grille, `photoIds` remélangés, `completed`.                 |
| `POST`  | `/days/:date/complete` | Marque le jour comme complété. Idempotent (`justCompleted` indique le premier appel).    |
| `GET`   | `/days/:date/reward`   | `rewardType` + `rewardContent`, uniquement si le jour est complété (sinon 403).          |
| `GET`   | `/days`                | Vue d'ensemble (debug/admin). Le type de récompense n'apparaît qu'une fois le jour fini. |
| `GET`   | `/photos/:id`          | Image binaire, uniquement pour un id du pool autorisé.                                   |
| `GET`   | `/health`              | Sonde publique : `serverDate` faisant foi + bornes du calendrier.                        |

Codes d'erreur métier renvoyés dans le corps des 403 : `CALENDAR_NOT_STARTED`, `CALENDAR_FINISHED`,
`DAY_NOT_COMPLETED`, `DAY_NOT_AVAILABLE_YET`.

### Côté Angular, pour les photos

Les images étant protégées par le JWT, `<img src="/photos/1">` ne fonctionne pas : il faut les charger
en blob puis créer une object URL.

```ts
this.http
  .get(`${api}/photos/${id}`, { responseType: 'blob' })
  .subscribe((blob) => (this.src = URL.createObjectURL(blob)));
```

## Règles métier

- La date du jour est calculée **exclusivement côté serveur** (`TIMEZONE`) : modifier l'horloge du
  téléphone n'a aucun effet, et compléter un jour futur est refusé.
- Hors période : 403 `CALENDAR_NOT_STARTED` avant le 16/08/2026, 403 `CALENDAR_FINISHED` après le 10/09/2026.
- Les photos d'un jour sont tirées **à la première consultation** (lazy) puis figées en base : recharger
  la page ne change pas le plateau. Seul l'ordre est remélangé à chaque réponse.
- Le tirage privilégie les photos non utilisées lors des 3 jours précédents ; quand le pool est trop
  petit pour l'éviter, il complète par les photos vues le moins récemment.
- Une photo taguée `exclude` dans la table `photos` est retirée du pool de tirage.

## Paliers de difficulté

Définis dans [src/config/calendar.constants.ts](src/config/calendar.constants.ts) :

| Jours   | Paires | Grille |
| ------- | ------ | ------ |
| 1 → 5   | 6      | 3×4    |
| 6 → 10  | 8      | 4×4    |
| 11 → 15 | 10     | 4×5    |
| 16 → 20 | 12     | 4×6    |
| 21 → 26 | 15     | 5×6    |

Le pool de photos doit contenir au moins 15 images (18 recommandées pour limiter les répétitions).

## Récompenses

Le catalogue est dans [src/database/rewards.seed.ts](src/database/rewards.seed.ts), appliqué dans
l'ordre aux 26 jours. Types disponibles : `GAGE`, `ANECDOTE`, `PHOTO`, `MOT_DOUX`, `BON_MASSAGE`,
`INDICE_MYSTERE`. Un contenu commençant par `{` ou `[` est renvoyé désérialisé (utilisé par le type `PHOTO`).

Le seed n'écrase jamais un jour déjà présent en base : pour modifier une récompense après coup, il faut
éditer la ligne correspondante dans SQLite (ou supprimer la base avant le 16 août).

## Docker

```bash
docker compose up -d --build
```

Le dossier `./data` (base SQLite + photos) n'est jamais copié dans l'image : il est monté au runtime
sur le volume `/app/data`.

```bash
docker build -t lucia-game-back .
docker run -d -p 3000:3000 --env-file .env \
  -e DATABASE_PATH=./data/database.sqlite -e PHOTOS_PATH=./data/photos \
  -v "$PWD/data:/app/data" lucia-game-back
```

## Déploiement CapRover

Le fichier [captain-definition](captain-definition) pointe sur le `Dockerfile` : CapRover construit
l'image lui-même et sert l'app derrière son propre nginx (TLS Let's Encrypt inclus).

1. Sur le VPS, créer le dossier persistant et lui donner l'uid du user `node` de l'image :
   ```bash
   mkdir -p /opt/lucia-game/data/photos && chown -R 1000:1000 /opt/lucia-game
   ```
2. Dashboard CapRover → **Apps → One-Click/Create** → nom `lucia-api`, cocher **Has Persistent Data**.
3. Onglet **App Configs** :
   - **Persistent Directories** : `Path in App = /app/data`, `Path on Host = /opt/lucia-game/data`.
   - **Environmental Variables** : voir ci-dessous (`TRUST_PROXY=1` est indispensable).
   - **Instance Count** : rester à **1** (SQLite ne supporte pas plusieurs conteneurs).
4. Onglet **HTTP Settings** : **Container HTTP Port = 3000**, activer HTTPS puis **Force HTTPS**.
5. Depuis le poste de dev : `npm i -g caprover` puis `caprover deploy` à la racine du projet.
6. Copier les photos dans `/opt/lucia-game/data/photos` puis **redémarrer l'app** (la synchronisation
   des photos a lieu au démarrage).

Variables à coller dans **Bulk Edit** :

```
PORT=3000
TIMEZONE=Europe/Paris
CORS_ORIGINS=https://lucia.mondomaine.fr
TRUST_PROXY=1
USER_LOGIN=...
USER_PIN=....
JWT_SECRET=...
JWT_EXPIRES_IN=365d
DATABASE_PATH=./data/database.sqlite
PHOTOS_PATH=./data/photos
AUTO_SEED=true
```

Aucune configuration nginx supplémentaire n'est nécessaire : CapRover gère le proxy, le TLS et le gzip.

## Structure

```
src/
  auth/       login PIN + émission du JWT
  common/     guard JWT global, décorateurs, utilitaires date/aléatoire
  config/     configuration typée, validation .env, constantes du calendrier
  database/   connexion SQLite, seed et catalogue de récompenses
  days/       entité Day, tirage des photos, complétion, récompenses
  photos/     entité Photo, service de fichiers protégé
```
