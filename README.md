# Komi Komi הפקות – nouveau site

Refonte de https://www.2komi.com/ (LiveCity, ~15 ans) : fêtes d'enfants, bar et bat-mitsva, Full Moon, clowns, DJ, bars à bonbons, Pourim.
Next.js 16 · Tailwind 4 · Motion · hébreu (RTL) · devis envoyé sur WhatsApp · aucune base de données.

## Mettre à jour le contenu

| Quoi | Où |
|---|---|
| Téléphones, WhatsApp, email, réseaux, régions, afficher les prix | `data/site.json` |
| Bandeau d'annonce (Pourim, saison…) | `data/annonces.json` |
| Dates déjà prises (prévient le visiteur dans le formulaire) | `data/dates.json` |
| Chiffres de la bande de preuves | `data/stats.json` |
| Grille des réalisations (type, ville, nombre d'enfants) | `data/realisations.json` |
| FAQ commune | `data/faq.json` |
| Libellés de l'interface | `locales/he.json` |
| Textes des pages (événements, catalogue, thèmes, villes) | `scripts/content/*.mjs`, puis `npm run data` |
| Photos à retirer | `scripts/content/exclude.json`, puis `npm run data && npm run media` |

Les fichiers `data/pages.json`, `prestations.json`, `themes.json`, `villes.json`, `avis.json`, `redirects.json`, `media*.json`, `home.json` et `videos.json` sont **générés** par `npm run data` : ne pas les modifier à la main.

## Commandes

```bash
npm run dev               # site en local
npm run data              # régénère les données depuis ancien-site/ et scripts/content/
npm run media             # convertit les photos retenues en WebP (public/media)
npm run build             # construit le site
npm run redirects:check   # teste les 205 redirections 301 (site lancé en local, ou URL en argument)
node scripts/contenu.mjs  # régénère CONTENU.md
```

## Aspiration de l'ancien site (`ancien-site/`)

- `INVENTAIRE.md` : arborescence, compte des pages et des images.
- `contenu-complet.md` : tout le texte d'origine, page par page.
- `seo.csv` : title, meta description, H1 de chaque ancienne page.
- `redirections.csv` : ancienne URL → nouvelle URL, avec le résultat du test.
- `pages/*.json` : une fiche par page ; `avis-livre-d-or.json`, `videos.md`, `formulaires/`.
- `html/` et `images/` (223 Mo) ne sont pas versionnés : ils se régénèrent avec `scripts/ancien-site/` (`crawl.mjs`, `images.mjs`, `inventaire.mjs`).

## Redirections 301

`next.config.ts` lit `data/redirects.json` : chacune des 205 anciennes adresses (chemins en hébreu encodés, `/106214/…`, `/site/…asp`) pointe vers sa nouvelle page. Des filets de sécurité renvoient toute autre adresse `/106214/…` ou `/site/…` vers une page utile.

## Anglais

`locales/en.json` contient les libellés d'interface traduits, non branchés. Pour activer l'anglais : traduire aussi `scripts/content/*.mjs`, ajouter un segment `/en` et un sélecteur de langue. La traduction automatique des navigateurs est bloquée (`translate="no"`, `notranslate`).

## Paiement en ligne

Prévu dans `lib/payment.ts`, désactivé (`enabled: false`). Rien n'est affiché ni appelé tant qu'il n'est pas activé.
