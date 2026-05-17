// Analyse d'exports (CSV, texte collé, etc.) pour migration — retourne un plan JSON structuré (Claude via même clé que ai-chat).
exports.handler = async function (event) {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const reqOrigin = event.headers.origin || event.headers.Origin || '';
  const allowOrigin = allowedOrigins.length
    ? (allowedOrigins.includes(reqOrigin) ? reqOrigin : allowedOrigins[0])
    : '*';

  const corsHeaders = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: { message: 'ANTHROPIC_API_KEY manquante sur Netlify.' } }),
    };
  }

  const ip = (event.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (!global.__AI_IMPORT_RL__) global.__AI_IMPORT_RL__ = new Map();
  const nowMs = Date.now();
  const ent = global.__AI_IMPORT_RL__.get(ip) || { n: 0, reset: nowMs + 60_000 };
  if (nowMs > ent.reset) {
    ent.n = 0;
    ent.reset = nowMs + 60_000;
  }
  ent.n += 1;
  global.__AI_IMPORT_RL__.set(ip, ent);
  if (ent.n > 120) {
    return {
      statusCode: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: { message: 'Trop de requêtes import (max 120 / minute / IP) — réessayez dans une minute.' } }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (_) {
    return { statusCode: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: { message: 'JSON invalide' } }) };
  }

  const rawText = typeof body.rawText === 'string' ? body.rawText : '';
  const fileName = typeof body.fileName === 'string' ? body.fileName.slice(0, 200) : '';
  const existingCabinetNames = Array.isArray(body.existingCabinetNames)
    ? body.existingCabinetNames.map((s) => String(s || '').trim()).filter(Boolean).slice(0, 500)
    : [];

  if (!rawText.trim()) {
    return { statusCode: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: { message: 'Contenu vide.' } }) };
  }
  if (rawText.length > 120_000) {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: { message: 'Fichier trop volumineux (max ~120 000 caractères). Découpez en plusieurs imports.' } }),
    };
  }

  const system = `Tu es un assistant de migration pour un logiciel de laboratoire dentaire (Labosync).
Tu reçois du texte brut (souvent CSV, parfois copier-coller de tableaux ou exports d'un autre logiciel type Prothesis).
Tu dois produire UN SEUL objet JSON valide, sans markdown, sans texte avant ou après.

Schéma exact de sortie :
{
  "summary": "string court en français",
  "questions": [
    {
      "id": "identifiant_snake_unique",
      "prompt": "question affichée au laborantin",
      "mergeInto": { "actionIndex": 0, "path": "draft.phone" },
      "optional": true
    }
  ],
  "actions": [
    {
      "type": "create_cabinet",
      "draft": { "name": "Nom cabinet / praticien", "phone": "", "email": "", "adresse": "", "siretCab": "", "note": "" }
    },
    {
      "type": "create_bl",
      "draft": {
        "cabinetName": "doit correspondre à un cabinet existant ou un create_cabinet précédent",
        "patient": "",
        "legacyBlNum": "numéro historique si visible sinon vide",
        "dateISO": "YYYY-MM-DD ou vide",
        "description": "libellé travail / prothèse",
        "typeKey": "un parmi: inlay_only,crown_only,inlay_then_crown,inlay_composite,facettes,cle_schefield,cire_occlusion,armature_zircon,armature_metal,inlay_emax,wax_up,guide_chir,impression_modele,inlay_armature,bridge_zircone,bridge_metal,provisoire — si doute mettre provisoire",
        "nb": 1,
        "prix": 0,
        "materiaux": "",
        "lot": "",
        "note": ""
      }
    },
    {
      "type": "create_facture",
      "draft": {
        "cabinetName": "",
        "legacyNum": "",
        "dateISO": "",
        "status": "brouillon",
        "lines": [ { "label": "", "qty": 1, "prix": 0 } ],
        "total": 0,
        "note": "",
        "bdlRefs": []
      }
    }
  ]
}

Règles :
- "actions" : d'abord tous les create_cabinet nécessaires, puis create_bl, puis create_facture.
- Si un cabinet du texte correspond déjà (nom proche) à la liste fournie "Cabinets déjà dans Labosync", NE crée PAS de create_cabinet ; utilise exactement le nom tel qu'il apparaîtra dans cabinetName des BL/factures (reprends le nom de la liste si match).
- Ne invente pas de montants : si inconnu, prix 0 et une question mergeInto draft.prix ou draft.lines.0.prix etc.
- Pour create_facture : "bdlRefs" est une liste de numéros de BL (strings) déjà visibles dans le fichier, à lier à la facture pour traçabilité ; laisse [] si absent.
- RGPD : n'invente pas de données personnelles ; si adresse / SIRET cabinet / téléphone manquent pour un nouveau cabinet, ajoute des entrées "questions" avec mergeInto vers draft.adresse, draft.siretCab, draft.phone, draft.email.
- QUESTIONS : sois exigeant. Si le fichier est ambigu, incomplet ou regroupe plusieurs cabinets, prévois AU MINIMUM 4 questions pertinentes (jusqu'à 15 si nécessaire) : confirmation orthographe praticien, adresse cabinet, téléphone, email, prix unitaire douteux, date de facture, rattachement BL↔facture, doublons potentiels avec numéros déjà présents, matériaux/lot manquants, TVA / mentions légales si visibles, etc. Chaque question doit avoir un "id" unique stable (snake_case).
- Si le fichier est illisible ou vide de BL/factures, actions peut être [] et summary l'explique ; pose quand même 1–2 questions sur ce que l'utilisateur attend.
- Le client peut pré-parser seul un XML Factur-X (UBL/CII) ou un CSV labo : si le contenu ressemble déjà à un résumé structuré « === Extrait structuré Factur-X === », complète surtout ce qui manque (téléphone, emails) plutôt que de contredire les totaux/lignes.
- Pas de clés en dehors du schéma. Pas de commentaires JSON.`;

  const userBlock = `Fichier: ${fileName || '(collage)'}

Cabinets déjà dans Labosync (noms exacts à réutiliser si correspondance) :
${existingCabinetNames.length ? existingCabinetNames.map((n) => '- ' + n).join('\n') : '(aucun)'}

--- Contenu à analyser ---
${rawText}
--- Fin ---`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 8192,
        system,
        messages: [{ role: 'user', content: userBlock }],
      }),
    });

    const data = await response.json();
    return {
      statusCode: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: { message: 'Erreur serveur : ' + e.message } }),
    };
  }
};
