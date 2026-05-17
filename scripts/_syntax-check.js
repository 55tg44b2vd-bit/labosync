
/*
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                    TABLE DES MATIÈRES                        ║
 * ╠══════════════════════════════════════════════════════════════╣
 * ║  §1  — CONFIG                                                ║
 * ║  §2  — TYPES DE TRAVAUX                                      ║
 * ║  §3  — STATE                                                 ║
 * ║  §4  — DATE & UTILS                                          ║
 * ║  §5  — TECH ASSIGNMENT                                       ║
 * ║  §6  — JOB MANAGEMENT                                        ║
 * ║  §7  — DASHBOARD                                             ║
 * ║  §8  — TECH GRID & PLANNING                                  ║
 * ║  §9  — CALENDAR                                              ║
 * ║  §10 — PRINTING / IMPRESSION                                 ║
 * ║  §11 — SCAN                                                  ║
 * ║  §12 — STATS                                                 ║
 * ║  §13 — HISTORIQUE                                            ║
 * ║  §14 — CABINETS                                              ║
 * ║  §15 — JOBS TABLE & QR CODE                                  ║
 * ║  §16 — EVENTS                                                ║
 * ║  §17 — WAITING LIST & ABSENCES & CONGÉS                      ║
 * ║  §18 — TASK MODAL & TRACK CODE                               ║
 * ║  §19 — WAITING LIST                                          ║
 * ║  §20 — SUIVI (PORTAL)                                        ║
 * ║  §21 — ÉQUIPE & TYPES PERSONNALISÉS                          ║
 * ║  §22 — ABSENCES & CONGÉS                                     ║
 * ║  §23 — CLOUD SYNC                                            ║
 * ║  §24 — QUEUE (FILE D'ATTENTE)                                ║
 * ║  §25 — FACTURATION / INVOICES                                ║
 * ║  §26 — STRIPE — PAIEMENT EN LIGNE                            ║
 * ║  §27 — SEARCH                                                ║
 * ║  §28 — BONS DE COMMANDE (BDC)                                ║
 * ║  §29 — BONS DE LIVRAISON (BDL) & PORTAIL CABINET             ║
 * ║  §30 — FACTURE MODALE & LIVRAISONS                           ║
 * ║  §31 — LIVRAISONS                                            ║
 * ║  §32 — INIT                                                  ║
 * ║  §33 — AUTH                                                  ║
 * ║  §34 — REALTIME & AI ASSISTANT                               ║
 * ║  §35 — MESSAGES / CHAT LABO ↔ CABINET                        ║
 * ║  §36 — JOB DETAIL PANEL                                      ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

/* ══════════════════════════════════════════
   §0 — INTERNATIONALISATION (i18n)
   ══════════════════════════════════════════ */
let currentLang = localStorage.getItem('lb_lang') || 'fr';

const TRANSLATIONS = {
  fr: {
    'auth.loading':'Chargement…',
    'auth.subtitle.login':'Connectez-vous à votre espace laboratoire',
    'auth.subtitle.signup':'Créez votre espace laboratoire',
    'auth.label.email':'Email',
    'auth.label.password':'Mot de passe',
    'auth.label.labname':'Nom du laboratoire',
    'auth.ph.labname':'ex: Laboratoire Dupont',
    'auth.ph.pass':'Minimum 6 caractères',
    'auth.btn.login':'Se connecter',
    'auth.btn.signup':'Créer mon compte',
    'auth.switch.noaccount':'Pas encore de compte ?',
    'auth.switch.hasaccount':'Déjà un compte ?',
    'auth.btn.toggle':'Créer un compte',
    'auth.btn.toggle.back':'Se connecter',
    'auth.err.fields':'Veuillez remplir tous les champs.',
    'auth.err.badpass':'Email ou mot de passe incorrect.',
    'auth.err.shortpass':'Le mot de passe doit faire au moins 6 caractères.',
    // Header
    'header.tagline':'Fait par des prothésistes pour des prothésistes',
    'header.logout':'⎋ Déconnexion',
    // Mode bar
    'mode.labo':'Laboratoire',
    'mode.fact':'Facturation',
    'mode.messages':'Messages',
    // Tabs labo
    'tab.dashboard':'🏠 Accueil',
    'tab.saisie':'📋 Travaux',
    'tab.calendrier':'📅 Calendrier',
    'tab.impression':'🖨️ Impression',
    'tab.attente':'⏸ En attente',
    'tab.equipe':'👥 Équipe',
    'tab.stats':'📊 Stats',
    'tab.parametres':'⚙️ Paramètres',
    // Tabs fact
    'tab.cabinets':'🏥 Cabinets',
    'tab.livraisons':'📬 Livraisons',
    'tab.facturation':'💰 Facturation',
    'tab.historique':'🗂️ Historique',
    // Saisie form
    'job.card.title':'📝 Nouveau travail',
    'job.card.sub':'Entrez les informations du travail à réaliser.',
    'form.patient':'Code patient',
    'form.ph.patient':'Dupont Martin',
    'form.type':'Type',
    'form.nb':'Éléments',
    'form.note':'Note / instructions',
    'form.ph.note':'teinte A2, instructions...',
    'form.delivery':'📅 Date de livraison',
    'form.cabinet':'🏥 Cabinet',
    'form.none':'— Aucun —',
    'form.urgent':'🔴 Urgent',
    'form.digital':'📡 Empreinte numérique',
    'form.add_type':'+ Autre type',
    'form.add_job':'+ Ajouter le travail',
    // Table headers
    'th.patient':'Code patient',
    'th.type':'Type',
    'th.step':'Étape',
    'th.tech':'Technicien',
    'th.date':'Date prévue',
    'th.date.simple':'Date',
    'th.note':'Note / Teinte',
    'th.status':'Statut',
    'th.clearall':'Tout effacer',
    'btn.cancel':'Annuler',
    // Calendar
    'cal.week':'Semaine',
    'cal.month':'Mois',
    // Queue
    'queue.title':'📥 À programmer',
    // Dashboard
    'dash.greeting':'Bonjour',
    'dash.today':'Aujourd\'hui',
    'dash.jobs_today':'travaux aujourd\'hui',
    'dash.pending':'à programmer',
    'dash.late':'en retard',
    // Common
    'common.save':'Enregistrer',
    'common.cancel':'Annuler',
    'common.delete':'Supprimer',
    'common.edit':'Modifier',
    'common.add':'Ajouter',
    'common.confirm':'Confirmer',
    'common.close':'Fermer',
    'common.apply':'Appliquer',
    'common.yes':'Oui',
    'common.no':'Non',
    'common.loading':'Chargement…',
    'common.saving':'Sauvegarde…',
    'common.saved':'Sauvegardé',
    'common.error':'Erreur',
    'common.send':'Envoyer',
    // Settings
    'settings.title':'⚙️ Paramètres',
    'settings.techs':'Techniciens',
    'settings.types':'Types de travaux',
    'settings.legal':'Informations légales',
    'settings.conges':'Congés du laboratoire',
    'settings.absences':'Absences',
    // Stats
    'stats.title':'Statistiques',
    'stats.jobs_total':'Travaux réalisés',
    'stats.by_type':'Par type','stats.workload_days':'Charge par jour (2 semaines)',
    'stats.by_tech':'Par technicien',
    'search.placeholder':'🔍 Code patient, code travail...',
    // Status docs
    'status.brouillon':'Brouillon','status.envoye':'Envoyé','status.paye':'Payé',
    'status.annule':'Annulé','status.avoir':'Avoir','status.commande':'Commandé',
    'status.recu_bdc':'Réceptionné',
    // Status suivi
    'suivi.recu':'Reçu','suivi.production':'En production',
    'suivi.finition':'En finition','suivi.pret':'Prêt à livrer',
    // Empty states
    'empty.tasks':'Aucune tâche','empty.jobs':'Aucun travail',
    'empty.jobs_found':'Aucun travail trouvé','empty.queue':'✅ Aucun travail en attente',
    'empty.techs':'Aucun technicien configuré','empty.types':'Aucun type de travail configuré.',
    'empty.steps':'Aucune programmation. Vous pouvez enregistrer le type tel quel, ou cliquer "+ Ajouter une étape" si vous planifiez ce travail par technicien.','empty.cabinets':'Aucun cabinet enregistré.',
    'empty.docs':'Aucun document.','empty.tarifs':'Aucun tarif enregistré.',
    'empty.bdc':'Aucun bon de commande.','empty.fourns':'Aucun fournisseur configuré.',
    'empty.bdl_pending':'Aucun travail sans bon de livraison.','empty.bdl':'Aucun bon émis.',
    'empty.history':'Aucun résultat','empty.messages':'Aucun message. Démarrez la conversation !','empty.messages_short':'Aucun message',
    'empty.absences':'Aucune absence.','empty.conges':'Aucun jour de fermeture.',
    'empty.synonymes':'Aucun synonyme.','empty.scans':'Aucun scan récent.',
    'empty.waiting':'✅ Aucun travail en attente — ajoutez-en depuis 📝 Travaux',
    'empty.suivi':'Aucun travail en cours.','empty.suivi.title':'Travaux en cours',
    // Alerts
    'alert.enter_patient':'Entrez le code patient.',
    'alert.unknown_type':'Type non reconnu.',
    'alert.choose_date':'Choisissez une date.',
    'alert.pdf_unavailable':'Bibliothèque PDF non disponible (connexion internet requise).',
    'alert.generate_first':'Générez d\'abord une fiche.',
    'alert.nothing':'Rien à traiter.',
    'alert.enter_word':'Entrez un mot.',
    'alert.enter_name':'Entrez un nom.',
    'alert.cab_exists':'Ce cabinet existe déjà.',
    'alert.allow_popups':'Autorisez les popups pour ce fichier dans votre navigateur.',
    'alert.enter_firstname':'Entrez un prénom.',
    'alert.tech_exists':'Ce technicien existe déjà.',
    'alert.type_name':'Donnez un nom à ce type.',
    'alert.add_step':'Ajoutez au moins une étape.',
    'alert.name_steps':'Nommez toutes les étapes.',
    'alert.type_not_found':'Type introuvable : ',
    'alert.choose_tech_date':'Choisissez un technicien et une date.',
    'alert.select_cab':'Sélectionnez un cabinet.',
    'alert.add_line':'Ajoutez au moins une prestation.',
    'alert.enter_service':'Entrez un nom de prestation.',
    'alert.select_job':'Sélectionnez un travail patient.',
    'alert.add_material':'Ajoutez au moins une matière.',
    'alert.enter_cab':'Entrez un nom de cabinet.',
    'alert.no_unpaid_bl':'Aucun bon de livraison non facturé pour ce cabinet.',
    'alert.add_bl_line':'Ajoutez au moins une ligne.',
    // Confirms
    'confirm.clear_all':'Effacer tous les travaux ?',
    'confirm.delete_cab':'Supprimer ce cabinet ?',
    'confirm.delete_tech':'Supprimer {name} ?',
    'confirm.clear_history':'Vider tout l\'historique ?',
    'confirm.delete_task':'Supprimer "{label}" ?',
    'confirm.delete':'Supprimer ?',
    'confirm.delete_type':'Supprimer le type "{label}" ?',
    'confirm.quote_to_invoice':'Convertir le devis {num} en facture ?',
    'confirm.credit_note':'Créer un avoir sur {num} ({amount}) ?\n\nCet avoir annulera comptablement la facture.',
    'confirm.reset_password':'Générer un nouveau mot de passe pour {name} ?',
    'confirm.delete_bl':'Supprimer ce bon ?',
    'confirm.restore_cloud':'Restaurer depuis le cloud ?\nLes données actuelles seront remplacées.',
    'confirm.clear_data':'Effacer TOUTES les données ? Cette action est irréversible.',
    // Toast
    'toast.saved_at':'✅ Sauvegardé à {time}',
    'toast.saving':'⏳ Sauvegarde en cours...','btn.cloud_save':'☁️ Sauvegarder maintenant','btn.cloud_restore':'⬇️ Restaurer depuis le cloud',
    'toast.restoring':'⏳ Restauration...',
    'toast.no_backup':'❌ Aucune sauvegarde trouvée.',
    'toast.restored':'✅ Restauré (sauvegarde du {date})',
    'toast.error':'❌ Erreur : {msg}',
    'toast.stripe_saved':'✅ Clé Stripe enregistrée',
    'toast.legal_saved':'✅ Informations légales enregistrées',
    'toast.copied':'✓ Copié!','toast.copy':'📋 Copier',
    'toast.type_modified':'✅ Type modifié avec succès !',
    'toast.type_created':'✅ Nouveau type créé avec succès !',
    'toast.invoice_from_quote':'✅ Facture {invoice} créée depuis le devis {quote}',
    'toast.prices_saved':'✅ Prix enregistrés',
    'toast.avoir_created':'✅ Avoir {avoir} créé sur {orig}',
    'toast.csv_exported':'📥 Export CSV téléchargé',
    'toast.no_cab_email':'⚠️ Aucun email pour ce cabinet — ajoutez-en un dans Cabinets',
    'toast.email_sent':'📧 Email envoyé à {email}',
    'toast.invoice_sent_no_email':'⚠️ Facture envoyée ✅ — Email auto désactivé (configurez RESEND_API_KEY dans Netlify)',
    'toast.invoice_sent_email_fail':'⚠️ Facture envoyée ✅ — Échec email : {err}',
    'toast.invoice_sent_email_error':'⚠️ Facture envoyée ✅ — Erreur réseau email (non bloquant)',
    'toast.mark_sent_first':'⚠️ Passez d\'abord en "Envoyé"',
    'toast.invoice_paid':'✅ Facture marquée payée — portail mis à jour',
    'toast.invoice_locked':'⚠️ Facture déjà émise — inaltérable',
    'toast.invoice_sent':'📤 Facture envoyée — portail mis à jour (ajoutez un email cabinet pour l\'envoi auto)',
    'toast.cab_not_found':'⚠️ Cabinet introuvable',
    'toast.portal_updated':'✅ Portail mis à jour — {name}',
    'toast.invoice_delete_locked':'🔒 Facture émise — suppression impossible (obligation légale)',
    'toast.link_copied':'🔗 Lien copié dans le presse-papiers !',
    'toast.invalid_amount':'⚠️ Montant invalide pour le paiement en ligne',
    'toast.configure_stripe':'⚠️ Configurez votre clé Stripe dans Paramètres → Paiements en ligne',
    'toast.stripe_no_link':'❌ Stripe n\'a pas retourné de lien (réponse inattendue)',
    'toast.stripe_link_copied':'✅ Lien Stripe copié ! Envoyez-le au cabinet ou il est visible dans le portail dentiste.',
    'toast.payment_confirmed':'💳 Paiement en ligne confirmé — {doc} marqué payé',
    'toast.bdc_created':'✅ Bon {num} créé !',
    'toast.reception_confirmed':'✅ Réception confirmée — N° de lots enregistrés',
    'toast.bdc_ordered':'📤 Bon marqué commandé',
    'toast.cab_created':'✅ Cabinet {name} créé !',
    'toast.bl_created':'✅ Bon {num} généré pour {cab} !',
    'toast.status_updated':'Statut mis à jour : {status}',
    'toast.bl_not_found':'BL introuvable',
    'toast.popup_blocked':'Popup bloqué — autorisez les popups pour ce site',
    'toast.ids_copied':'✅ Identifiants copiés !',
    'toast.invoice_from_bl':'✅ Facture {num} créée — {count} bon(s)',
    'toast.portal_error':'❌ Erreur sync portail {status}',
    'toast.network_error':'❌ Erreur réseau : {msg}',
    'toast.job_not_found':'Travail introuvable',
    'toast.payment_pending':'💳 Paiement effectué — vérification en cours...',
    'toast.cab_no_portal':'❌ Cabinet sans portail',
    'toast.waiting':'⏸ Travail mis en attente.',
    'toast.reprogrammed':'✅ Reprogrammé !',
    // Buttons dynamic
    'btn.update':'🔄 Màj','btn.thinking':'🤖 En train de réfléchir...',
    'btn.sending':'⏳ Envoi…','btn.sent':'✅ Envoyé','btn.resend':'🔄 Renvoyer',
    'btn.syncing':'🔄 Synchronisation en cours...',
    'btn.synced':'🔄 Synchronisé depuis un autre appareil',
    'btn.add_queue':'+ Mettre en file d\'attente',
    'btn.replying':'En train de répondre…',
    'btn.new_pwd':'🔄 Nouveau mdp','btn.invoice_month':'🧾 Facturer le mois',
    'btn.share':'🔗 Partager','btn.delivery_note':'📋 Bon livraison',
    'btn.add_cab':'+ Ajouter','btn.close':'Fermer','btn.credentials':'🔑 Identifiants',
    'qr.scan_hint':'Scanne ce QR code pour retrouver le dossier',
    'h2.manage_cabs':'Gérer les cabinets',
    'cab.ph_name':'Nom du cabinet...',
    'cab.jobs_count':'{n} travail(aux)','cab.code':'Code','cab.bl_uninvoiced':'{n} BL non facturé(s)','cab.pending':'en attente','cab.no_cab':'Sans cabinet',
    'portal.title':'🔗 Portail cabinet','portal.share_with':'Partagez ces accès avec {name}',
    'portal.login_title':'Identifiants de connexion','portal.url':'URL','portal.code':'Code','portal.password':'Mot de passe',
    'portal.copy':'📋 Copier les identifiants','portal.open':'🔗 Ouvrir le portail',
    'portal.share_text':'Accès à votre espace cabinet Labosync\n\nURL : {url}\nCode d\'accès : {code}\nMot de passe : {pwd}',
    'portal.info':'Accès espace dentiste — {name}\n\nURL : {url}\n\nCode d\'accès : {code}\nMot de passe : {pwd}\n\nCommuniquez uniquement ces identifiants à ce cabinet.',
    'portal.copy_text':'Code : {code}\nMot de passe : {pwd}\nURL : {url}',
    // Stripe / paramètres
    'stripe.placeholder':'Collez votre clé Stripe (sk_live_... ou sk_test_...)',
    'stripe.invalid':'Clé invalide — doit commencer par sk_live_ ou sk_test_',
    // Select options
    'select.all':'Tous','select.technician':'— Technicien —',
    'select.no_type':'Aucun type disponible','select.select':'— Sélectionner —',
    'select.no_job':'— Sélectionner un travail —',
    // Misc
    'misc.holiday':'Jour férié','misc.tech_absent':'Tech absent',
    'misc.not_found':'Introuvable.','misc.no_tech_configured':'Aucun technicien configuré',
    'misc.not_configured':'Non configuré',
    'misc.no_cab':'Aucun cabinet',
    'bdc.col.product':'Matière / Produit','bdc.col.ref':'Référence','bdc.col.qty':'Qté','bdc.col.lot':'N° lot prévu',
    'bill.service':'Prestation','bill.unit_price':'Prix unit.',
    'misc.pending_prog':'En attente de prog.',
    'misc.qr_unavailable':'QR non disponible.<br>Vérifiez la connexion.',
    'misc.jobs_scheduled':'{n} travail(aux) programmé(s) pour {patient} !',
    'misc.jobs_detected':'{patient} — {n} travail(aux)',
    'misc.jobs_count':'{n} travail(aux)','misc.tasks_count':'{n} tâche(s)',
    // Cloud
    'cloud.last_save':'Dernière sauvegarde : {date} à {time}',
    // Print
    'print.planning':'=== PLANNING — {name} ===',
    'print.generated':'Généré le {date}',
    'print.no_tasks':'Aucune tâche.','print.no_tasks_day':'Aucune tâche ce jour.',
    'print.day_planning':'=== PLANNING DU {date} ===',
    // Section h2 titles
    'h2.scan':'Scanner une fiche','h2.scan.detected':'Travaux détectés',
    'h2.scan.synonyms':'Synonymes personnalisés','h2.print':'Générer une fiche',
    'h2.stats.types':'Répartition par type','h2.stats.cabs':'Répartition par cabinet',
    'h2.cab.add':'Ajouter un cabinet','h2.cab.jobs':'Travaux par cabinet',
    'h2.livr':'📬 Bons de livraison','h2.suivi.search':'🔍 Suivre une commande',
    'h2.waiting':'⏸ Travaux en attente de pièce',
    'h2.team.add':'👥 Ajouter un technicien','h2.team.config':'Techniciens configurés',
    'h2.settings.cloud':'☁️ Sauvegarde cloud','h2.settings.labname':'🏷️ Nom du laboratoire',
    'h2.settings.options':'⚙️ Options',
    'h2.settings.legal':'🏢 Informations légales du laboratoire',
    'h2.settings.types':'🔧 Types de travaux & tarifs',
    'h2.settings.stripe':'💳 Paiements en ligne (Stripe)',
    'h2.settings.absences':'🏖️ Absences & Fermetures',
    'h2.settings.danger':'⚠️ Zone dangereuse',
    'h2.bdc':'📦 Nouveau bon de commande','h2.fourn':'🏭 Fournisseur',
    'h2.bill.to_invoice':'⚡ À facturer','h2.tarifs':'🏷️ Tarifs par défaut',
    'h2.messages':'💬 Messagerie cabinets',
    // Section stitle
    'stitle.scan.recent':'Scans récents','stitle.cab.registered':'Cabinets enregistrés',
    'stitle.hist.full':'Historique complet','stitle.livr.all':'Tous les travaux',
    'stitle.livr.done':'Bons émis','stitle.bdc':'Bons','stitle.docs':'Documents',
    // Descriptions
    'desc.scan':'Place le curseur dans le champ et scanne avec la douchette. Appuie sur Entrée pour traiter.',
    'desc.livr':'Travaux 100% terminés prêts à être livrés. Générez un bon pour chaque cabinet et suivez les envois.',
    'desc.waiting':'Ces travaux sont suspendus. Recherchez le code patient dans la barre de recherche pour y accéder.',
    'desc.cloud':'Vos données sont sauvegardées sur Supabase (cloud sécurisé). Sauvegarde automatique toutes les 5 minutes. Restaurez sur n\'importe quel appareil.',
    'desc.legal':'Ces informations apparaissent sur vos bons de livraison et certificats de conformité CE.',
    'desc.types':'Gérez vos types de travaux et leur prix unitaire. Le prix est automatiquement proposé lors de la création d\'un bon de livraison.',
    'desc.tarifs':'Ces prix sont pré-remplis automatiquement lors de la création d\'un document.',
    'desc.fourn':'Votre fournisseur est pré-sélectionné automatiquement sur chaque bon.',
    // Form labels – scan
    'form.barcode':'Code-barres','form.separator':'Séparateur',
    'form.pos.patient':'Pos. patient','form.pos.job':'Pos. travaux',
    'form.syn.word':'Mot du secrétariat','form.syn.maps_to':'Correspond à',
    'scan.format':'Format du code-barres',
    // Form labels – print
    'form.print.technician':'Technicien','form.print.date':'Date',
    'opt.by_person':'Par personne','opt.by_day':'Par jour',
    // Form labels – cabinets
    'form.cab.name':'Nom du cabinet','form.cab.phone':'Téléphone',
    'form.cab.email':'Email','form.cab.color':'Couleur',
    // Form labels – historique
    'form.hist.search':'Recherche patient','form.hist.cabinet':'Cabinet','form.hist.status':'Statut',
    'opt.in_progress':'En cours','opt.delivered':'Livré','opt.completed':'Terminés',
    // Form labels – suivi
    'form.suivi.code':'Code de suivi',
    // Form labels – équipe
    'form.team.name':'Prénom / Nom','form.team.role':'Rôle','form.team.color':'Couleur',
    // Form labels – paramètres
    'form.display_name':'Nom affiché',
    'form.legal.company':'Raison sociale','form.legal.siret':'SIRET',
    'form.legal.address':'Adresse complète','form.legal.phone':'Téléphone',
    'form.legal.email':'Email','form.legal.director':'Directeur technique / Responsable',
    'form.legal.ce':'Numéro de fabricant CE (optionnel)',
    'ct.form.new':'Nouveau type','ct.form.name':'Nom du type','ct.form.category':'Catégorie',
    // Form labels – BDC / facturation
    'form.bdc.job':'Code patient / Travail','form.bdc.supplier':'Fournisseur',
    'form.bdc.date':'Date commande','form.bdc.materials':'Matières / Produits commandés',
    'form.bdc.note':'Note / référence',
    'form.fourn.name':'Nom','form.fourn.contact':'Contact',
    'form.bill.cabinet':'Cabinet dentaire','form.bill.job':'Travail associé (optionnel)',
    'form.bill.date':'Date','form.bill.note':'Note',
    'form.tarif.service':'Prestation','form.tarif.price':'Prix (€)',
    // Select options
    'opt.all_clinics':'Tous les cabinets',
    'opt.bdc.drafts':'Brouillons','opt.bdc.ordered':'Commandés','opt.bdc.received':'Reçus',
    'bill.filter.drafts':'Brouillons','bill.filter.sent':'Envoyés','bill.filter.paid':'Payés',
    'bill.filter.all_types':'Tous types','bill.filter.quotes':'Devis',
    'bill.filter.invoices':'Factures','bill.filter.credits':'Avoirs',
    // Boutons
    'btn.scan.go':'▶ Traiter','btn.scan.test':'🧪 Exemple','btn.scan.confirm':'✓ Confirmer',
    'btn.generate':'Générer','btn.export.sheet':'⬇️ Exporter la fiche','btn.print.sheet':'🖨️ Imprimer',
    'btn.suivi.search':'Rechercher','btn.save':'Enregistrer',
    'btn.save.legal':'Enregistrer les informations légales',
    'btn.reset_all':'🗑️ Effacer toutes les données',
    'btn.bdc.add_line':'+ Ajouter une matière','btn.bill.add_line':'+ Ajouter une ligne',
    'btn.new_quote':'📋 Nouveau devis','btn.bdc.new':'+ Créer un bon',
    'btn.hist.filter':'🔍 Filtrer','btn.hist.clear':'🗑️ Vider l\'historique',
    'btn.ct.add':'+ Ajouter un type','btn.ct.save':'Enregistrer le type',
    // Facturation KPIs
    'bill.cnt_month':'Factures ce mois','bill.total_month':'Montant facturé',
    'bill.unpaid':'En attente de paiement','bill.overdue':'En retard (+30j)',
    'bill.section.quotes':'Devis','bill.section.services':'Prestations',
    'bill.subtotal':'Sous-total HT','bill.vat':'TVA',
    'bill.vat.exempt':'Exonéré (art. 261-4 CGI)','bill.total_ttc':'Total TTC',
    'tarif.assoc':'Associer aux types de travaux (auto-remplissage)',
    'tarif.assoc.desc':'Cochez les types pour lesquels ce tarif s\'applique automatiquement.',
    // Paramètres toggles
    'opt.prog.title':'🔬 Activer la programmation',
    'opt.prog.desc':'Affiche les onglets Impression, Équipe et En attente. Activez si vous planifiez les travaux par technicien.',
    'opt.suivi.title':'Suivi de commande visuel (portail)',
    'opt.suivi.desc':'Affiche la progression des travaux dans le portail cabinet (Reçu → Production → Finition → Prêt). Recommandé si la programmation est activée.',
    'absences.lab':'Fermeture du laboratoire','absences.individual':'Absence individuelle',
    // Messages
    'msg.click_cab':'Cliquez sur un cabinet pour ouvrir la conversation',
    // KPI stats
    'kpi.in_lab':'En labo actuellement','kpi.to_schedule':'📥 À programmer',
    'kpi.urgent':'🔴 Urgents','kpi.late':'⚠️ En retard',
    'kpi.outputs_month':'Sorties ce mois','kpi.revenue_month':'CA ce mois (BL)','kpi.avg_bl':'Prix moyen / BL',
    'kpi.total_jobs':'Total travaux','kpi.completed':'Terminés','kpi.in_progress':'En cours',
    // Calendrier
    'cal.week_of':'Semaine du {from} au {to}',
    // Locale
    'locale':'fr-FR',
  },
  en: {
    'auth.loading':'Loading…',
    'auth.subtitle.login':'Sign in to your laboratory',
    'auth.subtitle.signup':'Create your laboratory',
    'auth.label.email':'Email',
    'auth.label.password':'Password',
    'auth.label.labname':'Laboratory name',
    'auth.ph.labname':'e.g. Dupont Dental Lab',
    'auth.ph.pass':'Minimum 6 characters',
    'auth.btn.login':'Sign in',
    'auth.btn.signup':'Create my account',
    'auth.switch.noaccount':'No account yet?',
    'auth.switch.hasaccount':'Already have an account?',
    'auth.btn.toggle':'Create account',
    'auth.btn.toggle.back':'Sign in',
    'auth.err.fields':'Please fill in all fields.',
    'auth.err.badpass':'Incorrect email or password.',
    'auth.err.shortpass':'Password must be at least 6 characters.',
    // Header
    'header.tagline':'By dental technicians, for dental technicians',
    'header.logout':'⎋ Sign out',
    // Mode bar
    'mode.labo':'Laboratory',
    'mode.fact':'Billing',
    'mode.messages':'Messages',
    // Tabs labo
    'tab.dashboard':'🏠 Home',
    'tab.saisie':'📋 Jobs',
    'tab.calendrier':'📅 Calendar',
    'tab.impression':'🖨️ Print',
    'tab.attente':'⏸ On hold',
    'tab.equipe':'👥 Team',
    'tab.stats':'📊 Stats',
    'tab.parametres':'⚙️ Settings',
    // Tabs fact
    'tab.cabinets':'🏥 Clinics',
    'tab.livraisons':'📬 Deliveries',
    'tab.facturation':'💰 Invoicing',
    'tab.historique':'🗂️ History',
    // Saisie form
    'job.card.title':'📝 New job',
    'job.card.sub':'Enter the details of the job to be done.',
    'form.patient':'Patient code',
    'form.ph.patient':'Smith John',
    'form.type':'Type',
    'form.nb':'Units',
    'form.note':'Note / instructions',
    'form.ph.note':'shade A2, instructions...',
    'form.delivery':'📅 Due date',
    'form.cabinet':'🏥 Clinic',
    'form.none':'— None —',
    'form.urgent':'🔴 Urgent',
    'form.digital':'📡 Digital impression',
    'form.add_type':'+ Add type',
    'form.add_job':'+ Add job',
    // Table headers
    'th.patient':'Patient code',
    'th.type':'Type',
    'th.step':'Step',
    'th.tech':'Technician',
    'th.date':'Due date',
    'th.date.simple':'Date',
    'th.note':'Note / Shade',
    'th.status':'Status',
    'th.clearall':'Clear all',
    'btn.cancel':'Cancel',
    // Calendar
    'cal.week':'Week',
    'cal.month':'Month',
    // Queue
    'queue.title':'📥 To schedule',
    // Dashboard
    'dash.greeting':'Hello',
    'dash.today':'Today',
    'dash.jobs_today':'jobs today',
    'dash.pending':'to schedule',
    'dash.late':'overdue',
    // Common
    'common.save':'Save',
    'common.cancel':'Cancel',
    'common.delete':'Delete',
    'common.edit':'Edit',
    'common.add':'Add',
    'common.confirm':'Confirm',
    'common.close':'Close',
    'common.apply':'Apply',
    'common.yes':'Yes',
    'common.no':'No',
    'common.loading':'Loading…',
    'common.saving':'Saving…',
    'common.saved':'Saved',
    'common.error':'Error',
    'common.send':'Send',
    // Settings
    'settings.title':'⚙️ Settings',
    'settings.techs':'Technicians',
    'settings.types':'Job types',
    'settings.legal':'Legal information',
    'settings.conges':'Laboratory holidays',
    'settings.absences':'Absences',
    // Stats
    'stats.title':'Statistics',
    'stats.jobs_total':'Total jobs',
    'stats.by_type':'By type','stats.workload_days':'Workload by day (2 weeks)',
    'stats.by_tech':'By technician',
    'search.placeholder':'🔍 Patient code, job code...',
    // Status docs
    'status.brouillon':'Draft','status.envoye':'Sent','status.paye':'Paid',
    'status.annule':'Cancelled','status.avoir':'Credit note','status.commande':'Ordered',
    'status.recu_bdc':'Received',
    // Status suivi
    'suivi.recu':'Received','suivi.production':'In production',
    'suivi.finition':'In finishing','suivi.pret':'Ready to deliver',
    // Empty states
    'empty.tasks':'No tasks','empty.jobs':'No jobs',
    'empty.jobs_found':'No jobs found','empty.queue':'✅ No jobs waiting',
    'empty.techs':'No technicians configured','empty.types':'No job types configured.',
    'empty.steps':'No schedule. You can save the type as-is, or click "+ Add step" if you plan this work by technician.','empty.cabinets':'No clinics registered.',
    'empty.docs':'No documents.','empty.tarifs':'No prices saved.',
    'empty.bdc':'No purchase orders.','empty.fourns':'No suppliers configured.',
    'empty.bdl_pending':'No jobs without delivery note.','empty.bdl':'No notes issued.',
    'empty.history':'No results','empty.messages':'No messages. Start the conversation!','empty.messages_short':'No messages',
    'empty.absences':'No absences.','empty.conges':'No closure days.',
    'empty.synonymes':'No synonyms.','empty.scans':'No recent scans.',
    'empty.waiting':'✅ No jobs on hold — add from 📝 Jobs',
    'empty.suivi':'No jobs in progress.','empty.suivi.title':'Jobs in progress',
    // Alerts
    'alert.enter_patient':'Enter the patient name.',
    'alert.unknown_type':'Unknown type.',
    'alert.choose_date':'Choose a date.',
    'alert.pdf_unavailable':'PDF library unavailable (internet connection required).',
    'alert.generate_first':'Generate a sheet first.',
    'alert.nothing':'Nothing to process.',
    'alert.enter_word':'Enter a word.',
    'alert.enter_name':'Enter a name.',
    'alert.cab_exists':'This clinic already exists.',
    'alert.allow_popups':'Please allow popups for this file in your browser.',
    'alert.enter_firstname':'Enter a first name.',
    'alert.tech_exists':'This technician already exists.',
    'alert.type_name':'Give this type a name.',
    'alert.add_step':'Add at least one step.',
    'alert.name_steps':'Name all steps.',
    'alert.type_not_found':'Type not found: ',
    'alert.choose_tech_date':'Choose a technician and a date.',
    'alert.select_cab':'Select a clinic.',
    'alert.add_line':'Add at least one service.',
    'alert.enter_service':'Enter a service name.',
    'alert.select_job':'Select a patient job.',
    'alert.add_material':'Add at least one material.',
    'alert.enter_cab':'Enter a clinic name.',
    'alert.no_unpaid_bl':'No uninvoiced delivery notes for this clinic.',
    'alert.add_bl_line':'Add at least one line.',
    // Confirms
    'confirm.clear_all':'Clear all jobs?',
    'confirm.delete_cab':'Delete this clinic?',
    'confirm.delete_tech':'Delete {name}?',
    'confirm.clear_history':'Clear all history?',
    'confirm.delete_task':'Delete "{label}"?',
    'confirm.delete':'Delete?',
    'confirm.delete_type':'Delete type "{label}"?',
    'confirm.quote_to_invoice':'Convert quote {num} to invoice?',
    'confirm.credit_note':'Create a credit note on {num} ({amount})?\n\nThis will void the invoice.',
    'confirm.reset_password':'Generate a new password for {name}?',
    'confirm.delete_bl':'Delete this note?',
    'confirm.restore_cloud':'Restore from cloud?\nCurrent data will be replaced.',
    'confirm.clear_data':'Delete ALL data? This action cannot be undone.',
    // Toast
    'toast.saved_at':'✅ Saved at {time}',
    'toast.saving':'⏳ Saving...','btn.cloud_save':'☁️ Save now','btn.cloud_restore':'⬇️ Restore from cloud',
    'toast.restoring':'⏳ Restoring...',
    'toast.no_backup':'❌ No backup found.',
    'toast.restored':'✅ Restored (backup from {date})',
    'toast.error':'❌ Error: {msg}',
    'toast.stripe_saved':'✅ Stripe key saved',
    'toast.legal_saved':'✅ Legal information saved',
    'toast.copied':'✓ Copied!','toast.copy':'📋 Copy',
    'toast.type_modified':'✅ Type modified successfully!',
    'toast.type_created':'✅ New type created successfully!',
    'toast.invoice_from_quote':'✅ Invoice {invoice} created from quote {quote}',
    'toast.prices_saved':'✅ Prices saved',
    'toast.avoir_created':'✅ Credit note {avoir} created on {orig}',
    'toast.csv_exported':'📥 CSV export downloaded',
    'toast.no_cab_email':'⚠️ No email for this clinic — add one in Clinics',
    'toast.email_sent':'📧 Email sent to {email}',
    'toast.invoice_sent_no_email':'⚠️ Invoice sent ✅ — Auto email disabled (configure RESEND_API_KEY in Netlify)',
    'toast.invoice_sent_email_fail':'⚠️ Invoice sent ✅ — Email failed: {err}',
    'toast.invoice_sent_email_error':'⚠️ Invoice sent ✅ — Email network error (non-blocking)',
    'toast.mark_sent_first':'⚠️ Mark as "Sent" first',
    'toast.invoice_paid':'✅ Invoice marked paid — portal updated',
    'toast.invoice_locked':'⚠️ Invoice already issued — cannot modify',
    'toast.invoice_sent':'📤 Invoice sent — portal updated (add a clinic email for auto-send)',
    'toast.cab_not_found':'⚠️ Clinic not found',
    'toast.portal_updated':'✅ Portal updated — {name}',
    'toast.invoice_delete_locked':'🔒 Issued invoice — cannot delete (legal obligation)',
    'toast.link_copied':'🔗 Link copied to clipboard!',
    'toast.invalid_amount':'⚠️ Invalid amount for online payment',
    'toast.configure_stripe':'⚠️ Configure your Stripe key in Settings → Online payments',
    'toast.stripe_no_link':'❌ Stripe did not return a link (unexpected response)',
    'toast.stripe_link_copied':'✅ Stripe link copied! Send it to the clinic or share it via the dental portal.',
    'toast.payment_confirmed':'💳 Online payment confirmed — {doc} marked paid',
    'toast.bdc_created':'✅ Order {num} created!',
    'toast.reception_confirmed':'✅ Reception confirmed — lot numbers saved',
    'toast.bdc_ordered':'📤 Order marked as sent',
    'toast.cab_created':'✅ Clinic {name} created!',
    'toast.bl_created':'✅ Note {num} generated for {cab}!',
    'toast.status_updated':'Status updated: {status}',
    'toast.bl_not_found':'Delivery note not found',
    'toast.popup_blocked':'Popup blocked — allow popups for this site',
    'toast.ids_copied':'✅ Credentials copied!',
    'toast.invoice_from_bl':'✅ Invoice {num} created — {count} note(s)',
    'toast.portal_error':'❌ Portal sync error {status}',
    'toast.network_error':'❌ Network error: {msg}',
    'toast.job_not_found':'Job not found',
    'toast.payment_pending':'💳 Payment received — verifying...',
    'toast.cab_no_portal':'❌ Clinic has no portal',
    'toast.waiting':'⏸ Job put on hold.',
    'toast.reprogrammed':'✅ Rescheduled!',
    // Buttons dynamic
    'btn.update':'🔄 Update','btn.thinking':'🤖 Thinking...',
    'btn.sending':'⏳ Sending…','btn.sent':'✅ Sent','btn.resend':'🔄 Resend',
    'btn.syncing':'🔄 Syncing...','btn.synced':'🔄 Synced from another device',
    'btn.add_queue':'+ Add to queue','btn.replying':'Replying…',
    'btn.new_pwd':'🔄 New pwd','btn.invoice_month':'🧾 Invoice month',
    'btn.share':'🔗 Share','btn.delivery_note':'📋 Delivery note',
    'btn.add_cab':'+ Add','btn.close':'Close','btn.credentials':'🔑 Credentials',
    'qr.scan_hint':'Scan this QR code to find the file',
    'h2.manage_cabs':'Manage clinics',
    'cab.ph_name':'Clinic name...',
    'cab.jobs_count':'{n} job(s)','cab.code':'Code','cab.bl_uninvoiced':'{n} uninvoiced DN(s)','cab.pending':'pending','cab.no_cab':'No clinic',
    'portal.title':'🔗 Clinic portal','portal.share_with':'Share these credentials with {name}',
    'portal.login_title':'Login credentials','portal.url':'URL','portal.code':'Code','portal.password':'Password',
    'portal.copy':'📋 Copy credentials','portal.open':'🔗 Open portal',
    'portal.share_text':'Access to your Labosync clinic portal\n\nURL: {url}\nAccess code: {code}\nPassword: {pwd}',
    'portal.info':'Dentist portal access — {name}\n\nURL: {url}\n\nAccess code: {code}\nPassword: {pwd}\n\nOnly share these credentials with this clinic.',
    'portal.copy_text':'Code: {code}\nPassword: {pwd}\nURL: {url}',
    // Stripe / settings
    'stripe.placeholder':'Paste your Stripe key (sk_live_... or sk_test_...)',
    'stripe.invalid':'Invalid key — must start with sk_live_ or sk_test_',
    // Select options
    'select.all':'All','select.technician':'— Technician —',
    'select.no_type':'No types available','select.select':'— Select —',
    'select.no_job':'— Select a job —',
    // Misc
    'misc.holiday':'Public holiday','misc.tech_absent':'Tech absent',
    'misc.not_found':'Not found.','misc.no_tech_configured':'No technicians configured',
    'misc.not_configured':'Not configured',
    'misc.no_cab':'No clinic',
    'bdc.col.product':'Material / Product','bdc.col.ref':'Reference','bdc.col.qty':'Qty','bdc.col.lot':'Lot no.',
    'bill.service':'Service','bill.unit_price':'Unit price',
    'misc.pending_prog':'Awaiting scheduling.',
    'misc.qr_unavailable':'QR unavailable.<br>Check connection.',
    'misc.jobs_scheduled':'{n} job(s) scheduled for {patient}!',
    'misc.jobs_detected':'{patient} — {n} job(s)',
    'misc.jobs_count':'{n} job(s)','misc.tasks_count':'{n} task(s)',
    // Cloud
    'cloud.last_save':'Last saved: {date} at {time}',
    // Print
    'print.planning':'=== SCHEDULE — {name} ===',
    'print.generated':'Generated on {date}',
    'print.no_tasks':'No tasks.','print.no_tasks_day':'No tasks today.',
    'print.day_planning':'=== SCHEDULE FOR {date} ===',
    // Section h2 titles
    'h2.scan':'Scan a barcode','h2.scan.detected':'Detected jobs',
    'h2.scan.synonyms':'Custom synonyms','h2.print':'Generate a sheet',
    'h2.stats.types':'By type','h2.stats.cabs':'By clinic',
    'h2.cab.add':'Add a clinic','h2.cab.jobs':'Jobs by clinic',
    'h2.livr':'📬 Delivery notes','h2.suivi.search':'🔍 Track an order',
    'h2.waiting':'⏸ Jobs waiting for part',
    'h2.team.add':'👥 Add a technician','h2.team.config':'Configured technicians',
    'h2.settings.cloud':'☁️ Cloud backup','h2.settings.labname':'🏷️ Lab name',
    'h2.settings.options':'⚙️ Options',
    'h2.settings.legal':'🏢 Lab legal information',
    'h2.settings.types':'🔧 Job types & prices',
    'h2.settings.stripe':'💳 Online payments (Stripe)',
    'h2.settings.absences':'🏖️ Absences & Closures',
    'h2.settings.danger':'⚠️ Danger zone',
    'h2.bdc':'📦 New purchase order','h2.fourn':'🏭 Supplier',
    'h2.bill.to_invoice':'⚡ To invoice','h2.tarifs':'🏷️ Default prices',
    'h2.messages':'💬 Clinic messages',
    // Section stitle
    'stitle.scan.recent':'Recent scans','stitle.cab.registered':'Registered clinics',
    'stitle.hist.full':'Full history','stitle.livr.all':'All jobs',
    'stitle.livr.done':'Issued notes','stitle.bdc':'Orders','stitle.docs':'Documents',
    // Descriptions
    'desc.scan':'Place the cursor in the field and scan with the reader. Press Enter to process.',
    'desc.livr':'100% completed jobs ready for delivery. Generate a note for each clinic and track deliveries.',
    'desc.waiting':'These jobs are on hold. Search for the patient in the search bar to access them.',
    'desc.cloud':'Your data is saved on Supabase (secure cloud). Auto-saved every 5 minutes. Restore on any device.',
    'desc.legal':'This information appears on your delivery notes and CE compliance certificates.',
    'desc.types':'Manage your job types and their unit price. The price is automatically suggested when creating a delivery note.',
    'desc.tarifs':'These prices are pre-filled automatically when creating a document.',
    'desc.fourn':'Your supplier is pre-selected automatically on each order.',
    // Form labels – scan
    'form.barcode':'Barcode','form.separator':'Separator',
    'form.pos.patient':'Patient code pos.','form.pos.job':'Job pos.',
    'form.syn.word':'Secretary word','form.syn.maps_to':'Maps to',
    'scan.format':'Barcode format',
    // Form labels – print
    'form.print.technician':'Technician','form.print.date':'Date',
    'opt.by_person':'By person','opt.by_day':'By day',
    // Form labels – cabinets
    'form.cab.name':'Clinic name','form.cab.phone':'Phone',
    'form.cab.email':'Email','form.cab.color':'Color',
    // Form labels – historique
    'form.hist.search':'Patient code search','form.hist.cabinet':'Clinic','form.hist.status':'Status',
    'opt.in_progress':'In progress','opt.delivered':'Delivered','opt.completed':'Completed',
    // Form labels – suivi
    'form.suivi.code':'Tracking code',
    // Form labels – équipe
    'form.team.name':'First / Last name','form.team.role':'Role','form.team.color':'Color',
    // Form labels – paramètres
    'form.display_name':'Display name',
    'form.legal.company':'Company name','form.legal.siret':'SIRET',
    'form.legal.address':'Full address','form.legal.phone':'Phone',
    'form.legal.email':'Email','form.legal.director':'Technical director',
    'form.legal.ce':'CE manufacturer number (optional)',
    'ct.form.new':'New type','ct.form.name':'Type name','ct.form.category':'Category',
    // Form labels – BDC / facturation
    'form.bdc.job':'Patient code / Job','form.bdc.supplier':'Supplier',
    'form.bdc.date':'Order date','form.bdc.materials':'Ordered materials / products',
    'form.bdc.note':'Note / reference',
    'form.fourn.name':'Name','form.fourn.contact':'Contact',
    'form.bill.cabinet':'Dental clinic','form.bill.job':'Related job (optional)',
    'form.bill.date':'Date','form.bill.note':'Note',
    'form.tarif.service':'Service','form.tarif.price':'Price (€)',
    // Select options
    'opt.all_clinics':'All clinics',
    'opt.bdc.drafts':'Drafts','opt.bdc.ordered':'Ordered','opt.bdc.received':'Received',
    'bill.filter.drafts':'Drafts','bill.filter.sent':'Sent','bill.filter.paid':'Paid',
    'bill.filter.all_types':'All types','bill.filter.quotes':'Quotes',
    'bill.filter.invoices':'Invoices','bill.filter.credits':'Credit notes',
    // Buttons
    'btn.scan.go':'▶ Process','btn.scan.test':'🧪 Example','btn.scan.confirm':'✓ Confirm',
    'btn.generate':'Generate','btn.export.sheet':'⬇️ Export sheet','btn.print.sheet':'🖨️ Print',
    'btn.suivi.search':'Search','btn.save':'Save',
    'btn.save.legal':'Save legal information',
    'btn.reset_all':'🗑️ Erase all data',
    'btn.bdc.add_line':'+ Add material','btn.bill.add_line':'+ Add line',
    'btn.new_quote':'📋 New quote','btn.bdc.new':'+ Create order',
    'btn.hist.filter':'🔍 Filter','btn.hist.clear':'🗑️ Clear history',
    'btn.ct.add':'+ Add type','btn.ct.save':'Save type',
    // Facturation KPIs
    'bill.cnt_month':'Invoices this month','bill.total_month':'Invoiced amount',
    'bill.unpaid':'Awaiting payment','bill.overdue':'Overdue (+30d)',
    'bill.section.quotes':'Quotes','bill.section.services':'Services',
    'bill.subtotal':'Subtotal excl. VAT','bill.vat':'VAT',
    'bill.vat.exempt':'Exempt (art. 261-4 CGI)','bill.total_ttc':'Total incl. VAT',
    'tarif.assoc':'Link to job types (auto-fill)',
    'tarif.assoc.desc':'Check the types for which this price applies automatically.',
    // Settings toggles
    'opt.prog.title':'🔬 Enable scheduling',
    'opt.prog.desc':'Shows the Print, Team and On Hold tabs. Enable if you schedule work by technician.',
    'opt.suivi.title':'Visual order tracking (portal)',
    'opt.suivi.desc':'Shows job progress in the clinic portal (Received → Production → Finishing → Ready). Recommended if scheduling is enabled.',
    'absences.lab':'Lab closure','absences.individual':'Individual absence',
    // Messages
    'msg.click_cab':'Click on a clinic to open the conversation',
    // KPI stats
    'kpi.in_lab':'In lab now','kpi.to_schedule':'📥 To schedule',
    'kpi.urgent':'🔴 Urgent','kpi.late':'⚠️ Late',
    'kpi.outputs_month':'Outputs this month','kpi.revenue_month':'Revenue (delivery notes)','kpi.avg_bl':'Avg. price / note',
    'kpi.total_jobs':'Total jobs','kpi.completed':'Completed','kpi.in_progress':'In progress',
    // Calendar
    'cal.week_of':'Week of {from} to {to}',
    // Locale
    'locale':'en-GB',
  }
};

function t(key) {
  const lang = TRANSLATIONS[currentLang] || TRANSLATIONS['fr'];
  return (lang[key] !== undefined ? lang[key] : (TRANSLATIONS['fr'][key] || key));
}
// Interpolation : ti('confirm.delete_tech', {name:'Jean'}) → 'Supprimer Jean ?'
function ti(key, vars) {
  let s = t(key);
  if (vars) Object.keys(vars).forEach(function(k){ s = s.replace(new RegExp('\\{'+k+'\\}','g'), vars[k]); });
  return s;
}

function applyLang() {
  // Éléments texte simples
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (val !== undefined) el.textContent = val;
  });
  // Placeholders
  document.querySelectorAll('[data-i18n-ph]').forEach(function(el) {
    const key = el.getAttribute('data-i18n-ph');
    const val = t(key);
    if (val !== undefined) el.placeholder = val;
  });
  // Search bar placeholder (in header)
  const gs = document.getElementById('global-search');
  if (gs) gs.placeholder = t('search.placeholder');
  // Auth loading text
  const al = document.querySelector('#auth-loading p');
  if (al) al.textContent = t('auth.loading');
  // Language button label
  const btnLang = document.getElementById('btn-lang');
  if (btnLang) btnLang.textContent = '🌐 ' + currentLang.toUpperCase();
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('lb_lang', lang);
  applyLang();
  if (typeof render === 'function') render();
}

function toggleLang() {
  setLang(currentLang === 'fr' ? 'en' : 'fr');
}

/* Boutons Accueil / Messagerie en header */
function _updateHeaderLabName(){
  const el=document.getElementById('header-labname');if(!el)return;
  let name='';try{name=localStorage.getItem('lb_name')||'';}catch(e){}
  if(name)el.textContent=name;
  else el.innerHTML='Labo<span>sync</span>';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',_updateHeaderLabName);
else _updateHeaderLabName();
function goHome(){
  const dashTab=document.querySelector('.tab[data-pane="dashboard"]');
  if(dashTab){dashTab.click();return;}
  // Fallback si l'onglet n'existe pas
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('on'));
  document.querySelectorAll('.pane').forEach(x=>x.classList.remove('on'));
  document.querySelectorAll('.mode-btn').forEach(x=>x.classList.toggle('on',x.dataset.mode==='labo'));
  const dashPane=document.getElementById('pane-dashboard');
  if(dashPane)dashPane.classList.add('on');
  if(typeof renderDashboard==='function')renderDashboard();
}
function goMessages(){
  const btn=document.getElementById('mode-btn-messages');
  if(btn)btn.click();
}
var _settingsSectionOpen=null;
function resetSettingsView(){
  _settingsSectionOpen=null;
  var hub=document.getElementById('settings-hub');
  if(hub)hub.style.display='block';
  document.querySelectorAll('.settings-section').forEach(function(sec){
    sec.classList.remove('on');
    sec.style.display='none';
  });
}
function canAccessSettingsSection(id){
  if(id==='migration')return canAccessPane('migration');
  if(id==='danger')return _userRole==='admin'||hasPerm('*');
  if(id==='paiements')return _userRole==='admin'||_userRole==='billing'||hasPerm('*');
  if(id==='compte')return true;
  return canAccessPane('parametres')||hasPerm('*');
}
function applySettingsHubVisibility(){
  var row=document.getElementById('settings-row-migration');
  if(row)row.style.display=canAccessPane('migration')?'flex':'none';
  document.querySelectorAll('[data-settings-req]').forEach(function(el){
    var req=el.getAttribute('data-settings-req');
    var ok=true;
    if(req==='migration')ok=canAccessPane('migration');
    else if(req==='paiements')ok=_userRole==='admin'||_userRole==='billing'||hasPerm('*');
    else if(req==='danger')ok=_userRole==='admin'||hasPerm('*');
    el.style.display=ok?'block':'none';
  });
  document.querySelectorAll('.settings-group').forEach(function(g){
    var rows=g.querySelectorAll('.settings-row');
    var any=false;
    for(var i=0;i<rows.length;i++){if(rows[i].style.display!=='none'){any=true;break;}}
    if(!rows.length)any=g.getAttribute('data-settings-req')?g.style.display!=='none':true;
    g.style.display=any?'block':'none';
  });
  document.querySelectorAll('[data-settings-req="role-admin"]').forEach(function(el){
    el.style.display=(_userRole==='admin'||hasPerm('*'))?'block':'none';
  });
}
function openSettingsSection(id){
  if(!canAccessSettingsSection(id)){
    showToast('⛔ Vous n’avez pas accès à cette section.','#c0392b',3200);
    return;
  }
  var hub=document.getElementById('settings-hub');
  var sec=document.getElementById('settings-sec-'+id);
  if(!sec)return;
  if(hub)hub.style.display='none';
  document.querySelectorAll('.settings-section').forEach(function(s){
    s.classList.remove('on');
    s.style.display='none';
  });
  sec.classList.add('on');
  sec.style.display='block';
  _settingsSectionOpen=id;
  try{sec.scrollIntoView({behavior:'smooth',block:'start'});}catch(e){}
}
function closeSettingsSection(){
  resetSettingsView();
  try{
    var hub=document.getElementById('settings-hub');
    if(hub)hub.scrollIntoView({behavior:'smooth',block:'start'});
  }catch(e){}
}
function goSettings(){
  if(!canAccessPane('parametres')&&!canAccessPane('migration')){
    showToast('⛔ Vous n’avez pas accès aux paramètres.','#c0392b',3400);
    return;
  }
  const tab=document.querySelector('.tab[data-pane="parametres"]');
  if(tab){tab.click();return;}
  document.querySelectorAll('.tab').forEach(function(x){x.classList.remove('on');});
  document.querySelectorAll('.pane').forEach(function(x){x.classList.remove('on');});
  var el=document.getElementById('pane-parametres');
  if(el)el.classList.add('on');
  resetSettingsView();
  applySettingsHubVisibility();
}
function goMigration(){
  if(!canAccessPane('migration')){
    showToast('⛔ Vous n’avez pas accès à la migration des données.','#c0392b',3400);
    return;
  }
  goSettings();
  setTimeout(function(){openSettingsSection('migration');},80);
}
function toggleAccountMenu(e){
  if(e)e.stopPropagation();
  const m=document.getElementById('account-menu');if(!m)return;
  m.style.display=(m.style.display==='block')?'none':'block';
}
function closeAccountMenu(){
  const m=document.getElementById('account-menu');if(m)m.style.display='none';
}
/* Fermer le menu compte au clic en dehors et sur Échap */
document.addEventListener('click',function(e){
  const m=document.getElementById('account-menu');
  const b=document.getElementById('btn-account');
  if(!m||!b)return;
  if(m.style.display==='block'&&!b.contains(e.target)&&!m.contains(e.target))m.style.display='none';
});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape')closeAccountMenu();
});
/* Synchronise le badge du bouton Messagerie avec celui (caché) de la sidebar */
(function(){
  const sidebarBadge=document.getElementById('msg-mode-badge');
  const headerBadge=document.getElementById('hd-msg-badge');
  if(!sidebarBadge||!headerBadge)return;
  const obs=new MutationObserver(function(){
    headerBadge.style.display=sidebarBadge.style.display;
    headerBadge.textContent=sidebarBadge.textContent||'●';
  });
  obs.observe(sidebarBadge,{attributes:true,childList:true,characterData:true,subtree:true});
})();

/* ── SIDEBAR (menu latéral persistant) ──
   Wide (≥901px) : sidebar permanent décalant le contenu.
   Narrow (≤900px) : popover par-dessus le contenu, fermable via overlay/Échap. */
function _isNarrowLayout(){return window.matchMedia('(max-width:900px)').matches;}
function openDrawer(){
  document.body.classList.add('has-sidebar');
  if(_isNarrowLayout())document.body.style.overflow='hidden';
  try{localStorage.setItem('lb_sidebar','1');}catch(e){}
}
function openDrawerMore(){
  var grid=document.getElementById('drawer-more-grid');
  var sec=document.getElementById('drawer-nav-secondary');
  if(grid&&sec&&!grid.dataset.built){
    sec.querySelectorAll('.tab[data-drawer-more]').forEach(function(btn){
      if(btn.style.display==='none')return;
      var wrap=document.createElement('div');
      wrap.className='drawer-tab-wrap';
      var b=btn.cloneNode(true);
      b.onclick=function(){closeDrawerMore();closeDrawer();var p=b.dataset.pane;var t=document.querySelector('.tab[data-pane="'+p+'"]');if(t)t.click();};
      wrap.appendChild(b);
      grid.appendChild(wrap);
    });
    grid.dataset.built='1';
  }
  var o=document.getElementById('drawer-more-overlay');
  if(o)o.classList.add('on');
}
function closeDrawerMore(){var o=document.getElementById('drawer-more-overlay');if(o)o.classList.remove('on');}
function drawerOpenSettings(){closeDrawerMore();closeDrawer();goSettings();}
document.addEventListener('click',function(e){
  var m=e.target.closest&&e.target.closest('.drawer-tab-messages');
  if(m){e.preventDefault();closeDrawer();goMessages();}
});
function closeDrawer(){
  document.body.classList.remove('has-sidebar');
  document.body.style.overflow='';
  try{localStorage.setItem('lb_sidebar','0');}catch(e){}
}
function toggleDrawer(){
  if(document.body.classList.contains('has-sidebar'))closeDrawer();else openDrawer();
}
/* Init : sidebar visible par défaut sur écrans larges, cachée sur étroits */
(function initSidebar(){
  let stored=null;try{stored=localStorage.getItem('lb_sidebar');}catch(e){}
  const shouldOpen=stored===null?!_isNarrowLayout():(stored==='1');
  document.body.classList.toggle('has-sidebar',shouldOpen);
})();
/* Échap ferme la sidebar uniquement en mode popover (écran étroit) */
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'&&_isNarrowLayout()&&document.body.classList.contains('has-sidebar'))closeDrawer();
});
/* Si on passe étroit→large alors que body.style.overflow était bloqué, débloquer */
window.addEventListener('resize',function(){
  if(!_isNarrowLayout())document.body.style.overflow='';
});

/* ══════════════════════════════════════════
   §1 — CONFIG
   ══════════════════════════════════════════ */
// TECHS : toujours depuis localStorage, jamais de valeur par défaut (évite les techniciens fantômes)
let TECHS=JSON.parse(localStorage.getItem('lb_techs')||'{}');
function saveTechs(){localStorage.setItem('lb_techs',JSON.stringify(TECHS));scheduleSave();}
function getTech(key){return TECHS[key]||{label:key||'?',color:'#888',soft:'#eee'};}
// Resynchronise tous les <select> de techniciens dans les formulaires
function refreshTechSelects(){
  const techOpts=Object.keys(TECHS).map(k=>'<option value="'+k+'">'+TECHS[k].label+'</option>').join('');
  const autoOpts='<option value="auto">Auto</option>'+techOpts;
  ['itech','sc-tech'].forEach(function(id){const el=document.getElementById(id);if(el){const prev=el.value;el.innerHTML=autoOpts;if(TECHS[prev])el.value=prev;}});
  const pp=document.getElementById('pp');if(pp){pp.innerHTML=techOpts;}
  const histTech=document.getElementById('hist-tech');if(histTech){histTech.innerHTML='<option value="">Tous</option>'+techOpts;}
  const absSel=document.getElementById('abs-tech-sel');
  if(absSel){absSel.innerHTML='<option value="">— Technicien —</option>'+techOpts;}
}
const TYPE_LABELS={
  inlay_only:'Inlay core',crown_only:'Couronne zircone',inlay_then_crown:'Inlay + Couronne',
  inlay_composite:'Inlay composite',facettes:'Facettes',cle_schefield:'Clé de Schofield',
  cire_occlusion:"Cire d'occlusion",armature_zircon:'Armature zircon',
  armature_metal:'Armature métallique',inlay_emax:'Inlay/Onlay Emax',
  wax_up:'Wax up',guide_chir:'Guide chirurgical',impression_modele:'Impression de modèle',
  inlay_armature:'Inlay core + Armature',bridge_zircone:'Bridge zircone',
  bridge_metal:'Bridge métal',provisoire:'Provisoire',
};

// Retourne le label complet du travail — affiche tous les types si multi-type
function getJobTypeLabel(job){
  if(job.items&&job.items.length>1){
    return job.items.map(function(i){return TYPE_LABELS[i.type]||i.type;}).join(' + ');
  }
  return TYPE_LABELS[job.type]||job.type;
}

/* ══════════════════════════════════════════
   §2 — TYPES DE TRAVAUX
   ══════════════════════════════════════════ */
// Types par défaut — chargés au premier lancement (supprimables par l'utilisateur)
const DEFAULT_CUSTOM_TYPES=[
  {id:'inlay_only',     label:'Inlay core seul',        category:'Couronnes',            steps:[{label:'Inlay core',tech:'auto',dayOffset:1}]},
  {id:'crown_only',     label:'Couronne zircone seule', category:'Couronnes',            steps:[{label:'Modélisation couronne zircone',tech:'auto',dayOffset:1},{label:'Glaçage couronne zircone',tech:'auto',dayOffset:2}]},
  {id:'inlay_then_crown',label:'Inlay core + Couronne', category:'Couronnes',            steps:[{label:'Inlay core',tech:'auto',dayOffset:1},{label:'Modélisation couronne zircone',tech:'auto',dayOffset:2},{label:'Glaçage couronne zircone',tech:'auto',dayOffset:3}]},
  {id:'inlay_composite',label:'Inlay composite',        category:'Composite & Céramique',steps:[{label:'Inlay composite',tech:'auto',dayOffset:1}]},
  {id:'inlay_emax',     label:'Inlay / Onlay Emax',     category:'Composite & Céramique',steps:[{label:'Inlay/Onlay Emax',tech:'auto',dayOffset:1}]},
  {id:'facettes',       label:'Facettes',               category:'Composite & Céramique',steps:[{label:'Facettes — modélisation',tech:'auto',dayOffset:1},{label:'Facettes — finition',tech:'auto',dayOffset:2}]},
  {id:'armature_zircon',label:'Armature zircon',        category:'Armatures',            steps:[{label:'Armature zircon',tech:'auto',dayOffset:1}]},
  {id:'armature_metal', label:'Armature métallique',    category:'Armatures',            steps:[{label:'Armature métallique',tech:'auto',dayOffset:1}]},
  {id:'cire_occlusion', label:"Cire d'occlusion",       category:'Prothèse & Occlusion', steps:[{label:"Cire d'occlusion",tech:'auto',dayOffset:1}]},
  {id:'cle_schefield',  label:'Clé de Schofield',       category:'Prothèse & Occlusion', steps:[{label:'Clé de Schofield',tech:'auto',dayOffset:1}]},
  {id:'wax_up',         label:'Wax up',                 category:'Prothèse & Occlusion', steps:[{label:'Wax up',tech:'auto',dayOffset:1}]},
  {id:'inlay_armature', label:'Inlay core + Armature',  category:'Bridges',              steps:[{label:'Inlay core',tech:'auto',dayOffset:1},{label:'Armature',tech:'auto',dayOffset:2}]},
  {id:'bridge_zircone', label:'Bridge zircone',         category:'Bridges',              steps:[{label:'Modélisation bridge zircone',tech:'auto',dayOffset:1},{label:'Glaçage bridge zircone',tech:'auto',dayOffset:2}]},
  {id:'bridge_metal',   label:'Bridge métal',           category:'Bridges',              steps:[{label:'Bridge métal',tech:'auto',dayOffset:1}]},
  {id:'provisoire',     label:'Provisoire',             category:'Autre',                steps:[{label:'Provisoire',tech:'auto',dayOffset:1}]},
  {id:'guide_chir',     label:'Guide chirurgical',      category:'Chirurgie & Modèles',  steps:[{label:'Guide chirurgical',tech:'auto',dayOffset:1}]},
  {id:'impression_modele',label:'Impression de modèle', category:'Chirurgie & Modèles',  steps:[{label:'Impression de modèle',tech:'auto',dayOffset:1}]},
];
// Clone les types par défaut (deep copy — évite les mutations de DEFAULT_CUSTOM_TYPES)
function cloneDefaultTypes(){return DEFAULT_CUSTOM_TYPES.map(function(t){return {id:t.id,label:t.label,category:t.category,steps:t.steps.map(function(s){return {label:s.label,tech:s.tech,dayOffset:s.dayOffset};})};});}

let customTypes=JSON.parse(localStorage.getItem('lb_custom_types')||'[]');
function saveCustomTypes(){localStorage.setItem('lb_custom_types',JSON.stringify(customTypes));scheduleSave();}

// Première visite ou migration : injecter les types par défaut
if(!localStorage.getItem('lb_types_seeded')){
  if(!customTypes.length)customTypes=cloneDefaultTypes();
  localStorage.setItem('lb_types_seeded','1');
  saveCustomTypes();
}

// Synchronise les types dans TYPE_LABELS pour que TYPE_LABELS[x]||x fonctionne partout
function syncCustomTypesToTL(){customTypes.forEach(function(ct){TYPE_LABELS[ct.id]=ct.label;});}
syncCustomTypesToTL();

// Reconstruit les selects de type depuis customTypes (par catégorie)
// Reconstruit les <select> de types groupés par catégorie
function refreshTypeSelects(){
  const groups={};
  customTypes.forEach(function(t){
    if(!groups[t.category])groups[t.category]=[];
    groups[t.category].push(t);
  });
  const html=Object.keys(groups).map(function(cat){
    return '<optgroup label="'+cat+'">'+groups[cat].map(function(t){return '<option value="'+t.id+'">'+t.label+'</option>';}).join('')+'</optgroup>';
  }).join('');
  ['it','saisie-it'].forEach(function(id){
    const sel=document.getElementById(id);if(!sel)return;
    const prev=sel.value;
    sel.innerHTML=html||'<option value="">'+t('select.no_type')+'</option>';
    if(prev&&sel.querySelector('option[value="'+prev+'"]'))sel.value=prev;
  });
}
const EMP_TYPES=['crown_only','inlay_composite','facettes','armature_zircon','armature_metal','inlay_emax','wax_up','bridge_zircone','bridge_metal'];
const MFR=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DFR=['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];

/* ══════════════════════════════════════════
   §3 — STATE
   ══════════════════════════════════════════ */
let jobs       = JSON.parse(localStorage.getItem('lb_jobs')||'[]');
let archive    = JSON.parse(localStorage.getItem('lb_archive')||'[]');
let cabinets   = JSON.parse(localStorage.getItem('lb_cabinets')||'[]');
let syns       = JSON.parse(localStorage.getItem('lb_syns')||'{}');
let scanHist   = JSON.parse(localStorage.getItem('lb_scans')||'[]');
let _lastLocalMutationAt = 0;
let pending    = [];
let calView    = 'week';
let calCursor  = new Date();
let printHTML  = '';

function saveJobs(){
  _lastLocalMutationAt = Date.now();
  localStorage.setItem('lb_jobs',JSON.stringify(jobs));
  scheduleSave();
}
let _saveTimer=null;
// Debounce 2s avant d'appeler cloudSave (évite les sauvegardes en rafale)
function scheduleSave(){
  clearTimeout(_saveTimer);
  _saveTimer=setTimeout(function(){
    if(typeof cloudSave==='function')cloudSave();
  },2000); // 2s debounce — sauvegarde rapide après chaque changement
}
function saveArchive(){localStorage.setItem('lb_archive',JSON.stringify(archive));scheduleSave();}
function saveCabinets(){localStorage.setItem('lb_cabinets',JSON.stringify(cabinets));scheduleSave();}
function saveSyns(){localStorage.setItem('lb_syns',JSON.stringify(syns));scheduleSave();}
function saveScanHist(){localStorage.setItem('lb_scans',JSON.stringify(scanHist));scheduleSave();}

/* ── Livraison : date demandée / date labo / créneau coursier ── */
var LAB_DELIVERY_SLOTS={9:'9h coursier',12:'12h coursier',18:'18h coursier'};
function _labSlotHour(slot){var h=parseInt(slot,10);return h===9||h===18?h:12;}
function migrateJobDelivery(j){
  if(!j)return;
  if(!j.labDeliveryDate&&j.deliveryDate)j.labDeliveryDate=j.deliveryDate;
  if(!j.requestedDeliveryDate)j.requestedDeliveryDate=j.labDeliveryDate||j.deliveryDate||'';
  if(!j.labDeliverySlot)j.labDeliverySlot='12';
  j.deliveryDate=j.labDeliveryDate||j.deliveryDate||'';
  if(!j.attachments)j.attachments=[];
}
function migrateAllJobsDelivery(){jobs.forEach(migrateJobDelivery);if(typeof queue!=='undefined'&&queue)queue.forEach(migrateJobDelivery);}
function _jobLabDeliveryDate(j){migrateJobDelivery(j);return j.labDeliveryDate||'';}
function _jobRequestedDeliveryDate(j){migrateJobDelivery(j);return j.requestedDeliveryDate||'';}
function _fmtDeliverySlot(slot){return LAB_DELIVERY_SLOTS[slot]||LAB_DELIVERY_SLOTS['12'];}
function _isLabOpenDay(d){
  if(!d||isNaN(d.getTime()))return false;
  var w=d.getDay();
  if(w===0||w===6)return false;
  try{
    var iso=typeof fmtISO==='function'?fmtISO(d):'';
    if(iso&&typeof conges!=='undefined'&&conges&&conges.indexOf(iso)>=0)return false;
  }catch(e){}
  return true;
}
function _lastLabOpenDayOnOrBefore(d){
  var cur=new Date(d.getTime());
  var guard=0;
  while(!_isLabOpenDay(cur)&&guard<400){
    cur.setDate(cur.getDate()-1);
    guard++;
  }
  return cur;
}
function _suggestLabDateFromRequested(iso){
  if(!iso)return '';
  var requested=new Date(iso+'T12:00:00');
  if(isNaN(requested.getTime()))return '';
  var d=new Date(requested.getTime());
  d.setDate(d.getDate()-1);
  d=_lastLabOpenDayOnOrBefore(d);
  return fmtISO(d);
}
function _deliveryDeadline(j){
  migrateJobDelivery(j);
  var d=j.labDeliveryDate;if(!d)return null;
  return new Date(d+'T'+String(_labSlotHour(j.labDeliverySlot)).padStart(2,'0')+':00:00');
}
function _isJobLate(j){
  if(!j||j.urgent)return false;
  var dl=_deliveryDeadline(j);if(!dl)return false;
  if(typeof bdl!=='undefined'&&bdl&&bdl.find(function(b){return b.jobId===j.id;}))return false;
  return Date.now()>dl.getTime();
}
function _fmtJobDeliveryLine(j){
  migrateJobDelivery(j);
  var lab=_jobLabDeliveryDate(j),req=_jobRequestedDeliveryDate(j),slot=_fmtDeliverySlot(j.labDeliverySlot);
  if(!lab&&!req)return '';
  var parts=[];
  if(lab)parts.push('📦 '+new Date(lab+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'short'})+' · '+slot);
  if(req&&req!==lab)parts.push('dem. '+new Date(req+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'short'}));
  return parts.join(' · ');
}
function readSaisieDeliveryFields(){
  return{requestedDeliveryDate:document.getElementById('saisie-ireq-delivery')?.value||'',labDeliveryDate:document.getElementById('saisie-ilab-delivery')?.value||'',labDeliverySlot:document.getElementById('saisie-idelivery-slot')?.value||'12'};
}
function applyDeliveryFieldsToObject(obj,fields){
  obj.requestedDeliveryDate=fields.requestedDeliveryDate||'';
  obj.labDeliveryDate=fields.labDeliveryDate||fields.requestedDeliveryDate||'';
  obj.labDeliverySlot=fields.labDeliverySlot||'12';
  obj.deliveryDate=obj.labDeliveryDate;return obj;
}
function _deliveryFieldsFromSource(src){
  migrateJobDelivery(src);
  return{requestedDeliveryDate:src.requestedDeliveryDate||'',labDeliveryDate:src.labDeliveryDate||src.deliveryDate||'',labDeliverySlot:src.labDeliverySlot||'12'};
}
function resetSaisieDeliveryFields(){
  ['saisie-ireq-delivery','saisie-ilab-delivery'].forEach(function(id){var el=document.getElementById(id);if(el){el.value='';delete el.dataset.userSet;}});
  var slot=document.getElementById('saisie-idelivery-slot');if(slot)slot.value='12';
}
function onSaisieRequestedDateChange(){
  var req=document.getElementById('saisie-ireq-delivery'),lab=document.getElementById('saisie-ilab-delivery');
  if(!req||!lab||lab.dataset.userSet)return;
  if(req.value){
    lab.value=_suggestLabDateFromRequested(req.value);
    lab.title='Dernier jour ouvré du labo avant la livraison demandée (week-ends et congés exclus)';
  }
}
function onSaisieLabDateChange(){var lab=document.getElementById('saisie-ilab-delivery');if(lab&&lab.value)lab.dataset.userSet='1';}
function _deliverySlotOptionsHtml(cur){
  return [['9','9h — coursier'],['12','12h — coursier'],['18','18h — coursier']].map(function(s){
    return '<option value="'+s[0]+'"'+(String(cur||'12')===s[0]?' selected':'')+'>'+s[1]+'</option>';
  }).join('');
}
function ensureJobAttachments(job){migrateJobDelivery(job);if(!job.attachments)job.attachments=[];}
function _compressImageDataUrl(dataUrl,cb){
  var img=new Image();
  img.onload=function(){
    var maxW=1200,w=img.width,h=img.height;
    if(w>maxW){h=Math.round(h*maxW/w);w=maxW;}
    var c=document.createElement('canvas');c.width=w;c.height=h;
    c.getContext('2d').drawImage(img,0,0,w,h);
    cb(c.toDataURL('image/jpeg',0.72));
  };
  img.onerror=function(){cb(dataUrl);};
  img.src=dataUrl;
}
function addJobAttachmentFromFile(jobId,file,type,cb){
  var job=jobs.find(function(j){return String(j.id)===String(jobId);});
  if(!job||!file)return;
  if(file.size>4*1024*1024){alert('Fichier trop volumineux (max 4 Mo).');return;}
  var reader=new FileReader();
  reader.onload=function(){
    var save=function(dataUrl){
      ensureJobAttachments(job);
      job.attachments.push({id:'att'+Date.now(),type:type,name:file.name||'document',mime:file.type||'application/octet-stream',data:dataUrl,createdAt:new Date().toISOString()});
      saveJobs();if(cb)cb();
    };
    if(file.type&&file.type.indexOf('image/')===0)_compressImageDataUrl(reader.result,save);
    else save(reader.result);
  };
  reader.readAsDataURL(file);
}
function removeJobAttachment(jobId,attId){
  var job=jobs.find(function(j){return String(j.id)===String(jobId);});
  if(!job||!job.attachments)return;
  job.attachments=job.attachments.filter(function(a){return a.id!==attId;});
  saveJobs();
}
function generateLabSheetHTML(job){
  migrateJobDelivery(job);
  var cab=job.cabinet?cabinets.find(function(c){return c.id===job.cabinet;}):null;
  var labName=localStorage.getItem('lb_name')||'Laboratoire';
  var deliv=_fmtJobDeliveryLine(job)||'—';
  var tasksRows='';
  if(job.tasks&&job.tasks.length){
    tasksRows=job.tasks.map(function(t){
      var dueStr='—';
      if(t.dueDate){try{dueStr=fmtL(t.dueDate);}catch(e){dueStr=String(t.dueDate).slice(0,10);}}
      var techLbl='';
      try{techLbl=(typeof getTech==='function'?getTech(t.tech).label:t.tech)||'';}catch(e2){techLbl=t.tech||'';}
      return '<tr><td style="padding:6px 8px;border-bottom:1px solid #e8e0d8;">'+escH2(t.label)+'</td><td style="padding:6px 8px;border-bottom:1px solid #e8e0d8;">'+escH2(techLbl)+'</td><td style="padding:6px 8px;border-bottom:1px solid #e8e0d8;">'+dueStr+'</td><td style="padding:6px 8px;border-bottom:1px solid #e8e0d8;">'+(t.done?'✓':'')+'</td></tr>';
    }).join('');
  }
  var itemsLbl=(typeof getJobTypeLabel==='function')?getJobTypeLabel(job):(job.type||'');
  var reqD=_jobRequestedDeliveryDate(job);
  return '<div class="print-wrap" style="font-family:Georgia,serif;max-width:720px;margin:0 auto;padding:24px;color:#1e293b;">'+
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #2a6049;padding-bottom:12px;margin-bottom:18px;">'+
      '<div><div style="font-size:1.35rem;font-weight:700;color:#2a6049;">'+escH2(labName)+'</div><div style="font-size:.85rem;color:#64748b;margin-top:4px;">Fiche de travail — laboratoire</div></div>'+
      '<div style="text-align:right;font-size:.8rem;color:#64748b;">Généré le '+new Date().toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})+'</div>'+
    '</div>'+
    '<table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:.92rem;">'+
      '<tr><td style="padding:6px 0;color:#64748b;width:140px;">Code patient</td><td style="font-weight:700;font-size:1.1rem;">'+escH2(job.patient)+(job.urgent?' <span style="color:#dc2626;">🔴 URGENT</span>':'')+'</td></tr>'+
      '<tr><td style="padding:6px 0;color:#64748b;">Type</td><td><strong>'+escH2(itemsLbl)+'</strong>'+(job.nb>1?' × '+job.nb:'')+'</td></tr>'+
      (cab?'<tr><td style="padding:6px 0;color:#64748b;">Cabinet</td><td>'+escH2(cab.name)+'</td></tr>':'')+
      (job.prothesisId?'<tr><td style="padding:6px 0;color:#64748b;">Réf. prothèse</td><td>'+escH2(job.prothesisId)+'</td></tr>':'')+
      '<tr><td style="padding:6px 0;color:#64748b;">Livraison labo</td><td style="color:#2a6049;font-weight:600;">'+escH2(deliv)+'</td></tr>'+
      (reqD&&reqD!==_jobLabDeliveryDate(j)?'<tr><td style="padding:6px 0;color:#64748b;">Date demandée</td><td>'+new Date(reqD+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})+'</td></tr>':'')+
    '</table>'+
    (job.note?'<div style="background:#fef9c3;border-left:3px solid #facc15;padding:12px 14px;margin-bottom:16px;white-space:pre-wrap;font-size:.9rem;line-height:1.55;"><strong>Instructions</strong><br/>'+escH2(job.note)+'</div>':'')+
    (tasksRows?'<div style="margin-top:12px;"><div style="font-size:.78rem;font-weight:700;text-transform:uppercase;color:#64748b;margin-bottom:8px;">Étapes</div><table style="width:100%;border-collapse:collapse;font-size:.85rem;"><thead><tr style="background:#f1f5f9;"><th style="text-align:left;padding:6px 8px;">Étape</th><th style="text-align:left;padding:6px 8px;">Technicien</th><th style="text-align:left;padding:6px 8px;">Date</th><th style="padding:6px 8px;">Fait</th></tr></thead><tbody>'+tasksRows+'</tbody></table></div>':'')+
    '<div style="margin-top:28px;padding-top:12px;border-top:1px dashed #cbd5e1;font-size:.72rem;color:#94a3b8;">Document interne — '+escH2(job.trackCode||job.id)+'</div>'+
  '</div>';
}
function _showLabSheetPreview(html){
  var overlay=document.getElementById('print-overlay');
  var content=document.getElementById('print-content');
  if(!overlay||!content){alert('Aperçu d\'impression indisponible.');return false;}
  overlay.style.zIndex='10050';
  content.innerHTML=html;
  overlay.style.display='block';
  return true;
}
function printJobLabSheet(jobId){
  var job=jobs.find(function(j){return String(j.id)===String(jobId);});
  if(!job){alert('Travail introuvable');return;}
  try{
    var html=generateLabSheetHTML(job);
    if(!_showLabSheetPreview(html)){
      var w=window.open('','_blank','width=900,height=700');
      if(!w){alert('Autorisez les pop-ups ou utilisez l\'aperçu impression.');return;}
      w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Fiche labo</title><style>body{margin:0;padding:16px;}@media print{body{padding:0;}}</style></head><body>'+html+'</body></html>');
      w.document.close();
      w.focus();
      setTimeout(function(){try{w.print();}catch(e){}},300);
    }
  }catch(err){
    console.error('printJobLabSheet',err);
    alert('Erreur lors de la génération de la fiche : '+(err.message||err));
  }
}
function saveGeneratedLabSheet(jobId){
  var job=jobs.find(function(j){return String(j.id)===String(jobId);});
  if(!job){alert('Travail introuvable');return;}
  try{
    var html=generateLabSheetHTML(job);
    ensureJobAttachments(job);
    job.attachments=job.attachments.filter(function(a){return !(a.type==='lab_sheet'&&a.autoGenerated);});
    job.attachments.push({id:'ls'+Date.now(),type:'lab_sheet',name:'Fiche labo — '+job.patient+'.html',mime:'text/html',html:html,autoGenerated:true,createdAt:new Date().toISOString()});
    saveJobs();
    if(_showLabSheetPreview(html)){
      if(typeof showToast==='function')showToast('Fiche labo générée — cliquez Imprimer en haut','#2a6049',4000);
    }else{
      printJobLabSheet(jobId);
    }
  }catch(err){
    console.error('saveGeneratedLabSheet',err);
    alert('Erreur lors de la génération : '+(err.message||err));
  }
}
function viewJobAttachment(jobId,attId){
  var job=jobs.find(function(j){return String(j.id)===String(jobId);});
  if(!job)return;
  var att=(job.attachments||[]).find(function(a){return a.id===attId;});
  if(!att)return;
  var w=window.open('','_blank');
  if(!w)return;
  if(att.html){w.document.write(att.html);w.document.close();return;}
  if(att.data&&att.mime&&att.mime.indexOf('image/')===0){
    w.document.write('<html><body style="margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#111;"><img src="'+att.data+'" style="max-width:100%;max-height:100vh;"/></body></html>');
    w.document.close();return;
  }
  if(att.data)w.location.href=att.data;
}
function _renderJobAttachmentsSection(jobId){
  var job=jobs.find(function(j){return String(j.id)===String(jobId);});
  if(!job)return '';
  ensureJobAttachments(job);
  var list=job.attachments.length?job.attachments.map(function(a){
    var lbl=a.type==='prescription'?'📄 Prescription':(a.type==='lab_sheet'?'📋 Fiche labo':'📎 '+escH2(a.name));
    return '<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:7px;margin-bottom:6px;">'+
      '<span style="flex:1;font-size:.8rem;">'+lbl+'</span>'+
      '<button type="button" onclick="viewJobAttachment(\''+jobId+'\',\''+a.id+'\')" style="background:#dbeafe;color:#1d4ed8;border:none;border-radius:5px;padding:4px 10px;font-size:.72rem;cursor:pointer;">Voir</button>'+
      '<button type="button" onclick="removeJobAttachment(\''+jobId+'\',\''+a.id+'\');editJob(\''+jobId+'\')" style="background:none;border:none;color:#c0392b;cursor:pointer;font-size:.9rem;">×</button>'+
    '</div>';
  }).join(''):'<div style="font-size:.78rem;color:#94a3b8;font-style:italic;margin-bottom:8px;">Aucune pièce jointe</div>';
  return '<div style="margin-top:14px;padding-top:14px;border-top:1px solid #e2e8f0;">'+
    '<div style="font-size:.74rem;font-weight:600;color:#64748b;margin-bottom:8px;">📎 Documents du dossier</div>'+
    list+
    '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;">'+
      '<label style="background:#fff;border:1.5px solid #cbd5e1;border-radius:7px;padding:8px 12px;font-size:.78rem;cursor:pointer;font-weight:600;color:#475569;">📷 Scanner prescription<input type="file" accept="image/*,.pdf" style="display:none;" onchange="if(this.files[0]){addJobAttachmentFromFile(\''+jobId+'\',this.files[0],\'prescription\',function(){editJob(\''+jobId+'\');});this.value=\'\';}"/></label>'+
      '<button type="button" data-gen-lab-sheet="'+escH2(jobId)+'" style="background:#2a6049;color:#fff;border:none;border-radius:7px;padding:8px 14px;font-size:.78rem;font-weight:600;cursor:pointer;">📋 Générer fiche labo</button>'+
    '</div>'+
  '</div>';
}
jobs.forEach(migrateJobDelivery);

/* ══════════════════════════════════════════
   §4 — DATE & UTILS
   ══════════════════════════════════════════ */
function addWD(d,n){const r=new Date(d);let a=0;while(a<n){r.setDate(r.getDate()+1);if(r.getDay()!==0&&r.getDay()!==6)a++;}return r;}
function sameDay(a,b){return new Date(a).toDateString()===new Date(b).toDateString();}
function fmtL(d){return new Date(d).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});}
function fmtS(d){return new Date(d).toLocaleDateString('fr-FR',{day:'numeric',month:'short'});}
function fmtISO(d){const x=new Date(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;}
function sowk(d){const r=new Date(d);const dy=r.getDay();r.setDate(r.getDate()-(dy===0?6:dy-1));return r;}

/* ══════════════════════════════════════════
   §5 — TECH ASSIGNMENT
   ══════════════════════════════════════════ */
// Choisit le technicien le moins chargé dans un pool pour un jour donné
function pick(pool,day,forced){
  if(forced&&TECHS[forced])return forced;
  // Filtrer en priorité contre les techniciens RÉELS du compte (TECHS) :
  // les pools "PM/PF/PO" historiques contiennent des clés (jc, lilou…) qui
  // n'existent plus sur les nouveaux comptes. Sans ce filtre, on assignerait
  // un technicien fantôme.
  const validInPool=pool.filter(function(k){return TECHS[k];});
  const allValid=Object.keys(TECHS||{});
  const effectivePool=validInPool.length?validInPool:allValid;
  if(!effectivePool.length)return forced||'auto';
  const avail=effectivePool.filter(function(t){return !isTechAbsent(t,new Date(day));});
  const active=avail.length?avail:effectivePool;
  const ds=new Date(day).toDateString();
  const c={};active.forEach(function(t){c[t]=0;});
  jobs.forEach(function(j){(j.tasks||[]).forEach(function(t){if(active.indexOf(t.tech)>=0&&new Date(t.dueDate).toDateString()===ds)c[t.tech]=(c[t.tech]||0)+1;});});
  return active.reduce(function(a,b){return c[a]<=c[b]?a:b;});
}

/* ══════════════════════════════════════════
   §6 — JOB MANAGEMENT
   ══════════════════════════════════════════ */
// Génère le planning de tâches pour un travail selon le type, l'empreinte num. et le tech forcé
function buildTasks(type,emp,forced,startDate){
  const base=startDate||new Date();const tasks=[];
  // ── PRIORITÉ À LA CONFIG PERSONNALISÉE ────────────────────────────────────
  // Si l'utilisateur a édité ce type via "Modifier le type" (même pour un type
  // intégré comme 'crown_only'), on utilise SA configuration plutôt que les
  // pools hardcodés. Sinon les techniciens fantômes (jc, litcha, fabien…) qui
  // n'existent plus dans les nouveaux comptes seraient assignés à tort.
  const customDef=Array.isArray(customTypes)?customTypes.find(function(c){return c.id===type;}):null;
  const hasCustomSteps=customDef&&Array.isArray(customDef.steps)&&customDef.steps.length>0;
  const PM=['jc','lilou','litcha','tom'];
  const PF=['jc','litcha'];
  const PO=['marie','tom'];
  const PC=['gilles','litcha'];
  // Tout push valide le tech : si la clé hardcodée n'existe pas dans TECHS,
  // on bascule vers le picker (qui fallback sur tous les techs disponibles).
  function push(lbl,tech,day){
    let finalTech=tech;
    if(tech&&tech!=='auto'&&!TECHS[tech]){
      const allValid=Object.keys(TECHS||{});
      finalTech=allValid.length?pick(allValid,day,forced):tech;
    }
    tasks.push({label:lbl,tech:finalTech,dueDate:new Date(day).toISOString()});
  }
  function scan(d){push('Scan & impression modèle','fabien',d);}
  function recup(d){push('Récupération fichiers empreinte optique','fabien',d);}
  function imp(d){push('Impression du modèle','fabien',d);}
  // Si une config personnalisée existe pour ce type, l'utiliser directement
  // (même pour un type intégré comme 'crown_only'). Cette logique évite que
  // les pools historiques court-circuitent la config utilisateur.
  if(hasCustomSteps){
    const stepsToUse=(emp&&customDef.stepsEmp&&customDef.stepsEmp.length)?customDef.stepsEmp:customDef.steps;
    stepsToUse.forEach(function(step){
      const d=addWD(base,Math.max(1,step.dayOffset||1));
      const allTechKeys=Object.keys(TECHS||{});
      let techKey;
      if(step.sameAs!==null&&step.sameAs!==undefined&&tasks[step.sameAs]){
        techKey=tasks[step.sameAs].tech;
      } else if(!step.tech||step.tech==='auto'){
        techKey=allTechKeys.length?pick(allTechKeys,d,forced):(forced||'auto');
      } else if(Array.isArray(step.tech)){
        const pool=step.tech.filter(function(k){return TECHS[k];});
        techKey=pool.length?pick(pool,d,forced):(allTechKeys.length?pick(allTechKeys,d,forced):'auto');
      } else {
        techKey=TECHS[step.tech]?step.tech:(allTechKeys.length?pick(allTechKeys,d,forced):'auto');
      }
      push(step.label,techKey,d);
    });
    return tasks;
  }
  function simple(pool,lbl){
    const d1=addWD(base,1);const t=pick(pool,d1,forced);
    if(emp){recup(d1);push(lbl,t,d1);imp(addWD(d1,1));}
    else{scan(d1);push(lbl,t,d1);}
  }
  if(type==='inlay_only'){push('Inlay core','marie',addWD(base,1));}
  else if(type==='crown_only'){
    const d1=addWD(base,1);const t=pick(PM,d1,forced);
    if(emp){recup(d1);push('Modélisation couronne zircone',t,d1);imp(addWD(d1,1));push('Glaçage couronne zircone',t,addWD(d1,1));}
    else{scan(d1);push('Modélisation couronne zircone',t,d1);push('Glaçage couronne zircone',t,addWD(d1,1));}
  }
  else if(type==='inlay_then_crown'){
    const d1=addWD(base,1);push('Inlay core','marie',d1);
    const d2=addWD(d1,1);const t=pick(PM,d2,forced);
    if(emp){recup(d2);push('Modélisation couronne zircone',t,d2);imp(addWD(d2,1));push('Glaçage couronne zircone',t,addWD(d2,1));}
    else{scan(d2);push('Modélisation couronne zircone',t,d2);push('Glaçage couronne zircone',t,addWD(d2,1));}
  }
  else if(type==='inlay_composite'){simple(PM,'Inlay composite');}
  else if(type==='inlay_emax'){simple(PM,'Inlay/Onlay Emax');}
  else if(type==='armature_zircon'){simple(PM,'Armature zircon');}
  else if(type==='armature_metal'){simple(PM,'Armature métallique');}
  else if(type==='wax_up'){simple(PM,'Wax up');}
  else if(type==='facettes'){
    const d1=addWD(base,1);const t=pick(PF,d1,forced);
    if(emp){recup(d1);push('Facettes — modélisation',t,d1);imp(addWD(d1,1));push('Facettes — finition',t,addWD(d1,1));}
    else{scan(d1);push('Facettes — modélisation',t,d1);push('Facettes — finition',t,addWD(d1,1));}
  }
  else if(type==='cle_schefield'){push('Clé de Schofield','marie',addWD(base,1));}
  else if(type==='cire_occlusion'){const d1=addWD(base,1);push("Cire d'occlusion",pick(PO,d1,forced),d1);}
  else if(type==='guide_chir'){const d1=addWD(base,1);push('Guide chirurgical',pick(PC,d1,forced),d1);}
  else if(type==='impression_modele'){push('Impression de modèle','fabien',addWD(base,1));}
  else if(type==='inlay_armature'){
    // J+1 : Marie inlay core
    const d1=addWD(base,1);push('Inlay core','marie',d1);
    // J+2 : Fabien scan + armature même jour
    const d2=addWD(d1,1);const ta=pick(PM,d2,forced);
    if(emp){recup(d2);push('Armature',ta,d2);imp(addWD(d2,1));}
    else{scan(d2);push('Armature',ta,d2);}
  }
  else if(type==='bridge_zircone'){
    const d1=addWD(base,1);const t=pick(PM,d1,forced);
    if(emp){recup(d1);push('Modélisation bridge zircone',t,d1);const d2=addWD(d1,1);imp(d2);push('Glaçage bridge zircone',t,d2);}
    else{scan(d1);push('Modélisation bridge zircone',t,d1);push('Glaçage bridge zircone',t,addWD(d1,1));}
  }
  else if(type==='bridge_metal'){
    const d1=addWD(base,1);const t=pick(PM,d1,forced);
    if(emp){recup(d1);push('Bridge métal',t,d1);imp(addWD(d1,1));}
    else{scan(d1);push('Bridge métal',t,d1);}
  }
  else if(type==='provisoire'){
    const d1=addWD(base,1);push('Provisoire',pick(['jc','lilou','litcha','marie','tom'],d1,forced),d1);
  }
  else {
    // Type personnalisé
    const ct=customTypes.find(function(c){return c.id===type;});
    if(ct&&ct.steps&&ct.steps.length){
      const stepsToUse=(emp&&ct.stepsEmp&&ct.stepsEmp.length)?ct.stepsEmp:ct.steps;
      stepsToUse.forEach(function(step){
        const d=addWD(base,Math.max(1,step.dayOffset||1));
        const allTechKeys=Object.keys(TECHS);
        let techKey;
        // Liaison : même technicien qu'une étape précédente
        if(step.sameAs!==null&&step.sameAs!==undefined&&tasks[step.sameAs]){
          techKey=tasks[step.sameAs].tech;
        } else if(!step.tech||step.tech==='auto'){
          techKey=allTechKeys.length?pick(allTechKeys,d,forced):(forced||'auto');
        } else if(Array.isArray(step.tech)){
          const pool=step.tech.filter(function(k){return TECHS[k];});
          techKey=pool.length?pick(pool,d,forced):(allTechKeys.length?pick(allTechKeys,d,forced):'auto');
        } else {
          techKey=step.tech;
        }
        push(step.label||'Étape',techKey,d);
      });
    }
  }
  return tasks;
}

// — Ajout depuis le formulaire principal (mode programmation)
// Valide le formulaire d'ajout et crée un nouveau job programmé
function addJob(){
  const name=document.getElementById('ip').value.trim();
  const type=document.getElementById('it').value;
  const nb=parseInt(document.getElementById('inb').value)||1;
  const emp=document.getElementById('iemp').checked&&EMP_TYPES.includes(type);
  const ts=document.getElementById('itech').value;
  const forced=ts!=='auto'?ts:null;
  const urg=document.getElementById('iurg').checked;
  const note=document.getElementById('inote').value.trim();
  const deliveryDate=document.getElementById('idelivery')?.value||'';
  const cabEl=document.getElementById('icab');const cab=cabEl?cabEl.value:'';
  const prothesisId=document.getElementById('iprothesis')?.value.trim()||'';
  if(!name){alert(t('alert.enter_patient'));return;}
  const tasks=buildTasks(type,emp,forced);
  if(!tasks.length){alert(t('alert.unknown_type'));return;}
  const lbl=nb>1?name+' ('+nb+' éléments)':name;
  const items=getProgItems(type,nb);
  jobs.push({id:String(Date.now()),patient:lbl,type,tasks,nb,items,urgent:urg,note,deliveryDate,cabinet:cab,createdAt:new Date().toISOString(),trackCode:genTrackCode(),prothesisId});
  saveJobs();autoPublishCab(cab);
  document.getElementById('ip').value='';
  document.getElementById('inb').value='1';
  document.getElementById('iemp').checked=false;
  document.getElementById('iurg').checked=false;
  document.getElementById('inote').value='';
  document.getElementById('itech').value='auto';
  if(document.getElementById('idelivery'))document.getElementById('idelivery').value='';
  if(document.getElementById('iprothesis'))document.getElementById('iprothesis').value='';
  resetProgLines();
  render();
// Afficher la dernière sauvegarde
const lastSave=localStorage.getItem('lb_last_save');
if(lastSave){const el=document.getElementById('cloud-last');if(el){const d=new Date(lastSave);el.textContent=ti('cloud.last_save',{date:d.toLocaleDateString(t('locale')),time:d.toLocaleTimeString(t('locale'),{hour:'2-digit',minute:'2-digit'})});}}
}

// — Suppression individuelle ou globale
function delJob(id){jobs=jobs.filter(j=>String(j.id)!==String(id));saveJobs();render();}

/* ── EFFACEMENT EN MASSE PROTÉGÉ ───────────────────────────────────────────
   Au lieu d'un simple confirm() qui s'écrase trop facilement par mégarde,
   on impose :
   1. Une modale rouge avec saisie textuelle "EFFACER" pour confirmer
   2. Un snapshot dans localStorage avant la suppression (récupération possible)
   3. Une bannière "Annuler" pendant 30 secondes après l'effacement
   4. Un bouton de restauration dans Paramètres pour récupérer plus tard */
const TRASH_SNAPSHOT_KEY='lb_trash_snapshot';
const TRASH_RETENTION_MS=30*24*60*60*1000; // 30 jours

function _saveTrashSnapshot(reason,payload){
  try{
    const snap={reason:reason,createdAt:new Date().toISOString(),payload:payload};
    localStorage.setItem(TRASH_SNAPSHOT_KEY,JSON.stringify(snap));
  }catch(e){console.warn('saveTrashSnapshot',e);}
}
function getTrashSnapshot(){
  try{
    const raw=localStorage.getItem(TRASH_SNAPSHOT_KEY);if(!raw)return null;
    const snap=JSON.parse(raw);
    if(!snap||!snap.payload)return null;
    // Auto-purge si trop vieux
    const age=Date.now()-new Date(snap.createdAt).getTime();
    if(age>TRASH_RETENTION_MS){localStorage.removeItem(TRASH_SNAPSHOT_KEY);return null;}
    return snap;
  }catch(e){return null;}
}
function _showUndoBanner(message,onUndo){
  const old=document.getElementById('undo-banner');if(old)old.remove();
  const banner=document.createElement('div');
  banner.id='undo-banner';
  banner.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1e293b;color:#fff;padding:14px 18px;border-radius:12px;display:flex;align-items:center;gap:14px;box-shadow:0 8px 24px rgba(0,0,0,.3);z-index:9998;min-width:280px;max-width:90vw;animation:slideUp .25s ease;';
  banner.innerHTML='<span style="flex:1;font-size:.92rem;line-height:1.4;">'+escH2(message)+'</span>'+
    '<button id="undo-btn" style="background:#fbbf24;color:#1e293b;border:none;border-radius:8px;padding:8px 16px;font-weight:700;font-size:.88rem;cursor:pointer;white-space:nowrap;">↩️ Annuler</button>'+
    '<button id="undo-dismiss" style="background:transparent;color:#94a3b8;border:none;font-size:1.4rem;cursor:pointer;line-height:1;padding:0 4px;">×</button>';
  document.body.appendChild(banner);
  let timer=setTimeout(function(){if(banner.parentNode)banner.remove();},30000);
  banner.querySelector('#undo-btn').onclick=function(){
    clearTimeout(timer);banner.remove();
    if(typeof onUndo==='function')onUndo();
  };
  banner.querySelector('#undo-dismiss').onclick=function(){
    clearTimeout(timer);banner.remove();
  };
}

function clearAll(){
  if(!jobs.length){showToast(t('toast.nothing_to_clear')||'Aucun travail à effacer','#64748b');return;}
  const count=jobs.length;
  // Modal protectrice avec saisie textuelle
  const overlay=document.createElement('div');
  overlay.id='clearall-overlay';
  overlay.style.cssText='position:fixed;inset:0;background:rgba(15,23,42,.7);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;';
  overlay.innerHTML=
    '<div style="background:#fff;border-radius:14px;padding:30px 32px;max-width:480px;width:100%;box-shadow:0 24px 60px rgba(0,0,0,.4);">'+
      '<div style="font-size:3rem;text-align:center;margin-bottom:8px;">⚠️</div>'+
      '<h2 style="margin:0 0 8px 0;font-size:1.3rem;font-weight:800;color:#dc2626;text-align:center;">Effacer TOUS les travaux ?</h2>'+
      '<p style="margin:0 0 16px 0;font-size:.96rem;color:#475569;line-height:1.55;text-align:center;">Vous êtes sur le point de supprimer <strong style="color:#dc2626;">'+count+' travail'+(count>1?'x':'')+'</strong>. Cette action est <strong>irréversible immédiatement</strong>, mais vous aurez 30 secondes pour annuler.</p>'+
      '<div style="background:#fef2f2;border-left:3px solid #dc2626;padding:10px 14px;border-radius:0 6px 6px 0;font-size:.86rem;color:#7f1d1d;margin-bottom:18px;">Pour confirmer, tapez <strong>EFFACER</strong> dans le champ ci-dessous.</div>'+
      '<input type="text" id="clearall-input" autocomplete="off" placeholder="EFFACER" style="width:100%;padding:12px 14px;border:2px solid #cbd5e1;border-radius:8px;font-size:1.1rem;outline:none;font-family:monospace;text-align:center;letter-spacing:.1em;margin-bottom:18px;"/>'+
      '<div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;">'+
        '<button id="clearall-cancel" style="background:#f1f5f9;color:#1e293b;border:none;border-radius:8px;padding:11px 22px;font-size:.94rem;font-weight:600;cursor:pointer;">Annuler</button>'+
        '<button id="clearall-confirm" disabled style="background:#dc2626;color:#fff;border:none;border-radius:8px;padding:11px 22px;font-size:.94rem;font-weight:700;cursor:pointer;opacity:.4;">Effacer définitivement</button>'+
      '</div>'+
    '</div>';
  document.body.appendChild(overlay);
  const input=document.getElementById('clearall-input');
  const confirmBtn=document.getElementById('clearall-confirm');
  setTimeout(function(){input.focus();},80);
  input.addEventListener('input',function(){
    const ok=input.value.trim().toUpperCase()==='EFFACER';
    confirmBtn.disabled=!ok;
    confirmBtn.style.opacity=ok?'1':'.4';
  });
  input.addEventListener('keydown',function(e){if(e.key==='Enter'&&!confirmBtn.disabled)confirmBtn.click();});
  document.getElementById('clearall-cancel').onclick=function(){overlay.remove();};
  overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
  confirmBtn.onclick=function(){
    if(confirmBtn.disabled)return;
    // Snapshot complet avant effacement
    const snapshotPayload={jobs:JSON.parse(JSON.stringify(jobs))};
    _saveTrashSnapshot('clearAll',snapshotPayload);
    jobs=[];saveJobs();render();
    _refreshRestoreButton();
    overlay.remove();
    _showUndoBanner(count+' travail'+(count>1?'x':'')+' effacé'+(count>1?'s':'')+'. Annuler ?',function(){
      // Restauration immédiate
      const snap=getTrashSnapshot();
      if(snap&&snap.payload&&Array.isArray(snap.payload.jobs)){
        jobs=snap.payload.jobs;saveJobs();render();
        _refreshRestoreButton();
        showToast('✅ Travaux restaurés','#16a34a');
      }
    });
  };
}

/* Affiche/masque le bouton "Restaurer" en fonction de l'existence d'un snapshot */
function _refreshRestoreButton(){
  const btn=document.getElementById('btn-restore-trash');if(!btn)return;
  const snap=getTrashSnapshot();
  if(snap&&snap.payload&&(snap.payload.jobs||[]).length){
    const date=new Date(snap.createdAt).toLocaleString('fr-FR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
    btn.title='Restaurer '+(snap.payload.jobs||[]).length+' travail(x) effacé(s) le '+date;
    btn.style.display='inline-block';
  } else {
    btn.style.display='none';
  }
}
// Rafraîchir au chargement et après chaque clearAll/restore
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',_refreshRestoreButton);
else _refreshRestoreButton();

/* Restauration manuelle depuis Paramètres (au-delà des 30s) */
function restoreLastTrash(){
  const snap=getTrashSnapshot();
  if(!snap){alert('Aucun effacement à restaurer.');return;}
  const date=new Date(snap.createdAt).toLocaleString('fr-FR',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'});
  const count=(snap.payload.jobs||[]).length;
  if(!confirm('Restaurer '+count+' travail'+(count>1?'x':'')+' effacé'+(count>1?'s':'')+' le '+date+' ?\n\nCela ajoutera les travaux à la liste actuelle.'))return;
  // Fusionner avec l'existant (ne pas écraser les travaux récents)
  const existing=new Set(jobs.map(function(j){return String(j.id);}));
  const restored=snap.payload.jobs.filter(function(j){return !existing.has(String(j.id));});
  jobs=jobs.concat(restored);saveJobs();render();
  _refreshRestoreButton();
  showToast('✅ '+restored.length+' travail'+(restored.length>1?'x':'')+' restauré'+(restored.length>1?'s':''),'#16a34a');
}

/* ══════════════════════════════════════════
   §7 — DASHBOARD
   ══════════════════════════════════════════ */
// — Nettoyage archive (limite à 500 entrées)
function cleanup(){
  // Pas d'archivage automatique - tous les travaux restent visibles
  if(archive.length>500){archive=archive.slice(0,500);saveArchive();}
}

// Rendu du tableau de bord (KPIs, accès rapides)
function renderDashboard(){
  const el=document.getElementById('dash-content');if(!el)return;
  const laboName=localStorage.getItem('lb_name')||'votre laboratoire';
  const today=new Date();
  const dateStr=today.toLocaleDateString(t('locale'),{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  const todayISO=fmtISO(today);
  const activeJobs=jobs.filter(function(j){return j.tasks&&j.tasks.some(function(t){return !t.done&&!t.cancelled;});});
  const urgentJobs=activeJobs.filter(function(j){return j.urgent;});
  const weekEnd=new Date(today);weekEnd.setDate(today.getDate()+(6-today.getDay()||7));
  const thisWeek=activeJobs.filter(function(j){
    return j.tasks.some(function(t){const d=new Date(t.dueDate);return !t.done&&d>=today&&d<=weekEnd;});
  });
  const queueLen=JSON.parse(localStorage.getItem('lb_queue')||'[]').length;
  const prog=isProgActif();

  const jobsWithoutBL=jobs.filter(function(j){return !(bdl||[]).find(function(b){return b.jobId===j.id;});});
  const urgentOrLate=jobsWithoutBL.filter(function(j){return j.urgent||_isJobLate(j);});
  const readyToDeliver=jobsWithoutBL.filter(function(j){return typeof isJobComplete==='function'&&isJobComplete(j);});
  const dueToday=jobsWithoutBL.filter(function(j){return _jobLabDeliveryDate(j)===todayISO;});
  const pendingBLs=(bdl||[]).filter(function(b){return !b.invoiced;});
  const pendingTotal=pendingBLs.reduce(function(s,b){return s+(b.total||0);},0);

  let unreadMessages=[];
  try{
    if(typeof _chatUnread==='object'&&_chatUnread){
      Object.keys(_chatUnread).forEach(function(cabId){
        const n=_chatUnread[cabId];if(!n)return;
        const cab=cabinets.find(function(c){return c.id===cabId;});
        if(!cab)return;
        let preview='';
        if(cab.portalId&&_chatPreview&&_chatPreview[cab.portalId]){preview=_chatPreview[cab.portalId].lastMsg||'';}
        unreadMessages.push({cab:cab,count:n,preview:preview});
      });
    }
  }catch(e){}

  // Travaux/queue avec questions en attente, regroupés par cabinet
  const allItemsWithMissing=[].concat(jobs,queue||[]).filter(function(j){return hasUnresolvedMissing(j);});
  const missingByCab={};
  allItemsWithMissing.forEach(function(j){
    const k=j.cabinet||'__none__';
    if(!missingByCab[k])missingByCab[k]={cab:cabinets.find(function(c){return c.id===k;}),items:[]};
    missingByCab[k].items.push(j);
  });
  const missingGroups=Object.keys(missingByCab).map(function(k){return missingByCab[k];});

  el.innerHTML=
    '<div style="margin-bottom:28px;">'+
      '<div style="font-family:\'Inter\',sans-serif;font-weight:700;font-size:1.6rem;color:var(--ink);margin-bottom:4px;">'+t('dash.greeting')+' — <span style="color:var(--accent);">'+escH(laboName)+'</span></div>'+
      '<div style="font-size:.8rem;color:var(--ink-soft);text-transform:capitalize;">'+dateStr+'</div>'+
    '</div>'+

    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-bottom:28px;">'+
      kcard(String(activeJobs.length),t('dash.jobs_today'),'#2a6049')+
      (urgentOrLate.length?kcard(String(urgentOrLate.length),'urgents / en retard','#c8410a'):'')+
      (allItemsWithMissing.length?kcard(String(allItemsWithMissing.length),'questions à poser','#c2410c'):'')+
      (readyToDeliver.length?kcard(String(readyToDeliver.length),'prêts à livrer','#2563eb'):'')+
      (pendingBLs.length?kcard(String(pendingBLs.length),'BL à facturer','#d97706'):'')+
      (pendingBLs.length?kcard(fmtEur(pendingTotal),'en attente de règlement','#c8410a'):'')+
      (prog?kcard(String(thisWeek.length),t('dash.pending'),'#1a4a7a'):'')+
      (prog&&queueLen?kcard(String(queueLen),t('misc.pending_prog'),'#7b3f00'):'')+
    '</div>'+

    (urgentOrLate.length?section('🔥 Urgent & en retard',listJobs(urgentOrLate,true),'#c8410a'):'')+
    '<div id="dash-pending-orders" data-pending-orders></div>'+
    (missingGroups.length?section('📞 Questions à poser aux praticiens',listMissingByCab(missingGroups),'#c2410c'):'')+
    (readyToDeliver.length?section('✅ Prêts à livrer',listJobs(readyToDeliver,false),'#2a6049'):'')+
    (dueToday.length?section('📅 À livrer aujourd\'hui',listJobs(dueToday,false),'#2563eb'):'')+
    (unreadMessages.length?section('💬 Messages non lus',listMessages(unreadMessages),'#2563eb'):'')+
    (pendingBLs.length?section('⚡ À facturer',listPendingByCab(pendingBLs),'#d97706'):'')+

    '<div style="font-size:.72rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-soft);margin:24px 0 12px;">Accès rapides</div>'+
    '<div style="display:flex;flex-wrap:wrap;gap:10px;">'+
      qbtn(prog?'🔬 Programmation':'📋 Travaux','saisie')+
      qbtn('📦 Livraisons','livraisons')+
      qbtn('💰 Facturation','facturation')+
      qbtn('🏥 Cabinets','cabinets')+
      qbtn('📅 Calendrier','calendrier')+
      qbtn('📊 Stats','stats')+
    '</div>';

  function kcard(val,lbl,color){
    return '<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:18px 20px;box-shadow:var(--shadow);">'+
      '<div style="font-family:\'DM Mono\',monospace;font-size:1.7rem;font-weight:600;color:'+color+';">'+val+'</div>'+
      '<div style="font-size:.75rem;color:var(--ink-soft);margin-top:2px;">'+lbl+'</div>'+
    '</div>';
  }
  function qbtn(label,pane){
    return '<button onclick="document.querySelector(\'[data-pane='+pane+']\').click()" class="btn btn-b" style="font-size:.84rem;padding:10px 18px;">'+label+'</button>';
  }
  function section(title,inner,color){
    return '<div style="background:var(--surface);border:1px solid var(--border);border-left:4px solid '+color+';border-radius:var(--radius-lg);padding:16px 20px;box-shadow:var(--shadow);margin-bottom:16px;">'+
      '<div style="font-weight:700;font-size:.95rem;color:var(--ink);margin-bottom:12px;">'+title+'</div>'+
      inner+
    '</div>';
  }
  function listJobs(list,showBadges){
    return list.slice(0,8).map(function(j){
      const cab=j.cabinet?cabinets.find(function(c){return c.id===j.cabinet;}):null;
      const late=_isJobLate(j);
      const typeLbl=(typeof getJobTypeLabel==='function')?getJobTypeLabel(j):(j.type||'');
      const totalT=j.tasks?j.tasks.length:0;
      const doneT=j.tasks?j.tasks.filter(function(t){return !!t.done;}).length:0;
      const pct=totalT?Math.round(doneT/totalT*100):0;
      let badges='';
      if(showBadges){
        if(j.urgent)badges+='<span style="background:#c8410a;color:#fff;border-radius:4px;padding:1px 6px;font-size:.62rem;font-weight:700;margin-right:4px;">URGENT</span>';
        if(late)badges+='<span style="background:#d97706;color:#fff;border-radius:4px;padding:1px 6px;font-size:.62rem;font-weight:700;">RETARD</span>';
      }
      return '<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--border);">'+
        '<div style="flex:1;min-width:0;">'+
          '<div style="font-weight:600;font-size:.88rem;color:var(--ink);">'+escH(j.patient||'')+'</div>'+
          '<div style="font-size:.72rem;color:var(--ink-soft);margin-top:2px;">'+badges+' '+escH(typeLbl)+(cab?' · '+escH(cab.name):'')+(_fmtJobDeliveryLine(j)?' · '+_fmtJobDeliveryLine(j):'')+'</div>'+
        '</div>'+
        '<div style="width:60px;text-align:right;font-size:.8rem;font-weight:700;color:'+(pct>=100?'#2a6049':'#2563eb')+';">'+pct+'%</div>'+
        '<button onclick="document.querySelector(\'[data-pane=livraisons]\').click()" class="btn btn-a" style="font-size:.75rem;padding:6px 12px;white-space:nowrap;">📋 BL</button>'+
      '</div>';
    }).join('');
  }
  function listMessages(list){
    return list.slice(0,6).map(function(u){
      return '<div onclick="openChatModal(\''+escH(u.cab.id)+'\')" style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer;">'+
        '<div style="width:34px;height:34px;border-radius:50%;background:'+(u.cab.color||'var(--accent)')+';color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.8rem;flex-shrink:0;">'+escH((u.cab.name||'?')[0].toUpperCase())+'</div>'+
        '<div style="flex:1;min-width:0;">'+
          '<div style="font-weight:600;font-size:.88rem;">'+escH(u.cab.name)+'</div>'+
          '<div style="font-size:.74rem;color:var(--ink-soft);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+escH(u.preview||'Nouveau message')+'</div>'+
        '</div>'+
        '<div style="background:#c8410a;color:#fff;border-radius:99px;padding:2px 9px;font-size:.68rem;font-weight:700;">'+u.count+'</div>'+
      '</div>';
    }).join('');
  }
  function listMissingByCab(groups){
    return groups.map(function(g){
      const cab=g.cab;
      const cabName=cab?cab.name:'(Sans cabinet assigné)';
      const cabColor=cab?cab.color:'#999';
      const phone=cab&&cab.phone?cab.phone:'';
      const responseFlag=g.items.some(function(j){return j._missingMsgHasReply;})?
        '<span style="background:#dcfce7;color:#166534;border:1px solid #86efac;border-radius:99px;padding:2px 9px;font-size:.7rem;font-weight:700;margin-left:8px;">💬 Réponse reçue</span>':'';
      const callBtn=phone?'<a href="tel:'+escH(phone.replace(/\s/g,''))+'" class="btn btn-b" style="font-size:.75rem;padding:6px 12px;white-space:nowrap;text-decoration:none;display:inline-flex;align-items:center;gap:4px;">📞 Appeler</a>':'';
      const msgBtn=cab?'<button onclick="sendMissingInfoMessage(\''+escH(cab.id)+'\')" class="btn btn-a" style="font-size:.75rem;padding:6px 12px;white-space:nowrap;background:#c2410c;border-color:#c2410c;">💬 Message groupé</button>':'';
      const aiSummarizeBtn=cab&&g.items.some(function(j){return j._missingMsgHasReply;})?'<button onclick="aiSummarizeReply(\''+escH(cab.id)+'\')" style="background:#7c3aed;color:#fff;border:none;border-radius:7px;padding:6px 12px;font-size:.75rem;font-weight:600;cursor:pointer;">🤖 Analyser réponse</button>':'';
      const allBtn=cab?'<button onclick="resolveAllMissingForCab(\''+escH(cab.id)+'\')" class="btn btn-b" style="font-size:.75rem;padding:6px 12px;white-space:nowrap;">✅ Tout résolu</button>':'';
      const itemsHtml=g.items.map(function(j){
        const typeLbl=(typeof getJobTypeLabel==='function')?getJobTypeLabel(j):(j.type||'');
        const items=getMissingItems(j).filter(function(it){return !it.resolved;});
        const subItems=items.map(function(it){
          return '<div style="display:flex;align-items:flex-start;gap:6px;padding:4px 0 4px 16px;border-left:2px solid #fed7aa;margin-left:4px;">'+
            '<div style="flex:1;min-width:0;font-size:.78rem;color:#c2410c;">'+_miCatIcon(it.category)+' <strong>'+escH(_miCatLabel(it.category).replace(/^[^ ]+\s/,''))+'</strong>'+(it.text?' : '+escH(it.text):'')+'</div>'+
            '<button onclick="resolveMissingItem(\''+escH(j.id)+'\',\''+escH(it.id)+'\')" title="Résoudre cette question" style="flex-shrink:0;background:none;border:1px solid var(--border);border-radius:5px;padding:1px 6px;cursor:pointer;font-size:.66rem;color:#2a6049;">✓</button>'+
            '<button onclick="editMissingItem(\''+escH(j.id)+'\',\''+escH(it.id)+'\')" title="Modifier" style="flex-shrink:0;background:none;border:1px solid var(--border);border-radius:5px;padding:1px 6px;cursor:pointer;font-size:.66rem;color:var(--ink-soft);">✏️</button>'+
          '</div>';
        }).join('');
        return '<div style="padding:8px 0;border-top:1px solid var(--border-soft);">'+
          '<div style="font-size:.82rem;color:var(--ink);margin-bottom:2px;"><strong>'+escH(j.patient||'')+'</strong> · <span style="color:var(--ink-soft);">'+escH(typeLbl)+'</span></div>'+
          subItems+
        '</div>';
      }).join('');
      return '<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:14px 16px;margin-bottom:12px;">'+
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap;">'+
          '<div style="width:12px;height:12px;border-radius:50%;background:'+cabColor+';flex-shrink:0;"></div>'+
          '<div style="flex:1;min-width:0;">'+
            '<div style="font-weight:700;font-size:.92rem;color:var(--ink);">🦷 '+escH(cabName)+responseFlag+'</div>'+
            (phone?'<div style="font-size:.74rem;color:var(--ink-soft);">📞 '+escH(phone)+'</div>':'')+
          '</div>'+
          '<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;">'+callBtn+msgBtn+aiSummarizeBtn+allBtn+'</div>'+
        '</div>'+
        itemsHtml+
      '</div>';
    }).join('');
  }
  function listPendingByCab(pendings){
    const byCab={};
    pendings.forEach(function(b){
      const k=b.cabinet||'__none__';
      if(!byCab[k])byCab[k]={cab:cabinets.find(function(c){return c.id===b.cabinet;}),count:0,total:0};
      byCab[k].count++;byCab[k].total+=(b.total||0);
    });
    const groups=Object.keys(byCab).map(function(k){return byCab[k];}).sort(function(a,b){return b.total-a.total;});
    return groups.slice(0,8).map(function(g){
      const cab=g.cab;const cabId=cab?cab.id:'';
      return '<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--border);">'+
        '<div style="width:12px;height:12px;border-radius:50%;background:'+(cab?cab.color:'#999')+';flex-shrink:0;"></div>'+
        '<div style="flex:1;min-width:0;">'+
          '<div style="font-weight:600;font-size:.88rem;color:var(--ink);">'+escH(cab?cab.name:'Sans cabinet')+'</div>'+
          '<div style="font-size:.72rem;color:var(--ink-soft);">'+g.count+' BL à facturer</div>'+
        '</div>'+
        '<div style="font-weight:700;font-size:.9rem;color:#d97706;">'+fmtEur(g.total)+'</div>'+
        (cabId?'<button onclick="document.querySelector(\'[data-pane=facturation]\').click()" class="btn btn-a" style="font-size:.75rem;padding:6px 12px;white-space:nowrap;">🧾 Facturer</button>':'')+
      '</div>';
    }).join('');
  }
  function escH(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  // Charger asynchroniquement les commandes en attente après le rendu
  setTimeout(loadAndRenderPendingOrders,50);
}

/* ══════════════════════════════════════════
   FICHES DE COMMANDE — Réception côté laboratoire
   ══════════════════════════════════════════ */
const VITA_SHADES_LIST=['A1','A2','A3','A3.5','A4','B1','B2','B3','B4','C1','C2','C3','C4','D2','D3','D4'];

// Cache mémoire des commandes pour éviter de re-fetch en boucle
let _pendingOrdersCache={};

// Migration : convertit ancien format (single-fiche) en nouveau format (cas + étapes)
function _migrateOrderToCase(o){
  if(!o)return o;
  if(Array.isArray(o.steps))return o;
  o.finalGoal=o.prosthesis||o.finalGoal||'(non précisé)';
  o.steps=[{
    id:'step_legacy_'+o.id,
    description:o.prosthesis||'',
    deliveryDate:o.deliveryDate||'',
    notes:o.notes||'',
    status:o.status||'pending',
    jobId:o.jobId||null,
    blId:null,
    requestedAt:o.createdAt||new Date().toISOString(),
    acceptedAt:o.acceptedAt||null,
    deliveredAt:null,
    rejectedAt:o.rejectedAt||null,
    rejectionReason:o.rejectionReason||null,
    questionsAsked:o.questionsAsked||false,
    questionsAskedAt:o.questionsAskedAt||null
  }];
  return o;
}

/* Helper : fetch avec timeout (AbortController). Évite que l'app se fige
   pendant 2 min si Supabase est lent ou injoignable. */
async function _fetchWithTimeout(url,opts,timeoutMs){
  opts=opts||{};timeoutMs=timeoutMs||15000;
  const ctrl=new AbortController();
  const timer=setTimeout(function(){ctrl.abort();},timeoutMs);
  try{
    const r=await fetch(url,Object.assign({},opts,{signal:ctrl.signal}));
    return r;
  } finally {
    clearTimeout(timer);
  }
}

async function _fetchOrdersForCab(portalId){
  if(!portalId)return [];
  try{
    const r=await _fetchWithTimeout(SB_URL+'/rest/v1/labo_data?id=eq.orders_'+portalId+'&select=data',{
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY}
    },15000);
    const rows=await r.json();
    let list=(rows[0]&&rows[0].data&&rows[0].data.list)?rows[0].data.list:[];
    list.forEach(_migrateOrderToCase);
    return list;
  }catch(e){
    console.warn('_fetchOrdersForCab',e);
    if(e.name==='AbortError')showToast('⚠️ Connexion lente — réessayez dans quelques secondes','#c2410c');
    return [];
  }
}

async function _writeOrdersForCab(portalId,list){
  if(!portalId)return;
  try{
    await _fetchWithTimeout(SB_URL+'/rest/v1/labo_data',{
      method:'POST',
      headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Prefer':'resolution=merge-duplicates,return=minimal'},
      body:JSON.stringify({id:'orders_'+portalId,data:{list:list,portalId:portalId},updated_at:new Date().toISOString()})
    },20000);
  }catch(e){
    console.warn('_writeOrdersForCab',e);
    if(e.name==='AbortError')throw new Error('Connexion trop lente pour sauvegarder. Vérifiez votre réseau et réessayez.');
    throw e;
  }
}

function _renderPendingStepsHTML(allPendingSteps){
  if(!allPendingSteps.length)return '';
  const itemsHtml=allPendingSteps.map(function(p){
    const cab=p._cab;
    const c=p._case;
    const s=p._step;
    const stepIdx=p._stepIdx;
    const isFirstStep=stepIdx===0;
    const totalSteps=(c.steps||[]).length;
    const teethStr=(c.teeth||[]).join(', ')||'—';
    const hasQuestions=!!s.questionsAsked;
    return '<div style="background:#fff;border:1px solid #e2e8f0;border-left:4px solid #3b82f6;border-radius:10px;padding:14px 16px;margin-bottom:10px;">'+
      // Bandeau "cas" en haut
      '<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:6px 10px;margin-bottom:8px;font-size:.74rem;color:#1e40af;">'+
        '📋 Étape '+(stepIdx+1)+(totalSteps>1?' / '+totalSteps:'')+' du cas : <strong>'+escH2(c.finalGoal||'(sans objectif)')+'</strong>'+
        (!isFirstStep?' · '+stepIdx+' étape'+(stepIdx>1?'s':'')+' déjà livrée'+(stepIdx>1?'s':''):'')+
      '</div>'+
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap;">'+
        '<div style="flex:1;min-width:0;">'+
          (hasQuestions?'<div style="font-size:.7rem;font-weight:700;color:#c2410c;margin-bottom:2px;">❓ Questions envoyées au praticien — en attente de réponse</div>':'')+
          '<div style="font-size:.78rem;font-weight:700;color:'+cab.color+';">🦷 '+escH2(cab.name)+'</div>'+
          '<div style="font-size:.92rem;font-weight:700;margin-top:2px;">👤 '+escH2(c.patient.name)+(c.patient.sexe==='F'?' ♀':c.patient.sexe==='M'?' ♂':'')+(c.patient.age?' · '+escH2(c.patient.age)+' ans':'')+'</div>'+
          '<div style="font-size:.84rem;color:#1e293b;margin-top:6px;background:#fff7ed;border:1px solid #fed7aa;padding:6px 10px;border-radius:6px;">📨 <strong>Demande :</strong> '+escH2(s.description||'(non précisé)')+'</div>'+
          '<div style="font-size:.74rem;color:#64748b;margin-top:6px;">🦷 Dents : '+escH2(teethStr)+' · 🎨 Teinte : '+escH2(c.shadeValue||'—')+(s.deliveryDate?' · 📅 Livraison : '+new Date(s.deliveryDate+'T12:00:00').toLocaleDateString('fr-FR'):'')+'</div>'+
        '</div>'+
        '<div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0;">'+
          '<button onclick="viewOrder(\''+escH2(cab.portalId)+'\',\''+escH2(c.id)+'\',\''+escH2(s.id)+'\')" class="btn btn-b" style="font-size:.74rem;padding:6px 12px;white-space:nowrap;">👁️ Voir détails</button>'+
          '<button onclick="acceptOrder(\''+escH2(cab.portalId)+'\',\''+escH2(c.id)+'\',\''+escH2(s.id)+'\')" class="btn btn-a" style="font-size:.74rem;padding:6px 12px;white-space:nowrap;">✅ Accepter</button>'+
          '<button onclick="rejectOrder(\''+escH2(cab.portalId)+'\',\''+escH2(c.id)+'\',\''+escH2(s.id)+'\')" style="background:none;border:1px solid #e0c8c8;color:#c0392b;border-radius:7px;padding:5px 10px;font-size:.72rem;cursor:pointer;white-space:nowrap;">❌ Refuser</button>'+
        '</div>'+
      '</div>'+
    '</div>';
  }).join('');
  return '<div style="background:var(--surface);border:1px solid var(--border);border-left:4px solid #3b82f6;border-radius:var(--radius-lg);padding:16px 20px;box-shadow:var(--shadow);margin-bottom:16px;">'+
    '<div style="font-weight:700;font-size:.95rem;color:var(--ink);margin-bottom:12px;">📥 Nouvelles commandes à valider <span style="background:#3b82f6;color:#fff;border-radius:99px;padding:2px 9px;font-size:.7rem;font-weight:700;margin-left:8px;">'+allPendingSteps.length+'</span></div>'+
    itemsHtml+
  '</div>';
}

async function loadAndRenderPendingOrders(){
  const cabsWithPortal=cabinets.filter(function(c){return c.portalId;});
  const allPendingSteps=[];
  for(const cab of cabsWithPortal){
    const cases=await _fetchOrdersForCab(cab.portalId);
    _pendingOrdersCache[cab.portalId]=cases;
    cases.forEach(function(c){
      (c.steps||[]).forEach(function(s,idx){
        if(s.status==='pending'){
          allPendingSteps.push({_cab:cab,_case:c,_step:s,_stepIdx:idx});
        }
      });
    });
  }
  allPendingSteps.sort(function(a,b){return (b._step.requestedAt||'').localeCompare(a._step.requestedAt||'');});
  const html=_renderPendingStepsHTML(allPendingSteps);
  const dashEl=document.getElementById('dash-pending-orders');
  if(dashEl)dashEl.innerHTML=html;
  const saisieEl=document.getElementById('saisie-pending-orders');
  if(saisieEl)saisieEl.innerHTML=html;
}

function escH2(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

/* ── DÉTECTION HEURISTIQUE D'UN NOM PATIENT (RGPD safeguard) ─────────────────
   Vérifie si une chaîne ressemble à un nom usuel plutôt qu'à un code anonyme.
   Critères : contient au moins un mot avec une majuscule initiale + minuscules,
   et n'a pas la structure classique d'un code (pas de tirets, pas de chiffres). */
function _looksLikePatientName(s){
  const v=String(s||'').trim();
  if(!v||v.length<3)return false;
  // Si contient déjà des chiffres ou tirets, on considère que c'est un code
  if(/[0-9_-]/.test(v))return false;
  // Mot avec majuscule initiale + minuscules consécutives = ressemble à un prénom/nom
  // Exemples détectés : "Dupont Martin", "Dupont", "dupont martin"
  const words=v.split(/\s+/).filter(Boolean);
  if(words.length>=2)return true; // 2 mots ou plus sans tirets ni chiffres = très probable nom complet
  // Un seul mot mais avec format "Xxxxx" (majuscule + minuscules) sur 4+ caractères
  if(words.length===1&&words[0].length>=4&&/^[A-ZÀ-Ö][a-zà-ö]{3,}$/.test(words[0]))return true;
  return false;
}
function _attachPatientCodeWarning(input){
  if(!input||input._rgpdAttached)return;
  input._rgpdAttached=true;
  let warnEl=null;
  function check(){
    const v=input.value;
    if(_looksLikePatientName(v)){
      if(!warnEl){
        warnEl=document.createElement('div');
        warnEl.style.cssText='margin-top:6px;padding:8px 11px;background:#fef3c7;border-left:3px solid #f59e0b;border-radius:0 6px 6px 0;font-size:.82rem;color:#92400e;line-height:1.45;';
        warnEl.innerHTML='⚠️ <strong>Attention RGPD :</strong> ceci ressemble à un nom de patient. Aucune donnée nominative ne doit être saisie. <button type="button" style="background:#f59e0b;color:#fff;border:none;border-radius:5px;padding:3px 9px;font-size:.78rem;font-weight:600;cursor:pointer;margin-left:4px;">🪄 Générer un code anonyme</button>';
        const btn=warnEl.querySelector('button');
        btn.onclick=function(){
          if(input.id&&typeof openPatientCodeGenerator==='function'){
            // Pré-remplir le générateur avec le nom déjà tapé
            openPatientCodeGenerator(input.id);
            setTimeout(function(){
              const namedField=document.getElementById('codegen-name');
              if(namedField){namedField.value=v;namedField.dispatchEvent(new Event('input'));}
            },80);
          }
        };
        input.parentNode.insertBefore(warnEl,input.nextSibling);
      }
    } else if(warnEl){
      warnEl.remove();warnEl=null;
    }
  }
  input.addEventListener('input',check);
  input.addEventListener('blur',check);
}
// Activer le garde-fou sur tous les champs "Code patient" connus dès qu'ils existent
function _activatePatientCodeWarnings(){
  ['saisie-ip','af-patient'].forEach(function(id){
    const el=document.getElementById(id);
    if(el)_attachPatientCodeWarning(el);
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',_activatePatientCodeWarnings);
else _activatePatientCodeWarnings();
// Réactiver après chaque création dynamique du form (viewOrder par exemple)
const _origRenderViewOrder=typeof _renderViewOrder==='function'?_renderViewOrder:null;
// (fallback : on réactivera via MutationObserver pour les inputs créés dynamiquement)
const _patientInputObserver=new MutationObserver(function(){_activatePatientCodeWarnings();});
if(document.body)_patientInputObserver.observe(document.body,{childList:true,subtree:true});
else document.addEventListener('DOMContentLoaded',function(){_patientInputObserver.observe(document.body,{childList:true,subtree:true});});
(function(){
  function bindJobsOpsFilters(){
    ['jobs-search','jobs-filter-mode','jobs-filter-cab'].forEach(function(id){
      var el=document.getElementById(id);
      if(!el||el.dataset.opsBound)return;
      el.dataset.opsBound='1';
      el.addEventListener('input',function(){if(id==='jobs-search')_resetOpsLimits();renderTable();});
      el.addEventListener('change',function(){_resetOpsLimits();renderTable();});
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindJobsOpsFilters);
  else bindJobsOpsFilters();
})();

/* ── GÉNÉRATEUR DE CODE PATIENT (RGPD) ──────────────────────────────────────
   Permet au labo de transformer un nom de patient (saisi depuis une fiche
   papier) en un code anonyme. Le nom n'est JAMAIS sauvegardé ni transmis :
   il sert uniquement à dériver le code, puis il est jeté. */
function _generatePatientCode(fullName){
  const norm=String(fullName||'').trim()
    .normalize('NFD').replace(/[̀-ͯ]/g,'') // supprimer accents
    .toUpperCase()
    .replace(/[^A-Z ]/g,' ')
    .replace(/\s+/g,' ')
    .trim();
  const parts=norm.split(' ').filter(function(p){return p.length>0;});
  let prefix='PAT';
  if(parts.length>=2){
    const a=parts[0].slice(0,3);
    const b=parts[parts.length-1].slice(0,3);
    prefix=a+'-'+b;
  } else if(parts.length===1){
    prefix=parts[0].slice(0,6);
  }
  // Éviter les collisions avec les codes existants (jobs + archives)
  const existing=new Set();
  try{
    (jobs||[]).forEach(function(j){if(j.patient)existing.add(String(j.patient).toUpperCase());});
    (archive||[]).forEach(function(j){if(j.patient)existing.add(String(j.patient).toUpperCase());});
  }catch(e){}
  let n=1,code;
  do{
    code=prefix+'-'+String(n).padStart(3,'0');
    n++;
  }while(existing.has(code)&&n<1000);
  return code;
}

function openPatientCodeGenerator(targetInputId){
  if(document.getElementById('codegen-overlay'))return;
  const overlay=document.createElement('div');
  overlay.id='codegen-overlay';
  overlay.style.cssText='position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:10000;display:flex;align-items:center;justify-content:center;padding:24px;';
  overlay.innerHTML=
    '<div style="background:#fff;border-radius:14px;padding:28px 32px;max-width:460px;width:100%;box-shadow:0 24px 70px rgba(0,0,0,.3);">'+
      '<h2 style="margin:0 0 8px 0;font-size:1.25rem;font-weight:700;color:#0f172a;">🪄 Générer un code patient</h2>'+
      '<p style="margin:0 0 16px 0;font-size:.92rem;color:#475569;line-height:1.5;">Tapez le nom du patient (depuis la fiche papier). Il sert uniquement à générer un code anonyme — <strong>aucun nom n\'est enregistré ni transmis</strong>.</p>'+
      '<input type="text" id="codegen-name" placeholder="ex: Dupont Martin" autocomplete="off" style="width:100%;padding:12px 14px;border:1.5px solid #cbd5e1;border-radius:8px;font-size:1rem;outline:none;margin-bottom:14px;"/>'+
      '<div id="codegen-preview" style="background:#f1f5f9;padding:14px;border-radius:8px;text-align:center;margin-bottom:18px;">'+
        '<div style="font-size:.72rem;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;">Code généré</div>'+
        '<div id="codegen-code" style="font-family:monospace;font-size:1.3rem;font-weight:700;color:#94a3b8;">—</div>'+
      '</div>'+
      '<div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;">'+
        '<button id="codegen-cancel" style="background:transparent;border:1.5px solid #cbd5e1;color:#475569;border-radius:8px;padding:10px 18px;cursor:pointer;font-weight:600;font-size:.94rem;">Annuler</button>'+
        '<button id="codegen-use" disabled style="background:#16a34a;color:#fff;border:none;border-radius:8px;padding:10px 22px;cursor:pointer;font-weight:700;font-size:.96rem;opacity:.5;">Utiliser ce code</button>'+
      '</div>'+
    '</div>';
  document.body.appendChild(overlay);
  const nameInp=document.getElementById('codegen-name');
  const codeEl=document.getElementById('codegen-code');
  const useBtn=document.getElementById('codegen-use');
  function update(){
    const name=nameInp.value.trim();
    if(!name){codeEl.textContent='—';codeEl.style.color='#94a3b8';useBtn.disabled=true;useBtn.style.opacity='.5';return;}
    const code=_generatePatientCode(name);
    codeEl.textContent=code;codeEl.style.color='#1d4ed8';
    useBtn.disabled=false;useBtn.style.opacity='1';
    useBtn.dataset.code=code;
  }
  nameInp.addEventListener('input',update);
  nameInp.addEventListener('keydown',function(e){if(e.key==='Enter'&&!useBtn.disabled)useBtn.click();});
  document.getElementById('codegen-cancel').onclick=function(){overlay.remove();};
  useBtn.onclick=function(){
    const code=useBtn.dataset.code;if(!code)return;
    const target=document.getElementById(targetInputId);
    if(target){
      target.value=code;
      target.dispatchEvent(new Event('input',{bubbles:true}));
      // Effacer le nom temporaire de la mémoire pour ne pas le laisser traîner
      nameInp.value='';
      overlay.remove();
      target.focus();
    } else {
      overlay.remove();
    }
  };
  setTimeout(function(){nameInp.focus();},60);
}

function _findOrder(portalId,caseId){
  const list=_pendingOrdersCache[portalId]||[];
  return list.find(function(o){return o.id===caseId;});
}
function _findStep(c,stepId){
  if(!c||!c.steps)return null;
  return c.steps.find(function(s){return s.id===stepId;});
}

function _renderToothChartReadonly(teeth,links){
  // Ordre miroir de la bouche : côté droit du patient à gauche visuellement
  const upper=[18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
  const lower=[48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];
  function row(arr){
    // Séparation visuelle entre les 2 côtés (au milieu, après la 8e dent)
    let html='<div style="display:flex;align-items:center;justify-content:center;gap:0;">';
    arr.forEach(function(num,i){
      const sel=teeth.indexOf(num)>=0;
      const isMiddleGap=i===8; // espace plus marqué entre côté droit et côté gauche
      if(isMiddleGap)html+='<div style="width:14px;"></div>';
      html+='<div style="width:30px;height:34px;border:1.5px solid '+(sel?'#2563eb':'#e2e8f0')+';background:'+(sel?'#2563eb':'#fff')+';color:'+(sel?'#fff':'#64748b')+';font-family:monospace;font-size:.7rem;font-weight:'+(sel?700:500)+';display:flex;align-items:center;justify-content:center;border-radius:5px;margin:0 1px;">'+num+'</div>';
      if(i<arr.length-1&&i!==7){
        const a=num,b=arr[i+1];
        const key=Math.min(a,b)+'-'+Math.max(a,b);
        const lk=(links||[]).indexOf(key)>=0;
        html+='<div style="width:8px;height:8px;border:1.5px solid '+(lk?'#10b981':'#cbd5e1')+';background:'+(lk?'#10b981':'#fff')+';border-radius:50%;flex-shrink:0;"></div>';
      }
    });
    html+='</div>';
    return html;
  }
  return '<div style="font-size:.62rem;color:#64748b;text-align:center;margin-bottom:4px;">Maxillaire supérieur</div>'+
    row(upper)+
    '<div style="margin:8px 0;"></div>'+
    row(lower)+
    '<div style="font-size:.62rem;color:#64748b;text-align:center;margin-top:4px;">Mandibule inférieure</div>';
}

// État éphémère du formulaire d'acceptation (côté droit de la modale)
let _acceptForm={portalId:null,caseId:null,stepId:null,patient:'',requestedDeliveryDate:'',labDeliveryDate:'',labDeliverySlot:'12',deliveryDate:'',urgent:false,items:[],note:''};

/* ── FICHE STYLE PAPIER ──────────────────────────────────────
   Présentation épurée d'une étape comme sur une vraie feuille :
   gros texte, aucun badge coloré, juste l'essentiel pour comprendre. */
function _renderFichePaperHTML(c,s,idx,isCurrent){
  const dateLong=s.requestedAt?new Date(s.requestedAt).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}):'—';
  const title=idx===0?'Demande initiale':'Étape '+(idx+1);
  const bl=s.blId?bdl.find(function(b){return b.id===s.blId;}):null;
  // Statut simple en texte (pas de badge coloré sauf rouge pour pending)
  let statusTxt='';
  if(s.status==='pending')statusTxt='<span style="color:#dc2626;font-weight:700;">📨 À traiter</span>';
  else if(s.status==='delivered')statusTxt='<span style="color:#475569;">✓ Livré</span>';
  else if(s.status==='rejected')statusTxt='<span style="color:#475569;">✗ Refusé</span>';
  else if(s.status==='accepted'||s.status==='in_progress')statusTxt='<span style="color:#475569;">⏳ En production</span>';
  const blockStyle=isCurrent
    ? 'border-left:4px solid #dc2626;padding:18px 4px 18px 18px;margin:18px 0;background:#fff;'
    : 'padding:20px 4px;'+(idx>0?'border-top:1px solid #e2e8f0;':'');
  return '<div style="'+blockStyle+'">'+
    // Titre + date (gros texte)
    '<div style="display:flex;align-items:baseline;gap:14px;margin-bottom:14px;flex-wrap:wrap;">'+
      '<h3 style="margin:0;font-size:1.15rem;font-weight:700;color:#1e293b;">'+title+'</h3>'+
      '<span style="font-size:.92rem;color:#64748b;">'+dateLong+'</span>'+
      (statusTxt?'<span style="margin-left:auto;font-size:.92rem;">'+statusTxt+'</span>':'')+
    '</div>'+
    // Description (gros corps de texte, pas de boîte)
    (s.description?'<p style="margin:0 0 14px 0;font-size:1.05rem;line-height:1.65;color:#1e293b;white-space:pre-wrap;">'+escH2(s.description)+'</p>':'')+
    // Teinte + livraison en ligne, simple
    ((s.shadeValue||s.deliveryDate)?'<p style="margin:0 0 14px 0;font-size:.96rem;color:#475569;line-height:1.6;">'+
      (s.shadeValue?'Teinte&nbsp;: <strong>'+escH2(s.shadeValue)+'</strong>':'')+
      (s.shadeValue&&s.deliveryDate?'&nbsp;&nbsp;·&nbsp;&nbsp;':'')+
      (s.deliveryDate?'Livraison souhaitée&nbsp;: <strong>'+new Date(s.deliveryDate+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})+'</strong>':'')+
    '</p>':'')+
    // Notes : juste un fond jaune pâle, pas d'icône
    (s.notes?'<div style="font-size:1rem;line-height:1.6;color:#1e293b;background:#fef9c3;border-left:3px solid #facc15;padding:14px 16px;margin-bottom:14px;white-space:pre-wrap;border-radius:0 4px 4px 0;"><div style="font-size:.78rem;color:#854d0e;font-weight:700;text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px;">Notes du dentiste</div>'+escH2(s.notes)+'</div>':'')+
    // Lien BL si livré
    (s.deliveredAt&&bl?'<p style="margin:8px 0 0 0;font-size:.92rem;color:#475569;">Travail livré · <a onclick="printBL(\''+escH2(bl.id)+'\')" style="color:#1d4ed8;text-decoration:underline;cursor:pointer;font-weight:600;">Voir le bon de livraison '+escH2(bl.num)+'</a></p>':'')+
    (s.rejectedAt&&s.rejectionReason?'<p style="margin:8px 0 0 0;font-size:.92rem;color:#475569;font-style:italic;">Motif du refus&nbsp;: '+escH2(s.rejectionReason)+'</p>':'')+
  '</div>';
}

/* ── WIZARD VIEWORDER : 2 ÉTAPES (Lecture puis Action) ──────── */
let _viewOrderState=null;

function viewOrder(portalId,caseId,stepId){
  const c=_findOrder(portalId,caseId);if(!c)return;
  const step=stepId?_findStep(c,stepId):(c.steps||[]).find(function(s){return s.status==='pending';});
  if(!step){alert('Étape introuvable');return;}

  _acceptForm={
    portalId:portalId,caseId:caseId,stepId:step.id,
    patient:c.patient.name||'',
    requestedDeliveryDate:step.deliveryDate||'',
    labDeliveryDate:_suggestLabDateFromRequested(step.deliveryDate||'')||step.deliveryDate||'',
    labDeliverySlot:'12',
    deliveryDate:_suggestLabDateFromRequested(step.deliveryDate||'')||step.deliveryDate||'',
    urgent:false,
    items:[],
    note:_buildAutoNoteFromCaseStep(c,step)
  };
  _viewOrderState={portalId:portalId,caseId:caseId,stepId:step.id,viewStep:1};

  let overlay=document.getElementById('order-overlay');
  if(!overlay){
    overlay=document.createElement('div');
    overlay.id='order-overlay';
    overlay.style.cssText='position:fixed;inset:0;background:rgba(15,23,42,.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto;';
    document.body.appendChild(overlay);
  }
  _renderViewOrder();
}

function _gotoViewOrderStep(n){
  if(!_viewOrderState)return;
  _viewOrderState.viewStep=n;
  _renderViewOrder();
}

function _renderViewOrder(){
  if(!_viewOrderState)return;
  const overlay=document.getElementById('order-overlay');
  if(!overlay)return;
  const c=_findOrder(_viewOrderState.portalId,_viewOrderState.caseId);if(!c)return;
  const cab=cabinets.find(function(x){return x.portalId===_viewOrderState.portalId;});
  const step=_findStep(c,_viewOrderState.stepId);if(!step)return;

  if(_viewOrderState.viewStep===1)_renderViewOrderStep1(overlay,c,cab,step);
  else _renderViewOrderStep2(overlay,c,cab,step);
}

function _renderViewOrderStep1(overlay,c,cab,step){
  const teethStr=(c.teeth||[]).join(', ')||'—';
  const stepsSorted=(c.steps||[]).slice().sort(function(a,b){return (a.requestedAt||'').localeCompare(b.requestedAt||'');});
  const ficheHtml=stepsSorted.map(function(s,i){return _renderFichePaperHTML(c,s,i,s.id===step.id);}).join('');
  const portalId=_viewOrderState.portalId,caseId=_viewOrderState.caseId,stepId=step.id;

  overlay.innerHTML=
    '<div style="background:#fff;border-radius:12px;width:100%;max-width:780px;max-height:92vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(15,23,42,.25);">'+
      // Header sobre — indique l'étape du wizard
      '<div style="padding:14px 28px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;background:#f8fafc;">'+
        '<div style="font-size:.78rem;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.06em;">Étape 1 sur 2 · Lecture de la fiche</div>'+
        '<button onclick="document.getElementById(\'order-overlay\').remove()" style="background:none;border:none;font-size:1.7rem;cursor:pointer;color:#64748b;line-height:1;">×</button>'+
      '</div>'+
      // Corps : feuille blanche style A4
      '<div style="flex:1;overflow-y:auto;padding:36px 52px;background:#fff;">'+
        // En-tête style lettre
        '<div style="margin-bottom:28px;padding-bottom:20px;border-bottom:2px solid #1e293b;">'+
          '<div style="font-size:.78rem;color:#64748b;text-transform:uppercase;letter-spacing:.08em;font-weight:600;margin-bottom:6px;">Fiche de cas</div>'+
          '<h2 style="margin:0 0 14px 0;font-size:1.5rem;font-weight:700;color:#1e293b;line-height:1.3;">'+escH2(c.finalGoal||'(sans objectif)')+'</h2>'+
          '<div style="font-size:1rem;color:#475569;line-height:1.8;">'+
            '<div><strong>Code patient&nbsp;:</strong> '+escH2(c.patient.name)+(c.patient.sexe?' ('+(c.patient.sexe==='F'?'femme':'homme')+')':'')+(c.patient.age?', '+escH2(c.patient.age)+' ans':'')+'</div>'+
            '<div><strong>Cabinet&nbsp;:</strong> '+escH2(cab?cab.name:c.cabName||'—')+'</div>'+
            '<div><strong>Dents impactées&nbsp;:</strong> <span style="font-family:monospace;">'+escH2(teethStr)+'</span></div>'+
          '</div>'+
        '</div>'+
        // Schéma dentaire (optionnel, replié)
        '<details style="margin-bottom:24px;">'+
          '<summary style="cursor:pointer;font-size:.92rem;color:#475569;font-weight:600;padding:8px 0;list-style:none;">▸ Voir le schéma dentaire</summary>'+
          '<div style="padding:14px 0;">'+_renderToothChartReadonly(c.teeth||[],c.links||[])+'</div>'+
        '</details>'+
        // Demandes (toutes les étapes en chronologique, style papier)
        ficheHtml+
      '</div>'+
      // Pied : actions claires
      '<div style="padding:18px 28px;border-top:1px solid #e2e8f0;display:flex;gap:12px;justify-content:space-between;flex-wrap:wrap;flex-shrink:0;background:#f8fafc;">'+
        '<div style="display:flex;gap:10px;flex-wrap:wrap;">'+
          '<button onclick="openOrderQuestions(\''+escH2(portalId)+'\',\''+escH2(caseId)+'\',\''+escH2(stepId)+'\')" style="background:#fff;border:1.5px solid #cbd5e1;color:#475569;border-radius:8px;padding:11px 18px;font-size:.94rem;font-weight:600;cursor:pointer;">❓ Demander des précisions</button>'+
          '<button onclick="rejectOrder(\''+escH2(portalId)+'\',\''+escH2(caseId)+'\',\''+escH2(stepId)+'\');document.getElementById(\'order-overlay\').remove()" style="background:#fff;border:1.5px solid #fecaca;color:#dc2626;border-radius:8px;padding:11px 18px;font-size:.94rem;font-weight:600;cursor:pointer;">❌ Refuser</button>'+
        '</div>'+
        '<button onclick="_gotoViewOrderStep(2)" style="background:#16a34a;color:#fff;border:none;border-radius:8px;padding:12px 28px;font-size:1.02rem;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(22,163,74,.3);">✅ Je commence ce travail →</button>'+
      '</div>'+
    '</div>';
}

function _renderViewOrderStep2(overlay,c,cab,step){
  overlay.innerHTML=
    '<div style="background:#fff;border-radius:12px;width:100%;max-width:780px;max-height:92vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(15,23,42,.25);">'+
      // Header
      '<div style="padding:14px 28px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;background:#f8fafc;">'+
        '<div style="font-size:.78rem;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.06em;">Étape 2 sur 2 · Création du travail</div>'+
        '<button onclick="document.getElementById(\'order-overlay\').remove()" style="background:none;border:none;font-size:1.7rem;cursor:pointer;color:#64748b;line-height:1;">×</button>'+
      '</div>'+
      // Corps
      '<div style="flex:1;overflow-y:auto;padding:28px 52px;background:#fff;">'+
        // Rappel de ce qu'on traite
        '<div style="background:#fef9c3;border-left:3px solid #facc15;padding:14px 18px;margin-bottom:28px;border-radius:0 6px 6px 0;">'+
          '<div style="font-size:.78rem;color:#854d0e;font-weight:700;text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px;">Vous traitez</div>'+
          '<div style="font-size:1.05rem;font-weight:600;color:#1e293b;line-height:1.4;">'+escH2(step.description||'(non précisé)')+'</div>'+
          '<div style="font-size:.92rem;color:#475569;margin-top:6px;">Code patient&nbsp;: <strong>'+escH2(c.patient.name)+'</strong> · Cas&nbsp;: '+escH2(c.finalGoal||'—')+'</div>'+
        '</div>'+
        // Champs
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px;">'+
          '<div><label style="font-size:.92rem;font-weight:600;color:#1e293b;display:block;margin-bottom:6px;">Code patient <button type="button" onclick="openPatientCodeGenerator(\'af-patient\')" title="Générer un code à partir d\'un nom (le nom n\'est ni sauvegardé ni envoyé)" style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:5px;padding:1px 7px;font-size:.72rem;cursor:pointer;color:#475569;font-weight:500;margin-left:4px;">🪄 Générer</button> <span style="font-weight:400;color:#94a3b8;font-size:.74rem;">— anonyme (RGPD)</span></label>'+
            '<input type="text" id="af-patient" value="'+escH2(_acceptForm.patient)+'" oninput="_acceptForm.patient=this.value" style="width:100%;border:1.5px solid #cbd5e1;border-radius:8px;padding:11px 13px;font-size:1rem;outline:none;"/></div>'+
          '<div><label style="font-size:.92rem;font-weight:600;color:#1e293b;display:block;margin-bottom:6px;">Date demandée (cabinet)</label>'+
            '<input type="date" id="af-req-delivery" value="'+escH2(_acceptForm.requestedDeliveryDate)+'" readonly style="width:100%;border:1.5px solid #e2e8f0;border-radius:8px;padding:11px 13px;font-size:1rem;background:#f8fafc;color:#64748b;"/></div>'+
        '</div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px;">'+
          '<div><label style="font-size:.92rem;font-weight:600;color:#1e293b;display:block;margin-bottom:6px;">Date labo (enlèvement coursier)</label>'+
            '<input type="date" id="af-lab-delivery" value="'+escH2(_acceptForm.labDeliveryDate)+'" oninput="_acceptForm.labDeliveryDate=this.value;_acceptForm.deliveryDate=this.value" style="width:100%;border:1.5px solid #cbd5e1;border-radius:8px;padding:11px 13px;font-size:1rem;outline:none;"/></div>'+
          '<div><label style="font-size:.92rem;font-weight:600;color:#1e293b;display:block;margin-bottom:6px;">Créneau coursier</label>'+
            '<select id="af-delivery-slot" onchange="_acceptForm.labDeliverySlot=this.value" style="width:100%;border:1.5px solid #cbd5e1;border-radius:8px;padding:11px 13px;font-size:1rem;">'+_deliverySlotOptionsHtml(_acceptForm.labDeliverySlot)+'</select></div>'+
        '</div>'+
        '<label style="display:inline-flex;align-items:center;gap:8px;cursor:pointer;font-size:.96rem;margin-bottom:20px;color:#dc2626;font-weight:600;"><input type="checkbox" id="af-urgent"'+(_acceptForm.urgent?' checked':'')+' onchange="_acceptForm.urgent=this.checked"/>Travail urgent</label>'+
        '<div style="margin-bottom:20px;">'+
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">'+
            '<label style="font-size:.92rem;font-weight:600;color:#1e293b;">Types de travaux</label>'+
            '<button type="button" onclick="addAcceptItem()" style="background:#dbeafe;color:#1d4ed8;border:1px solid #3b82f6;border-radius:6px;padding:6px 14px;font-size:.86rem;font-weight:600;cursor:pointer;">+ Ajouter une ligne</button>'+
          '</div>'+
          '<div id="af-items-list" style="display:flex;flex-direction:column;gap:8px;"></div>'+
          '<div id="af-price-summary" style="margin-top:10px;font-size:.92rem;color:#475569;"></div>'+
        '</div>'+
        '<div style="margin-bottom:16px;">'+
          '<label style="font-size:.92rem;font-weight:600;color:#1e293b;display:block;margin-bottom:6px;">Note pour la fiche du travail</label>'+
          '<textarea id="af-note" oninput="_acceptForm.note=this.value" style="width:100%;border:1.5px solid #cbd5e1;border-radius:8px;padding:11px 13px;font-size:.94rem;outline:none;min-height:140px;resize:vertical;font-family:Inter,sans-serif;line-height:1.5;">'+escH2(_acceptForm.note)+'</textarea>'+
        '</div>'+
      '</div>'+
      // Pied
      '<div style="padding:18px 28px;border-top:1px solid #e2e8f0;display:flex;gap:12px;justify-content:space-between;align-items:center;flex-shrink:0;background:#f8fafc;">'+
        '<button onclick="_gotoViewOrderStep(1)" style="background:#fff;border:1.5px solid #cbd5e1;color:#475569;border-radius:8px;padding:11px 18px;font-size:.94rem;font-weight:600;cursor:pointer;">← Retour à la fiche</button>'+
        '<button onclick="confirmAcceptOrder()" style="background:#16a34a;color:#fff;border:none;border-radius:8px;padding:12px 28px;font-size:1.02rem;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(22,163,74,.3);">✅ Créer le travail</button>'+
      '</div>'+
    '</div>';

  // Initialiser le formulaire
  if(!_acceptForm.items.length)addAcceptItem(true);
  else renderAcceptItems();
}

// Regroupe les dents connectées via union-find
function _groupConnectedTeeth(teeth,linksArr){
  if(!teeth||!teeth.length)return [];
  const parent={};
  teeth.forEach(function(t){parent[t]=t;});
  function find(x){return parent[x]===x?x:(parent[x]=find(parent[x]));}
  function union(a,b){const ra=find(a),rb=find(b);if(ra!==rb)parent[ra]=rb;}
  (linksArr||[]).forEach(function(key){
    const ab=key.split('-').map(Number);
    if(parent[ab[0]]!==undefined&&parent[ab[1]]!==undefined)union(ab[0],ab[1]);
  });
  const groups={};
  teeth.forEach(function(t){const r=find(t);if(!groups[r])groups[r]=[];groups[r].push(t);});
  return Object.values(groups).map(function(g){return g.sort(function(a,b){return a-b;});}).sort(function(a,b){return a[0]-b[0];});
}

function _formatTeethSummary(teeth,linksArr){
  if(!teeth||!teeth.length)return '';
  const groups=_groupConnectedTeeth(teeth,linksArr);
  const allTeeth=teeth.slice().sort(function(a,b){return a-b;}).join(', ');
  const bridges=groups.filter(function(g){return g.length>1;});
  let txt='🦷 Dents : '+allTeeth;
  if(bridges.length){
    txt+='\n🌉 '+(bridges.length>1?'Solidarisations : ':'Solidarisation : ')+bridges.map(function(g){return g.join(', ');}).join('  ·  ');
  }
  return txt;
}

function _buildAutoNoteFromCaseStep(c,step){
  let parts=[];
  if(c.finalGoal)parts.push('🎯 Objectif final du cas :\n'+c.finalGoal);
  if(step&&step.description)parts.push('📨 Étape demandée :\n'+step.description);
  const teethSummary=_formatTeethSummary(c.teeth||[],c.links||[]);
  if(teethSummary)parts.push(teethSummary);
  // La teinte de l'étape prime sur la teinte du cas
  const shadeVal=(step&&step.shadeValue)||c.shadeValue||'';
  const shadeType=(step&&step.shadeValue)?(step.shadeType||''):(c.shadeType||'');
  if(shadeVal)parts.push('🎨 Teinte : '+shadeVal+(shadeType==='custom'?' (personnalisée)':''));
  if(c.patient&&(c.patient.sexe||c.patient.age)){
    var infoBits=[];
    if(c.patient.sexe==='F')infoBits.push('♀ Femme');
    else if(c.patient.sexe==='M')infoBits.push('♂ Homme');
    if(c.patient.age)infoBits.push(c.patient.age+' ans');
    if(infoBits.length)parts.push('👤 Code patient : '+infoBits.join(' · '));
  }
  if(step&&step.notes)parts.push('📝 Notes du dentiste :\n'+step.notes);
  return parts.join('\n\n');
}
// Compat
function _buildAutoNoteFromOrder(o){return _buildAutoNoteFromCaseStep(o,(o.steps||[])[0]||{});}

function _getAllJobTypeOptions(){
  // Reproduit la liste utilisée dans le saisie-it
  const standard=Object.keys(TYPE_LABELS||{}).map(function(k){return{id:k,label:TYPE_LABELS[k]};});
  const custom=(customTypes||[]).map(function(ct){return{id:ct.id,label:ct.label,category:ct.category};});
  // Fusion sans doublons
  const all=[];const seen={};
  standard.concat(custom).forEach(function(t){if(!seen[t.id]){all.push(t);seen[t.id]=true;}});
  return all;
}

function _findTarif(typeId){
  if(!Array.isArray(tarifs))return null;
  return tarifs.find(function(t){return t.types&&t.types.includes(typeId);});
}

function addAcceptItem(skipRender){
  const types=_getAllJobTypeOptions();
  _acceptForm.items.push({type:types[0]?types[0].id:'',nb:1});
  if(!skipRender)renderAcceptItems();
  else renderAcceptItems();
}

function removeAcceptItem(i){
  _acceptForm.items.splice(i,1);
  if(!_acceptForm.items.length)addAcceptItem(true);
  else renderAcceptItems();
}

function renderAcceptItems(){
  const el=document.getElementById('af-items-list');if(!el)return;
  const types=_getAllJobTypeOptions();
  el.innerHTML=_acceptForm.items.map(function(item,i){
    const tarif=_findTarif(item.type);
    const prixDef=tarif?tarif.prix:0;
    const prixTotal=prixDef*(item.nb||1);
    return '<div style="display:flex;gap:6px;align-items:center;background:#fff;border:1px solid #e2e8f0;border-radius:7px;padding:6px 8px;">'+
      '<select onchange="_acceptForm.items['+i+'].type=this.value;renderAcceptItems()" style="flex:1;min-width:0;border:1px solid #e2e8f0;border-radius:5px;padding:5px 7px;font-size:.82rem;outline:none;background:#fff;">'+
        types.map(function(t){return '<option value="'+escH2(t.id)+'"'+(t.id===item.type?' selected':'')+'>'+escH2(t.label)+'</option>';}).join('')+
      '</select>'+
      '<input type="number" min="1" max="50" value="'+(item.nb||1)+'" onchange="_acceptForm.items['+i+'].nb=parseInt(this.value)||1;renderAcceptItems()" style="width:54px;border:1px solid #e2e8f0;border-radius:5px;padding:5px 7px;font-size:.82rem;outline:none;text-align:center;"/>'+
      '<div style="width:90px;text-align:right;font-size:.78rem;color:'+(prixDef?'#2563eb':'#cbd5e1')+';font-family:monospace;">'+(prixDef?(prixTotal.toFixed(2)+' €'):'— €')+'</div>'+
      (_acceptForm.items.length>1?'<button type="button" onclick="removeAcceptItem('+i+')" style="background:none;border:none;color:#c0392b;font-size:1rem;cursor:pointer;padding:2px 6px;">×</button>':'<div style="width:24px;"></div>')+
    '</div>';
  }).join('');
  // Récap prix
  const sum=_acceptForm.items.reduce(function(s,it){const t=_findTarif(it.type);return s+(t?t.prix:0)*(it.nb||1);},0);
  const summary=document.getElementById('af-price-summary');
  if(summary){
    const missing=_acceptForm.items.some(function(it){return !_findTarif(it.type);});
    summary.innerHTML='<strong style="color:#2563eb;">Prix estimé total : '+sum.toFixed(2)+' €</strong>'+(missing?' <span style="color:#c2410c;">⚠️ Certains types n\'ont pas de tarif défini — ajoutez-les dans Paramètres → Tarifs</span>':'');
  }
}

var _acceptingInProgress=false;
async function confirmAcceptOrder(){
  // ── Protection contre les multi-clics ──
  // Empêche la création de doublons si l'utilisateur clique plusieurs fois
  // pendant que la requête est en cours.
  if(_acceptingInProgress){
    console.warn('confirmAcceptOrder: une acceptation est déjà en cours, ignoré.');
    return;
  }
  if(!_acceptForm.patient.trim()){alert('Veuillez renseigner le code patient.');return;}
  const validItems=_acceptForm.items.filter(function(it){return it.type;});
  if(!validItems.length){alert('Ajoutez au moins un type de travail.');return;}

  // Désactiver visuellement le bouton et marquer l'opération en cours
  _acceptingInProgress=true;
  const acceptBtns=document.querySelectorAll('#order-overlay button[onclick*="confirmAcceptOrder"]');
  acceptBtns.forEach(function(b){b.disabled=true;b.style.opacity='.5';b.style.cursor='wait';b.dataset._oldText=b.textContent;b.textContent='⏳ Création en cours…';});
  // Helper qui libère le verrou et réactive les boutons en cas d'erreur ou abandon
  function _releaseAcceptLock(){
    _acceptingInProgress=false;
    document.querySelectorAll('#order-overlay button[onclick*="confirmAcceptOrder"]').forEach(function(b){
      b.disabled=false;b.style.opacity='';b.style.cursor='';
      if(b.dataset._oldText){b.textContent=b.dataset._oldText;delete b.dataset._oldText;}
    });
  }

  const c=_findOrder(_acceptForm.portalId,_acceptForm.caseId);if(!c){_releaseAcceptLock();return;}
  const step=_findStep(c,_acceptForm.stepId);if(!step){alert('Étape introuvable');_releaseAcceptLock();return;}
  const cab=cabinets.find(function(x){return x.portalId===_acceptForm.portalId;});if(!cab){_releaseAcceptLock();return;}
  _debugAuditLog('H3','Desktop confirmAcceptOrder start',{portalId:_acceptForm.portalId,caseId:_acceptForm.caseId,stepId:_acceptForm.stepId,items:validItems.length,hasDeliveryDate:!!_acceptForm.deliveryDate});

  try {
  // Construire le job avec items multi-types (comme la saisie normale)
  const totalNb=validItems.reduce(function(s,it){return s+(it.nb||1);},0);
  const tasks=[];
  // Construit les tâches via buildTasks UNIQUEMENT si la programmation est activée
  const progOn=typeof isProgActif==='function'&&isProgActif();
  if(progOn&&typeof buildTasks==='function'){
    validItems.forEach(function(it){
      try{const subTasks=buildTasks(it.type,false);if(subTasks)tasks.push.apply(tasks,subTasks);}catch(e){}
    });
  }

  var afSlot=document.getElementById('af-delivery-slot');
  if(afSlot)_acceptForm.labDeliverySlot=afSlot.value||'12';
  var afLab=document.getElementById('af-lab-delivery');
  if(afLab){_acceptForm.labDeliveryDate=afLab.value||'';_acceptForm.deliveryDate=afLab.value||'';}
  const job={
    id:String(Date.now()),
    patient:_acceptForm.patient,
    type:validItems[0].type,
    tasks:tasks,
    nb:totalNb,
    items:validItems.map(function(it){return{type:it.type,nb:it.nb||1};}),
    note:_acceptForm.note||'',
    requestedDeliveryDate:_acceptForm.requestedDeliveryDate||'',
    labDeliveryDate:_acceptForm.labDeliveryDate||_acceptForm.requestedDeliveryDate||'',
    labDeliverySlot:_acceptForm.labDeliverySlot||'12',
    deliveryDate:_acceptForm.labDeliveryDate||_acceptForm.requestedDeliveryDate||'',
    cabinet:cab.id,
    urgent:!!_acceptForm.urgent,
    createdAt:new Date().toISOString(),
    trackCode:typeof genTrackCode==='function'?genTrackCode():'',
    prothesisId:'',
    // Liens vers le cas + l'étape acceptée
    orderId:_acceptForm.caseId,
    orderPortalId:_acceptForm.portalId,
    orderStepId:_acceptForm.stepId,
    orderData:c,
    parentJobId:c.parentJobId||null
  };
  jobs.push(job);saveJobs();

  // Marquer l'étape comme acceptée côté Supabase
  const list=_pendingOrdersCache[_acceptForm.portalId]||await _fetchOrdersForCab(_acceptForm.portalId);
  const cIdx=list.findIndex(function(x){return x.id===_acceptForm.caseId;});
  if(cIdx>=0){
    _migrateOrderToCase(list[cIdx]);
    const sIdx=(list[cIdx].steps||[]).findIndex(function(s){return s.id===_acceptForm.stepId;});
    if(sIdx>=0){
      list[cIdx].steps[sIdx].status='accepted';
      list[cIdx].steps[sIdx].acceptedAt=new Date().toISOString();
      list[cIdx].steps[sIdx].jobId=job.id;
    }
    list[cIdx].updatedAt=new Date().toISOString();
  }
  await _writeOrdersForCab(_acceptForm.portalId,list);
  // #region agent log
  fetch('http://127.0.0.1:7687/ingest/aea19bce-9029-4481-9962-13d314321f91',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5f23a1'},body:JSON.stringify({sessionId:'5f23a1',runId:'site-audit-accept-billing',hypothesisId:'H14',location:'app.html:confirmAcceptOrder',message:'Accept workflow persisted to backend',data:{portalId:_acceptForm.portalId,caseId:_acceptForm.caseId,stepId:_acceptForm.stepId},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  _pendingOrdersCache[_acceptForm.portalId]=list;

  // Libérer le verrou anti-doublon AVANT de fermer la modale
  _acceptingInProgress=false;
  const overlayEl=document.getElementById('order-overlay');if(overlayEl)overlayEl.remove();
  showConfirm('Travail créé pour '+_acceptForm.patient+'.\n\nIl est maintenant dans « Mes travaux ».',{kind:'success'});
  render();renderDashboard();
  } catch(e) {
    // #region agent log
    fetch('http://127.0.0.1:7687/ingest/aea19bce-9029-4481-9962-13d314321f91',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5f23a1'},body:JSON.stringify({sessionId:'5f23a1',runId:'site-audit-accept-billing',hypothesisId:'H14',location:'app.html:confirmAcceptOrder',message:'Accept workflow failed',data:{msg:e&&e.message?String(e.message):'unknown',portalId:_acceptForm.portalId,caseId:_acceptForm.caseId},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    // Erreur (timeout, réseau, etc.) — annuler proprement, retirer le job ajouté
    console.error('confirmAcceptOrder failed',e);
    // Retirer le job ajouté optimistiquement à jobs[] pour éviter un travail orphelin
    const lastJob=jobs[jobs.length-1];
    if(lastJob&&lastJob.orderStepId===_acceptForm.stepId){
      jobs.pop();saveJobs();
    }
    showToast('❌ '+(e.message||'Erreur lors de la création'),'#c0392b');
    _releaseAcceptLock();
  }
}

// Compat ancien handler — redirige vers la nouvelle modale
async function acceptOrder(portalId,caseId,stepId){
  viewOrder(portalId,caseId,stepId);
}

async function rejectOrder(portalId,caseId,stepId){
  const reason=prompt('Raison du refus (optionnel) :');
  if(reason===null)return;
  const list=_pendingOrdersCache[portalId]||await _fetchOrdersForCab(portalId);
  const cIdx=list.findIndex(function(x){return x.id===caseId;});
  if(cIdx<0)return;
  _migrateOrderToCase(list[cIdx]);
  const sIdx=(list[cIdx].steps||[]).findIndex(function(s){return s.id===stepId;});
  if(sIdx<0)return;
  list[cIdx].steps[sIdx].status='rejected';
  list[cIdx].steps[sIdx].rejectedAt=new Date().toISOString();
  list[cIdx].steps[sIdx].rejectionReason=reason;
  list[cIdx].updatedAt=new Date().toISOString();
  await _writeOrdersForCab(portalId,list);
  _pendingOrdersCache[portalId]=list;
  showToast('Étape refusée','#c0392b');
  loadAndRenderPendingOrders();
}

// Modifier un travail existant (changer types, patient, note, date, urgent)
let _editJob={id:null,patient:'',requestedDeliveryDate:'',labDeliveryDate:'',labDeliverySlot:'12',deliveryDate:'',urgent:false,items:[],note:''};

function editJob(jobId){
  const job=jobs.find(function(j){return j.id===jobId;});if(!job){alert('Travail introuvable');return;}
  // Reconstruire les items depuis le job (compat ancien format avec un seul type)
  let items=Array.isArray(job.items)&&job.items.length?job.items.slice():[{type:job.type||'',nb:job.nb||1}];
  migrateJobDelivery(job);
  _editJob={
    id:jobId,
    patient:job.patient||'',
    requestedDeliveryDate:_jobRequestedDeliveryDate(job),
    labDeliveryDate:_jobLabDeliveryDate(job),
    labDeliverySlot:job.labDeliverySlot||'12',
    deliveryDate:_jobLabDeliveryDate(job),
    urgent:!!job.urgent,
    items:items.map(function(it){return{type:it.type,nb:it.nb||1};}),
    note:job.note||''
  };
  const overlay=document.createElement('div');
  overlay.id='edit-job-overlay';
  overlay.style.cssText='position:fixed;inset:0;background:rgba(15,23,42,.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto;';
  overlay.innerHTML=
    '<div style="background:#fff;border-radius:14px;max-width:680px;width:100%;max-height:92vh;overflow:hidden;display:flex;flex-direction:column;">'+
      '<div style="padding:18px 22px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">'+
        '<div style="font-size:1.1rem;font-weight:700;">✏️ Modifier le travail</div>'+
        '<button onclick="document.getElementById(\'edit-job-overlay\').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:#64748b;">×</button>'+
      '</div>'+
      '<div style="flex:1;overflow-y:auto;padding:18px 22px;">'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">'+
          '<div><label style="font-size:.74rem;font-weight:600;color:#64748b;display:block;margin-bottom:4px;">Code patient</label>'+
            '<input type="text" id="ej-patient" value="'+escH2(_editJob.patient)+'" oninput="_editJob.patient=this.value" style="width:100%;border:1.5px solid #e2e8f0;border-radius:7px;padding:9px 11px;font-size:.88rem;outline:none;"/></div>'+
          '<div><label style="font-size:.74rem;font-weight:600;color:#64748b;display:block;margin-bottom:4px;">Date demandée</label>'+
            '<input type="date" id="ej-req-delivery" value="'+escH2(_editJob.requestedDeliveryDate)+'" oninput="_editJob.requestedDeliveryDate=this.value" style="width:100%;border:1.5px solid #e2e8f0;border-radius:7px;padding:9px 11px;font-size:.88rem;outline:none;"/></div>'+
        '</div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">'+
          '<div><label style="font-size:.74rem;font-weight:600;color:#64748b;display:block;margin-bottom:4px;">📦 Date labo</label>'+
            '<input type="date" id="ej-lab-delivery" value="'+escH2(_editJob.labDeliveryDate)+'" oninput="_editJob.labDeliveryDate=this.value;_editJob.deliveryDate=this.value" style="width:100%;border:1.5px solid #e2e8f0;border-radius:7px;padding:9px 11px;font-size:.88rem;outline:none;"/></div>'+
          '<div><label style="font-size:.74rem;font-weight:600;color:#64748b;display:block;margin-bottom:4px;">🚚 Créneau</label>'+
            '<select id="ej-delivery-slot" onchange="_editJob.labDeliverySlot=this.value" style="width:100%;border:1.5px solid #e2e8f0;border-radius:7px;padding:9px 11px;font-size:.88rem;">'+_deliverySlotOptionsHtml(_editJob.labDeliverySlot)+'</select></div>'+
        '</div>'+
        '<label style="display:inline-flex;align-items:center;gap:6px;cursor:pointer;font-size:.86rem;margin-bottom:14px;color:#c0392b;"><input type="checkbox" id="ej-urgent" '+(_editJob.urgent?'checked':'')+' onchange="_editJob.urgent=this.checked"/>🔴 Urgent</label>'+
        '<div style="margin-bottom:14px;">'+
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">'+
            '<label style="font-size:.74rem;font-weight:600;color:#64748b;">Types de travaux *</label>'+
            '<button type="button" onclick="addEditJobItem()" style="background:#dbeafe;color:#1d4ed8;border:1px solid #3b82f6;border-radius:6px;padding:4px 10px;font-size:.74rem;font-weight:600;cursor:pointer;">+ Ajouter</button>'+
          '</div>'+
          '<div id="ej-items-list" style="display:flex;flex-direction:column;gap:6px;"></div>'+
          '<div id="ej-price-summary" style="margin-top:8px;font-size:.78rem;color:#64748b;"></div>'+
        '</div>'+
        '<div><label style="font-size:.74rem;font-weight:600;color:#64748b;display:block;margin-bottom:4px;">📝 Note</label>'+
          '<textarea id="ej-note" oninput="_editJob.note=this.value" style="width:100%;border:1.5px solid #e2e8f0;border-radius:7px;padding:10px;font-size:.86rem;outline:none;min-height:120px;resize:vertical;font-family:Inter,sans-serif;">'+escH2(_editJob.note)+'</textarea></div>'+
        _renderJobAttachmentsSection(jobId)+
      '</div>'+
      '<div style="padding:14px 22px;border-top:1px solid #e2e8f0;display:flex;gap:10px;justify-content:flex-end;flex-shrink:0;background:#f8fafc;">'+
        '<button onclick="document.getElementById(\'edit-job-overlay\').remove()" style="background:none;border:1px solid #e2e8f0;color:#64748b;border-radius:8px;padding:10px 16px;font-size:.86rem;cursor:pointer;">Annuler</button>'+
        '<button onclick="saveEditJob()" style="background:#2a6049;color:#fff;border:none;border-radius:8px;padding:10px 18px;font-size:.86rem;font-weight:600;cursor:pointer;">💾 Enregistrer</button>'+
      '</div>'+
    '</div>';
  document.body.appendChild(overlay);
  renderEditJobItems();
}

function addEditJobItem(){
  const types=_getAllJobTypeOptions();
  _editJob.items.push({type:types[0]?types[0].id:'',nb:1});
  renderEditJobItems();
}
function removeEditJobItem(i){
  _editJob.items.splice(i,1);
  if(!_editJob.items.length)addEditJobItem();
  else renderEditJobItems();
}
function renderEditJobItems(){
  const el=document.getElementById('ej-items-list');if(!el)return;
  const types=_getAllJobTypeOptions();
  el.innerHTML=_editJob.items.map(function(item,i){
    const tarif=_findTarif(item.type);
    const prixDef=tarif?tarif.prix:0;
    const prixTotal=prixDef*(item.nb||1);
    return '<div style="display:flex;gap:6px;align-items:center;background:#fff;border:1px solid #e2e8f0;border-radius:7px;padding:6px 8px;">'+
      '<select onchange="_editJob.items['+i+'].type=this.value;renderEditJobItems()" style="flex:1;min-width:0;border:1px solid #e2e8f0;border-radius:5px;padding:5px 7px;font-size:.84rem;outline:none;background:#fff;">'+
        types.map(function(t){return '<option value="'+escH2(t.id)+'"'+(t.id===item.type?' selected':'')+'>'+escH2(t.label)+'</option>';}).join('')+
      '</select>'+
      '<input type="number" min="1" max="50" value="'+(item.nb||1)+'" onchange="_editJob.items['+i+'].nb=parseInt(this.value)||1;renderEditJobItems()" style="width:54px;border:1px solid #e2e8f0;border-radius:5px;padding:5px 7px;font-size:.84rem;outline:none;text-align:center;"/>'+
      '<div style="width:90px;text-align:right;font-size:.78rem;color:'+(prixDef?'#2563eb':'#cbd5e1')+';font-family:monospace;">'+(prixDef?(prixTotal.toFixed(2)+' €'):'— €')+'</div>'+
      (_editJob.items.length>1?'<button type="button" onclick="removeEditJobItem('+i+')" style="background:none;border:none;color:#c0392b;font-size:1rem;cursor:pointer;padding:2px 6px;">×</button>':'<div style="width:24px;"></div>')+
    '</div>';
  }).join('');
  const sum=_editJob.items.reduce(function(s,it){const t=_findTarif(it.type);return s+(t?t.prix:0)*(it.nb||1);},0);
  const summary=document.getElementById('ej-price-summary');
  if(summary){
    const missing=_editJob.items.some(function(it){return !_findTarif(it.type);});
    summary.innerHTML='<strong style="color:#2563eb;">Prix estimé : '+sum.toFixed(2)+' €</strong>'+(missing?' <span style="color:#c2410c;">⚠️ Tarif manquant pour certains types</span>':'');
  }
}

function saveEditJob(){
  const job=jobs.find(function(j){return j.id===_editJob.id;});if(!job)return;
  const validItems=_editJob.items.filter(function(it){return it.type;});
  if(!validItems.length){alert('Au moins un type de travail est requis.');return;}
  if(!_editJob.patient.trim()){alert('Le code patient est requis.');return;}
  var ejReq=document.getElementById('ej-req-delivery');
  var ejLab=document.getElementById('ej-lab-delivery');
  var ejSlot=document.getElementById('ej-delivery-slot');
  if(ejReq)_editJob.requestedDeliveryDate=ejReq.value||'';
  if(ejLab)_editJob.labDeliveryDate=ejLab.value||'';
  if(ejSlot)_editJob.labDeliverySlot=ejSlot.value||'12';
  job.patient=_editJob.patient.trim();
  job.requestedDeliveryDate=_editJob.requestedDeliveryDate||'';
  job.labDeliveryDate=_editJob.labDeliveryDate||_editJob.requestedDeliveryDate||'';
  job.labDeliverySlot=_editJob.labDeliverySlot||'12';
  job.deliveryDate=job.labDeliveryDate;
  job.urgent=!!_editJob.urgent;
  job.note=_editJob.note||'';
  job.items=validItems.map(function(it){return{type:it.type,nb:it.nb||1};});
  job.type=validItems[0].type;
  job.nb=validItems.reduce(function(s,it){return s+(it.nb||1);},0);
  // Tâches : on ne re-génère PAS automatiquement (sauf si prog activée + pas de tâches existantes)
  // Le labo peut les re-générer manuellement si besoin
  saveJobs();
  document.getElementById('edit-job-overlay').remove();
  showToast('✅ Travail mis à jour','#2a6049');
  render();
}

// Sub-modale pour demander des précisions sur une commande
let _orderQ={selected:{},customs:{}};

function openOrderQuestions(portalId,caseId,stepId){
  const c=_findOrder(portalId,caseId);if(!c)return;
  const step=stepId?_findStep(c,stepId):(c.steps||[]).find(function(s){return s.status==='pending';});
  if(!step)return;
  const cab=cabinets.find(function(x){return x.portalId===portalId;});if(!cab)return;
  _orderQ={selected:{},customs:{},_caseId:caseId,_stepId:step.id,_patient:c.patient.name||''};
  // Compat ancien code
  const o=Object.assign({},c,{id:caseId,patient:c.patient});
  const overlay=document.createElement('div');
  overlay.id='oq-overlay';
  overlay.style.cssText='position:fixed;inset:0;background:rgba(15,23,42,.7);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto;';
  overlay.innerHTML='<div style="background:#fff;border-radius:14px;padding:22px;max-width:560px;width:100%;max-height:90vh;overflow-y:auto;">'+
    '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">'+
      '<div style="font-size:1.1rem;font-weight:700;">❓ Demander des précisions à '+escH2(cab.name)+'</div>'+
      '<button onclick="document.getElementById(\'oq-overlay\').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:#64748b;">×</button>'+
    '</div>'+
    '<div style="font-size:.78rem;color:#64748b;margin-bottom:14px;">Code patient : <strong>'+escH2(o.patient.name)+'</strong>. Cochez les informations manquantes — un message groupé sera envoyé via le chat du portail.</div>'+
    '<div id="oq-chips" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;"></div>'+
    '<div id="oq-customs" style="margin-bottom:14px;display:none;"></div>'+
    '<div style="font-size:.74rem;color:#64748b;font-weight:600;margin-bottom:4px;">Message à envoyer au praticien (modifiable) :</div>'+
    '<textarea id="oq-msg" style="width:100%;border:1.5px solid #e2e8f0;border-radius:8px;padding:10px 12px;font-size:.84rem;outline:none;min-height:140px;resize:vertical;font-family:Inter,sans-serif;"></textarea>'+
    '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px;">'+
      '<button onclick="document.getElementById(\'oq-overlay\').remove()" style="background:none;border:1px solid #e2e8f0;color:#64748b;border-radius:8px;padding:9px 16px;font-size:.84rem;cursor:pointer;">Annuler</button>'+
      '<button onclick="sendOrderQuestions(\''+escH2(portalId)+'\',\''+escH2(caseId)+'\',\''+escH2(step.id)+'\')" style="background:#c2410c;color:#fff;border:none;border-radius:8px;padding:9px 18px;font-size:.85rem;font-weight:600;cursor:pointer;">📨 Envoyer au praticien</button>'+
    '</div>'+
  '</div>';
  document.body.appendChild(overlay);
  renderOrderQChips(o);
}

function renderOrderQChips(o){
  const el=document.getElementById('oq-chips');if(!el)return;
  el.innerHTML=MISSING_CATEGORIES.map(function(c){
    const on=!!_orderQ.selected[c.id];
    return '<button type="button" onclick="toggleOrderQChip(\''+c.id+'\')" style="border:1.5px solid '+(on?'#c2410c':'#fed7aa')+';background:'+(on?'#c2410c':'#fff')+';color:'+(on?'#fff':'#c2410c')+';border-radius:99px;padding:6px 12px;font-size:.78rem;font-weight:600;cursor:pointer;white-space:nowrap;">'+c.icon+' '+c.label+'</button>';
  }).join('');
  // Customs
  const customs=document.getElementById('oq-customs');
  const keys=Object.keys(_orderQ.selected).filter(function(k){return _orderQ.selected[k];});
  if(!keys.length){customs.style.display='none';customs.innerHTML='';}
  else{
    customs.style.display='block';
    customs.innerHTML=keys.map(function(catId){
      const c=MISSING_CATEGORIES.find(function(x){return x.id===catId;});
      const val=_orderQ.customs[catId]||'';
      return '<div style="display:flex;gap:6px;align-items:center;margin-bottom:6px;">'+
        '<span style="min-width:130px;font-size:.78rem;font-weight:600;color:#c2410c;">'+c.icon+' '+c.label+' :</span>'+
        '<input type="text" value="'+escAttr(val)+'" placeholder="'+escAttr(c.ph)+'" oninput="_orderQ.customs[\''+catId+'\']=this.value;_buildOrderQText(\''+(o.id)+'\')" style="flex:1;border:1px solid #fed7aa;background:#fff;border-radius:7px;padding:6px 10px;font-size:.82rem;outline:none;"/>'+
      '</div>';
    }).join('');
  }
  _buildOrderQText(o.id);
}

function toggleOrderQChip(catId){
  _orderQ.selected[catId]=!_orderQ.selected[catId];
  if(!_orderQ.selected[catId])delete _orderQ.customs[catId];
  // Trouver la commande pour reconstruire le texte
  const order=Object.values(_pendingOrdersCache).flat().find(function(x){return x;});
  // Plus simple : rebuild en utilisant l'orderId du textarea (récupéré par _buildOrderQText)
  const overlay=document.getElementById('oq-overlay');
  if(overlay){
    // Récupérer l'orderId depuis le bouton submit
    const btn=overlay.querySelector('button[onclick^="sendOrderQuestions"]');
    if(btn){
      const m=btn.getAttribute('onclick').match(/sendOrderQuestions\('([^']+)','([^']+)'\)/);
      if(m){
        const o=_findOrder(m[1],m[2]);
        if(o)renderOrderQChips(o);
      }
    }
  }
}

function _buildOrderQText(orderIdMaybe){
  const ta=document.getElementById('oq-msg');if(!ta)return;
  // Trouver la commande
  let o=null;
  Object.keys(_pendingOrdersCache).forEach(function(pid){
    const found=(_pendingOrdersCache[pid]||[]).find(function(x){return x.id===orderIdMaybe;});
    if(found)o=found;
  });
  const keys=Object.keys(_orderQ.selected).filter(function(k){return _orderQ.selected[k];});
  if(!keys.length){ta.value='';return;}
  const lines=keys.map(function(catId){
    const c=MISSING_CATEGORIES.find(function(x){return x.id===catId;});
    const txt=_orderQ.customs[catId]||c.ph;
    return '   • '+c.icon+' '+c.label+(txt?' :\n     '+txt:'');
  });
  const patient=o?o.patient.name:'';
  ta.value='Bonjour,\n\nMerci pour votre fiche de commande pour '+(patient||'votre patient')+'. Avant de lancer le travail, j\'aurais besoin de quelques précisions :\n\n'+lines.join('\n\n')+'\n\nMerci d\'avance pour votre retour 🙏';
}

async function sendOrderQuestions(portalId,caseId,stepId){
  const c=_findOrder(portalId,caseId);if(!c)return;
  const cab=cabinets.find(function(x){return x.portalId===portalId;});if(!cab)return;
  const ta=document.getElementById('oq-msg');
  const text=ta?ta.value.trim():'';
  if(!text){alert('Le message est vide.');return;}
  try{
    const sbAnon=supabase.createClient(SB_URL,SB_KEY);
    const{data:rows}=await sbAnon.from('labo_data').select('data').eq('id','chat_'+cab.portalId);
    const existing=(rows&&rows[0]&&rows[0].data)?rows[0].data:{messages:[]};
    const msgs=existing.messages||[];
    const laboName=localStorage.getItem('lb_name')||'Laboratoire';
    msgs.push({sender:'labo',senderName:laboName,content:text,createdAt:new Date().toISOString(),_orderQuestion:true,_caseId:caseId,_stepId:stepId});
    await sbAnon.from('labo_data').upsert({id:'chat_'+cab.portalId,data:{messages:msgs},updated_at:new Date().toISOString()});
    // Marquer l'étape comme "questions envoyées"
    const list=_pendingOrdersCache[portalId]||await _fetchOrdersForCab(portalId);
    const cIdx=list.findIndex(function(x){return x.id===caseId;});
    if(cIdx>=0){
      _migrateOrderToCase(list[cIdx]);
      const sIdx=(list[cIdx].steps||[]).findIndex(function(s){return s.id===stepId;});
      if(sIdx>=0){
        list[cIdx].steps[sIdx].questionsAsked=true;
        list[cIdx].steps[sIdx].questionsAskedAt=new Date().toISOString();
      }
      list[cIdx].updatedAt=new Date().toISOString();
    }
    await _writeOrdersForCab(portalId,list);
    _pendingOrdersCache[portalId]=list;
    document.getElementById('oq-overlay').remove();
    showToast('✅ Message envoyé au praticien','#2a6049');
    loadAndRenderPendingOrders();
  }catch(e){console.warn(e);showToast('❌ Erreur d\'envoi','#c0392b');}
}

// Polling toutes les 60s pour détecter de nouvelles commandes en arrière-plan
setInterval(function(){
  if(currentUser&&!document.hidden){
    const dashPane=document.getElementById('pane-dashboard');
    if(dashPane&&dashPane.classList.contains('on'))loadAndRenderPendingOrders();
  }
},60000);

/* ══════════════════════════════════════════
   QUESTIONS À POSER AUX PRATICIENS
   ══════════════════════════════════════════ */
const MISSING_CATEGORIES=[
  {id:'teinte',icon:'🎨',label:'Teinte',ph:'Préciser la teinte (A2, A3, B1…)'},
  {id:'materiau',icon:'🦷',label:'Matériau',ph:'Confirmer le matériau'},
  {id:'photo',icon:'📸',label:'Photo prep',ph:'Photo de la préparation manquante'},
  {id:'empreinte',icon:'🔍',label:'Empreinte/scan',ph:'Empreinte ou scan manquant'},
  {id:'articule',icon:'⚖️',label:'Articulé',ph:'Confirmer occlusion / articulé'},
  {id:'tarif',icon:'💰',label:'Tarif',ph:'Confirmer tarif / devis'},
  {id:'mesures',icon:'📐',label:'Mesures',ph:'Précision dimensions'},
  {id:'autre',icon:'❓',label:'Autre',ph:'Question libre…'}
];
function _miCatLabel(id){var c=MISSING_CATEGORIES.find(function(x){return x.id===id;});return c?c.icon+' '+c.label:'❓ Autre';}
function _miCatIcon(id){var c=MISSING_CATEGORIES.find(function(x){return x.id===id;});return c?c.icon:'❓';}

// Récupère la liste actuelle des questions d'un travail (compat string + array)
function getMissingItems(job){
  if(!job)return [];
  if(Array.isArray(job.missingInfoItems))return job.missingInfoItems;
  if(job.missingInfo&&!job.missingInfoResolvedAt){
    return [{id:'legacy_'+(job.id||''),category:'autre',text:job.missingInfo,resolved:false}];
  }
  return [];
}
function hasUnresolvedMissing(job){return getMissingItems(job).some(function(it){return !it.resolved;});}
function unresolvedMissingCount(job){return getMissingItems(job).filter(function(it){return !it.resolved;}).length;}

// État du formulaire de saisie : catégories sélectionnées + textes custom
var _saisieMissing={selected:{},customs:{}};

function renderMissingChipsSaisie(){
  var el=document.getElementById('saisie-missing-chips');if(!el)return;
  el.innerHTML=MISSING_CATEGORIES.map(function(c){
    var on=!!_saisieMissing.selected[c.id];
    return '<button type="button" onclick="toggleMissingChipSaisie(\''+c.id+'\')" style="border:1.5px solid '+(on?'#c2410c':'#fed7aa')+';background:'+(on?'#c2410c':'#fff')+';color:'+(on?'#fff':'#c2410c')+';border-radius:99px;padding:5px 12px;font-size:.78rem;font-weight:600;cursor:pointer;white-space:nowrap;">'+c.icon+' '+c.label+'</button>';
  }).join('');
  // Custom textareas pour les chips activées
  var customs=document.getElementById('saisie-missing-customs');
  var keys=Object.keys(_saisieMissing.selected).filter(function(k){return _saisieMissing.selected[k];});
  if(!keys.length){customs.style.display='none';customs.innerHTML='';return;}
  customs.style.display='block';
  customs.innerHTML=keys.map(function(catId){
    var c=MISSING_CATEGORIES.find(function(x){return x.id===catId;});
    var val=_saisieMissing.customs[catId]||'';
    return '<div style="display:flex;gap:6px;align-items:center;margin-bottom:6px;">'+
      '<span style="min-width:120px;font-size:.78rem;font-weight:600;color:#c2410c;">'+c.icon+' '+c.label+'</span>'+
      '<input type="text" value="'+escAttr(val)+'" placeholder="'+escAttr(c.ph)+'" oninput="_saisieMissing.customs[\''+catId+'\']=this.value" style="flex:1;border:1px solid #fed7aa;background:#fff;border-radius:7px;padding:6px 10px;font-size:.82rem;outline:none;"/>'+
    '</div>';
  }).join('');
}

function toggleMissingChipSaisie(catId){
  _saisieMissing.selected[catId]=!_saisieMissing.selected[catId];
  if(!_saisieMissing.selected[catId])delete _saisieMissing.customs[catId];
  renderMissingChipsSaisie();
}

function escAttr(s){return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

// Construit le tableau missingInfoItems à partir de l'état du formulaire
function _readMissingItemsFromSaisie(){
  var keys=Object.keys(_saisieMissing.selected).filter(function(k){return _saisieMissing.selected[k];});
  var now=new Date().toISOString();
  return keys.map(function(catId){
    var c=MISSING_CATEGORIES.find(function(x){return x.id===catId;})||{ph:''};
    var text=(_saisieMissing.customs[catId]||c.ph||'').trim();
    return {id:'mi_'+Date.now()+'_'+Math.random().toString(36).substr(2,5),category:catId,text:text,resolved:false,createdAt:now};
  });
}

function _resetSaisieMissingState(){
  _saisieMissing={selected:{},customs:{}};
  var chk=document.getElementById('saisie-imissing');if(chk)chk.checked=false;
  var wrap=document.getElementById('saisie-missing-wrap');if(wrap)wrap.style.display='none';
}

function _findItemWithMissing(id){
  return jobs.find(function(j){return j.id===id;})
    ||(queue||[]).find(function(q){return q.id===id;});
}
// S'assure qu'un item a sa structure missingInfoItems (migration legacy)
function _ensureMissingItems(item){
  if(Array.isArray(item.missingInfoItems))return item.missingInfoItems;
  if(item.missingInfo&&!item.missingInfoResolvedAt){
    item.missingInfoItems=[{id:'legacy_'+(item.id||''),category:'autre',text:item.missingInfo,resolved:false,createdAt:item.missingInfoCreatedAt||new Date().toISOString()}];
    delete item.missingInfo;delete item.missingInfoCreatedAt;delete item.missingInfoResolvedAt;
    return item.missingInfoItems;
  }
  item.missingInfoItems=item.missingInfoItems||[];
  return item.missingInfoItems;
}

// Marque une question spécifique d'un travail comme résolue
function resolveMissingItem(jobId,itemId){
  const job=_findItemWithMissing(jobId);if(!job)return;
  const items=_ensureMissingItems(job);
  const it=items.find(function(x){return x.id===itemId;});
  if(it){it.resolved=true;it.resolvedAt=new Date().toISOString();}
  saveJobs();saveQueue();renderDashboard();render();
  if(typeof showToast==='function')showToast('✅ Question résolue','#2a6049');
}

// Compat avec l'ancien bouton "résoudre tout sur un job"
function resolveMissingInfo(jobId){
  const job=_findItemWithMissing(jobId);if(!job)return;
  const items=_ensureMissingItems(job);
  const now=new Date().toISOString();
  items.forEach(function(it){it.resolved=true;it.resolvedAt=now;});
  saveJobs();saveQueue();renderDashboard();render();
  if(typeof showToast==='function')showToast('✅ Questions résolues','#2a6049');
}

function resolveAllMissingForCab(cabId){
  if(!cabId||cabId==='__none__')return;
  const all=[].concat(jobs,queue||[]).filter(function(j){return j.cabinet===cabId&&hasUnresolvedMissing(j);});
  if(!all.length)return;
  let total=0;all.forEach(function(j){total+=unresolvedMissingCount(j);});
  if(!confirm('Marquer comme résolues les '+total+' question(s) de ce cabinet ?'))return;
  const now=new Date().toISOString();
  all.forEach(function(j){
    const items=_ensureMissingItems(j);
    items.forEach(function(it){if(!it.resolved){it.resolved=true;it.resolvedAt=now;}});
  });
  saveJobs();saveQueue();renderDashboard();render();
  if(typeof showToast==='function')showToast('✅ '+total+' questions résolues','#2a6049');
}

function editMissingItem(jobId,itemId){
  const job=_findItemWithMissing(jobId);if(!job)return;
  const items=_ensureMissingItems(job);
  const it=items.find(function(x){return x.id===itemId;});if(!it)return;
  const newText=prompt('Modifier la question :',it.text||'');
  if(newText===null)return;
  if(!newText.trim()){it.resolved=true;it.resolvedAt=new Date().toISOString();}
  else{it.text=newText.trim();it.resolved=false;it.resolvedAt=null;}
  saveJobs();saveQueue();renderDashboard();render();
}

// Compat ancien handler
function editMissingInfo(jobId){
  const job=_findItemWithMissing(jobId);if(!job)return;
  const items=_ensureMissingItems(job);
  if(!items.length)return;
  // Édite la 1re question non résolue
  const first=items.find(function(it){return !it.resolved;})||items[0];
  editMissingItem(jobId,first.id);
}
// Récupère tous les jobs/queue d'un cabinet ayant des questions non résolues
function _missingJobsForCab(cabId){
  return [].concat(jobs,queue||[]).filter(function(j){return j.cabinet===cabId&&hasUnresolvedMissing(j);});
}

function _buildMissingMessageText(cabId){
  const list=_missingJobsForCab(cabId);
  if(!list.length)return '';
  const blocks=list.map(function(j){
    const typeLbl=(typeof getJobTypeLabel==='function')?getJobTypeLabel(j):(j.type||'');
    const items=getMissingItems(j).filter(function(it){return !it.resolved;});
    const sub=items.map(function(it){
      var lbl=_miCatLabel(it.category);
      return '   • '+lbl+(it.text?' :\n     '+it.text:'');
    }).join('\n\n');
    return '👤 '+(j.patient||'?')+'  —  '+typeLbl+'\n\n'+sub;
  });
  return 'Bonjour,\n\nJ\'ai quelques précisions à vous demander concernant vos derniers travaux :\n\n──────────────────\n\n'+blocks.join('\n\n──────────────────\n\n')+'\n\n──────────────────\n\nMerci d\'avance pour votre retour 🙏';
}

// Demande à l'IA de polir le message de base
async function aiPolishMessage(rawText,cabName){
  try{
    const resp=await fetch('/.netlify/functions/ai-chat',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        max_tokens:600,
        system:'Tu es un assistant pour un laboratoire de prothèse dentaire qui rédige des messages courts, professionnels et chaleureux à des cabinets dentaires. Réponds uniquement avec le texte du message, sans préambule, sans markdown, sans guillemets autour.',
        messages:[{role:'user',content:'Reformule ce message à destination du Dr '+(cabName||'')+' pour qu\'il soit plus naturel, concis et professionnel. Garde les mêmes informations (les questions par patient). Évite les formules trop longues. Ton bienveillant.\n\n---\n'+rawText+'\n---'}]
      })
    });
    const data=await resp.json();
    if(data&&data.content&&data.content[0]&&data.content[0].text)return data.content[0].text.trim();
  }catch(e){console.warn('aiPolish',e);}
  return null;
}

async function sendMissingInfoMessage(cabId){
  const cab=cabinets.find(function(c){return c.id===cabId;});if(!cab)return;
  let text=_buildMissingMessageText(cabId);
  if(!text){if(typeof showToast==='function')showToast('Aucune question en attente','#c0392b');return;}

  // Modale de confirmation avec option IA
  const proceed=await _showMissingMsgModal(cab,text);
  if(!proceed)return;
  text=proceed.text;

  if(cab.portalId){
    try{
      const sbAnon=supabase.createClient(SB_URL,SB_KEY);
      const{data:rows}=await sbAnon.from('labo_data').select('data').eq('id','chat_'+cab.portalId);
      const existing=(rows&&rows[0]&&rows[0].data)?rows[0].data:{messages:[]};
      const msgs=existing.messages||[];
      const laboName=localStorage.getItem('lb_name')||'Laboratoire';
      const sentAt=new Date().toISOString();
      msgs.push({sender:'labo',senderName:laboName,content:text,createdAt:sentAt,_missingMsg:true});
      await sbAnon.from('labo_data').upsert({id:'chat_'+cab.portalId,data:{messages:msgs},updated_at:sentAt});
      // Mémoriser timestamp d'envoi pour détecter les réponses ultérieures
      _missingJobsForCab(cabId).forEach(function(j){j._missingSentAt=sentAt;});
      saveJobs();saveQueue();
      if(typeof showToast==='function')showToast('✅ Message envoyé via le chat','#2a6049');
      renderDashboard();
    }catch(e){
      console.warn('sendMissingInfoMessage chat error',e);
      try{await navigator.clipboard.writeText(text);if(typeof showToast==='function')showToast('📋 Erreur chat — texte copié','#d97706');}catch(_){}
    }
  } else {
    try{
      await navigator.clipboard.writeText(text);
      if(typeof showToast==='function')showToast('📋 Message copié — collez-le dans SMS, email ou WhatsApp','#2a6049',5000);
    }catch(e){alert(text);}
  }
}

// Modale de prévisualisation/édition du message avec bouton IA et WhatsApp
function _showMissingMsgModal(cab,initialText){
  return new Promise(function(resolve){
    const overlay=document.createElement('div');
    overlay.style.cssText='position:fixed;inset:0;background:rgba(15,23,42,.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
    overlay.innerHTML=
      '<div style="background:#fff;border-radius:14px;padding:24px;max-width:600px;width:100%;max-height:90vh;overflow-y:auto;">'+
        '<div style="font-weight:700;font-size:1.1rem;margin-bottom:6px;">📨 Message groupé pour '+escH(cab.name)+'</div>'+
        '<div style="font-size:.78rem;color:#64748b;margin-bottom:14px;">Vérifiez le texte avant envoi. Vous pouvez le modifier ou demander à l\'IA de le reformuler.</div>'+
        '<textarea id="mim-text" style="width:100%;min-height:200px;border:1.5px solid #e2e8f0;border-radius:10px;padding:12px;font-size:.88rem;font-family:Inter,sans-serif;resize:vertical;outline:none;">'+escH(initialText)+'</textarea>'+
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">'+
          '<button id="mim-ai" style="background:#7c3aed;color:#fff;border:none;border-radius:8px;padding:8px 14px;font-size:.82rem;font-weight:600;cursor:pointer;">✨ Reformuler avec l\'IA</button>'+
          (cab.phone?'<a id="mim-wa" target="_blank" style="background:#25d366;color:#fff;border:none;border-radius:8px;padding:8px 14px;font-size:.82rem;font-weight:600;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:4px;">📲 WhatsApp</a>':'')+
        '</div>'+
        '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px;">'+
          '<button id="mim-cancel" style="background:none;border:1px solid #e2e8f0;border-radius:8px;padding:8px 16px;font-size:.85rem;cursor:pointer;">Annuler</button>'+
          '<button id="mim-ok" style="background:#2563eb;color:#fff;border:none;border-radius:8px;padding:8px 16px;font-size:.85rem;font-weight:600;cursor:pointer;">'+(cab.portalId?'💬 Envoyer via chat':'📋 Copier le texte')+'</button>'+
        '</div>'+
      '</div>';
    document.body.appendChild(overlay);
    const ta=document.getElementById('mim-text');
    function updateWA(){var wa=document.getElementById('mim-wa');if(wa&&cab.phone){wa.href='https://wa.me/'+(cab.phone||'').replace(/[^\d+]/g,'').replace(/^\+/,'')+'?text='+encodeURIComponent(ta.value);}}
    updateWA();ta.addEventListener('input',updateWA);
    document.getElementById('mim-ai').addEventListener('click',async function(){
      const btn=this;btn.disabled=true;const orig=btn.textContent;btn.textContent='⏳ Reformulation…';
      const polished=await aiPolishMessage(ta.value,cab.name);
      if(polished){ta.value=polished;updateWA();showToast('✨ Message reformulé','#7c3aed');}
      else showToast('❌ IA indisponible','#c0392b');
      btn.disabled=false;btn.textContent=orig;
    });
    document.getElementById('mim-cancel').addEventListener('click',function(){overlay.remove();resolve(null);});
    document.getElementById('mim-ok').addEventListener('click',function(){var v=ta.value.trim();overlay.remove();resolve(v?{text:v}:null);});
  });
}

// Récupère les nouveaux messages cabinet depuis qu'on a envoyé le message groupé
async function _fetchCabReplies(cab,sinceISO){
  if(!cab.portalId)return [];
  try{
    const sbAnon=supabase.createClient(SB_URL,SB_KEY);
    const{data:rows}=await sbAnon.from('labo_data').select('data').eq('id','chat_'+cab.portalId);
    const msgs=(rows&&rows[0]&&rows[0].data&&rows[0].data.messages)||[];
    return msgs.filter(function(m){return m.sender==='cabinet'&&(!sinceISO||m.createdAt>sinceISO);});
  }catch(e){console.warn('_fetchCabReplies',e);return [];}
}

// Polling : vérifie périodiquement si le cabinet a répondu après un message groupé
async function checkMissingMsgReplies(){
  const cabIds=new Set();
  [].concat(jobs,queue||[]).forEach(function(j){
    if(j._missingSentAt&&hasUnresolvedMissing(j)&&j.cabinet)cabIds.add(j.cabinet);
  });
  let updated=false;
  for(const cabId of cabIds){
    const cab=cabinets.find(function(c){return c.id===cabId;});if(!cab)continue;
    const sentJobs=_missingJobsForCab(cabId).filter(function(j){return j._missingSentAt;});
    if(!sentJobs.length)continue;
    const minSent=sentJobs.map(function(j){return j._missingSentAt;}).sort()[0];
    const replies=await _fetchCabReplies(cab,minSent);
    if(replies.length){
      sentJobs.forEach(function(j){if(!j._missingMsgHasReply){j._missingMsgHasReply=true;updated=true;}});
    }
  }
  if(updated){saveJobs();saveQueue();renderDashboard();}
}

// Boucle polling toutes les 30s sur les messages groupés en attente de réponse
setInterval(function(){
  if(currentUser&&!document.hidden)checkMissingMsgReplies();
},30000);

// IA : analyse la réponse cabinet et propose les résolutions
async function aiSummarizeReply(cabId){
  const cab=cabinets.find(function(c){return c.id===cabId;});if(!cab)return;
  const sentJobs=_missingJobsForCab(cabId).filter(function(j){return j._missingSentAt;});
  if(!sentJobs.length){showToast('Aucun message groupé envoyé','#c0392b');return;}
  const minSent=sentJobs.map(function(j){return j._missingSentAt;}).sort()[0];
  const replies=await _fetchCabReplies(cab,minSent);
  if(!replies.length){showToast('Aucune réponse du cabinet à analyser','#c0392b');return;}
  const repliesText=replies.map(function(m){return m.content||'';}).join('\n\n');

  // Liste des questions ouvertes
  const allOpen=[];
  sentJobs.forEach(function(j){
    getMissingItems(j).filter(function(it){return !it.resolved;}).forEach(function(it){
      allOpen.push({jobId:j.id,itemId:it.id,patient:j.patient,category:it.category,text:it.text});
    });
  });
  if(!allOpen.length){showToast('Aucune question ouverte','#c0392b');return;}

  showToast('🤖 Analyse en cours…','#7c3aed');
  try{
    const prompt='Voici les questions ouvertes du laboratoire pour le cabinet "'+cab.name+'" :\n'+
      allOpen.map(function(q,i){return (i+1)+'. ['+q.patient+'] '+_miCatLabel(q.category)+(q.text?' : '+q.text:'');}).join('\n')+
      '\n\nRéponse(s) du cabinet :\n'+repliesText+
      '\n\nPour chaque question, dis-moi si la réponse y répond. Réponds en JSON pur (pas de markdown) : [{"index":1,"answered":true,"summary":"A2 confirmée"}]. Mets answered=false si la réponse ne couvre pas la question.';
    const resp=await fetch('/.netlify/functions/ai-chat',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        max_tokens:800,
        system:'Tu es un assistant pour un laboratoire de prothèse dentaire. Tu analyses les réponses des dentistes pour identifier précisément à quelles questions elles répondent. Réponds UNIQUEMENT en JSON valide, sans markdown ni texte autour.',
        messages:[{role:'user',content:prompt}]
      })
    });
    const data=await resp.json();
    if(!data||!data.content||!data.content[0])throw new Error('réponse IA invalide');
    let raw=data.content[0].text||'[]';
    raw=raw.replace(/```json\s*/g,'').replace(/```\s*/g,'').trim();
    const analysis=JSON.parse(raw);
    if(!Array.isArray(analysis))throw new Error('format invalide');

    // Affichage modal pour confirmation
    const overlay=document.createElement('div');
    overlay.style.cssText='position:fixed;inset:0;background:rgba(15,23,42,.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
    const itemsHtml=analysis.map(function(a){
      const q=allOpen[a.index-1];if(!q)return '';
      const checked=a.answered?'checked':'';
      return '<div style="padding:10px 12px;border:1px solid '+(a.answered?'#86efac':'#e2e8f0')+';border-radius:8px;margin-bottom:8px;background:'+(a.answered?'#f0fdf4':'#fff')+';">'+
        '<div style="display:flex;align-items:flex-start;gap:8px;">'+
          '<input type="checkbox" '+checked+' data-job="'+escAttr(q.jobId)+'" data-item="'+escAttr(q.itemId)+'" style="width:20px;height:20px;margin-top:2px;flex-shrink:0;"/>'+
          '<div style="flex:1;min-width:0;">'+
            '<div style="font-size:.82rem;font-weight:600;color:var(--ink);">'+escH(q.patient)+' · '+escH(_miCatLabel(q.category))+'</div>'+
            '<div style="font-size:.78rem;color:var(--ink-soft);">'+escH(q.text||'')+'</div>'+
            '<div style="font-size:.78rem;color:'+(a.answered?'#166534':'#94a3b8')+';margin-top:6px;font-style:italic;">'+(a.answered?'✓ ':'')+'IA : '+escH(a.summary||'(pas de réponse identifiée)')+'</div>'+
          '</div>'+
        '</div>'+
      '</div>';
    }).join('');
    overlay.innerHTML=
      '<div style="background:#fff;border-radius:14px;padding:24px;max-width:600px;width:100%;max-height:90vh;overflow-y:auto;">'+
        '<div style="font-weight:700;font-size:1.1rem;margin-bottom:6px;">🤖 Réponses identifiées par l\'IA</div>'+
        '<div style="font-size:.78rem;color:#64748b;margin-bottom:14px;">Cochez les questions auxquelles le dentiste a répondu pour les marquer comme résolues.</div>'+
        itemsHtml+
        '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px;">'+
          '<button id="ais-cancel" style="background:none;border:1px solid #e2e8f0;border-radius:8px;padding:8px 16px;font-size:.85rem;cursor:pointer;">Annuler</button>'+
          '<button id="ais-ok" style="background:#2a6049;color:#fff;border:none;border-radius:8px;padding:8px 16px;font-size:.85rem;font-weight:600;cursor:pointer;">✅ Marquer cochés comme résolus</button>'+
        '</div>'+
      '</div>';
    document.body.appendChild(overlay);
    document.getElementById('ais-cancel').addEventListener('click',function(){overlay.remove();});
    document.getElementById('ais-ok').addEventListener('click',function(){
      const checks=overlay.querySelectorAll('input[type=checkbox]:checked');
      const now=new Date().toISOString();let cnt=0;
      checks.forEach(function(cb){
        const job=_findItemWithMissing(cb.dataset.job);if(!job)return;
        const items=_ensureMissingItems(job);
        const it=items.find(function(x){return x.id===cb.dataset.item;});
        if(it&&!it.resolved){it.resolved=true;it.resolvedAt=now;cnt++;}
      });
      saveJobs();saveQueue();
      overlay.remove();
      showToast('✅ '+cnt+' questions résolues','#2a6049');
      renderDashboard();render();
    });
  }catch(e){console.warn('aiSummarizeReply',e);showToast('❌ IA indisponible','#c0392b');}
}

/* ══════════════════════════════════════════
   §8 — TECH GRID & PLANNING
   ══════════════════════════════════════════ */
// Reconstruit les colonnes techniciens (structure HTML uniquement)
function renderTechGrid(){
  const container=document.getElementById('tgrid-container');if(!container)return;
  const keys=Object.keys(TECHS);
  if(!keys.length){
    container.innerHTML='<div style="text-align:center;padding:40px 20px;color:var(--ink-soft);font-size:.85rem;">'+
      t('empty.techs')+' <button class="btn btn-b" style="margin-left:10px;" onclick="goToAddTech()">+ '+t('settings.techs')+'</button></div>';
    return;
  }
  const cols=keys.map(k=>{
    const tech=TECHS[k];
    const ini=tech.label.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
    return '<div class="tcol">'+
      '<div class="thd" style="background:'+tech.soft+';">'+
        '<div class="tav" style="background:'+tech.color+';">'+ini+'</div>'+
        '<div><div class="tname">'+tech.label+'</div>'+
        '<div class="tcnt" id="cnt-'+k+'">0 tâche(s)</div></div>'+
      '</div>'+
      '<div class="ttasks" id="tk-'+k+'"><div class="empty">'+t('empty.tasks')+'</div></div>'+
    '</div>';
  }).join('');
  container.innerHTML='<div class="tgrid">'+cols+'</div>';
}

// Point d'entrée du rendu global (grille techs, table, calendrier, dashboard)
function render(){
  renderTechGrid();
  if(typeof syncJobsFilterCab==='function')syncJobsFilterCab();
  // Render tech columns: all TECHS keys + any keys referenced in jobs (legacy/migration)
  const techKeys=new Set(Object.keys(TECHS));
  jobs.forEach(j=>j.tasks.forEach(t=>{if(t.tech)techKeys.add(t.tech);}));
  techKeys.forEach(renderTech);
  renderTable();
  renderCal();
  updateCounts();
  if(typeof renderQueueMain==='function')renderQueueMain();
  if(typeof renderDashboard==='function')renderDashboard();
}

// Remplit la colonne d'un technicien avec ses tâches triées par date
function renderTech(tech){
  const el=document.getElementById('tk-'+tech);if(!el)return;
  const today=new Date();today.setHours(0,0,0,0);
  const tasks=[];
  jobs.forEach(j=>j.tasks.forEach((t,idx)=>{if(t.tech===tech)tasks.push({...t,patient:j.patient,urgent:j.urgent,note:j.note,jobId:j.id,taskIdx:idx,trackCode:j.trackCode||''});}));
  tasks.sort((a,b)=>new Date(a.dueDate)-new Date(b.dueDate));
  if(!tasks.length){el.innerHTML='<div class="empty">'+t('empty.tasks')+'</div>';return;}
  el.innerHTML=tasks.map(t=>{
    const late=new Date(t.dueDate)<today;
    let cls=`tcard tc-${tech}`;
    if(t.urgent)cls+=' urgent';
    if(late)cls+=' late';
    return `<div class="${cls}" data-jid="${t.jobId}" data-tidx="${t.taskIdx}">
      <div class="tp">${t.patient}</div>
      <div class="ts">${t.label}</div>
      <div class="td">📅 <strong>${fmtS(t.dueDate)}</strong></div>
      ${t.trackCode?`<div style="font-family:monospace;font-size:.6rem;color:var(--ink-soft);margin-top:2px;letter-spacing:.06em;">${t.trackCode}</div>`:''}
      ${t.note?`<div class="tnote">📝 ${t.note}</div>`:''}
    </div>`;
  }).join('');
}

// ── Mode opérations (volume élevé) ──
var LB_OPS_PAGE=50;
var _opsLimits={jobs:LB_OPS_PAGE,livrPret:40,livrCours:25,livrBlP:50,livrBlD:30};
function _resetOpsLimits(){_opsLimits={jobs:LB_OPS_PAGE,livrPret:40,livrCours:25,livrBlP:50,livrBlD:30};}
function _opsLoadMore(key,step){
  var n=_opsLimits[key]||LB_OPS_PAGE;
  _opsLimits[key]=n+(step||LB_OPS_PAGE);
  if(key==='jobs')renderTable();else renderLivraisons();
}
function _jobRefDate(j){
  if(j.deliveryDate)return new Date(j.deliveryDate+'T12:00:00');
  if(j.tasks&&j.tasks.length){
    var pend=j.tasks.filter(function(t){return !t.done&&t.dueDate;});
    if(pend.length)return new Date(Math.min.apply(null,pend.map(function(t){return new Date(t.dueDate).getTime();})));
    var all=j.tasks.filter(function(t){return t.dueDate;});
    if(all.length)return new Date(Math.max.apply(null,all.map(function(t){return new Date(t.dueDate).getTime();})));
  }
  return j.createdAt?new Date(j.createdAt):new Date();
}
function _sameDay(a,b){
  return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
}
function _inWeek(d,today){
  var start=new Date(today);start.setDate(start.getDate()-((start.getDay()+6)%7));
  var end=new Date(start);end.setDate(end.getDate()+6);end.setHours(23,59,59,999);
  return d>=start&&d<=end;
}
function _jobInActionMode(j){
  if(getMissingItems(j).some(function(it){return !it.resolved;}))return true;
  if(j.urgent)return true;
  if(j.tasks&&j.tasks.length)return !isJobComplete(j);
  if(j.deliveryDate)return false;
  if(bdl.find(function(b){return b.jobId===j.id;}))return false;
  return true;
}
function _jobMatchesSearch(j,q){
  if(!q)return true;
  var hay=[j.patient,j.note,j.trackCode,j.prothesisId,getJobTypeLabel(j)].join(' ').toLowerCase();
  return hay.includes(q);
}
function _getFilteredJobs(){
  var q=(document.getElementById('jobs-search')?.value||'').toLowerCase().trim();
  var mode=document.getElementById('jobs-filter-mode')?.value||'action';
  var cab=document.getElementById('jobs-filter-cab')?.value||'';
  var today=new Date();today.setHours(0,0,0,0);
  var list=jobs.filter(function(j){
    if(cab&&j.cabinet!==cab)return false;
    if(!_jobMatchesSearch(j,q))return false;
    if(mode==='all')return true;
    if(mode==='action')return _jobInActionMode(j);
    var ref=_jobRefDate(j);
    if(mode==='today')return _sameDay(ref,today);
    if(mode==='week')return _inWeek(ref,today);
    return true;
  });
  list.sort(function(a,b){return _jobRefDate(b)-_jobRefDate(a);});
  return list;
}
function _fmtJobGroupLabel(d){
  var today=new Date();today.setHours(0,0,0,0);
  var yest=new Date(today);yest.setDate(yest.getDate()-1);
  if(_sameDay(d,today))return "Aujourd'hui";
  if(_sameDay(d,yest))return 'Hier';
  return d.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
}
function syncJobsFilterCab(){
  var sel=document.getElementById('jobs-filter-cab');if(!sel)return;
  var cur=sel.value;
  sel.innerHTML='<option value="">Tous les cabinets</option>'+
    cabinets.map(function(c){return '<option value="'+c.id+'"'+(c.id===cur?' selected':'')+'>'+c.name+'</option>';}).join('');
}
function _updateJobsFilterSummary(shown,total){
  var el=document.getElementById('jobs-filter-summary');if(!el)return;
  if(total===shown)el.textContent=shown?shown+' affiché'+(shown>1?'s':''):'';
  else el.textContent=shown+' / '+total+' travaux';
}

// Rendu de la table des travaux (avec rowspan par job)
function renderTable(){
  const tbody=document.getElementById('jtbody');
  const cntEl=document.getElementById('jobs-cnt-saisie');
  const filtered=_getFilteredJobs();
  const limit=_opsLimits.jobs||LB_OPS_PAGE;
  const slice=filtered.slice(0,limit);
  if(cntEl)cntEl.textContent=filtered.length===jobs.length?String(jobs.length):filtered.length+'/'+jobs.length;
  _updateJobsFilterSummary(slice.length,filtered.length);
  const today=new Date();today.setHours(0,0,0,0);
  if(!jobs.length){tbody.innerHTML='<tr><td colspan="6" style="text-align:center;padding:20px;color:#a09080;font-style:italic;">'+t('empty.jobs')+'</td></tr>';return;}
  if(!filtered.length){
    tbody.innerHTML='<tr><td colspan="6" style="text-align:center;padding:20px;color:#a09080;font-style:italic;">Aucun travail pour ce filtre. Essayez « Tout voir » ou élargissez la recherche.</td></tr>';
    return;
  }
  const rows=[];
  var lastGroup='';
  slice.forEach(j=>{
    var gLabel=_fmtJobGroupLabel(_jobRefDate(j));
    if(gLabel!==lastGroup){
      lastGroup=gLabel;
      rows.push('<tr class="job-group-hd"><td colspan="6">'+gLabel+'</td></tr>');
    }
    const missingItemsArr=getMissingItems(j).filter(function(it){return !it.resolved;});
    const missingCnt=missingItemsArr.length;
    const missingTooltip=missingItemsArr.map(function(it){return _miCatLabel(it.category)+(it.text?' : '+it.text:'');}).join(' | ');
    const missing=missingCnt?missingTooltip:'';
    const missingBadge=missingCnt?`<span class="badge" style="background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;cursor:pointer;" onclick="editMissingInfo('${j.id}')" title="${(missingTooltip+'').replace(/'/g,'&#39;').replace(/"/g,'&quot;')}">❓ ${missingCnt} info${missingCnt>1?'s':''} manquante${missingCnt>1?'s':''}</span> `:'';
    if(!j.tasks||!j.tasks.length){
      // Travail simple (mode prog OFF) : une seule ligne sans étapes
      const created=j.createdAt?new Date(j.createdAt).toLocaleDateString('fr-FR',{day:'numeric',month:'short'}):'—';
      const delivStr=_fmtJobDeliveryLine(j)||'—';
      rows.push(`<tr>
        <td style="font-weight:500;">${j.urgent?'<span class="badge bg-urgent">🔴 URGENT</span> ':''}${missingBadge}${j.patient}${j.note?`<div style="font-size:.65rem;color:var(--ink-soft);font-style:italic;margin-top:2px;">📝 ${j.note}</div>`:''}${missing?`<div style="font-size:.65rem;color:#c2410c;margin-top:2px;">❓ ${(missing+'').replace(/</g,'&lt;')}</div>`:''}</td>
        <td><span class="badge bg-type">${getJobTypeLabel(j)}</span></td>
        <td style="color:var(--ink-soft);font-style:italic;">—</td>
        <td style="color:var(--ink-soft);font-style:italic;">—</td>
        <td>${_jobLabDeliveryDate(j)?'<span style="color:#2a6049;font-weight:500;">'+delivStr+'</span>':'<span style="color:var(--ink-soft);">'+created+'</span>'}</td>
        <td style="text-align:center;white-space:nowrap;">
          <button onclick="editJob('${j.id}')" title="Modifier ce travail" style="background:none;border:none;cursor:pointer;font-size:.95rem;padding:2px 6px;">✏️</button>
          <button class="btn-del" data-id="${j.id}" title="Supprimer">✕</button>
        </td>
      </tr>`);
    } else {
      j.tasks.forEach((t,i)=>{
        const late=new Date(t.dueDate)<today;
        rows.push(`<tr>
          ${i===0?`<td rowspan="${j.tasks.length}" style="font-weight:500;border-right:1px solid #e2e8f0;">
            ${j.urgent?'<span class="badge bg-urgent">🔴 URGENT</span> ':''}${missingBadge}${j.patient}
            ${j.note?`<div style="font-size:.65rem;color:var(--ink-soft);font-style:italic;margin-top:2px;">📝 ${j.note}</div>`:''}
            ${missing?`<div style="font-size:.65rem;color:#c2410c;margin-top:2px;">❓ ${(missing+'').replace(/</g,'&lt;')}</div>`:''}
          </td>`:''}
          ${i===0?`<td rowspan="${j.tasks.length}" style="border-right:1px solid #e2e8f0;"><span class="badge bg-type">${getJobTypeLabel(j)}</span></td>`:''}
          <td>${t.label}</td>
          <td><span class="badge bg-${t.tech}">${getTech(t.tech).label}</span></td>
          <td>${late?'<span class="badge bg-late">⚠️ Retard</span> ':''}${fmtL(t.dueDate)}</td>
          ${i===0?`<td rowspan="${j.tasks.length}" style="text-align:center;white-space:nowrap;">
            <button onclick="editJob('${j.id}')" title="Modifier ce travail" style="background:none;border:none;cursor:pointer;font-size:.9rem;padding:2px 4px;">✏️</button>
            <button class="btn-del" data-id="${j.id}" title="Supprimer">✕</button>
            <button class="btn-qr" data-id="${j.id}" title="QR Code" style="background:none;border:none;cursor:pointer;font-size:.9rem;padding:2px 4px;">🔲</button>
          </td>`:''}
        </tr>`);
      });
    }
  });
  if(filtered.length>slice.length){
    var more=filtered.length-slice.length;
    rows.push('<tr class="list-more-row"><td colspan="6"><button type="button" class="list-more-btn" onclick="_opsLoadMore(\'jobs\')">Afficher '+Math.min(more,LB_OPS_PAGE)+' de plus ('+more+' restants)</button></td></tr>');
  }
  tbody.innerHTML=rows.join('');
}

function updateCounts(){
  const allKeys=new Set(Object.keys(TECHS));
  jobs.forEach(j=>j.tasks.forEach(t=>{if(t.tech)allKeys.add(t.tech);}));
  const c={};allKeys.forEach(t=>c[t]=0);
  jobs.forEach(j=>j.tasks.forEach(t=>{c[t.tech]=(c[t.tech]||0)+1;}));
  allKeys.forEach(t=>{const el=document.getElementById('cnt-'+t);if(el)el.textContent=c[t]+' tâche(s)';});
  const tc=document.getElementById('total-cnt');
  if(tc)tc.textContent=Object.keys(TECHS).length;
}

/* ══════════════════════════════════════════
   §9 — CALENDAR
   ══════════════════════════════════════════ */
function dayTasks(date){
  const r=[];
  jobs.forEach(j=>j.tasks.forEach(t=>{if(sameDay(t.dueDate,date))r.push({...t,patient:j.patient,urgent:j.urgent,note:j.note});}));
  return r;
}
function renderCal(){if(calView==='week')renderWeek();else renderMonth();}
// Rendu de la vue semaine du calendrier (5 jours ouvrés)
function renderWeek(){
  const ws=sowk(calCursor);
  const days=Array.from({length:5},(_,i)=>{const d=new Date(ws);d.setDate(d.getDate()+i);return d;});
  document.getElementById('cal-title').textContent=ti('cal.week_of',{from:fmtS(days[0]),to:fmtS(days[4])})+' '+days[4].getFullYear();
  const today=new Date();
  document.getElementById('cal-week').innerHTML=`<div class="wgrid">${days.map(day=>{
    const tasks=dayTasks(day);const isT=sameDay(day,today);
    return `<div class="wday${isT?' today':''}">
      <div class="wday-hd"><div class="wday-name">${DFR[day.getDay()]}</div><div class="wday-num">${day.getDate()} ${MFR[day.getMonth()].slice(0,3)}</div></div>
      <div class="wday-body">${tasks.length?tasks.map(t=>`<div class="wtask" style="background:${getTech(t.tech).soft};border-color:${getTech(t.tech).color}">
        <div class="wtask-p">${t.urgent?'🔴 ':''}${t.patient}</div>
        <div class="wtask-t">${getTech(t.tech).label} — ${t.label}</div>
      </div>`).join(''):'<div class="empty" style="padding:10px 4px;">—</div>'}</div>
    </div>`;
  }).join('')}</div>`;
}
// Rendu de la vue mois du calendrier
function renderMonth(){
  const y=calCursor.getFullYear(),m=calCursor.getMonth();
  document.getElementById('cal-title').textContent=`${MFR[m]} ${y}`;
  const first=new Date(y,m,1),last=new Date(y,m+1,0),today=new Date();
  let dow=first.getDay();if(dow===0)dow=7;
  let html='<div class="mgrid">';
  ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].forEach(d=>html+=`<div class="mhd">${d}</div>`);
  for(let i=1;i<dow;i++){const d=new Date(y,m,1-dow+i);html+=`<div class="mcell other"><div class="mcell-n">${d.getDate()}</div></div>`;}
  for(let d=1;d<=last.getDate();d++){
    const date=new Date(y,m,d);const tasks=dayTasks(date);
    const isT=sameDay(date,today);const isWE=date.getDay()===0||date.getDay()===6;
    html+=`<div class="mcell${isT?' today':''}${isWE?' other':''}">
      <div class="mcell-n">${d}</div>
      ${tasks.map(t=>`<div class="mtask" style="background:${getTech(t.tech).soft};color:${getTech(t.tech).color};border-left:3px solid ${getTech(t.tech).color}">${getTech(t.tech).label} — ${t.patient}</div>`).join('')}
    </div>`;
  }
  const trailing=(7-(dow-1+last.getDate())%7)%7;
  for(let i=1;i<=trailing;i++)html+=`<div class="mcell other"><div class="mcell-n">${i}</div></div>`;
  html+='</div>';
  document.getElementById('cal-month').innerHTML=html;
}

/* ══════════════════════════════════════════
   §10 — PRINTING / IMPRESSION
   ══════════════════════════════════════════ */
function buildPrintHTML(){
  const type=document.getElementById('pt').value;
  if(type==='person'){
    const tech=document.getElementById('pp').value;
    const info=getTech(tech);
    const tasks=[];
    jobs.forEach(j=>j.tasks.forEach((t,idx)=>{if(t.tech===tech)tasks.push({...t,patient:j.patient,urgent:j.urgent,note:j.note,jobId:j.id,taskIdx:idx,trackCode:j.trackCode||''});}));
    tasks.sort((a,b)=>new Date(a.dueDate)-new Date(b.dueDate));
    const byDay={};
    tasks.forEach(t=>{const k=fmtISO(t.dueDate);if(!byDay[k])byDay[k]=[];byDay[k].push(t);});
    return `<div class="print-wrap">
      <div class="ptitle">Planning — ${info.label}</div>
      <div class="psub">Généré le ${fmtL(new Date())} · ${tasks.length} tâche(s)</div>
      ${Object.keys(byDay).sort().map(k=>{
        const d=new Date(k+'T12:00:00');
        return `<div class="pday">
          <div class="pday-lbl" style="color:${info.color}">${DFR[d.getDay()]} ${d.getDate()} ${MFR[d.getMonth()]} ${d.getFullYear()}<span class="pday-cnt">${byDay[k].length} tâche(s)</span></div>
          ${byDay[k].map(t=>`<div class="prow" style="background:${info.soft};border-color:${info.color}${t.urgent?';border-left-width:6px':''}">
            <div class="pp">${t.urgent?'🔴 ':''}${t.patient}</div>
            <div class="pst">${t.label}${t.note?` · <em>${t.note}</em>`:''}</div>
          </div>`).join('')}
        </div>`;
      }).join('')}
      ${!tasks.length?'<div class="empty">'+t('print.no_tasks')+'</div>':''}
    </div>`;
  } else {
    const k=document.getElementById('pd').value;
    if(!k){alert(t('alert.choose_date'));return '';}
    const d=new Date(k+'T12:00:00');
    const tasks=dayTasks(d).sort((a,b)=>a.tech.localeCompare(b.tech));
    return `<div class="print-wrap">
      <div class="ptitle">Planning du ${DFR[d.getDay()]} ${d.getDate()} ${MFR[d.getMonth()]} ${d.getFullYear()}</div>
      <div class="psub">Généré le ${fmtL(new Date())} · ${tasks.length} tâche(s)</div>
      ${tasks.length?tasks.map(t=>`<div class="prow" style="background:${getTech(t.tech).soft};border-color:${getTech(t.tech).color};margin-bottom:7px;">
        <div class="ptch" style="color:${getTech(t.tech).color}">${getTech(t.tech).label}</div>
        <div class="pp">${t.urgent?'🔴 ':''}${t.patient}</div>
        <div class="pst">${t.label}${t.note?` · <em>${t.note}</em>`:''}</div>
      </div>`).join(''):'<div class="empty">'+t('print.no_tasks_day')+'</div>'}
    </div>`;
  }
}

function genPrint(){
  const h=buildPrintHTML();if(!h)return;
  printHTML=h;
  document.getElementById('preview-area').innerHTML=h;
  document.getElementById('btn-export').style.display='inline-block';
  document.getElementById('btn-print').style.display='inline-block';
}

function doPDF(){
  if(!window.jspdf){alert(t('alert.pdf_unavailable'));return;}
  if(!printHTML){alert(t('alert.generate_first'));return;}
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
  const W=210,M=15;let y=M;
  const type=document.getElementById('pt').value;
  function h2r(hex){return[parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)];}
  function chk(h=10){if(y+h>280){doc.addPage();y=M;}}
  if(type==='person'){
    const tech=document.getElementById('pp').value;
    const info=getTech(tech);const rgb=h2r(info.color);
    const tasks=[];
    jobs.forEach(j=>j.tasks.forEach((t,idx)=>{if(t.tech===tech)tasks.push({...t,patient:j.patient,urgent:j.urgent,note:j.note,jobId:j.id,taskIdx:idx,trackCode:j.trackCode||''});}));
    tasks.sort((a,b)=>new Date(a.dueDate)-new Date(b.dueDate));
    // Header
    doc.setFillColor(...rgb);doc.rect(0,0,W,22,'F');
    doc.setFontSize(16);doc.setFont('helvetica','bold');doc.setTextColor(255,255,255);
    doc.text('Planning — '+info.label,M,14);
    doc.setFontSize(9);doc.setFont('helvetica','normal');
    doc.text('Généré le '+fmtL(new Date())+' · '+tasks.length+' tâche(s)',M,20);
    y=28;
    const byDay={};
    tasks.forEach(t=>{const k=fmtISO(t.dueDate);if(!byDay[k])byDay[k]=[];byDay[k].push(t);});
    Object.keys(byDay).sort().forEach(k=>{
      const d=new Date(k+'T12:00:00');
      const dl=DFR[d.getDay()]+' '+d.getDate()+' '+MFR[d.getMonth()]+' '+d.getFullYear();
      chk(14);
      doc.setFontSize(11);doc.setFont('helvetica','bold');doc.setTextColor(...rgb);doc.text(dl,M,y);
      doc.setFontSize(8);doc.setTextColor(120,116,110);doc.text(byDay[k].length+' tâche(s)',W-M,y,{align:'right'});
      y+=2;doc.setDrawColor(...rgb);doc.setLineWidth(.3);doc.line(M,y,W-M,y);y+=4;
      byDay[k].forEach(t=>{
        chk(12);
        const sr=h2r(info.soft);
        doc.setFillColor(...sr);doc.roundedRect(M,y,W-M*2,t.note?13:9,2,2,'F');
        doc.setFillColor(...rgb);doc.rect(M,y,3,t.note?13:9,'F');
        doc.setFontSize(9);doc.setFont('helvetica','bold');doc.setTextColor(26,22,18);
        doc.text((t.urgent?'🔴 ':'')+t.patient,M+5,y+4);
        doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(100,96,90);
        doc.text(t.label,M+5,y+8);
        if(t.note){doc.setFontSize(7);doc.text('📝 '+t.note,M+5,y+12);}
        y+=(t.note?13:9)+3;
      });
      y+=3;
    });
    if(!tasks.length){doc.setFontSize(10);doc.setTextColor(150,140,130);doc.text(t('print.no_tasks'),M,y);}
    doc.save('planning_'+info.label.replace(' ','_')+'_'+fmtISO(new Date())+'.pdf');
  } else {
    const k=document.getElementById('pd').value;
    if(!k){alert(t('alert.choose_date'));return;}
    const d=new Date(k+'T12:00:00');
    const dl=DFR[d.getDay()]+' '+d.getDate()+' '+MFR[d.getMonth()]+' '+d.getFullYear();
    const tasks=dayTasks(d).sort((a,b)=>a.tech.localeCompare(b.tech));
    doc.setFillColor(200,65,10);doc.rect(0,0,W,22,'F');
    doc.setFontSize(15);doc.setFont('helvetica','bold');doc.setTextColor(255,255,255);
    doc.text('Planning du '+dl,M,14);
    doc.setFontSize(9);doc.setFont('helvetica','normal');
    doc.text(t('print.generated').replace('{date}',fmtL(new Date()))+' · '+tasks.length+' tâche(s)',M,20);
    y=28;
    tasks.forEach(t=>{
      chk(12);const info=TECHS[t.tech];const rgb=h2r(info.color);const sr=h2r(info.soft);
      doc.setFillColor(...sr);doc.roundedRect(M,y,W-M*2,10,2,2,'F');
      doc.setFillColor(...rgb);doc.rect(M,y,3,10,'F');
      doc.setFontSize(8);doc.setFont('helvetica','bold');doc.setTextColor(...rgb);doc.text(info.label,M+5,y+4);
      doc.setTextColor(26,22,18);doc.text((t.urgent?'🔴 ':'')+t.patient,M+40,y+4);
      doc.setFont('helvetica','normal');doc.setTextColor(100,96,90);doc.text(t.label,M+5,y+8);
      y+=13;
    });
    if(!tasks.length){doc.setFontSize(10);doc.setTextColor(150,140,130);doc.text(t('print.no_tasks_day'),M,y);}
    doc.save('planning_journee_'+k+'.pdf');
  }
}

/* ══════════════════════════════════════════
   §11 — SCAN
   ══════════════════════════════════════════ */
const SKW={
  'inlay core':'inlay_only','couronne zircone':'crown_only','couronne':'crown_only',
  'inlay composite':'inlay_composite','inlay onlay emax':'inlay_emax','emax':'inlay_emax',
  'facette':'facettes','facettes':'facettes','cle de schofield':'cle_schefield','schofield':'cle_schefield',
  'cire occlusion':'cire_occlusion',"cire d occlusion":'cire_occlusion','cire':'cire_occlusion',
  'armature zircon':'armature_zircon','armature metal':'armature_metal','armature metallique':'armature_metal',
  'wax up':'wax_up','guide chirurgical':'guide_chir','guide chir':'guide_chir',
  'impression modele':'impression_modele',
  'inlay armature':'inlay_armature',
  'inlay core armature':'inlay_armature',
  'bridge zircone':'bridge_zircone',
  'bridge metal':'bridge_metal',
  'bridge metallique':'bridge_metal',
  'provisoire':'provisoire',
};
function norm(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();}
function detectWorks(text){
  let t=norm(text);
  Object.keys(syns).forEach(syn=>{const ns=norm(syn);if(t.includes(ns)){const canon=Object.keys(SKW).find(k=>SKW[k]===syns[syn])||ns;t=t.replace(ns,norm(canon));}});
  const found=[];const keys=Object.keys(SKW).sort((a,b)=>b.length-a.length);let rem=t;
  keys.forEach(kw=>{const nkw=norm(kw);if(rem.includes(nkw)){
    const idx=rem.indexOf(nkw);const sur=rem.slice(Math.max(0,idx-10),idx+nkw.length+15);
    const m=sur.match(/[x×]\s*(\d+)|(\d+)\s*[x×]/i);
    found.push({type:SKW[kw],label:TYPE_LABELS[SKW[kw]],nb:m?parseInt(m[1]||m[2]):1});
    rem=rem.replace(nkw,'');
  }});
  return found;
}
// Parse le texte scanné et détecte les travaux pour préparer la confirmation
function processScan(){
  const raw=document.getElementById('scan-in').value.trim();if(!raw){alert(t('alert.nothing'));return;}
  const sep=document.getElementById('scan-sep').value||'|';
  const pn=parseInt(document.getElementById('scan-pn').value)-1;
  const pw=parseInt(document.getElementById('scan-pw').value)-1;
  const parts=raw.split(sep).map(s=>s.trim());
  const patient=parts[pn]||raw;const workTxt=parts[pw]||raw;
  const detected=detectWorks(workTxt);
  pending=detected.map(d=>({...d,patient,empNum:false,forced:null}));
  const rc=document.getElementById('scan-result-card');
  const rl=document.getElementById('scan-result-list');
  if(!detected.length){
    rl.innerHTML=`<div style="padding:12px;background:#fdecea;border-radius:7px;color:#c0392b;font-size:.8rem;">⚠️ ${t('empty.jobs_found')} : <strong>${workTxt}</strong></div>`;
    rc.style.display='block';return;
  }
  rl.innerHTML=`
    <div style="font-size:.8rem;color:var(--ink-soft);margin-bottom:12px;">Code patient : <strong style="color:var(--ink)">${patient}</strong> — ${detected.length} travail(aux)</div>
    <div style="padding:10px 12px;background:var(--bg);border-radius:7px;border:1px solid var(--border);margin-bottom:12px;display:flex;gap:14px;flex-wrap:wrap;align-items:center;">
      <div class="sctrl"><label>Technicien :</label>
        <select id="sc-tech"><option value="auto">Auto</option></select>
      </div>
      <label style="display:flex;align-items:center;gap:5px;font-size:.72rem;cursor:pointer;">
        <input type="checkbox" id="sc-emp" style="accent-color:var(--accent);"/><span>Empreinte num.</span>
      </label>
      <label style="display:flex;align-items:center;gap:5px;font-size:.72rem;cursor:pointer;color:#c0392b;font-weight:500;">
        <input type="checkbox" id="sc-urg" style="accent-color:#e74c3c;"/><span>🔴 Urgent</span>
      </label>
      <div class="sctrl" style="flex:1;min-width:160px;"><label>Note :</label>
        <input type="text" id="sc-note" placeholder="instructions..." style="flex:1;padding:3px 8px;border:1.5px solid var(--border);border-radius:5px;font-family:monospace;font-size:.76rem;"/>
      </div>
    </div>
    ${pending.map((d,i)=>`<div class="swork-row">
      <div class="swlabel">${d.label}</div>
      <div class="sctrl"><label>Éléments :</label><input type="number" class="sc-nb" data-i="${i}" min="1" max="20" value="${d.nb}"/></div>
    </div>`).join('')}`;
  rc.style.display='block';
}
// Valide et programme les travaux détectés lors du scan
function confirmScan(){
  if(!pending.length)return;
  document.querySelectorAll('.sc-nb').forEach(el=>{pending[el.dataset.i].nb=parseInt(el.value)||1;});
  const tv=document.getElementById('sc-tech').value;
  const gForced=tv!=='auto'?tv:null;
  const gEmp=document.getElementById('sc-emp').checked;
  const gUrg=document.getElementById('sc-urg').checked;
  const gNote=document.getElementById('sc-note').value.trim();
  const pool=['jc','lilou','litcha','tom'];
  const d1=addWD(new Date(),1);
  const sharedTech=gForced||pick(pool,d1,null);
  const patName=pending[0].patient;const added=[];
  pending.forEach(d=>{
    const tasks=buildTasks(d.type,gEmp,sharedTech);
    if(tasks.length){
      const lbl=d.nb>1?`${d.patient} (${d.nb} éléments)`:d.patient;
      jobs.push({id:String(Date.now())+String(Math.floor(Math.random()*9999)),patient:lbl,type:d.type,tasks,nb:d.nb,urgent:gUrg,note:gNote,createdAt:new Date().toISOString()});
      added.push(d.label);
    }
  });
  saveJobs();
  scanHist.unshift({patient:patName,works:added,date:new Date().toISOString()});
  if(scanHist.length>20)scanHist.pop();saveScanHist();
  document.getElementById('scan-in').value='';
  document.getElementById('scan-result-card').style.display='none';
  pending=[];render();renderScanHist();
  alert(`✓ ${added.length} travail(aux) programmé(s) pour ${patName} !`);
}
function renderScanHist(){
  const el=document.getElementById('scan-hist');if(!el)return;
  if(!scanHist.length){el.innerHTML='<div style="padding:14px;font-size:.78rem;color:var(--ink-soft);font-style:italic;">'+t('empty.scans')+'</div>';return;}
  el.innerHTML=scanHist.map(h=>`<div style="padding:9px 15px;border-bottom:1px solid #e2e8f0;font-size:.76rem;">
    <div style="font-weight:500;">${h.patient} — ${h.works.join(', ')}</div>
    <div style="font-size:.66rem;color:var(--ink-soft);">Scanné le ${new Date(h.date).toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
  </div>`).join('');
}

/* ══════════════════════════════════════════
   §12 — STATS
   ══════════════════════════════════════════ */
// — Synonymes pour l'autocomplétion scan
function addSyn(){
  const w=document.getElementById('syn-word').value.trim().toLowerCase();
  const t=document.getElementById('syn-type').value;
  if(!w){alert(t('alert.enter_word'));return;}
  syns[w]=t;saveSyns();document.getElementById('syn-word').value='';renderSyns();
}
function renderSyns(){
  const el=document.getElementById('syn-list');if(!el)return;
  const keys=Object.keys(syns);
  if(!keys.length){el.innerHTML='<div style="font-size:.73rem;color:var(--ink-soft);font-style:italic;">'+t('empty.synonymes')+'</div>';return;}
  el.innerHTML=`<div style="display:flex;flex-wrap:wrap;gap:5px;">${keys.map(k=>`
    <div class="syn-pill"><span style="font-weight:500;">${k}</span><span style="color:var(--ink-soft);">→</span><span style="color:var(--accent);">${TYPE_LABELS[syns[k]]||syns[k]}</span>
    <button class="syn-del" data-syn="${k}">✕</button></div>`).join('')}</div>`;
}

// — Rendu des statistiques (KPIs, camemberts, barres)
function makePieChart(data, colors){
  // data = [{label, value}], returns SVG + legend HTML
  const total=data.reduce(function(s,d){return s+d.value;},0);
  if(!total) return '<div style="font-size:.76rem;color:var(--ink-soft);font-style:italic;">'+t('empty.history')+'</div>';
  let angle=0;
  const size=120;const cx=size/2;const cy=size/2;const r=size/2-4;
  let paths='';
  data.forEach(function(d,i){
    if(!d.value)return;
    const pct=d.value/total;
    const startAngle=angle;
    const endAngle=angle+pct*2*Math.PI;
    const x1=cx+r*Math.sin(startAngle);const y1=cy-r*Math.cos(startAngle);
    const x2=cx+r*Math.sin(endAngle);  const y2=cy-r*Math.cos(endAngle);
    const large=pct>0.5?1:0;
    const col=colors[i%colors.length];
    paths+='<path d="M'+cx+','+cy+' L'+x1+','+y1+' A'+r+','+r+' 0 '+large+',1 '+x2+','+y2+' Z" fill="'+col+'"/>';
    angle=endAngle;
  });
  const svg='<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'" style="flex-shrink:0;">'+paths+'</svg>';
  const legend='<div style="display:flex;flex-direction:column;gap:5px;">'+data.filter(function(d){return d.value>0;}).map(function(d,i){
    return '<div style="display:flex;align-items:center;gap:6px;font-size:.72rem;">'+
      '<div style="width:10px;height:10px;border-radius:2px;background:'+colors[i%colors.length]+';flex-shrink:0;"></div>'+
      '<span>'+escHtml(d.label)+'</span>'+
      '<span style="color:var(--ink-soft);margin-left:auto;padding-left:8px;">'+d.value+'</span>'+
    '</div>';
  }).join('')+'</div>';
  return svg+legend;
}

// Rendu complet de la page statistiques (KPIs, camemberts, barres de charge)
function renderStats(){
  const today=new Date();today.setHours(0,0,0,0);
  const ws=sowk(today);const we=new Date(ws);we.setDate(we.getDate()+4);
  const thisMonth=today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0');

  // ── KPIs ligne 1 : stock en labo ─────────────────────────────────────────
  const allWork=jobs.concat(queue||[]); // jobs programmés + file d'attente
  const total=allWork.length;
  const urgent=allWork.filter(function(j){return j.urgent;}).length;
  const late=jobs.filter(function(j){return j.tasks&&j.tasks.some(function(t){return new Date(t.dueDate)<today;});}).length;
  const inQueue=(queue||[]).length;
  document.getElementById('s-kpi').innerHTML=
    '<div class="kcard"><div class="kval">'+total+'</div><div class="klbl">'+t('kpi.in_lab')+'</div></div>'+
    '<div class="kcard"><div class="kval" style="color:#1a4a7a;">'+inQueue+'</div><div class="klbl">'+t('kpi.to_schedule')+'</div></div>'+
    '<div class="kcard"><div class="kval" style="color:#c0392b;">'+urgent+'</div><div class="klbl">'+t('kpi.urgent')+'</div></div>'+
    '<div class="kcard"><div class="kval" style="color:#e67e22;">'+late+'</div><div class="klbl">'+t('kpi.late')+'</div></div>';

  // ── KPIs ligne 2 : ce mois ────────────────────────────────────────────────
  const sortiesMois=archive.filter(function(a){return (a.lastDate||'').startsWith(thisMonth);}).length;
  const blsMois=bdl.filter(function(b){return (b.createdAt||'').startsWith(thisMonth);});
  const caMois=blsMois.reduce(function(s,b){return s+(b.prix||0);},0);
  const avgBl=blsMois.length?Math.round(caMois/blsMois.length*100)/100:0;
  document.getElementById('s-kpi2').innerHTML=
    '<div class="kcard"><div class="kval" style="color:#2a6049;">'+sortiesMois+'</div><div class="klbl">'+t('kpi.outputs_month')+'</div></div>'+
    '<div class="kcard"><div class="kval" style="color:#5a3472;font-size:1.1rem;">'+caMois.toLocaleString(t('locale'),{minimumFractionDigits:2,maximumFractionDigits:2})+' €</div><div class="klbl">'+t('kpi.revenue_month')+'</div></div>'+
    '<div class="kcard"><div class="kval" style="font-size:1.1rem;">'+avgBl.toLocaleString(t('locale'),{minimumFractionDigits:2,maximumFractionDigits:2})+' €</div><div class="klbl">'+t('kpi.avg_bl')+'</div></div>';

  // ── Camembert types (travaux en cours) ───────────────────────────────────
  const PIE_COLORS=['#5a3472','#2a6049','#1a4a7a','#c8410a','#7b3f00','#5a5a1a','#b5451b','#2b5c5c'];
  const tyc={};jobs.forEach(function(j){tyc[j.type]=(tyc[j.type]||0)+1;});
  const pieTypes=Object.keys(tyc).sort(function(a,b){return tyc[b]-tyc[a];}).map(function(t){return {label:TYPE_LABELS[t]||t,value:tyc[t]};});
  document.getElementById('s-pie-types').innerHTML=makePieChart(pieTypes,PIE_COLORS);

  // ── Camembert cabinets (travaux en cours) ────────────────────────────────
  const cabc={};jobs.forEach(function(j){if(j.cabinet)cabc[j.cabinet]=(cabc[j.cabinet]||0)+1;});
  const pieCabs=Object.keys(cabc).sort(function(a,b){return cabc[b]-cabc[a];}).map(function(id){
    const c=cabinets.find(function(x){return x.id===id;});
    return {label:c?c.name:id,value:cabc[id]};
  });
  document.getElementById('s-pie-cabs').innerHTML=makePieChart(pieCabs,PIE_COLORS.slice(2));

  // ── Charge technicien semaine ────────────────────────────────────────────
  const tc={};Object.keys(TECHS).forEach(function(t){tc[t]=0;});
  jobs.forEach(function(j){(j.tasks||[]).forEach(function(t){const d=new Date(t.dueDate);if(d>=ws&&d<=we)tc[t.tech]=(tc[t.tech]||0)+1;});});
  const mt=Math.max.apply(null,[1].concat(Object.values(tc)));
  const techKeys=Object.keys(TECHS);
  document.getElementById('s-tech').innerHTML=techKeys.length?techKeys.map(function(t){return(
    '<div class="bar-row"><div class="bar-lbl">'+TECHS[t].label+'</div>'+
    '<div class="bar-track"><div class="bar-fill" style="width:'+((tc[t]||0)/mt*100)+'%;background:'+TECHS[t].color+';"></div></div>'+
    '<div class="bar-val">'+(tc[t]||0)+'</div></div>'
  );}).join(''):'<div class="empty" style="font-size:.76rem;color:var(--ink-soft);">'+t('empty.techs')+'</div>';

  // ── Sorties du mois par type ─────────────────────────────────────────────
  const tyMois={};
  archive.filter(function(a){return (a.lastDate||'').startsWith(thisMonth);}).forEach(function(a){tyMois[a.type]=(tyMois[a.type]||0)+1;});
  const stypes=Object.keys(tyMois).sort(function(a,b){return tyMois[b]-tyMois[a];});
  const mty=Math.max.apply(null,[1].concat(Object.values(tyMois)));
  document.getElementById('s-types').innerHTML=stypes.length?stypes.map(function(t){return(
    '<div class="bar-row"><div class="bar-lbl">'+(TYPE_LABELS[t]||t)+'</div>'+
    '<div class="bar-track"><div class="bar-fill" style="width:'+(tyMois[t]/mty*100)+'%;background:var(--accent);"></div></div>'+
    '<div class="bar-val">'+tyMois[t]+'</div></div>'
  );}).join(''):'<div class="empty" style="font-size:.76rem;color:var(--ink-soft);font-style:italic;">'+t('empty.history')+'</div>';

  // ── Charge par jour (2 semaines) ─────────────────────────────────────────
  const days14=[];for(let i=0;i<14;i++){const d=new Date(ws);d.setDate(d.getDate()+i);if(d.getDay()!==0&&d.getDay()!==6)days14.push(d);}
  const dc={};days14.forEach(function(d){dc[fmtISO(d)]=0;});
  jobs.forEach(function(j){(j.tasks||[]).forEach(function(t){const k=fmtISO(t.dueDate);if(dc[k]!==undefined)dc[k]++;});});
  const md=Math.max.apply(null,[1].concat(Object.values(dc)));
  const todayISO=fmtISO(today);
  document.getElementById('s-days').innerHTML=
    '<div style="display:grid;grid-template-columns:repeat('+days14.length+',1fr);gap:5px;align-items:end;height:110px;margin-bottom:6px;">'+
    days14.map(function(d){const k=fmtISO(d);const v=dc[k];const pct=Math.max((v/md)*100,3);const isT=k===todayISO;
      return '<div style="display:flex;flex-direction:column;align-items:center;gap:3px;height:100%;justify-content:flex-end;">'+
        '<div style="font-size:.58rem;color:var(--ink-soft);">'+(v||'')+'</div>'+
        '<div style="width:100%;border-radius:3px 3px 0 0;background:'+(isT?'var(--accent)':'#d8cfc0')+';height:'+pct+'%;min-height:3px;"></div>'+
      '</div>';
    }).join('')+
    '</div>'+
    '<div style="display:grid;grid-template-columns:repeat('+days14.length+',1fr);gap:5px;">'+
    days14.map(function(d){const isT=fmtISO(d)===todayISO;
      return '<div style="text-align:center;font-size:.56rem;color:'+(isT?'var(--accent)':'var(--ink-soft)')+';font-weight:'+(isT?700:400)+'>'+['Lun','Mar','Mer','Jeu','Ven'][d.getDay()-1]+'<br>'+d.getDate()+'</div>';
    }).join('')+
    '</div>';
}

/* ══════════════════════════════════════════
   §13 — HISTORIQUE
   ══════════════════════════════════════════ */
// — Export fiche planning en texte copiable ou HTML
function buildTextFiche(){
  const type=document.getElementById('pt').value;
  let lines=[];
  if(type==='person'){
    const tech=document.getElementById('pp').value;
    const info=getTech(tech);
    const tasks=[];
    jobs.forEach(j=>j.tasks.forEach((t,idx)=>{if(t.tech===tech)tasks.push({...t,patient:j.patient,urgent:j.urgent,note:j.note,jobId:j.id,taskIdx:idx,trackCode:j.trackCode||''});}));
    tasks.sort((a,b)=>new Date(a.dueDate)-new Date(b.dueDate));
    lines.push(ti('print.planning',{name:info.label.toUpperCase()}));
    lines.push(ti('print.generated',{date:fmtL(new Date())}));
    lines.push('');
    const byDay={};
    tasks.forEach(t=>{const k=fmtISO(t.dueDate);if(!byDay[k])byDay[k]=[];byDay[k].push(t);});
    if(!tasks.length){lines.push(t('print.no_tasks'));}
    else{
      Object.keys(byDay).sort().forEach(k=>{
        const d=new Date(k+'T12:00:00');
        lines.push('── '+DFR[d.getDay()].toUpperCase()+' '+d.getDate()+' '+MFR[d.getMonth()]+' '+d.getFullYear()+' ──');
        byDay[k].forEach(t=>{
          lines.push((t.urgent?'🔴 URGENT  ':'')+t.patient);
          lines.push('   › '+t.label);
          if(t.note)lines.push('   📝 '+t.note);
        });
        lines.push('');
      });
    }
  } else {
    const k=document.getElementById('pd').value;
    if(!k){alert(t('alert.choose_date'));return null;}
    const d=new Date(k+'T12:00:00');
    const tasks=dayTasks(d).sort((a,b)=>a.tech.localeCompare(b.tech));
    lines.push(ti('print.day_planning',{date:DFR[d.getDay()].toUpperCase()+' '+d.getDate()+' '+MFR[d.getMonth()].toUpperCase()+' '+d.getFullYear()}));
    lines.push(ti('print.generated',{date:fmtL(new Date())}));
    lines.push('');
    if(!tasks.length){lines.push(t('print.no_tasks_day'));}
    else{
      tasks.forEach(t=>{
        lines.push(getTech(t.tech).label.toUpperCase());
        lines.push((t.urgent?'🔴 URGENT  ':'')+t.patient);
        lines.push('   › '+t.label);
        if(t.note)lines.push('   📝 '+t.note);
        lines.push('');
      });
    }
  }
  return lines.join('\n');
}

function doExport(){
  if(!printHTML){alert(t('alert.generate_first'));return;}
  const html=buildExportHTML();
  if(!html)return;

  // Ouvrir dans un nouvel onglet avec document.write
  const w=window.open('','_blank');
  if(!w){
    // Si popup bloqué, afficher dans la page même
    document.getElementById('export-frame-wrap').style.display='block';
    document.getElementById('export-frame').srcdoc=html;
    document.getElementById('export-copy-msg').textContent='📋 '+t('toast.popup_blocked');
    document.getElementById('export-copy-msg').style.color='#c8410a';
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
  document.getElementById('export-copy-msg').textContent='✓ Fiche ouverte dans un nouvel onglet !';
  document.getElementById('export-copy-msg').style.color='#2a6049';
}

function buildExportHTML(){
  const type=document.getElementById('pt').value;
  let bodyHTML='';let titleTxt='';

  if(type==='person'){
    const tech=document.getElementById('pp').value;
    const info=getTech(tech);
    const tasks=[];
    jobs.forEach(j=>j.tasks.forEach((t,idx)=>{if(t.tech===tech)tasks.push({...t,patient:j.patient,urgent:j.urgent,note:j.note,jobId:j.id,taskIdx:idx,trackCode:j.trackCode||''});}));
    tasks.sort((a,b)=>new Date(a.dueDate)-new Date(b.dueDate));
    titleTxt='Planning — '+info.label;
    const byDay={};
    tasks.forEach(t=>{const k=fmtISO(t.dueDate);if(!byDay[k])byDay[k]=[];byDay[k].push(t);});
    bodyHTML=`
      <div class="header" style="background:${info.color};">
        <div class="h-title">${titleTxt}</div>
        <div class="h-sub">${ti('print.generated',{date:fmtL(new Date())})} · ${tasks.length} tâche(s)</div>
      </div>
      <div class="body">
      ${!tasks.length?'<p class="empty">'+t('print.no_tasks')+'</p>':Object.keys(byDay).sort().map(k=>{
        const d=new Date(k+'T12:00:00');
        const dl=DFR[d.getDay()]+' '+d.getDate()+' '+MFR[d.getMonth()]+' '+d.getFullYear();
        return `<div class="day-block">
          <div class="day-title" style="color:${info.color};border-color:${info.color};">${dl}<span class="day-cnt">${byDay[k].length} tâche(s)</span></div>
          ${byDay[k].map(t=>`
            <div class="task-row" style="background:${info.soft};border-color:${info.color}${t.urgent?';border-left-width:6px':''};">
              <div class="task-patient">${t.urgent?'🔴 ':''}${t.patient}</div>
              <div class="task-step">${t.label}${t.note?'<div class="task-note">📝 '+t.note+'</div>':''}</div>
            </div>`).join('')}
        </div>`;
      }).join('')}
      </div>`;
  } else {
    const k=document.getElementById('pd').value;
    if(!k){alert(t('alert.choose_date'));return null;}
    const d=new Date(k+'T12:00:00');
    const dl=DFR[d.getDay()]+' '+d.getDate()+' '+MFR[d.getMonth()]+' '+d.getFullYear();
    const tasks=dayTasks(d).sort((a,b)=>a.tech.localeCompare(b.tech));
    titleTxt='Planning du '+dl;
    bodyHTML=`
      <div class="header" style="background:#c8410a;">
        <div class="h-title">${titleTxt}</div>
        <div class="h-sub">${ti('print.generated',{date:fmtL(new Date())})} · ${tasks.length} tâche(s)</div>
      </div>
      <div class="body">
      ${!tasks.length?'<p class="empty">'+t('print.no_tasks_day')+'</p>':tasks.map(t=>`
        <div class="task-row" style="background:${getTech(t.tech).soft};border-color:${getTech(t.tech).color};">
          <div class="task-tech" style="color:${getTech(t.tech).color};">${getTech(t.tech).label}</div>
          <div class="task-patient">${t.urgent?'🔴 ':''}${t.patient}</div>
          <div class="task-step">${t.label}${t.note?'<div class="task-note">📝 '+t.note+'</div>':''}</div>
        </div>`).join('')}
      </div>`;
  }

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${titleTxt}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:Arial,sans-serif;background:#f5f0e8;min-height:100vh;}
  .header{padding:24px 28px;color:#fff;}
  .h-title{font-size:1.4rem;font-weight:bold;margin-bottom:4px;}
  .h-sub{font-size:.82rem;opacity:.85;}
  .body{max-width:720px;margin:24px auto;padding:0 16px;}
  .day-block{margin-bottom:20px;}
  .day-title{font-size:1rem;font-weight:bold;border-bottom:2px solid;padding-bottom:5px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;}
  .day-cnt{font-size:.72rem;font-weight:normal;color:#888;}
  .task-row{display:flex;align-items:flex-start;gap:12px;padding:10px 13px;border-radius:7px;margin-bottom:6px;border-left:4px solid;}
  .task-tech{font-size:.78rem;font-weight:bold;min-width:110px;padding-top:1px;}
  .task-patient{font-weight:bold;font-size:.88rem;min-width:150px;}
  .task-step{font-size:.8rem;color:#555;flex:1;}
  .task-note{font-size:.73rem;color:#888;font-style:italic;margin-top:3px;}
  .empty{text-align:center;padding:30px;color:#888;font-style:italic;}
  @media(max-width:600px){.task-row{flex-direction:column;gap:4px;}.task-patient,.task-tech{min-width:unset;}}

/* ── Réassignation / Task modal ── */
.tcard{cursor:pointer;}
/* ── Attente de pièce ── */
.wait-item{background:var(--surface);border:1.5px solid #e67e22;border-radius:11px;padding:16px 20px;margin-bottom:12px;}
.wait-patient{font-family:serif;font-size:1rem;font-weight:500;}
.wait-type{font-size:.72rem;color:var(--ink-soft);margin-top:2px;}
.wait-since{font-size:.68rem;color:#e67e22;margin-top:3px;}
.wait-note{font-size:.73rem;color:var(--ink-soft);font-style:italic;background:#fff8f0;border:1px solid #f0d0a0;border-radius:6px;padding:6px 10px;margin-bottom:10px;}
.wait-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;}
.btn-reprogram{background:var(--accent);color:#fff;border:none;border-radius:7px;padding:8px 16px;font-family:monospace;font-size:.76rem;cursor:pointer;font-weight:500;}
.btn-del-wait{background:none;border:1px solid var(--border);border-radius:7px;padding:8px 14px;font-family:monospace;font-size:.73rem;cursor:pointer;color:var(--ink-soft);}
/* ── Suivi commandes ── */
.sv-code{font-family:monospace;font-size:1.4rem;font-weight:700;letter-spacing:.18em;color:var(--accent);background:var(--accent-soft);border:2px dashed var(--accent);border-radius:10px;padding:8px 18px;display:inline-block;cursor:pointer;}
.sv-progress-bar{height:8px;background:var(--border);border-radius:99px;overflow:hidden;margin:10px 0;}
.sv-progress-fill{height:100%;background:linear-gradient(90deg,#1d4ed8,#60a5fa);border-radius:99px;transition:width .5s ease;}
.sv-step{display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);}
.sv-step:last-child{border-bottom:none;}
.sv-dot{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.75rem;flex-shrink:0;border:2px solid transparent;}
.sv-dot.done{background:var(--jc);color:#fff;border-color:var(--jc);}
.sv-dot.active{background:var(--accent);color:#fff;border-color:var(--accent);}
.sv-dot.wait{background:var(--bg);color:#bbb;border-color:#ddd;}
.sv-step-lbl{font-size:.83rem;font-weight:500;}
.sv-step-lbl.done{color:var(--jc);}
.sv-step-lbl.active{color:var(--accent);font-weight:700;}
.sv-step-lbl.wait{color:#aaa;}
.sv-step-meta{font-size:.68rem;color:var(--ink-soft);}
.sv-all-item{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:14px 18px;display:flex;align-items:center;gap:14px;margin-bottom:8px;}
.sv-all-item:hover{border-color:var(--accent);}
/* ── Absences ── */
.team-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:14px 18px;margin-bottom:10px;display:flex;align-items:center;gap:12px;}
/* ── Search hold ── */
.sr-hold-btn{background:#e67e22;color:#fff;border:none;border-radius:5px;padding:4px 10px;font-family:monospace;font-size:.65rem;cursor:pointer;white-space:nowrap;margin-top:6px;}

/* ── File d'attente ── */
.queue-badge{background:var(--accent);color:#fff;border-radius:99px;padding:1px 7px;font-size:.65rem;margin-left:4px;display:none;}
.queue-item{background:var(--surface);border:1.5px solid var(--border);border-radius:11px;padding:14px 18px;margin-bottom:10px;display:flex;align-items:flex-start;gap:12px;}
.queue-item.urg{border-color:#e74c3c;background:#fffbfb;}
.queue-num{font-family:'Inter',sans-serif;font-size:1.3rem;font-weight:800;color:#cbd5e1;min-width:28px;padding-top:2px;}
.queue-info{flex:1;}
.queue-patient{font-family:'Inter',sans-serif;font-size:.95rem;font-weight:700;margin-bottom:3px;}
.queue-meta{font-size:.7rem;color:var(--ink-soft);display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;}
.queue-tag{background:var(--accent-soft);color:var(--accent);padding:1px 8px;border-radius:99px;}
.queue-actions{display:flex;gap:7px;flex-wrap:wrap;}
.btn-q-auto{background:var(--accent);color:#fff;border:none;border-radius:7px;padding:7px 14px;font-family:'DM Mono',monospace;font-size:.74rem;cursor:pointer;font-weight:500;}
.btn-q-manual{background:#1a4a7a;color:#fff;border:none;border-radius:7px;padding:7px 14px;font-family:'DM Mono',monospace;font-size:.74rem;cursor:pointer;font-weight:500;}
.btn-q-del{background:none;border:1px solid var(--border);border-radius:7px;padding:7px 10px;font-family:'DM Mono',monospace;font-size:.72rem;cursor:pointer;color:var(--ink-soft);}
/* Modal manuel */
.mm-step-row{background:var(--bg);border:1px solid var(--border);border-radius:9px;padding:12px 14px;margin-bottom:8px;}
.mm-tech-btn{display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:6px;border:1.5px solid var(--border);background:var(--bg);cursor:pointer;font-family:'DM Mono',monospace;font-size:.72rem;margin:3px;}
.mm-tech-btn.sel{border-color:var(--accent);background:var(--accent-soft);color:var(--accent);}

/* ── Facturation ── */
.doc-card{background:var(--surface);border:1.5px solid var(--border);border-radius:12px;padding:16px 20px;margin-bottom:10px;display:flex;align-items:center;gap:14px;}
.doc-card:hover{border-color:var(--accent);}
.doc-num{font-family:monospace;font-size:.78rem;font-weight:700;color:var(--accent);background:var(--accent-soft);padding:3px 9px;border-radius:6px;white-space:nowrap;}
.doc-status{display:inline-block;padding:2px 10px;border-radius:99px;font-size:.65rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em;}
.st-brouillon{background:#f0f0f0;color:#888;}
.st-envoye{background:#dde8f2;color:#1a4a7a;}
.st-paye{background:#e0ede8;color:#2a6049;}
.st-annule{background:#fdecea;color:#c0392b;}
.tarif-row{display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border);}
.tarif-row:last-child{border-bottom:none;}

/* ── Recherche globale ── */
.sr-item{padding:10px 12px;border-radius:9px;border:1px solid var(--border);margin-bottom:7px;cursor:pointer;background:var(--bg);transition:border-color .15s;}
.sr-item:hover{border-color:var(--accent);}
.sr-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;}
.sr-name{font-weight:600;font-size:.88rem;margin-bottom:3px;}
.sr-meta{font-size:.7rem;color:var(--ink-soft);display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px;}
.sr-code{font-family:monospace;font-weight:700;color:var(--accent);background:var(--accent-soft);padding:1px 7px;border-radius:5px;letter-spacing:.08em;}
.sr-tasks-mini{display:flex;flex-wrap:wrap;gap:4px;}
.sr-task-chip{font-size:.64rem;padding:2px 7px;border-radius:4px;border:1px solid var(--border);}
</style>
</head>
<body>${bodyHTML}<div id="cab-picker-modal" style="display:none;"></div>
</body>
</html>`;
}

// Rendu de l'historique (archive + jobs en cours, filtres cabinet/statut/recherche)
function renderHistorique(){
  const searchFilter = (document.getElementById('hist-search').value||'').trim().toLowerCase();
  const cabFilter    = (document.getElementById('hist-cab')?.value)||'';
  const statusFilter = (document.getElementById('hist-status')?.value)||'';

  // Fusionner archive (terminés) + jobs en cours
  const archiveItems = archive.map(function(a){return Object.assign({},a,{_status:'termine'});});
  const jobItems     = jobs.map(function(j){
    const hasBlForJob=bdl.some(function(b){return b.jobId===j.id;});
    return Object.assign({},j,{_status:'encours',_livre:hasBlForJob,lastDate:j.createdAt});
  });
  const allItems     = archiveItems.concat(jobItems).sort(function(a,b){return new Date(b.lastDate||b.createdAt)-new Date(a.lastDate||a.createdAt);});

  const filtered = allItems.filter(function(a){
    const isLivre=a._livre||false;
    if(statusFilter==='livre'){if(!isLivre)return false;}
    else if(statusFilter && a._status!==statusFilter) return false;
    if(cabFilter && a.cabinet!==cabFilter) return false;
    if(searchFilter){
      const hay=(a.patient+' '+(a.note||'')+' '+(a.type||'')).toLowerCase();
      if(!hay.includes(searchFilter)) return false;
    }
    return true;
  });

  // Rafraîchir le select cabinet
  const cabSel=document.getElementById('hist-cab');
  if(cabSel){
    const cur=cabSel.value;
    cabSel.innerHTML='<option value="">Tous</option>'+cabinets.map(function(c){return '<option value="'+c.id+'"'+(c.id===cur?' selected':'')+'>'+c.name+'</option>';}).join('');
  }

  // KPIs
  const total=filtered.length;
  const enCours=filtered.filter(function(a){return a._status==='encours'&&!a._livre;}).length;
  const termines=filtered.filter(function(a){return a._status==='termine';}).length;
  const livres=filtered.filter(function(a){return a._livre;}).length;

  document.getElementById('hist-kpi').innerHTML=
    '<div class="kcard"><div class="kval">'+total+'</div><div class="klbl">'+t('kpi.total_jobs')+'</div></div>'+
    '<div class="kcard"><div class="kval" style="color:#2a6049;">'+termines+'</div><div class="klbl">'+t('kpi.completed')+'</div></div>'+
    '<div class="kcard"><div class="kval" style="color:#e67e22;">'+enCours+'</div><div class="klbl">'+t('kpi.in_progress')+'</div></div>';

  document.getElementById('hist-count').textContent=total;

  const tbody=document.getElementById('hist-tbody');
  if(!filtered.length){
    tbody.innerHTML='<tr><td colspan="6" style="text-align:center;padding:20px;color:#a09080;font-style:italic;">'+t('empty.jobs_found')+'</td></tr>';
    return;
  }
  const cab=function(id){return cabinets.find(function(c){return c.id===id;})||null;};
  tbody.innerHTML=filtered.map(function(a){
    const cabObj=cab(a.cabinet||'');
    const dateStr=a.lastDate?new Date(a.lastDate).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'}):'—';
    let statusBadge;
    if(a._livre){
      statusBadge='<span style="background:#dde8f2;color:#1a4a7a;padding:2px 8px;border-radius:99px;font-size:.68rem;font-weight:600;">📦 Livré</span>';
    } else if(a._status==='encours'){
      statusBadge='<span style="background:#fff3e0;color:#e67e22;padding:2px 8px;border-radius:99px;font-size:.68rem;font-weight:600;">En cours</span>';
    } else {
      statusBadge='<span style="background:#e8f5e9;color:#2a6049;padding:2px 8px;border-radius:99px;font-size:.68rem;font-weight:600;">Terminé</span>';
    }
    return '<tr style="cursor:pointer;" onclick="openJobDetail(\''+a.id+'\')">'+
      '<td style="font-weight:500;">'+(a.urgent?'🔴 ':'')+escHtml(a.patient)+'</td>'+
      '<td><span class="badge bg-type">'+escHtml(getJobTypeLabel(a))+'</span></td>'+
      '<td style="font-size:.76rem;">'+(cabObj?escHtml(cabObj.name):'—')+'</td>'+
      '<td style="font-size:.75rem;">'+dateStr+'</td>'+
      '<td style="font-size:.73rem;color:var(--ink-soft);font-style:italic;">'+(a.note?escHtml(a.note):'—')+'</td>'+
      '<td>'+statusBadge+'</td>'+
    '</tr>';
  }).join('');
}

/* ══════════════════════════════════════════
   §14 — CABINETS
   ══════════════════════════════════════════ */
// Crée un nouveau cabinet (génère identifiants portail automatiquement)
function addCabinet(name, color, phone, email){
  name=name.trim();
  if(!name){alert(t('alert.enter_name'));return;}
  if(cabinets.find(c=>c.name.toLowerCase()===name.toLowerCase())){alert(t('alert.cab_exists'));return;}
  const portalId='CAB-'+Math.random().toString(36).substr(2,8).toUpperCase();
  // Generate a simple 6-char code + random password
  const code=Math.random().toString(36).substr(2,6).toUpperCase();
  const pwd=Math.random().toString(36).substr(2,8);
  cabinets.push({id:String(Date.now()),name,color,phone:phone||'',email:email||'',portalId,code,pwd});
  saveCabinets();refreshCabSelects();renderCabList();renderCabJobs();
}

function delCabinet(id){
  if(!guardPerm('action:cabinet_delete','⛔ Seul un admin peut supprimer un cabinet.'))return;
  if(!confirm(t('confirm.delete_cab')))return;
  reportAudit({action:'cabinet_deleted',target:id});
  cabinets=cabinets.filter(c=>c.id!==id);
  saveCabinets();refreshCabSelects();renderCabList();renderCabJobs();
}

function refreshCabSelects(){if(typeof syncSaisieCab==='function')syncSaisieCab();

  const opts='<option value="">— Aucun —</option>'+cabinets.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
  const s=document.getElementById('icab');if(s)s.innerHTML=opts;
  const opts2='<option value="">'+t('opt.all_clinics')+'</option>'+cabinets.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
  const s2=document.getElementById('cab-filter-sel');if(s2)s2.innerHTML=opts2;
  // modal select
  const opts3='<option value="">— Aucun —</option>'+cabinets.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
  // sync modal if open
}

// Rendu de la liste des cabinets (KPIs BL non facturés, boutons actions)
function renderCabList(){
  const els=[document.getElementById('cab-list-main'),document.getElementById('cab-list-modal')];
  const html=cabinets.length
    ?cabinets.map(c=>`<div style="border:1px solid var(--border);border-radius:9px;margin-bottom:8px;overflow:hidden;">
        <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg);">
          <div style="width:14px;height:14px;border-radius:50%;background:${c.color};flex-shrink:0;"></div>
          <div style="flex:1;">
            <div style="font-size:.85rem;font-weight:500;">${c.name}</div>
            <div style="font-size:.68rem;color:var(--ink-soft);">${ti('cab.jobs_count',{n:jobs.filter(j=>j.cabinet===c.id).length})} · ${t('cab.code')} : <b style="font-family:monospace;">${c.code||'—'}</b></div>
            ${(()=>{const cabBdl=bdl.filter(b=>b.cabinet===c.id&&!b.invoiced);const total=cabBdl.reduce((s,b)=>s+(b.total||0),0);return cabBdl.length?'<div style="font-size:.68rem;margin-top:2px;"><span style="color:#5a3472;font-weight:600;">'+ti('cab.bl_uninvoiced',{n:cabBdl.length})+'</span> · <span style="color:#c8410a;font-weight:700;">'+total.toFixed(2).replace('.',',')+'\u00a0€</span> '+t('cab.pending')+'</div>':''})()}
          </div>
          <button onclick="showCabPortalInfo('${c.id}')" style="background:#5a3472;color:#fff;border:none;border-radius:5px;padding:4px 9px;font-family:monospace;font-size:.65rem;cursor:pointer;">${t('btn.credentials')}</button>
          <button onclick="resetCabPassword('${c.id}')" style="background:#8b4513;color:#fff;border:none;border-radius:5px;padding:4px 9px;font-family:monospace;font-size:.65rem;cursor:pointer;">${t('btn.new_pwd')}</button>
          <button onclick="genFactureMensuelle('${c.id}')" style="background:var(--accent);color:#fff;border:none;border-radius:5px;padding:4px 9px;font-family:monospace;font-size:.65rem;cursor:pointer;">${t('btn.invoice_month')}</button>
          <button onclick="openChatModal('${c.id}')" style="background:#1a6a6a;color:#fff;border:none;border-radius:5px;padding:4px 9px;font-family:monospace;font-size:.65rem;cursor:pointer;position:relative;" id="chat-btn-${c.id}">💬 Chat<span id="chat-badge-${c.id}" style="display:none;position:absolute;top:-5px;right:-5px;background:#e53935;color:#fff;border-radius:50%;width:16px;height:16px;font-size:.58rem;font-weight:700;align-items:center;justify-content:center;">!</span></button>
          <button class="btn-del cab-del-btn" data-cid="${c.id}">✕</button>
        </div>
      </div>`).join('')
    :'<div class="empty">'+t('empty.cabinets')+'</div>';
  els.forEach(el=>{if(el)el.innerHTML=html;});
}

function renderCabJobs(){
  const el=document.getElementById('cab-jobs-list');if(!el)return;
  const filterId=document.getElementById('cab-filter-sel').value;
  const filtered=filterId?jobs.filter(j=>j.cabinet===filterId):jobs;
  if(!filtered.length){el.innerHTML='<div class="empty">'+t('empty.jobs')+'</div>';return;}
  // Group by cabinet
  const byCab={};
  filtered.forEach(j=>{
    const key=j.cabinet||'__none__';
    if(!byCab[key])byCab[key]=[];byCab[key].push(j);
  });
  el.innerHTML=Object.keys(byCab).map(cid=>{
    const cab=cabinets.find(c=>c.id===cid);
    const label=cab?cab.name:t('cab.no_cab');
    const color=cab?cab.color:'#999';
    const list=byCab[cid];
    return `<div style="margin-bottom:18px;">
      <div style="font-family:serif;font-size:.95rem;color:${color};border-bottom:2px solid ${color};padding-bottom:4px;margin-bottom:8px;display:flex;justify-content:space-between;">
        ${label}<span style="font-family:monospace;font-size:.68rem;color:var(--ink-soft);">${ti('cab.jobs_count',{n:list.length})}</span>
      </div>
      ${list.map(j=>`<div style="display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:6px;margin-bottom:4px;background:${color}18;border-left:4px solid ${color};">
        <div style="flex:1;font-weight:500;font-size:.8rem;">${j.urgent?'🔴 ':''}${j.patient}</div>
        <span class="badge bg-type">${getJobTypeLabel(j)}</span>
        <div style="font-size:.72rem;color:var(--ink-soft);">${j.tasks.map(t=>getTech(t.tech).label).filter((v,i,a)=>a.indexOf(v)===i).join(', ')}</div>
      </div>`).join('')}
    </div>`;
  }).join('');
}

// Also show cabinet badge in job cards and table
function getCabLabel(cabId){
  if(!cabId)return'';
  const c=cabinets.find(x=>x.id===cabId);
  return c?`<span style="display:inline-block;padding:1px 7px;border-radius:99px;font-size:.6rem;font-weight:500;background:${c.color}22;color:${c.color};border:1px solid ${c.color}44;">${c.name}</span>`:'';
}

/* ══════════════════════════════════════════
   §15 — JOBS TABLE & QR CODE
   ══════════════════════════════════════════ */
function showQR(id){
  const job=jobs.find(j=>String(j.id)===String(id));
  if(!job)return;

  // Contenu compact pour le QR
  const lines=[
    job.patient,
    getJobTypeLabel(job),
    ...job.tasks.map(t=>getTech(t.tech).label+': '+fmtS(t.dueDate)),
  ];
  if(job.note)lines.push('Note: '+job.note);
  const qrText=lines.join(' | ');

  document.getElementById('qr-patient-name').textContent=job.patient;
  document.getElementById('qr-work-type').textContent=getJobTypeLabel(job)+(job.urgent?' 🔴 URGENT':'');

  // Utilise l'API QR de GoQR (simple image URL, pas de lib JS)
  const encoded=encodeURIComponent(qrText);
  const url=`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}&bgcolor=fffdf8&color=1a1612&margin=10`;

  const div=document.getElementById('qr-code-div');
  div.innerHTML=`<img src="${url}" width="200" height="200" alt="QR Code" style="border-radius:8px;" onerror="this.parentNode.innerHTML='<div style=padding:20px;font-size:.8rem;color:var(--ink-soft);>'+t('misc.qr_unavailable')+'</div>'"/>`;

  document.getElementById('qr-modal').style.display='flex';
}

// — Fonctions d'impression overlay et popup
function printNow(){
  window.print();
}
function closePrintOverlay(){
  var overlay=document.getElementById('print-overlay');
  if(overlay){
    overlay.style.display='none';
    overlay.style.zIndex='2000';
  }
  var content=document.getElementById('print-content');
  if(content)content.innerHTML='';
}
function doPrint(){
  if(!printHTML){alert(t('alert.generate_first'));return;}
  const html=buildExportHTML();
  if(!html)return;
  const w=window.open('','_blank');
  if(!w){alert(t('alert.allow_popups'));return;}
  w.document.open();
  w.document.write(html+'<script>window.onload=function(){window.print();}<\/script>');
  w.document.close();
}

/* ══════════════════════════════════════════
   §16 — EVENTS
   ══════════════════════════════════════════ */
document.addEventListener('click',function(e){
  const gls=e.target.closest('[data-gen-lab-sheet]');
  if(gls&&gls.dataset.genLabSheet){saveGeneratedLabSheet(gls.dataset.genLabSheet);return;}
  const rc=e.target.closest('[data-removeconge]');
  if(rc){removeConge(rc.dataset.removeconge);return;}
  const ra=e.target.closest('[data-removeabstech]');
  if(ra){removeAbsence(ra.dataset.removeabstech,ra.dataset.removeabsdate);return;}
  const deltech=e.target.closest('[data-deltech]');
  if(deltech){const k=deltech.dataset.deltech;if(TECHS[k]&&confirm('Supprimer '+TECHS[k].label+' ?')){delete TECHS[k];saveTechs();render();renderEquipe();refreshTechSelects();}return;}
  const qAutoBtn=e.target.closest('.btn-q-auto[data-qid]');
  if(qAutoBtn){programQueueAuto(qAutoBtn.dataset.qid);return;}
  const qManualBtn=e.target.closest('.btn-q-manual[data-qid]');
  if(qManualBtn){openManualModal(qManualBtn.dataset.qid);return;}
  const qDelBtn=e.target.closest('.btn-q-del[data-qid]');
  if(qDelBtn){removeFromQueue(qDelBtn.dataset.qid);return;}
  const copyBtn=e.target.closest('[data-copylink]');
  if(copyBtn){const link=copyBtn.dataset.link;navigator.clipboard.writeText(link).then(()=>{copyBtn.textContent=t('toast.copied');setTimeout(()=>copyBtn.textContent=t('toast.copy'),1500)});return;}
  const card=e.target.closest('.tcard[data-jid]');
  if(card){openTaskModal(card.dataset.jid,parseInt(card.dataset.tidx));return;}
  const btn=e.target.closest('button')||e.target;
  const bid=btn.id||'';
  const bcl=btn.classList;

  // Sélecteur de mode (Laboratoire / Facturation / Messages)
  if(bcl.contains('mode-btn')){
    const mode=btn.dataset.mode;if(!mode)return;
    document.querySelectorAll('.mode-btn').forEach(x=>x.classList.toggle('on',x.dataset.mode===mode));
    if(mode==='messages'){
      document.querySelectorAll('.pane').forEach(function(p){p.classList.remove('on');});
      document.getElementById('pane-messages').classList.add('on');
      renderMessagesPane();
      if(_isNarrowLayout())closeDrawer();
      return;
    }
    // Pour Labo/Facturation : activer le premier onglet du mode (ouvre le pane par défaut)
    const firstTab=document.querySelector('#tabs-'+(mode==='labo'?'labo':'fact')+' .tab');
    if(firstTab)firstTab.click();
    return;
  }

  // Onglets
  if(bcl.contains('tab')){
    const pane=btn.dataset.pane;if(!pane)return;
    if(!canAccessPane(pane)){
      showToast('⛔ Vous n\'avez pas accès à cet onglet.','#c0392b',3200);
      reportAudit({action:'permission_denied',target:'pane:'+pane});
      return;
    }
    // Auto-détecter le mode parent depuis le conteneur de tabs
    const tabsContainer=btn.closest('#tabs-labo, #tabs-fact');
    if(tabsContainer){
      const newMode=tabsContainer.id==='tabs-labo'?'labo':'fact';
      document.querySelectorAll('.mode-btn').forEach(x=>x.classList.toggle('on',x.dataset.mode===newMode));
    }
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('on'));
    document.querySelectorAll('.pane').forEach(x=>x.classList.remove('on'));
    btn.classList.add('on');
    const el=document.getElementById('pane-'+pane);if(el)el.classList.add('on');
    if(_isNarrowLayout())closeDrawer();
    if(pane==='dashboard')renderDashboard();
    if(pane==='calendrier')renderCal();
    if(pane==='scan'){renderSyns();renderScanHist();}
    if(pane==='stats')renderStats();
    if(pane==='historique')renderHistorique();
    if(pane==='cabinets'){refreshCabSelects();renderCabList();renderCabJobs();}
    if(pane==='saisie'){syncSaisieCab();renderQueueSaisie();loadAndRenderPendingOrders();}
    if(pane==='livraisons'){renderLivraisons();syncLivrFilterCab();}
    if(pane==='suivi'){renderSuiviAll();}
    if(pane==='attente'){renderWaiting();}
    if(pane==='equipe'){renderEquipe();refreshTechSelects();}
    if(pane==='commandes'){renderBdcList();renderFournList();syncBdcFourn();}
    if(pane==='facturation'){renderToInvoice();renderToInvoice();renderBillDocs();updateBillStats();renderTarifs();syncBillCab();renderTarifTypeSel();}
    if(pane==='parametres'){
      resetSettingsView();
      applySettingsHubVisibility();
      const n=localStorage.getItem('lb_name');if(n){var lni=document.getElementById('labo-name-input');if(lni)lni.value=n;}
      const rs=document.getElementById('user-role-select');if(rs)rs.value=_userRole;
      renderSubInfo();
      updateSuiviToggleUI();
      // Load legal fields
      const lf=['raison','siret','adresse','tel','email','directeur','ce_num'];
      lf.forEach(function(k){
        const el=document.getElementById('legal-'+k.replace('_','-'));
        if(el){const v=localStorage.getItem('lb_legal_'+k);if(v)el.value=v;}
      });
      renderCongesList();renderAbsList();
      refreshTechSelects();
      loadStripeKeyUI();
      updateProgToggleUI();
      updateSuiviToggleUI();
      renderCustomTypesList();
    }
    reportAudit({action:'open_pane',target:pane});
  }
  // Calendrier vue
  if(bcl.contains('cal-vbtn')){
    calView=btn.dataset.view;
    document.querySelectorAll('.cal-vbtn').forEach(x=>x.classList.toggle('on',x.dataset.view===calView));
    document.getElementById('cal-week').style.display=calView==='week'?'block':'none';
    document.getElementById('cal-month').style.display=calView==='month'?'block':'none';
    renderCal();
  }
  if(bid==='cal-prev'){calView==='week'?calCursor.setDate(calCursor.getDate()-7):calCursor.setMonth(calCursor.getMonth()-1);renderCal();}
  if(bid==='cal-next'){calView==='week'?calCursor.setDate(calCursor.getDate()+7):calCursor.setMonth(calCursor.getMonth()+1);renderCal();}
  // Travaux
  if(bid==='btn-add')addJob();
  if(bid==='btn-saisie-add'){if(isProgActif())addToQueue();else addDirect();}
  if(bid==='btn-tm-close')closeTaskModal();
  if(bid==='btn-tm-delete')deleteTask();
  if(bcl.contains('btn-del'))delJob(btn.dataset.id);
  if(bid==='btn-clearall'||bid==='btn-clearall-prog')clearAll();
  if(bcl.contains('btn-qr'))showQR(btn.dataset.id);
  if(bid==='btn-qr-close')document.getElementById('qr-modal').style.display='none';
  if(bid==='btn-hist-filter')renderHistorique();
  // Cabinets
  if(bid==='btn-cab-save'){
    addCabinet(
      document.getElementById('cab-name').value,
      document.getElementById('cab-color').value,
      document.getElementById('cab-phone')?.value||'',
      document.getElementById('cab-email')?.value||''
    );
    document.getElementById('cab-name').value='';
    if(document.getElementById('cab-phone'))document.getElementById('cab-phone').value='';
    if(document.getElementById('cab-email'))document.getElementById('cab-email').value='';
  }
  if(bid==='btn-cab-add-new'){addCabinet(document.getElementById('cab-new-name').value,document.getElementById('cab-new-color').value);document.getElementById('cab-new-name').value='';}
  if(bid==='btn-cab-mgr'){document.getElementById('cab-modal').style.display='flex';renderCabList();}
  if(bid==='btn-cab-close'){document.getElementById('cab-modal').style.display='none';}
  if(bcl.contains('cab-del-btn'))delCabinet(btn.dataset.cid);
  if(bid==='btn-hist-clear-arch'){if(confirm(t('confirm.clear_history'))){archive=[];saveArchive();renderHistorique();}}
  // Impression
  if(bid==='btn-gen')genPrint();
  if(bid==='btn-print-do')printNow();
  if(bid==='btn-print-close')closePrintOverlay();
  if(bid==='btn-export')doExport();
  if(bid==='btn-print')doPrint();
  // Scan
  if(bid==='btn-scan-go')processScan();
  if(bid==='btn-scan-test'){document.getElementById('scan-in').value='Martin Dupont | couronne zircone x2, inlay composite';processScan();}
  if(bid==='btn-scan-ok')confirmScan();
  if(bid==='btn-scan-cancel'){document.getElementById('scan-result-card').style.display='none';pending=[];}
  if(bid==='btn-sv-search'){const code=document.getElementById('sv-search-in').value.trim().toUpperCase();const res=document.getElementById('sv-result-area');if(!code)return;const job=jobs.find(j=>j.trackCode&&j.trackCode.toUpperCase()===code);renderSuiviResult(job||null,res);}
  // Synonymes
  if(bid==='btn-syn-add')addSyn();
  if(bcl.contains('syn-del')){delete syns[btn.dataset.syn];saveSyns();renderSyns();}
});

document.addEventListener('change',function(e){
  if(e.target.id==='tm-done')applyTaskDone();
  if(e.target.id==='it'){
    const show=EMP_TYPES.includes(e.target.value);
    const ew=document.getElementById('emp-wrap');
    if(ew)ew.style.display=show?'flex':'none';
    const iemp=document.getElementById('iemp');
    if(!show&&iemp)iemp.checked=false;
  }
  if(e.target.id==='pt'){
    document.getElementById('pp-wrap').style.display=e.target.value==='person'?'block':'none';
    document.getElementById('pd-wrap').style.display=e.target.value==='day'?'block':'none';
    document.getElementById('btn-export').style.display='none';
    document.getElementById('btn-print').style.display='none';
    document.getElementById('export-text-area').style.display='none';
    document.getElementById('export-frame-wrap').style.display='none';
    document.getElementById('export-copy-msg').textContent='';
    document.getElementById('preview-area').innerHTML='';
    printHTML='';
  }
});

document.getElementById('saisie-ip').addEventListener('keydown',function(e){if(e.key==='Enter'){if(isProgActif())addToQueue();else addDirect();}});
var _reqDel=document.getElementById('saisie-ireq-delivery');if(_reqDel)_reqDel.addEventListener('change',onSaisieRequestedDateChange);
document.getElementById('scan-in').addEventListener('keydown',e=>{if(e.key==='Enter')processScan();});
document.addEventListener('keydown',function(e){const sv=document.getElementById('sv-search-in');if(e.key==='Enter'&&document.activeElement===sv){const code=sv.value.trim().toUpperCase();const res=document.getElementById('sv-result-area');if(code){const job=jobs.find(j=>j.trackCode&&j.trackCode.toUpperCase()===code);renderSuiviResult(job||null,res);}}});
document.getElementById('hist-search').addEventListener('input',renderHistorique);
document.getElementById('cab-filter-sel').addEventListener('change',renderCabJobs);
document.getElementById('hist-cab').addEventListener('change',renderHistorique);
document.getElementById('hist-status').addEventListener('change',renderHistorique);


/* ══════════════════════════════════════════
   §17 — WAITING LIST & ABSENCES & CONGÉS
   ══════════════════════════════════════════ */
let waiting = JSON.parse(localStorage.getItem('lb_waiting')||'[]');
let conges  = JSON.parse(localStorage.getItem('lb_conges')||'[]');
let absences= JSON.parse(localStorage.getItem('lb_absences')||'{}');
// Compat legacy: certains builds/anciens scripts référencent "contges" par erreur.
// On garde un alias pour éviter de bloquer tout le chargement sur un ReferenceError.
var contges = conges;
function saveWaiting(){localStorage.setItem('lb_waiting',JSON.stringify(waiting));scheduleSave();}
function saveConges(){contges=conges;localStorage.setItem('lb_conges',JSON.stringify(conges));scheduleSave();}
function saveAbsences(){localStorage.setItem('lb_absences',JSON.stringify(absences));scheduleSave();}

const SITE_URL='https://labosync.app';
const SB_URL='https://ljnfpslgwgagdisixuxz.supabase.co';
const SB_KEY='sb_publishable_vUJCiePex3KYK5CS3SezGw_60mzxHa8';
const SB_ROW='main'; // ID de la ligne unique dans labo_data

/* ══════════════════════════════════════════
   §18 — TASK MODAL & TRACK CODE
   ══════════════════════════════════════════ */
function genTrackCode(){
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code='';for(let i=0;i<6;i++)code+=chars[Math.floor(Math.random()*chars.length)];
  return code;
}

// addWD variant prenant en compte les congés
function addWDC(d,n){
  const r=new Date(d);let a=0;
  while(a<n){r.setDate(r.getDate()+1);const iso=fmtISO(r);if(r.getDay()!==0&&r.getDay()!==6&&!conges.includes(iso))a++;}
  return r;
}

// — Modale de réassignation / modification d'une tâche
let tmJobId=null,tmTaskIdx=null;

// Ouvre la modale de détail/modification d'une tâche
function openTaskModal(jobId,taskIdx){
  const job=jobs.find(j=>String(j.id)===String(jobId));if(!job)return;
  const task=job.tasks[taskIdx];
  tmJobId=jobId;tmTaskIdx=taskIdx;
  document.getElementById('tm-patient').textContent=job.patient;
  document.getElementById('tm-type').textContent=getJobTypeLabel(job);
  document.getElementById('tm-label').textContent=task.label+(task.comment?' · 💬 '+task.comment:'');
  document.getElementById('tm-date').value=fmtISO(task.dueDate);
  document.getElementById('tm-done').checked=!!task.done;
  document.getElementById('tm-comment').value=task.comment||'';
  const list=document.getElementById('tm-tech-list');
  list.innerHTML=Object.keys(TECHS).map(t=>`
    <button onclick="applyTaskTech('${t}')" style="display:flex;align-items:center;gap:6px;padding:6px 11px;border-radius:7px;border:2px solid ${t===task.tech?TECHS[t].color:'var(--border)'};background:${t===task.tech?TECHS[t].soft:'var(--bg)'};cursor:pointer;font-family:monospace;font-size:.74rem;">
      <div style="width:10px;height:10px;border-radius:50%;background:${TECHS[t].color};flex-shrink:0;"></div>${TECHS[t].label}
    </button>`).join('');
  document.getElementById('task-modal').style.display='flex';
}
function closeTaskModal(){document.getElementById('task-modal').style.display='none';tmJobId=null;tmTaskIdx=null;}
function applyTaskTech(tech){const job=jobs.find(j=>String(j.id)===String(tmJobId));if(!job)return;job.tasks[tmTaskIdx].tech=tech;saveJobs();render();openTaskModal(tmJobId,tmTaskIdx);}
function applyTaskDate(){const job=jobs.find(j=>String(j.id)===String(tmJobId));if(!job)return;const v=document.getElementById('tm-date').value;if(!v)return;job.tasks[tmTaskIdx].dueDate=new Date(v+'T12:00:00').toISOString();saveJobs();render();closeTaskModal();}
function applyTaskDone(){
  const job=jobs.find(j=>String(j.id)===String(tmJobId));if(!job)return;
  job.tasks[tmTaskIdx].done=document.getElementById('tm-done').checked;saveJobs();render();
  if(isSuiviActif()&&job.cabinet)autoPublishCab(job.cabinet);
}
function applyTaskComment(){const job=jobs.find(j=>String(j.id)===String(tmJobId));if(!job)return;job.tasks[tmTaskIdx].comment=document.getElementById('tm-comment').value.trim();saveJobs();render();closeTaskModal();}
function deleteTask(){const job=jobs.find(j=>String(j.id)===String(tmJobId));if(!job)return;const lbl=job.tasks[tmTaskIdx]?.label||'cette tâche';if(!confirm('Supprimer "'+lbl+'" ?'))return;job.tasks.splice(tmTaskIdx,1);if(!job.tasks.length)jobs=jobs.filter(j=>String(j.id)!==String(tmJobId));saveJobs();render();closeTaskModal();}
function shiftJob(days){const job=jobs.find(j=>String(j.id)===String(tmJobId));if(!job)return;job.tasks.forEach(t=>{const d=new Date(t.dueDate);let rem=Math.abs(days);const dir=days>0?1:-1;while(rem>0){d.setDate(d.getDate()+dir);const iso=fmtISO(d);if(d.getDay()!==0&&d.getDay()!==6&&!conges.includes(iso))rem--;}t.dueDate=d.toISOString();});saveJobs();render();closeTaskModal();}

/* ══════════════════════════════════════════
   §19 — WAITING LIST
   ══════════════════════════════════════════ */
// Déplace un job de la liste active vers la liste d'attente de pièce
function holdJob(id){
  const job=jobs.find(j=>j.id===id);if(!job)return;
  const note=prompt('Quelle pièce est attendue ? (optionnel)','');if(note===null)return;
  waiting.push({id:job.id,patient:job.patient,type:job.type,nb:job.nb||1,note:job.note||'',pieceNote:note.trim(),urgent:job.urgent||false,cabinet:job.cabinet||'',trackCode:job.trackCode||genTrackCode(),heldAt:new Date().toISOString()});
  jobs=jobs.filter(j=>j.id!==id);saveJobs();saveWaiting();updateWaitingBadge();render();
  document.getElementById('search-results').style.display='none';
  document.getElementById('global-search').value='';
  alert(t('toast.waiting'));
}
function updateWaitingBadge(){
  const b=document.getElementById('attente-badge');
  if(b){b.style.display=waiting.length?'inline':'none';b.textContent=waiting.length;}
}
// Rendu de la liste d'attente (pièces manquantes, options reprogrammation)
function renderWaiting(){
  const el=document.getElementById('waiting-list');if(!el)return;
  updateWaitingBadge();
  if(!waiting.length){el.innerHTML='<div style="text-align:center;padding:40px;color:var(--ink-soft);">'+t('empty.queue')+'</div>';return;}
  el.innerHTML=waiting.map(w=>{
    const heldDate=new Date(w.heldAt).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
    return '<div class="wait-item">'+
      '<div class="wait-patient">'+(w.urgent?'🔴 ':'')+w.patient+'</div>'+
      '<div class="wait-type">'+(TYPE_LABELS[w.type]||w.type)+'</div>'+
      '<div class="wait-since">⏸ Depuis le '+heldDate+'</div>'+
      (w.pieceNote?'<div class="wait-note">🔩 Pièce attendue : <strong>'+w.pieceNote+'</strong></div>':'')+
      '<div class="wait-actions">'+
        '<button class="btn-reprogram" onclick="reprogramJob(\''+w.id+'\')">▶ Reprogrammer</button>'+
        '<button class="btn-del-wait" onclick="deleteWaiting(\''+w.id+'\')">🗑️ Supprimer</button>'+
      '</div>'+
    '</div>';
  }).join('');
}
function reprogramJob(id){
  const w=waiting.find(x=>x.id===id);if(!w)return;
  const tasks=buildTasks(w.type,false,null,false,new Date(),false);
  if(!tasks.length){alert(t('alert.unknown_type'));return;}
  const reprogJob={id:String(Date.now()),patient:w.patient,type:w.type,tasks,nb:w.nb||1,urgent:w.urgent||false,note:w.note||'',cabinet:w.cabinet||'',createdAt:new Date().toISOString(),trackCode:w.trackCode||genTrackCode()};
  jobs.push(reprogJob);
  waiting=waiting.filter(x=>x.id!==id);saveJobs();saveWaiting();updateWaitingBadge();render();renderWaiting();
  autoPublishCab(reprogJob.cabinet);
  alert(t('toast.reprogrammed'));
}
function deleteWaiting(id){if(!confirm('Supprimer ?'))return;waiting=waiting.filter(x=>x.id!==id);saveWaiting();renderWaiting();updateWaitingBadge();}

/* ══════════════════════════════════════════
   §20 — SUIVI (PORTAL)
   ══════════════════════════════════════════ */
async function publishJob(job){
  const {tasks,doneCount,pct}=getJobProgress(job);
  const payload={
    trackCode:job.trackCode,
    patient:job.patient,
    type:job.type,
    note:job.note||'',
    urgent:job.urgent||false,
    deliveryDate:_jobLabDeliveryDate(job)||null,labDeliverySlot:job.labDeliverySlot||'12',requestedDeliveryDate:_jobRequestedDeliveryDate(job)||null,
    readyToDeliver:job.readyToDeliver||false,
    waitingForPart:false,
    tasks:tasks.map((t,i)=>({label:t.label,tech:t.tech,dueDate:t.dueDate,done:i<doneCount})),
    pct,
    publishedAt:new Date().toISOString()
  };
  const rowId='suivi_'+(job.trackCode||job.id);
  // Try PATCH first, then POST if not found
  const r=await fetch(SB_URL+'/rest/v1/labo_data?id=eq.'+rowId,{
    method:'PATCH',
    headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Prefer':'return=minimal'},
    body:JSON.stringify({data:payload,updated_at:new Date().toISOString()})
  });
  if(r.status===404||!r.ok){
    await fetch(SB_URL+'/rest/v1/labo_data',{
      method:'POST',
      headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Prefer':'return=minimal'},
      body:JSON.stringify({id:rowId,data:payload,updated_at:new Date().toISOString()})
    });
  }
  return rowId;
}
function getJobProgress(job){
  const tasks=[...job.tasks].sort((a,b)=>new Date(a.dueDate)-new Date(b.dueDate));
  let doneCount=0,activeIdx=-1;
  tasks.forEach((t,i)=>{
    if(t.done)doneCount++;
    else if(activeIdx===-1)activeIdx=i;
  });
  return{tasks,doneCount,activeIdx,pct:tasks.length?Math.round(doneCount/tasks.length*100):0};
}
function renderSuiviAll(){
  const el=document.getElementById('sv-all-area');if(!el)return;
  if(!jobs.length){el.innerHTML='<div style="font-size:.76rem;color:var(--ink-soft);font-style:italic;">'+t('empty.suivi')+'</div>';return;}
  el.innerHTML=jobs.map(job=>{
    const {pct}=getJobProgress(job);
    const icon=pct===100?'✅':pct>0?'🔧':'🕐';
    return '<div class="sv-all-item" style="cursor:pointer;" onclick="showSuiviDetail(\''+job.id+'\')">'+
      '<div style="font-size:1.1rem;">'+icon+'</div>'+
      '<div style="flex:1;">'+
        '<div style="font-weight:500;font-size:.86rem;">'+(job.urgent?'🔴 ':'')+job.patient+'</div>'+
        '<div style="font-size:.68rem;color:var(--ink-soft);">'+getJobTypeLabel(job)+' · Code : <strong>'+(job.trackCode||'—')+'</strong></div>'+
        (job.binId?'<div style="font-size:.65rem;color:#2a6049;">🔗 Lien actif</div>':'')+
      '</div>'+
      '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:5px;">'+
        '<span style="font-family:serif;font-size:1rem;color:var(--accent);">'+pct+'%</span>'+
        '<button onclick="event.stopPropagation();shareJob(\''+job.id+'\',this)" style="background:'+(job.binId?'#2a6049':'var(--accent)')+';color:#fff;border:none;border-radius:6px;padding:4px 10px;font-family:monospace;font-size:.65rem;cursor:pointer;">'+(job.binId?t('btn.update'):t('btn.share'))+'</button>'+
      '</div>'+
    '</div>';
  }).join('');
}
function showSuiviDetail(jobId){
  const job=jobs.find(j=>j.id===jobId);if(!job)return;
  const inp=document.getElementById('sv-search-in');if(inp)inp.value=job.trackCode||'';
  const res=document.getElementById('sv-result-area');if(res)renderSuiviResult(job,res);
}
function renderSuiviResult(job,container){
  if(!job){container.innerHTML='<div style="color:var(--ink-soft);font-size:.8rem;">Introuvable.</div>';return;}
  const {tasks,doneCount,activeIdx,pct}=getJobProgress(job);
  const done=pct===100;
  const stepsHTML=tasks.map((t,i)=>{
    const tdone=i<doneCount,tactive=i===activeIdx;
    const cls=tdone?'done':tactive?'active':'wait';
    return '<div class="sv-step"><div class="sv-dot '+cls+'">'+(tdone?'✓':tactive?'▶':'○')+'</div>'+
      '<div><div class="sv-step-lbl '+cls+'">'+t.label+'</div>'+
      '<div class="sv-step-meta">'+(TECHS[t.tech]?TECHS[t.tech].label:t.tech)+' · '+fmtS(t.dueDate)+'</div></div></div>';
  }).join('');
  const statusMsg=done?'✅ Prêt à livrer':activeIdx===-1&&doneCount===0?'🕐 En attente':'🔧 En fabrication';
  container.innerHTML='<div style="background:var(--surface);border:2px solid var(--accent);border-radius:12px;padding:18px 20px;">'+
    '<div style="font-family:serif;font-size:1.1rem;margin-bottom:4px;">'+(job.urgent?'🔴 ':'')+job.patient+'</div>'+
    '<div style="font-size:.72rem;color:var(--ink-soft);margin-bottom:12px;">'+getJobTypeLabel(job)+'</div>'+
    '<div style="font-weight:500;font-size:.82rem;margin-bottom:6px;">'+statusMsg+'</div>'+
    '<div class="sv-progress-bar"><div class="sv-progress-fill" style="width:'+pct+'%;"></div></div>'+
    stepsHTML+
  '</div>';
}
async function shareJob(jobId,btn){
  const job=jobs.find(j=>j.id===jobId);if(!job)return;
  const orig=btn.textContent;btn.textContent='⏳';btn.disabled=true;
  try{
    const rowId=await publishJob(job);
    if(rowId){
      job.binId=rowId;saveJobs();
      const link=SITE_URL+'/suivi.html?id='+rowId;
      const cab=job.cabinet?cabinets.find(c=>c.id===job.cabinet):null;
      const msg='Bonjour,\nLien de suivi pour '+job.patient+' ('+getJobTypeLabel(job)+') :\n'+link;
      btn.textContent=t('btn.update');btn.style.background='#2a6049';btn.disabled=false;

      // Find or create send row — look at parent container
      const container=btn.closest('.sv-all-item')||btn.parentElement?.parentElement;
      if(!container)return;
      container.style.flexWrap='wrap';
      let sr=container.querySelector('.sv-send-row');
      if(!sr){
        sr=document.createElement('div');
        sr.className='sv-send-row';
        sr.style.cssText='width:100%;display:flex;gap:8px;flex-wrap:wrap;padding:8px 0 2px;border-top:1px dashed var(--border);margin-top:8px;';
        container.appendChild(sr);
      }
      const phone=(cab?.phone||'').replace(/\s/g,'');
      const smsHref=phone?((navigator.userAgent.includes('iPhone')||navigator.userAgent.includes('iPad'))
        ?'sms:'+phone+'&body='+encodeURIComponent(msg)
        :'sms:'+phone+'?body='+encodeURIComponent(msg)):'';
      sr.innerHTML=
        (cab?.phone?'<a href="'+smsHref+'" style="display:inline-flex;align-items:center;gap:4px;background:#2a6049;color:#fff;border-radius:6px;padding:7px 12px;font-family:monospace;font-size:.7rem;text-decoration:none;">📱 SMS</a>':'')+
        (cab?.email?'<a href="mailto:'+cab.email+'?subject='+encodeURIComponent('Suivi — '+job.patient)+'&body='+encodeURIComponent(msg)+'" style="display:inline-flex;align-items:center;gap:4px;background:#1a4a7a;color:#fff;border-radius:6px;padding:7px 12px;font-family:monospace;font-size:.7rem;text-decoration:none;">📧 Email</a>':'')+
        '<a href="https://wa.me/?text='+encodeURIComponent(msg)+'" target="_blank" style="display:inline-flex;align-items:center;gap:4px;background:#25D366;color:#fff;border-radius:6px;padding:7px 12px;font-family:monospace;font-size:.7rem;text-decoration:none;">💬 WhatsApp</a>'+
        '<button data-copylink data-link="'+link+'" style="background:none;border:1.5px solid var(--border);border-radius:6px;padding:7px 12px;font-family:monospace;font-size:.7rem;cursor:pointer;color:var(--ink-soft);">📋 Copier</button>';
      renderSuiviAll();
    }
  }catch(e){
    console.error('shareJob error',e);
    btn.textContent='❌';
    setTimeout(()=>{btn.textContent=orig;btn.disabled=false;},2000);
  }
}

/* ══════════════════════════════════════════
   §21 — ÉQUIPE & TYPES PERSONNALISÉS
   ══════════════════════════════════════════ */
function updateTechColor(el){const k=el.dataset.techkey;if(TECHS[k]){TECHS[k].color=el.value;saveTechs();render();}}
function renderEquipe(){
  const el=document.getElementById('eq-list');if(!el)return;
  if(!Object.keys(TECHS).length){el.innerHTML='<div class="empty">'+t('empty.techs')+'</div>';return;}
  el.innerHTML=Object.keys(TECHS).map(k=>{
    const t=TECHS[k];const ini=t.label.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
    return '<div class="team-card">'+
      '<div style="width:36px;height:36px;border-radius:50%;background:'+t.color+';display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:.85rem;flex-shrink:0;">'+ini+'</div>'+
      '<div style="flex:1;"><div style="font-weight:500;font-size:.88rem;">'+t.label+'</div></div>'+
      '<input type="color" value="'+t.color+'" onchange="updateTechColor(this)" data-techkey="'+k+'" style="width:30px;height:30px;border:1px solid var(--border);border-radius:5px;cursor:pointer;padding:1px;"/>'+
      '<button data-deltech="'+k+'" style="background:none;border:none;cursor:pointer;color:#c0a090;font-size:.9rem;">✕</button>'+
    '</div>';
  }).join('');
}
document.getElementById('btn-eq-add').addEventListener('click',()=>{
  const name=document.getElementById('eq-name').value.trim();
  const role=document.getElementById('eq-role').value.trim()||'Technicien';
  const color=document.getElementById('eq-color').value;
  if(!name){alert(t('alert.enter_firstname'));return;}
  const key=name.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,10)||String(Date.now());
  if(TECHS[key]){alert(t('alert.tech_exists'));return;}
  const hex=color.replace('#','');
  const r=parseInt(hex.slice(0,2),16),g=parseInt(hex.slice(2,4),16),b=parseInt(hex.slice(4,6),16);
  TECHS[key]={label:name,color,soft:'rgba('+r+','+g+','+b+',.15)'};
  saveTechs();render();renderEquipe();refreshTechSelects();
  document.getElementById('eq-name').value='';document.getElementById('eq-role').value='';
});

// — Gestion UI des types personnalisés (liste, formulaire, étapes)
let _ctSteps=[]; // étapes standard en cours d'édition
let _ctSupportsEmp=false; // ce type a un workflow empreinte numérique distinct
let _ctStepsEmp=[]; // étapes pour le workflow empreinte numérique
let _ctEditId=null; // id du type en cours de modification (null = création)

function renderCustomTypesList(){
  const el=document.getElementById('ct-list');if(!el)return;
  if(!customTypes.length){
    el.innerHTML='<div style="font-size:.78rem;color:var(--ink-soft);font-style:italic;padding:6px 0;">'+t('empty.types')+'</div>';
    return;
  }
  // Grouper par catégorie
  const cats={};const catOrder=[];
  customTypes.forEach(function(t){
    if(!cats[t.category]){cats[t.category]=[];catOrder.push(t.category);}
    cats[t.category].push(t);
  });
  let html='';
  catOrder.forEach(function(cat){
    html+='<div style="font-size:.62rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-muted);margin:10px 0 4px;">'+cat+'</div>';
    cats[cat].forEach(function(t){
      const existingTarif=tarifs.find(function(tr){return tr.types&&tr.types.includes(t.id);});
      const prix=existingTarif?existingTarif.prix:0;
      const stepsHtml=(t.steps||[]).map(function(s){
        const techLabel=s.sameAs!==null&&s.sameAs!==undefined?'🔗 ét.'+(s.sameAs+1):(!s.tech||s.tech==='auto')?'Auto':Array.isArray(s.tech)?s.tech.map(function(k){return TECHS[k]?TECHS[k].label:k;}).join(' / '):(TECHS[s.tech]?TECHS[s.tech].label:s.tech);
        return '<span style="font-size:.59rem;background:var(--bg);border:1px solid var(--border);border-radius:4px;padding:1px 6px;white-space:nowrap;">J+'+s.dayOffset+' '+s.label+' → '+techLabel+'</span>'+(t.stepsEmp?'<span style="font-size:.55rem;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:4px;padding:1px 5px;white-space:nowrap;">📡 emp</span>':'');
      }).join(' ');
      html+='<div style="display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:6px;background:var(--surface);border:1px solid var(--border-soft);margin-bottom:3px;">'+
        '<div style="flex:1;">'+
          '<div style="font-weight:500;font-size:.84rem;">'+escHtml(t.label)+'</div>'+
          (stepsHtml?'<div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:3px;">'+stepsHtml+'</div>':'')+
        '</div>'+
        '<div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">'+
          '<input type="number" id="type-prix-'+t.id+'" min="0" step="0.01" value="'+(prix||'')+'" placeholder="0.00" title="Prix unitaire BDL" style="width:80px;border:1.5px solid var(--border);border-radius:6px;background:var(--bg);font-family:monospace;font-size:.82rem;padding:5px 7px;color:var(--ink);text-align:right;outline:none;"/>'+
          '<span style="font-size:.75rem;color:var(--ink-soft);">€</span>'+
        '</div>'+
        '<button onclick="editCustomType(\''+t.id+'\')" title="Modifier ce type" style="flex-shrink:0;background:none;border:1px solid var(--border);border-radius:5px;padding:2px 9px;cursor:pointer;font-size:.68rem;color:var(--ink-soft);">✏️ Modifier</button>'+
        '<button onclick="deleteCustomType(\''+t.id+'\')" title="Supprimer ce type" style="flex-shrink:0;background:none;border:1px solid #e0c8c8;border-radius:5px;padding:2px 9px;cursor:pointer;font-size:.68rem;color:#c0392b;">✕</button>'+
      '</div>';
    });
  });
  html+='<div style="display:flex;align-items:center;gap:10px;margin-top:12px;">'+
    '<button onclick="saveTypePrices()" style="background:#2a6049;color:#fff;border:none;border-radius:7px;padding:8px 16px;font-family:monospace;font-size:.78rem;font-weight:500;cursor:pointer;">💾 Enregistrer les prix</button>'+
    '<span id="ct-prix-msg" style="font-size:.74rem;color:#2a6049;"></span>'+
  '</div>';
  el.innerHTML=html;
}

function _openTypeForm(label,category,steps,stepsEmp,editId){
  _ctEditId=editId||null;
  _ctSteps=steps?steps.map(function(s){return Object.assign({},s);}):[];
  _ctSupportsEmp=!!(stepsEmp&&stepsEmp.length);
  _ctStepsEmp=stepsEmp?stepsEmp.map(function(s){return Object.assign({},s);}):[];
  document.getElementById('ct-name').value=label||'';
  document.getElementById('ct-category').value=category||'';
  // Titre du formulaire
  const titleEl=document.getElementById('ct-form-title');
  if(titleEl)titleEl.textContent=_ctEditId?'Modifier le type':'Nouveau type';
  renderCtSteps(false);
  renderCtEmpSection();
  document.getElementById('ct-form').style.display='block';
  document.getElementById('btn-ct-show-form').style.display='none';
  // Programmation optionnelle : ne plus auto-ajouter une étape vide
}
function showCustomTypeForm(){_openTypeForm('','',null,null,null);}
function editCustomType(id){
  const t=customTypes.find(function(c){return c.id===id;});
  if(!t)return;
  _openTypeForm(t.label,t.category,t.steps,t.stepsEmp,id);
  document.getElementById('ct-form').scrollIntoView({behavior:'smooth',block:'nearest'});
}
function hideCustomTypeForm(){
  _ctEditId=null;
  document.getElementById('ct-form').style.display='none';
  document.getElementById('btn-ct-show-form').style.display='';
}

function _ctArr(isEmp){return isEmp?_ctStepsEmp:_ctSteps;}
function addCustomStep(isEmp){
  const arr=_ctArr(isEmp);
  const maxDay=arr.length?arr[arr.length-1].dayOffset+1:1;
  arr.push({label:'',tech:'auto',dayOffset:maxDay,sameAs:null});
  renderCtSteps(isEmp);
}
function removeCtStep(i,isEmp){_ctArr(isEmp).splice(i,1);renderCtSteps(isEmp);}

// Lie une étape à une autre (même technicien)
window.setStepSameAs=function(stepIdx,refIdx,isEmp){
  _ctArr(isEmp)[stepIdx].sameAs=parseInt(refIdx);
  renderCtSteps(isEmp);
};
window.clearStepSameAs=function(stepIdx,isEmp){
  _ctArr(isEmp)[stepIdx].sameAs=null;
  renderCtSteps(isEmp);
};

// Bascule un technicien dans le pool d'une étape
window.toggleStepTech=function(stepIdx,techKey,isEmp){
  const s=_ctArr(isEmp)[stepIdx];
  if(techKey==='auto'){
    s.tech='auto';
  } else {
    // Normaliser en tableau si ce n'est pas 'auto'
    const current=s.tech==='auto'?[]:Array.isArray(s.tech)?s.tech:[s.tech];
    const idx=current.indexOf(techKey);
    if(idx>=0){
      current.splice(idx,1);
      s.tech=current.length===0?'auto':current;
    } else {
      current.push(techKey);
      s.tech=current;
    }
  }
  renderCtSteps(isEmp);
};

function renderCtSteps(isEmp){
  const stepsArr=_ctArr(isEmp);
  const el=document.getElementById(isEmp?'ct-steps-emp':'ct-steps');if(!el)return;
  if(!stepsArr.length){el.innerHTML='<div style="font-size:.75rem;color:var(--ink-soft);font-style:italic;padding:6px 0;">'+t('empty.steps')+'</div>';return;}
  const techKeys=Object.keys(TECHS);
  const e=isEmp?',1':''; // suffixe pour passer isEmp=true aux handlers
  const pill=function(label,active,onclick){
    return '<button type="button" onclick="'+onclick+'" style="border:1.5px solid '+(active?'var(--accent)':'var(--border)')+';background:'+(active?'var(--accent-soft)':'var(--surface)')+';color:'+(active?'var(--accent)':'var(--ink-soft)')+';border-radius:99px;padding:3px 10px;font-size:.72rem;font-weight:'+(active?600:400)+';cursor:pointer;white-space:nowrap;">'+label+'</button>';
  };
  el.innerHTML=stepsArr.map(function(s,i){
    const pool=s.tech==='auto'?[]:Array.isArray(s.tech)?s.tech:[s.tech];
    const isAuto=s.tech==='auto';
    const isLinked=s.sameAs!==null&&s.sameAs!==undefined&&stepsArr[s.sameAs];
    const techPills=techKeys.map(function(k){
      const active=!isAuto&&pool.includes(k);
      return pill(TECHS[k].label,active,'toggleStepTech('+i+',\''+k+'\''+e+')');
    }).join('');
    const autoPill=pill('Auto (moins chargé)',isAuto,'toggleStepTech('+i+',\'auto\''+e+')');
    let techSection;
    if(isLinked){
      const refLabel=escHtml(stepsArr[s.sameAs].label||'Étape '+(s.sameAs+1));
      techSection='<div style="display:flex;align-items:center;gap:8px;background:var(--accent-soft);border:1px solid var(--accent);border-radius:7px;padding:6px 10px;">'+
        '<span style="font-size:.75rem;color:var(--accent);font-weight:600;">🔗 Même technicien que : '+refLabel+'</span>'+
        '<button type="button" onclick="clearStepSameAs('+i+e+')" style="background:none;border:none;cursor:pointer;color:var(--accent);font-size:.75rem;margin-left:auto;">× Délier</button>'+
      '</div>';
    } else {
      const linkOpts=stepsArr.slice(0,i).map(function(rs,ri){
        return '<option value="'+ri+'">'+(rs.label||'Étape '+(ri+1))+'</option>';
      }).join('');
      const linkBtn=i>0?'<select onchange="if(this.value!==\'\')setStepSameAs('+i+',this.value'+e+')" style="font-size:.72rem;border:1px solid var(--border);border-radius:6px;padding:3px 6px;background:var(--surface);color:var(--ink-soft);cursor:pointer;">'+
        '<option value="">🔗 Lier au tech de...</option>'+linkOpts+'</select>':'';
      techSection='<div style="font-size:.65rem;color:var(--ink-soft);margin-bottom:5px;text-transform:uppercase;letter-spacing:.05em;font-weight:600;">Technicien(s) pouvant réaliser cette étape</div>'+
        '<div style="display:flex;flex-wrap:wrap;gap:5px;align-items:center;">'+autoPill+techPills+(linkBtn?'<span style="width:100%;"></span>'+linkBtn:'')+'</div>';
    }
    const arrRef=isEmp?'_ctStepsEmp':'_ctSteps';
    return '<div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px 12px;margin-bottom:8px;">'+
      '<div style="display:grid;grid-template-columns:1fr 80px auto;gap:8px;align-items:center;margin-bottom:8px;">'+
        '<input type="text" placeholder="Nom de l\'étape (ex: Modélisation)" value="'+s.label+'" oninput="'+arrRef+'['+i+'].label=this.value" style="border:1.5px solid var(--border);border-radius:7px;padding:7px 10px;font-family:Inter,sans-serif;font-size:.82rem;background:var(--surface);color:var(--ink);outline:none;"/>'+
        '<div style="display:flex;align-items:center;gap:4px;"><span style="font-size:.7rem;color:var(--ink-soft);white-space:nowrap;">Jour J+</span><input type="number" min="1" max="30" value="'+s.dayOffset+'" oninput="'+arrRef+'['+i+'].dayOffset=parseInt(this.value)||1" style="width:48px;border:1.5px solid var(--border);border-radius:7px;padding:7px 6px;font-family:Inter,sans-serif;font-size:.82rem;background:var(--surface);color:var(--ink);outline:none;"/></div>'+
        '<button onclick="removeCtStep('+i+e+')" style="background:none;border:none;cursor:pointer;color:#c0392b;font-size:.9rem;padding:4px;">✕</button>'+
      '</div>'+
      techSection+
    '</div>';
  }).join('');
}

function renderCtEmpSection(){
  const el=document.getElementById('ct-emp-section');if(!el)return;
  if(!_ctSupportsEmp){
    el.innerHTML='<button type="button" onclick="_ctSupportsEmp=true;renderCtEmpSection();renderCtSteps(1);" style="font-size:.78rem;border:1.5px dashed var(--border);background:var(--surface);color:var(--ink-soft);border-radius:8px;padding:7px 14px;cursor:pointer;width:100%;">📡 + Ajouter un workflow empreinte numérique</button>';
    return;
  }
  el.innerHTML='<div style="border:1.5px solid #3b82f6;border-radius:10px;padding:12px;background:#eff6ff;">'+
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">'+
      '<span style="font-size:.78rem;font-weight:700;color:#1d4ed8;">📡 Étapes avec empreinte numérique</span>'+
      '<button type="button" onclick="_ctSupportsEmp=false;_ctStepsEmp=[];renderCtEmpSection();" style="background:none;border:none;cursor:pointer;font-size:.72rem;color:#93c5fd;">× Supprimer ce workflow</button>'+
    '</div>'+
    '<div id="ct-steps-emp"></div>'+
    '<button class="btn btn-b" style="margin-top:8px;font-size:.75rem;" onclick="addCustomStep(1)">+ Ajouter une étape</button>'+
  '</div>';
  renderCtSteps(1);
}

function saveCustomType(){
  const name=document.getElementById('ct-name').value.trim();
  const cat=document.getElementById('ct-category').value.trim()||'Autre';
  if(!name){alert(t('alert.type_name'));return;}
  // Programmation optionnelle : si des étapes existent, elles doivent toutes avoir un nom
  const validSteps=_ctSteps.filter(function(s){return s.label.trim();});
  if(_ctSteps.length>0&&validSteps.length<_ctSteps.length){
    if(!confirm('Certaines étapes n\'ont pas de nom et seront ignorées. Continuer ?'))return;
  }
  const mapStep=function(s){return{label:s.label.trim(),tech:s.tech,dayOffset:Math.max(1,s.dayOffset),sameAs:s.sameAs!==null&&s.sameAs!==undefined?s.sameAs:null};};
  const newData={label:name,category:cat,steps:validSteps.map(mapStep),stepsEmp:_ctSupportsEmp&&_ctStepsEmp.length?_ctStepsEmp.filter(function(s){return s.label.trim();}).map(mapStep):null};
  if(_ctEditId){
    const idx=customTypes.findIndex(function(t){return t.id===_ctEditId;});
    if(idx>=0){customTypes[idx]=Object.assign({},customTypes[idx],newData);}
  } else {
    const id='ct_'+name.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,15)+'_'+Date.now();
    customTypes.push(Object.assign({id},newData));
  }
  saveCustomTypes();syncCustomTypesToTL();refreshTypeSelects();renderCustomTypesList();hideCustomTypeForm();
}

function deleteCustomType(id){
  const ct=customTypes.find(function(c){return c.id===id;});
  if(!ct||!confirm(ti('confirm.delete_type',{label:ct.label})))return;
  customTypes=customTypes.filter(function(c){return c.id!==id;});
  delete TYPE_LABELS[id];
  saveCustomTypes();refreshTypeSelects();renderCustomTypesList();
}

// Initialisation de la liste au chargement du pane paramètres
(function(){
  const orig=window._paneParamInit;
  const checkParam=function(){
    if(document.getElementById('ct-list'))renderCustomTypesList();
  };
  setTimeout(checkParam,200);
})();

/* ══════════════════════════════════════════
   §AI — ASSISTANT IA CONFIGURATION
   ══════════════════════════════════════════ */
let _aiMessages=[];
let _aiPendingConfig=null;
let _aiLoading=false;

function _buildAISystemPrompt(){
  const techsDesc=Object.entries(TECHS).map(function([k,t]){return '- '+k+' : '+t.label+(t.role?' ('+t.role+')':'');}).join('\n')||'Aucun technicien configuré.';
  const typesDesc=customTypes.map(function(t){
    const steps=(t.steps||[]).map(function(s,i){return 'J+'+s.dayOffset+' "'+s.label+'"'+(s.sameAs!==null&&s.sameAs!==undefined?' (même tech que étape '+(s.sameAs+1)+')':s.tech&&s.tech!=='auto'?' ('+( Array.isArray(s.tech)?s.tech.join('/'):s.tech)+')':'');}).join(', ');
    return '- ['+t.id+'] "'+t.label+'" ('+t.category+') : '+steps;
  }).join('\n')||'Aucun type configuré.';
  const congesDesc=conges.length?conges.join(', '):'Aucun.';
  const absDesc=Object.entries(absences).map(function([k,dates]){
    if(!dates||!dates.length)return null;
    return (TECHS[k]?TECHS[k].label:k)+' : '+dates.join(', ');
  }).filter(Boolean).join('\n')||'Aucune absence enregistrée.';

  return `Tu es un assistant expert en gestion de laboratoire de prothèse dentaire. Tu aides l'utilisateur à configurer ses types de travaux dans le logiciel Labosync.

TECHNICIENS DU LABORATOIRE :
${techsDesc}

TYPES DE TRAVAUX EXISTANTS (avec leur ID entre crochets) :
${typesDesc}

CONGÉS DU LABORATOIRE :
${congesDesc}

ABSENCES PAR TECHNICIEN :
${absDesc}

---
STRUCTURE D'UN TYPE DE TRAVAIL :
Chaque type a des étapes avec :
- label : nom de l'étape
- dayOffset : numéro du jour ouvré (J+1, J+2...) depuis la date de départ
- tech : "auto" = le moins chargé automatiquement, ou un tableau de clés de techniciens (ex: ["jc","marie"])
- sameAs : null, ou l'index 0-based d'une étape PRÉCÉDENTE pour forcer le même technicien

EMPREINTE NUMÉRIQUE — CONCEPT IMPORTANT :
Un type de travail peut gérer les deux modes d'empreinte en une seule fiche.
- "steps" = étapes pour une empreinte PHYSIQUE (plâtre, sac, expédié par courrier)
- "stepsEmp" = étapes pour une empreinte NUMÉRIQUE (fichier STL reçu en ligne)
Quand un cas arrive en numérique, le logiciel bascule automatiquement sur "stepsEmp" à la place de "steps".
Il ne faut PAS créer deux types séparés. C'est le MÊME type, avec deux listes d'étapes différentes.
"stepsEmp" est optionnel : ne l'inclure que si le workflow numérique diffère du workflow physique.
Typiquement, en numérique on saute la récupération/scan et on commence directement à la modélisation.

CATÉGORIES : Couronnes, Composite & Céramique, Armatures, Bridges, Prothèse & Occlusion, Chirurgie & Modèles, Autre

---
QUAND TU PROPOSES UNE CONFIGURATION, inclus obligatoirement ce bloc JSON dans ta réponse :

<config>
{
  "action": "create",
  "label": "Nom du type",
  "category": "Catégorie",
  "steps": [
    {"label": "Étape 1", "tech": "auto", "dayOffset": 1, "sameAs": null}
  ],
  "stepsEmp": [
    {"label": "Étape 1 numérique", "tech": "auto", "dayOffset": 1, "sameAs": null}
  ]
}
</config>

N'inclure "stepsEmp" que si le workflow numérique diffère du physique. Si les étapes sont identiques, omettre "stepsEmp".
Pour MODIFIER un type existant : "action": "modify" et "id": "l'id_entre_crochets_ci-dessus".

---
INSTRUCTIONS :
- Réponds toujours en français, de façon concise et professionnelle
- Pose des questions pour comprendre le workflow avant de proposer
- Tiens compte des absences/congés pour les suggestions de dayOffset
- Propose la configuration seulement quand tu as assez d'informations
- Ne jamais créer deux types séparés pour gérer l'empreinte numérique vs physique — utiliser stepsEmp
- Après le bloc <config>, explique brièvement tes choix en 2-3 lignes`;
}

function openAIConfigModal(){
  _aiMessages=[];_aiPendingConfig=null;_aiLoading=false;
  document.getElementById('ai-chat-history').innerHTML='';
  document.getElementById('ai-config-preview').style.display='none';
  document.getElementById('ai-config-modal').style.display='flex';
  _aiAddMessage('assistant','Bonjour ! Je suis votre assistant de configuration. Voulez-vous **créer un nouveau type de travail** ou **modifier un type existant** ? Décrivez-moi votre workflow en quelques mots.');
}
function closeAIConfigModal(){document.getElementById('ai-config-modal').style.display='none';}

function _aiAddMessage(role,text){
  _aiMessages.push({role,content:text});
  const el=document.getElementById('ai-chat-history');
  const div=document.createElement('div');
  // Texte affiché : retire le bloc <config>
  const display=text.replace(/<config>[\s\S]*?<\/config>/g,'[Configuration proposée ci-dessous]').trim();
  div.style.cssText=role==='user'
    ?'align-self:flex-end;background:linear-gradient(135deg,#6c47ff,#a855f7);color:#fff;border-radius:14px 14px 2px 14px;padding:9px 13px;max-width:82%;font-size:.82rem;line-height:1.45;'
    :'align-self:flex-start;background:var(--surface);border:1px solid var(--border);border-radius:14px 14px 14px 2px;padding:9px 13px;max-width:88%;font-size:.82rem;line-height:1.45;';
  div.textContent=display;
  el.appendChild(div);
  el.scrollTop=el.scrollHeight;
}

async function sendAIMessage(){
  if(_aiLoading)return;
  const input=document.getElementById('ai-chat-input');
  const text=input.value.trim();if(!text)return;
  input.value='';
  _aiAddMessage('user',text);
  _aiLoading=true;
  const btn=document.getElementById('ai-send-btn');
  btn.disabled=true;btn.textContent='...';
  // Indicateur de frappe
  const el=document.getElementById('ai-chat-history');
  const typing=document.createElement('div');
  typing.id='ai-typing';
  typing.style.cssText='align-self:flex-start;background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:9px 14px;font-size:.82rem;color:var(--ink-soft);';
  typing.textContent=t('btn.thinking');
  el.appendChild(typing);el.scrollTop=el.scrollHeight;
  try{
    const resp=await fetch('/.netlify/functions/ai-chat',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        system:_buildAISystemPrompt(),
        messages:_aiMessages.filter(function(m){return m.role!=='assistant'||!m.content.startsWith('Bonjour');}),
        max_tokens:1200
      })
    });
    const data=await resp.json();
    el.removeChild(typing);
    if(!resp.ok||data.error){throw new Error(data.error?.message||'Erreur API');}
    const aiText=data.content[0].text;
    _aiAddMessage('assistant',aiText);
    // Détecter config proposée
    const m=aiText.match(/<config>([\s\S]*?)<\/config>/);
    if(m){
      try{_aiPendingConfig=JSON.parse(m[1].trim());_aiShowConfigPreview(_aiPendingConfig);}
      catch(e){console.warn('Config parse error',e);}
    }
  }catch(e){
    const t=document.getElementById('ai-typing');if(t)el.removeChild(t);
    _aiAddMessage('assistant','⚠️ Erreur : '+e.message);
  }
  _aiLoading=false;btn.disabled=false;btn.textContent='Envoyer';
}

function _aiShowConfigPreview(config){
  const el=document.getElementById('ai-config-preview');
  const mkSteps=function(arr){return (arr||[]).map(function(s){return '<span style="font-size:.68rem;background:var(--bg);border:1px solid var(--border);border-radius:4px;padding:2px 7px;white-space:nowrap;">J+'+s.dayOffset+' '+escHtml(s.label)+'</span>';}).join(' ');};
  const stepsHtml=mkSteps(config.steps);
  const empHtml=config.stepsEmp&&config.stepsEmp.length?'<div style="margin-top:5px;"><span style="font-size:.66rem;color:var(--ink-soft);font-weight:600;">Numérique : </span>'+mkSteps(config.stepsEmp)+'</div>':'';
  el.innerHTML='<div style="display:flex;align-items:flex-start;gap:10px;">'+
    '<div style="flex:1;">'+
      '<div style="font-size:.72rem;font-weight:700;color:#6c47ff;margin-bottom:5px;">'+(config.action==='modify'?'✏️ Modification':'✨ Nouveau type')+' : '+escHtml(config.label||'')+'</div>'+
      '<div style="display:flex;flex-wrap:wrap;gap:4px;">'+stepsHtml+'</div>'+
      empHtml+
    '</div>'+
    '<button onclick="applyAIConfig()" style="background:linear-gradient(135deg,#6c47ff,#a855f7);color:#fff;border:none;border-radius:8px;padding:7px 13px;font-size:.78rem;font-weight:600;cursor:pointer;white-space:nowrap;">✓ Appliquer</button>'+
  '</div>';
  el.style.display='block';
}

function applyAIConfig(){
  if(!_aiPendingConfig)return;
  const c=_aiPendingConfig;
  const mapSteps=function(arr){return (arr||[]).map(function(s){return{label:s.label||'Étape',tech:s.tech||'auto',dayOffset:Math.max(1,parseInt(s.dayOffset)||1),sameAs:s.sameAs!==undefined?s.sameAs:null};});};
  const steps=mapSteps(c.steps);
  const stepsEmp=c.stepsEmp&&c.stepsEmp.length?mapSteps(c.stepsEmp):null;
  if(c.action==='modify'&&c.id){
    const idx=customTypes.findIndex(function(t){return t.id===c.id;});
    if(idx>=0){
      const upd={label:c.label||customTypes[idx].label,category:c.category||customTypes[idx].category,steps:steps};
      if(stepsEmp){upd.stepsEmp=stepsEmp;upd.supportsEmp=true;}
      customTypes[idx]=Object.assign({},customTypes[idx],upd);
    } else{alert('Type introuvable : '+c.id);return;}
  } else {
    const id='ct_ai_'+Date.now();
    const newType={id,label:c.label||'Nouveau type',category:c.category||'Autre',steps:steps};
    if(stepsEmp){newType.stepsEmp=stepsEmp;newType.supportsEmp=true;}
    customTypes.push(newType);
  }
  saveCustomTypes();syncCustomTypesToTL();refreshTypeSelects();renderCustomTypesList();
  document.getElementById('ai-config-preview').style.display='none';
  _aiPendingConfig=null;
  const msg=document.getElementById('ai-chat-history');
  const ok=document.createElement('div');
  ok.style.cssText='align-self:flex-start;background:#edf7f1;border:1px solid #b6e0c8;border-radius:10px;padding:8px 12px;font-size:.82rem;color:#1a5c36;font-weight:500;';
  ok.textContent=t(c.action==='modify'?'toast.type_modified':'toast.type_created');
  msg.appendChild(ok);msg.scrollTop=msg.scrollHeight;
}

/* ══════════════════════════════════════════
   §22 — ABSENCES & CONGÉS
   ══════════════════════════════════════════ */
function isTechAbsent(tech,date){return (absences[tech]||[]).includes(fmtISO(date));}
function addConge(){const v=document.getElementById('conge-date-input').value;if(!v)return;if(!conges.includes(v)){conges.push(v);conges.sort();saveConges();}renderCongesList();document.getElementById('conge-date-input').value='';}
function removeConge(d){conges=conges.filter(x=>x!==d);saveConges();renderCongesList();}
function renderCongesList(){
  const el=document.getElementById('conges-list');if(!el)return;
  if(!conges.length){el.innerHTML='<div style="font-size:.74rem;color:var(--ink-soft);font-style:italic;">'+t('empty.conges')+'</div>';return;}
  el.innerHTML='';
  conges.forEach(function(d){
    const dt=new Date(d+'T12:00:00');
    const div=document.createElement('div');
    div.style.cssText='display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:var(--bg);border-radius:6px;margin-bottom:5px;border:1px solid var(--border);font-size:.78rem;';
    div.innerHTML='🔒 '+DFR[dt.getDay()]+' '+dt.getDate()+' '+MFR[dt.getMonth()]+' '+dt.getFullYear();
    const btn=document.createElement('button');
    btn.textContent='✕';btn.style.cssText='background:none;border:none;cursor:pointer;color:#c0392b;';
    btn.addEventListener('click',function(){removeConge(d);});
    div.appendChild(btn);el.appendChild(div);
  });
}

function addAbsence(){
  const tech=document.getElementById('abs-tech-sel').value;
  const date=document.getElementById('abs-date-input').value;
  if(!tech||!date){alert(t('alert.choose_tech_date'));return;}
  if(!absences[tech])absences[tech]=[];
  if(!absences[tech].includes(date)){absences[tech].push(date);absences[tech].sort();}
  saveAbsences();renderAbsList();document.getElementById('abs-date-input').value='';
}
function removeAbsence(tech,date){if(!absences[tech])return;absences[tech]=absences[tech].filter(d=>d!==date);if(!absences[tech].length)delete absences[tech];saveAbsences();renderAbsList();}
function renderAbsList(){
  const el=document.getElementById('abs-list');if(!el)return;
  const names=Object.fromEntries(Object.entries(TECHS).map(([k,v])=>[k,v.label]));
  const entries=[];
  Object.keys(absences).forEach(tech=>(absences[tech]||[]).forEach(date=>entries.push({tech,date})));
  entries.sort((a,b)=>a.date.localeCompare(b.date));
  if(!entries.length){el.innerHTML='<div style="font-size:.74rem;color:var(--ink-soft);font-style:italic;">'+t('empty.absences')+'</div>';return;}
  el.innerHTML='';
  entries.forEach(function(e){
    const dt=new Date(e.date+'T12:00:00');
    const div=document.createElement('div');
    div.style.cssText='display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:var(--bg);border-radius:6px;margin-bottom:5px;border:1px solid var(--border);font-size:.78rem;';
    const info=document.createElement('span');
    info.innerHTML='<b style="color:'+(TECHS[e.tech]&&TECHS[e.tech].color||'#888')+'">'+(names[e.tech]||e.tech)+'</b> <span style="color:var(--ink-soft);margin:0 6px;">'+DFR[dt.getDay()]+' '+dt.getDate()+' '+MFR[dt.getMonth()]+'</span>';
    const btn=document.createElement('button');
    btn.textContent='✕';btn.style.cssText='background:none;border:none;cursor:pointer;color:#c0392b;';
    btn.addEventListener('click',function(){removeAbsence(e.tech,e.date);});
    div.appendChild(info);div.appendChild(btn);el.appendChild(div);
  });
}


/* ══════════════════════════════════════════
   §23 — CLOUD SYNC
   ══════════════════════════════════════════ */
let _isSaving=false;
// Protection contre les races : tant que cloudRestore n'a pas terminé, on ne
// pousse RIEN au cloud — sinon on risque d'écraser les données du serveur avec
// l'état initial vide (cabinets=[], jobs=[]).
let _cloudRestoreInProgress=false;
let _initialRestoreDone=false;
// Snapshot de la dernière sauvegarde/restauration réussie. Sert de référence
// pour détecter les sauvegardes destructives (mémoire qui devient vide alors
// que le cloud contenait des données).
let _lastCloudSnapshot=null;
function _captureCloudSnapshot(){
  try{
    _lastCloudSnapshot={
      ts:Date.now(),
      jobs:(jobs||[]).length,
      cabinets:(cabinets||[]).length,
      archive:(archive||[]).length,
      tarifs:(JSON.parse(localStorage.getItem('lb_tarifs')||'[]')||[]).length,
      bdc:(JSON.parse(localStorage.getItem('lb_bdc')||'[]')||[]).length,
      bdl:(JSON.parse(localStorage.getItem('lb_bdl')||'[]')||[]).length,
      documents:(JSON.parse(localStorage.getItem('lb_docs')||'[]')||[]).length,
      laboName:(localStorage.getItem('lb_name')||'').trim()
    };
  }catch(e){console.warn('captureCloudSnapshot',e);}
}
function _currentDataCounts(){
  return {
    jobs:(jobs||[]).length,
    cabinets:(cabinets||[]).length,
    archive:(archive||[]).length,
    tarifs:(JSON.parse(localStorage.getItem('lb_tarifs')||'[]')||[]).length,
    bdc:(JSON.parse(localStorage.getItem('lb_bdc')||'[]')||[]).length,
    bdl:(JSON.parse(localStorage.getItem('lb_bdl')||'[]')||[]).length,
    documents:(JSON.parse(localStorage.getItem('lb_docs')||'[]')||[]).length,
    laboName:(localStorage.getItem('lb_name')||'').trim()
  };
}
// Détecte les sauvegardes "suspectes" : mémoire vide alors qu'on savait qu'il y
// avait des données côté cloud. Empêche le bug du 5 mai 2026 où le cloud d'un
// utilisateur a été écrasé avec un état initial vide.
// Bypass à usage unique : permet de forcer une sauvegarde destructive
// quand l'utilisateur l'a explicitement confirmée (ex: "j'ai vraiment voulu
// tout supprimer mes cabinets").
let _bypassNextDestructiveCheck=false;
function _isDestructiveSave(){
  if(_bypassNextDestructiveCheck){_bypassNextDestructiveCheck=false;return false;}
  if(!_lastCloudSnapshot)return false; // Pas de référence, impossible à détecter
  const last=_lastCloudSnapshot;
  const lastTotal=last.jobs+last.cabinets+last.archive+last.tarifs+last.bdc+last.bdl+last.documents;
  if(lastTotal===0&&!last.laboName)return false; // Compte déjà vide, impossible d'être destructif
  const curr=_currentDataCounts();
  const currTotal=curr.jobs+curr.cabinets+curr.archive+curr.tarifs+curr.bdc+curr.bdl+curr.documents;
  // Cas 1 : tout est passé à zéro alors qu'on avait des données → suspect
  if(currTotal===0&&!curr.laboName&&lastTotal>0)return true;
  // Cas 2 : perte massive (>80% de chute) avec au moins 5 items au départ → suspect
  if(lastTotal>=5&&currTotal<lastTotal*0.2)return true;
  return false;
}
// Affiche un avertissement plein écran (non-fermable accidentellement) quand une
// sauvegarde destructive est bloquée. L'utilisateur peut recharger pour
// récupérer ses données depuis le cloud.
let _destructiveAlertShown=false;
function _alertDestructiveSave(){
  if(_destructiveAlertShown)return; // une seule alerte à la fois
  _destructiveAlertShown=true;
  const ov=document.createElement('div');
  ov.id='destructive-alert';
  ov.style.cssText='position:fixed;inset:0;background:rgba(15,23,42,.85);z-index:99999;display:flex;align-items:center;justify-content:center;padding:24px;';
  ov.innerHTML='<div style="background:#fff;border-radius:14px;padding:32px 36px;max-width:520px;width:100%;box-shadow:0 24px 70px rgba(0,0,0,.5);">'+
    '<div style="font-size:2.6rem;text-align:center;margin-bottom:14px;">🛡️</div>'+
    '<h2 style="margin:0 0 12px 0;font-size:1.35rem;font-weight:800;color:#dc2626;text-align:center;">Sauvegarde bloquée pour vous protéger</h2>'+
    '<p style="margin:0 0 14px 0;font-size:.96rem;color:#475569;line-height:1.55;">Le système a détecté une tentative de sauvegarde anormalement vide alors que votre cloud contenait des données. La sauvegarde a été <strong>refusée</strong> pour protéger vos cabinets, travaux et factures.</p>'+
    '<p style="margin:0 0 18px 0;font-size:.92rem;color:#475569;line-height:1.55;"><strong>Action recommandée :</strong> rechargez la page pour récupérer vos données depuis le cloud. Vos données sont saines côté serveur.</p>'+
    '<div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;">'+
      '<button id="dest-force" style="background:#fff;border:1.5px solid #fecaca;color:#dc2626;border-radius:8px;padding:10px 18px;font-size:.86rem;font-weight:500;cursor:pointer;" title="À utiliser uniquement si vous avez vraiment supprimé toutes vos données volontairement">J\'ai vraiment voulu tout supprimer</button>'+
      '<button id="dest-reload" style="background:#dc2626;color:#fff;border:none;border-radius:8px;padding:10px 22px;font-size:.96rem;font-weight:700;cursor:pointer;">🔄 Recharger la page</button>'+
    '</div>'+
  '</div>';
  document.body.appendChild(ov);
  document.getElementById('dest-reload').onclick=function(){location.reload();};
  document.getElementById('dest-force').onclick=function(){
    if(!confirm("Vous êtes sûr ? La prochaine sauvegarde écrasera vos données du cloud par l'état vide actuel.\n\nCliquez OK uniquement si vous avez VRAIMENT voulu tout supprimer."))return;
    _bypassNextDestructiveCheck=true;
    ov.remove();
    _destructiveAlertShown=false;
    if(typeof scheduleSave==='function')scheduleSave();
  };
}
// Sauvegarde toutes les données du labo vers Supabase (avec détection de conflits)
async function cloudSave(){
  const msg=document.getElementById('cloud-msg');if(!msg)return;
  if(!currentUser){msg.textContent='';return;}
  // ── PROTECTION 1 : cloudRestore en cours ────────────────────────────────
  // Si cloudRestore n'a pas encore terminé, NE PAS sauvegarder : la mémoire
  // est encore vide et on écraserait les données du cloud avec du vide.
  if(_cloudRestoreInProgress||!_initialRestoreDone){
    console.warn('cloudSave différé : cloudRestore pas encore terminé');
    setTimeout(function(){if(typeof scheduleSave==='function')scheduleSave();},1500);
    return;
  }
  // ── PROTECTION 2 : détection de sauvegarde destructive ──────────────────
  // Refuser de pousser un état mémoire suspect (vide alors que la dernière
  // synchro avait des données). Demander à l'utilisateur de recharger la page.
  if(_isDestructiveSave()){
    console.error('🚨 cloudSave REFUSÉ : sauvegarde destructive détectée. État mémoire :',_currentDataCounts(),'· dernière référence :',_lastCloudSnapshot);
    if(typeof _alertDestructiveSave==='function')_alertDestructiveSave();
    return;
  }
  if(_isSaving)return; // éviter les sauvegardes simultanées depuis le même onglet
  _isSaving=true;
  msg.textContent=t('toast.saving');msg.style.color='var(--ink-soft)';
  try{
    const token=_cachedAccessToken;
    const userId=currentUser.id;
    if(!token){msg.textContent='';_isSaving=false;return;}

    // ── Détection de conflit ─────────────────────────────────────────────────
    // Si une autre session a sauvegardé plus récemment, on note juste le nouveau
    // timestamp mais on sauvegarde quand même l'état local (les changements en
    // cours ont priorité sur le cloud pour éviter de perdre un travail tout juste créé).
    if(_serverUpdatedAt){
      try{
        const chk=await fetch(SB_URL+'/rest/v1/labo_data?id=eq.'+userId+'&select=updated_at',{
          headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token}
        });
        const rows=await chk.json();
        if(rows&&rows[0]&&rows[0].updated_at){
          const serverTime=new Date(rows[0].updated_at).getTime();
          const knownTime=new Date(_serverUpdatedAt).getTime();
          if(serverTime>knownTime+1000){
            // On met à jour le repère temporel mais on NE restaure PAS —
            // l'état local (avec le nouveau travail) doit l'emporter.
            console.warn('Conflit ignoré — sauvegarde locale prioritaire');
            _serverUpdatedAt=rows[0].updated_at;
          }
        }
      }catch(e){console.warn('Vérif conflit échouée (ignorée)',e);}
    }
    // ────────────────────────────────────────────────────────────────────────

    const now=new Date().toISOString();
    const payload={
      version:2,
      savedAt:now,
      _tabId:_tabId,
      laboName:localStorage.getItem('lb_name')||'',
      jobs,archive,cabinets,syns,scanHist,waiting,conges,absences,
      queue:queue,
      documents:JSON.parse(localStorage.getItem('lb_docs')||'[]'),
      tarifs:JSON.parse(localStorage.getItem('lb_tarifs')||'[]'),
      bdc:JSON.parse(localStorage.getItem('lb_bdc')||'[]'),
      fourns:JSON.parse(localStorage.getItem('lb_fourns')||'[]'),
      bdl:JSON.parse(localStorage.getItem('lb_bdl')||'[]'),
      techs:TECHS,
      progActif:localStorage.getItem('lb_prog_actif')||'0',
      customTypes:customTypes,
      legalInfo:{
        raison:localStorage.getItem('lb_legal_raison')||'',
        siret:localStorage.getItem('lb_legal_siret')||'',
        adresse:localStorage.getItem('lb_legal_adresse')||'',
        tel:localStorage.getItem('lb_legal_tel')||'',
        email:localStorage.getItem('lb_legal_email')||'',
        directeur:localStorage.getItem('lb_legal_directeur')||'',
        ce_num:localStorage.getItem('lb_legal_ce_num')||'',
      },
    };
    const r=await fetch(SB_URL+'/rest/v1/labo_data',{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'apikey':SB_KEY,
        'Authorization':'Bearer '+token,
        'Prefer':'resolution=merge-duplicates,return=minimal'
      },
      body:JSON.stringify({id:userId,data:payload,updated_at:now})
    });
    if(r.ok||r.status===200||r.status===201||r.status===204){
      _serverUpdatedAt=now;
      const hhmm=new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
      msg.style.color='#2a6049';
      msg.textContent=ti('toast.saved_at',{time:hhmm});
      localStorage.setItem('lb_last_save',now);
      // Mettre à jour la référence pour la détection de sauvegarde destructive
      _captureCloudSnapshot();
    } else {
      const err=await r.text();
      throw new Error(err);
    }
  }catch(e){
    // Erreur de verrou Supabase (lock volé par une requête concurrente) — bénigne, ignorer
    if(e.message&&e.message.includes('Lock')&&e.message.includes('stole it')){
      console.warn('cloudSave: lock contention ignorée',e.message);
      if(msg){msg.textContent='';msg.style.color='var(--ink-soft)';}
    } else {
      if(msg){msg.style.color='#c0392b';msg.textContent='❌ Erreur : '+e.message;}
      console.error('cloudSave error',e);
    }
  } finally {
    _isSaving=false;
  }
}

// Restaure toutes les données depuis Supabase (mode silencieux pour sync auto)
async function cloudRestore(silent=false){
  const msg=document.getElementById('cloud-msg');
  if(!currentUser)return;
  // Garde-fou anti-écrasement: juste après une mutation locale (ex: programmation Auto),
  // on ignore une restauration silencieuse qui pourrait réappliquer un état cloud obsolète.
  if(silent&&_lastLocalMutationAt&&(Date.now()-_lastLocalMutationAt)<4500){
    return;
  }
  if(!silent&&!confirm(t('confirm.restore_cloud')))return;
  _cloudRestoreInProgress=true;
  if(msg){msg.textContent='⏳ Restauration...';msg.style.color='var(--ink-soft)';}
  try{
    const token=_cachedAccessToken;
    const userId=currentUser.id;
    if(!token){if(msg){msg.textContent='';} return;}
    const r=await fetch(SB_URL+'/rest/v1/labo_data?id=eq.'+userId+'&select=data,updated_at',{
      headers:{
        'apikey':SB_KEY,
        'Authorization':'Bearer '+token
      }
    });
    if(!r.ok){
      // Erreur HTTP : ne pas marquer la restauration comme "réussie", les saves
      // restent bloqués pour ne pas pousser un état mémoire potentiellement vide.
      throw new Error('cloudRestore HTTP '+r.status);
    }
    const rows=await r.json();
    if(!rows||!rows.length||!rows[0]||!rows[0].data){
      // Cloud genuinely empty (premier login, ou compte fraîchement créé).
      // C'est un succès : on autorise les saves à venir et on capture un snapshot
      // de référence vide.
      _initialRestoreDone=true;
      _captureCloudSnapshot();
      if(!silent&&msg){msg.style.color='#c0392b';msg.textContent=t('toast.no_backup');}
      return;
    }
    const p=rows[0].data;
    const savedAt=rows[0].data.savedAt;
    // Mémoriser le timestamp serveur pour la détection de conflits
    if(rows[0].updated_at)_serverUpdatedAt=rows[0].updated_at;
    if(p.jobs)jobs=p.jobs;
    if(p.archive)archive=p.archive;
    if(p.cabinets)cabinets=p.cabinets;
    if(p.syns)syns=p.syns;
    if(p.waiting)waiting=p.waiting;
    if(p.conges)conges=p.conges;
    if(p.absences)absences=p.absences;
    if(p.queue){queue=p.queue;localStorage.setItem('lb_queue',JSON.stringify(p.queue));}
    if(p.documents){localStorage.setItem('lb_docs',JSON.stringify(p.documents));documents=p.documents;}
    if(p.tarifs){localStorage.setItem('lb_tarifs',JSON.stringify(p.tarifs));tarifs=p.tarifs;}
    if(p.bdc){localStorage.setItem('lb_bdc',JSON.stringify(p.bdc));bdc=p.bdc;}
    if(p.fourns){localStorage.setItem('lb_fourns',JSON.stringify(p.fourns));fourns=p.fourns;}
    if(p.bdl){localStorage.setItem('lb_bdl',JSON.stringify(p.bdl));bdl=p.bdl;}
    if(p.laboName)localStorage.setItem('lb_name',p.laboName);
    if(p.techs&&typeof p.techs==='object'){TECHS=p.techs;saveTechs();}
    if(p.progActif!==undefined&&p.progActif!==null){
      // Ne pas écraser le mode prog en cours de session (silent=true et app déjà initialisée)
      // Seulement au premier chargement ou si l'utilisateur clique explicitement "Restaurer"
      if(!_authInitDone||!silent){localStorage.setItem('lb_prog_actif',p.progActif);}
    }
    if(p.customTypes&&Array.isArray(p.customTypes)){customTypes=p.customTypes;saveCustomTypes();syncCustomTypesToTL();}
    if(p.scanHist&&Array.isArray(p.scanHist)){scanHist=p.scanHist;saveScanHist();}
    if(p.legalInfo&&typeof p.legalInfo==='object'){
      const li=p.legalInfo;
      const lkeys=['raison','siret','adresse','tel','email','directeur','ce_num'];
      lkeys.forEach(function(k){if(li[k])localStorage.setItem('lb_legal_'+k,li[k]);else localStorage.removeItem('lb_legal_'+k);});
    }

    refreshTypeSelects();
    saveJobs();saveArchive();saveCabinets();saveSyns();saveWaiting();saveConges();saveAbsences();
    // Restauration vraiment réussie : autoriser les saves et capturer un snapshot
    // de référence pour détecter les sauvegardes destructives futures.
    _initialRestoreDone=true;
    _captureCloudSnapshot();
    const savedDate=savedAt?new Date(savedAt).toLocaleDateString(t('locale'),{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}):'?';
    msg.style.color='#2a6049';
    msg.textContent=ti('toast.restored',{date:savedDate});
    refreshTechSelects();applyProgMode();updateProgToggleUI();
    render();refreshCabSelects();renderWaiting();renderQueueMain();
    // Rafraîchir la facturation si l'onglet est actif
    if(typeof renderBillDocs==='function'){renderToInvoice();renderToInvoice();renderBillDocs();updateBillStats();renderTarifs();}
  }catch(e){
    if(e.message&&e.message.includes('Lock')&&e.message.includes('stole it')){
      console.warn('cloudRestore: lock contention ignorée',e.message);
      // Remettre le message à zéro — ne pas laisser "Restauration..." affiché
      if(msg){msg.textContent='';msg.style.color='var(--ink-soft)';}
    } else {
      if(msg){msg.style.color='#c0392b';msg.textContent='❌ Erreur : '+e.message;}
      console.error('cloudRestore error',e);
    }
  } finally {
    // Libérer le verrou. _initialRestoreDone est mis à true UNIQUEMENT en cas de
    // succès réel (cf. corps du try). Si la restauration échoue (réseau, etc.),
    // les saves restent bloqués jusqu'au prochain cloudRestore réussi — on ne
    // veut PAS pousser au cloud avec une mémoire potentiellement vide.
    _cloudRestoreInProgress=false;
  }
}

// Auto-save toutes les 5 minutes si des données existent
function autoSave(){
  if(!jobs.length&&!cabinets.length)return;
  cloudSave();
}
setInterval(autoSave, 5*60*1000);
document.getElementById('btn-cloud-save').addEventListener('click',cloudSave);
document.getElementById('btn-cloud-restore').addEventListener('click',()=>cloudRestore(false));
document.getElementById('btn-reset-all').addEventListener('click',function(){
  if(!guardPerm('action:reset_all','⛔ Seul un admin peut effacer toutes les données.'))return;
  if(!confirm(t('confirm.clear_data')))return;
  reportAudit({action:'reset_all_confirmed',target:'local_data'});
  ['lb_jobs','lb_archive','lb_cabinets','lb_syns','lb_scans','lb_waiting','lb_conges','lb_absences','lb_techs','lb_prog_actif'].forEach(function(k){localStorage.removeItem(k);});
  localStorage.setItem('lb_techs','{}'); // nouveau départ = aucun technicien
  location.reload();
});
document.getElementById('btn-labo-name-save').addEventListener('click',function(){
  const name=document.getElementById('labo-name-input').value.trim();
  localStorage.setItem('lb_name',name);
  if(typeof _updateHeaderLabName==='function')_updateHeaderLabName();
  scheduleSave();
});
document.getElementById('btn-role-save').addEventListener('click',function(){
  const sel=document.getElementById('user-role-select');
  if(!sel)return;
  _userRole=sel.value||'admin';
  localStorage.setItem('lb_user_role',_userRole);
  applyRoleUi();
  const msg=document.getElementById('role-msg');
  if(msg){msg.textContent='Rôle appliqué : '+_userRole;}
  reportAudit({action:'role_changed',target:_userRole});
});
/* ══════════════════════════════════════════
   §24 — QUEUE (FILE D'ATTENTE)
   ══════════════════════════════════════════ */
// — Gestion clé Stripe (visibilité, sauvegarde)
function toggleStripeKeyVisibility(){
  const inp=document.getElementById('stripe-key-input');
  inp.type=inp.type==='password'?'text':'password';
}

function loadStripeKeyUI(){
  const inp=document.getElementById('stripe-key-input');
  if(!inp)return;
  inp.value='';
  const status=document.getElementById('stripe-status');
  if(status){
    status.innerHTML='<span style="color:var(--ink-soft);font-size:.72rem;">Configuration Stripe gérée côté serveur</span>';
  }
}

document.getElementById('btn-stripe-save').addEventListener('click',async function(){
  const msg=document.getElementById('stripe-msg');
  localStorage.removeItem('lb_stripe_key');
  msg.style.color='var(--ink-soft)';
  msg.textContent='La clé Stripe doit être configurée dans les variables serveur.';
  loadStripeKeyUI();
  setTimeout(function(){msg.textContent='';},4000);
});

document.getElementById('btn-legal-save').addEventListener('click',function(){
  const fields={
    'raison':   document.getElementById('legal-raison-sociale').value.trim(),
    'siret':    document.getElementById('legal-siret').value.trim(),
    'adresse':  document.getElementById('legal-adresse').value.trim(),
    'tel':      document.getElementById('legal-tel').value.trim(),
    'email':    document.getElementById('legal-email').value.trim(),
    'directeur':document.getElementById('legal-directeur').value.trim(),
    'ce_num':   document.getElementById('legal-ce-num').value.trim()
  };
  Object.keys(fields).forEach(function(k){
    if(fields[k])localStorage.setItem('lb_legal_'+k,fields[k]);
    else localStorage.removeItem('lb_legal_'+k);
  });
  scheduleSave();
  const msg=document.getElementById('legal-msg');
  msg.textContent=t('toast.legal_saved');
  setTimeout(function(){msg.textContent='';},3000);
});


// — File d'attente de programmation (queue)
let queue = JSON.parse(localStorage.getItem('lb_queue')||'[]');
queue.forEach(migrateJobDelivery);
function saveQueue(){_lastLocalMutationAt = Date.now();localStorage.setItem('lb_queue',JSON.stringify(queue));scheduleSave();}

function updateQueueBadge(){
  const n=queue.length;
  ['queue-badge-tab','queue-cnt'].forEach(function(id){
    const el=document.getElementById(id);if(!el)return;
    if(id==='queue-badge-tab'){el.style.display=n?'inline':'none';el.textContent=n;}
    else{el.textContent=n;}
  });
}

function renderQueueMain(){
  const el=document.getElementById('queue-list-main');if(!el)return;
  if(!queue.length){
    el.innerHTML='<div style="padding:14px;font-size:.78rem;color:var(--ink-soft);font-style:italic;background:var(--surface);border:1px dashed var(--border);border-radius:9px;">'+t('empty.waiting')+'</div>';
    return;
  }
  el.innerHTML='';
  queue.forEach(function(q,i){
    const cab=q.cabinet?cabinets.find(function(c){return c.id===q.cabinet;}):null;
    const div=document.createElement('div');
    div.className='queue-item'+(q.urgent?' urg':'');
    div.innerHTML=
      '<div class="queue-num">'+(i+1)+'</div>'+
      '<div class="queue-info">'+
        '<div class="queue-patient">'+(q.urgent?'🔴 ':'')+q.patient+'</div>'+
        '<div class="queue-meta">'+
          '<span class="queue-tag">'+(getJobTypeLabel(q))+'</span>'+
          (q.nb>1?'<span>'+q.nb+' éléments</span>':'')+
          (cab?'<span>🏥 '+cab.name+'</span>':'')+
          (q.prothesisId?'<span style="background:#dde8f2;color:#1a4a7a;padding:1px 8px;border-radius:99px;">#'+q.prothesisId+'</span>':'')+
          (q.note?'<span>📝 '+q.note+'</span>':'')+
        '</div>'+
        '<div class="queue-actions">'+
          '<button class="btn-q-auto" data-qid="'+q.id+'">⚡ Auto</button>'+
          '<button class="btn-q-manual" data-qid="'+q.id+'">✏️ Manuel</button>'+
          '<button class="btn-q-del" data-qid="'+q.id+'">✕ Retirer</button>'+
        '</div>'+
      '</div>';
    el.appendChild(div);
  });
}

function renderQueueSaisie(){
  const el=document.getElementById('queue-list-saisie');if(!el)return;
  if(!queue.length){el.innerHTML='<div style="padding:10px;font-size:.76rem;color:var(--ink-soft);font-style:italic;">'+t('empty.jobs')+'</div>';return;}
  el.innerHTML='';
  queue.forEach(function(q,i){
    const div=document.createElement('div');
    div.style.cssText='display:flex;align-items:center;gap:10px;padding:9px 8px;border-bottom:1px solid var(--border);font-size:.82rem;';
    const num=document.createElement('span');num.style.cssText='font-family:serif;font-size:1rem;color:#ccc;min-width:20px;';num.textContent=i+1;
    const info=document.createElement('div');info.style.flex='1';
    info.innerHTML='<b>'+(q.urgent?'🔴 ':'')+q.patient+'</b> <span style="font-size:.7rem;color:var(--ink-soft);">'+(getJobTypeLabel(q))+'</span>';
    const btn=document.createElement('button');
    btn.textContent='✕';btn.style.cssText='background:none;border:none;cursor:pointer;color:#c0a090;font-size:.9rem;';
    btn.addEventListener('click',function(){removeFromQueue(q.id);});
    div.appendChild(num);div.appendChild(info);div.appendChild(btn);
    el.appendChild(div);
  });
}

// ── Lignes extra (multi-type) ─────────────────────────────────────────────────
let _saisieLines=[];
function addSaisieLine(){
  // Choisir un type différent du type primaire pour éviter les doublons
  const primaryType=document.getElementById('saisie-it').value;
  const firstOther=customTypes.find(function(t){return t.id!==primaryType;});
  _saisieLines.push({type:firstOther?firstOther.id:primaryType,nb:1});
  renderSaisieLines();
}
function removeSaisieLine(i){_saisieLines.splice(i,1);renderSaisieLines();}
function renderSaisieLines(){
  const el=document.getElementById('saisie-extra-lines');if(!el)return;
  if(!_saisieLines.length){el.innerHTML='';return;}
  el.innerHTML='<div style="margin-top:8px;display:flex;flex-direction:column;gap:6px;">'
    +_saisieLines.map(function(l,i){
      const opts=customTypes.map(function(t){
        return '<option value="'+t.id+'"'+(t.id===l.type?' selected':'')+'>'+escH(t.label)+'</option>';
      }).join('');
      return '<div style="display:flex;gap:8px;align-items:center;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:7px 10px;">'
        +'<span style="font-size:.7rem;color:var(--ink-soft);white-space:nowrap;">+ Type</span>'
        +'<select onchange="_saisieLines['+i+'].type=this.value" style="flex:2;font-size:.8rem;padding:4px 6px;border:1px solid var(--border);border-radius:6px;background:var(--bg);">'+opts+'</select>'
        +'<input type="number" min="1" max="20" value="'+l.nb+'" oninput="_saisieLines['+i+'].nb=parseInt(this.value)||1" style="width:60px;font-size:.8rem;padding:4px 6px;border:1px solid var(--border);border-radius:6px;text-align:center;">'
        +'<button onclick="removeSaisieLine('+i+')" style="background:none;border:none;cursor:pointer;color:#c0392b;font-size:1rem;padding:0 4px;">✕</button>'
        +'</div>';
    }).join('')+'</div>';
}
function getSaisieItems(primaryType,primaryNb){
  const items=[{type:primaryType,nb:primaryNb}];
  _saisieLines.forEach(function(l){items.push({type:l.type,nb:l.nb});});
  return items;
}
function resetSaisieLines(){_saisieLines=[];renderSaisieLines();}

// ── Lignes extra pour le formulaire Programmation (pane-accueil) ─────────────
let _progLines=[];
function addProgLine(){
  const primaryType=document.getElementById('it').value;
  const firstOther=customTypes.find(function(t){return t.id!==primaryType;});
  _progLines.push({type:firstOther?firstOther.id:primaryType,nb:1});
  renderProgLines();
}
function removeProgLine(i){_progLines.splice(i,1);renderProgLines();}
function renderProgLines(){
  const el=document.getElementById('accueil-extra-lines');if(!el)return;
  if(!_progLines.length){el.innerHTML='';return;}
  el.innerHTML='<div style="margin-top:8px;display:flex;flex-direction:column;gap:6px;">'
    +_progLines.map(function(l,i){
      const opts=customTypes.map(function(t){
        return '<option value="'+t.id+'"'+(t.id===l.type?' selected':'')+'>'+escH(t.label)+'</option>';
      }).join('');
      return '<div style="display:flex;gap:8px;align-items:center;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:7px 10px;">'
        +'<span style="font-size:.7rem;color:var(--ink-soft);white-space:nowrap;">+ Type</span>'
        +'<select onchange="_progLines['+i+'].type=this.value" style="flex:2;font-size:.8rem;padding:4px 6px;border:1px solid var(--border);border-radius:6px;background:var(--bg);">'+opts+'</select>'
        +'<input type="number" min="1" max="20" value="'+l.nb+'" oninput="_progLines['+i+'].nb=parseInt(this.value)||1" style="width:60px;font-size:.8rem;padding:4px 6px;border:1px solid var(--border);border-radius:6px;text-align:center;">'
        +'<button onclick="removeProgLine('+i+')" style="background:none;border:none;cursor:pointer;color:#c0392b;font-size:1rem;padding:0 4px;">✕</button>'
        +'</div>';
    }).join('')+'</div>';
}
function getProgItems(primaryType,primaryNb){
  const items=[{type:primaryType,nb:primaryNb}];
  _progLines.forEach(function(l){items.push({type:l.type,nb:l.nb});});
  return items;
}
function resetProgLines(){_progLines=[];renderProgLines();}
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

// Ajoute un travail à la file d'attente de programmation (mode prog ON)
// Crée un élément de queue par type de travail saisi
function _readMissingItems(){
  var chk=document.getElementById('saisie-imissing');
  if(!chk||!chk.checked)return [];
  return _readMissingItemsFromSaisie();
}

function addToQueue(){
  const name=document.getElementById('saisie-ip').value.trim();
  const type=document.getElementById('saisie-it').value;
  const nb=parseInt(document.getElementById('saisie-inb').value)||1;
  const note=document.getElementById('saisie-inote').value.trim();
  const deliv=readSaisieDeliveryFields();
  const cabEl=document.getElementById('saisie-icab');const cab=cabEl?cabEl.value:'';
  const urg=document.getElementById('saisie-iurg').checked;
  const emp=document.getElementById('saisie-iemp')?.checked||false;
  const missingItems=_readMissingItems();
  if(!name){alert(t('alert.enter_patient'));return;}
  const allItems=getSaisieItems(type,nb);
  const queueItem=applyDeliveryFieldsToObject({id:String(Date.now()),patient:name,type:allItems[0].type,nb:allItems[0].nb,items:allItems,note,cabinet:cab,urgent:urg,emp:emp||false,createdAt:new Date().toISOString()},deliv);
  if(missingItems.length){queueItem.missingInfoItems=missingItems;}
  queue.push(queueItem);
  saveQueue();
  // Reset
  document.getElementById('saisie-ip').value='';
  document.getElementById('saisie-inb').value='1';
  document.getElementById('saisie-inote').value='';
  resetSaisieDeliveryFields();
  document.getElementById('saisie-iurg').checked=false;
  const saisieEmp=document.getElementById('saisie-iemp');if(saisieEmp)saisieEmp.checked=false;
  const saisieEmpWrap=document.getElementById('saisie-emp-wrap');if(saisieEmpWrap)saisieEmpWrap.style.display='none';
  _resetSaisieMissingState();
  resetSaisieLines();
  updateQueueBadge();
  renderQueueMain();
}

// Ajout direct sans scheduling (mode prog OFF)
function addDirect(){
  const name=document.getElementById('saisie-ip').value.trim();
  const type=document.getElementById('saisie-it').value;
  const nb=parseInt(document.getElementById('saisie-inb').value)||1;
  const note=document.getElementById('saisie-inote').value.trim();
  const deliv=readSaisieDeliveryFields();
  const cabEl=document.getElementById('saisie-icab');const cab=cabEl?cabEl.value:'';
  const urg=document.getElementById('saisie-iurg').checked;
  const missingItems=_readMissingItems();
  if(!name){alert(t('alert.enter_patient'));return;}
  const allItems=getSaisieItems(type,nb);
  const job=applyDeliveryFieldsToObject({id:String(Date.now()),patient:name,type:allItems[0].type,tasks:[],nb:allItems[0].nb,items:allItems,note,cabinet:cab,urgent:urg,createdAt:new Date().toISOString(),trackCode:genTrackCode(),prothesisId:''},deliv);
  if(missingItems.length){job.missingInfoItems=missingItems;}
  jobs.push(job);saveJobs();
  document.getElementById('saisie-ip').value='';
  document.getElementById('saisie-inb').value='1';
  document.getElementById('saisie-inote').value='';
  resetSaisieDeliveryFields();
  document.getElementById('saisie-iurg').checked=false;
  _resetSaisieMissingState();
  resetSaisieLines();
  render();
}

function removeFromQueue(id){
  queue=queue.filter(function(q){return q.id!==id;});
  saveQueue();updateQueueBadge();renderQueueMain();renderQueueSaisie();
}

// Programme automatiquement un item de la queue (affectation auto des techs)
// Labels d'étapes "communes" placées en début ou fin lors d'une session multi-types
const SHARED_START_STEPS=['Récupération fichiers empreinte optique','Scan & impression modèle'];
const SHARED_END_STEPS=['Impression du modèle'];

// Construit la liste fusionnée d'étapes pour multi-types :
// - étapes communes (scan/recup/impression) dédoublonnées, placées en début/fin
// - étapes spécifiques à chaque type dans leur ordre naturel
// Retourne [{label, tech, typeIdx}, ...] sans dates (assignées plus tard)
function buildMergedStepList(items,emp){
  const tmpBase=new Date();
  const seenLabels=new Set();
  const startSteps=[],coreSteps=[],endSteps=[];
  items.forEach(function(item,idx){
    const tasks=buildTasks(item.type,emp,null,tmpBase);
    tasks.forEach(function(t){
      if(seenLabels.has(t.label))return;
      seenLabels.add(t.label);
      const s={label:t.label,tech:t.tech,typeIdx:idx};
      if(SHARED_START_STEPS.includes(t.label))startSteps.push(s);
      else if(SHARED_END_STEPS.includes(t.label))endSteps.push(s);
      else coreSteps.push(s);
    });
  });
  return[...startSteps,...coreSteps,...endSteps];
}

function programQueueAuto(id){
  const q=queue.find(function(x){return x.id===id;});if(!q)return;
  _debugAuditLog('H2','Desktop programQueueAuto start',{qid:id,queueSize:(queue||[]).length,patientCodePresent:!!q.patient});
  const items=q.items&&q.items.length?q.items:[{type:q.type,nb:q.nb||1}];
  const base=new Date();
  let allTasks;
  if(items.length===1){
    allTasks=buildTasks(items[0].type,q.emp||false,null,base);
  } else {
    // Multi-types : étapes fusionnées, dédoublonnées, séquentielles
    const steps=buildMergedStepList(items,q.emp||false);
    allTasks=steps.map(function(s,i){return{label:s.label,tech:s.tech,dueDate:addWD(base,i+1).toISOString(),done:false};});
  }
  if(!allTasks.length){alert(t('alert.unknown_type'));return;}
  const qJob=applyDeliveryFieldsToObject({id:String(Date.now()),patient:q.patient,type:items[0].type,tasks:allTasks,nb:items[0].nb||1,items:items,urgent:q.urgent||false,note:q.note||'',cabinet:q.cabinet||'',createdAt:q.createdAt,trackCode:genTrackCode(),prothesisId:q.prothesisId||''},_deliveryFieldsFromSource(q));
  jobs.push(qJob);
  removeFromQueue(id);saveJobs();render();autoPublishCab(q.cabinet||'');
  if(typeof cloudSave==='function'){cloudSave();}
}

/* ══════════════════════════════════════════
   §25 — FACTURATION / INVOICES
   ══════════════════════════════════════════ */
// — Modale de programmation manuelle depuis la queue
let mmQueueId=null;
let mmSteps=[];

// Ouvre la modale de programmation manuelle (choix tech par étape)
// mmSteps = [{label, tech, dueDate, typeIdx, deleted, isDuplicate}]
// mmItems = [{type, nb, typeLabel}]
let mmItems=[];
function openManualModal(id){
  const q=queue.find(function(x){return x.id===id;});if(!q)return;
  mmQueueId=id;
  mmSteps=[];
  mmItems=[];
  const items=q.items&&q.items.length?q.items:[{type:q.type,nb:q.nb||1}];
  let anyStep=false;
  items.forEach(function(item){
    const ct=customTypes.find(function(c){return c.id===item.type;});
    const typeLabel=ct?ct.label:(TYPE_LABELS[item.type]||item.type);
    mmItems.push({type:item.type,nb:item.nb||1,typeLabel:typeLabel});
  });
  // Construire les étapes (fusionnées si multi-types), avec un numéro de jour par défaut
  const rawSteps=items.length===1
    ?buildTasks(items[0].type,q.emp||false,null).map(function(t,i){return{label:t.label,tech:t.tech,typeIdx:0,day:i+1};})
    :buildMergedStepList(items,q.emp||false).map(function(s,i){return Object.assign({},s,{day:i+1});});
  if(!rawSteps.length){alert(t('alert.unknown_type'));return;}
  mmSteps=rawSteps.map(function(s){return Object.assign({},s,{deleted:false});});
  document.getElementById('mm-title').textContent=q.patient;
  document.getElementById('mm-type-lbl').textContent=getJobTypeLabel(q);
  document.getElementById('mm-start').value=fmtISO(new Date());
  renderMmSteps();
  document.getElementById('mm-modal').style.display='flex';
}

function renderMmSteps(){
  const el=document.getElementById('mm-steps');if(!el)return;
  el.innerHTML='';
  let lastTypeIdx=-1;
  let activeCounter=0;
  mmSteps.forEach(function(step,i){
    // Séparateur de section (multi-types seulement)
    if(mmItems.length>1&&step.typeIdx!==lastTypeIdx){
      lastTypeIdx=step.typeIdx;
      const sep=document.createElement('div');
      sep.style.cssText='font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--accent);background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:4px 10px;margin:10px 0 4px;';
      if(step.typeIdx===-1)sep.textContent='Étapes communes';
      else if(step.typeIdx===999)sep.textContent='Étapes communes (fin)';
      else sep.textContent=mmItems[step.typeIdx]?mmItems[step.typeIdx].typeLabel:'';
      el.appendChild(sep);
    }
    const div=document.createElement('div');
    div.className='mm-step-row';
    div.style.cssText=step.deleted?'opacity:.45;background:var(--surface);border:1px dashed var(--border);border-radius:8px;padding:8px 10px;margin-bottom:6px;':'';
    // En-tête ligne
    const header=document.createElement('div');
    header.style.cssText='display:flex;align-items:center;gap:8px;margin-bottom:'+(step.deleted?'0':'8px')+';';
    // Calcul de la date réelle pour ce jour
    const _startVal=document.getElementById('mm-start')?.value;
    const _sd=_startVal?new Date(_startVal+'T12:00:00'):new Date();
    const _stepDate=addWDC(_sd,Math.max(1,step.day||1));
    const _dateISO=fmtISO(_stepDate);
    const _isConge=conges.includes(_dateISO);
    const _isTechOff=step.tech&&step.tech!=='auto'&&isTechAbsent(step.tech,_stepDate);
    const _warn=_isConge||_isTechOff;
    const _dateLbl=_stepDate.toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'});
    // Champ jour éditable
    const dayInput=document.createElement('input');
    dayInput.type='number';dayInput.min='1';dayInput.max='99';dayInput.value=step.day||1;
    dayInput.style.cssText='width:52px;font-size:.8rem;padding:3px 6px;border:1px solid var(--border);border-radius:6px;text-align:center;'+(step.deleted?'opacity:.5;':'');
    dayInput.title='Jour (J+N)';
    dayInput.addEventListener('input',function(){mmSteps[i].day=parseInt(this.value)||1;renderMmSteps();});
    const dayLbl=document.createElement('span');
    dayLbl.style.cssText='font-size:.75rem;color:var(--ink-soft);white-space:nowrap;';
    dayLbl.textContent='J+';
    // Badge date
    const dateBadge=document.createElement('span');
    dateBadge.style.cssText='font-size:.7rem;padding:2px 8px;border-radius:5px;white-space:nowrap;'+(_warn?'background:#fff3cd;color:#856404;border:1px solid #ffc107;font-weight:600;':'background:var(--surface);color:var(--ink-soft);border:1px solid var(--border);');
    dateBadge.textContent=_dateLbl+(_isConge?' ⚠ Jour férié':_isTechOff?' ⚠ Tech absent':'');
    const lbl=document.createElement('div');
    lbl.style.cssText='font-size:.82rem;font-weight:500;flex:1;'+(step.deleted?'text-decoration:line-through;color:var(--ink-soft);':'');
    lbl.textContent=step.label;
    header.appendChild(dayLbl);
    header.appendChild(dayInput);
    header.appendChild(dateBadge);
    header.appendChild(lbl);
    // Bouton action
    const actionBtn=document.createElement('button');
    actionBtn.style.cssText='background:none;border:none;cursor:pointer;font-size:.78rem;padding:2px 6px;border-radius:4px;white-space:nowrap;'+(step.deleted?'color:var(--accent);':'color:#c0392b;');
    actionBtn.textContent=step.deleted?'↩ Restaurer':'✕ Supprimer';
    actionBtn.addEventListener('click',function(){mmSteps[i].deleted=!mmSteps[i].deleted;renderMmSteps();});
    header.appendChild(actionBtn);
    div.appendChild(header);
    // Sélection tech (masquée si supprimée)
    if(!step.deleted){
      const techDiv=document.createElement('div');
      Object.keys(TECHS).forEach(function(k){
        const btn=document.createElement('button');
        btn.className='mm-tech-btn'+(step.tech===k?' sel':'');
        btn.style.borderColor=step.tech===k?TECHS[k].color:'';
        btn.style.background=step.tech===k?TECHS[k].soft:'';
        const dot=document.createElement('span');
        dot.style.cssText='display:inline-block;width:8px;height:8px;border-radius:50%;background:'+TECHS[k].color+';margin-right:4px;';
        btn.appendChild(dot);
        btn.appendChild(document.createTextNode(TECHS[k].label));
        btn.addEventListener('click',function(){mmSteps[i].tech=k;renderMmSteps();});
        techDiv.appendChild(btn);
      });
      div.appendChild(techDiv);
    }
    el.appendChild(div);
  });
}

function confirmManual(){
  const q=queue.find(function(x){return x.id===mmQueueId;});if(!q)return;
  const startVal=document.getElementById('mm-start').value;
  const startDate=startVal?new Date(startVal+'T12:00:00'):new Date();
  const items=q.items&&q.items.length?q.items:[{type:q.type,nb:q.nb||1}];
  // Construire la liste finale des tâches (étapes non supprimées)
  // Le jour de chaque étape est celui saisi par l'utilisateur (s.day)
  const activeSteps=mmSteps.filter(function(s){return !s.deleted;});
  const tasks=activeSteps.map(function(s){
    return{label:s.label,tech:s.tech,dueDate:addWDC(startDate,Math.max(1,s.day||1)).toISOString(),done:false};
  });
  if(!tasks.length){alert(t('alert.add_step'));return;}
  const mmJob=applyDeliveryFieldsToObject({id:String(Date.now()),patient:q.patient,type:items[0].type,tasks:tasks,nb:items[0].nb||1,items:items,urgent:q.urgent||false,note:q.note||'',cabinet:q.cabinet||'',createdAt:q.createdAt,trackCode:genTrackCode(),prothesisId:q.prothesisId||''},_deliveryFieldsFromSource(q));
  jobs.push(mmJob);
  removeFromQueue(mmQueueId);saveJobs();render();autoPublishCab(q.cabinet||'');
  if(typeof cloudSave==='function'){cloudSave();}
  document.getElementById('mm-modal').style.display='none';
  mmQueueId=null;
}

document.getElementById('btn-mm-ok').addEventListener('click',confirmManual);
document.getElementById('btn-mm-cancel').addEventListener('click',function(){document.getElementById('mm-modal').style.display='none';});
document.getElementById('mm-start').addEventListener('input',renderMmSteps);

// Sync saisie-icab with cabinets


function renderTarifTypeSel(){
  const el=document.getElementById('tarif-type-sel');if(!el)return;
  const types=Object.entries(TYPE_LABELS);
  el.innerHTML=types.map(function(e){
    return '<label style="display:flex;align-items:center;gap:4px;font-size:.72rem;cursor:pointer;padding:3px 7px;background:var(--surface);border:1px solid var(--border);border-radius:5px;">'+
      '<input type="checkbox" value="'+e[0]+'" style="accent-color:var(--accent);"/>'+
      e[1]+'</label>';
  }).join('');
}

function convertToFacture(devisId){
  const devis=documents.find(function(d){return d.id===devisId;});
  if(!devis){return;}
  if(!confirm(ti('confirm.quote_to_invoice',{num:devis.num})))return;
  const newDoc={
    id:String(Date.now()),
    num:genDocNum('facture'),
    type:'facture',
    cabinet:devis.cabinet,
    cabName:devis.cabName,
    date:fmtISO(new Date()),
    note:devis.note,
    lines:JSON.parse(JSON.stringify(devis.lines)),
    total:devis.total,
    jobId:devis.jobId||null,
    jobLabel:devis.jobLabel||'',
    status:'brouillon',
    convertedFrom:devis.num,
    createdAt:new Date().toISOString()
  };
  // Mark devis as converted
  devis.status='annule';
  devis.convertedTo=newDoc.num;
  documents.unshift(newDoc);
  saveDocs();renderToInvoice();renderBillDocs();updateBillStats();
  // Show confirmation
  const msg=document.createElement('div');
  msg.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#2a6049;color:#fff;padding:12px 24px;border-radius:10px;font-family:monospace;font-size:.84rem;font-weight:500;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.2);';
  msg.textContent=ti('toast.invoice_from_quote',{invoice:newDoc.num,quote:devis.num});
  document.body.appendChild(msg);
  setTimeout(function(){msg.remove();},3000);
}

function syncBillCab(){
  const sel=document.getElementById('bill-cab');if(!sel)return;
  sel.innerHTML='<option value="">'+t('select.select')+'</option>'+
    cabinets.map(function(c){return '<option value="'+c.id+'">'+c.name+'</option>';}).join('');
}

function syncSaisieCab(){
  const sel=document.getElementById('saisie-icab');if(!sel)return;
  sel.innerHTML='<option value="">'+t('form.none')+'</option>'+cabinets.map(function(c){return '<option value="'+c.id+'">'+c.name+'</option>';}).join('');
}


// — Documents de facturation (factures, devis, avoirs)
let documents = JSON.parse(localStorage.getItem('lb_docs')||'[]');
let tarifs    = JSON.parse(localStorage.getItem('lb_tarifs')||'[]');
function saveDocs(){localStorage.setItem('lb_docs',JSON.stringify(documents));scheduleSave();}
function saveTarifs(){localStorage.setItem('lb_tarifs',JSON.stringify(tarifs));scheduleSave();}

let billType = 'facture'; // current doc type being edited
let billLines = []; // current lines
let editDocId = null;

function genDocNum(type){
  const year=new Date().getFullYear();
  const prefix=type==='devis'?'DEV':type==='avoir'?'AVO':'FAC';
  const existing=documents.filter(d=>d.type===type&&d.num&&d.num.includes(String(year)));
  const next=existing.length+1;
  return prefix+'-'+year+'-'+String(next).padStart(3,'0');
}

function fmtEur(n){return n.toFixed(2).replace('.',',')+'\u00a0€';}

function openBillForm(type){
  billType=type;
  billLines=[];
  editDocId=null;
  document.getElementById('bill-form').style.display='block';
  document.getElementById('bill-type-lbl').textContent=type==='devis'?'📋 Devis':'🧾 Facture';
  document.getElementById('bill-date').value=fmtISO(new Date());
  document.getElementById('bill-note').value='';
  document.getElementById('bill-cab').value='';
  // Pre-fill lines from tarifs
  billLines=tarifs.map(function(t){return {label:t.label,qty:1,prix:t.prix};});
  if(!billLines.length)billLines=[{label:'',qty:1,prix:0}];
  // Fill job select
  const jobSel=document.getElementById('bill-job');
  jobSel.innerHTML='<option value="">'+t('form.none')+'</option>'+
    jobs.map(function(j){return '<option value="'+j.id+'" data-type="'+j.type+'">'+j.patient+' ('+getJobTypeLabel(j)+')</option>';}).join('');
  // When job changes, pre-fill lines from job type tarifs
  jobSel.onchange=function(){
    const opt=this.options[this.selectedIndex];
    const type=opt?opt.dataset.type:'';
    if(type){
      const typeTarifs=tarifs.filter(function(t){return t.types&&t.types.includes(type);});
      if(typeTarifs.length){
        billLines=typeTarifs.map(function(t){return {label:t.label,qty:1,prix:t.prix};});
        renderBillLines();updateBillTotal();
      }
    }
  };
  renderBillLines();
  updateBillTotal();
  document.getElementById('bill-form').scrollIntoView({behavior:'smooth'});
}

function renderBillLines(){
  const el=document.getElementById('bill-lines');if(!el)return;
  el.innerHTML='';
  billLines.forEach(function(line,i){
    const row=document.createElement('div');
    row.style.cssText='display:grid;grid-template-columns:1fr 60px 80px 24px;gap:6px;align-items:center;margin-bottom:8px;';
    row.innerHTML=
      '<input type="text" placeholder="Prestation..." value="'+line.label+'" '+
        'style="border:1.5px solid var(--border);border-radius:6px;padding:7px 9px;font-family:monospace;font-size:.8rem;background:var(--bg);color:var(--ink);outline:none;" '+
        'oninput="billLines['+i+'].label=this.value"/>'+
      '<input type="number" min="1" value="'+line.qty+'" '+
        'style="border:1.5px solid var(--border);border-radius:6px;padding:7px 6px;font-family:monospace;font-size:.8rem;background:var(--bg);color:var(--ink);outline:none;text-align:center;" '+
        'oninput="billLines['+i+'].qty=parseFloat(this.value)||1;updateBillTotal()"/>'+
      '<input type="number" min="0" step="0.01" value="'+line.prix+'" '+
        'style="border:1.5px solid var(--border);border-radius:6px;padding:7px 6px;font-family:monospace;font-size:.8rem;background:var(--bg);color:var(--ink);outline:none;text-align:right;" '+
        'oninput="billLines['+i+'].prix=parseFloat(this.value)||0;updateBillTotal()"/>'+
      '<button onclick="billLines.splice('+i+',1);renderBillLines();updateBillTotal();" '+
        'style="background:none;border:none;cursor:pointer;color:#c0a090;font-size:1rem;padding:0;">✕</button>';
    el.appendChild(row);
  });
  // Column headers
  const hdr=document.createElement('div');
  hdr.style.cssText='display:grid;grid-template-columns:1fr 60px 80px 24px;gap:6px;font-size:.62rem;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-soft);margin-bottom:4px;';
  hdr.innerHTML='<span>'+t('bill.service')+'</span><span style="text-align:center">'+t('bdc.col.qty')+'</span><span style="text-align:right">'+t('bill.unit_price')+'</span><span></span>';
  el.insertBefore(hdr, el.firstChild);
}

function updateBillTotal(){
  const total=billLines.reduce(function(s,l){return s+(l.qty||1)*(l.prix||0);},0);
  const st=document.getElementById('bill-subtotal');
  const tt=document.getElementById('bill-total');
  if(st)st.textContent=fmtEur(total);
  if(tt)tt.textContent=fmtEur(total);
}

// Sauvegarde (création ou mise à jour) d'un document de facturation
function saveBillDoc(){
  const cab=document.getElementById('bill-cab').value;
  const date=document.getElementById('bill-date').value;
  const note=document.getElementById('bill-note').value.trim();
  const jobId=document.getElementById('bill-job').value;
  const lines=billLines.filter(function(l){return l.label.trim();});
  if(!cab){alert(t('alert.select_cab'));return;}
  if(!lines.length){alert(t('alert.add_line'));return;}
  const total=lines.reduce(function(s,l){return s+(l.qty||1)*(l.prix||0);},0);
  const cab_obj=cabinets.find(function(c){return c.id===cab;});
  const job_obj=jobId?jobs.find(function(j){return j.id===jobId;}):null;
  if(editDocId){
    const doc=documents.find(function(d){return d.id===editDocId;});
    if(doc){Object.assign(doc,{cabinet:cab,date,note,lines,total,jobId:jobId||null,updatedAt:new Date().toISOString()});}
  } else {
    documents.unshift({
      id:String(Date.now()),
      num:genDocNum(billType),
      type:billType,
      cabinet:cab,
      cabName:cab_obj?cab_obj.name:'',
      date,note,lines,total,
      jobId:jobId||null,
      jobLabel:job_obj?job_obj.patient+' ('+(TYPE_LABELS[job_obj.type]||job_obj.type)+')':'',
      status:'brouillon',
      createdAt:new Date().toISOString()
    });
  }
  saveDocs();
  document.getElementById('bill-form').style.display='none';
  renderToInvoice();renderToInvoice();renderBillDocs();updateBillStats();
}

// Rendu de la liste des documents de facturation avec filtres et actions
function renderBillDocs(){
  const el=document.getElementById('bill-docs-list');if(!el)return;
  const filterStatus=document.getElementById('bill-filter-status')?.value||'';
  const filterType=document.getElementById('bill-filter-type')?.value||'';
  let docs=[...documents];
  if(filterStatus)docs=docs.filter(function(d){return d.status===filterStatus;});
  if(filterType)docs=docs.filter(function(d){return d.type===filterType;});
  const cnt=document.getElementById('bill-docs-cnt');
  if(cnt)cnt.textContent=docs.length;
  if(!docs.length){el.innerHTML='<div style="padding:14px;font-size:.76rem;color:var(--ink-soft);font-style:italic;">'+t('empty.docs')+'</div>';return;}
  el.innerHTML='';
  const now=new Date();
  docs.forEach(function(doc){
    const div=document.createElement('div');
    div.className='doc-card';
    const statusLabels={brouillon:t('status.brouillon'),envoye:t('status.envoye'),paye:t('status.paye'),annule:t('status.annule'),avoir:t('status.avoir')};
    const locked = doc.type==='facture' && (doc.status==='envoye'||doc.status==='paye');
    // Retard : facture envoyée depuis >30 jours
    const isOverdue = doc.type==='facture'&&doc.status==='envoye'&&doc.date&&
      ((now - new Date(doc.date+'T12:00:00'))/(1000*60*60*24)>30);
    const typeIcon=doc.type==='devis'?'📋 Devis':doc.type==='avoir'?'↩️ Avoir':'🧾 Facture';
    const cab=cabinets.find(function(c){return c.id===doc.cabinet;});
    const hasEmail=!!(cab&&cab.email);
    div.innerHTML=
      '<div style="flex:1;">'+
        '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;flex-wrap:wrap;">'+
          '<span class="doc-num">'+doc.num+'</span>'+
          '<span class="doc-status st-'+doc.status+'">'+(statusLabels[doc.status]||doc.status)+'</span>'+
          '<span style="font-size:.7rem;color:var(--ink-soft);">'+typeIcon+'</span>'+
          (locked?'<span style="font-size:.62rem;background:#fff3cd;color:#856404;padding:1px 6px;border-radius:99px;font-weight:600;">🔒</span>':'')+
          (isOverdue?'<span style="font-size:.62rem;background:#fdecea;color:#c0392b;padding:1px 7px;border-radius:99px;font-weight:700;">⏰ EN RETARD</span>':'')+
          (doc.avoirOf?'<span style="font-size:.62rem;background:#e8eef9;color:#1a3a7a;padding:1px 6px;border-radius:99px;">sur '+doc.avoirOf+'</span>':'')+
        '</div>'+
        '<div style="font-weight:500;font-size:.88rem;">'+doc.cabName+'</div>'+
        (doc.jobLabel?'<div style="font-size:.72rem;color:var(--ink-soft);">'+doc.jobLabel+'</div>':'')+
        '<div style="font-size:.7rem;color:var(--ink-soft);">'+new Date(doc.date+'T12:00:00').toLocaleDateString('fr-FR')+
          (doc.type==='facture'&&doc.status!=='paye'?' · Éch. '+new Date(new Date(doc.date+'T12:00:00').getTime()+30*864e5).toLocaleDateString('fr-FR'):'')+'</div>'+
      '</div>'+
      '<div style="text-align:right;flex-shrink:0;">'+
        '<div style="font-family:serif;font-size:1.1rem;font-weight:700;color:'+(doc.total<0?'#1a4a7a':'var(--accent)')+';">'+fmtEur(doc.total)+'</div>'+
        '<div style="display:flex;gap:4px;margin-top:6px;flex-wrap:wrap;justify-content:flex-end;">'+
          '<button data-docid="'+doc.id+'" data-action="pdf" style="background:var(--ink);color:#fff;border:none;border-radius:5px;padding:4px 8px;font-family:monospace;font-size:.63rem;cursor:pointer;">📄 PDF</button>'+
          (doc.type==='facture'&&doc.status!=='brouillon'&&hasEmail?'<button data-docid="'+doc.id+'" data-action="email" style="background:#5a3472;color:#fff;border:none;border-radius:5px;padding:4px 8px;font-family:monospace;font-size:.63rem;cursor:pointer;">📧 Email</button>':'')+
          (doc.status==='brouillon'?'<button data-docid="'+doc.id+'" data-action="envoye" style="background:#1a4a7a;color:#fff;border:none;border-radius:5px;padding:4px 8px;font-family:monospace;font-size:.63rem;cursor:pointer;">📤 Envoyer</button>':'')+
          (doc.status==='envoye'?'<button data-docid="'+doc.id+'" data-action="paye" style="background:#2a6049;color:#fff;border:none;border-radius:5px;padding:4px 8px;font-family:monospace;font-size:.63rem;cursor:pointer;">✅ Payé</button>':'')+
          (doc.type==='facture'&&doc.status==='envoye'?'<button data-docid="'+doc.id+'" data-action="stripe-pay" style="background:'+(doc.stripeUrl?'#5a3472':'#1a4a7a')+';color:#fff;border:none;border-radius:5px;padding:4px 8px;font-family:monospace;font-size:.63rem;cursor:pointer;" title="'+(doc.stripeUrl?'Lien déjà généré — cliquer pour copier à nouveau':'Générer un lien de paiement en ligne')+'">'+(doc.stripeUrl?'🔗 Copier lien':'🔗 Lien paiement')+'</button>':'')+
          (isOverdue?'<button data-docid="'+doc.id+'" data-action="relance" style="background:#c8410a;color:#fff;border:none;border-radius:5px;padding:4px 8px;font-family:monospace;font-size:.63rem;cursor:pointer;">🔔 Relancer</button>':'')+
          (locked?'<button data-docid="'+doc.id+'" data-action="avoir" style="background:none;border:1px solid #1a3a7a;border-radius:5px;padding:4px 8px;font-family:monospace;font-size:.63rem;cursor:pointer;color:#1a3a7a;">↩️ Avoir</button>':'')+
          (doc.type==='devis'&&doc.status!=='annule'?'<button data-docid="'+doc.id+'" data-action="convert" style="background:#8b4513;color:#fff;border:none;border-radius:5px;padding:4px 8px;font-family:monospace;font-size:.63rem;cursor:pointer;">🧾→Facture</button>':'')+
          (doc.status!=='brouillon'&&cab?'<button data-docid="'+doc.id+'" data-action="resync" style="background:none;border:1px solid var(--border);border-radius:5px;padding:4px 8px;font-family:monospace;font-size:.63rem;cursor:pointer;color:var(--ink-soft);" title="Renvoyer au portail dentiste">🔄</button>':'')+
          (!locked&&doc.type!=='avoir'?'<button data-docid="'+doc.id+'" data-action="delete" style="background:none;border:1px solid var(--border);border-radius:5px;padding:4px 8px;font-family:monospace;font-size:.63rem;cursor:pointer;color:var(--ink-soft);">🗑️</button>':'')+
        '</div>'+
      '</div>';
    el.appendChild(div);
  });
}

// — Vue récapitulative des BLs non encore facturés par cabinet
function renderToInvoice(){
  const el=document.getElementById('to-invoice-list');if(!el)return;
  // Regrouper les BLs non facturés par cabinet
  const pending=bdl.filter(function(b){return !b.invoiced;});
  const byCab={};
  pending.forEach(function(b){
    if(!byCab[b.cabinet])byCab[b.cabinet]={cab:cabinets.find(function(c){return c.id===b.cabinet;})||{id:b.cabinet,name:b.cabName||'Cabinet'},bls:[]};
    byCab[b.cabinet].bls.push(b);
  });
  const entries=Object.values(byCab);
  if(!entries.length){
    el.innerHTML='<div style="text-align:center;padding:20px 0;color:var(--ink-soft);font-size:.82rem;">'+
      '<div style="font-size:1.5rem;margin-bottom:8px;">✅</div>'+
      'Tous les bons de livraison<br/>sont facturés.</div>';
    return;
  }
  el.innerHTML='';
  entries.sort(function(a,b){return (a.cab.name||'').localeCompare(b.cab.name||'');});
  entries.forEach(function(entry){
    const cab=entry.cab;
    const bls=entry.bls;
    const total=bls.reduce(function(s,b){return s+(b.total||0);},0);
    const dates=bls.map(function(b){return b.date;}).filter(Boolean).sort();
    const dateRange=dates.length===1
      ? new Date(dates[0]+'T12:00:00').toLocaleDateString('fr-FR',{day:'2-digit',month:'short'})
      : new Date(dates[0]+'T12:00:00').toLocaleDateString('fr-FR',{day:'2-digit',month:'short'})+
        ' → '+new Date(dates[dates.length-1]+'T12:00:00').toLocaleDateString('fr-FR',{day:'2-digit',month:'short'});
    const div=document.createElement('div');
    div.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 13px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg);margin-bottom:8px;';
    div.innerHTML=
      '<div style="flex:1;min-width:0;">'+
        '<div style="font-weight:600;font-size:.88rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+cab.name+'</div>'+
        '<div style="font-size:.71rem;color:var(--ink-soft);margin-top:2px;">'+
          bls.length+' bon'+(bls.length>1?'s':'')+' · '+dateRange+
        '</div>'+
      '</div>'+
      '<div style="text-align:right;flex-shrink:0;">'+
        '<div style="font-family:\'Inter\',sans-serif;font-weight:700;font-size:1rem;font-weight:700;color:var(--accent);">'+fmtEur(total)+'</div>'+
        '<button data-toinv-cab="'+cab.id+'" style="margin-top:4px;background:#5a3472;color:#fff;border:none;border-radius:6px;padding:4px 10px;font-family:monospace;font-size:.68rem;font-weight:600;cursor:pointer;white-space:nowrap;">🧾 Facturer</button>'+
      '</div>';
    el.appendChild(div);
  });
}

function updateBillStats(){
  const now=new Date();
  const thisMonth=documents.filter(function(d){
    const dd=new Date(d.date);return dd.getMonth()===now.getMonth()&&dd.getFullYear()===now.getFullYear()&&d.type==='facture'&&d.status!=='annule';
  });
  const cnt=document.getElementById('bill-cnt-month');
  const tot=document.getElementById('bill-total-month');
  const unpaid=document.getElementById('bill-unpaid');
  const overdue=document.getElementById('bill-overdue');
  if(cnt)cnt.textContent=thisMonth.length;
  if(tot)tot.textContent=fmtEur(thisMonth.reduce(function(s,d){return s+d.total;},0));
  const unpaidDocs=documents.filter(function(d){return d.type==='facture'&&d.status==='envoye';});
  if(unpaid)unpaid.textContent=fmtEur(unpaidDocs.reduce(function(s,d){return s+d.total;},0));
  const overdueDocs=unpaidDocs.filter(function(d){return d.date&&((now-new Date(d.date+'T12:00:00'))/(1000*60*60*24)>30);});
  if(overdue){
    overdue.textContent=overdueDocs.length;
    const card=overdue.closest('.kcard');
    if(card)card.style.borderColor=overdueDocs.length>0?'#c0392b':'var(--border)';
    if(card)card.style.background=overdueDocs.length>0?'#fdf0ea':'';
  }
}

function renderTypePrices(){
  const el=document.getElementById('type-prices-list');if(!el)return;
  if(!customTypes.length){
    el.innerHTML='<div style="font-size:.74rem;color:var(--ink-soft);font-style:italic;">'+t('empty.types')+'</div>';
    return;
  }
  el.innerHTML='';
  customTypes.forEach(function(ct){
    // Chercher un tarif existant pour ce type
    const existing=tarifs.find(function(t){return t.types&&t.types.includes(ct.id);});
    const prix=existing?existing.prix:0;
    const row=document.createElement('div');
    row.style.cssText='display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;';
    row.innerHTML=
      '<span style="flex:1;font-size:.84rem;font-weight:500;">'+escHtml(ct.label)+'</span>'+
      '<span style="font-size:.72rem;color:var(--ink-soft);">'+escHtml(ct.category||'')+'</span>'+
      '<div style="display:flex;align-items:center;gap:5px;">'+
        '<input type="number" id="type-prix-'+ct.id+'" min="0" step="0.01" value="'+prix+'" style="width:90px;border:1.5px solid var(--border);border-radius:7px;background:var(--bg);font-family:monospace;font-size:.88rem;padding:6px 9px;color:var(--ink);text-align:right;outline:none;"/>'+
        '<span style="font-size:.8rem;color:var(--ink-soft);">€</span>'+
      '</div>';
    el.appendChild(row);
  });
}

function saveTypePrices(){
  customTypes.forEach(function(ct){
    const input=document.getElementById('type-prix-'+ct.id);
    if(!input)return;
    const prix=parseFloat(input.value)||0;
    const idx=tarifs.findIndex(function(t){return t.types&&t.types.includes(ct.id);});
    if(prix>0){
      if(idx>=0){tarifs[idx].prix=prix;tarifs[idx].label=ct.label;}
      else{tarifs.push({id:String(Date.now())+ct.id,label:ct.label,prix:prix,types:[ct.id]});}
    } else {
      if(idx>=0)tarifs.splice(idx,1);
    }
  });
  saveTarifs();
  const msg=document.getElementById('ct-prix-msg')||document.getElementById('type-prices-msg');
  if(msg){msg.textContent=t('toast.prices_saved');setTimeout(function(){msg.textContent='';},2500);}
}

function renderTarifs(){
  const el=document.getElementById('tarif-list');if(!el)return;
  if(!tarifs.length){el.innerHTML='<div style="font-size:.74rem;color:var(--ink-soft);font-style:italic;">'+t('empty.tarifs')+'</div>';return;}
  el.innerHTML='';
  tarifs.forEach(function(t,i){
    const row=document.createElement('div');row.className='tarif-row';
    row.innerHTML='<span style="flex:1;font-size:.82rem;">'+t.label+'</span>'+
      '<span style="font-family:monospace;font-size:.82rem;font-weight:500;color:var(--accent);">'+fmtEur(t.prix)+'</span>';
    const btn=document.createElement('button');
    btn.textContent='✕';btn.style.cssText='background:none;border:none;cursor:pointer;color:#c0a090;font-size:.85rem;margin-left:8px;';
    btn.addEventListener('click',function(){tarifs.splice(i,1);saveTarifs();renderTarifs();});
    row.appendChild(btn);el.appendChild(row);
  });
}

// Génère et ouvre le PDF d'une facture/devis/avoir dans un nouvel onglet
function genPDFDoc(docId){
  const doc=documents.find(function(d){return d.id===docId;});if(!doc)return;
  const labo=getLegalInfo();
  const typeLabel=doc.type==='devis'?'DEVIS':doc.type==='avoir'?'AVOIR':'FACTURE';
  const dateDoc=new Date(doc.date+'T12:00:00');
  const dateFormatted=dateDoc.toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'});
  const ech=new Date(dateDoc);ech.setDate(ech.getDate()+30);
  const echFormatted=ech.toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'});
  function escH(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function fmtC(v){return (parseFloat(v)||0).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+' €';}
  const linesHTML=(doc.lines||[]).map(function(l){
    const pu=parseFloat(l.prix)||0;const qty=parseFloat(l.qty)||1;
    return '<tr><td>'+escH(l.label||'')+(l.ref?'<br/><span style="font-size:7.5pt;color:#8a7968;">Réf. '+escH(l.ref)+'</span>':'')+'</td>'+
      '<td style="text-align:center;">'+qty+'</td>'+
      '<td style="text-align:right;">'+fmtC(pu)+'</td>'+
      '<td style="text-align:right;font-weight:700;">'+fmtC(qty*pu)+'</td></tr>';
  }).join('');
  const blRefsHtml=(doc.bdlRefs&&doc.bdlRefs.length)?
    '<div style="background:#f0f5ff;border:1px solid #c5d3f0;border-radius:7px;padding:8px 12px;margin-bottom:14px;font-size:8.5pt;color:#1a3a7a;"><strong>Bons de livraison associés :</strong> '+escH(doc.bdlRefs.join(', '))+'</div>':'';
  const avoirRefHtml=doc.avoirOf?
    '<div style="background:#fff3cd;border:1px solid #ffc107;border-radius:7px;padding:8px 12px;margin-bottom:14px;font-size:8.5pt;color:#856404;"><strong>Avoir en déduction de la facture :</strong> '+escH(doc.avoirOf)+'</div>':'';
  const printWin=window.open('','_blank','width=900,height=900');
  if(!printWin){alert('Autorisez les popups pour générer le PDF.');return;}
  printWin.document.write(`<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
<title>${typeLabel} ${escH(doc.num)}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Helvetica Neue',Arial,sans-serif;font-size:10pt;color:#1c1714;background:#fff;}
.page{width:210mm;min-height:297mm;margin:0 auto;padding:18mm 18mm 16mm;}
@media print{.page{padding:15mm 16mm 12mm;}.no-print{display:none;}body{background:#fff;}}
@page{size:A4;margin:0;}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:22px;padding-bottom:14px;border-bottom:2.5px solid #1c1714;}
.labo-name{font-size:14pt;font-weight:800;}
.labo-info{font-size:8pt;color:#555;line-height:1.65;margin-top:5px;}
.doc-side{text-align:right;}
.doc-type{font-size:22pt;font-weight:900;color:#c8410a;letter-spacing:-.5px;}
.doc-num{font-size:10pt;color:#8a7968;margin-top:5px;}
.doc-date{font-size:8.5pt;color:#8a7968;margin-top:2px;}
.doc-ech{font-size:8.5pt;font-weight:700;color:#c8410a;margin-top:2px;}
.parties{display:flex;gap:18px;margin-bottom:18px;}
.party-box{flex:1;background:#f6f1ea;border-radius:8px;padding:11px 13px;border:1px solid #e5ddd2;}
.party-label{font-size:7pt;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#8a7968;margin-bottom:5px;}
.party-name{font-size:10pt;font-weight:700;}
.party-detail{font-size:8pt;color:#555;line-height:1.55;margin-top:3px;}
table{width:100%;border-collapse:collapse;margin-bottom:14px;}
thead tr{background:#1c1714;color:#fff;}
thead th{padding:7px 10px;text-align:left;font-size:8pt;font-weight:600;letter-spacing:.04em;}
tbody tr{border-bottom:1px solid #e5ddd2;}
tbody td{padding:7px 10px;font-size:9pt;}
tbody tr:nth-child(even){background:#faf7f4;}
.total-section{background:#f6f1ea;border-radius:8px;padding:11px 14px;margin-bottom:18px;}
.trow{display:flex;justify-content:space-between;padding:3px 0;font-size:8.5pt;}
.trow.final{font-size:13pt;font-weight:800;color:#c8410a;border-top:2px solid #1c1714;margin-top:7px;padding-top:8px;}
.legal{font-size:7.5pt;color:#555;background:#f8f5f0;border:1px solid #e5ddd2;border-radius:7px;padding:9px 12px;margin-bottom:14px;line-height:1.7;}
.footer{margin-top:20px;padding-top:8px;border-top:1px solid #e5ddd2;font-size:7pt;color:#aaa;text-align:center;line-height:1.6;}
.print-btn{position:fixed;bottom:20px;right:20px;background:#c8410a;color:#fff;border:none;border-radius:10px;padding:11px 18px;font-size:10pt;font-weight:700;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.25);}
</style></head><body>
<button class="print-btn no-print" onclick="window.print()">🖨️ Imprimer / PDF</button>
<div class="page">
<div class="header">
  <div>
    <div class="labo-name">${escH(labo.raisonSociale)}</div>
    <div class="labo-info">
      ${labo.siret?'SIRET : '+escH(labo.siret)+'<br/>':''}
      ${labo.adresse?escH(labo.adresse)+'<br/>':''}
      ${labo.tel?'Tél : '+escH(labo.tel)+(labo.email?' &nbsp;·&nbsp; ':''):''}${labo.email?escH(labo.email):''}
      ${labo.ceNum?'<br/>N° fabricant CE : '+escH(labo.ceNum):''}
    </div>
  </div>
  <div class="doc-side">
    <div class="doc-type">${typeLabel}</div>
    <div class="doc-num">N° ${escH(doc.num)}</div>
    <div class="doc-date">Émis le ${dateFormatted}</div>
    ${doc.type==='facture'&&doc.status!=='paye'?'<div class="doc-ech">Échéance : '+echFormatted+'</div>':''}
  </div>
</div>
<div class="parties">
  <div class="party-box">
    <div class="party-label">Émetteur</div>
    <div class="party-name">${escH(labo.raisonSociale)}</div>
    <div class="party-detail">${labo.siret?'SIRET : '+escH(labo.siret)+'<br/>':''}${labo.adresse?escH(labo.adresse)+'<br/>':''}${labo.directeur?'Responsable : '+escH(labo.directeur):''}</div>
  </div>
  <div class="party-box">
    <div class="party-label">Destinataire</div>
    <div class="party-name">${escH(doc.cabName)}</div>
    <div class="party-detail">${doc.jobLabel?escH(doc.jobLabel):''}</div>
  </div>
</div>
${avoirRefHtml}${blRefsHtml}
<table>
  <thead><tr><th>Prestation / Description</th><th style="text-align:center;width:55px;">Qté</th><th style="text-align:right;width:90px;">P.U.</th><th style="text-align:right;width:90px;">Total</th></tr></thead>
  <tbody>${linesHTML}</tbody>
</table>
<div class="total-section">
  <div class="trow"><span style="color:#555;">Sous-total HT</span><span>${fmtC(doc.total)}</span></div>
  <div class="trow"><span style="color:#555;">TVA</span><span style="color:#8a7968;">Exonéré — art. 261-4-1° CGI</span></div>
  <div class="trow final"><span>Total TTC</span><span>${fmtC(doc.total)}</span></div>
</div>
${doc.note?'<div style="background:#fff8f5;border:1px solid #f0cfc0;border-radius:7px;padding:9px 12px;font-size:8.5pt;color:#555;margin-bottom:14px;"><strong>Note :</strong> '+escH(doc.note)+'</div>':''}
<div class="legal">
  <strong>Conditions de règlement :</strong> Paiement à 30 jours date de facture — virement bancaire.<br/>
  <strong>Pénalités de retard :</strong> En cas de retard, pénalités au taux de 3× le taux légal (art. L441-10 C.com.). Indemnité forfaitaire de recouvrement : 40 €.<br/>
  <strong>Exonération TVA :</strong> Prothèses dentaires exonérées de TVA — article 261-4-1° du Code Général des Impôts.
</div>
<div class="footer">
  ${escH(labo.raisonSociale)}${labo.siret?' — SIRET : '+escH(labo.siret):''}${labo.adresse?' — '+escH(labo.adresse):''}<br/>
  Document généré par Labosync · EU MDR 2017/745
</div>
</div>
</body></html>`);
  printWin.document.close();
}

/* ══════════════════════════════════════════
   §30 — FACTURE MODALE & LIVRAISONS
   ══════════════════════════════════════════ */
// — Création d'un avoir (note de crédit sur facture)
function createAvoir(docId){
  if(!guardPerm('action:billing_credit','⛔ Votre rôle ne permet pas de créer un avoir.'))return;
  const orig=documents.find(function(d){return d.id===docId;});if(!orig)return;
  if(!confirm(ti('confirm.credit_note',{num:orig.num,amount:fmtEur(orig.total)})))return;
  reportAudit({action:'credit_note_created',target:docId});
  const now=new Date();
  const avoir={
    id:'avo_'+Date.now(),
    type:'avoir',
    num:genDocNum('avoir'),
    date:fmtISO(now),
    cabinet:orig.cabinet,
    cabName:orig.cabName,
    jobLabel:orig.jobLabel||'',
    lines:(orig.lines||[]).map(function(l){return Object.assign({},l,{prix:-(parseFloat(l.prix)||0)});}),
    total:-orig.total,
    // L'avoir doit être visible immédiatement par le dentiste : on le passe
    // directement à 'envoye' (sinon publishPortal le filtre comme brouillon).
    status:'envoye',
    avoirOf:orig.num,
    bdlRefs:orig.bdlRefs||[],
    createdAt:now.toISOString()
  };
  documents.unshift(avoir);
  saveDocs();
  renderToInvoice();renderBillDocs();updateBillStats();
  // Pousser vers le portail dentiste pour qu'il voie l'avoir
  const cab=cabinets.find(function(c){return c.id===orig.cabinet;});
  if(cab&&typeof publishPortal==='function'){
    publishPortal(cab).catch(function(e){console.warn('publishPortal (avoir) failed',e);});
  }
  showToast('✅ Avoir '+avoir.num+' créé et envoyé au cabinet','#1a4a7a');
}

/* ── EXPORT CSV COMPTABLE ── */
function exportFacturesCSV(){
  const rows=[['Numéro','Type','Date','Cabinet','Statut','Total (€)','BLs associés','Avoir sur']];
  const statusLabels={brouillon:t('status.brouillon'),envoye:t('status.envoye'),paye:t('status.paye'),annule:t('status.annule')};
  documents.forEach(function(d){
    rows.push([
      d.num||'',
      d.type||'',
      d.date||'',
      d.cabName||'',
      statusLabels[d.status]||d.status||'',
      String(d.total||0).replace('.',','),
      (d.bdlRefs||[]).join(' | '),
      d.avoirOf||''
    ]);
  });
  const csv=rows.map(function(r){return r.map(function(c){return '"'+String(c).replace(/"/g,'""')+'"';}).join(';');}).join('\r\n');
  const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download='labosync_factures_'+new Date().toISOString().slice(0,10)+'.csv';
  document.body.appendChild(a);a.click();
  setTimeout(function(){URL.revokeObjectURL(url);a.remove();},1000);
  showToast(t('toast.csv_exported'),'#2a6049');
}

/* ── EMAIL FACTURE (Resend via Netlify) ── */
async function sendInvoiceEmail(docId){
  const doc=documents.find(function(d){return d.id===docId;});if(!doc)return;
  const cab=cabinets.find(function(c){return c.id===doc.cabinet;});
  const email=cab&&cab.email?cab.email:'';
  if(!email){showToast(t('toast.no_cab_email'),'#c0392b');return;}
  const labo=getLegalInfo();
  const portalUrl=cab&&cab.portalId?'https://labosync.app/cabinet.html?id='+cab.portalId:'';
  const linesHtml=(doc.lines||[]).map(function(l){
    return '<tr><td style="padding:6px 10px;border-bottom:1px solid #eee;">'+String(l.label||'')+'</td>'+
      '<td style="padding:6px 10px;text-align:right;border-bottom:1px solid #eee;">'+fmtEur((parseFloat(l.qty)||1)*(parseFloat(l.prix)||0))+'</td></tr>';
  }).join('');
  const htmlBody=`<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;color:#1c1714;">
<div style="background:#1c1410;color:#f5f0e8;padding:20px 24px;border-radius:10px 10px 0 0;">
  <h1 style="margin:0;font-size:18px;">Nouvelle facture — ${String(labo.raisonSociale)}</h1>
</div>
<div style="background:#fff;border:1px solid #e5ddd2;border-top:none;padding:24px;border-radius:0 0 10px 10px;">
  <p>Bonjour,</p>
  <p>Votre laboratoire <strong>${String(labo.raisonSociale)}</strong> vous envoie la facture <strong>${String(doc.num)}</strong> d'un montant de <strong>${fmtEur(doc.total)}</strong>.</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;background:#f8f5f0;border-radius:8px;overflow:hidden;">
    <thead><tr style="background:#1c1714;color:#fff;"><th style="padding:8px 10px;text-align:left;font-size:12px;">Prestation</th><th style="padding:8px 10px;text-align:right;font-size:12px;">Montant</th></tr></thead>
    <tbody>${linesHtml}</tbody>
    <tfoot><tr><td style="padding:10px;font-weight:700;">Total TTC</td><td style="padding:10px;text-align:right;font-weight:700;color:#c8410a;">${fmtEur(doc.total)}</td></tr></tfoot>
  </table>
  <p style="font-size:12px;color:#666;">Exonéré de TVA — art. 261-4-1° CGI · Paiement à 30 jours</p>
  ${portalUrl?'<div style="text-align:center;margin-top:20px;"><a href="'+portalUrl+'" style="background:#c8410a;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;display:inline-block;">Accéder à votre espace cabinet</a></div>':''}
  <p style="margin-top:20px;font-size:12px;color:#888;">Cordialement,<br/><strong>${String(labo.raisonSociale)}</strong>${labo.tel?' — Tél : '+labo.tel:''}</p>
</div></div>`;
  try{
    const r=await fetch('/.netlify/functions/send-email',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        to:email,
        subject:'Facture '+doc.num+' — '+String(labo.raisonSociale),
        html:htmlBody,
        fromName:String(labo.raisonSociale)
      })
    });
    const res=await r.json().catch(function(){return {};});
    if(r.ok&&res.ok){
      showToast(ti('toast.email_sent',{email:email}),'#2a6049');
    } else if(res.error&&res.error.includes('RESEND_API_KEY')){
      // Clé Resend manquante — la facture est bien envoyée, seul l'email auto ne fonctionne pas
      showToast(t('toast.invoice_sent_no_email'),'#c8410a',8000);
    } else {
      showToast(ti('toast.invoice_sent_email_fail',{err:res.error||r.status}),'#c0392b',7000);
    }
  }catch(e){
    showToast(t('toast.invoice_sent_email_error'),'#c0392b',6000);
  }
}

// Event listeners for billing
document.getElementById('btn-new-devis').addEventListener('click',function(){openBillForm('devis');});
document.getElementById('btn-bill-save').addEventListener('click',saveBillDoc);

// Boutons "Facturer" dans la vue À facturer
document.getElementById('to-invoice-list').addEventListener('click',function(e){
  const btn=e.target.closest('[data-toinv-cab]');
  if(btn)showFactureModal(btn.dataset.toinvCab);
});
document.getElementById('btn-bill-cancel').addEventListener('click',function(){document.getElementById('bill-form').style.display='none';});
document.getElementById('btn-bill-add-line').addEventListener('click',function(){billLines.push({label:'',qty:1,prix:0});renderBillLines();});
document.getElementById('btn-tarif-add').addEventListener('click',function(){
  const lbl=document.getElementById('tarif-label').value.trim();
  const prix=parseFloat(document.getElementById('tarif-price').value)||0;
  if(!lbl){alert(t('alert.enter_service'));return;}
  const types=[...document.querySelectorAll('#tarif-type-sel input:checked')].map(function(cb){return cb.value;});
  tarifs.push({label:lbl,prix,types});saveTarifs();renderTarifs();
  document.getElementById('tarif-label').value='';document.getElementById('tarif-price').value='';
  document.querySelectorAll('#tarif-type-sel input').forEach(function(cb){cb.checked=false;});
});
document.getElementById('bill-filter-status').addEventListener('change',renderBillDocs);
document.getElementById('bill-filter-type').addEventListener('change',renderBillDocs);

// Doc actions (click delegation)
document.getElementById('bill-docs-list').addEventListener('click',function(e){
  const btn=e.target.closest('[data-docid]');if(!btn)return;
  const id=btn.dataset.docid;const action=btn.dataset.action;
  const doc=documents.find(function(d){return d.id===id;});if(!doc)return;
  const isLocked = doc.type==='facture' && (doc.status==='envoye'||doc.status==='paye');
  if(action==='pdf'){genPDFDoc(id);}
  else if(action==='email'){sendInvoiceEmail(id);}
  else if(action==='avoir'){createAvoir(id);}
  else if(action==='relance'){sendInvoiceEmail(id);}
  else if(action==='paye'){
    if(doc.status!=='envoye'){showToast(t('toast.mark_sent_first'),'#c0392b');return;}
    doc.status='paye';saveDocs();renderToInvoice();renderBillDocs();updateBillStats();
    const cab=cabinets.find(function(c){return c.id===doc.cabinet;});
    if(cab)publishPortal(cab);
    showToast(t('toast.invoice_paid'),'#2a6049');
  }
  else if(action==='envoye'){
    if(doc.status!=='brouillon'){showToast(t('toast.invoice_locked'),'#c0392b');return;}
    doc.status='envoye';saveDocs();renderToInvoice();renderBillDocs();updateBillStats();
    const cab=cabinets.find(function(c){return c.id===doc.cabinet;});
    if(cab)publishPortal(cab);
    // Auto-envoi email si le cabinet a une adresse
    const cabForEmail=cabinets.find(function(c){return c.id===doc.cabinet;});
    if(cabForEmail&&cabForEmail.email){
      sendInvoiceEmail(id);
    } else {
      showToast(t('toast.invoice_sent'),'#1a4a7a');
    }
  }
  else if(action==='stripe-pay'){genPaymentLink(id);}
  else if(action==='resync'){
    const cab=cabinets.find(function(c){return c.id===doc.cabinet;});
    if(!cab){showToast(t('toast.cab_not_found'),'#c0392b');return;}
    btn.textContent='⏳';btn.disabled=true;
    publishPortal(cab).then(function(){
      showToast(ti('toast.portal_updated',{name:cab.name}),'#2a6049');
      btn.textContent='✅';
      setTimeout(function(){btn.textContent='🔄';btn.disabled=false;},2000);
    }).catch(function(err){
      showToast(ti('toast.error',{msg:String(err).slice(0,60)}),'#c0392b',6000);
      btn.textContent='🔄';btn.disabled=false;
    });
  }
  else if(action==='convert'){convertToFacture(id);}
  else if(action==='delete'){
    if(isLocked){showToast(t('toast.invoice_delete_locked'),'#c0392b');return;}
    if(confirm('Supprimer ce document ?')){documents=documents.filter(function(d){return d.id!==id;});saveDocs();renderToInvoice();renderBillDocs();updateBillStats();}
  }
});

/* ══════════════════════════════════════════
   §26 — STRIPE — PAIEMENT EN LIGNE
   ══════════════════════════════════════════ */
async function genPaymentLink(docId){
  if(!guardPerm('action:billing_generate','⛔ Votre rôle ne permet pas de générer des liens de paiement.'))return;
  const doc=documents.find(function(d){return d.id===docId;});if(!doc)return;
  // Si lien déjà généré, juste copier
  if(doc.stripeUrl){
    try{await navigator.clipboard.writeText(doc.stripeUrl);}catch(e){}
    showToast(t('toast.link_copied'),'#5a3472');
    return;
  }
  if(!doc.total||doc.total<=0){showToast(t('toast.invalid_amount'),'#c0392b',5000);return;}

  // Afficher un indicateur persistant sur le bouton pendant la génération
  const btn=document.querySelector('[data-docid="'+docId+'"][data-action="stripe-pay"]');
  const origLabel=btn?btn.textContent:'';
  if(btn){btn.textContent='⏳ En cours…';btn.disabled=true;}

  try{
    const appUrl=window.location.href.split('?')[0];
    const cab=cabinets.find(function(c){return c.id===doc.cabinet;});

    // Timeout 15s sur toute la requête (AbortController)
    const controller=new AbortController();
    const timeoutId=setTimeout(function(){controller.abort();},15000);
    let resp;
    try{
      // Pas de header Authorization — la function ne le vérifie pas
      // et sa présence déclenchait un preflight CORS qui pouvait bloquer
      resp=await fetch('/.netlify/functions/stripe-create-payment',{
        method:'POST',
        signal:controller.signal,
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          factureId:doc.id,
          factureNum:doc.num,
          portalId:cab&&cab.portalId||'',
          amount:doc.total,
          cabName:doc.cabName||'',
          description:'Facture '+doc.num+' — '+(doc.cabName||''),
          appUrl:appUrl,
        }),
      });
    }finally{clearTimeout(timeoutId);}

    if(!resp.ok){
      const err=await resp.json().catch(function(){return {};});
      showToast('❌ '+(err.error||'Erreur Stripe (HTTP '+resp.status+')'),'#c0392b',8000);
      if(btn){btn.textContent=origLabel;btn.disabled=false;}
      return;
    }
    const data=await resp.json();
    if(!data.url){
      showToast(t('toast.stripe_no_link'),'#c0392b',8000);
      if(btn){btn.textContent=origLabel;btn.disabled=false;}
      return;
    }
    doc.stripeUrl=data.url;
    doc.stripeSessionId=data.sessionId;
    saveDocs();
    renderBillDocs();
    try{await navigator.clipboard.writeText(data.url);}catch(e){}
    showToast(t('toast.stripe_link_copied'),'#2a6049',6000);
    if(cab)autoPublishCab(cab.id);
  }catch(e){
    const msg=e.name==='AbortError'?'Délai dépassé (20s) — vérifiez la connexion et la configuration serveur Stripe':'Erreur : '+String(e).slice(0,80);
    showToast('❌ '+msg,'#c0392b',8000);
    if(btn){btn.textContent=origLabel;btn.disabled=false;}
  }
}

async function checkStripePayments(){
  const pending=documents.filter(function(d){return d.stripeSessionId&&d.status==='envoye';});
  if(!pending.length)return;
  let updated=false;
  for(const doc of pending){
    try{
      const r=await fetch(SB_URL+'/rest/v1/labo_data?id=eq.stripe_sess_'+doc.stripeSessionId+'&select=data',{
        headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY},
      });
      const rows=await r.json();
      if(rows[0]&&rows[0].data&&rows[0].data.status==='paid'){
        doc.status='paye';
        doc.paidAt=rows[0].data.paidAt||new Date().toISOString();
        updated=true;
        const cab=cabinets.find(function(c){return c.id===doc.cabinet;});
        if(cab)autoPublishCab(cab.id);
        showToast(ti('toast.payment_confirmed',{doc:doc.num}),'#2a6049');
      }
    }catch(e){}
  }
  if(updated){saveDocs();renderBillDocs();updateBillStats();renderToInvoice();}
}

/* ══════════════════════════════════════════
   §27 — SEARCH
   ══════════════════════════════════════════ */
// Recherche globale dans les jobs (patient, code suivi, note, ID prothèse)
function doGlobalSearch(q){
  const res=document.getElementById('search-results');
  if(!q||q.length<1){res.style.display='none';return;}
  const norm=q.toLowerCase().trim();
  const matched=jobs.filter(function(j){
    return (
      j.patient.toLowerCase().includes(norm) ||
      (j.trackCode&&j.trackCode.toUpperCase().includes(norm.toUpperCase())) ||
      (j.prothesisId&&j.prothesisId.toLowerCase().includes(norm)) ||
      (j.note&&j.note.toLowerCase().includes(norm))
    );
  });
  if(!matched.length){
    res.style.display='block';
    res.innerHTML='<div style="padding:10px;font-size:.78rem;color:var(--ink-soft);text-align:center;">'+t('empty.history')+' "'+q+'"</div>';
    return;
  }
  res.style.display='block';
  res.innerHTML=matched.map(function(j){
    const cab=j.cabinet?cabinets.find(function(c){return c.id===j.cabinet;}):null;
    const pct=j.tasks.length?Math.round(j.tasks.filter(function(t){return t.done;}).length/j.tasks.length*100):0;
    return '<div class="sr-item" data-jid="'+j.id+'">'+
      '<div class="sr-top">'+
        '<div style="flex:1;">'+
          '<div class="sr-name">'+(j.urgent?'🔴 ':'')+j.patient+'</div>'+
          '<div class="sr-meta">'+
            '<span class="sr-code">'+(j.trackCode||'—')+'</span>'+
            '<span style="background:var(--accent-soft);color:var(--accent);padding:1px 7px;border-radius:5px;font-size:.68rem;">'+getJobTypeLabel(j)+'</span>'+
            (j.prothesisId?'<span style="background:#dde8f2;color:#1a4a7a;padding:1px 7px;border-radius:5px;font-size:.68rem;">#'+j.prothesisId+'</span>':'')+
            (cab?'<span>🏥 '+cab.name+'</span>':'')+
          '</div>'+
          '<div class="sr-tasks-mini">'+
            j.tasks.map(function(t){
              return '<span class="sr-task-chip" style="background:'+(TECHS[t.tech]&&TECHS[t.tech].soft||'#eee')+';border-color:'+(TECHS[t.tech]&&TECHS[t.tech].color||'#ccc')+';">'+
                (t.done?'✓ ':'')+(TECHS[t.tech]&&TECHS[t.tech].label||t.tech)+' · '+fmtS(t.dueDate)+'</span>';
            }).join('')+
          '</div>'+
        '</div>'+
        '<div style="text-align:right;flex-shrink:0;">'+
          '<div style="font-family:serif;font-size:1.1rem;font-weight:700;color:'+(pct===100?'#2a6049':'var(--accent)')+';">'+pct+'%</div>'+
          (pct===100&&!bdl.find(function(b){return b.jobId===j.id;})?
            '<button class="sr-bl-btn" data-bl="'+j.id+'" style="background:#5a3472;color:#fff;border:none;border-radius:5px;padding:4px 10px;font-family:monospace;font-size:.65rem;cursor:pointer;white-space:nowrap;margin-top:4px;display:block;">📋 Bon livraison</button>':
            (bdl.find(function(b){return b.jobId===j.id;})?
              '<span style="font-size:.65rem;color:#5a3472;margin-top:4px;display:block;">✅ Bon émis</span>':
              '<button class="sr-hold-btn" data-hold="'+j.id+'">⏸ Attente</button>')
          )+
        '</div>'+
      '</div>'+
    '</div>';
  }).join('');
}

document.getElementById('global-search').addEventListener('input',function(){
  doGlobalSearch(this.value.trim());
});
document.getElementById('global-search').addEventListener('keydown',function(e){
  if(e.key==='Escape'){this.value='';document.getElementById('search-results').style.display='none';}
});
// Click on search result — open task modal for first task or just highlight
document.getElementById('search-results').addEventListener('click',function(e){
  const holdBtn=e.target.closest('[data-hold]');
  if(holdBtn){holdJob(holdBtn.dataset.hold);return;}
  const blBtn=e.target.closest('[data-bl]');
  if(blBtn){
    document.getElementById('search-results').style.display='none';
    document.getElementById('global-search').value='';
    genBonLivraison(blBtn.dataset.bl);
    return;
  }
  const item=e.target.closest('.sr-item[data-jid]');
  if(item){
    const jid=item.dataset.jid;
    document.getElementById('search-results').style.display='none';
    document.getElementById('global-search').value='';
    openJobDetail(jid);
  }
});
// Close on outside click
document.addEventListener('click',function(e){
  const sr=document.getElementById('search-results');
  const gs=document.getElementById('global-search');
  if(sr&&!sr.contains(e.target)&&e.target!==gs){sr.style.display='none';}
});


/* ══════════════════════════════════════════
   §28 — BONS DE COMMANDE (BDC)
   ══════════════════════════════════════════ */
let bdc    = JSON.parse(localStorage.getItem('lb_bdc')||'[]');
let fourns = JSON.parse(localStorage.getItem('lb_fourns')||'[]');
function sbdc(){localStorage.setItem('lb_bdc',JSON.stringify(bdc));scheduleSave();}
function sfourns(){localStorage.setItem('lb_fourns',JSON.stringify(fourns));scheduleSave();}

let bdcLines=[];
let recBdcId=null;

function genBdcNum(){
  const y=new Date().getFullYear();
  const n=bdc.filter(function(b){return b.num&&b.num.includes(String(y));}).length+1;
  return 'BDC-'+y+'-'+String(n).padStart(3,'0');
}

function syncBdcFourn(){
  const sel=document.getElementById('bdc-fourn');if(!sel)return;
  sel.innerHTML='<option value="">'+t('select.select')+'</option>'+
    fourns.map(function(f){return '<option value="'+f.id+'">'+f.name+'</option>';}).join('');
  if(fourns.length===1)sel.value=fourns[0].id;
}

function syncBdcJob(){
  const sel=document.getElementById('bdc-job');if(!sel)return;
  sel.innerHTML='<option value="">'+t('select.no_job')+'</option>'+
    jobs.map(function(j){return '<option value="'+j.id+'">'+j.patient+' ('+getJobTypeLabel(j)+')</option>';}).join('');
}

function openBdcForm(){
  bdcLines=[{produit:'',ref:'',qte:1,lot:''}];
  document.getElementById('bdc-form').style.display='block';
  document.getElementById('bdc-date').value=fmtISO(new Date());
  document.getElementById('bdc-note').value='';
  document.getElementById('bdc-job').value='';
  syncBdcFourn();syncBdcJob();
  renderBdcLines();
  document.getElementById('bdc-form').scrollIntoView({behavior:'smooth'});
}

function renderBdcLines(){
  const el=document.getElementById('bdc-lines');if(!el)return;
  el.innerHTML='';
  const hdr=document.createElement('div');
  hdr.style.cssText='display:grid;grid-template-columns:2fr 1fr 50px 1fr 20px;gap:5px;font-size:.62rem;text-transform:uppercase;letter-spacing:.05em;color:var(--ink-soft);margin-bottom:5px;';
  hdr.innerHTML='<span>'+t('bdc.col.product')+'</span><span>'+t('bdc.col.ref')+'</span><span style="text-align:center">'+t('bdc.col.qty')+'</span><span>'+t('bdc.col.lot')+'</span><span></span>';
  el.appendChild(hdr);
  const iStyle='border:1.5px solid var(--border);border-radius:6px;padding:6px 8px;font-family:monospace;font-size:.78rem;background:var(--bg);color:var(--ink);outline:none;width:100%;';
  bdcLines.forEach(function(line,i){
    const row=document.createElement('div');
    row.style.cssText='display:grid;grid-template-columns:2fr 1fr 50px 1fr 20px;gap:5px;align-items:center;margin-bottom:7px;';
    row.innerHTML=
      '<input type="text" placeholder="Zircone 98mm, Cire..." value="'+(line.produit||'')+'" style="'+iStyle+'" oninput="bdcLines['+i+'].produit=this.value"/>'+
      '<input type="text" placeholder="Réf." value="'+(line.ref||'')+'" style="'+iStyle+'" oninput="bdcLines['+i+'].ref=this.value"/>'+
      '<input type="number" min="1" value="'+(line.qte||1)+'" style="'+iStyle+'text-align:center;" oninput="bdcLines['+i+'].qte=parseInt(this.value)||1"/>'+
      '<input type="text" placeholder="optionnel" value="'+(line.lot||'')+'" style="'+iStyle+'font-weight:600;color:#2a6049;" oninput="bdcLines['+i+'].lot=this.value"/>'+
      '<button onclick="bdcLines.splice('+i+',1);renderBdcLines();" style="background:none;border:none;cursor:pointer;color:#c0a090;font-size:.9rem;">✕</button>';
    el.appendChild(row);
  });
}

function saveBdc(){
  const jobId=document.getElementById('bdc-job').value;
  const fournId=document.getElementById('bdc-fourn').value;
  const date=document.getElementById('bdc-date').value;
  const note=document.getElementById('bdc-note').value.trim();
  const lines=bdcLines.filter(function(l){return l.produit.trim();});
  if(!jobId){alert(t('alert.select_job'));return;}
  if(!lines.length){alert(t('alert.add_material'));return;}
  const job_obj=jobs.find(function(j){return j.id===jobId;});
  const fourn_obj=fourns.find(function(f){return f.id===fournId;});
  bdc.unshift({
    id:String(Date.now()),num:genBdcNum(),
    jobId,jobLabel:job_obj?job_obj.patient+' ('+(TYPE_LABELS[job_obj.type]||job_obj.type)+')':'',
    fournId,fournName:fourn_obj?fourn_obj.name:'—',
    date,note,lines,status:'brouillon',createdAt:new Date().toISOString()
  });
  sbdc();document.getElementById('bdc-form').style.display='none';
  renderBdcList();showToast('✅ Bon '+bdc[0].num+' créé !');
}

function renderBdcList(){
  const el=document.getElementById('bdc-list');if(!el)return;
  const filter=document.getElementById('bdc-filter')&&document.getElementById('bdc-filter').value||'';
  const docs=filter?bdc.filter(function(b){return b.status===filter;}):bdc;
  const cnt=document.getElementById('bdc-cnt');if(cnt)cnt.textContent=docs.length;
  if(!docs.length){el.innerHTML='<div style="padding:14px;font-size:.76rem;color:var(--ink-soft);font-style:italic;">'+t('empty.bdc')+'</div>';return;}
  el.innerHTML='';
  const stL={brouillon:t('status.brouillon'),commande:t('status.commande'),recu:t('status.recu_bdc')};
  const stC={brouillon:'st-brouillon',commande:'st-commande',recu:'st-recu'};
  docs.forEach(function(doc){
    const div=document.createElement('div');div.className='bdc-card';
    const linesHTML=doc.lines.map(function(l){
      return '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border);font-size:.76rem;">'+
        '<span style="flex:2;">'+l.produit+(l.ref?' <span style="color:var(--ink-soft);">('+l.ref+')</span>':'')+' × '+l.qte+'</span>'+
        (l.lot?'<span class="bdc-lot">Lot : '+l.lot+'</span>':'<span style="font-size:.66rem;color:#c0a090;font-style:italic;">lot à saisir</span>')+
      '</div>';
    }).join('');
    div.innerHTML=
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap;">'+
        '<span class="bdc-num">'+doc.num+'</span>'+
        '<span class="doc-status '+stC[doc.status]+'">'+stL[doc.status]+'</span>'+
        (doc.fournName&&doc.fournName!=='—'?'<span style="font-size:.7rem;color:#1a4a7a;background:#dde8f2;padding:1px 8px;border-radius:5px;">🏭 '+doc.fournName+'</span>':'')+
        '<span style="font-size:.7rem;color:var(--ink-soft);">👤 '+doc.jobLabel+'</span>'+
        '<span style="font-size:.7rem;color:var(--ink-soft);margin-left:auto;">'+new Date(doc.date+'T12:00:00').toLocaleDateString('fr-FR')+'</span>'+
      '</div>'+
      '<div style="margin-bottom:10px;">'+linesHTML+'</div>'+
      (doc.note?'<div style="font-size:.72rem;color:var(--ink-soft);font-style:italic;margin-bottom:10px;">📝 '+doc.note+'</div>':'')+
      '<div style="display:flex;gap:6px;flex-wrap:wrap;">'+
        (doc.status==='brouillon'?'<button data-bid="'+doc.id+'" data-ba="commander" style="background:#1a4a7a;color:#fff;border:none;border-radius:5px;padding:5px 10px;font-family:monospace;font-size:.68rem;cursor:pointer;">📤 Commandé</button>':'')+
        (doc.status==='commande'?'<button data-bid="'+doc.id+'" data-ba="reception" style="background:#2a6049;color:#fff;border:none;border-radius:5px;padding:5px 10px;font-family:monospace;font-size:.68rem;cursor:pointer;">📥 Réceptionner + N° lots</button>':'')+
        '<button data-bid="'+doc.id+'" data-ba="pdf" style="background:var(--ink);color:#fff;border:none;border-radius:5px;padding:5px 10px;font-family:monospace;font-size:.68rem;cursor:pointer;">📄 PDF</button>'+
        '<button data-bid="'+doc.id+'" data-ba="del" style="background:none;border:1px solid var(--border);border-radius:5px;padding:5px 10px;font-family:monospace;font-size:.68rem;cursor:pointer;color:var(--ink-soft);">🗑️</button>'+
      '</div>';
    el.appendChild(div);
  });
}

function openBdcReception(docId){
  const doc=bdc.find(function(b){return b.id===docId;});if(!doc)return;
  recBdcId=docId;
  document.getElementById('bdc-rec-num').textContent=doc.num+' — '+doc.jobLabel;
  const el=document.getElementById('bdc-rec-lines');el.innerHTML='';
  doc.lines.forEach(function(line,i){
    const div=document.createElement('div');
    div.style.cssText='padding:12px 0;border-bottom:1px solid var(--border);';
    div.innerHTML='<div style="font-weight:500;font-size:.84rem;margin-bottom:8px;">'+line.produit+(line.ref?' ('+line.ref+')':'')+'  ×'+line.qte+'</div>'+
      '<div style="display:flex;align-items:center;gap:8px;">'+
        '<label style="font-size:.68rem;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-soft);white-space:nowrap;">N° de lot reçu</label>'+
        '<input type="text" id="rec-lot-'+i+'" value="'+(line.lot||'')+'" placeholder="ex: LOT-2026-001" style="flex:1;border:2px solid #2a6049;border-radius:7px;padding:8px 12px;font-family:monospace;font-size:.9rem;font-weight:700;background:#f0faf5;color:#1a4a7a;outline:none;"/>'+
      '</div>';
    el.appendChild(div);
  });
  document.getElementById('bdc-rec-modal').style.display='flex';
}

function confirmBdcReception(){
  const doc=bdc.find(function(b){return b.id===recBdcId;});if(!doc)return;
  doc.lines.forEach(function(line,i){
    const inp=document.getElementById('rec-lot-'+i);
    if(inp)line.lot=inp.value.trim();
  });
  doc.status='recu';doc.receivedAt=new Date().toISOString();
  sbdc();document.getElementById('bdc-rec-modal').style.display='none';
  renderBdcList();showToast(t('toast.reception_confirmed'),'#2a6049');
}

function genBdcPDF(docId){
  const doc=bdc.find(function(b){return b.id===docId;});if(!doc)return;
  const labo=localStorage.getItem('lb_name')||'Laboratoire Dentaire';
  const rows=doc.lines.map(function(l){
    return '<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;">'+l.produit+'</td>'+
      '<td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">'+l.ref+'</td>'+
      '<td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">'+l.qte+'</td>'+
      '<td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:700;color:#2a6049;font-family:monospace;">'+(l.lot||'—')+'</td></tr>';
  }).join('');
  const stL={brouillon:'Brouillon',commande:'Commandé',recu:'Réceptionné'};
  const w=window.open('','_blank');if(!w){alert('Autorisez les popups.');return;}
  w.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>'+doc.num+'</title>'+
    '<style>body{font-family:Arial,sans-serif;font-size:13px;padding:40px;color:#1a1612;}'+
    '.h{display:flex;justify-content:space-between;margin-bottom:36px;}'+
    '.t{font-size:22px;font-weight:700;color:#c8410a;}'+
    '.info{background:#f8f5f0;padding:14px;border-radius:8px;margin-bottom:24px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;}'+
    '.il{font-size:10px;text-transform:uppercase;color:#999;margin-bottom:3px;}'+
    'table{width:100%;border-collapse:collapse;}'+
    'th{background:#1a1612;color:#fff;padding:9px 12px;text-align:left;font-size:11px;text-transform:uppercase;}'+
    '.foot{margin-top:20px;font-size:11px;color:#999;border-top:1px solid #eee;padding-top:12px;}'+
    '@media print{body{padding:20px;}}</style></head><body>'+
    '<div class="h"><div><div class="t">'+labo+'</div><div style="font-size:11px;color:#888;margin-top:4px;">BON DE COMMANDE — TRAÇABILITÉ</div></div>'+
    '<div style="text-align:right"><div style="font-size:20px;font-weight:700;color:#c8410a;">'+doc.num+'</div>'+
    '<div style="font-size:11px;color:#888;">Statut : '+(stL[doc.status]||doc.status)+'</div>'+
    '<div style="font-size:11px;color:#888;">Date : '+new Date(doc.date+'T12:00:00').toLocaleDateString('fr-FR')+'</div>'+
    (doc.receivedAt?'<div style="font-size:11px;color:#888;">Réceptionné le : '+new Date(doc.receivedAt).toLocaleDateString('fr-FR')+'</div>':'')+
    '</div></div>'+
    '<div class="info">'+
      '<div><div class="il">Fournisseur</div><b>'+(doc.fournName||'—')+'</b></div>'+
      '<div><div class="il">Code patient / Travail</div>'+(doc.jobLabel||'—')+'</div>'+
      '<div><div class="il">Référence interne</div>'+(doc.note||'—')+'</div>'+
    '</div>'+
    '<table><thead><tr><th>Matière / Produit</th><th>Référence</th><th>Qté</th><th>N° de lot</th></tr></thead>'+
    '<tbody>'+rows+'</tbody></table>'+
    '<div class="foot">Document de traçabilité — '+labo+'</div>'+
    '<scr'+'ipt>window.onload=function(){window.print();}</scr'+'ipt>'+
    '</body></html>');
  w.document.close();
}

function renderFournList(){
  const el=document.getElementById('fourn-list');if(!el)return;
  if(!fourns.length){el.innerHTML='<div style="font-size:.74rem;color:var(--ink-soft);font-style:italic;">'+t('empty.fourns')+'</div>';return;}
  el.innerHTML='';
  fourns.forEach(function(f,i){
    const div=document.createElement('div');
    div.style.cssText='display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border);font-size:.82rem;';
    div.innerHTML='<span style="flex:1;font-weight:500;">🏭 '+f.name+'</span>'+(f.contact?'<span style="font-size:.7rem;color:var(--ink-soft);">'+f.contact+'</span>':'');
    const btn=document.createElement('button');
    btn.textContent='✕';btn.style.cssText='background:none;border:none;cursor:pointer;color:#c0a090;';
    btn.addEventListener('click',function(){fourns.splice(i,1);sfourns();renderFournList();syncBdcFourn();});
    div.appendChild(btn);el.appendChild(div);
  });
}


function resetCabPassword(cabId){
  if(!guardPerm('action:cabinet_password_reset','⛔ Seul un admin peut régénérer ce mot de passe.'))return;
  const cab=cabinets.find(function(c){return c.id===cabId;});if(!cab)return;
  if(!confirm(ti('confirm.reset_password',{name:cab.name})))return;
  reportAudit({action:'cabinet_password_reset',target:cabId});
  cab.pwd=Math.random().toString(36).substr(2,8);
  saveCabinets();
  showCabPortalInfo(cabId);
}

function showToast(msg,color,duration){
  const t=document.createElement('div');
  t.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(8px);opacity:0;background:'+(color||'#2a6049')+';color:#fff;padding:12px 24px;border-radius:10px;font-family:monospace;font-size:.84rem;font-weight:500;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.2);white-space:nowrap;max-width:90vw;text-align:center;transition:opacity .2s ease, transform .2s ease;';
  t.textContent=msg;document.body.appendChild(t);
  requestAnimationFrame(function(){t.style.opacity='1';t.style.transform='translateX(-50%) translateY(0)';});
  setTimeout(function(){t.style.opacity='0';t.style.transform='translateX(-50%) translateY(8px)';},Math.max(0,(duration||3000)-220));
  setTimeout(function(){t.remove();},duration||3000);
}

/* ── HELP TIPS : <button class="help-tip" data-help-title="…" data-help="…">?</button> ── */
document.addEventListener('click',function(e){
  const tip=e.target.closest('.help-tip');
  if(tip){
    e.preventDefault();e.stopPropagation();
    const text=tip.getAttribute('data-help')||'';
    const title=tip.getAttribute('data-help-title')||'Aide';
    showHelpPopover(tip,title,text);
    return;
  }
});
function showHelpPopover(anchor,title,text){
  const existing=document.getElementById('help-popover');if(existing)existing.remove();
  const pop=document.createElement('div');
  pop.id='help-popover';
  pop.style.cssText='position:absolute;background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;box-shadow:0 12px 36px rgba(15,23,42,.18);z-index:1100;max-width:340px;font-size:.92rem;line-height:1.55;color:#1e293b;';
  pop.innerHTML='<div style="font-weight:700;margin-bottom:8px;color:#0f172a;font-size:.96rem;">'+escH2(title)+'</div>'+
    '<div style="color:#475569;">'+escH2(text)+'</div>'+
    '<button id="help-pop-close" style="margin-top:12px;background:#f1f5f9;color:#475569;border:none;border-radius:6px;padding:7px 14px;font-size:.86rem;font-weight:600;cursor:pointer;">Fermer</button>';
  document.body.appendChild(pop);
  // Positionner près de l'ancre
  const rect=anchor.getBoundingClientRect();
  const popRect=pop.getBoundingClientRect();
  let left=rect.left+(rect.width/2)-(popRect.width/2);
  let top=rect.bottom+window.scrollY+8;
  const m=12;
  if(left<m)left=m;
  if(left+popRect.width>window.innerWidth-m)left=window.innerWidth-popRect.width-m;
  pop.style.left=left+'px';pop.style.top=top+'px';
  pop.querySelector('#help-pop-close').onclick=function(){pop.remove();};
  setTimeout(function(){
    function onOutside(e){if(!pop.contains(e.target)){pop.remove();document.removeEventListener('click',onOutside);}}
    document.addEventListener('click',onOutside);
  },50);
}

/* ── ONBOARDING : wizard de premier démarrage pour comptes vides ─────────── */
function _onbNeeded(){
  try{
    if(localStorage.getItem('lb_onboarding_done')==='1')return false;
    const labName=(localStorage.getItem('lb_name')||'').trim();
    const cabs=Array.isArray(cabinets)?cabinets:[];
    // Onboarding nécessaire si l'une des choses essentielles manque
    return !labName||cabs.length===0||tar.length===0;
  }catch(e){return false;}
}
function runOnboardingWizard(){
  if(document.getElementById('onb-overlay'))return;
  if(_tourActive)return;
  // Si le nom du labo est déjà renseigné (typiquement après un signup), on lance directement le tour
  const existingName=(localStorage.getItem('lb_name')||'').trim();
  if(existingName){
    step=2;
    render();
    return;
  }
  let step=1;
  const overlay=document.createElement('div');
  overlay.id='onb-overlay';
  overlay.style.cssText='position:fixed;inset:0;background:linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af);z-index:9997;display:flex;align-items:center;justify-content:center;padding:24px;';
  function close(done){
    try{if(done)localStorage.setItem('lb_onboarding_done','1');}catch(e){}
    overlay.remove();
  }
  function render(){
    let body='';
    if(step===1){
      body=
        '<div style="font-size:.86rem;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px;">Étape 1 sur 2 · Bienvenue 👋</div>'+
        '<h2 style="margin:0 0 12px 0;font-size:1.6rem;font-weight:800;color:#0f172a;">Comment s\'appelle votre laboratoire&nbsp;?</h2>'+
        '<p style="margin:0 0 20px 0;font-size:1rem;color:#475569;line-height:1.55;">Ce nom apparaîtra en haut de l\'écran et sur les bons de livraison que vous enverrez à vos dentistes.</p>'+
        '<input id="onb-name" type="text" placeholder="ex: Laboratoire Dupont" value="'+escH2((localStorage.getItem('lb_name')||''))+'" style="width:100%;padding:14px 16px;border:2px solid #cbd5e1;border-radius:10px;font-size:1.1rem;outline:none;margin-bottom:24px;"/>'+
        '<div style="display:flex;gap:12px;justify-content:space-between;flex-wrap:wrap;">'+
          '<button id="onb-skip" style="background:transparent;border:none;color:#64748b;font-size:.94rem;cursor:pointer;padding:8px 0;text-decoration:underline;">Plus tard</button>'+
          '<button id="onb-next" style="background:#16a34a;color:#fff;border:none;border-radius:10px;padding:14px 28px;font-size:1.02rem;font-weight:700;cursor:pointer;">Continuer →</button>'+
        '</div>';
    }else if(step===2){
      body=
        '<div style="font-size:.86rem;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px;">Étape 2 sur 2 · Premier dentiste</div>'+
        '<h2 style="margin:0 0 12px 0;font-size:1.6rem;font-weight:800;color:#0f172a;">À vous de jouer 🚀</h2>'+
        '<p style="margin:0 0 22px 0;font-size:1rem;color:#475569;line-height:1.55;">Avant de commencer, prenez 5 minutes pour configurer ces deux choses. Vous pourrez aussi le faire plus tard depuis le menu Paramètres.</p>'+
        '<div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px;">'+
          '<button id="onb-go-cabs" style="text-align:left;background:#f0f9ff;border:1.5px solid #bae6fd;border-radius:12px;padding:16px 18px;cursor:pointer;display:flex;align-items:center;gap:14px;">'+
            '<div style="font-size:1.6rem;flex-shrink:0;">👥</div>'+
            '<div style="flex:1;"><div style="font-size:1.04rem;font-weight:700;color:#0c4a6e;margin-bottom:3px;">Ajouter mes dentistes</div><div style="font-size:.86rem;color:#475569;">Pour pouvoir leur envoyer des bons de livraison.</div></div>'+
            '<div style="color:#0284c7;font-size:1.3rem;">→</div>'+
          '</button>'+
          '<button id="onb-go-tarifs" style="text-align:left;background:#fef9c3;border:1.5px solid #fde047;border-radius:12px;padding:16px 18px;cursor:pointer;display:flex;align-items:center;gap:14px;">'+
            '<div style="font-size:1.6rem;flex-shrink:0;">💰</div>'+
            '<div style="flex:1;"><div style="font-size:1.04rem;font-weight:700;color:#854d0e;margin-bottom:3px;">Configurer mes prix</div><div style="font-size:.86rem;color:#475569;">Couronne, châssis, etc. — pour que les factures se calculent toutes seules.</div></div>'+
            '<div style="color:#a16207;font-size:1.3rem;">→</div>'+
          '</button>'+
        '</div>'+
        '<div style="display:flex;gap:12px;justify-content:space-between;flex-wrap:wrap;">'+
          '<button id="onb-back" style="background:transparent;border:none;color:#64748b;font-size:.94rem;cursor:pointer;padding:8px 0;">← Retour</button>'+
          '<button id="onb-finish" style="background:#16a34a;color:#fff;border:none;border-radius:10px;padding:14px 28px;font-size:1.02rem;font-weight:700;cursor:pointer;">Aller à l\u2019accueil</button>'+
        '</div>';
    }
    overlay.innerHTML='<div style="background:#fff;border-radius:18px;padding:36px 40px;max-width:540px;width:100%;box-shadow:0 30px 80px rgba(0,0,0,.4);">'+body+'</div>';

    if(step===1){
      const inp=document.getElementById('onb-name');setTimeout(function(){if(inp)inp.focus();},80);
      document.getElementById('onb-next').onclick=function(){
        const v=(document.getElementById('onb-name').value||'').trim();
        if(v){
          try{localStorage.setItem('lb_name',v);}catch(e){}
          if(typeof _updateHeaderLabName==='function')_updateHeaderLabName();
        }
        // Fermer le wizard et lancer le tour guidé
        overlay.remove();
        step=2;
        render();
      };
      document.getElementById('onb-skip').onclick=function(){close(true);};
      inp&&inp.addEventListener('keydown',function(e){if(e.key==='Enter')document.getElementById('onb-next').click();});
    }else if(step===2){
      document.getElementById('onb-back').onclick=function(){step=1;render();};
      document.getElementById('onb-finish').onclick=function(){close(true);};
      document.getElementById('onb-go-cabs').onclick=function(){
        close(true);
        const tab=document.querySelector('.tab[data-pane="cabinets"]');if(tab)tab.click();
      };

    }
  }
  document.body.appendChild(overlay);
  render();
}
/* Lance l'onboarding au démarrage si nécessaire (après auth + chargement données).
   Récupère le nom du labo depuis les metadata Supabase si une race condition
   a empêché le click handler du signup de mettre lb_name avant SIGNED_IN. */
function _maybeRunOnboarding(){
  try{
    if(currentUser&&currentUser.user_metadata&&currentUser.user_metadata.labo_name){
      const meta=String(currentUser.user_metadata.labo_name).trim();
      const stored=(localStorage.getItem('lb_name')||'').trim();
      if(meta&&!stored){
        localStorage.setItem('lb_name',meta);
        if(typeof _updateHeaderLabName==='function')_updateHeaderLabName();
      }
    }
  }catch(e){}
  if(_onbNeeded())setTimeout(runOnboardingWizard,400);
}

/* ════════════════════════════════════════════════════════════════════════════
   TOUR GUIDÉ : visite interactive de l'application avec spotlight + bulles
   Lancé après le signup ou via le menu compte → "Refaire le tour".
   ════════════════════════════════════════════════════════════════════════════ */
const TOUR_STEPS=[
  // ─── PHASE 1 : VISITE GUIDÉE (présentation des onglets) ─────────────────
  {target:null,title:"Bienvenue dans Labosync ! 👋",
   body:"Faisons un petit tour ensemble. En 2 minutes, vous saurez où tout se trouve et vous aurez ajouté votre premier dentiste et votre premier prix.\n\nÀ tout moment, vous pouvez passer le tour ou y revenir plus tard depuis le menu ⚙️ en haut à droite."},
  {target:'#header-labname',placement:'bottom',title:"Le nom de votre laboratoire",
   body:"Il s'affiche ici en haut à gauche. Cliquer dessus vous ramène toujours à l'accueil, où que vous soyez dans l'application."},
  {target:'#btn-drawer',placement:'bottom',title:"Le bouton menu ☰",
   body:"Ce bouton masque ou affiche le menu à gauche. Pratique pour gagner de la place quand vous travaillez sur un travail."},
  {target:'.tab[data-pane="saisie"]',placement:'right',title:"Mes travaux",
   body:"Le cœur de votre activité. Ici s'affichent :\n\n• Les nouvelles commandes envoyées par vos dentistes (à accepter)\n• Les travaux en cours\n\nVous traitez les commandes en cliquant dessus."},
  {target:'.tab[data-pane="calendrier"]',placement:'right',title:"Mon planning",
   body:"Pour visualiser vos travaux dans le temps, par jour ou par semaine. Pratique pour voir si vous êtes débordé ou si vous pouvez accepter de nouvelles commandes."},
  {target:'.tab[data-pane="cabinets"]',placement:'right',title:"Mes dentistes",
   body:"Tous vos clients. Pour chaque dentiste, vous créez un espace personnel (un \"portail\") où il pourra envoyer ses commandes en ligne, voir les bons de livraison et les factures.\n\n👉 C'est par ici qu'on commence quand on démarre."},
  {target:'.tab[data-pane="livraisons"]',placement:'right',title:"Mes livraisons",
   body:"Quand un travail est fini, vous générez ici un Bon de Livraison qui part automatiquement chez le dentiste — par messagerie ou imprimé."},
  {target:'.tab[data-pane="facturation"]',placement:'right',title:"Mes factures",
   body:"Une fois par mois (ou quand vous voulez), vous facturez vos dentistes en quelques clics, à partir des bons de livraison qu'ils ont reçus."},
  {target:'#btn-messages-hd',placement:'bottom',title:"La messagerie 💬",
   body:"Pour échanger avec vos dentistes : poser une question sur une commande, prévenir qu'un travail est prêt, etc. La pastille rouge vous prévient des nouveaux messages."},
  {target:'#btn-account',placement:'left',title:"Le menu ⚙️",
   body:"Tout ce qui concerne votre compte se trouve ici :\n\n• Paramètres (vos prix, votre mode de programmation, infos légales)\n• Changer de langue\n• Refaire le tour guidé\n• Déconnexion"},

  // ─── PHASE 2 : ON M'ACCOMPAGNE ? ───────────────────────────────────────
  {target:null,title:"Bonus : on continue ensemble ? 🤝",
   body:"Le tour est fini. Mais avant de vous laisser partir, je peux vous accompagner pour :\n\n1️⃣ Ajouter votre premier dentiste\n2️⃣ Configurer votre premier prix\n\nJe vous montre exactement où cliquer et quoi écrire.",
   nextLabel:"Oui, accompagnez-moi 👋",
   skipLabel:"Plus tard, merci"},

  // ─── PHASE 3 : PREMIER DENTISTE (main dans la main) ────────────────────
  {target:'.tab[data-pane="cabinets"]',placement:'right',title:"On y va !",
   body:"On commence par les dentistes. Cliquez sur « Allons-y » et je vous emmène sur l'onglet « Mes dentistes ».",
   nextLabel:"Allons-y →",
   onNext:function(){var t=document.querySelector('.tab[data-pane="cabinets"]');if(t)t.click();}},
  {target:'#cab-add-card',placement:'bottom',title:"Remplissez les infos du cabinet",
   body:"Voici le formulaire pour ajouter un dentiste. Tous les champs sont accessibles : tapez directement dans les cases.\n\n• Nom du cabinet (obligatoire) — par exemple « Dr Dupont — Cabinet Santé »\n• Téléphone (facultatif) — par exemple 06 12 34 56 78\n• Email (facultatif) — pour leur envoyer le lien d'accès au portail\n• Couleur — pour les distinguer visuellement\n\nQuand c'est rempli, cliquez sur Suivant. Vous pouvez aussi cliquer directement sur « + Ajouter » si vous préférez.",
   nextLabel:"Suivant : valider →",
   skipNextIfClicked:'#btn-cab-save'},
  {target:'#btn-cab-save',placement:'left',title:"Validez la création",
   body:"Cliquez maintenant sur le bouton « + Ajouter » pour enregistrer ce dentiste.\n\nAllez-y, je vous attends !",
   waitForClick:true},
  {target:null,title:"Bravo, votre premier dentiste est créé ! 🎉",
   body:"Vous pouvez en ajouter d'autres de la même façon, autant que vous voulez.\n\nMaintenant, configurons votre premier prix de prothèse."},

  // ─── PHASE 4 : PREMIER PRIX (main dans la main) ────────────────────────
  {target:null,title:"Direction : la facturation",
   body:"Les prix sont configurés dans l'onglet « Mes factures », tout en bas de la page. Cliquez sur « Allons-y » et je vous y emmène.",
   nextLabel:"Allons-y →",
   onNext:function(){
     var t=document.querySelector('.tab[data-pane="facturation"]');if(t)t.click();
     setTimeout(function(){var el=document.getElementById('tarif-card')||document.getElementById('tarif-label');if(el&&el.scrollIntoView)el.scrollIntoView({behavior:'smooth',block:'center'});},350);
   }},
  {target:'#tarif-card',placement:'top',title:"Renseignez votre premier prix",
   body:"Voici la section des prix. Le formulaire en bas vous permet d'ajouter une prestation et son tarif.\n\n• Prestation — par exemple « Couronne céramo-métallique »\n• Prix (€) — par exemple 120\n\nQuand c'est rempli, cliquez sur Suivant. Vous pouvez aussi cliquer directement sur « + Ajouter » si vous préférez.",
   nextLabel:"Suivant : valider →",
   skipNextIfClicked:'#btn-tarif-add'},
  {target:'#btn-tarif-add',placement:'left',title:"Enregistrez ce prix",
   body:"Cliquez maintenant sur le bouton « + Ajouter » pour enregistrer cette prestation.\n\nAllez-y, je vous attends !",
   waitForClick:true},
  {target:null,title:"Tout est prêt ! 🎉",
   body:"Vous savez maintenant ajouter des dentistes et des prix.\n\n📌 Les autres prix se configurent au même endroit, et vous trouverez plein d'autres réglages dans Paramètres.\n\n💡 Partout dans l'application, des « ? » expliquent les termes techniques.\n\nBon courage et bonne journée !"}
];

let _tourActive=false;
let _tourBlockingPaused=false;
function _blockClicksDuringTour(e){
  // Pause temporaire : pendant qu'on déclenche un clic programmatique
  // (ex: tab.click() dans onNext), on laisse passer pour ne pas bloquer la navigation.
  if(_tourBlockingPaused)return;
  const bubble=document.getElementById('tour-bubble');
  if(bubble&&bubble.contains(e.target))return;
  // Autoriser les clics sur la cible de l'étape courante (taper dans un input,
  // cliquer sur un bouton/onglet mis en évidence, etc.)
  if(_tourActive&&typeof _tourCurrentIdx==='number'&&_tourCurrentIdx>=0){
    const step=TOUR_STEPS[_tourCurrentIdx];
    if(step&&step.target){
      const target=document.querySelector(step.target);
      if(target&&(target===e.target||target.contains(e.target))){
        // Cas spécial : si l'utilisateur clique sur le bouton "valider" pendant l'étape
        // de remplissage du formulaire, on saute aussi l'étape suivante (qui ne ferait
        // que redemander de cliquer sur ce bouton).
        if(step.skipNextIfClicked){
          const skipBtn=document.querySelector(step.skipNextIfClicked);
          if(skipBtn&&(skipBtn===e.target||skipBtn.contains(e.target))){
            const idx=_tourCurrentIdx;
            setTimeout(function(){if(_tourCurrentIdx===idx)_showTourStep(idx+2);},700);
            return;
          }
        }
        // Pour les boutons/onglets (= non-inputs), avancer auto après le clic.
        // Pour les inputs : ne pas avancer auto (l'utilisateur tape et continue avec Suivant).
        const tag=(e.target.tagName||'').toUpperCase();
        const isFormField=tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT';
        if(step.waitForClick||!isFormField){
          const idx=_tourCurrentIdx;
          setTimeout(function(){if(_tourCurrentIdx===idx)_showTourStep(idx+1);},700);
        }
        return; // ne pas bloquer
      }
    }
  }
  e.stopPropagation();
  e.preventDefault();
}
function _clearTourElements(){
  document.querySelectorAll('.tour-spotlight, #tour-bubble').forEach(function(el){el.remove();});
}
function startOnboardingTour(){
  if(_tourActive)return;
  _tourActive=true;
  // S'assurer que la sidebar est visible pour les étapes qui ciblent les onglets
  if(typeof openDrawer==='function'&&!document.body.classList.contains('has-sidebar'))openDrawer();
  // Bloquer les clics ailleurs que sur la bulle (en phase capture pour que rien ne réagisse en dessous)
  document.addEventListener('click',_blockClicksDuringTour,true);
  // Repositionner la bulle si la fenêtre change de taille
  window.addEventListener('resize',_onTourResize);
  _showTourStep(0);
}
function _endTour(){
  _clearTourElements();
  document.removeEventListener('click',_blockClicksDuringTour,true);
  window.removeEventListener('resize',_onTourResize);
  _tourActive=false;
  try{localStorage.setItem('lb_onboarding_done','1');}catch(e){}
}
function _onTourResize(){
  // Re-render la bulle au même step (recalcule la position)
  if(_tourActive&&typeof _tourCurrentIdx==='number')_showTourStep(_tourCurrentIdx);
}
let _tourCurrentIdx=0;
function _showTourStep(idx){
  _clearTourElements();
  if(idx<0||idx>=TOUR_STEPS.length){_endTour();return;}
  _tourCurrentIdx=idx;
  const step=TOUR_STEPS[idx];
  const target=step.target?document.querySelector(step.target):null;
  // Si la cible existe, on la met en évidence
  if(target){
    try{target.scrollIntoView({behavior:'smooth',block:'center',inline:'center'});}catch(e){}
    // Attendre que le scroll fluide se termine (sinon le spotlight se positionne sur
    // les anciennes coordonnées et la bulle apparaît à côté de la mauvaise cible).
    setTimeout(function(){_renderTourSpotlightAndBubble(idx,step,target);},target.offsetParent?320:480);
  }else{
    _renderTourSpotlightAndBubble(idx,step,null);
  }
}
function _renderTourSpotlightAndBubble(idx,step,target){
  let targetRect=null;
  if(target){
    targetRect=target.getBoundingClientRect();
    const spot=document.createElement('div');
    spot.className='tour-spotlight';
    spot.style.cssText='top:'+(targetRect.top-6)+'px;left:'+(targetRect.left-6)+'px;width:'+(targetRect.width+12)+'px;height:'+(targetRect.height+12)+'px;';
    document.body.appendChild(spot);
  }
  const isFirst=idx===0;
  const isLast=idx===TOUR_STEPS.length-1;
  const nextLabel=step.nextLabel||(isLast?"C'est parti ! 🚀":'Suivant →');
  const skipLabel=step.skipLabel||'Passer le tour';
  // Sur les étapes "main dans la main" qui attendent une action sur la cible,
  // on remplace le bouton "Suivant" par un encadré "👉 À vous de jouer".
  const waitMode=!!step.waitForClick;
  const bubble=document.createElement('div');
  bubble.id='tour-bubble';
  if(!targetRect)bubble.classList.add('tour-centered');
  bubble.innerHTML=
    '<div class="tour-bubble-title">'+escH2(step.title)+'</div>'+
    '<div class="tour-bubble-body">'+escH2(step.body)+'</div>'+
    (waitMode
      ? '<div style="background:#fef9c3;border-left:3px solid #facc15;padding:10px 14px;border-radius:0 6px 6px 0;font-size:.9rem;color:#854d0e;font-weight:600;margin-bottom:14px;">👉 À vous de jouer — j\'avance dès que vous cliquez sur l\'élément encadré.</div>'
      : '')+
    '<div class="tour-bubble-nav">'+
      '<span class="tour-step-counter">Étape '+(idx+1)+' / '+TOUR_STEPS.length+'</span>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap;">'+
        (!isFirst?'<button class="tour-btn tour-btn-prev" id="tour-prev">← Précédent</button>':'')+
        (!waitMode?'<button class="tour-btn tour-btn-next" id="tour-next">'+escH2(nextLabel)+'</button>':'')+
      '</div>'+
    '</div>'+
    (!isLast?'<button class="tour-btn-skip" id="tour-skip">'+escH2(skipLabel)+'</button>':'');
  document.body.appendChild(bubble);
  if(targetRect)_positionTourBubble(bubble,targetRect,step.placement||'bottom');
  const prev=document.getElementById('tour-prev');
  if(prev)prev.onclick=function(){_showTourStep(idx-1);};
  const next=document.getElementById('tour-next');
  if(next)next.onclick=function(){
    // Exécuter l'action liée au "Suivant" (ex: cliquer sur un onglet de navigation)
    if(typeof step.onNext==='function'){
      // Pause le bloqueur de clics pour que les clics programmatiques (tab.click(), etc.)
      // déclenchés dans onNext puissent atteindre leurs handlers.
      _tourBlockingPaused=true;
      try{step.onNext();}catch(e){console.warn('tour onNext',e);}
      setTimeout(function(){_tourBlockingPaused=false;},200);
    }
    if(isLast)_endTour();else _showTourStep(idx+1);
  };
  const skip=document.getElementById('tour-skip');
  if(skip)skip.onclick=_endTour;
}
function _rectsOverlap(a,b){
  return !(a.right<=b.left||a.left>=b.right||a.bottom<=b.top||a.top>=b.bottom);
}
function _computeBubblePos(targetRect,r,placement,margin){
  let top,left;
  switch(placement){
    case 'top':
      top=targetRect.top-r.height-margin;
      left=targetRect.left+(targetRect.width/2)-(r.width/2);
      break;
    case 'right':
      top=targetRect.top+(targetRect.height/2)-(r.height/2);
      left=targetRect.right+margin;
      break;
    case 'left':
      top=targetRect.top+(targetRect.height/2)-(r.height/2);
      left=targetRect.left-r.width-margin;
      break;
    default: // bottom
      top=targetRect.bottom+margin;
      left=targetRect.left+(targetRect.width/2)-(r.width/2);
  }
  // Garder dans l'écran
  const m=14;
  if(left<m)left=m;
  if(left+r.width>window.innerWidth-m)left=window.innerWidth-r.width-m;
  if(top<m)top=m;
  if(top+r.height>window.innerHeight-m)top=window.innerHeight-r.height-m;
  return {top:top,left:left,right:left+r.width,bottom:top+r.height,width:r.width,height:r.height};
}
function _positionTourBubble(bubble,targetRect,preferred){
  const margin=18;
  const r=bubble.getBoundingClientRect();
  // Essayer le placement préféré, puis les autres jusqu'à en trouver un qui
  // n'empiète pas sur la cible (sinon le bouton serait inaccessible)
  const tried=[preferred,'top','bottom','left','right'];
  const seen={};
  for(let i=0;i<tried.length;i++){
    const p=tried[i];if(!p||seen[p])continue;seen[p]=true;
    const pos=_computeBubblePos(targetRect,r,p,margin);
    if(!_rectsOverlap(pos,targetRect)){
      bubble.style.top=pos.top+'px';
      bubble.style.left=pos.left+'px';
      return;
    }
  }
  // Fallback : appliquer le placement préféré tel quel
  const pos=_computeBubblePos(targetRect,r,preferred||'bottom',margin);
  bubble.style.top=pos.top+'px';
  bubble.style.left=pos.left+'px';
}
/* Permet de relancer le tour depuis n'importe où (notamment le menu compte) */
function replayOnboardingTour(){
  try{localStorage.removeItem('lb_onboarding_done');}catch(e){}
  startOnboardingTour();
}

/* Confirmation centrée — impossible à manquer pour un utilisateur 60+
   Reste 6 secondes ou jusqu'au clic. Variante : showConfirm(msg, {kind:'success'|'error'|'info', duration:N, action:{label:'',onClick:fn}}) */
function showConfirm(msg,opts){
  opts=opts||{};
  const kind=opts.kind||'success';
  const palette={
    success:{bg:'#16a34a',icon:'✓'},
    error:  {bg:'#dc2626',icon:'✗'},
    info:   {bg:'#2563eb',icon:'i'}
  };
  const p=palette[kind]||palette.success;
  const overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:10000;display:flex;align-items:center;justify-content:center;animation:fadeIn .15s ease;';
  const box=document.createElement('div');
  box.style.cssText='background:#fff;border-radius:14px;padding:30px 36px;max-width:440px;width:90%;box-shadow:0 20px 60px rgba(15,23,42,.25);text-align:center;';
  box.innerHTML='<div style="width:64px;height:64px;border-radius:50%;background:'+p.bg+';color:#fff;font-size:2.4rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;line-height:1;">'+p.icon+'</div>'+
    '<div style="font-size:1.05rem;color:#1e293b;line-height:1.5;font-weight:500;margin-bottom:18px;white-space:pre-wrap;">'+escH2(msg)+'</div>'+
    (opts.action?'<button id="confirm-action-btn" style="background:'+p.bg+';color:#fff;border:none;border-radius:8px;padding:10px 22px;font-size:.96rem;font-weight:600;cursor:pointer;margin-right:8px;">'+escH2(opts.action.label)+'</button>':'')+
    '<button id="confirm-close-btn" style="background:#f1f5f9;color:#475569;border:none;border-radius:8px;padding:10px 22px;font-size:.96rem;font-weight:600;cursor:pointer;">OK</button>';
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  function close(){if(overlay.parentNode)overlay.parentNode.removeChild(overlay);}
  overlay.addEventListener('click',function(e){if(e.target===overlay)close();});
  box.querySelector('#confirm-close-btn').addEventListener('click',close);
  if(opts.action&&typeof opts.action.onClick==='function'){
    box.querySelector('#confirm-action-btn').addEventListener('click',function(){close();opts.action.onClick();});
  }
  const dur=opts.duration||6000;
  if(dur>0)setTimeout(close,dur);
  // Échap pour fermer
  function onKey(e){if(e.key==='Escape'){close();document.removeEventListener('keydown',onKey);}}
  document.addEventListener('keydown',onKey);
  return close;
}

document.getElementById('btn-new-bdc').addEventListener('click',openBdcForm);
document.getElementById('btn-bdc-save').addEventListener('click',saveBdc);
document.getElementById('btn-bdc-cancel').addEventListener('click',function(){document.getElementById('bdc-form').style.display='none';});
document.getElementById('btn-bdc-add-line').addEventListener('click',function(){bdcLines.push({produit:'',ref:'',qte:1,lot:''});renderBdcLines();});
document.getElementById('btn-bdc-rec-ok').addEventListener('click',confirmBdcReception);
document.getElementById('btn-bdc-rec-cancel').addEventListener('click',function(){document.getElementById('bdc-rec-modal').style.display='none';});
document.getElementById('btn-fourn-add').addEventListener('click',function(){
  const name=document.getElementById('fourn-name').value.trim();
  const contact=document.getElementById('fourn-contact').value.trim();
  if(!name){alert(t('alert.enter_name'));return;}
  fourns.push({id:String(Date.now()),name,contact});sfourns();renderFournList();syncBdcFourn();
  document.getElementById('fourn-name').value='';document.getElementById('fourn-contact').value='';
});
document.getElementById('bdc-filter').addEventListener('change',renderBdcList);
document.getElementById('bdc-list').addEventListener('click',function(e){
  const btn=e.target.closest('[data-bid]');if(!btn)return;
  const id=btn.dataset.bid;const action=btn.dataset.ba;
  const doc=bdc.find(function(b){return b.id===id;});if(!doc)return;
  if(action==='commander'){doc.status='commande';sbdc();renderBdcList();showToast(t('toast.bdc_ordered'));}
  else if(action==='reception'){openBdcReception(id);}
  else if(action==='pdf'){genBdcPDF(id);}
  else if(action==='del'){if(confirm(t('confirm.delete_bl'))){bdc=bdc.filter(function(b){return b.id!==id;});sbdc();renderBdcList();}}
});


/* ══════════════════════════════════════════
   §29 — BONS DE LIVRAISON (BDL) & PORTAIL CABINET
   ══════════════════════════════════════════ */
let bdl = JSON.parse(localStorage.getItem('lb_bdl')||'[]');
function saveBdl(){localStorage.setItem('lb_bdl',JSON.stringify(bdl));scheduleSave();}

function genBLNum(){
  const y=new Date().getFullYear();
  const n=bdl.filter(function(b){return b.num&&b.num.includes(String(y));}).length+1;
  return 'BL-'+y+'-'+String(n).padStart(3,'0');
}

// Lance la création d'un bon de livraison (affiche le sélecteur de cabinet)
async function genBonLivraison(jobId){
  let job=jobs.find(function(j){return j.id===jobId;});
  if(!job){
    // Item en file d'attente non programmé → promouvoir en job
    const qIdx=queue.findIndex(function(q){return q.id===jobId;});
    if(qIdx===-1)return;
    const qi=queue[qIdx];
    job=applyDeliveryFieldsToObject({id:qi.id,patient:qi.patient,type:qi.type,tasks:[],nb:qi.nb||1,urgent:qi.urgent||false,note:qi.note||'',cabinet:qi.cabinet||'',prothesisId:qi.prothesisId||'',trackCode:qi.trackCode||genTrackCode(),createdAt:qi.createdAt||new Date().toISOString()},_deliveryFieldsFromSource(qi));
    jobs.push(job);
    queue.splice(qIdx,1);
    saveJobs();saveQueue();render();
  }
  showCabPicker(jobId);
}

function showCabPicker(jobId){
  const existing=document.getElementById('cab-picker-modal');
  if(existing)existing.remove();
  const job=jobs.find(function(j){return j.id===jobId;});if(!job)return;
  const currentCabId=job.cabinet||'';

  // ── Section prix — mono-type ou multi-type ─────────────────────────────────
  const rawItems=job.items&&job.items.length?job.items:[{type:job.type,nb:job.nb||1}];
  const isMulti=rawItems.length>1;

  let prixSectionHtml='';
  if(!isMulti){
    // Mono-type : 1 champ prix avec suggestion historique
    const typeTarif=tarifs.find(function(t){return t.types&&t.types.includes(job.type);});
    const defaultPrix=typeTarif?typeTarif.prix:0;
    const blsSameTypeCab=bdl.filter(function(b){return b.type===job.type&&b.cabinet===currentCabId&&b.prix>0;});
    const blsSameType=bdl.filter(function(b){return b.type===job.type&&b.prix>0;});
    const blsRef=blsSameTypeCab.length?blsSameTypeCab:blsSameType;
    let suggestion=null;
    if(blsRef.length){suggestion=Math.round(blsRef.reduce(function(s,b){return s+b.prix;},0)/blsRef.length*100)/100;}
    const suggHtml=suggestion!==null
      ?'<div style="font-size:.72rem;background:var(--accent-soft);border:1px solid var(--accent);border-radius:7px;padding:6px 10px;margin-bottom:8px;cursor:pointer;display:flex;align-items:center;gap:6px;" onclick="document.getElementById(\'cab-picker-prix-0\').value=\''+suggestion+'\'">'+
          '<span style="font-size:.8rem;">💡</span>'+
          '<span>Suggestion basée sur '+(blsSameTypeCab.length?'ce cabinet':'l\'historique')+' : <strong>'+suggestion.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+' €</strong> — cliquer pour appliquer</span>'+
        '</div>'
      :'';
    prixSectionHtml=
      '<div style="font-size:.65rem;font-weight:500;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-soft);margin-bottom:4px;">Prix unitaire interne (€)</div>'+
      suggHtml+
      '<input type="number" id="cab-picker-prix-0" min="0" step="0.01" value="'+defaultPrix+'" style="width:100%;border:1.5px solid var(--border);border-radius:8px;background:var(--bg);font-family:monospace;font-size:.9rem;padding:9px 12px;color:var(--ink);outline:none;margin-bottom:18px;"/>';
  } else {
    // Multi-type : 1 champ prix par item
    prixSectionHtml=
      '<div style="font-size:.65rem;font-weight:500;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-soft);margin-bottom:6px;">Prix par type (€)</div>'+
      '<div style="display:flex;flex-direction:column;gap:6px;margin-bottom:18px;">'+
      rawItems.map(function(item,i){
        const typeTarif=tarifs.find(function(t){return t.types&&t.types.includes(item.type);});
        const defaultPrix=typeTarif?typeTarif.prix:0;
        return '<div style="display:flex;align-items:center;gap:8px;">'+
          '<span style="flex:1;font-size:.8rem;color:var(--ink);">'+(TYPE_LABELS[item.type]||item.type)+(item.nb>1?' × '+item.nb:'')+'</span>'+
          '<input type="number" id="cab-picker-prix-'+i+'" min="0" step="0.01" value="'+defaultPrix+'" style="width:90px;border:1.5px solid var(--border);border-radius:8px;background:var(--bg);font-family:monospace;font-size:.88rem;padding:7px 10px;color:var(--ink);outline:none;"/> €'+
        '</div>';
      }).join('')+
      '</div>';
  }
  const suggestionHtml='';

  const modal=document.createElement('div');
  modal.id='cab-picker-modal';
  modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:5000;display:flex;align-items:center;justify-content:center;padding:16px;';
  modal.innerHTML=
    '<div style="background:var(--surface);border-radius:16px;padding:26px;width:420px;max-width:95vw;box-shadow:0 8px 32px rgba(0,0,0,.25);">'+
      '<div style="font-family:\'Inter\',sans-serif;font-weight:700;font-size:1.1rem;margin-bottom:4px;">📋 Bon de livraison</div>'+
      '<div style="font-size:.76rem;color:var(--ink-soft);margin-bottom:18px;">'+job.patient+' — '+getJobTypeLabel(job)+'</div>'+

      '<div style="font-size:.65rem;font-weight:500;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-soft);margin-bottom:6px;">Cabinet destinataire</div>'+
      '<select id="cab-picker-sel" style="width:100%;border:2px solid var(--accent);border-radius:8px;background:var(--bg);font-family:monospace;font-size:.88rem;padding:10px 12px;color:var(--ink);outline:none;margin-bottom:10px;">'+
        '<option value="">— Sélectionner un cabinet —</option>'+
        cabinets.map(function(c){return '<option value="'+c.id+'"'+(c.id===currentCabId?' selected':'')+'>'+c.name+'</option>';}).join('')+
      '</select>'+

      // Ajouter nouveau cabinet inline
      '<div id="cab-picker-new-toggle" style="font-size:.72rem;color:var(--accent);cursor:pointer;margin-bottom:14px;text-decoration:underline;">+ Nouveau cabinet</div>'+
      '<div id="cab-picker-new-form" style="display:none;background:var(--bg);border:1px solid var(--border);border-radius:9px;padding:12px;margin-bottom:14px;">'+
        '<div style="font-size:.65rem;font-weight:500;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-soft);margin-bottom:8px;">Nouveau cabinet</div>'+
        '<div style="display:flex;gap:8px;margin-bottom:8px;">'+
          '<input type="text" id="cab-picker-name" placeholder="Dr Dupont — Cabinet Santé" style="flex:1;border:1.5px solid var(--border);border-radius:7px;background:var(--surface);font-family:monospace;font-size:.82rem;padding:8px 10px;color:var(--ink);outline:none;"/>'+
        '</div>'+
        '<div style="display:flex;gap:8px;">'+
          '<input type="text" id="cab-picker-phone" placeholder="Téléphone" style="flex:1;border:1.5px solid var(--border);border-radius:7px;background:var(--surface);font-family:monospace;font-size:.82rem;padding:8px 10px;color:var(--ink);outline:none;"/>'+
          '<input type="email" id="cab-picker-email" placeholder="Email" style="flex:1;border:1.5px solid var(--border);border-radius:7px;background:var(--surface);font-family:monospace;font-size:.82rem;padding:8px 10px;color:var(--ink);outline:none;"/>'+
          '<button id="cab-picker-new-add" style="background:#2a6049;color:#fff;border:none;border-radius:7px;padding:8px 12px;font-family:monospace;font-size:.76rem;cursor:pointer;white-space:nowrap;">+ Créer</button>'+
        '</div>'+
      '</div>'+

      '<div style="font-size:.65rem;font-weight:500;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-soft);margin-bottom:6px;">Matériaux utilisés</div>'+
      '<input type="text" id="cab-picker-materiaux" placeholder="ex: Zircone, titane, e.max..." style="width:100%;border:1.5px solid var(--border);border-radius:8px;background:var(--bg);font-family:monospace;font-size:.84rem;padding:9px 12px;color:var(--ink);outline:none;margin-bottom:14px;box-sizing:border-box;"/>'+

      '<div style="font-size:.65rem;font-weight:500;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-soft);margin-bottom:6px;">N° de lot (traçabilité)</div>'+
      '<input type="text" id="cab-picker-lot" placeholder="ex: LOT-2024-001, 240501..." style="width:100%;border:1.5px solid var(--border);border-radius:8px;background:var(--bg);font-family:monospace;font-size:.84rem;padding:9px 12px;color:var(--ink);outline:none;margin-bottom:14px;box-sizing:border-box;"/>'+

      prixSectionHtml+

      '<div style="display:flex;gap:8px;">'+
        '<button id="cab-picker-ok" style="flex:1;background:#5a3472;color:#fff;border:none;border-radius:8px;padding:12px;font-family:monospace;font-size:.84rem;font-weight:600;cursor:pointer;">📋 Générer le bon</button>'+
        '<button onclick="document.getElementById(\'cab-picker-modal\').remove();" style="background:none;border:1px solid var(--border);border-radius:8px;padding:12px 14px;font-family:monospace;font-size:.82rem;cursor:pointer;color:var(--ink-soft);">Annuler</button>'+
      '</div>'+
    '</div>';
  document.body.appendChild(modal);

  // Toggle new cabinet form
  document.getElementById('cab-picker-new-toggle').addEventListener('click',function(){
    const f=document.getElementById('cab-picker-new-form');
    f.style.display=f.style.display==='none'?'block':'none';
  });

  // Create new cabinet from picker
  document.getElementById('cab-picker-new-add').addEventListener('click',function(){
    const name=document.getElementById('cab-picker-name').value.trim();
    const phone=document.getElementById('cab-picker-phone').value.trim();
    const email=document.getElementById('cab-picker-email').value.trim();
    if(!name){alert(t('alert.enter_cab'));return;}
    if(cabinets.find(function(c){return c.name.toLowerCase()===name.toLowerCase();})){alert(t('alert.cab_exists'));return;}
    const portalId='CAB-'+Math.random().toString(36).substr(2,8).toUpperCase();
    const code=Math.random().toString(36).substr(2,6).toUpperCase();
    const pwd=Math.random().toString(36).substr(2,8);
    const colors=['#1a4a7a','#2a6049','#5a3472','#c8410a','#7b3f00'];
    const color=colors[cabinets.length%colors.length];
    const newCab={id:String(Date.now()),name,color,phone,email,portalId,code,pwd};
    cabinets.push(newCab);
    saveCabinets();refreshCabSelects();renderCabList();
    // Add to select and pre-select
    const sel=document.getElementById('cab-picker-sel');
    const opt=document.createElement('option');
    opt.value=newCab.id;opt.textContent=newCab.name;opt.selected=true;
    sel.appendChild(opt);
    document.getElementById('cab-picker-new-form').style.display='none';
    document.getElementById('cab-picker-name').value='';
    document.getElementById('cab-picker-phone').value='';
    document.getElementById('cab-picker-email').value='';
    showToast('✅ Cabinet '+name+' créé !','#2a6049');
  });

  // Generate BL
  document.getElementById('cab-picker-ok').addEventListener('click',async function(){
    const cabId=document.getElementById('cab-picker-sel').value;
    // Collecter les prix — 1 champ par item (id cab-picker-prix-0, -1, -2…)
    const prixParItem=rawItems.map(function(_,i){
      return parseFloat(document.getElementById('cab-picker-prix-'+i)?.value)||0;
    });
    const materiaux=document.getElementById('cab-picker-materiaux').value.trim();
    const lot=document.getElementById('cab-picker-lot').value.trim();
    if(!cabId){alert(t('alert.select_cab'));return;}
    const cab=cabinets.find(function(c){return c.id===cabId;});if(!cab)return;
    if(!cab.portalId){cab.portalId='CAB-'+Math.random().toString(36).substr(2,8).toUpperCase();}
    if(!cab.code){cab.code=Math.random().toString(36).substr(2,6).toUpperCase();}
    if(!cab.pwd){cab.pwd=Math.random().toString(36).substr(2,8);}
    // Associate cabinet to job
    job.cabinet=cabId;saveJobs();
    saveCabinets();
    modal.remove();
    await createBL(job, cab, prixParItem, materiaux, lot);
  });
}

// Crée l'objet BL, le sauvegarde et publie le portail cabinet
async function createBL(job, cab, prixOverride, materiaux, lot){
  if(!cab.portalId){cab.portalId='CAB-'+Math.random().toString(36).substr(2,8).toUpperCase();}
  if(!cab.code){cab.code=Math.random().toString(36).substr(2,6).toUpperCase();}
  if(!cab.pwd){cab.pwd=Math.random().toString(36).substr(2,8);}
  saveCabinets();

  // Construire les lignes (multi-type ou type unique)
  const rawItems=job.items&&job.items.length?job.items:[{type:job.type,nb:job.nb||1}];
  const lignes=rawItems.map(function(item,i){
    const t=tarifs.find(function(x){return x.types&&x.types.includes(item.type);});
    // prixOverride peut être un tableau (multi-type) ou une valeur unique (mono-type)
    let pu;
    if(Array.isArray(prixOverride)){pu=prixOverride[i]!==undefined?prixOverride[i]:(t?t.prix:0);}
    else{pu=prixOverride!==undefined&&rawItems.length===1?prixOverride:(t?t.prix:0);}
    return {type:item.type,typeLabel:TYPE_LABELS[item.type]||item.type,nb:item.nb||1,prix:pu,total:pu*(item.nb||1)};
  });
  const totalBL=lignes.reduce(function(s,l){return s+l.total;},0);
  const firstLigne=lignes[0];

  const bl={
    id:String(Date.now()),
    num:genBLNum(),
    jobId:job.id,
    patient:job.patient||'',
    trackCode:job.trackCode||'',
    prothesisId:job.prothesisId||'',
    type:firstLigne.type,
    typeLabel:lignes.length>1?lignes.map(function(l){return l.typeLabel;}).join(', '):firstLigne.typeLabel,
    nb:firstLigne.nb,
    lignes:lignes,
    note:job.note||'',
    materiaux:materiaux||'',
    lot:lot||'',
    cabinet:cab.id,
    cabName:cab.name,
    cabPortalId:cab.portalId||'',
    prix:firstLigne.prix,
    total:totalBL,
    deliveryDate:_jobLabDeliveryDate(job)||'',
    labDeliverySlot:job.labDeliverySlot||'12',
    requestedDeliveryDate:_jobRequestedDeliveryDate(job)||'',
    date:fmtISO(new Date()),
    status:'envoye',
    createdAt:new Date().toISOString(),
    // Lien vers la fiche de commande (si le travail vient d'une fiche cabinet)
    orderId:job.orderId||null,
    orderPortalId:job.orderPortalId||null,
    orderStepId:job.orderStepId||null,
    orderData:job.orderData||null,
    parentJobId:job.parentJobId||null
  };
  bdl.unshift(bl);saveBdl();
  // Si ce job vient d'une étape de cas, marquer l'étape comme livrée côté Supabase
  if(job.orderId&&job.orderStepId&&job.orderPortalId){
    _markStepDelivered(job.orderPortalId,job.orderId,job.orderStepId,bl.id).catch(function(e){console.warn('markStepDelivered',e);});
  }
  showConfirm('Bon de livraison '+bl.num+' généré pour '+cab.name+'.',{
    kind:'success',
    action:{label:'📄 Imprimer le bon',onClick:function(){if(typeof printBL==='function')printBL(bl.id);}}
  });
  if(typeof renderLivraisons==='function')renderLivraisons();
  publishPortal(cab).catch(function(e){console.warn('Portal sync failed:',e);});
}

async function _markStepDelivered(portalId,caseId,stepId,blId){
  const list=_pendingOrdersCache[portalId]||await _fetchOrdersForCab(portalId);
  const cIdx=list.findIndex(function(x){return x.id===caseId;});
  if(cIdx<0)return;
  _migrateOrderToCase(list[cIdx]);
  const sIdx=(list[cIdx].steps||[]).findIndex(function(s){return s.id===stepId;});
  if(sIdx<0)return;
  list[cIdx].steps[sIdx].status='delivered';
  list[cIdx].steps[sIdx].deliveredAt=new Date().toISOString();
  list[cIdx].steps[sIdx].blId=blId;
  list[cIdx].updatedAt=new Date().toISOString();
  await _writeOrdersForCab(portalId,list);
  _pendingOrdersCache[portalId]=list;
}

/* Dérive le statut :
   - si tâches planifiées → automatique depuis les dates
   - sinon → manuel via job.portalStep (défaut : recu) */
function getJobAutoStep(job){
  if(job.tasks&&job.tasks.length){
    const total=job.tasks.length;
    const done=job.tasks.filter(function(t){return t.done;}).length;
    const pct=Math.round(done/total*100);
    // Si des tâches sont cochées → la complétion prime sur les dates
    if(done>0){
      if(pct>=100)return 'pret';
      if(pct>=67)return 'finition';
      return 'production';
    }
    // Aucune tâche cochée mais dates disponibles → automatique par date
    const dates=job.tasks.map(function(t){return new Date(t.dueDate);}).filter(function(d){return !isNaN(d);});
    if(dates.length){
      const today=new Date();today.setHours(0,0,0,0);
      dates.sort(function(a,b){return a-b;});
      const first=new Date(dates[0]);first.setHours(0,0,0,0);
      const last=new Date(dates[dates.length-1]);last.setHours(0,0,0,0);
      if(first>today)return 'recu';
      if(last<today)return 'pret';
      const ratio=(today-first)/(last-first||1);
      if(ratio>=0.67)return 'finition';
      return 'production';
    }
  }
  // Pas de planification → statut manuel
  return job.portalStep||'recu';
}

/* Avance manuellement le statut d'un job et publie le portail */
function setJobPortalStep(jobId, step){
  const job=jobs.find(function(j){return String(j.id)===String(jobId);});if(!job)return;
  job.portalStep=step;saveJobs();
  autoPublishCab(job.cabinet);
  renderLivraisons();
  showToast(ti('toast.status_updated',{status:t('suivi.'+step)}),'#2a6049');
}

/* Publie le portail du cabinet associé à un job (fire & forget) */
function autoPublishCab(cabId){
  if(!cabId)return;
  const cab=cabinets.find(function(c){return c.id===cabId;});
  if(cab)publishPortal(cab);
}

async function publishPortal(cab){
  if(!cab||!cab.portalId)return;
  const token=_cachedAccessToken;
  if(!token){console.warn('publishPortal: token non disponible');return;}

  // Get all BDLs for this cabinet
  const cabBdl=bdl.filter(function(b){return b.cabinet===cab.id;});
  // Get invoices AND credit notes (avoirs) for this cabinet
  const cabDocs=JSON.parse(localStorage.getItem('lb_docs')||'[]').filter(function(d){return d.cabinet===cab.id&&(d.type==='facture'||d.type==='avoir');});

  const legalForPortal=getLegalInfo();
  const payload={
    cabId:cab.id,
    cabName:cab.name,
    cabPhone:cab.phone||'',
    cabEmail:cab.email||'',
    cabCode:cab.code||'',
    cabPwd:cab.pwd||'',
    portalId:cab.portalId,
    laboName:localStorage.getItem('lb_name')||'Laboratoire Dentaire',
    laboLegal:legalForPortal,
    bdl:cabBdl,
    travaux:[],
    patients:[...new Set(jobs.filter(function(j){return j.cabinet===cab.id;}).map(function(j){return j.patient||'';}).filter(Boolean))],
    factures:cabDocs.filter(function(d){return d.status!=='brouillon';}).map(function(d){return {id:d.id,num:d.num,type:d.type||'facture',avoirOf:d.avoirOf||null,date:d.date,total:d.total,status:d.status,note:d.note||'',lines:(d.lines||[]).map(function(l){return Object.assign({},l);}),bdlRefs:d.bdlRefs||[],stripeUrl:d.stripeUrl||null};}),
    updatedAt:new Date().toISOString()
  };

  try{
    const r=await fetch(SB_URL+'/rest/v1/labo_data',{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'apikey':SB_KEY,
        'Authorization':'Bearer '+token,
        'Prefer':'resolution=merge-duplicates,return=minimal'
      },
      body:JSON.stringify({id:'portal_'+cab.portalId,data:payload,updated_at:new Date().toISOString()})
    });
    if(!r.ok&&r.status!==201&&r.status!==204){
      const t=await r.text();
      console.warn('publishPortal error',r.status,t);
      showToast(ti('toast.portal_error',{status:r.status}),'#c0392b');
    }
  }catch(e){
    showToast(ti('toast.network_error',{msg:String(e).slice(0,80)}),'#c0392b');
  }
}

/* Suivi de commande portail : fonctionnalité désactivée — les praticiens ne voient pas la progression */
function isSuiviActif(){return false;}
function saveSuiviToggle(){}
function updateSuiviToggleUI(){}

/* ── Toggle programmation ── */
function isProgActif(){return localStorage.getItem('lb_prog_actif')==='1';}
function saveProgToggle(){
  const on=document.getElementById('toggle-prog').checked;
  localStorage.setItem('lb_prog_actif',on?'1':'0');
  updateProgToggleUI();
  applyProgMode();
}
function updateProgToggleUI(){
  const on=isProgActif();
  const cb=document.getElementById('toggle-prog');
  const track=document.getElementById('toggle-prog-track');
  const thumb=document.getElementById('toggle-prog-thumb');
  if(!cb)return;
  cb.checked=on;
  if(track)track.style.background=on?'#2a6049':'var(--border)';
  if(thumb)thumb.style.transform=on?'translateX(20px)':'none';
}
// Redirige vers l'ajout de technicien (active la prog si besoin)
function goToAddTech(){
  if(!isProgActif()){
    localStorage.setItem('lb_prog_actif','1');
    const tog=document.getElementById('toggle-prog');if(tog)tog.checked=true;
    applyProgMode();
    if(typeof updateProgToggleUI==='function')updateProgToggleUI();
  }
  const btn=document.querySelector('[data-pane="equipe"]');if(btn)btn.click();
}

function applyProgMode(){
  const on=isProgActif();
  // Onglets réservés à la programmation (équipe, impression, attente…)
  document.querySelectorAll('.prog-tab').forEach(function(el){
    el.style.display=on?'':'none';
  });
  // Onglet Travaux/Programmation : toujours visible, texte change
  const tabSaisie=document.querySelector('[data-pane="saisie"]');
  if(tabSaisie){
    const badge=tabSaisie.querySelector('.queue-badge');
    const badgeHtml=badge?badge.outerHTML:'';
    tabSaisie.innerHTML=(on?'🔬 Programmation ':'📋 Mes travaux ')+badgeHtml;
    tabSaisie.style.display='';
  }
  // Bouton "Ajouter le travail" dans le formulaire
  const btnSaisieAdd=document.getElementById('btn-saisie-add');
  if(btnSaisieAdd)btnSaisieAdd.textContent=on?'+ Mettre en file d\'attente':'+ Ajouter le travail';
  // Queue et tgrid : visibles seulement en mode prog ON
  const queueSection=document.getElementById('queue-section');
  if(queueSection)queueSection.style.display=on?'':'none';
  const tgridStitle=document.getElementById('tgrid-stitle');
  if(tgridStitle)tgridStitle.style.display=on?'':'none';
  const tgridContainer=document.getElementById('tgrid-container');
  if(tgridContainer)tgridContainer.style.display=on?'':'none';
  // Titre et colonnes de la table des travaux
  const jobTitle=document.getElementById('jobs-section-title');
  if(jobTitle)jobTitle.innerHTML=on?'✅ Travaux programmés <span class="sbadge" id="jobs-cnt-saisie">0</span>':'📋 Travaux <span class="sbadge" id="jobs-cnt-saisie">0</span>';
  const thEtape=document.getElementById('th-etape');const thTech=document.getElementById('th-tech');
  if(thEtape)thEtape.style.display=on?'':'none';
  if(thTech)thTech.style.display=on?'':'none';
  // Si prog désactivé et pane actif est un pane prog → aller au dashboard
  const active=document.querySelector('#tabs-labo .tab.on');
  if(active){
    const p=active.dataset.pane;
    if(!on&&['impression','attente','equipe'].includes(p)){
      document.querySelector('[data-pane="dashboard"]').click();
    }
  }
}

function getLegalInfo(){
  return {
    raisonSociale: localStorage.getItem('lb_legal_raison')||localStorage.getItem('lb_name')||'Laboratoire Dentaire',
    siret:         localStorage.getItem('lb_legal_siret')||'',
    adresse:       localStorage.getItem('lb_legal_adresse')||'',
    tel:           localStorage.getItem('lb_legal_tel')||'',
    email:         localStorage.getItem('lb_legal_email')||'',
    directeur:     localStorage.getItem('lb_legal_directeur')||'',
    ceNum:         localStorage.getItem('lb_legal_ce_num')||''
  };
}

function printBL(blId){
  const bl=bdl.find(function(b){return b.id===blId;});
  if(!bl){showToast(t('toast.bl_not_found'),'#c0392b');return;}
  const job=jobs.find(function(j){return j.id===bl.jobId;})||{};
  const cab=cabinets.find(function(c){return c.id===bl.cabinet;})||{name:bl.cabName||''};
  const labo=getLegalInfo();

  const dateFormatted=new Date(bl.date+'T12:00:00').toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'});
  const blDateShort=new Date(bl.date+'T12:00:00').toLocaleDateString('fr-FR');
  const patient=bl.patient||job.patient||'—';
  const typeLabel=bl.typeLabel||'Prothèse dentaire';
  const nb=bl.nb||1;
  const materiaux=bl.materiaux||'—';
  const ref=bl.prothesisId||bl.trackCode||bl.num;

  const html=`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<title>BL ${bl.num} — ${patient}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Helvetica Neue',Arial,sans-serif;font-size:10pt;color:#1c1714;background:#fff;padding:0;}
  .page{width:210mm;min-height:297mm;margin:0 auto;padding:18mm 18mm 16mm;}
  @media print{.page{padding:15mm 16mm 12mm;} .no-print{display:none;} body{background:#fff;}}
  @page{size:A4;margin:0;}
  h1{font-size:16pt;font-weight:700;letter-spacing:-.3px;}
  h2{font-size:10pt;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#8a7968;margin-bottom:8px;border-bottom:1px solid #e5ddd2;padding-bottom:4px;}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:2.5px solid #1c1714;}
  .labo-name{font-size:13pt;font-weight:800;color:#1c1714;}
  .labo-info{font-size:8pt;color:#666;line-height:1.6;margin-top:4px;}
  .doc-title{text-align:right;}
  .doc-title h1{color:#c8410a;}
  .doc-num{font-size:9pt;color:#8a7968;margin-top:4px;}
  .doc-date{font-size:9pt;color:#8a7968;}
  .parties{display:flex;gap:24px;margin-bottom:20px;}
  .party-box{flex:1;background:#f6f1ea;border-radius:8px;padding:12px 14px;border:1px solid #e5ddd2;}
  .party-label{font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#8a7968;margin-bottom:6px;}
  .party-name{font-size:10pt;font-weight:700;color:#1c1714;}
  .party-detail{font-size:8.5pt;color:#555;line-height:1.55;margin-top:3px;}
  table{width:100%;border-collapse:collapse;margin-bottom:16px;}
  thead tr{background:#1c1714;color:#fff;}
  thead th{padding:8px 10px;text-align:left;font-size:8.5pt;font-weight:600;letter-spacing:.04em;}
  tbody tr{border-bottom:1px solid #e5ddd2;}
  tbody tr:last-child{border-bottom:none;}
  tbody td{padding:8px 10px;font-size:9pt;}
  tbody tr:nth-child(even){background:#faf7f4;}
  .total-row td{font-weight:700;font-size:10pt;border-top:2px solid #1c1714;padding-top:10px;}
  .amount{text-align:right;color:#c8410a;font-size:11pt;font-weight:800;}
  .divider{border:none;border-top:1.5px solid #e5ddd2;margin:22px 0;}
  .ce-section{background:#f0f5ff;border:1.5px solid #3a5fa0;border-radius:8px;padding:14px 16px;margin-top:20px;}
  .ce-title{font-size:10pt;font-weight:700;color:#1a3a7a;margin-bottom:8px;display:flex;align-items:center;gap:6px;}
  .ce-mark{font-size:14pt;font-weight:900;color:#1a3a7a;border:2.5px solid #1a3a7a;border-radius:3px;padding:0 4px;line-height:1.2;display:inline-block;}
  .ce-body{font-size:8.5pt;color:#333;line-height:1.65;}
  .ce-body strong{color:#1c1714;}
  .ce-table{width:100%;margin-top:10px;border-collapse:collapse;}
  .ce-table td{font-size:8.5pt;padding:4px 8px;border:1px solid #c5d3f0;background:#fff;}
  .ce-table td:first-child{font-weight:600;background:#e8eef9;width:42%;color:#1a3a7a;}
  .signature-area{display:flex;justify-content:space-between;margin-top:24px;gap:16px;}
  .sig-box{flex:1;border-top:1.5px solid #1c1714;padding-top:10px;}
  .sig-label{font-size:8pt;color:#8a7968;font-weight:600;text-transform:uppercase;letter-spacing:.06em;}
  .sig-detail{font-size:8pt;color:#555;margin-top:4px;line-height:1.5;}
  .footer{margin-top:28px;padding-top:10px;border-top:1px solid #e5ddd2;font-size:7.5pt;color:#aaa;text-align:center;line-height:1.5;}
  .print-btn{position:fixed;bottom:24px;right:24px;background:#c8410a;color:#fff;border:none;border-radius:10px;padding:12px 20px;font-size:10pt;font-weight:700;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.25);}
</style>
</head>
<body>
<button class="print-btn no-print" onclick="window.print()">🖨️ Imprimer</button>
<div class="page">

  <!-- EN-TÊTE -->
  <div class="header">
    <div>
      <div class="labo-name">${escH(labo.raisonSociale)}</div>
      <div class="labo-info">
        ${labo.siret?'SIRET : '+escH(labo.siret)+'<br/>':''}
        ${labo.adresse?escH(labo.adresse)+'<br/>':''}
        ${labo.tel?'Tél : '+escH(labo.tel)+'   ':''}${labo.email?escH(labo.email):''}
      </div>
    </div>
    <div class="doc-title">
      <h1>Bon de Livraison</h1>
      <div class="doc-num">${escH(bl.num)}</div>
      <div class="doc-date">Émis le ${dateFormatted}</div>
    </div>
  </div>

  <!-- PARTIES -->
  <div class="parties">
    <div class="party-box">
      <div class="party-label">Laboratoire — Expéditeur</div>
      <div class="party-name">${escH(labo.raisonSociale)}</div>
      <div class="party-detail">
        ${labo.siret?'SIRET : '+escH(labo.siret)+'<br/>':''}
        ${labo.adresse?escH(labo.adresse)+'<br/>':''}
        ${labo.directeur?'Resp. : '+escH(labo.directeur):''}
      </div>
    </div>
    <div class="party-box">
      <div class="party-label">Cabinet dentaire — Destinataire</div>
      <div class="party-name">${escH(cab.name||bl.cabName||'—')}</div>
      <div class="party-detail">
        ${cab.phone?'Tél : '+escH(cab.phone)+'<br/>':''}
        ${cab.email?escH(cab.email):''}
      </div>
    </div>
  </div>

  <!-- TABLEAU DES TRAVAUX -->
  <h2>Détail des travaux</h2>
  <table>
    <thead><tr>
      <th>Code patient</th><th>Description</th><th>Matériaux</th><th style="text-align:center;">Qté</th><th style="text-align:right;">Prix u.</th><th style="text-align:right;">Montant</th>
    </tr></thead>
    <tbody>
      ${(bl.lignes&&bl.lignes.length>1?bl.lignes:null)?bl.lignes.map(function(l,i){return '<tr>'+(i===0?'<td rowspan="'+bl.lignes.length+'" style="vertical-align:top;">'+escH(patient)+(bl.prothesisId?'<br/><span style="font-size:7.5pt;color:#8a7968;">Réf. : '+escH(bl.prothesisId)+'</span>':'')+(bl.deliveryDate?'<br/><span style="font-size:7.5pt;color:#2a6049;">Livraison : '+new Date(bl.deliveryDate+'T12:00:00').toLocaleDateString('fr-FR')+'</span>':'')+'</td>':'')+'<td>'+escH(l.typeLabel)+'</td>'+(i===0?'<td rowspan="'+bl.lignes.length+'">'+escH(materiaux)+'</td>':'')+'<td style="text-align:center;">'+l.nb+'</td><td style="text-align:right;">'+(l.prix!=null?l.prix.toFixed(2).replace('.',',')+'\u00a0€':'—')+'</td><td class="amount">'+(l.total!=null?l.total.toFixed(2).replace('.',',')+'\u00a0€':'—')+'</td></tr>';}).join(''):`<tr>
        <td>${escH(patient)}${bl.prothesisId?'<br/><span style="font-size:7.5pt;color:#8a7968;">Réf. : '+escH(bl.prothesisId)+'</span>':''}${bl.deliveryDate?'<br/><span style="font-size:7.5pt;color:#2a6049;">Livraison : '+new Date(bl.deliveryDate+'T12:00:00').toLocaleDateString('fr-FR')+'</span>':''}</td>
        <td>${escH(typeLabel)}</td>
        <td>${escH(materiaux)}</td>
        <td style="text-align:center;">${nb}</td>
        <td style="text-align:right;">${bl.prix!=null?bl.prix.toFixed(2).replace('.',',')+'\u00a0€':'—'}</td>
        <td class="amount">${bl.total!=null?bl.total.toFixed(2).replace('.',',')+'\u00a0€':'—'}</td>
      </tr>`}
    </tbody>
    ${bl.total!=null?`<tfoot><tr class="total-row"><td colspan="4"></td><td style="text-align:right;font-size:9pt;color:#666;">Total</td><td class="amount">${bl.total.toFixed(2).replace('.',',')}\u00a0€</td></tr></tfoot>`:''}
  </table>

  ${bl.note?'<div style="background:#fff8f5;border:1px solid #f0cfc0;border-radius:7px;padding:10px 12px;font-size:8.5pt;color:#555;margin-bottom:16px;"><strong>Note :</strong> '+escH(bl.note)+'</div>':''}

  <hr class="divider"/>

  <!-- CERTIFICAT DE CONFORMITÉ CE -->
  <div class="ce-section">
    <div class="ce-title">
      <span class="ce-mark">CE</span>
      Déclaration de Conformité — Dispositif Médical sur Mesure
    </div>
    <div class="ce-body">
      Conformément au <strong>Règlement (UE) 2017/745 du Parlement européen et du Conseil</strong> relatif
      aux dispositifs médicaux (MDR), et notamment à son <strong>Annexe XIII</strong> relative aux
      dispositifs médicaux sur mesure, le laboratoire soussigné déclare que le dispositif médical sur
      mesure livré a été fabriqué conformément à la prescription médicale du praticien et aux bonnes
      pratiques de fabrication en vigueur.
    </div>
    <table class="ce-table" style="margin-top:12px;">
      <tr><td>Fabricant</td><td>${escH(labo.raisonSociale)}${labo.siret?' — SIRET : '+escH(labo.siret):''}</td></tr>
      <tr><td>Adresse du fabricant</td><td>${labo.adresse?escH(labo.adresse):'—'}</td></tr>
      ${labo.ceNum?'<tr><td>N° de fabricant CE</td><td>'+escH(labo.ceNum)+'</td></tr>':''}
      <tr><td>Responsable technique</td><td>${labo.directeur?escH(labo.directeur):'—'}</td></tr>
      <tr><td>Destinataire</td><td>${escH(cab.name||bl.cabName||'—')}</td></tr>
      <tr><td>Code patient</td><td>${escH(patient)}</td></tr>
      <tr><td>Description du dispositif</td><td>${escH(typeLabel)}</td></tr>
      <tr><td>Matériaux utilisés</td><td>${escH(materiaux)}</td></tr>
      ${bl.lot?'<tr><td>N° de lot (traçabilité)</td><td><strong>'+escH(bl.lot)+'</strong></td></tr>':''}
      <tr><td>Référence du dispositif</td><td>${escH(ref)}</td></tr>
      <tr><td>Date de fabrication</td><td>${blDateShort}</td></tr>
      <tr><td>Référence bon de livraison</td><td>${escH(bl.num)}</td></tr>
    </table>
    <div class="ce-body" style="margin-top:12px;font-size:8pt;color:#555;">
      Ce dispositif médical sur mesure est destiné exclusivement au code patient mentionné ci-dessus sur
      prescription du praticien, et n'est pas destiné à la vente au public. Il a été conçu et réalisé
      selon les spécifications individuelles du prescripteur, conformément aux normes EN ISO 13485.
    </div>
  </div>

  <!-- SIGNATURES -->
  <div class="signature-area">
    <div class="sig-box">
      <div class="sig-label">Laboratoire — Signature & Cachet</div>
      <div class="sig-detail">${escH(labo.raisonSociale)}<br/>${labo.directeur?escH(labo.directeur):''}</div>
    </div>
    <div class="sig-box">
      <div class="sig-label">Cabinet — Signature à la réception</div>
      <div class="sig-detail">${escH(cab.name||bl.cabName||'')}<br/>Date de réception : _______________</div>
    </div>
  </div>

  <!-- PIED DE PAGE -->
  <div class="footer">
    ${escH(labo.raisonSociale)} — ${labo.siret?'SIRET : '+escH(labo.siret)+' — ':''}${labo.adresse?escH(labo.adresse)+' — ':''}Dispositif médical sur mesure — EU MDR 2017/745
  </div>

</div>
</body></html>`;

  function escH(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function fmtCur(v){return (parseFloat(v)||0).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+' €';}

  const w=window.open('','_blank','width=900,height=900');
  if(!w){showToast(t('toast.popup_blocked'),'#c0392b');return;}
  w.document.write(html);
  w.document.close();
}

function showPortalShareModal(cabId){
  const cab=cabinets.find(function(c){return c.id===cabId;});if(!cab)return;
  if(!cab.portalId){cab.portalId='CAB-'+Math.random().toString(36).substr(2,8).toUpperCase();}
  if(!cab.code){cab.code=Math.random().toString(36).substr(2,6).toUpperCase();}
  if(!cab.pwd){cab.pwd=Math.random().toString(36).substr(2,8);}
  saveCabinets();
  // Publish portal data first
  publishPortal(cab);
  const portalUrl='https://labosync.app/cabinet.html?id='+cab.portalId;
  const shareText=ti('portal.share_text',{url:portalUrl,code:cab.code,pwd:cab.pwd});

  const existing=document.getElementById('portal-share-modal');if(existing)existing.remove();
  const modal=document.createElement('div');
  modal.id='portal-share-modal';
  modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:6000;display:flex;align-items:center;justify-content:center;padding:16px;';
  modal.innerHTML=
    '<div style="background:var(--surface);border-radius:16px;padding:28px;width:460px;max-width:95vw;box-shadow:0 8px 32px rgba(0,0,0,.25);">'+
      '<div style="font-family:\'Inter\',sans-serif;font-weight:700;font-size:1.15rem;margin-bottom:4px;">'+t('portal.title')+'</div>'+
      '<div style="font-size:.76rem;color:var(--ink-soft);margin-bottom:20px;">'+ti('portal.share_with',{name:cab.name})+'</div>'+
      '<div style="background:#f0f6ff;border:1.5px solid #3a5fa0;border-radius:10px;padding:14px 16px;margin-bottom:16px;">'+
        '<div style="font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#1a3a7a;margin-bottom:10px;">'+t('portal.login_title')+'</div>'+
        '<div style="font-size:.82rem;color:#1c1714;line-height:2;">'+
          '<div>🌐 <strong>'+t('portal.url')+' :</strong> <a href="'+portalUrl+'" target="_blank" style="color:#1a3a7a;">labosync.app/cabinet.html</a></div>'+
          '<div>🔑 <strong>'+t('portal.code')+' :</strong> <span style="font-family:monospace;background:#e8eef9;padding:2px 8px;border-radius:5px;font-size:.88rem;">'+cab.code+'</span></div>'+
          '<div>🔒 <strong>'+t('portal.password')+' :</strong> <span style="font-family:monospace;background:#e8eef9;padding:2px 8px;border-radius:5px;font-size:.88rem;">'+cab.pwd+'</span></div>'+
        '</div>'+
      '</div>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap;">'+
        '<button id="portal-copy-btn" class="btn btn-a" style="flex:1;">'+t('portal.copy')+'</button>'+
        '<button id="portal-open-btn" class="btn" style="background:#1a4a7a;color:#fff;flex:1;">'+t('portal.open')+'</button>'+
        '<button onclick="document.getElementById(\'portal-share-modal\').remove();" class="btn btn-g" style="flex:1;">'+t('btn.close')+'</button>'+
      '</div>'+
    '</div>';
  document.body.appendChild(modal);
  document.getElementById('portal-copy-btn').addEventListener('click',function(){
    if(navigator.clipboard){
      navigator.clipboard.writeText(shareText).then(function(){showToast(t('toast.ids_copied'),'#2a6049');});
    }else{
      const ta=document.createElement('textarea');ta.value=shareText;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();
      showToast(t('toast.ids_copied'),'#2a6049');
    }
  });
  document.getElementById('portal-open-btn').addEventListener('click',function(){
    window.open(portalUrl,'_blank');
  });
  modal.addEventListener('click',function(e){if(e.target===modal)modal.remove();});
}

function getCabPortalLink(cabId){
  const cab=cabinets.find(function(c){return c.id===cabId;});
  if(!cab||!cab.portalId)return null;
  return SITE_URL+'/cabinet.html?id='+cab.portalId;
}

function showCabPortalInfo(cabId){
  const cab=cabinets.find(function(c){return c.id===cabId;});if(!cab)return;
  // Ensure credentials exist
  if(!cab.code){cab.code=Math.random().toString(36).substr(2,6).toUpperCase();}
  if(!cab.pwd){cab.pwd=Math.random().toString(36).substr(2,8);}
  if(!cab.portalId){cab.portalId='CAB-'+Math.random().toString(36).substr(2,8).toUpperCase();}
  saveCabinets();
  const link=SITE_URL+'/cabinet.html';
  const info=ti('portal.info',{name:cab.name,url:link,code:cab.code,pwd:cab.pwd});
  const copyText=ti('portal.copy_text',{code:cab.code,pwd:cab.pwd,url:link});
  if(navigator.clipboard){
    navigator.clipboard.writeText(copyText).then(function(){alert(info+'\n\n'+t('toast.ids_copied'));});
  } else {alert(info);}
}

function genFactureMensuelle(cabId){ showFactureModal(cabId); }

/* ── État interne de la modale facturation ── */
var _fmLines = []; // [{id, blId, label, patient, qty, prix, locked}]
var _fmCabId = null;
var _fmBdlIds = []; // blIds cochés initialement

function showFactureModal(cabId){
  const cab=cabinets.find(function(c){return c.id===cabId;});if(!cab)return;
  const nonInvoiced=bdl.filter(function(b){return b.cabinet===cabId&&!b.invoiced;});
  if(!nonInvoiced.length){showToast(t('alert.no_unpaid_bl'),'#c0392b');return;}

  _fmCabId=cabId;
  _fmBdlIds=nonInvoiced.map(function(b){return b.id;});
  // Construire les lignes initiales depuis les BLs
  _fmLines=nonInvoiced.map(function(b){
    return {
      id:'fl_'+b.id,
      blId:b.id,
      label:b.typeLabel+(b.nb>1?' × '+b.nb:''),
      patient:b.patient||'',
      qty:b.nb||1,
      prix:b.total||(b.prix*(b.nb||1))||0,
      checked:true
    };
  });

  const existing=document.getElementById('facture-modal');if(existing)existing.remove();
  const modal=document.createElement('div');
  modal.id='facture-modal';
  modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:6000;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto;';
  modal.innerHTML=
    '<div style="background:var(--surface);border-radius:16px;padding:28px;width:640px;max-width:95vw;max-height:90vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,.25);">'+
      '<div style="font-family:\'Inter\',sans-serif;font-weight:700;font-size:1.15rem;margin-bottom:2px;">🧾 Créer une facture</div>'+
      '<div style="font-size:.76rem;color:var(--ink-soft);margin-bottom:18px;">'+escHtml(cab.name)+' — modifiez les lignes avant de valider</div>'+
      '<div id="fm-lines-wrap"></div>'+
      '<button id="fm-add-line" style="width:100%;margin-top:6px;border:1.5px dashed var(--border);border-radius:8px;padding:8px;background:none;cursor:pointer;font-size:.8rem;color:var(--ink-soft);">+ Ajouter une ligne</button>'+
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding-top:12px;border-top:1.5px solid var(--border);">'+
        '<div style="font-size:.78rem;color:var(--ink-soft);">Total</div>'+
        '<div id="fm-total" style="font-family:serif;font-size:1.4rem;font-weight:700;color:var(--accent);"></div>'+
      '</div>'+
      '<div class="fl" style="margin-top:14px;">'+
        '<label style="font-size:.72rem;color:var(--ink-soft);">Note / Libellé de facture (facultatif)</label>'+
        '<input type="text" id="fm-note" placeholder="ex: Facture avril 2026" style="width:100%;border:1.5px solid var(--border);border-radius:7px;background:var(--bg);font-family:monospace;font-size:.84rem;padding:8px 10px;color:var(--ink);outline:none;box-sizing:border-box;"/>'+
      '</div>'+
      '<div style="display:flex;gap:8px;margin-top:18px;">'+
        '<button id="fm-ok" style="flex:1;background:#5a3472;color:#fff;border:none;border-radius:8px;padding:12px;font-family:monospace;font-size:.84rem;font-weight:600;cursor:pointer;">🧾 Générer la facture</button>'+
        '<button onclick="document.getElementById(\'facture-modal\').remove();" style="background:none;border:1px solid var(--border);border-radius:8px;padding:12px 16px;font-family:monospace;font-size:.82rem;cursor:pointer;color:var(--ink-soft);">Annuler</button>'+
      '</div>'+
    '</div>';
  document.body.appendChild(modal);

  fmRenderLines();
  document.getElementById('fm-add-line').addEventListener('click',function(){
    _fmLines.push({id:'fl_'+Date.now(),blId:null,label:'',patient:'',qty:1,prix:0,checked:true});
    fmRenderLines();
  });
  document.getElementById('fm-ok').addEventListener('click',fmGenerate);
  modal.addEventListener('click',function(e){if(e.target===modal)modal.remove();});
}

function fmRenderLines(){
  const wrap=document.getElementById('fm-lines-wrap');if(!wrap)return;
  wrap.innerHTML=_fmLines.map(function(line,i){
    const checked=line.checked!==false;
    const blNum=line.blId?(bdl.find(function(b){return b.id===line.blId;})||{}).num||'':'';
    return '<div class="fm-line" data-idx="'+i+'" style="display:grid;grid-template-columns:20px 1fr auto auto 28px;gap:6px;align-items:center;padding:7px 8px;border-radius:8px;border:1px solid var(--border);background:var(--bg);margin-bottom:5px;opacity:'+(checked?'1':'0.45')+';">'+
      '<input type="checkbox" '+(checked?'checked':'')+' onchange="fmToggle('+i+')" style="accent-color:var(--accent);cursor:pointer;"/>'+
      '<div>'+
        '<input type="text" value="'+escHtml(line.label)+'" oninput="fmEdit('+i+',\'label\',this.value)" placeholder="Description" style="width:100%;border:none;border-bottom:1px solid var(--border);background:transparent;font-size:.82rem;font-family:inherit;color:var(--ink);outline:none;padding:2px 0;"/>'+
        (line.patient?'<div style="font-size:.65rem;color:var(--ink-soft);margin-top:2px;">'+escHtml(line.patient)+(blNum?' · '+blNum:'')+'</div>':'')+'</div>'+
      '<div style="display:flex;align-items:center;gap:3px;">'+
        '<span style="font-size:.7rem;color:var(--ink-soft);">Qté</span>'+
        '<input type="number" value="'+line.qty+'" min="1" oninput="fmEdit('+i+',\'qty\',this.value)" style="width:42px;border:1px solid var(--border);border-radius:5px;padding:4px 5px;font-size:.8rem;text-align:center;background:var(--surface);color:var(--ink);outline:none;"/>'+
      '</div>'+
      '<div style="display:flex;align-items:center;gap:3px;">'+
        '<input type="number" value="'+line.prix+'" min="0" step="0.01" oninput="fmEdit('+i+',\'prix\',this.value)" style="width:80px;border:1px solid var(--border);border-radius:5px;padding:4px 7px;font-size:.84rem;font-weight:600;color:var(--accent);text-align:right;background:var(--surface);outline:none;"/>'+
        '<span style="font-size:.7rem;color:var(--ink-soft);">€</span>'+
      '</div>'+
      '<button onclick="fmRemoveLine('+i+')" style="border:none;background:none;color:#c0392b;cursor:pointer;font-size:.9rem;padding:2px;" title="Supprimer">✕</button>'+
    '</div>';
  }).join('');
  fmUpdateTotal();
}

function fmToggle(i){
  _fmLines[i].checked=!_fmLines[i].checked;
  fmRenderLines();
}

function fmEdit(i,field,val){
  if(field==='qty')_fmLines[i].qty=parseFloat(val)||1;
  else if(field==='prix')_fmLines[i].prix=parseFloat(val)||0;
  else _fmLines[i][field]=val;
  fmUpdateTotal();
}

function fmRemoveLine(i){
  _fmLines.splice(i,1);
  fmRenderLines();
}

function fmUpdateTotal(){
  const total=_fmLines.filter(function(l){return l.checked!==false;}).reduce(function(s,l){return s+(l.prix||0);},0);
  const el=document.getElementById('fm-total');if(el)el.textContent=fmtEur(total);
}

async function fmGenerate(){
  const cab=cabinets.find(function(c){return c.id===_fmCabId;});if(!cab)return;
  const activeLines=_fmLines.filter(function(l){return l.checked!==false&&(l.label||l.prix);});
  if(!activeLines.length){showToast(t('alert.add_bl_line'),'#c0392b');return;}
  const total=activeLines.reduce(function(s,l){return s+(l.prix||0);},0);
  const note=document.getElementById('fm-note').value.trim();
  const now=new Date();
  const docs=JSON.parse(localStorage.getItem('lb_docs')||'[]');
  const year=now.getFullYear();
  const n=docs.filter(function(d){return d.type==='facture'&&d.num&&d.num.includes(String(year));}).length+1;
  // Déterminer les BLs cochés
  const checkedBlIds=activeLines.filter(function(l){return l.blId;}).map(function(l){return l.blId;});
  const checkedBls=bdl.filter(function(b){return checkedBlIds.includes(b.id);});
  const invoice={
    id:String(Date.now()),
    num:'FAC-'+year+'-'+String(n).padStart(3,'0'),
    type:'facture',
    cabinet:_fmCabId,
    cabName:cab.name,
    date:fmtISO(now),
    note:note||'Facture — '+now.toLocaleDateString('fr-FR',{month:'long',year:'numeric'}),
    lines:activeLines.map(function(l){
      return {label:l.label,qty:l.qty||1,prix:l.prix||0,blNum:l.blId?(bdl.find(function(b){return b.id===l.blId;})||{}).num||'':''};
    }),
    total,
    bdlRefs:checkedBls.map(function(b){return b.num;}),
    status:'brouillon',
    createdAt:now.toISOString()
  };
  // Marquer les BLs cochés comme facturés
  checkedBls.forEach(function(b){b.invoiced=true;b.invoiceNum=invoice.num;});
  saveBdl();
  docs.unshift(invoice);
  localStorage.setItem('lb_docs',JSON.stringify(docs));
  documents=docs;
  scheduleSave();
  document.getElementById('facture-modal').remove();
  showToast('✅ Facture '+invoice.num+' créée — '+checkedBls.length+' bon(s)','#5a3472');
  document.querySelectorAll('.mode-btn').forEach(x=>x.classList.toggle('on',x.dataset.mode==='fact'));
  document.querySelectorAll('.pane').forEach(function(p){p.classList.remove('on');});
  document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('on');});
  document.getElementById('pane-facturation').classList.add('on');
  document.querySelector('#tabs-fact .tab[data-pane="facturation"]').classList.add('on');
  renderToInvoice();renderBillDocs();updateBillStats();
  // Sync portail en arrière-plan (ne bloque plus l'interface)
  publishPortal(cab).catch(function(e){console.warn('Portal sync failed:',e);});
}

function escHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function escH(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}


/* ══════════════════════════════════════════
   §31 — LIVRAISONS
   ══════════════════════════════════════════ */
function isJobComplete(job){
  if(!job.tasks||!job.tasks.length)return false;
  return job.tasks.every(function(t){return !!t.done;});
}

function renderLivraisons(){
  const search=(document.getElementById('livr-search')?.value||'').toLowerCase().trim();
  const matchJob=function(j){
    if(!search)return true;
    return (j.patient||'').toLowerCase().includes(search)||getJobTypeLabel(j).toLowerCase().includes(search)||(j.prothesisId||'').toLowerCase().includes(search)||(j.note||'').toLowerCase().includes(search);
  };
  const matchBL=function(b){
    if(!search)return true;
    return (b.patient||'').toLowerCase().includes(search)||(b.typeLabel||'').toLowerCase().includes(search)||(b.num||'').toLowerCase().includes(search)||(b.prothesisId||'').toLowerCase().includes(search);
  };

  // Jobs sans BL (programmés ou non)
  const jobsNoBL=jobs.filter(function(j){
    return !bdl.find(function(b){return b.jobId===j.id;})&&matchJob(j);
  });
  // Items en file d'attente non programmés (pas encore dans jobs)
  const queueNoBL=queue.filter(function(q){
    return !bdl.find(function(b){return b.jobId===q.id;})&&matchJob(q);
  }).map(function(q){return Object.assign({},q,{tasks:[],_fromQueue:true});});
  const noBL=[...jobsNoBL,...queueNoBL].sort(function(a,b){
    var da=_jobLabDeliveryDate(a)||(a.createdAt?String(a.createdAt).slice(0,10):'');
    var db=_jobLabDeliveryDate(b)||(b.createdAt?String(b.createdAt).slice(0,10):'');
    if(da!==db)return da.localeCompare(db);
    return (a.patient||'').localeCompare(b.patient||'');
  });
  // Jobs with BL already
  const withBL=bdl.map(function(b){
    return {bl:b,job:jobs.find(function(j){return j.id===b.jobId;})};
  }).filter(function(x){return !!x.job&&matchBL(x.bl);});

  const todoCnt=document.getElementById('livr-todo-cnt');
  const doneCnt=document.getElementById('livr-done-cnt');
  if(todoCnt)todoCnt.textContent=noBL.length;
  if(doneCnt)doneCnt.textContent=withBL.length;

  // Render jobs without BL
  const todoEl=document.getElementById('livr-todo-list');
  if(todoEl){
    if(!noBL.length){
      todoEl.innerHTML='<div style="padding:14px;font-size:.78rem;color:var(--ink-soft);font-style:italic;background:var(--surface);border:1px dashed var(--border);border-radius:9px;">'+t('empty.bdl_pending')+'</div>';
    } else {
      todoEl.innerHTML='';
      noBL.forEach(function(job){
        const cab=job.cabinet?cabinets.find(function(c){return c.id===job.cabinet;}):null;
        const pct=job.tasks.length?Math.round(job.tasks.filter(function(t){return t.done;}).length/job.tasks.length*100):0;
        const complete=pct===100;
        // Déterminer si la planification est active (tâches avec dates)
        const hasSchedule=job.tasks&&job.tasks.length&&job.tasks.some(function(t){return t.dueDate;});
        const currentStep=getJobAutoStep(job);
        const STEPS_MANUAL=[
          {k:'recu',l:t('suivi.recu')},
          {k:'production',l:t('suivi.production')},
          {k:'finition',l:t('suivi.finition')},
          {k:'pret',l:t('suivi.pret')}
        ];
        const stepBtns='';
        const div=document.createElement('div');
        div.className='livr-item'+(complete?' done-item':'');
        const ini=(job.patient||'?')[0].toUpperCase();
        div.innerHTML=
          '<div class="livr-avatar" style="background:'+(complete?'#2a6049':'var(--accent)')+';">'+ini+'</div>'+
          '<div class="livr-info">'+
            '<div class="livr-patient">'+(job.urgent?'🔴 ':'')+job.patient+'</div>'+
            '<div class="livr-type">'+getJobTypeLabel(job)+(job.nb>1?' × '+job.nb:'')+(job.prothesisId?' · #'+job.prothesisId:'')+'</div>'+
            (_fmtJobDeliveryLine(job)?'<div style="font-size:.68rem;color:#2a6049;margin-top:3px;">'+_fmtJobDeliveryLine(job)+(_isJobLate(job)?' <span style="color:#dc2626;font-weight:700;">· retard</span>':'')+'</div>':'')+
            (hasSchedule?'<div style="display:flex;align-items:center;gap:6px;margin-top:4px;">'+
              '<div style="flex:1;background:var(--border);border-radius:99px;height:6px;overflow:hidden;max-width:120px;"><div style="height:100%;background:'+(complete?'#2a6049':'var(--accent)')+';border-radius:99px;width:'+pct+'%;"></div></div>'+
              '<span style="font-size:.68rem;color:var(--ink-soft);">'+pct+'%</span>'+
            '</div>':'')+
            (stepBtns?'<div style="display:flex;gap:4px;margin-top:6px;flex-wrap:wrap;">'+stepBtns+'</div>':'')+
            (job._fromQueue?'<div style="font-size:.68rem;color:#8b4513;margin-top:3px;background:#fff3e0;border-radius:4px;padding:1px 6px;display:inline-block;">⏳ '+t('misc.pending_prog')+'</div>':'')+
            (cab?'<div style="font-size:.7rem;color:#1a4a7a;margin-top:3px;">🏥 '+cab.name+'</div>':'<div style="font-size:.7rem;color:var(--ink-soft);margin-top:3px;">'+t('misc.no_cab')+'</div>')+
          '</div>'+
          '<div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;">'+
            '<button data-genbl="'+job.id+'" style="background:#5a3472;color:#fff;border:none;border-radius:8px;padding:8px 14px;font-family:monospace;font-size:.76rem;font-weight:500;cursor:pointer;white-space:nowrap;">📋 Bon livraison</button>'+
          '</div>';
        todoEl.appendChild(div);
      });
    }
  }

  // Render DONE list (BLs already generated)
  const filterCab=document.getElementById('livr-filter-cab')?.value||'';
  const doneEl=document.getElementById('livr-done-list');
  if(doneEl){
    const filtered=filterCab?withBL.filter(function(x){return x.bl.cabinet===filterCab;}):withBL;
    if(!filtered.length){
      doneEl.innerHTML='<div style="padding:14px;font-size:.78rem;color:var(--ink-soft);font-style:italic;">'+t('empty.bdl')+'</div>';
    } else {
      doneEl.innerHTML='';
      filtered.forEach(function(x){
        const bl=x.bl;const job=x.job;
        const div=document.createElement('div');
        div.className='livr-item done-item';
        div.innerHTML=
          '<div class="livr-avatar" style="background:#5a3472;">'+(bl.num||'BL').slice(-2)+'</div>'+
          '<div class="livr-info">'+
            '<div style="display:flex;align-items:center;gap:7px;margin-bottom:3px;">'+
              '<span class="livr-bl">'+bl.num+'</span>'+
              (bl.invoiced?'<span style="font-size:.65rem;background:#e0ede8;color:#2a6049;padding:1px 7px;border-radius:99px;font-weight:600;">Facturé — '+bl.invoiceNum+'</span>':'<span style="font-size:.65rem;background:#dde8f2;color:#1a4a7a;padding:1px 7px;border-radius:99px;">En attente de facturation</span>')+
            '</div>'+
            '<div class="livr-patient">'+job.patient+'</div>'+
            '<div class="livr-type">'+bl.typeLabel+(bl.nb>1?' × '+bl.nb:'')+'</div>'+
            '<div style="font-size:.7rem;color:var(--ink-soft);">🏥 '+bl.cabName+' · '+new Date(bl.date+'T12:00:00').toLocaleDateString('fr-FR')+'</div>'+
          '</div>'+
          '<div style="text-align:right;flex-shrink:0;display:flex;flex-direction:column;align-items:flex-end;gap:6px;">'+
            '<div style="font-family:serif;font-size:1.1rem;color:var(--accent);font-weight:700;">'+fmtEur(bl.total)+'</div>'+
            '<button data-printbl="'+bl.id+'" style="background:#1a4a7a;color:#fff;border:none;border-radius:7px;padding:6px 12px;font-family:monospace;font-size:.71rem;cursor:pointer;white-space:nowrap;">🖨️ Imprimer BL+CE</button>'+
            '<button data-portalbl="'+bl.cabinet+'" style="background:#2a6049;color:#fff;border:none;border-radius:7px;padding:6px 12px;font-family:monospace;font-size:.71rem;cursor:pointer;white-space:nowrap;">🔗 Portail cabinet</button>'+
            '<button data-resyncbl="'+bl.cabinet+'" style="background:none;border:1px solid var(--border);color:var(--ink-soft);border-radius:7px;padding:6px 12px;font-family:monospace;font-size:.71rem;cursor:pointer;white-space:nowrap;" title="Renvoyer ce bon au portail dentiste">🔄 Renvoyer</button>'+
          '</div>';
        doneEl.appendChild(div);
      });
    }
  }
}

function syncLivrFilterCab(){
  const sel=document.getElementById('livr-filter-cab');if(!sel)return;
  const cur=sel.value;
  sel.innerHTML='<option value="">'+t('opt.all_clinics')+'</option>'+
    cabinets.map(function(c){return '<option value="'+c.id+'"'+(c.id===cur?' selected':'')+'>'+c.name+'</option>';}).join('');
}

// Click on genbl button
document.getElementById('livr-todo-list').addEventListener('click',function(e){
  const btn=e.target.closest('[data-genbl]');
  if(btn)genBonLivraison(btn.dataset.genbl);
});
// Click on print BL button
document.getElementById('livr-done-list').addEventListener('click',function(e){
  const btn=e.target.closest('[data-printbl]');
  if(btn)printBL(btn.dataset.printbl);
  const pbtn=e.target.closest('[data-portalbl]');
  if(pbtn)showPortalShareModal(pbtn.dataset.portalbl);
  const rbtn=e.target.closest('[data-resyncbl]');
  if(rbtn){
    const cab=cabinets.find(function(c){return c.id===rbtn.dataset.resyncbl;});
    if(!cab){showToast(t('toast.cab_not_found'),'#c0392b');return;}
    rbtn.textContent=t('btn.sending');rbtn.disabled=true;
    publishPortal(cab).then(function(){
      showToast(ti('toast.portal_updated',{name:cab.name}),'#2a6049');
      rbtn.textContent=t('btn.sent');
      setTimeout(function(){rbtn.textContent='🔄 Renvoyer';rbtn.disabled=false;},2000);
    }).catch(function(err){
      showToast(ti('toast.network_error',{msg:String(err).slice(0,60)}),'#c0392b',6000);
      rbtn.textContent=t('btn.resend');rbtn.disabled=false;
    });
  }
});
document.getElementById('livr-filter-cab').addEventListener('change',renderLivraisons);

/* ══════════════════════════════════════════
   §32 — INIT
   ══════════════════════════════════════════ */
cleanup();
refreshCabSelects();
document.getElementById('hd-date').textContent=fmtL(new Date());
document.getElementById('pd').value=fmtISO(new Date());
updateWaitingBadge();
updateQueueBadge();renderQueueMain();
const savedName=localStorage.getItem('lb_name');
if(savedName&&savedName.trim())document.querySelector('header h1').innerHTML=savedName+' <span style="color:#e87a4a;font-style:italic;">sync</span>';
refreshTechSelects();
refreshTypeSelects();
applyProgMode();
updateProgToggleUI();
render();
renderDashboard();

// Vérifier les paiements Stripe en attente au démarrage
setTimeout(checkStripePayments, 3000);

// Vérifier aussi si on revient d'un paiement Stripe
(function(){
  const params=new URLSearchParams(window.location.search);
  if(params.get('stripe_ok')==='1'){
    showToast(t('toast.payment_pending'),'#1a4a7a');
    setTimeout(checkStripePayments,1500);
    // Nettoyer l'URL
    history.replaceState({},'',window.location.pathname);
  }
})();

/* ══════════════════════════════════════════
   §33 — AUTH
   ══════════════════════════════════════════ */
// Réinitialisation forcée si ?reset=1 dans l'URL
if(new URLSearchParams(window.location.search).get('reset')==='1'){
  Object.keys(localStorage).forEach(function(k){if(k.startsWith('sb-'))localStorage.removeItem(k);});
  window.location.href=window.location.pathname;
}
const sbClient = supabase.createClient(SB_URL, SB_KEY);
let currentUser = null;
const _clientTraceId = 'tr_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
let _userRole = localStorage.getItem('lb_user_role') || 'admin';
const _ROLE_PERMS = {
  admin: ['*'],
  production: ['pane:dashboard','pane:saisie','pane:calendrier','pane:livraisons','pane:historique','pane:stats','pane:attente','pane:impression','pane:messages'],
  billing: ['pane:dashboard','pane:cabinets','pane:livraisons','pane:facturation','pane:historique','pane:stats','pane:messages','action:billing_generate','action:billing_credit'],
  support: ['pane:dashboard','pane:cabinets','pane:livraisons','pane:historique','pane:messages'],
};
function hasPerm(key){
  const perms=_ROLE_PERMS[_userRole]||[];
  return perms.includes('*')||perms.includes(key);
}
function canAccessPane(pane){ return hasPerm('pane:'+pane); }
function guardPerm(key, message){
  if(hasPerm(key)) return true;
  showToast(message || '⛔ Accès refusé pour votre rôle.','#c0392b',3600);
  reportAudit({ action:'permission_denied', target:key });
  return false;
}
function reportAudit(payload){
  const body = JSON.stringify(Object.assign({
    app: 'desktop',
    page: window.location.pathname,
    traceId: _clientTraceId,
    userId: currentUser && currentUser.id ? currentUser.id : '',
    role: _userRole,
  }, payload || {}));
  fetch('/.netlify/functions/audit-log',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: body
  }).catch(function(){});
}
function switchToAdminRole(showToastMsg){
  if(_userRole==='admin'){
    if(showToastMsg)showToast('Vous êtes déjà en mode admin.','#2a6049',2200);
    return;
  }
  _userRole='admin';
  localStorage.setItem('lb_user_role','admin');
  applyRoleUi();
  const msg=document.getElementById('role-msg');
  if(msg){msg.textContent='Rôle appliqué : admin';}
  if(showToastMsg)showToast('✅ Mode admin activé.','#2a6049',2500);
  reportAudit({action:'role_changed',target:'admin',source:'quick_switch'});
}
function applyRoleUi(){
  try{
    document.querySelectorAll('.tab[data-pane]').forEach(function(tab){
      const pane=tab.dataset.pane;
      const ok=canAccessPane(pane);
      tab.style.opacity=ok?'1':'.4';
      tab.style.pointerEvents=ok?'auto':'none';
      if(!ok) tab.title='Accès restreint';
      else tab.removeAttribute('title');
    });
    const sel=document.getElementById('user-role-select');
    if(sel)sel.value=_userRole;
    const quick=document.getElementById('btn-quick-admin');
    if(quick)quick.style.display=_userRole==='admin'?'none':'';
  }catch(e){}
}

function reportClientError(payload){
  const body = JSON.stringify(Object.assign({
    app: 'desktop',
    page: window.location.pathname,
    traceId: _clientTraceId,
    userId: currentUser && currentUser.id ? currentUser.id : '',
  }, payload || {}));
  try{
    if(navigator.sendBeacon){
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon('/.netlify/functions/log-client-error', blob);
      return;
    }
  }catch(_){}
  fetch('/.netlify/functions/log-client-error',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: body
  }).catch(function(){});
}
function _debugAuditLog(hypothesisId, message, data){
  // #region agent log
  fetch('http://127.0.0.1:7687/ingest/aea19bce-9029-4481-9962-13d314321f91',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5f23a1'},body:JSON.stringify({sessionId:'5f23a1',runId:'site-audit-baseline',hypothesisId:hypothesisId,location:'app.html',message:message,data:data||{},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
}
// Token d'accès mis en cache — évite d'appeler getSession() à chaque publishPortal
// (les appels concurrents à getSession causent des erreurs de lock Supabase)
let _cachedAccessToken = '';
// Identifiant unique de cet onglet/session — permet d'ignorer ses propres événements Realtime
const _tabId = Math.random().toString(36).slice(2);
// Timestamp du dernier état connu côté serveur — utilisé pour détecter les conflits
let _serverUpdatedAt = null;
// Canal Realtime actif
let _realtimeChannel = null;

function showApp() {
  document.getElementById('auth-loading').style.display = 'none';
  document.getElementById('auth-overlay').style.display = 'none';
  document.getElementById('paywall-overlay').style.display = 'none';
  document.getElementById('app-main').style.display = 'block';
}
function showLogin() {
  document.getElementById('auth-loading').style.display = 'none';
  document.getElementById('auth-overlay').style.display = 'flex';
  document.getElementById('paywall-overlay').style.display = 'none';
  document.getElementById('app-main').style.display = 'none';
}
function showPaywall(reason){
  document.getElementById('auth-loading').style.display = 'none';
  document.getElementById('auth-overlay').style.display = 'none';
  document.getElementById('app-main').style.display = 'none';
  var title=document.getElementById('paywall-title');
  var sub=document.getElementById('paywall-sub');
  if(reason==='past_due'){
    if(title)title.textContent='Paiement en échec';
    if(sub)sub.textContent='Le dernier paiement de votre abonnement a échoué. Mettez à jour votre moyen de paiement pour continuer.';
  } else if(reason==='canceled'){
    if(title)title.textContent='Abonnement annulé';
    if(sub)sub.textContent='Votre abonnement a été résilié. Réactivez-le pour retrouver l\'accès à Labosync.';
  } else {
    if(title)title.textContent='Votre essai gratuit est terminé';
    if(sub)sub.textContent='Souscrivez pour continuer à utiliser Labosync sans interruption.';
  }
  document.getElementById('paywall-overlay').style.display = 'block';
}

function _safeBootToLogin(message){
  try{ showLogin(); }catch(e){}
  if(message){
    try{ showAuthErr(message); }catch(e){}
  }
}

window.addEventListener('error', function(ev){
  _debugAuditLog('H1','Desktop window.error',{msg:ev&&ev.message?String(ev.message):'window.error'});
  reportClientError({
    level: 'error',
    message: ev && ev.message ? ev.message : 'window.error',
    stack: ev && ev.error && ev.error.stack ? ev.error.stack : '',
  });
  try{
    if(document.getElementById('auth-loading') && document.getElementById('auth-loading').style.display!=='none'){
      _safeBootToLogin('Erreur au chargement. Rechargez la page (Ctrl+F5).');
    }
  }catch(_){}
});

window.addEventListener('unhandledrejection', function(ev){
  const reason = ev && ev.reason;
  _debugAuditLog('H1','Desktop unhandledrejection',{msg:reason&&reason.message?String(reason.message):String(reason||'unhandledrejection')});
  reportClientError({
    level: 'error',
    message: reason && reason.message ? reason.message : String(reason || 'unhandledrejection'),
    stack: reason && reason.stack ? reason.stack : '',
  });
  try{
    if(document.getElementById('auth-loading') && document.getElementById('auth-loading').style.display!=='none'){
      _safeBootToLogin('Initialisation interrompue. Vérifiez la connexion puis réessayez.');
    }
  }catch(_){}
});

/* ══════════════════════════════════════════
   ABONNEMENT STRIPE — Paywall & trial
   ══════════════════════════════════════════ */
const TRIAL_DAYS = 14;

async function fetchSubscriptionStatus(){
  if(!currentUser)return null;
  try{
    const r=await fetch(SB_URL+'/rest/v1/labo_data?id=eq.sub_'+currentUser.id+'&select=data',{
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+_cachedAccessToken}
    });
    // #region agent log
    fetch('http://127.0.0.1:7687/ingest/aea19bce-9029-4481-9962-13d314321f91',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5f23a1'},body:JSON.stringify({sessionId:'5f23a1',runId:'trial-reset-diagnosis',hypothesisId:'H19',location:'app.html:fetchSubscriptionStatus',message:'Subscription row fetch response',data:{ok:!!r.ok,status:r.status,hasToken:!!_cachedAccessToken},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    const rows=await r.json();
    // #region agent log
    fetch('http://127.0.0.1:7687/ingest/aea19bce-9029-4481-9962-13d314321f91',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5f23a1'},body:JSON.stringify({sessionId:'5f23a1',runId:'trial-reset-diagnosis',hypothesisId:'H19',location:'app.html:fetchSubscriptionStatus',message:'Subscription row parsed',data:{hasRows:Array.isArray(rows)&&rows.length>0,hasData:!!(rows&&rows[0]&&rows[0].data),status:rows&&rows[0]&&rows[0].data&&rows[0].data.status?String(rows[0].data.status):''},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return rows[0]&&rows[0].data?rows[0].data:null;
  }catch(e){console.warn('fetchSubscriptionStatus',e);return null;}
}

async function ensureSubscriptionRow(){
  if(!currentUser)return null;
  const existing=await fetchSubscriptionStatus();
  if(existing){
    // #region agent log
    fetch('http://127.0.0.1:7687/ingest/aea19bce-9029-4481-9962-13d314321f91',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5f23a1'},body:JSON.stringify({sessionId:'5f23a1',runId:'trial-reset-diagnosis',hypothesisId:'H20',location:'app.html:ensureSubscriptionRow',message:'Existing subscription row reused',data:{status:existing.status?String(existing.status):'',hasTrialEnd:!!(existing.trialEndsAt||existing.trialEnd)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return existing;
  }
  // Premier accès → créer la ligne avec début d'essai
  const now=new Date();
  const trialEnd=new Date(now.getTime()+TRIAL_DAYS*86400000);
  const data={
    userId:currentUser.id,
    email:currentUser.email||'',
    laboName:localStorage.getItem('lb_name')||'',
    status:'trialing',
    trialStartedAt:now.toISOString(),
    trialEndsAt:trialEnd.toISOString(),
    createdAt:now.toISOString()
  };
  try{
    const wr=await fetch(SB_URL+'/rest/v1/labo_data',{
      method:'POST',
      headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+_cachedAccessToken,'Prefer':'resolution=merge-duplicates,return=minimal'},
      body:JSON.stringify({id:'sub_'+currentUser.id,data:data,updated_at:now.toISOString()})
    });
    // #region agent log
    fetch('http://127.0.0.1:7687/ingest/aea19bce-9029-4481-9962-13d314321f91',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5f23a1'},body:JSON.stringify({sessionId:'5f23a1',runId:'trial-reset-diagnosis',hypothesisId:'H20',location:'app.html:ensureSubscriptionRow',message:'Created fallback trial row',data:{ok:!!wr.ok,status:wr.status,trialEndsAt:data.trialEndsAt},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }catch(e){console.warn('ensureSubscriptionRow',e);}
  return data;
}

function getTrialEnd(sub){
  if(!sub)return null;
  return sub.trialEndsAt||sub.trialEnd||sub.currentPeriodEnd||null;
}
function hasAccess(sub){
  if(!sub)return false;
  // #region agent log
  fetch('http://127.0.0.1:7687/ingest/aea19bce-9029-4481-9962-13d314321f91',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5f23a1'},body:JSON.stringify({sessionId:'5f23a1',runId:'trial-paywall-enforcement',hypothesisId:'H21',location:'app.html:hasAccess',message:'Evaluate access decision',data:{status:sub.status?String(sub.status):'',trialEndsAt:sub.trialEndsAt||sub.trialEnd||'',hasStripeSubscriptionId:!!sub.stripeSubscriptionId,hasStripeCustomerId:!!sub.stripeCustomerId},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  // Abonnement Stripe actif
  if(sub.status==='active'||sub.status==='trialing')return true;
  // Essai local encore valide
  var te=getTrialEnd(sub);
  if(te&&new Date(te)>new Date())return true;
  return false;
}

function subReason(sub){
  if(!sub)return 'trial_expired';
  if(sub.status==='past_due'||sub.status==='unpaid')return 'past_due';
  if(sub.status==='canceled'||sub.status==='incomplete_expired')return 'canceled';
  return 'trial_expired';
}

async function checkAccessOrPaywall(){
  const sub=await ensureSubscriptionRow();
  // #region agent log
  fetch('http://127.0.0.1:7687/ingest/aea19bce-9029-4481-9962-13d314321f91',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5f23a1'},body:JSON.stringify({sessionId:'5f23a1',runId:'trial-paywall-enforcement',hypothesisId:'H22',location:'app.html:checkAccessOrPaywall',message:'Check access or paywall entry',data:{status:sub&&sub.status?String(sub.status):'',trialEndsAt:sub&&sub.trialEndsAt?sub.trialEndsAt:(sub&&sub.trialEnd?sub.trialEnd:''),hasAccessPreview:!!hasAccess(sub)},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  if(hasAccess(sub)){
    showApp();
    applyRoleUi();
    showTrialBanner(sub);
    try{
      const key='lb_desktop_onboard_seen';
      if(localStorage.getItem(key)!=='1'){
        localStorage.setItem(key,'1');
        showToast('👋 Bienvenue ! Créez un cabinet, puis votre premier cas.','#2563eb',4200);
      }
    }catch(e){}
    return true;
  }
  // #region agent log
  fetch('http://127.0.0.1:7687/ingest/aea19bce-9029-4481-9962-13d314321f91',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5f23a1'},body:JSON.stringify({sessionId:'5f23a1',runId:'trial-paywall-enforcement',hypothesisId:'H22',location:'app.html:checkAccessOrPaywall',message:'Paywall shown',data:{reason:String(subReason(sub)||''),status:sub&&sub.status?String(sub.status):''},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  showPaywall(subReason(sub));
  return false;
}

function showTrialBanner(sub){
  if(typeof window._trialBannerTimer!=='undefined' && window._trialBannerTimer){
    clearInterval(window._trialBannerTimer);
    window._trialBannerTimer=null;
  }
  var el=document.getElementById('trial-banner');
  if(!el){
    el=document.createElement('div');
    el.id='trial-banner';
    el.style.cssText='background:linear-gradient(90deg,#2563eb,#7c3aed);color:#fff;text-align:center;padding:8px 14px;font-size:.78rem;font-weight:600;cursor:pointer;';
    document.body.insertBefore(el,document.body.firstChild);
  }
  // Abonnement actif → pas de bandeau
  if(sub.status==='active'){el.style.display='none';return;}
  // Abonnement souscrit (même si encore en période d'essai) → pas de bandeau, l'utilisateur sait déjà
  if(sub.stripeSubscriptionId){el.style.display='none';return;}
  // Sinon : essai gratuit en cours, on incite à souscrire
  var te=getTrialEnd(sub);
  if(sub.status==='trialing'||(te&&new Date(te)>new Date())){
    function _fmtTrialCountdown(endIso){
      var ms=Math.max(0,new Date(endIso||Date.now()).getTime()-Date.now());
      var totalMin=Math.floor(ms/60000);
      var d=Math.floor(totalMin/(24*60));
      var h=Math.floor((totalMin%(24*60))/60);
      var m=totalMin%60;
      return d+'j '+String(h).padStart(2,'0')+'h '+String(m).padStart(2,'0')+'m';
    }
    function _renderTrialCountdown(){
      var cd=_fmtTrialCountdown(te);
      el.innerHTML='🎁 Essai gratuit — <strong>'+cd+' restants</strong> · Cliquez pour souscrire';
    }
    _renderTrialCountdown();
    window._trialBannerTimer=setInterval(_renderTrialCountdown,60000);
    el.onclick=function(){showPaywall('trial_expired');};
    el.style.display='block';
  } else {
    el.style.display='none';
  }
}

async function startSubscription(plan){
  var errEl=document.getElementById('paywall-err');
  if(errEl)errEl.style.display='none';
  if(!currentUser){if(errEl){errEl.textContent='Non connecté — rechargez la page';errEl.style.display='block';}return;}
  var btn=event&&event.target;
  var origText=btn?btn.textContent:'';
  if(btn){btn.disabled=true;btn.textContent='⏳ Redirection vers Stripe…';}
  try{
    // #region agent log
    fetch('http://127.0.0.1:7687/ingest/aea19bce-9029-4481-9962-13d314321f91',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5f23a1'},body:JSON.stringify({sessionId:'5f23a1',runId:'site-audit-subscription-routing',hypothesisId:'H18',location:'app.html:startSubscription',message:'Subscription checkout requested',data:{plan:plan||'monthly',hasButton:!!btn},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    const resp=await fetch('/.netlify/functions/stripe-create-subscription',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        userId:currentUser.id,
        email:currentUser.email||'',
        laboName:localStorage.getItem('lb_name')||'',
        plan:plan,
        appUrl:window.location.href.split('?')[0]
      })
    });
    const data=await resp.json();
    if(!resp.ok||!data.url){throw new Error(data.error||'Erreur serveur');}
    window.location.href=data.url;
  }catch(e){
    if(btn){btn.disabled=false;btn.textContent=origText;}
    var rawMsg=(e&&e.message)?String(e.message):'Erreur serveur';
    if(/Configuration Stripe manquante|Configuration Stripe incomplète|Clé Stripe non configurée|Prix Stripe non configurés/i.test(rawMsg)){
      rawMsg='Souscription indisponible en local: configurez STRIPE_SECRET_KEY (ou STRIPE_SUBSCRIPTION_KEY) et STRIPE_PRICE_MONTHLY / STRIPE_PRICE_ANNUAL dans Netlify Dev.';
    }
    if(errEl){errEl.textContent='❌ '+rawMsg;errEl.style.display='block';}
  }
}

async function renderSubInfo(){
  var el=document.getElementById('sub-info');if(!el)return;
  var sub=await fetchSubscriptionStatus();
  if(!sub){el.innerHTML='Aucune donnée d\'abonnement.';return;}
  var fmt=function(d){if(!d)return '—';return new Date(d).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});};
  var planLbl=sub.plan==='annual'?'Annuel (470,40 € / an)':sub.plan==='monthly'?'Mensuel (49 € / mois)':'—';
  var statusLbl={active:'✅ Actif',trialing:'🎁 Essai en cours',past_due:'⚠️ Paiement en échec',canceled:'❌ Annulé',incomplete:'⏳ En attente',checkout_pending:'⏳ En attente de paiement'}[sub.status]||sub.status||'—';
  var endLbl=sub.status==='active'||sub.status==='trialing'?'Renouvellement : '+fmt(sub.currentPeriodEnd||sub.trialEndsAt||sub.trialEnd):sub.status==='trialing'?'Fin d\'essai : '+fmt(sub.trialEndsAt||sub.trialEnd):'';
  var cancelScheduled=sub.cancelAtPeriodEnd||(sub.cancelAt&&new Date(sub.cancelAt)>new Date());
  var cancelDate=sub.cancelAt||sub.currentPeriodEnd||sub.trialEndsAt||sub.trialEnd;
  el.innerHTML=
    '<div><strong>Statut :</strong> '+statusLbl+'</div>'+
    '<div><strong>Formule :</strong> '+planLbl+'</div>'+
    (endLbl&&!cancelScheduled?'<div>'+endLbl+'</div>':'')+
    (cancelScheduled?'<div style="color:var(--orange);margin-top:6px;">⚠️ Résiliation programmée le '+fmt(cancelDate)+' — vous gardez accès jusqu\'à cette date</div>':'');
}

async function openBillingPortal(){
  if(!currentUser){showToast('Non connecté','#c0392b');return;}
  try{
    const sub=await fetchSubscriptionStatus();
    const hasStripeSub=!!(sub&&(sub.stripeSubscriptionId||sub.stripeCustomerId));
    // #region agent log
    fetch('http://127.0.0.1:7687/ingest/aea19bce-9029-4481-9962-13d314321f91',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5f23a1'},body:JSON.stringify({sessionId:'5f23a1',runId:'site-audit-subscription-routing',hypothesisId:'H17',location:'app.html:openBillingPortal',message:'Manage subscription routing decision',data:{status:sub&&sub.status?String(sub.status):'none',hasStripeSubscriptionId:!!(sub&&sub.stripeSubscriptionId),hasStripeCustomerId:!!(sub&&sub.stripeCustomerId),route:hasStripeSub?'portal':'checkout'},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if(!hasStripeSub){
      // Pas encore d'abonnement Stripe: on envoie vers la souscription.
      await startSubscription('monthly');
      return;
    }
    const resp=await fetch('/.netlify/functions/stripe-create-portal-session',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({userId:currentUser.id,returnUrl:window.location.href.split('?')[0]})
    });
    // #region agent log
    fetch('http://127.0.0.1:7687/ingest/aea19bce-9029-4481-9962-13d314321f91',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5f23a1'},body:JSON.stringify({sessionId:'5f23a1',runId:'site-audit-accept-billing',hypothesisId:'H15',location:'app.html:openBillingPortal',message:'Billing portal HTTP response',data:{status:resp.status,ok:!!resp.ok},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    const data=await resp.json();
    if(!resp.ok||!data.url){
      var rawMsg=(data&&data.error)?String(data.error):'Erreur';
      if(/Configuration Stripe manquante|Clé Stripe non configurée/i.test(rawMsg)){
        throw new Error('Abonnement indisponible en local: configurez STRIPE_SECRET_KEY (ou STRIPE_SUBSCRIPTION_KEY) dans Netlify Dev.');
      }
      throw new Error(rawMsg);
    }
    window.location.href=data.url;
  }catch(e){
    _debugAuditLog('H4','Desktop openBillingPortal failed',{msg:e&&e.message?String(e.message):'unknown'});
    showToast('❌ '+e.message,'#c0392b',6000);
  }
}

// Retour de Stripe Checkout — forcer un refresh de l'état
(function(){
  var params=new URLSearchParams(window.location.search);
  if(params.get('sub_ok')==='1'){
    // #region agent log
    fetch('http://127.0.0.1:7687/ingest/aea19bce-9029-4481-9962-13d314321f91',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5f23a1'},body:JSON.stringify({sessionId:'5f23a1',runId:'trial-paywall-enforcement',hypothesisId:'H23',location:'app.html:sub_ok_handler',message:'Subscription success callback detected',data:{path:window.location.pathname||''},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    setTimeout(function(){
      var clean=window.location.pathname;
      history.replaceState({},'',clean);
      if(currentUser)checkAccessOrPaywall();
    },3000);
  }
})();

// Refresh auto du statut d'abonnement quand l'utilisateur revient sur l'onglet
// (ex : après avoir géré son abonnement sur le portail Stripe)
window.addEventListener('focus',function(){
  if(!currentUser)return;
  // #region agent log
  fetch('http://127.0.0.1:7687/ingest/aea19bce-9029-4481-9962-13d314321f91',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5f23a1'},body:JSON.stringify({sessionId:'5f23a1',runId:'trial-paywall-enforcement',hypothesisId:'H24',location:'app.html:focus_refresh',message:'Window focus refresh subscription status',data:{},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  fetchSubscriptionStatus().then(function(sub){
    if(!sub)return;
    showTrialBanner(sub);
    var dashPane=document.getElementById('pane-parametres');
    if(dashPane&&dashPane.classList.contains('on'))renderSubInfo();
    if(!hasAccess(sub)){showPaywall(subReason(sub));}
  });
});
function showAuthErr(msg) {
  const el = document.getElementById('auth-err');
  el.textContent = msg; el.classList.add('show');
}
function hideAuthErr() {
  document.getElementById('auth-err').classList.remove('show');
}

function initAuthFormUX(){
  try{
    const emailInput=document.getElementById('auth-email');
    const passInput=document.getElementById('auth-pass');
    const toggle=document.getElementById('auth-pass-toggle');
    const remembered=localStorage.getItem('lb_last_email')||'';
    if(emailInput&&remembered&&!emailInput.value){
      emailInput.value=remembered;
      if(passInput)passInput.focus();
    }else if(emailInput&&!emailInput.value){
      emailInput.focus();
    }
    if(toggle&&passInput){
      toggle.addEventListener('click',function(){
        const isPwd=passInput.type==='password';
        passInput.type=isPwd?'text':'password';
        toggle.textContent=isPwd?'Masquer':'Afficher';
      });
    }
  }catch(e){}
}
initAuthFormUX();

// Auto-show signup form si ?signup=1 dans l'URL (depuis la landing page)
(function(){
  var params=new URLSearchParams(window.location.search);
  if(params.get('signup')==='1'){
    document.getElementById('auth-login-form').style.display='none';
    document.getElementById('auth-signup-form').style.display='block';
    var sub=document.getElementById('auth-subtitle');
    if(sub&&typeof t==='function')sub.textContent=t('auth.subtitle.signup');
    var sw=document.getElementById('auth-switch-text');
    if(sw&&typeof t==='function')sw.textContent=t('auth.switch.hasaccount');
    var tgl=document.getElementById('btn-auth-toggle');
    if(tgl&&typeof t==='function')tgl.textContent=t('auth.btn.toggle.login')||'Se connecter';
  }
})();

// Toggle login ↔ signup
document.getElementById('btn-auth-toggle').addEventListener('click', function() {
  const isLogin = document.getElementById('auth-login-form').style.display !== 'none';
  document.getElementById('auth-login-form').style.display = isLogin ? 'none' : 'block';
  document.getElementById('auth-signup-form').style.display = isLogin ? 'block' : 'none';
  document.getElementById('auth-subtitle').textContent = isLogin ? t('auth.subtitle.signup') : t('auth.subtitle.login');
  document.getElementById('auth-switch-text').textContent = isLogin ? t('auth.switch.hasaccount') : t('auth.switch.noaccount');
  this.textContent = isLogin ? t('auth.btn.toggle.back') : t('auth.btn.toggle');
  hideAuthErr();
});

// Connexion
document.getElementById('btn-login').addEventListener('click', async function() {
  hideAuthErr();
  const email = document.getElementById('auth-email').value.trim();
  const pass = document.getElementById('auth-pass').value;
  if (!email || !pass) { showAuthErr(t('auth.err.fields')); return; }
  this.textContent = t('common.loading'); this.disabled = true;
  try{
    localStorage.removeItem('lb_env');
    if(email){localStorage.setItem('lb_last_email',email);}
    localStorage.setItem('lb_fresh_login','1');
    const { error } = await sbClient.auth.signInWithPassword({ email, password: pass });
    if (error) {
      localStorage.removeItem('lb_fresh_login');
      showAuthErr(t('common.error') + ' : ' + (error.message === 'Invalid login credentials' ? t('auth.err.badpass') : error.message));
    }
  }catch(e){
    localStorage.removeItem('lb_fresh_login');
    showAuthErr(t('common.error') + ' : ' + ((e&&e.message)?e.message:'Erreur réseau'));
  }finally{
    this.textContent = t('auth.btn.login');
    this.disabled = false;
  }
});

// Inscription
document.getElementById('btn-signup').addEventListener('click', async function() {
  hideAuthErr();
  const laboName = document.getElementById('auth-labo').value.trim();
  const email = document.getElementById('auth-email2').value.trim();
  const pass = document.getElementById('auth-pass2').value;
  if (!laboName || !email || !pass) { showAuthErr(t('auth.err.fields')); return; }
  if (pass.length < 6) { showAuthErr(t('auth.err.shortpass')); return; }
  this.textContent = t('common.loading'); this.disabled = true;
  const { error } = await sbClient.auth.signUp({ email, password: pass, options: { data: { labo_name: laboName } } });
  this.disabled = false;
  if (error) { this.textContent = 'Créer mon compte'; showAuthErr('Erreur : ' + error.message); }
  else {
    this.textContent = 'Connexion en cours…';
    // Vider toutes les données du compte précédent
    Object.keys(localStorage).forEach(function(k){ if(k.startsWith('lb_')) localStorage.removeItem(k); });
    // Initialiser le nouveau compte vierge
    localStorage.setItem('lb_name', laboName);
    localStorage.setItem('lb_techs', '{}');
    localStorage.setItem('lb_prog_actif', '0');
    // onAuthStateChange SIGNED_IN gère la suite — pas de fallback reload (causait un flash gênant)
  }
});

// Déconnexion — instantanée : les données sont déjà sauvées par le debounce 2s
window.authLogout = function() {
  clearTimeout(_saveTimer);
  stopRealtime();
  // Masquer l'app immédiatement (feedback visuel instantané)
  showLogin();
  currentUser = null;
  // signOut et éventuelle sauvegarde en arrière-plan, puis rechargement
  Object.keys(localStorage).forEach(function(k){if(k.startsWith('sb-'))localStorage.removeItem(k);});
  Promise.race([sbClient.auth.signOut(), new Promise(r=>setTimeout(r,2000))])
    .catch(function(){})
    .finally(function(){ window.location.href = window.location.pathname; });
};

// Si l'utilisateur connecté est différent du propriétaire des données locales → on efface tout
function clearIfDifferentUser(userId){
  const stored=localStorage.getItem('lb_current_user');
  if(stored&&stored!==userId){
    // Effacer toutes les données labo de l'ancien compte (localStorage)
    Object.keys(localStorage).forEach(function(k){if(k.startsWith('lb_'))localStorage.removeItem(k);});
    // Réinitialiser TOUTES les variables en mémoire
    jobs=[];archive=[];cabinets=[];syns={};scanHist=[];
    if(typeof waiting!=='undefined')waiting=[];
    if(typeof conges!=='undefined')conges=[];
    if(typeof absences!=='undefined')absences=[];
    if(typeof queue!=='undefined')queue=[];
    if(typeof documents!=='undefined')documents=[];
    if(typeof tarifs!=='undefined')tarifs=[];
    if(typeof bdc!=='undefined')bdc=[];
    if(typeof fourns!=='undefined')fourns=[];
    if(typeof bdl!=='undefined')bdl=[];
    TECHS={};customTypes=[];
    localStorage.setItem('lb_techs','{}');
    localStorage.setItem('lb_prog_actif','0');
    // Retirer le flag de seeding pour que les types par défaut soient rechargés
    localStorage.removeItem('lb_types_seeded');
    // Réinitialiser les variables de session (pas liées aux données labo)
    _serverUpdatedAt=null;
    if(typeof _chatUnread!=='undefined'){Object.keys(_chatUnread).forEach(function(k){delete _chatUnread[k];});}
    // Effacer les timestamps "vu" du chat de l'ancien compte
    Object.keys(localStorage).forEach(function(k){if(k.startsWith('chat_seen_'))localStorage.removeItem(k);});
    // Note: render() sera appelé après cloudRestore — pas ici
  }
  localStorage.setItem('lb_current_user',userId);
}

// ── Synchronisation Realtime ─────────────────────────────────────────────────
function startRealtime(userId){
  // Arrêter l'abonnement précédent s'il existe
  if(_realtimeChannel){sbClient.removeChannel(_realtimeChannel);_realtimeChannel=null;}
  _realtimeChannel=sbClient
    .channel('labo_sync_'+userId)
    .on('postgres_changes',{event:'UPDATE',schema:'public',table:'labo_data',filter:'id=eq.'+userId},
      async function(payload){
        // Ignorer nos propres sauvegardes (même onglet)
        if(payload.new&&payload.new.data&&payload.new.data._tabId===_tabId)return;
        // Une autre session a modifié les données → recharger silencieusement
        console.log('Realtime: mise à jour détectée depuis un autre appareil/onglet');
        const msg=document.getElementById('cloud-msg');
        if(msg){msg.style.color='var(--ink-soft)';msg.textContent=t('btn.syncing');}
        await cloudRestore(true);
        render();
        refreshTechSelects();refreshTypeSelects();applyProgMode();
        if(msg){msg.style.color='#2a6049';msg.textContent=t('btn.synced');}
        setTimeout(function(){if(msg)msg.textContent='';},3000);
      }
    )
    .subscribe(function(status){
      if(status==='SUBSCRIBED')console.log('Realtime actif pour',userId);
    });
}
function stopRealtime(){
  if(_realtimeChannel){sbClient.removeChannel(_realtimeChannel);_realtimeChannel=null;}
}
// ─────────────────────────────────────────────────────────────────────────────

// Vérification initiale (une seule fois au chargement)
let _authInitDone = false;
function _withTimeout(promise, ms, label){
  return Promise.race([
    promise,
    new Promise(function(_, reject){
      setTimeout(function(){ reject(new Error('Timeout '+(label||'opération'))); }, ms||15000);
    })
  ]);
}
function _bootWatchdog(){
  setTimeout(function(){
    var el=document.getElementById('auth-loading');
    if(!el||el.style.display==='none')return;
    console.warn('Boot watchdog: écran chargement toujours visible');
    try{
      if(currentUser)showApp();
      else showLogin();
      showToast('Connexion lente — l\'interface s\'affiche quand même.','#d97706',5000);
    }catch(e){
      el.style.display='none';
      var ov=document.getElementById('auth-overlay');
      if(ov)ov.style.display='flex';
    }
  }, 18000);
}
_bootWatchdog();
(async () => {
  applyLang();
  try {
    const sessionResult = await _withTimeout(sbClient.auth.getSession(), 12000, 'getSession');
    const { data: { session } } = sessionResult;
    if (session) {
      clearIfDifferentUser(session.user.id);
      currentUser = session.user;
      _cachedAccessToken = session.access_token;
      const okAccess = await _withTimeout(checkAccessOrPaywall(), 15000, 'abonnement');
      if (okAccess) {
        showApp();
        try{
          await _withTimeout(cloudRestore(true), 20000, 'cloudRestore');
        }catch(e2){
          console.warn('cloudRestore init',e2);
        }
        startRealtime(session.user.id);
        try{_maybeRunOnboarding();}catch(e){console.warn('onboarding',e);}
      }
    } else {
      showLogin();
    }
  } catch(e) {
    console.error('Auth init error', e);
    showLogin();
  }
  _authInitDone = true;
})();

// Écoute les changements d'état auth (après init)
sbClient.auth.onAuthStateChange(async (event, session) => {
  if (!_authInitDone && event !== 'SIGNED_IN') return; // ignorer pendant init, sauf SIGNED_IN (nouveau compte)
  if (!_authInitDone && event === 'SIGNED_IN' && currentUser) return; // l'IIFE a déjà traité cette session, éviter la double-init
  if (event === 'SIGNED_OUT') {
    stopRealtime();
    currentUser = null;
    _cachedAccessToken = '';
    Object.keys(localStorage).forEach(function(k){if(k.startsWith('sb-'))localStorage.removeItem(k);});
    showLogin();
  } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
    // Mettre à jour le token en cache à chaque connexion ou refresh
    _cachedAccessToken = session.access_token;
    if (event === 'TOKEN_REFRESHED') return; // juste le token, pas besoin de reinit
    const wasLoggedOut = !currentUser; // vraie nouvelle connexion si l'utilisateur n'était pas connecté
    clearIfDifferentUser(session.user.id);
    currentUser = session.user;
    if(!localStorage.getItem('lb_types_seeded')){
      if(!customTypes.length){customTypes=cloneDefaultTypes();saveCustomTypes();}
      localStorage.setItem('lb_types_seeded','1');
    }
    if(localStorage.getItem('lb_fresh_login')){
      localStorage.removeItem('lb_fresh_login');
      window.location.href='labo-mobile.html';
      return;
    }
    const hasAccessNow = await _withTimeout(checkAccessOrPaywall(), 15000, 'abonnement');
    if(!hasAccessNow)return;
    showApp();
    if(wasLoggedOut){
      const dashTab=document.querySelector('[data-pane="dashboard"]');
      if(dashTab)dashTab.click();
    }
    try{
      await _withTimeout(cloudRestore(true), 20000, 'cloudRestore');
    }catch(e2){
      console.warn('cloudRestore sign-in',e2);
    }
    startRealtime(session.user.id);
    if(typeof updateQueueBadge==='function')updateQueueBadge();
    try{_maybeRunOnboarding();}catch(e){console.warn('onboarding',e);}
  }
});

/* ══════════════════════════════════════════
   §34 — REALTIME & AI ASSISTANT
   ══════════════════════════════════════════ */
// — Assistant IA intégré (panneau flottant, historique de conversation)
(function(){
  let aiHistory=[];
  let aiLoading=false;

  // Toggle panel
  window.toggleAiPanel=function(){
    const p=document.getElementById('ai-panel');
    p.classList.toggle('open');
    if(p.classList.contains('open'))document.getElementById('ai-input').focus();
  };

  // Envoi avec Entrée (Shift+Entrée = saut de ligne)
  window.aiKeyDown=function(e){
    if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendAiMessage();}
  };

  // Construit le contexte système avec les données actuelles du labo
  function buildSystemPrompt(){
    const laboName=localStorage.getItem('lb_name')||'Laboratoire';
    const today=new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    const activeJobs=(jobs||[]).filter(j=>!j.done&&!j.cancelled);
    const doneJobs=(jobs||[]).filter(j=>j.done);
    const waitJobs=(jobs||[]).filter(j=>j.waiting);
    const cabList=(cabinets||[]).map(c=>c.name).join(', ')||'aucun cabinet enregistré';
    return `Tu es l'assistant IA intégré au logiciel Labosync du laboratoire de prothèse dentaire "${laboName}".
Date du jour : ${today}.

Données actuelles du laboratoire :
- Travaux en cours : ${activeJobs.length}
- Travaux terminés : ${doneJobs.length}
- Travaux en attente : ${waitJobs.length}
- Cabinets dentaires clients : ${cabList}
- Techniciens : Gilles, Jean-Christian (JC), Leeloo (Lilou), Licia (Litcha), Marie, BigTom (Tom), Fabien

Types de prothèses gérés : couronnes zircone, inlays composites, facettes, armatures zircone/métal, inlay emax, wax-up, bridges zircone/métal.

Tu réponds aux questions sur :
- L'utilisation du logiciel Labosync (plannings, travaux, cabinets, bons de livraison, facturation, paramètres)
- La prothèse dentaire (termes techniques, procédés, matériaux)
- Les données du laboratoire (en t'appuyant sur les chiffres ci-dessus)

Réponds toujours en français, de façon concise et professionnelle.`;
  }

  // Ajoute un message dans le chat
  function appendMsg(role,text){
    const box=document.getElementById('ai-msgs');
    const d=document.createElement('div');
    d.className='ai-msg '+(role==='user'?'user':role==='error'?'error':'bot');
    d.textContent=text;
    box.appendChild(d);
    box.scrollTop=box.scrollHeight;
  }

  // Indicateur de chargement
  let typingEl=null;
  function showTyping(){
    const box=document.getElementById('ai-msgs');
    typingEl=document.createElement('div');
    typingEl.className='ai-typing';
    typingEl.textContent=t('btn.replying');
    box.appendChild(typingEl);
    box.scrollTop=box.scrollHeight;
  }
  function hideTyping(){if(typingEl){typingEl.remove();typingEl=null;}}

  // Envoi du message
  window.sendAiMessage=async function(){
    if(aiLoading)return;
    const input=document.getElementById('ai-input');
    const text=input.value.trim();
    if(!text)return;
    input.value='';
    input.style.height='';
    appendMsg('user',text);
    aiHistory.push({role:'user',content:text});
    aiLoading=true;
    document.getElementById('ai-send').disabled=true;
    showTyping();
    try{
      const res=await fetch('/.netlify/functions/ai-chat',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          max_tokens:1024,
          system:buildSystemPrompt(),
          messages:aiHistory
        })
      });
      hideTyping();
      if(!res.ok){
        const err=await res.json().catch(()=>({}));
        const msg=err.error?.message||('Erreur HTTP '+res.status);
        appendMsg('error','Erreur : '+msg);
        aiHistory.pop();
      }else{
        const data=await res.json();
        const reply=data.content[0].text;
        aiHistory.push({role:'assistant',content:reply});
        appendMsg('bot',reply);
      }
    }catch(e){
      hideTyping();
      appendMsg('error','Erreur réseau : '+e.message);
      aiHistory.pop();
    }finally{
      aiLoading=false;
      document.getElementById('ai-send').disabled=false;
      document.getElementById('ai-input').focus();
    }
  };
})();
