/* Coach Trail — catalogue des machines de salle
   Schémas simplifiés (dessinés à la main, pas des photos officielles).
   Chacun peut être remplacé par TA photo, prise dans ta salle depuis l'appli. */

// Petits éléments de dessin : la silhouette (tête + traits) et les pièces de la machine (en violet)
const svgBase = (contenu) =>
  `<svg viewBox="0 0 160 110" class="schema" role="img" aria-hidden="true"><g fill="none" stroke-linecap="round" stroke-linejoin="round">${contenu}</g></svg>`;
const sol = `<line x1="8" y1="100" x2="152" y2="100" stroke="var(--line)" stroke-width="3"/>`;
const mach = (d) => `<path d="${d}" stroke="var(--violet)" stroke-width="5"/>`;
const corps = (d, tete) => `<path d="${d}" stroke="currentColor" stroke-width="4"/><circle cx="${tete[0]}" cy="${tete[1]}" r="7" fill="currentColor"/>`;
const poids = (x, y, h = 26) => `<rect x="${x}" y="${y}" width="10" height="${h}" rx="2" fill="var(--orange)" stroke="none"/>`;

const MACHINES_SALLE = [
  {
    id: "presse", nom: "Presse à cuisses", zone: "Cuisses, fessiers",
    svg: svgBase(sol + mach("M20 96 L58 96 L40 58 M58 90 L140 30") + `<rect x="118" y="20" width="10" height="36" rx="2" transform="rotate(37 123 38)" fill="var(--violet)" stroke="none"/>` + corps("M44 62 L60 88 L92 62 L116 44 M50 70 L70 60", [40, 52])),
    reglages: ["Dossier assez incliné pour que le bas du dos reste collé.", "Pieds au milieu du plateau, largeur de bassin.", "Une jambe : pied bien au centre du plateau."],
    erreurs: ["Genoux qui rentrent vers l'intérieur.", "Bas du dos qui décolle en bas du mouvement.", "Verrouiller complètement les genoux en haut."],
  },
  {
    id: "legext", nom: "Leg extension", zone: "Quadriceps (avant des cuisses)",
    svg: svgBase(sol + mach("M40 96 L40 60 M30 62 L70 62 M70 62 L70 96 M30 62 L30 30") + `<circle cx="112" cy="70" r="6" fill="var(--violet)" stroke="none"/>` + mach("M72 66 L112 70") + corps("M34 38 L38 62 L74 62 L108 66", [34, 26])),
    reglages: ["Genou aligné avec l'axe de rotation (le point rouge sur la machine).", "Boudin juste au-dessus de la cheville.", "Dos bien calé contre le dossier."],
    erreurs: ["Donner un coup de rein pour monter.", "Redescendre en laissant tomber la charge : freine !"],
  },
  {
    id: "legcurl", nom: "Leg curl", zone: "Ischios (arrière des cuisses)",
    svg: svgBase(sol + mach("M20 70 L120 70 M40 70 L40 96 M110 70 L110 96") + `<circle cx="130" cy="52" r="6" fill="var(--violet)" stroke="none"/>` + corps("M30 62 L100 62 L128 50", [22, 58])),
    reglages: ["Deux versions : assise (la plus facile pour toi) ou allongée (« curl jambes arrière »).", "Genou aligné avec l'axe de rotation de la machine.", "Boudin au-dessus du talon."],
    erreurs: ["Bassin qui décolle du banc.", "Mouvement trop rapide : contrôle la descente.", "Charge trop lourde : les ischios progressent mieux par les répétitions."],
  },
  {
    id: "adduct", nom: "Adducteurs", zone: "Intérieur des cuisses",
    svg: svgBase(sol + mach("M50 96 L50 64 L110 64 L110 96 M50 64 L44 26") + `<rect x="66" y="72" width="8" height="20" rx="2" fill="var(--violet)" stroke="none"/><rect x="88" y="72" width="8" height="20" rx="2" fill="var(--violet)" stroke="none"/>` + corps("M48 36 L54 62 M54 62 L62 66 L60 92 M54 62 L100 66 L102 92", [46, 24])),
    reglages: ["Coussinets sur l'intérieur des genoux.", "Commence avec une ouverture confortable, sans forcer l'étirement."],
    erreurs: ["Laisser claquer les coussinets.", "Ouvrir trop grand dès la première série."],
  },
  {
    id: "abdos", nom: "Machine à abdos", zone: "Abdominaux",
    svg: svgBase(sol + mach("M44 96 L44 64 L92 64 L92 96 M44 64 L40 28 M40 28 L80 28") + corps("M46 34 L60 60 L96 62 L98 94 M46 40 L74 30", [52, 24])),
    reglages: ["Dos calé contre le dossier, pieds bloqués.", "Les mains tiennent les poignées sans tirer."],
    erreurs: ["Tirer avec les bras au lieu d'enrouler le buste.", "Aller trop vite : expire en enroulant."],
  },
  {
    id: "abduct", nom: "Abducteurs", zone: "Moyen fessier (côté de la hanche)",
    svg: svgBase(sol + mach("M50 96 L50 64 L110 64 L110 96 M50 64 L44 26") + `<rect x="60" y="72" width="10" height="20" rx="2" fill="var(--violet)" stroke="none"/><rect x="92" y="72" width="10" height="20" rx="2" fill="var(--violet)" stroke="none"/>` + corps("M48 36 L54 62 M54 62 L66 66 L64 92 M54 62 L96 66 L98 92", [46, 24])),
    reglages: ["Coussinets sur l'extérieur des genoux.", "Dos contre le dossier (ou buste légèrement penché en avant pour cibler plus les fessiers)."],
    erreurs: ["Laisser claquer les coussinets au retour.", "Amplitude trop petite : ouvre grand, ferme lentement."],
  },
  {
    id: "hipthrust", nom: "Hip thrust", zone: "Grand fessier",
    svg: svgBase(sol + mach("M18 66 L46 66 L46 96") + `<line x1="60" y1="56" x2="96" y2="56" stroke="var(--violet)" stroke-width="7"/>` + corps("M38 62 L80 60 L100 72 L104 98 M80 60 L96 72", [30, 58])),
    reglages: ["Haut du dos (sous les omoplates) contre le banc.", "Barre ou ceinture sur le pli de la hanche.", "Pieds à plat : en haut, tibias verticaux."],
    erreurs: ["Cambrer le bas du dos au lieu de pousser avec les fessiers.", "Regarder au plafond : garde le menton rentré."],
  },
  {
    id: "smith", nom: "Smith machine (barre guidée)", zone: "Cuisses, fessiers (squat)",
    svg: svgBase(sol + mach("M30 98 L30 10 M130 98 L130 10 M24 36 L136 36") + poids(18, 23) + poids(132, 23) + corps("M80 42 L80 64 L68 78 L74 98 M80 64 L92 78 L86 98 M66 36 L80 46 L94 36", [80, 30])),
    reglages: ["Barre sur le haut du dos (pas sur la nuque).", "Pieds un peu en avant de la barre.", "Fais une rotation de la barre pour la décrocher, et pense à la raccrocher."],
    erreurs: ["Genoux qui rentrent.", "Talons qui décollent.", "Descendre plus bas que ce que ton dos permet en restant droit."],
  },
  {
    id: "halteres", nom: "Haltères et banc", zone: "Tout le corps",
    svg: svgBase(sol + mach("M100 76 L148 76 M110 76 L110 98 M140 76 L140 98") + corps("M50 36 L50 66 L40 98 M50 66 L62 98 M50 42 L38 66 M50 42 L62 66", [50, 24]) + poids(32, 64, 12) + poids(58, 64, 12)),
    reglages: ["Prends les haltères au rack, pieds écartés, dos droit.", "Pour la fente bulgare : pied arrière sur le banc, lacets posés dessus."],
    erreurs: ["Dos rond en ramassant les haltères.", "Charge trop lourde : la technique d'abord."],
  },
  {
    id: "box", nom: "Box / step", zone: "Cuisses, fessiers (montées)",
    svg: svgBase(sol + `<rect x="80" y="68" width="56" height="32" rx="3" stroke="var(--violet)" stroke-width="5"/>` + corps("M68 26 L70 56 L92 62 L94 68 M70 56 L58 80 L56 100 M70 34 L60 52 M70 34 L80 52", [68, 14])),
    reglages: ["Box à hauteur de genou environ.", "Pose tout le pied sur la box."],
    erreurs: ["Pousser avec la jambe restée au sol.", "Genou qui part vers l'intérieur."],
  },
  {
    id: "tirage", nom: "Tirage vertical", zone: "Dos, bras (utile pour les bâtons)",
    svg: svgBase(sol + mach("M120 98 L120 8 L80 8 M80 8 L80 30 M56 30 L104 30 M70 70 L100 70 L100 98") + corps("M80 56 L82 76 L104 80 L104 98 M80 62 L62 36 M80 62 L98 36", [80, 46])),
    reglages: ["Cuisses bloquées sous les boudins.", "Mains un peu plus larges que les épaules."],
    erreurs: ["Tirer derrière la nuque.", "Se balancer en arrière pour tirer."],
  },
  {
    id: "mollets", nom: "Mollets (machine ou marche)", zone: "Mollets, chevilles",
    svg: svgBase(sol + `<rect x="66" y="86" width="40" height="14" rx="2" stroke="var(--violet)" stroke-width="5"/>` + corps("M84 24 L84 58 L80 84 M84 58 L88 84 M84 32 L72 50 M84 32 L96 50", [84, 12])),
    reglages: ["Avant du pied sur le bord de la marche, talons dans le vide.", "Tiens-toi à une barre pour l'équilibre."],
    erreurs: ["Rebondir en bas.", "Plier les genoux pour tricher."],
  },
  {
    id: "elastique", nom: "Élastique (mini-band)", zone: "Fessiers, hanche",
    svg: svgBase(sol + corps("M80 22 L80 54 L64 76 L60 98 M80 54 L96 76 L100 98 M80 30 L66 50 M80 30 L94 50", [80, 10]) + `<path d="M64 74 Q80 82 96 74" stroke="var(--orange)" stroke-width="5"/>`),
    reglages: ["Au-dessus des genoux (facile) ou autour des chevilles (plus dur).", "Souvent en libre-service près de la zone d'étirements."],
    erreurs: ["Laisser les genoux se refermer.", "Se redresser : reste en demi-flexion."],
  },
  {
    id: "coussin", nom: "Coussin d'équilibre / Bosu", zone: "Chevilles, proprioception",
    svg: svgBase(sol + `<path d="M56 100 Q80 78 104 100 Z" fill="var(--violet-2)" stroke="var(--violet)" stroke-width="4"/>` + corps("M80 24 L80 58 L80 88 M80 58 L98 72 M80 32 L60 40 M80 32 L100 40", [80, 12])),
    reglages: ["Commence pieds nus ou en chaussures plates, près d'un mur."],
    erreurs: ["Regarder ses pieds : fixe un point devant toi."],
  },
  {
    id: "tapis", nom: "Tapis de sol", zone: "Gainage, étirements",
    svg: svgBase(sol + `<rect x="16" y="92" width="128" height="8" rx="2" fill="var(--violet-2)" stroke="none"/>` + corps("M36 84 L112 74 L132 90 M44 84 L44 92", [28, 82])),
    reglages: ["Les tapis sont dans la zone d'étirements. Pense à le nettoyer après."],
    erreurs: ["Bloquer sa respiration pendant le gainage."],
  },
  {
    id: "velo", nom: "Vélo", zone: "Cardio sans impact",
    svg: svgBase(sol + mach("M50 98 L70 60 L110 60 M70 60 L66 48 M110 60 L118 40 M90 60 L90 98 M60 98 L120 98") + `<circle cx="90" cy="78" r="12" stroke="var(--violet)" stroke-width="4"/>` + corps("M68 40 L96 26 L118 38 M68 40 L86 68 L90 84", [100, 16])),
    reglages: ["Selle à hauteur de hanche quand tu es debout à côté.", "Jambe presque tendue en bas du coup de pédale."],
    erreurs: ["Selle trop basse : genoux qui souffrent."],
  },
  {
    id: "ellip", nom: "Vélo elliptique", zone: "Cardio, proche de la course",
    svg: svgBase(sol + mach("M30 98 L130 98 M118 98 L112 20 M36 92 L100 62") + corps("M88 22 L88 56 L72 74 L64 92 M88 56 L100 70 M88 30 L108 24", [88, 10])),
    reglages: ["Tiens les poignées mobiles pour faire travailler les bras.", "Reste droite, sans t'affaler sur la machine."],
    erreurs: ["Monter sur la pointe des pieds : garde les talons posés."],
  },
  {
    id: "stepper", nom: "StairMaster (escalier)", zone: "Cardio, montée",
    svg: svgBase(sol + mach("M30 100 L30 80 L60 80 L60 60 L90 60 L90 40 L120 40 L120 100 M130 100 L130 20") + corps("M74 22 L74 46 L88 40 M74 46 L62 60 M74 28 L128 24", [74, 12])),
    reglages: ["Choisis une vitesse où tu tiens sans t'agripper.", "Pose tout le pied sur la marche."],
    erreurs: ["S'appuyer sur les rampes : ça annule la moitié du travail."],
  },
  {
    id: "tapisc", nom: "Tapis de course", zone: "Cardio, marche en côte",
    svg: svgBase(sol + mach("M20 96 L140 78 M128 80 L120 20 L104 20") + corps("M84 30 L84 60 L72 74 L70 90 M84 60 L96 72 L104 86 M84 38 L100 46", [84, 18])),
    reglages: ["Monte l'inclinaison progressivement (10 à 15 % pour tes séances).", "Pince de sécurité accrochée à tes vêtements."],
    erreurs: ["Se tenir aux barres en montée : ça fausse tout l'effort.", "Pas trop grands : garde une foulée courte et rapide."],
  },
  {
    id: "rameur", nom: "Rameur", zone: "Cardio, tout le corps",
    svg: svgBase(sol + mach("M10 92 L150 92 M130 92 L130 70 M20 92 L20 80") + `<circle cx="138" cy="70" r="10" stroke="var(--violet)" stroke-width="4"/>` + corps("M70 84 L54 52 M70 84 L100 70 L118 86 M58 60 L96 66", [52, 40])),
    reglages: ["Pieds sanglés, sangle sur le haut du pied.", "Ordre : jambes, puis buste, puis bras. Au retour : bras, buste, jambes."],
    erreurs: ["Tirer avec les bras d'abord.", "Dos rond."],
  },
];

/* Lien exercice → machine, et clé pour mémoriser tes charges.
   uni : une jambe à la fois (charge droite et gauche) · pdc : poids du corps, pas de charge. */
/* base : tes charges actuelles (relevées le 15/11/2026), affichées tant que tu n'as rien noté dans l'appli */
const EXO_META = {
  "Presse à cuisses une jambe": { k: "presse-1", mac: "presse", uni: true, pas: 2.5, base: { d: 20.3, g: 20.3 } },
  "Presse une jambe": { k: "presse-1", mac: "presse", uni: true, pas: 2.5, base: { d: 20.3, g: 20.3 } },
  "Presse à cuisses deux jambes, lourde": { k: "presse-2", mac: "presse", pas: 5, base: { kg: 47.5 } },
  "Leg extension une jambe": { k: "legext-1", mac: "legext", uni: true, pas: 1, base: { d: 13.4, g: 13.4 } },
  "Leg curl assis une jambe": { k: "legcurl-assis-1", mac: "legcurl", uni: true, pas: 1, base: { d: 18, g: 18 } },
  "Leg curl allongé : monte à 2, redescends en 3 s": { k: "legcurl-allonge", mac: "legcurl", pas: 1, base: { kg: 23 } },
  "Mollets à la presse (pointes de pieds)": { k: "mollets-presse", mac: "presse", pas: 2.5, base: { kg: 52 } },
  "Machine adducteurs": { k: "adduct", mac: "adduct", pas: 2.5 },
  "Abdos à la machine (crunch)": { k: "abdos", mac: "abdos", pas: 2.5, base: { kg: 29.3 } },
  "Pont fessier talons sur un banc": { mac: "tapis", pdc: true },
  "Fente bulgare (pied arrière sur banc)": { k: "bulgare", mac: "halteres", uni: true, pas: 1, unite: "kg / haltère" },
  "Leg curl une jambe": { k: "legcurl-1", mac: "legcurl", uni: true, pas: 2.5 },
  "Machine abducteurs": { k: "abduct", mac: "abduct", pas: 2.5, base: { kg: 34.3 } },
  "Mollets debout une jambe": { k: "mollets-1", mac: "mollets", pas: 1, unite: "kg (haltère)", option: true },
  "Planche + planche latérale": { mac: "tapis", pdc: true },
  "Hip thrust (machine ou barre)": { k: "hipthrust", mac: "hipthrust", pas: 5 },
  "Hip thrust": { k: "hipthrust", mac: "hipthrust", pas: 5 },
  "Pont fessier une jambe": { mac: "tapis", pdc: true },
  "Marche latérale élastique": { mac: "elastique", pdc: true },
  "Clamshell (coquillage) élastique": { mac: "elastique", pdc: true },
  "Planche latérale genou fléchi": { mac: "tapis", pdc: true },
  "Squat (Smith machine ou goblet lourd)": { k: "squat-smith", mac: "smith", pas: 2.5, unite: "kg ajoutés sur la barre" },
  "Soulevé de terre jambes tendues haltères": { k: "rdl", mac: "halteres", pas: 1, unite: "kg / haltère" },
  "Montée sur box chargée": { k: "box", mac: "box", pas: 1, unite: "kg / haltère" },
  "Tirage vertical": { k: "tirage", mac: "tirage", pas: 2.5 },
  "Gainage dynamique (dead bug)": { mac: "tapis", pdc: true },
  "Montée sur box dynamique": { mac: "box", pdc: true },
  "Squat sauté léger": { mac: "tapis", pdc: true },
  "Fentes marchées haltères": { k: "fentes-marchees", mac: "halteres", pas: 1, unite: "kg / haltère" },
  "Mollets sautillés": { mac: "tapis", pdc: true },
  "Gainage planche avec touches d'épaule": { mac: "tapis", pdc: true },
  "Squat lent (4 s à la descente)": { k: "squat-lent", mac: "smith", pas: 2.5, unite: "kg ajoutés sur la barre" },
  "Leg extension : monte à 2, redescends sur 1 jambe": { k: "legext", mac: "legext", pas: 2.5, base: { kg: 20 } },
  "Step-down (descente de marche)": { mac: "box", pdc: true },
  "Fentes arrière lentes": { k: "fentes-ar", mac: "halteres", pas: 1, unite: "kg / haltère", option: true },
  "Équilibre une jambe sur coussin": { mac: "coussin", pdc: true },
  "Planche": { mac: "tapis", pdc: true },
};
SEANCES.forEach((s) => (s.exos || []).forEach((e) => Object.assign(e, EXO_META[e.n] || { pdc: true })));

function machineInfo(id) { return MACHINES_SALLE.find((m) => m.id === id); }
// Machines de cardio utilisées par une séance chronométrée
function machinesDeSeance(s) {
  if (s.exos) return [...new Set(s.exos.map((e) => e.mac).filter(Boolean))];
  if (s.etapes) return [...new Set(s.etapes.map((e) => e.m).filter((m) => machineInfo(m)))];
  return [];
}
