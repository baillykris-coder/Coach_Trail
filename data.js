/* Coach Trail — bibliothèque de séances
   Zones d'effort : 1 récup · 2 facile · 3 soutenu · 4 fort · 5 très fort
   Étapes chronométrées : { t: secondes, l: libellé, m: machine, z: zone } */

const ZONES = {
  1: { nom: "Récup", aide: "RPE 3-4 · très facile, tu respires par le nez" },
  2: { nom: "Facile", aide: "RPE 5-6 · tu peux tenir une conversation" },
  3: { nom: "Soutenu", aide: "RPE 7 · tu parles par phrases courtes" },
  4: { nom: "Fort", aide: "RPE 8 · quelques mots seulement" },
  5: { nom: "Très fort", aide: "RPE 9 · impossible de parler, à fond mais propre" },
};

const MACHINES = {
  velo: "Vélo",
  ellip: "Elliptique",
  stepper: "StairMaster",
  rameur: "Rameur",
  tapisc: "Tapis de course",
  course: "Course",
  libre: "Poids du corps",
};

// Répète un bloc n fois : rep(4, [[120,"Fort","ellip",4],[60,"Souple","ellip",2]])
function rep(n, bloc) {
  const out = [];
  for (let i = 1; i <= n; i++) {
    bloc.forEach(([t, l, m, z]) => out.push({ t, l: `${l} (${i}/${n})`, m, z }));
  }
  return out;
}
function st(t, l, m, z) { return { t, l, m, z }; }
const MIN = 60;

const CATEGORIES = [
  { id: "cardio", nom: "Cardio salle", emoji: "🫀", aide: "Vélo, elliptique, stepper, rameur — fractionnés" },
  { id: "renfo", nom: "Renfo Basic Fit", emoji: "🏋️", aide: "Jambes une par une, fessiers, fonte, gainage" },
  { id: "trail", nom: "Trail", emoji: "⛰️", aide: "Sorties autour de Castelnou et des Aspres" },
  { id: "plat", nom: "Plat", emoji: "🛣️", aide: "Court, varié, ludique — la clé du roulant" },
  { id: "vtt", nom: "VTT", emoji: "🚵‍♀️", aide: "En bonus quand la météo le permet" },
  { id: "pdc", nom: "Poids du corps", emoji: "🤸", aide: "Sans matériel, 10' entre deux chevaux" },
  { id: "mobilite", nom: "Hanche & mobilité", emoji: "🧘", aide: "10 minutes d'entretien" },
  { id: "express", nom: "Express 25'", emoji: "⚡", aide: "Pour les semaines pourries : ça compte !" },
];

/* Échauffement commun de tes séances préférées (ne compte pas dans l'heure) */
const ECHAUF_FAV = [st(5 * MIN, "Échauffement tranquille", "rameur", 2), st(5 * MIN, "Échauffement tranquille", "velo", 2)];

const SEANCES = [
  /* ---------------- CARDIO SALLE : TES SÉANCES PRÉFÉRÉES ⭐ ---------------- */
  {
    id: "f-relances", cat: "cardio", fav: true, nom: "🟢 Les relances", duree: 70, niveau: 2,
    resume: "Vélo, StairMaster, elliptique : 60' de travail après 10' d'échauffement.",
    pourquoi: "Travailler les changements de rythme, comme en trail.",
    etapes: [
      ...ECHAUF_FAV,
      ...rep(6, [[3 * MIN, "Soutenu", "velo", 4], [2 * MIN, "Récupération active", "velo", 2]]),
      ...rep(6, [[2 * MIN, "Rapide", "stepper", 4], [1 * MIN, "Récupération", "stepper", 2]]),
      st(2 * MIN, "Facile", "stepper", 2),
      st(10 * MIN, "Allure régulière", "ellip", 3),
    ],
  },
  {
    id: "f-moteur", cat: "cardio", fav: true, nom: "🔵 Le moteur", duree: 70, niveau: 2,
    resume: "Rameur, vélo cadence élevée, elliptique avec accélérations.",
    pourquoi: "Développer une grosse endurance : c'est le moteur des 33 km.",
    etapes: [
      ...ECHAUF_FAV,
      st(20 * MIN, "Rythme constant", "rameur", 3),
      st(20 * MIN, "Résistance moyenne, cadence élevée", "velo", 3),
      ...rep(4, [[1 * MIN, "Très soutenu", "ellip", 4], [4 * MIN, "Régulier", "ellip", 3]]),
    ],
  },
  {
    id: "f-montagne", cat: "cardio", fav: true, nom: "🟠 La montagne", duree: 70, niveau: 3,
    resume: "35' de StairMaster en blocs de 3', puis vélo dur et rameur.",
    pourquoi: "Préparer les longues montées.",
    etapes: [
      ...ECHAUF_FAV,
      ...rep(7, [[3 * MIN, "Rapide", "stepper", 4], [2 * MIN, "Récupération", "stepper", 2]]),
      st(15 * MIN, "Résistance forte, cadence régulière", "velo", 3),
      st(10 * MIN, "Rythme modéré", "rameur", 3),
    ],
  },
  {
    id: "f-trailindoor", cat: "cardio", fav: true, nom: "🔴 Trail indoor", duree: 70, niveau: 3,
    resume: "Tapis incliné, StairMaster, rameur : un trail vallonné en salle.",
    pourquoi: "Reproduire les efforts d'un trail vallonné.",
    etapes: [
      ...ECHAUF_FAV,
      st(20 * MIN, "Inclinaison 10 à 15 % : marche très rapide ou petit footing", "tapisc", 3),
      ...rep(6, [[2 * MIN, "Rapide", "stepper", 4], [1 * MIN, "Récupération", "stepper", 2]]),
      st(2 * MIN, "Facile", "stepper", 2),
      ...rep(5, [[1 * MIN, "Très intense", "rameur", 5], [3 * MIN, "Régulier", "rameur", 3]]),
    ],
  },
  {
    id: "f-circuit", cat: "cardio", fav: true, nom: "🟣 Circuit traileur", duree: 70, niveau: 3,
    resume: "3 tours de rameur, vélo et StairMaster, très peu de pause entre les machines.",
    pourquoi: "Fatigue musculaire + cardio : comme les jambes en fin de course.",
    etapes: [
      ...ECHAUF_FAV,
      ...[1, 2, 3].flatMap((t) => [
        st(8 * MIN, `Tour ${t}/3 · soutenu`, "rameur", 4),
        st(6 * MIN, `Tour ${t}/3 · soutenu`, "velo", 4),
        st(2 * MIN, `Tour ${t}/3 · rapide`, "stepper", 4),
        st(1 * MIN, `Tour ${t}/3 · récup`, "stepper", 2),
        st(2 * MIN, `Tour ${t}/3 · rapide`, "stepper", 4),
        st(1 * MIN, `Tour ${t}/3 · récup`, "stepper", 2),
      ]),
    ],
  },
  {
    id: "f-plusdure", cat: "cardio", fav: true, nom: "⚫ La plus difficile", duree: 70, niveau: 3,
    resume: "Vélo au seuil, tapis à 12 %, rameur 500 m rapides / 250 m récup.",
    pourquoi: "Repousser le seuil d'effort et finir fort.",
    etapes: [
      ...ECHAUF_FAV,
      ...rep(4, [[4 * MIN, "Très soutenu", "velo", 4], [1 * MIN, "Récupération", "velo", 2]]),
      ...rep(4, [[4 * MIN, "Inclinaison 12 % : marche rapide ou léger footing", "tapisc", 3], [1 * MIN, "Plus d'inclinaison ou de vitesse", "tapisc", 4]]),
      ...rep(5, [[135, "500 m rapides (touche ⏭ dès que tu as tes 500 m)", "rameur", 5], [90, "250 m récupération (⏭ dès que c'est fait)", "rameur", 2]]),
      st(75, "Finis tranquille jusqu'aux 20'", "rameur", 2),
    ],
  },

  /* ---------------- CARDIO SALLE ---------------- */
  {
    id: "c-quatre", cat: "cardio", nom: "Les Quatre Machines", duree: 50, niveau: 2,
    resume: "Le grand tour des 4 machines, avec du fractionné partout.",
    pourquoi: "Travaille le cardio sous tous les angles sans choc pour la hanche. Le stepper prépare directement les montées.",
    etapes: [
      st(8 * MIN, "Échauffement progressif", "velo", 2),
      ...rep(4, [[2 * MIN, "Fort", "ellip", 4], [1 * MIN, "Souple", "ellip", 2]]),
      st(1 * MIN, "Changement de machine", "libre", 1),
      ...rep(5, [[1 * MIN, "Fort", "stepper", 4], [1 * MIN, "Souple", "stepper", 2]]),
      st(1 * MIN, "Changement de machine", "libre", 1),
      ...rep(6, [[30, "Très fort", "rameur", 5], [30, "Souple", "rameur", 1]]),
      st(6 * MIN, "Retour au calme", "velo", 1),
    ],
  },
  {
    id: "c-pyramide", cat: "cardio", nom: "Pyramide elliptique", duree: 45, niveau: 2,
    resume: "1-2-3-4-3-2-1 minutes fort, récup moitié moins.",
    pourquoi: "La pyramide apprend à gérer l'effort qui dure, comme une longue montée.",
    etapes: [
      st(8 * MIN, "Échauffement", "ellip", 2),
      ...[1, 2, 3, 4, 3, 2, 1].flatMap((m, i) => [
        st(m * MIN, `Fort ${m}'`, "ellip", m >= 3 ? 3 : 4),
        st(Math.max(30, m * 30), "Souple", "ellip", 1),
      ]),
      st(6 * MIN, "Retour au calme", "velo", 1),
    ],
  },
  {
    id: "c-escaliers", cat: "cardio", nom: "Les marches de Castelnou", duree: 45, niveau: 3,
    resume: "Spécial montée : blocs longs au stepper.",
    pourquoi: "Le stepper est ce qui ressemble le plus à une côte. On travaille la puissance en montée, la hanche reste protégée.",
    etapes: [
      st(8 * MIN, "Échauffement", "velo", 2),
      st(3 * MIN, "Mise en route", "stepper", 2),
      ...rep(4, [[4 * MIN, "Montée tonique", "stepper", 4], [2 * MIN, "Récup en marchant lentement", "stepper", 1]]),
      st(8 * MIN, "Retour au calme", "ellip", 1),
    ],
  },
  {
    id: "c-tabata", cat: "cardio", nom: "Rameur-Vélo explosif", duree: 35, niveau: 3,
    resume: "Deux blocs Tabata (20\" à fond / 10\" repos).",
    pourquoi: "Court et intense : booste ta VMA quand tu as peu de temps.",
    etapes: [
      st(8 * MIN, "Échauffement", "velo", 2),
      ...rep(8, [[20, "À fond", "rameur", 5], [10, "Repos", "rameur", 1]]),
      st(3 * MIN, "Récup + changement", "libre", 1),
      ...rep(8, [[20, "À fond", "velo", 5], [10, "Repos", "velo", 1]]),
      st(8 * MIN, "Retour au calme", "ellip", 1),
    ],
  },
  {
    id: "c-grandhuit", cat: "cardio", nom: "Le Grand Huit", duree: 60, niveau: 3,
    resume: "Rotation des 4 machines, 3 tours, de plus en plus fort.",
    pourquoi: "Séance longue et variée : endurance + changements de rythme, comme sur un trail vallonné.",
    etapes: [
      st(8 * MIN, "Échauffement", "velo", 2),
      ...[3, 4, 4].flatMap((z, i) => [
        st(4 * MIN, `Tour ${i + 1}`, "ellip", z),
        st(4 * MIN, `Tour ${i + 1}`, "stepper", z),
        st(3 * MIN, `Tour ${i + 1}`, "rameur", z),
        st(3 * MIN, `Tour ${i + 1} — récup active`, "velo", 2),
      ]),
      st(7 * MIN, "Retour au calme", "velo", 1),
    ],
  },
  {
    id: "c-douce", cat: "cardio", nom: "Endurance douce", duree: 50, niveau: 1,
    resume: "Facile et régulier, sans choc. La séance « hanche qui tire ».",
    pourquoi: "Construit le fond sans aucun impact. Proposée automatiquement quand ta hanche se plaint.",
    etapes: [
      st(20 * MIN, "Endurance facile", "velo", 2),
      st(20 * MIN, "Endurance facile", "ellip", 2),
      st(10 * MIN, "Retour au calme", "velo", 1),
    ],
  },

  /* ---------------- RENFO ---------------- */
  {
    id: "r-unejambe", cat: "renfo", nom: "Jambes une par une", duree: 60, niveau: 2, test: "presse",
    resume: "Unilatéral : on continue à rééquilibrer droite / gauche.",
    pourquoi: "C'est ce qui a changé ta façon de courir. Toujours commencer par la jambe droite (la plus faible) et caler la gauche sur elle.",
    echauffement: "8' vélo ou elliptique, facile",
    exos: [
      { n: "Presse à cuisses une jambe", s: "5 × 10 / jambe", r: "1'30", c: "Droite d'abord. Note les charges D et G : c'est ton test d'équilibre." },
      { n: "Leg extension une jambe", s: "5 × 10 / jambe", r: "1'", c: "Droite d'abord, descente lente." },
      { n: "Leg curl assis une jambe", s: "5 × 5 / jambe", r: "1'30", c: "Ischios. Objectif : passer de 5 à 8 répétitions avant d'augmenter la charge." },
      { n: "Fente bulgare (pied arrière sur banc)", s: "3 × 8 / jambe", r: "1'30", c: "Haltères légers ou poids du corps, genou dans l'axe du pied." },
      { n: "Machine abducteurs", s: "3 × 15", r: "1'", c: "Moyen fessier : la clé de la hanche." },
      { n: "Mollets à la presse (pointes de pieds)", s: "5 × 15", r: "45\"", c: "Pointes de pieds en bas du plateau, montée rapide, descente lente." },
      { n: "Planche + planche latérale", s: "3 × 30\" chaque", r: "30\"", c: "Bassin bien aligné." },
    ],
  },
  {
    id: "r-fessiers", cat: "renfo", nom: "Fessiers & hanche", duree: 45, niveau: 1,
    resume: "Le bloc qui protège ta hanche.",
    pourquoi: "Des fessiers solides stabilisent le bassin à chaque foulée, surtout en descente.",
    echauffement: "8' elliptique facile",
    exos: [
      { n: "Hip thrust (machine ou barre)", s: "4 × 10", r: "1'30", c: "Pause 1 s en haut, serre les fessiers." },
      { n: "Pont fessier talons sur un banc", s: "3 × 10", r: "1'", c: "Ischios + fessiers : la version facile du leg curl. Talons sur le banc, pousse le bassin vers le haut." },
      { n: "Machine abducteurs", s: "3 × 15", r: "1'", c: "Contrôle le retour." },
      { n: "Machine adducteurs", s: "3 × 15", r: "1'", c: "Intérieur des cuisses : stabilise le genou et la hanche." },
      { n: "Marche latérale élastique", s: "3 × 12 pas / côté", r: "45\"", c: "Élastique au-dessus des genoux, reste basse." },
      { n: "Planche latérale genou fléchi", s: "3 × 30\" / côté", r: "30\"", c: "Ou jambes tendues si facile." },
    ],
  },
  {
    id: "r-fonte", cat: "renfo", nom: "Côté fonte 💪", duree: 55, niveau: 3, test: "presse",
    resume: "Force lourde : peu de répétitions, belles charges.",
    pourquoi: "La force max rend chaque pas en montée moins coûteux. Charge lourde mais technique parfaite.",
    echauffement: "8' vélo + 2 séries légères du premier exercice",
    exos: [
      { n: "Squat (Smith machine ou goblet lourd)", s: "4 × 6", r: "2'", c: "Lourd mais propre. Descends jusqu'à cuisses parallèles." },
      { n: "Soulevé de terre jambes tendues haltères", s: "3 × 8", r: "2'", c: "Dos plat, ischios qui s'étirent." },
      { n: "Leg curl allongé : monte à 2, redescends en 3 s", s: "3 × 8", r: "1'30", c: "Ton point faible, donc ta plus grosse marge. Même charge tant que 3 × 12 ne passe pas." },
      { n: "Montée sur box chargée", s: "3 × 6 / jambe", r: "1'30", c: "Box à hauteur de genou, pousse avec la jambe du haut." },
      { n: "Presse à cuisses deux jambes, lourde", s: "3 × 8", r: "2'", c: "Pieds largeur de bassin." },
      { n: "Tirage vertical", s: "3 × 10", r: "1'", c: "Le haut du corps aide pour les bâtons." },
      { n: "Abdos à la machine (crunch)", s: "3 × 12", r: "1'", c: "Enroule le buste, sans tirer avec les bras." },
    ],
  },
  {
    id: "r-explosif", cat: "renfo", nom: "Montées explosives", duree: 45, niveau: 3,
    resume: "Puissance et vitesse pour avaler les bosses.",
    pourquoi: "Phase spécifique : transformer la force en puissance, pour relancer après chaque montée.",
    echauffement: "8' stepper progressif",
    exos: [
      { n: "Montée sur box dynamique", s: "4 × 8 / jambe", r: "1'", c: "Monte vite, redescends lentement." },
      { n: "Squat sauté léger", s: "3 × 8", r: "1'30", c: "Réception souple et silencieuse. Saute cet exercice si la hanche tire." },
      { n: "Fentes marchées haltères", s: "3 × 10 / jambe", r: "1'", c: "Grand pas, buste droit." },
      { n: "Mollets sautillés", s: "3 × 20\"", r: "40\"", c: "Petits rebonds rapides sur l'avant du pied." },
      { n: "Gainage planche avec touches d'épaule", s: "3 × 30\"", r: "30\"", c: "Bassin immobile." },
    ],
  },
  {
    id: "r-descente", cat: "renfo", nom: "Descente solide", duree: 45, niveau: 2,
    resume: "Excentrique : les quadriceps qui freinent.",
    pourquoi: "Les descentes font mal aux cuisses et à la hanche. On les prépare en freinant lentement.",
    echauffement: "8' vélo facile",
    exos: [
      { n: "Squat lent (4 s à la descente)", s: "4 × 8", r: "1'30", c: "Contrôle total, comme pour freiner en descente." },
      { n: "Leg extension : monte à 2, redescends sur 1 jambe", s: "3 × 8 / jambe", r: "1'", c: "Droite d'abord, descente sur 4 s." },
      { n: "Step-down (descente de marche)", s: "3 × 10 / jambe", r: "1'", c: "Genou aligné, talon qui touche à peine." },
      { n: "Fentes arrière lentes", s: "3 × 8 / jambe", r: "1'", c: "Descente sur 3 s." },
      { n: "Équilibre une jambe sur coussin", s: "3 × 30\" / jambe", r: "30\"", c: "Chevilles : moins d'entorses sur les cailloux." },
    ],
  },

  /* ---------------- TRAIL ---------------- */
  {
    id: "t-endurance", cat: "trail", nom: "Sortie longue facile", duree: 0, niveau: 2, longue: true,
    resume: "La sortie du week-end, tout en aisance.",
    pourquoi: "C'est elle qui construit ton fond pour les 33 km. Si tu peux parler, c'est la bonne allure.",
    consignes: [
      "Allure conversation tout le long (zone 2).",
      "Marche dans les montées raides, sans culpabiliser : c'est ce qu'on fera le jour J.",
      "Mange et bois toutes les 45' dès que la sortie dépasse 1h30 : on entraîne aussi le ventre.",
      "Garde les cuisses relâchées en descente, petits pas rapides.",
    ],
  },
  {
    id: "t-montees", cat: "trail", nom: "Sortie longue + montées toniques", duree: 0, niveau: 3, longue: true,
    resume: "Base facile, avec 4 à 6 montées appuyées au milieu.",
    pourquoi: "Développe la puissance en côte sans séance dédiée : une seule sortie, deux bénéfices.",
    consignes: [
      "30' facile pour commencer.",
      "Au milieu : 4 à 6 montées de 2 à 4' en zone 4, en courant ou en marche rapide avec les bras.",
      "Récupère en redescendant tranquillement.",
      "Finis facile.",
    ],
  },
  {
    id: "t-specifique", cat: "trail", nom: "Sortie longue spécial course", duree: 0, niveau: 3, longue: true,
    resume: "Répétition générale : allure course sur le roulant.",
    pourquoi: "La 33'tour est roulante (environ 36 m de D+ par km). On apprend à relancer entre les bosses.",
    consignes: [
      "Choisis un parcours avec des portions roulantes (Thuir, Sainte-Colombe).",
      "3 blocs de 10 à 15' à allure course sur le roulant (zone 3).",
      "Teste ton ravito du jour J : ce que tu mangeras, quand tu le mangeras.",
      "Descentes en relâchement, cadence rapide.",
    ],
  },
  {
    id: "t-cotes-courtes", cat: "trail", nom: "Côtes courtes", duree: 50, niveau: 3,
    resume: "8 montées d'1 minute, fortes, sur une côte régulière.",
    pourquoi: "La puissance en montée : on recrute plus de fibres, et les côtes de la course paraîtront plus douces.",
    etapes: [
      st(15 * MIN, "Footing facile jusqu'au pied d'une côte régulière", "course", 2),
      ...rep(8, [[60, "Montée forte, petits pas, bras actifs", "course", 4], [90, "Redescente en trottinant", "course", 1]]),
      st(10 * MIN, "Retour au calme", "course", 1),
    ],
  },
  {
    id: "t-cotes-longues", cat: "trail", nom: "Côtes longues", duree: 50, niveau: 3,
    resume: "5 montées de 3 minutes, soutenues mais régulières.",
    pourquoi: "Tenir un effort long en montée sans exploser : exactement ce que demandent les bosses des Aspres.",
    etapes: [
      st(15 * MIN, "Footing facile jusqu'au pied d'une côte", "course", 2),
      ...rep(5, [[3 * MIN, "Montée soutenue (course ou marche rapide)", "course", 4], [150, "Redescente tranquille", "course", 1]]),
      st(10 * MIN, "Retour au calme", "course", 1),
    ],
  },
  {
    id: "t-repere", cat: "trail", nom: "Parcours repère (test)", duree: 0, niveau: 3, test: "repere",
    resume: "Toujours la même boucle, chronométrée, toutes les 4-5 semaines.",
    pourquoi: "La meilleure preuve que tu progresses : même boucle, même effort, chrono et ressenti comparés.",
    consignes: [
      "Choisis UNE boucle et garde-la (par exemple ta boucle de Castelnou d'environ 10 km).",
      "Effort soutenu mais régulier : le même à chaque test.",
      "Note ton chrono, ta FC moyenne et ton ressenti dans le retour.",
    ],
  },
  {
    id: "t-descente", cat: "trail", nom: "Atelier descente", duree: 60, niveau: 2,
    resume: "Une descente répétée 3-4 fois, en progressant.",
    pourquoi: "La descente, ça s'apprend. On progresse doucement à cause de la hanche.",
    consignes: [
      "20' facile jusqu'à une descente technique de 3 à 5'.",
      "Descends-la 3 à 4 fois, de plus en plus fluide : regard 3 m devant, petits pas, bras écartés.",
      "Remonte en marchant.",
      "Stop si la hanche dépasse 3/10.",
    ],
  },
  {
    id: "t-affutage", cat: "trail", nom: "Rappel allure course", duree: 75, niveau: 2,
    resume: "Affûtage : moins long, mais on garde le rythme.",
    pourquoi: "Garder des jambes vives tout en arrivant fraîche.",
    consignes: [
      "20' facile.",
      "3 × 8' à allure course, 3' facile entre chaque.",
      "15' facile pour finir.",
    ],
  },

  /* ---------------- PLAT ---------------- */
  {
    id: "p-decouverte", cat: "plat", nom: "Footing du retour", duree: 35, niveau: 1,
    resume: "Facile sur le plat, juste pour remettre le plat dans les jambes.",
    pourquoi: "Ton plat a disparu depuis octobre 2025 : on le réintroduit en douceur.",
    etapes: [
      st(5 * MIN, "Échauffement en marchant vite puis trottinant", "course", 1),
      st(25 * MIN, "Footing facile, observe ta cadence", "course", 2),
      st(5 * MIN, "Retour au calme", "course", 1),
    ],
  },
  {
    id: "p-cadence", cat: "plat", nom: "Cadence 170", duree: 35, niveau: 2, test: "cadence",
    resume: "Petits pas rapides : on monte la cadence.",
    pourquoi: "Une cadence plus haute = des foulées plus légères, moins de choc dans la hanche.",
    etapes: [
      st(10 * MIN, "Footing facile", "course", 2),
      ...rep(6, [[1 * MIN, "Cadence haute (+5 pas/min, petits pas)", "course", 3], [1 * MIN, "Cadence normale", "course", 2]]),
      st(8 * MIN, "Retour au calme", "course", 1),
    ],
  },
  {
    id: "p-lampadaires", cat: "plat", nom: "Le jeu des lampadaires", duree: 35, niveau: 2,
    resume: "Fartlek ludique : vite jusqu'au prochain repère, lent jusqu'au suivant.",
    pourquoi: "Le plat sans l'ennui : tu changes de rythme au feeling.",
    etapes: [
      st(10 * MIN, "Footing facile", "course", 2),
      st(15 * MIN, "Vite jusqu'au poteau, lent jusqu'au suivant, et ainsi de suite", "course", 4),
      st(10 * MIN, "Retour au calme", "course", 1),
    ],
  },
  {
    id: "p-progressif", cat: "plat", nom: "Progressif 3 paliers", duree: 40, niveau: 2,
    resume: "Chaque palier un peu plus vite.",
    pourquoi: "Apprend à accélérer en fin de course, quand les autres ralentissent.",
    etapes: [
      st(12 * MIN, "Palier 1 : facile", "course", 2),
      st(12 * MIN, "Palier 2 : tranquille-soutenu", "course", 3),
      st(8 * MIN, "Palier 3 : soutenu", "course", 4),
      st(8 * MIN, "Retour au calme", "course", 1),
    ],
  },
  {
    id: "p-seuil", cat: "plat", nom: "Seuil : 3 × 10'", duree: 64, niveau: 3,
    resume: "3 blocs de 10 minutes un peu plus vite que l'allure course.",
    pourquoi: "Repousser ton seuil : tu tiendras une allure plus rapide plus longtemps sans te mettre dans le rouge.",
    etapes: [
      st(15 * MIN, "Footing facile", "course", 2),
      ...rep(3, [[10 * MIN, "Soutenu, régulier (un peu plus vite que l'allure course)", "course", 3], [3 * MIN, "Trottiner", "course", 2]]),
      st(10 * MIN, "Retour au calme", "course", 1),
    ],
  },
  {
    id: "p-lignes", cat: "plat", nom: "Lignes droites", duree: 30, niveau: 1,
    resume: "Footing + 6 accélérations de 20\".",
    pourquoi: "Réveille la vitesse sans fatiguer.",
    etapes: [
      st(15 * MIN, "Footing facile", "course", 2),
      ...rep(6, [[20, "Accélération progressive, relâchée", "course", 4], [70, "Trottiner", "course", 1]]),
      st(6 * MIN, "Retour au calme", "course", 1),
    ],
  },

  /* ---------------- VTT ---------------- */
  {
    id: "v-balade", cat: "vtt", nom: "VTT endurance", duree: 90, niveau: 1,
    resume: "1h à 2h tranquille.",
    pourquoi: "Endurance et cuisses sans choc. Peut remplacer une séance cardio.",
    consignes: ["Zone 2, à l'aise.", "Profite !"],
  },
  {
    id: "v-cotes", cat: "vtt", nom: "VTT côtes", duree: 75, niveau: 2,
    resume: "Facile, avec 5 côtes appuyées.",
    pourquoi: "Puissance des cuisses, utile pour les montées à pied.",
    consignes: ["20' facile.", "5 côtes de 2 à 4' en zone 4, redescente tranquille.", "Retour facile."],
  },

  /* ---------------- POIDS DU CORPS (capsules chronométrées) ---------------- */
  {
    id: "pdc-jambes", cat: "pdc", nom: "Jambes express 10'", duree: 10, niveau: 2,
    resume: "2 tours de 4 exercices, 40\" chacun. Sans matériel.",
    pourquoi: "Garde des cuisses solides pour les montées, même les jours où la salle est impossible.",
    etapes: [
      st(60, "Échauffement : montées de genoux tranquilles", "libre", 2),
      ...rep(2, [[40, "Squats", "libre", 3], [40, "Fentes arrière alternées", "libre", 3], [40, "Chaise contre un mur", "libre", 4], [40, "Mollets debout, montée rapide", "libre", 3], [30, "Repos", "libre", 1]]),
      st(60, "Étirement des cuisses", "libre", 1),
    ],
  },
  {
    id: "pdc-hanche", cat: "pdc", nom: "Hanche & gainage 10'", duree: 10, niveau: 1,
    resume: "Fessiers et gainage : le bouclier de ta hanche.",
    pourquoi: "Le moyen fessier et le tronc stabilisent le bassin à chaque foulée.",
    etapes: [
      ...rep(2, [[40, "Pont fessier", "libre", 2], [40, "Clamshell côté droit", "libre", 2], [40, "Clamshell côté gauche", "libre", 2], [40, "Planche", "libre", 3], [30, "Planche latérale droite", "libre", 3], [30, "Planche latérale gauche", "libre", 3], [20, "Repos", "libre", 1]]),
    ],
  },
  {
    id: "pdc-cardio", cat: "pdc", nom: "Cardio de l'écurie 12'", duree: 12, niveau: 3,
    resume: "Ça monte vite : 30\" à fond / 15\" de repos.",
    pourquoi: "Un vrai coup de cardio en 12 minutes, sans bouger de chez toi.",
    etapes: [
      st(90, "Échauffement : jumping jacks tranquilles", "libre", 2),
      ...rep(2, [[30, "Montées de genoux", "libre", 4], [15, "Repos", "libre", 1], [30, "Squats sautés", "libre", 5], [15, "Repos", "libre", 1], [30, "Mountain climbers", "libre", 4], [15, "Repos", "libre", 1], [30, "Fentes sautées (ou fentes rapides)", "libre", 5], [15, "Repos", "libre", 1], [30, "Burpees sans pompe", "libre", 5], [15, "Repos", "libre", 1]]),
      st(60, "Marche et respiration", "libre", 1),
    ],
  },
  {
    id: "pdc-pilates", cat: "pdc", nom: "Pilates 15'", duree: 15, niveau: 1,
    resume: "Contrôle, respiration, gainage profond.",
    pourquoi: "Un tronc solide = une foulée qui ne s'écroule pas en fin de course.",
    etapes: [
      st(60, "Respiration allongée, bas du dos au sol", "libre", 1),
      st(90, "Le cent : bras qui frappent, jambes à 45°", "libre", 3),
      st(90, "Enroulés de colonne (roll-up), lents", "libre", 2),
      st(90, "Cercles d'une jambe, 5 dans chaque sens, droite puis gauche", "libre", 2),
      st(90, "Ciseaux, jambes tendues", "libre", 3),
      st(90, "Bird dog lent, en alternant", "libre", 2),
      st(90, "Planche latérale avec élévation de jambe, droite puis gauche", "libre", 3),
      st(90, "Pont fessier en déroulant la colonne", "libre", 2),
      st(90, "Posture de l'enfant, puis chat-vache", "libre", 1),
      st(60, "Pigeon, côté droit puis gauche", "libre", 1),
    ],
  },

  /* ---------------- MOBILITÉ ---------------- */
  {
    id: "m-hanche", cat: "mobilite", nom: "Routine hanche 10'", duree: 10, niveau: 1,
    resume: "À faire après une sortie ou le soir devant la télé.",
    pourquoi: "Garde la hanche mobile et les fessiers réveillés.",
    etapes: [
      st(90, "Posture 90/90, côté droit puis gauche", "libre", 1),
      st(90, "Étirement du pigeon, côté droit puis gauche", "libre", 1),
      st(60, "Pont fessier, montées lentes", "libre", 2),
      st(90, "Clamshell (coquillage), 30\" par côté × 3", "libre", 2),
      st(60, "Planche latérale, 30\" par côté", "libre", 2),
      st(90, "Fente basse avec étirement du psoas, côté droit puis gauche", "libre", 1),
      st(60, "Respiration allongée, jambes au mur", "libre", 1),
    ],
  },

  /* ---------------- EXPRESS ---------------- */
  {
    id: "e-cardio", cat: "express", nom: "Cardio express", duree: 25, niveau: 2,
    resume: "25' chrono, efficace.",
    pourquoi: "Une semaine pourrie ? 25' qui comptent : la semaine est tenue.",
    etapes: [
      st(5 * MIN, "Échauffement", "ellip", 2),
      ...rep(5, [[2 * MIN, "Fort", "ellip", 4], [1 * MIN, "Souple", "ellip", 2]]),
      st(5 * MIN, "Retour au calme", "velo", 1),
    ],
  },
  {
    id: "e-renfo", cat: "express", nom: "Renfo express", duree: 25, niveau: 2,
    resume: "Circuit 3 tours, l'essentiel.",
    pourquoi: "Garde le fil du renfo même quand tout déborde.",
    echauffement: "4' vélo",
    exos: [
      { n: "Presse une jambe", s: "3 tours × 10 / jambe", r: "enchaîne", c: "Droite d'abord." },
      { n: "Hip thrust", s: "3 tours × 12", r: "enchaîne", c: "" },
      { n: "Machine abducteurs", s: "3 tours × 15", r: "enchaîne", c: "" },
      { n: "Planche", s: "3 tours × 30\"", r: "1' entre les tours", c: "" },
    ],
  },
  {
    id: "e-footing", cat: "express", nom: "Footing express", duree: 25, niveau: 1,
    resume: "25' facile, n'importe où.",
    pourquoi: "Mieux que rien, et c'est déjà beaucoup.",
    etapes: [
      st(5 * MIN, "Trottiner", "course", 1),
      st(17 * MIN, "Footing facile", "course", 2),
      st(3 * MIN, "Marche", "course", 1),
    ],
  },
];

const FOCUS = [
  { id: "equilibre", nom: "Équilibre", emoji: "⚖️", aide: "Je suis le plan tel quel" },
  { id: "cardio", nom: "Cardio", emoji: "🫀", aide: "Envie de transpirer en salle" },
  { id: "renfo", nom: "Renfo", emoji: "🏋️", aide: "Priorité à la force" },
  { id: "cadence", nom: "Cadence", emoji: "👣", aide: "Petits pas rapides" },
  { id: "plat", nom: "Plat", emoji: "🛣️", aide: "Je travaille le roulant" },
  { id: "montee", nom: "Montée", emoji: "⛰️", aide: "Je veux grimper mieux" },
  { id: "chargee", nom: "Semaine chargée", emoji: "⏳", aide: "Le minimum qui compte" },
];

const BADGES = [
  { id: "premiere", nom: "C'est parti", emoji: "🚀", aide: "Première séance enregistrée" },
  { id: "plat1", nom: "Retour au plat", emoji: "🛣️", aide: "Première séance de plat" },
  { id: "serie3", nom: "3 semaines d'affilée", emoji: "🔥", aide: "3 semaines tenues de suite" },
  { id: "serie6", nom: "6 semaines d'affilée", emoji: "🔥🔥", aide: "6 semaines tenues de suite" },
  { id: "serie10", nom: "10 semaines d'affilée", emoji: "🏅", aide: "10 semaines tenues de suite" },
  { id: "km15", nom: "15 km", emoji: "🥉", aide: "Sortie de 15 km ou plus" },
  { id: "km20", nom: "20 km", emoji: "🥈", aide: "Sortie de 20 km ou plus" },
  { id: "km25", nom: "25 km", emoji: "🥇", aide: "Sortie de 25 km ou plus" },
  { id: "dplus5000", nom: "5 000 m D+", emoji: "🏔️", aide: "5 000 m de D+ cumulés" },
  { id: "cadence165", nom: "Cadence 165", emoji: "👣", aide: "Cadence moyenne de 165 ou plus sur le plat" },
  { id: "renfo10", nom: "10 renfos", emoji: "💪", aide: "10 séances de renfo" },
  { id: "equilibre", nom: "Jambes à égalité", emoji: "⚖️", aide: "Presse : droite à 95 % de la gauche ou plus" },
  { id: "express", nom: "Jamais zéro", emoji: "⚡", aide: "Une semaine sauvée par une séance express" },
  { id: "finisher", nom: "Finisher", emoji: "🏁", aide: "Course objectif terminée" },
  { id: "petits10", nom: "10 petits plus", emoji: "✨", aide: "10 exercices poids du corps cochés" },
  { id: "petits50", nom: "50 petits plus", emoji: "🌟", aide: "50 exercices poids du corps cochés" },
  { id: "petits100", nom: "100 petits plus", emoji: "💫", aide: "100 exercices poids du corps cochés" },
  { id: "ecurie", nom: "Coach de l'écurie", emoji: "🐴", aide: "5 exercices « spécial écurie » cochés" },
  { id: "cavaliere", nom: "Cavalière de fer", emoji: "🏇", aide: "30 points écurie" },
  { id: "ventre", nom: "Ventre de traileuse", emoji: "🍌", aide: "3 ravitos testés, ventre OK" },
  { id: "sommets5", nom: "Chasseuse de sommets", emoji: "⛰️", aide: "5 sommets ou lieux débloqués" },
  { id: "sommets15", nom: "Reine des Aspres", emoji: "👸", aide: "15 sommets ou lieux débloqués" },
  { id: "helena", nom: "Toit des Aspres", emoji: "🏔️", aide: "Mont Hélèna débloqué" },
  { id: "legende", nom: "Légende", emoji: "👑", aide: "Santa Anna dels Quatre Termes débloquée" },
];

/* ---------------- PETITS PLUS : exercices poids du corps à la carte ----------------
   Chaque exercice = une petite série complète. 🐴 = spécial écurie (botte de foin, seaux, barrière, marchepied du van). */
const GROUPES_PDC = [
  { id: "jambes", nom: "Jambes", emoji: "🦵" },
  { id: "fessiers", nom: "Fessiers & hanche", emoji: "🍑" },
  { id: "chevilles", nom: "Mollets & chevilles", emoji: "🦶" },
  { id: "gainage", nom: "Gainage", emoji: "🧱" },
  { id: "haut", nom: "Haut du corps", emoji: "💪" },
  { id: "cardio", nom: "Cardio", emoji: "🫀" },
  { id: "pilates", nom: "Pilates & mobilité", emoji: "🧘" },
];

const EXOS_PDC = [
  // Jambes
  { id: "squat", g: "jambes", n: "Squats", s: "3 × 15", c: "Poids sur les talons, fesses en arrière, dos droit." },
  { id: "squat-saute", g: "jambes", n: "Squats sautés", s: "3 × 10", c: "Réception souple et silencieuse. À éviter si la hanche tire." },
  { id: "squat-iso", g: "jambes", n: "Squat tenu en bas", s: "3 × 30\"", c: "Cuisses parallèles au sol, ça brûle, c'est normal." },
  { id: "fente-av", g: "jambes", n: "Fentes avant alternées", s: "3 × 10 / jambe", c: "Genou avant au-dessus de la cheville." },
  { id: "fente-ar", g: "jambes", n: "Fentes arrière", s: "3 × 10 / jambe", c: "Plus douce pour les genoux. Droite d'abord." },
  { id: "fente-lat", g: "jambes", n: "Fentes latérales", s: "3 × 8 / côté", c: "Jambe tendue bien à plat, fesses en arrière." },
  { id: "chaise", g: "jambes", n: "Chaise contre le mur du box 🐴", s: "3 × 40\"", c: "Dos collé au mur, cuisses à l'horizontale." },
  { id: "bulgare", g: "jambes", n: "Squat bulgare, pied sur une botte de foin 🐴", s: "3 × 8 / jambe", c: "Le meilleur exercice unilatéral. Droite d'abord." },
  { id: "step", g: "jambes", n: "Montées sur botte de foin ou marche 🐴", s: "3 × 12 / jambe", c: "Pousse avec la jambe du haut, comme en montée." },
  { id: "pistol", g: "jambes", n: "Squat une jambe en tenant la barrière 🐴", s: "3 × 5 / jambe", c: "La barrière t'aide juste un peu. Descends doucement." },
  { id: "step-down", g: "jambes", n: "Descentes de marche lentes 🐴", s: "3 × 10 / jambe", c: "Sur le marchepied du van : on prépare les descentes." },
  // Fessiers & hanche
  { id: "pont", g: "fessiers", n: "Pont fessier", s: "3 × 15", c: "Serre les fessiers 1\" en haut." },
  { id: "pont-1", g: "fessiers", n: "Pont fessier une jambe", s: "3 × 10 / jambe", c: "Bassin bien horizontal. Droite d'abord." },
  { id: "donkey", g: "fessiers", n: "Donkey kicks (ruade à quatre pattes)", s: "3 × 15 / jambe", c: "Talon vers le ciel, dos immobile." },
  { id: "hydrant", g: "fessiers", n: "Fire hydrant (genou sur le côté)", s: "3 × 12 / jambe", c: "Bassin immobile, monte le genou sur le côté." },
  { id: "clam", g: "fessiers", n: "Clamshell (coquillage)", s: "3 × 15 / côté", c: "Talons collés, ouvre le genou sans rouler en arrière." },
  { id: "abduction", g: "fessiers", n: "Abduction allongée sur le côté", s: "3 × 15 / côté", c: "Jambe tendue, pointe du pied vers le bas." },
  { id: "avion", g: "fessiers", n: "Avion de hanche, tenu à la barrière 🐴", s: "3 × 5 / jambe", c: "Sur une jambe, ouvre et ferme le bassin lentement. Top pour ta hanche." },
  { id: "rdl-1", g: "fessiers", n: "Bonne matinée sur une jambe", s: "3 × 10 / jambe", c: "Buste qui bascule, jambe arrière tendue, dos plat." },
  // Mollets & chevilles
  { id: "mollets", g: "chevilles", n: "Mollets sur le marchepied du van 🐴", s: "3 × 15", c: "Talons dans le vide, descends bas, monte haut." },
  { id: "mollets-1", g: "chevilles", n: "Mollets sur une jambe", s: "3 × 12 / jambe", c: "Descente lente sur 3\"." },
  { id: "equilibre", g: "chevilles", n: "Équilibre sur une jambe, yeux fermés", s: "3 × 30\" / jambe", c: "Moins d'entorses sur les cailloux." },
  { id: "talons", g: "chevilles", n: "Marche sur les talons puis sur les pointes", s: "2 × 20 pas chaque", c: "Réveille tout le pied." },
  { id: "corde", g: "chevilles", n: "Corde à sauter imaginaire", s: "3 × 40\"", c: "Petits rebonds rapides sur l'avant du pied." },
  // Gainage
  { id: "planche", g: "gainage", n: "Planche", s: "3 × 40\"", c: "Corps bien aligné, fesses ni trop hautes ni trop basses." },
  { id: "planche-lat", g: "gainage", n: "Planche latérale", s: "3 × 30\" / côté", c: "Bassin haut. Genou au sol si besoin." },
  { id: "deadbug", g: "gainage", n: "Dead bug", s: "3 × 10 / côté", c: "Bas du dos collé au sol." },
  { id: "birddog", g: "gainage", n: "Bird dog", s: "3 × 10 / côté", c: "Bras et jambe opposés, sans bouger le dos." },
  { id: "climbers", g: "gainage", n: "Mountain climbers", s: "3 × 30\"", c: "Genoux vers la poitrine, rapides." },
  { id: "superman", g: "gainage", n: "Superman", s: "3 × 12", c: "Allongée sur le ventre, lève bras et jambes 2\"." },
  { id: "commando", g: "gainage", n: "Planche commando", s: "3 × 8", c: "De la planche sur les coudes à la planche sur les mains." },
  { id: "hollow", g: "gainage", n: "Hollow hold (la barque)", s: "3 × 20\"", c: "Bas du dos collé au sol, bras et jambes tendus." },
  { id: "copenhague", g: "gainage", n: "Planche Copenhague, genou sur la botte 🐴", s: "3 × 15\" / côté", c: "Adducteurs et hanche : costaud mais très utile." },
  // Haut du corps
  { id: "pompes", g: "haut", n: "Pompes (sur les genoux si besoin)", s: "3 × 10", c: "Coudes à 45°, gainage serré." },
  { id: "pompes-incl", g: "haut", n: "Pompes inclinées sur la barrière 🐴", s: "3 × 12", c: "Plus c'est haut, plus c'est facile." },
  { id: "dips", g: "haut", n: "Dips sur une botte de foin 🐴", s: "3 × 10", c: "Coudes vers l'arrière, épaules basses." },
  { id: "seaux", g: "haut", n: "Porté de seaux d'eau 🐴", s: "3 × 40 m", c: "Un seau dans chaque main, épaules basses, gainage. Tu le fais déjà : compte-le !" },
  { id: "rowing", g: "haut", n: "Rowing avec un seau d'eau 🐴", s: "3 × 12 / bras", c: "Penchée, dos plat, tire le seau vers la hanche." },
  // Cardio
  { id: "jacks", g: "cardio", n: "Jumping jacks", s: "3 × 40\"", c: "Atterris sur l'avant du pied." },
  { id: "genoux", g: "cardio", n: "Montées de genoux", s: "3 × 30\"", c: "Bras actifs, comme en côte." },
  { id: "burpees", g: "cardio", n: "Burpees (avec ou sans pompe)", s: "3 × 8", c: "À ton rythme, mais propre." },
  { id: "skater", g: "cardio", n: "Sauts de patineur", s: "3 × 12", c: "D'une jambe sur l'autre, réception stable." },
  { id: "talons-fesses", g: "cardio", n: "Talons-fesses", s: "3 × 30\"", c: "Rapide et léger." },
  // Pilates & mobilité
  { id: "cent", g: "pilates", n: "Le cent (Pilates)", s: "1 × 100 frappes", c: "Jambes à 45°, bras qui frappent l'air, respiration 5/5." },
  { id: "rollup", g: "pilates", n: "Enroulé de colonne (roll-up)", s: "2 × 8", c: "Vertèbre par vertèbre, sans élan." },
  { id: "ciseaux", g: "pilates", n: "Ciseaux", s: "3 × 12", c: "Jambes tendues, bas du dos collé." },
  { id: "cercles", g: "pilates", n: "Cercles d'une jambe", s: "5 / sens / jambe", c: "Bassin immobile." },
  { id: "chat", g: "pilates", n: "Chat-vache", s: "1 × 10", c: "Lentement, avec la respiration." },
  { id: "pigeon", g: "pilates", n: "Pigeon (étirement de la hanche)", s: "1' / côté", c: "Respire dans l'étirement." },
  { id: "psoas", g: "pilates", n: "Fente basse, étirement du psoas", s: "45\" / côté", c: "Bassin en avant, fessier serré. Contre une barrière 🐴 si tu veux." },
  { id: "9090", g: "pilates", n: "Posture 90/90", s: "1' / côté", c: "Mobilité de hanche, buste droit." },
  { id: "rotation", g: "pilates", n: "Rotations thoraciques au sol", s: "10 / côté", c: "Allongée sur le côté, ouvre le bras comme un livre." },
];
