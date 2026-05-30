# Roadmap 30 jours - Labosync Premium

## Semaine 1 - Fiabilite et observabilite

- [x] Logging erreurs client vers backend (`log-client-error`).
- [x] Smoke tests Netlify Functions.
- [x] CI GitHub Actions sur push/PR.
- [x] Alerting erreurs critiques (seuil `ERROR_ALERT_THRESHOLD`, 20 erreurs/heure par défaut).
- [x] Tableau de bord erreurs dans la console admin.

## Semaine 2 - Securite et droits d'acces

- [x] RBAC (roles `admin`, `production`, `billing`, `support`) — stockage `user_metadata.lab_role` + fonction `lab-role`.
- [x] Verification role cote UI + cote fonctions serverless (`_labosync-rbac.js` sur Stripe, emails facturation).
- [ ] Rotation et audit des secrets (Stripe/Supabase/Resend).
- [ ] Journal d'audit des actions sensibles (facture, paiement, credentials cabinet).

## Semaine 3 - Performance et experience

- [ ] Extraire `app.html` en modules JS (`core`, `chat`, `billing`, `cabinet`) — commencé par l'extraction observabilité côté fonctions.
- [ ] Charger a la demande les sections lourdes.
- [ ] Optimiser le polling (backoff + sync incrementale).
- [ ] Harmoniser UX loading/error/success avec design tokens.

## Semaine 4 - Features business "wow"

- [x] Relances factures impayees guidées (J+3, J+7, J+14) — manuelles + cron optionnel (`billingSettings.autoReminders`).
- [x] Timeline unique par cas (creation, etapes, BL, factures, relances) dans le detail travail.
- [x] Export comptable (CSV journal VT, comptes 411/706/709).
- [ ] Dashboard conversion essai -> abonnement -> churn.

## Variables Netlify (relances + alertes)

| Variable | Usage |
|----------|--------|
| `INVOICE_REMINDERS_CRON_SECRET` | Secret optionnel pour déclencher `invoice-reminders-cron` hors schedule Netlify |
| `ERROR_ALERT_THRESHOLD` | Nombre d'erreurs/heure avant alerte (défaut 20) |
| `ERROR_ALERT_COOLDOWN_MIN` | Minutes entre deux alertes (défaut 60) |
| `ERROR_ALERT_EMAIL` | Destinataire email d'alerte |
| `ERROR_ALERT_WEBHOOK_URL` | Webhook Slack/Discord optionnel |

## Definition de "premium"

- 0 blocage silencieux au login/chat/paiement.
- 100% des regressions critiques detectees en CI.
- Temps moyen de diagnostic bug < 10 min.
- Parcours cabinet "commande -> message -> paiement" sans friction.
