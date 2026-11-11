/**
 * Paiement d'acompte en ligne : prévu dans le code mais DÉSACTIVÉ par défaut.
 * Pour l'activer plus tard : ouvrir un compte chez un prestataire (Stripe, ou israélien : Grow / Meshulam / Cardcom),
 * ajouter la clé secrète dans les variables d'environnement Vercel, passer `enabled` à true et créer la route
 * app/api/deposit/route.ts qui ouvre une session de paiement du montant ci-dessous.
 * Tant que `enabled` vaut false, aucun bouton de paiement n'est affiché et rien n'est appelé.
 */
export const deposit = {
  enabled: false,
  /** Acompte en shekels (À REMPLIR avec le client). */
  amount: null as number | null,
  currency: "ILS",
} as const;
