/* Coach Trail — plan et règles d'adaptation */

/* ---------- Dates (toujours en heure locale, format AAAA-MM-JJ) ---------- */
function isoDate(d) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), j = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${j}`;
}
function parseDate(s) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }
function today() { return isoDate(new Date()); }
function addDays(s, n) { const d = parseDate(s); d.setDate(d.getDate() + n); return isoDate(d); }
function mondayOf(s) { const d = parseDate(s); const w = (d.getDay() + 6) % 7; d.setDate(d.getDate() - w); return isoDate(d); }
function daysBetween(a, b) { return Math.round((parseDate(b) - parseDate(a)) / 86400000); }
function fmtDate(s, opts = { day: "numeric", month: "short" }) { return parseDate(s).toLocaleDateString("fr-FR", opts); }

/* ---------- Gabarit : indexé par le nombre de semaines avant la course ---------- */
const GABARIT = {
  0: { phase: "Semaine de course", f: 0, trail: null, note: "On garde des jambes vives, on dort, on mange bien. Profite !" },
  1: { phase: "Affûtage", f: 0.55, trail: "t-affutage", note: "Moins de volume, on garde le rythme. La fraîcheur se gagne maintenant." },
  2: { phase: "Récupération", f: 0.55, trail: "t-endurance", note: "Le corps assimile le gros bloc. Facile partout." },
  3: { phase: "Spécifique — pic", f: 1.0, trail: "t-specifique", note: "La plus longue sortie de la préparation. Teste tout ce que tu feras le jour J." },
  4: { phase: "Spécifique", f: 0.93, trail: "t-specifique", note: "Allure course sur le roulant, ravito testé." },
  5: { phase: "Spécifique", f: 0.82, trail: "t-montees", note: "On entre dans le dur : longue sortie + montées." },
  6: { phase: "Semaine allégée + test", f: 0.55, trail: "t-repere", note: "On souffle et on mesure : parcours repère chronométré.", test: true },
  7: { phase: "Développement", f: 0.75, trail: "t-montees", note: "Le volume monte, la force aussi." },
  8: { phase: "Développement", f: 0.68, trail: "t-endurance", note: "Sortie longue facile, on allonge." },
  9: { phase: "Développement", f: 0.6, trail: "t-montees", note: "Début du développement : montées toniques." },
  10: { phase: "Consolidation", f: 0.5, trail: "t-endurance", note: "On tient le socle sans pression." },
  11: { phase: "Consolidation", f: 0.53, trail: "t-endurance", note: "On garde le fil, même si la vie déborde." },
  12: { phase: "Semaine allégée + test", f: 0.45, trail: "t-repere", note: "Premier test repère : ta référence de départ.", test: true },
  13: { phase: "Reprise structurée", f: 0.53, trail: "t-endurance", note: "Endurance facile et retour du plat." },
  14: { phase: "Reprise structurée", f: 0.5, trail: "t-endurance", note: "On installe la régularité : 2 séances, chaque semaine." },
  15: { phase: "Reprise structurée", f: 0.46, trail: "t-endurance", note: "C'est parti ! Facile, régulier, plaisir." },
  base: { phase: "Construction", f: 0.46, trail: "t-endurance", note: "On construit le fond tranquillement." },
};

/* Séances de salle par phase : [cardio, renfo] alternés selon la semaine */
const SALLE_PAR_PHASE = {
  // Tes séances préférées (f-…) sont au cœur du plan, complétées par les autres
  "Reprise structurée": { cardio: ["f-moteur", "f-relances", "c-quatre"], renfo: ["r-unejambe", "r-fessiers"] },
  "Construction": { cardio: ["f-moteur", "f-relances", "c-pyramide"], renfo: ["r-unejambe", "r-fessiers"] },
  "Consolidation": { cardio: ["f-relances", "f-moteur", "c-quatre"], renfo: ["r-unejambe", "r-fonte"] },
  "Développement": { cardio: ["f-montagne", "f-trailindoor", "c-grandhuit"], renfo: ["r-fonte", "r-unejambe"] },
  "Spécifique": { cardio: ["f-circuit", "f-plusdure", "f-trailindoor"], renfo: ["r-explosif", "r-descente"] },
  "Spécifique — pic": { cardio: ["f-montagne"], renfo: ["r-descente"] },
  "Semaine allégée + test": { cardio: ["c-douce"], renfo: ["r-unejambe"] },
  "Récupération": { cardio: ["c-douce"], renfo: ["r-fessiers"] },
  "Affûtage": { cardio: ["c-pyramide"], renfo: ["r-fessiers"] },
  "Semaine de course": { cardio: ["e-cardio"], renfo: ["r-fessiers"] },
  "Récupération post-course": { cardio: ["c-douce"], renfo: ["r-fessiers"] },
  "Entretien": { cardio: ["f-relances", "f-moteur", "f-montagne", "f-trailindoor", "f-circuit", "f-plusdure"], renfo: ["r-unejambe", "r-fonte", "r-fessiers"] },
};
const PLATS = ["p-decouverte", "p-lampadaires", "p-cadence", "p-lignes", "p-progressif"];

function seance(id) { return SEANCES.find((s) => s.id === id); }
function round50(x) { return Math.round(x / 50) * 50; }
function weekNumber(monday) { return Math.floor(daysBetween("2024-01-01", monday) / 7); }

/* ---------- Historique ---------- */
function logsEntre(S, debut, finExcl) { return S.logs.filter((l) => l.date >= debut && l.date < finExcl); }
function petitsEntre(S, debut, finExcl) { return (S.petits || []).filter((p) => p.date >= debut && p.date < finExcl); }
// Une semaine est tenue avec au moins une séance, OU au moins 5 petits plus
const PETITS_POUR_TENIR = 5;
function semaineTenue(S, monday) {
  const fin = addDays(monday, 7);
  return logsEntre(S, monday, fin).length > 0 || petitsEntre(S, monday, fin).length >= PETITS_POUR_TENIR;
}
function serie(S) {
  let m = mondayOf(today());
  if (!semaineTenue(S, m)) m = addDays(m, -7);
  let n = 0;
  while (semaineTenue(S, m)) { n++; m = addDays(m, -7); }
  return n;
}
function dernierRetourHanche(S, monday) {
  const recents = S.logs.filter((l) => l.date < addDays(monday, 7) && l.date >= addDays(monday, -10) && l.hanche != null && l.hanche !== "")
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  return recents;
}

/* ---------- Objectif de la semaine ---------- */
function objectifPour(S, monday) {
  const futurs = S.objectifs.filter((o) => mondayOf(o.date) >= monday).sort((a, b) => (a.date < b.date ? -1 : 1));
  if (futurs.length) return { obj: futurs[0], apres: false };
  const passes = S.objectifs.filter((o) => mondayOf(o.date) < monday).sort((a, b) => (a.date < b.date ? 1 : -1));
  if (passes.length) return { obj: passes[0], apres: true };
  return { obj: null, apres: false };
}

/* ---------- Le plan d'une semaine, adapté ---------- */
function planSemaine(S, monday) {
  const focus = (S.semaines[monday] && S.semaines[monday].focus) || "equilibre";
  const { obj, apres } = objectifPour(S, monday);
  let g, wr = null;
  const alertes = [];

  if (!obj) {
    g = { phase: "Entretien", f: 0, trail: "t-endurance", note: "Ajoute un objectif dans Réglages pour que je construise ton plan." };
  } else if (apres) {
    const depuis = Math.floor(daysBetween(mondayOf(obj.date), monday) / 7);
    g = depuis <= 2
      ? { phase: "Récupération post-course", f: 0.4, trail: "t-endurance", note: "Bravo ! On récupère : facile, et seulement si l'envie est là." }
      : { phase: "Entretien", f: 0.5, trail: "t-endurance", note: "Entre deux objectifs : on entretient le fond et la force. Ajoute ton prochain défi !" };
  } else {
    wr = Math.round(daysBetween(monday, mondayOf(obj.date)) / 7);
    g = GABARIT[wr] || GABARIT.base;
  }

  // Sortie longue cible
  const ref = obj || { km: 33, dplus: 1200 };
  const pic = Math.round(ref.km * 0.85);
  const ratio = ref.dplus / ref.km;
  let km = Math.max(6, Math.round(pic * g.f));

  // Adaptation à l'historique
  const trails21 = S.logs.filter((l) => l.cat === "trail" && l.km && l.date >= addDays(monday, -21) && l.date < monday);
  const meilleure = trails21.reduce((m, l) => Math.max(m, Number(l.km) || 0), 0);
  const avant = S.logs.filter((l) => l.date < monday);
  const rien14 = avant.length > 0 && !avant.some((l) => l.date >= addDays(monday, -14));
  let retour = false;
  if (wr !== 0) {
    if (meilleure > 0 && km > meilleure + 3) {
      km = Math.round(meilleure + 3);
      alertes.push({ niv: "info", txt: `Sortie longue plafonnée à ${km} km : on monte par paliers de 3 km max depuis ta dernière plus longue (${meilleure} km).` });
    }
    if (rien14) {
      retour = true;
      km = Math.min(km, 10);
      alertes.push({ niv: "info", txt: "Semaine de retour : rien depuis 2 semaines, et ce n'est pas grave. On reprend en douceur, sans rattraper." });
    }
  }
  let dplus = round50(km * ratio * 1.15);

  // Choix des séances de salle
  const p = SALLE_PAR_PHASE[g.phase] || SALLE_PAR_PHASE["Entretien"];
  const n = weekNumber(monday);
  const cardioId = p.cardio[n % p.cardio.length];
  const renfoId = p.renfo[n % p.renfo.length];
  let salleType = n % 2 === 0 ? "renfo" : "cardio";
  if (focus === "cardio") salleType = "cardio";
  if (focus === "renfo") salleType = "renfo";
  let salleId = salleType === "cardio" ? cardioId : renfoId;
  if (focus === "montee" && salleType === "cardio") salleId = "c-escaliers";
  let trailId = g.trail;
  if (focus === "montee" && trailId === "t-endurance") trailId = "t-montees";

  const platId = focus === "cadence" ? "p-cadence" : PLATS[n % PLATS.length];

  // Hanche
  const hanches = dernierRetourHanche(S, monday);
  const h1 = hanches[0] ? Number(hanches[0].hanche) : 0;
  const h2 = hanches[1] ? Number(hanches[1].hanche) : 0;
  let hanche = "ok";
  if (h1 >= 6 || (h1 >= 4 && h2 >= 4)) hanche = "rouge";
  else if (h1 >= 4) hanche = "orange";

  // Fatigue
  const derniers = [...S.logs].filter((l) => l.date >= addDays(monday, -7)).sort((a, b) => (a.date < b.date ? 1 : -1));
  const fatigue = derniers[0] && Number(derniers[0].fatigue) >= 8;

  // Composition
  const socle = [];
  const bonus = [];
  const slotSalle = { role: "Salle", cats: ["cardio", "renfo", "express"], id: salleId };
  const slotTrail = trailId ? { role: "Sortie du week-end", cats: ["trail", "vtt"], id: trailId, km, dplus } : null;

  if (focus === "chargee") {
    socle.push({ role: "Salle express", cats: ["cardio", "renfo", "express"], id: salleType === "cardio" ? "e-cardio" : "e-renfo" });
    if (slotTrail) {
      slotTrail.km = Math.max(6, Math.round(km * 0.7));
      slotTrail.dplus = round50(slotTrail.km * ratio * 1.15);
      if (trailId !== "t-repere") slotTrail.id = "t-endurance";
      socle.push(slotTrail);
    }
    alertes.push({ niv: "info", txt: "Semaine chargée : le minimum qui compte. Une seule séance express et ta semaine est tenue." });
  } else {
    socle.push(slotSalle);
    if (slotTrail) socle.push(slotTrail);
    bonus.push({ role: focus === "plat" || focus === "cadence" ? "Bonus ⭐ prioritaire" : "Bonus", cats: ["plat", "express"], id: platId });
    bonus.push({ role: "Bonus", cats: ["cardio", "renfo"], id: salleType === "cardio" ? renfoId : cardioId });
    bonus.push({ role: "Bonus si beau temps", cats: ["vtt"], id: "v-balade" });
  }
  bonus.push({ role: "Entretien", cats: ["mobilite"], id: "m-hanche" });

  if (wr === 0) {
    socle.length = 0;
    socle.push({ role: "Mardi ou mercredi", cats: ["cardio", "express", "renfo"], id: "e-cardio" });
    socle.push({ role: "Jeudi", cats: ["plat", "express"], id: "p-lignes" });
    socle.push({ role: "🏁 Dimanche", cats: ["trail"], id: null, course: true, km: obj.km, dplus: obj.dplus, nom: obj.nom });
    bonus.length = 0;
    bonus.push({ role: "Entretien", cats: ["mobilite"], id: "m-hanche" });
  }

  if (hanche === "orange") {
    alertes.push({ niv: "orange", txt: `Hanche à ${h1}/10 : séance allégée. Descentes en marchant, salle en endurance douce.` });
    [...socle, ...bonus].forEach((s) => { if (seance(s.id)?.cat === "cardio") s.id = "c-douce"; });
    const i = bonus.findIndex((b) => b.cats.includes("plat")); if (i >= 0) bonus.splice(i, 1);
  }
  if (hanche === "rouge") {
    alertes.push({ niv: "rouge", txt: `Hanche à ${h1}/10${h2 >= 4 ? " (deux fois de suite)" : ""} : pause course cette semaine. Vélo, elliptique et VTT seulement. Si ça persiste, prends rendez-vous chez le kiné.` });
    socle.forEach((s) => {
      if (s.cats.includes("trail") && !s.course) { s.id = "v-balade"; s.role = "Remplace la sortie"; s.km = null; s.dplus = null; }
      if (seance(s.id)?.cat === "cardio" || seance(s.id)?.cat === "renfo") s.id = "c-douce";
    });
    for (let i = bonus.length - 1; i >= 0; i--) if (bonus[i].cats.includes("plat")) bonus.splice(i, 1);
  }
  // Grosse journée à l'écurie aujourd'hui ou hier (semaine en cours seulement)
  if (monday === mondayOf(today())) {
    const grosse = (S.ecurie || []).find((x) => x.niv === 3 && (x.date === today() || x.date === addDays(today(), -1)));
    if (grosse) alertes.push({ niv: "orange", txt: `Grosse journée à l'écurie ${grosse.date === today() ? "aujourd'hui" : "hier"} 🐴 : ton corps a déjà bossé. Si tu t'entraînes, prends la version courte (express) ou la routine hanche.` });
  }
  if (fatigue && focus !== "chargee") {
    alertes.push({ niv: "orange", txt: "Grosse fatigue à ton dernier retour : on oublie les bonus cette semaine, le socle suffit." });
    bonus.splice(0, bonus.length, ...bonus.filter((b) => b.cats.includes("mobilite")));
  }

  // Coche les créneaux faits
  const faits = logsEntre(S, monday, addDays(monday, 7));
  const libres = [...faits];
  [...socle, ...bonus].forEach((slot) => {
    let i = libres.findIndex((l) => l.sessionId && l.sessionId === slot.id);
    if (i < 0) i = libres.findIndex((l) => slot.cats.includes(l.cat));
    if (i >= 0) { slot.fait = libres[i]; libres.splice(i, 1); }
  });

  return { monday, focus, obj, wr, phase: g.phase, note: g.note, km, dplus, socle, bonus, alertes, hanche, retour, extras: libres, test: !!g.test };
}

/* ---------- Badges ---------- */
function calculerBadges(S) {
  const L = S.logs;
  const got = {};
  const by = (cat) => L.filter((l) => l.cat === cat);
  if (L.length) got.premiere = true;
  if (by("plat").length) got.plat1 = true;
  // plus longue série jamais faite
  const P = S.petits || [];
  if (P.length >= 10) got.petits10 = true;
  if (P.length >= 50) got.petits50 = true;
  if (P.length >= 100) got.petits100 = true;
  if (P.filter((p) => (EXOS_PDC.find((e) => e.id === p.exo) || { n: "" }).n.includes("🐴")).length >= 5) got.ecurie = true;
  const mondays = [...new Set([...L.map((l) => l.date), ...P.map((p) => p.date)].map(mondayOf))].filter((m) => semaineTenue(S, m)).sort();
  let best = 0, cur = 0, prev = null;
  mondays.forEach((m) => { cur = prev && addDays(prev, 7) === m ? cur + 1 : 1; best = Math.max(best, cur); prev = m; });
  if (best >= 3) got.serie3 = true;
  if (best >= 6) got.serie6 = true;
  if (best >= 10) got.serie10 = true;
  const maxKm = L.filter((l) => l.cat === "trail").reduce((m, l) => Math.max(m, Number(l.km) || 0), 0);
  if (maxKm >= 15) got.km15 = true;
  if (maxKm >= 20) got.km20 = true;
  if (maxKm >= 25) got.km25 = true;
  if (L.reduce((s, l) => s + (Number(l.dplus) || 0), 0) >= 5000) got.dplus5000 = true;
  if (L.some((l) => l.cat === "plat" && Number(l.cadence) >= 165)) got.cadence165 = true;
  if (by("renfo").length + L.filter((l) => l.sessionId === "e-renfo").length >= 10) got.renfo10 = true;
  if (L.some((l) => Number(l.presseD) && Number(l.presseG) && Number(l.presseD) >= 0.95 * Number(l.presseG))) got.equilibre = true;
  if (((S.charges || {})["presse-1"] || []).some((c) => c.d && c.g && c.d >= 0.95 * c.g)) got.equilibre = true;
  // semaine sauvée par une express : semaine où la seule séance est express
  const parSem = {};
  L.forEach((l) => { const m = mondayOf(l.date); (parSem[m] = parSem[m] || []).push(l); });
  if (Object.values(parSem).some((ls) => ls.length === 1 && ls[0].cat === "express")) got.express = true;
  if (L.some((l) => l.course)) got.finisher = true;
  if (L.filter((l) => l.ventre === "ok").length >= 3) got.ventre = true;
  if ((S.ecurie || []).reduce((a, x) => a + x.niv, 0) >= 30) got.cavaliere = true;
  const nbSommets = Object.keys(S.sommets || {}).length;
  if (nbSommets >= 5) got.sommets5 = true;
  if (nbSommets >= 15) got.sommets15 = true;
  if ((S.sommets || {}).helena) got.helena = true;
  if ((S.sommets || {}).santaanna) got.legende = true;
  return got;
}

/* ---------- Jauge de préparation ---------- */
function jauge(S) {
  const { obj } = objectifPour(S, mondayOf(today()));
  if (!obj) return null;
  const debut = S.debut || mondayOf(today());
  const semaines = Math.max(1, Math.floor(daysBetween(debut, mondayOf(today())) / 7) + 1);
  let tenues = 0;
  for (let i = 0; i < semaines; i++) if (semaineTenue(S, addDays(debut, i * 7))) tenues++;
  // la régularité se remplit semaine après semaine jusqu'à la course
  const total = Math.max(semaines, Math.floor(daysBetween(debut, mondayOf(obj.date)) / 7) + 1);
  const reg = tenues / total;
  const pic = Math.round(obj.km * 0.85);
  const maxKm = S.logs.filter((l) => l.cat === "trail" && l.date >= debut).reduce((m, l) => Math.max(m, Number(l.km) || 0), 0);
  const fond = Math.min(1, maxKm / pic);
  return { pct: Math.round((reg * 0.5 + fond * 0.5) * 100), reg, fond, maxKm, pic, tenues, semaines, total };
}
