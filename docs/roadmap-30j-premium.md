# Roadmap 30 jours - Labosync Premium

## Semaine 1 - Fiabilite et observabilite

- [x] Logging erreurs client vers backend (`log-client-error`).
- [x] Smoke tests Netlify Functions.
- [x] CI GitHub Actions sur push/PR.
- [ ] Alerting erreurs critiques (ex: seuil > 20 erreurs/heure).
- [ ] Tableau de bord erreurs (Datadog/Sentry equivalent).

## Semaine 2 - Securite et droits d'acces

- [ ] RBAC (roles `admin`, `production`, `facturation`, `support`).
- [ ] Verification role cote UI + cote fonctions serverless.
- [ ] Rotation et audit des secrets (Stripe/Supabase/Resend).
- [ ] Journal d'audit des actions sensibles (facture, paiement, credentials cabinet).

## Semaine 3 - Performance et experience

- [ ] Extraire `app.html` en modules JS (`core`, `chat`, `billing`, `cabinet`).
- [ ] Charger a la demande les sections lourdes.
- [ ] Optimiser le polling (backoff + sync incrementale).
- [ ] Harmoniser UX loading/error/success avec design tokens.

## Semaine 4 - Features business "wow"

- [ ] Relances automatiques factures impayees (J+3, J+7, J+14).
- [ ] Timeline unique par cas (messages + BL + facture + etapes).
- [ ] Export comptable (CSV structure + mapping compta).
- [ ] Dashboard conversion essai -> abonnement -> churn.

## Definition de "premium"

- 0 blocage silencieux au login/chat/paiement.
- 100% des regressions critiques detectees en CI.
- Temps moyen de diagnostic bug < 10 min.
- Parcours cabinet "commande -> message -> paiement" sans friction.
