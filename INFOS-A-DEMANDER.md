# Komi Komi : informations à demander au client

Rien n'a été inventé sur le site. Tout ce qui manque est listé ici, avec l'endroit où le renseigner.

## À confirmer en priorité

| Sujet | Ce qui est en place | Où le changer |
|---|---|---|
| Année de début | « 2009 » : déduite des premiers messages du livre d'or (mars 2009) et de « מעל עשור בתחום » sur l'ancien site. À confirmer. | `data/stats.json` → `sinceYear` (mettre `null` pour masquer la pastille) |
| Nombre d'événements produits | Masqué | `data/stats.json` → `events` |
| Numéro WhatsApp des demandes | 052-319-0259 (972523190259) | `data/site.json` → `whatsapp` |
| Numéros à garder | 052-319-0259 et 052-437-8733, tous les deux affichés | `data/site.json` → `phones` |
| Email | Aucun trouvé. Dès qu'il est renseigné, le formulaire propose aussi « שליחת עותק במייל ». | `data/site.json` → `email` |
| Régions couvertes | Haïfa et Krayot, Nord et vallées, Galilée, Sharon, Gush Dan et centre, Sud « sur demande ». Les 65 pages villes existaient déjà sur l'ancien site. | `data/site.json` → `regions` |

## Prix et forfaits

- Seul prix trouvé sur l'ancien site : photographe + magnets, 1 100 ₪ au Nord, 1 499 ₪ au centre et dans le Sharon (2 h, à partir de 100 invités). Il est affiché « החל מ-1,100 ₪ ». Toujours valable ?
- Prix « à partir de » pour les autres prestations (DJ, clowns, anniversaire à thème, bar à bonbons, Full Moon, stands…) : à donner, ou à laisser sans prix. `scripts/content/core.mjs` → `priceFrom`.
- Pour masquer tous les prix d'un coup : `data/site.json` → `showPrices: false`.
- Acompte et moyens de paiement : la FAQ dit seulement que les conditions sont dans le devis. Paiement en ligne prévu dans `lib/payment.ts`, désactivé.

## Histoire et équipe

- L'histoire de Komi Komi en quelques lignes (les débuts de Liraz et Kobi comme clowns, puis les productions).
- Combien d'animateurs et de DJ dans l'équipe aujourd'hui ?
- Le lien exact avec « Liraz Bar » et « Kobi Bar » (le site les nomme : productrice Liraz Bar, DJ Kobi Bar sur les photos).

## Prestations

- Prestations qui n'existent plus ? 19 pages de l'ancien site étaient cassées (erreur 500) : magicien, karaoké, bar actif, atelier maquillage, marionnettes géantes, structures gonflables, stations multimédia, animateurs… Elles ont été recréées à partir de la Wayback Machine. À supprimer si le service n'existe plus (`scripts/content/core.mjs`).
- Page « אירועים עסקיים » : l'ancienne disait seulement « en travaux ». Le texte actuel est écrit à partir du reste du site (stands, bar à bonbons, tables de jeux) : à valider ou compléter.
- Prestations nouvelles à ajouter ?
- Thèmes d'anniversaire : 23 repris de l'ancien site. La page d'accueil de l'ancien site cite aussi K-pop, Roblox, ninja, karaoké pop-star, fées : à ajouter s'ils existent vraiment.
- Casherout : « כשר מהדרין פרווה » est repris de l'ancien site pour les bars à bonbons. Certificat à confirmer.

## Photos et vidéos

- 936 images récupérées, 261 utilisées. Écartées : affiches chargées de texte, visuels de personnages (Pokémon, Barbie, Roblox…), photos de machines sur fond blanc, et gros plans d'enfants.
- **Accord des parents** : certaines photos de galerie montrent des enfants de loin ou de dos (fêtes, rondes). Les photos où un enfant est le sujet principal ont été retirées. Pour en retirer d'autres : ajouter leur référence dans `scripts/content/exclude.json` puis `npm run data && npm run media`. Pour en remettre, avec accord écrit : les retirer de cette liste.
- Photos récentes en bonne qualité (surtout : clowns en action, DJ, événements d'entreprise, stands de nourriture, magicien, karaoké, bar actif, marionnettes géantes, maquillage : ces pages n'ont pas de photo).
- Une vidéo courte pour le hero (10 à 15 s, horizontale, sans son) : le hero affiche pour l'instant une photo ; la vidéo pourra la remplacer.
- Les 78 vidéos YouTube de l'ancien site sont listées dans `ancien-site/videos.md` ; 9 sont affichées sur la page des avis (elles sont toutes encore en ligne). Lesquelles garder ?
- Grille « réalisations » : ville et nombre d'enfants de chaque événement (`data/realisations.json` → `city`, `kids`), laissés vides.

## Logo

- Le logo de l'ancien site est trop pixellisé. Un logo typographique a été dessiné (« קומי קומי » + ballon). Si un fichier d'origine existe (AI, SVG, PNG grand format), l'envoyer.

## Avis

- 89 avis du livre d'or sont repris mot pour mot (sans les noms de famille des titres ni les emails), de 2009 à 2021. Souhaite-t-il en ajouter de récents (captures WhatsApp, Google) ?
- Les 9 captures d'écran de « לקוחות ממליצים » sont trop petites pour être lues : non reprises.

## Mise en ligne sur 2komi.com

- Accès au nom de domaine 2komi.com (registrar ou LiveCity) pour le pointer vers Vercel. Les 205 anciennes adresses ont chacune leur redirection 301 (`ancien-site/redirections.csv`, testées par `npm run redirects:check`).
- Une fois le domaine branché : mettre `https://www.2komi.com` dans `data/site.json` → `url`, puis déclarer le site dans Google Search Console et y envoyer `sitemap.xml`.
- Garder l'ancien hébergement LiveCity quelques jours après la bascule, le temps de vérifier.

## Anglais

- Les libellés d'interface sont traduits dans `locales/en.json`, non branchés. Activer l'anglais demandera aussi de traduire les textes des pages (`scripts/content/*.mjs`).
