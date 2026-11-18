/* Coach Trail — le PROGRAMME IDÉAL : ce qu'il faudrait faire, jour par jour, pour performer le jour J.
   Le « socle » reste le minimum qui compte ; ici, c'est la préparation complète (4 à 5 séances par semaine).
   Indexé par le nombre de semaines avant la course (15 = première semaine, 0 = semaine de course).
   Les sorties longues (SL) prennent la distance du plan (85 % de la course au pic). */

const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const R = (note = "Repos complet. Le progrès se fait pendant la récupération.") => ({ repos: true, note });
const X = (id, note = "") => ({ id, note });
const SL = (id, note = "") => ({ id, note, sl: true });

const PROGRAMME = {
  15: [R(), X("p-lignes", "Footing facile + 6 lignes droites : on remet du plat"), X("r-unejambe"), X("f-moteur"), R("Repos, ou quelques petits plus à l'écurie"), SL("t-endurance"), X("v-balade", "VTT 1h facile, ou repos")],
  14: [R(), X("p-cadence"), X("r-fessiers"), X("f-relances"), R("Repos, ou petits plus"), SL("t-endurance"), X("p-decouverte", "Footing de récupération, 35-40' très facile")],
  13: [R(), X("t-cotes-courtes"), X("r-unejambe"), X("f-moteur"), R("Repos, ou petits plus"), SL("t-endurance"), X("v-balade", "VTT 1h facile, ou footing 40'")],
  12: [R(), X("p-lignes", "35' facile + lignes droites"), X("r-fessiers", "Version légère : 2 séries au lieu de 3"), R("Repos : semaine allégée"), X("m-hanche"), SL("t-repere", "TEST : ton parcours repère, chronométré"), X("p-decouverte", "30' très facile")],
  11: [R(), X("p-lampadaires"), X("r-fonte"), X("f-montagne"), R("Repos, ou petits plus"), SL("t-endurance"), X("p-decouverte", "Footing 45' facile")],
  10: [R(), X("p-progressif"), X("r-unejambe"), X("c-douce"), R("Repos"), SL("t-endurance"), R("Repos : profite des fêtes 🎄")],
  9: [R(), X("t-cotes-longues"), X("r-fonte"), X("f-trailindoor"), R("Repos, ou petits plus"), SL("t-montees"), X("v-balade", "VTT 1h30 facile")],
  8: [R(), X("p-progressif"), X("r-unejambe"), X("f-montagne"), R("Repos, ou petits plus"), SL("t-endurance"), X("p-decouverte", "Footing 45' facile")],
  7: [R(), X("t-cotes-longues"), X("r-fonte"), X("c-grandhuit"), R("Repos, ou petits plus"), SL("t-montees"), X("v-balade", "VTT 1h30 facile, ou footing 45'")],
  6: [R(), X("p-lignes", "35' facile + lignes droites"), X("r-fessiers", "Version légère : 2 séries au lieu de 3"), R("Repos : semaine allégée"), X("m-hanche"), SL("t-repere", "TEST : ton parcours repère. Compare avec le premier !"), X("p-decouverte", "40' facile")],
  5: [R(), X("p-seuil"), X("r-explosif"), X("f-circuit"), R("Repos, ou petits plus"), SL("t-montees"), X("p-decouverte", "Footing de récupération 40'")],
  4: [R(), X("t-cotes-longues"), X("r-descente"), X("f-plusdure"), R("Repos, ou petits plus"), SL("t-specifique", "Teste ton ravito du jour J"), X("v-balade", "VTT 1h facile, ou repos")],
  3: [R(), X("p-progressif"), X("r-explosif"), X("f-montagne", "Version courte : 5 blocs au lieu de 7"), R("Repos"), SL("t-specifique", "RÉPÉTITION GÉNÉRALE : tenue, chaussures, sac et ravito du jour J"), R("Repos : tu l'as bien mérité")],
  2: [R(), X("p-decouverte", "Footing 40' facile"), X("r-fessiers"), X("c-douce"), R("Repos"), SL("t-endurance", "Facile, pour le plaisir"), R("Repos")],
  1: [R(), X("p-seuil", "Version courte : 2 × 10'"), X("r-fessiers", "Léger : 2 séries, pas de fatigue"), X("p-lignes"), R("Repos"), SL("t-affutage"), R("Repos")],
  0: [R("Repos"), X("e-cardio", "Activation : 25' sans forcer"), X("p-lignes", "Footing 25' + 4 lignes droites"), R("Repos"), X("m-hanche", "15' de trottinage + routine hanche"), R("Repos : prépare ton sac (checklist Jour J) et dors bien"), { course: true, note: "C'EST LE JOUR J ! 🏁" }],
};

// Le programme idéal d'une semaine, ou null si la semaine est hors préparation
function programmeSemaine(S, monday) {
  const { obj, apres } = objectifPour(S, monday);
  if (!obj || apres) return null;
  const wr = Math.round(daysBetween(monday, mondayOf(obj.date)) / 7);
  const jours = PROGRAMME[wr];
  if (!jours) return null;
  const g = GABARIT[wr] || GABARIT.base;
  const pic = Math.round(obj.km * 0.85);
  const km = Math.max(6, Math.round(pic * g.f));
  const dplus = round50(km * (obj.dplus / obj.km) * 1.15);
  const liste = jours.map((j, i) => {
    const date = addDays(monday, i);
    const faits = S.logs.filter((l) => l.date === date);
    return { ...j, date, jour: JOURS[i], km: j.sl ? km : null, dplus: j.sl ? dplus : null, faits, obj };
  });
  const nbSeances = jours.filter((j) => !j.repos).length;
  return { wr, phase: g.phase, note: g.note, jours: liste, nbSeances, obj };
}

function jourProgHtml(j, compact) {
  const auj = j.date === today();
  const s = j.id ? seance(j.id) : null;
  const emoji = j.course ? "🏁" : j.repos ? "😴" : catInfo(s ? s.cat : "").emoji;
  const titre = j.course ? esc(j.obj.nom) : j.repos ? "Repos" : s ? esc(s.nom) : "";
  const detail = [j.sl && j.km ? `${j.km} km · ~${j.dplus} m D+` : "", s && s.etapes ? dureeTxt(totalEtapes(s)) : s && s.duree ? `${s.duree}'` : ""].filter(Boolean).join(" · ");
  const fait = j.faits.length ? `✅ ${j.faits.map((l) => esc(l.nom)).join(", ")}` : "";
  const lien = j.course ? "#jourj" : s ? `#seance/${s.id}${j.sl ? `?km=${j.km}&dplus=${j.dplus}` : ""}` : null;
  const contenu = `<div style="width:74px;flex:none"><b style="${auj ? "color:var(--orange)" : ""}">${j.jour.slice(0, 3)}. ${fmtDate(j.date, { day: "numeric" })}</b>${auj ? `<div class="pill orange" style="margin-top:2px">aujourd'hui</div>` : ""}</div>
    <div style="font-size:1.3rem;width:28px;flex:none">${emoji}</div>
    <div class="grow"><b>${titre}</b>${detail ? `<span class="muted"> · ${detail}</span>` : ""}
      ${j.note && (!compact || !j.repos) ? `<div class="muted">${esc(j.note)}</div>` : ""}
      ${fait ? `<div class="conseil">${fait}</div>` : ""}</div>`;
  const style = `display:flex;gap:8px;align-items:flex-start;padding:9px 0;border-bottom:1px solid var(--line);text-decoration:none;color:inherit;${auj ? "background:var(--orange-2);margin:0 -10px;padding:9px 10px;border-radius:10px;" : ""}`;
  return lien ? `<a href="${lien}" style="${style}">${contenu}</a>` : `<div style="${style}">${contenu}</div>`;
}

function programmeCarte(monday, ouvert = true) {
  const PG = programmeSemaine(S, monday);
  if (!PG) return "";
  const faits = PG.jours.filter((j) => !j.repos && j.faits.length).length;
  return `<details class="card" ${ouvert ? "open" : ""} style="border:2px solid var(--violet)">
    <summary><span style="font-size:1.05rem">🎯 Le programme idéal</span> <span class="muted">· ${PG.nbSeances} séances${faits ? ` · ${faits} faite${faits > 1 ? "s" : ""}` : ""}</span></summary>
    <p class="muted" style="margin:8px 0 4px">Ce qu'il faudrait faire cette semaine pour performer. Le socle reste ton minimum ; ici, c'est la version complète. Fais ce que tu peux, sans culpabiliser.</p>
    ${PG.jours.map((j) => jourProgHtml(j, true)).join("")}
    <a href="#programme" class="muted" style="display:block;margin-top:10px">Voir tout le programme jusqu'à la course ›</a>
  </details>`;
}

function vProgramme() {
  const { obj, apres } = objectifPour(S, mondayOf(today()));
  if (!obj || apres) { $app.innerHTML = `<h1>🎯 Programme</h1><p class="muted">Ajoute un objectif dans Réglages.</p>`; return; }
  const derniere = mondayOf(obj.date);
  const lundis = [];
  for (let wr = 15; wr >= 0; wr--) lundis.push(addDays(derniere, -7 * wr));
  const courant = mondayOf(today());
  $app.innerHTML = `<a class="retour-haut" href="javascript:history.back()">‹ Retour</a>
    <h1>🎯 Le programme idéal</h1>
    <p class="muted">Ta préparation complète pour ${esc(obj.nom)} : 16 semaines, jour par jour. Touche une séance pour l'ouvrir.</p>
    <div class="alerte info"><b>Comment l'utiliser :</b> le <b>socle</b> de l'onglet Semaine, c'est ce qui compte vraiment avec ta vie actuelle. Le <b>programme idéal</b>, c'est ce que ferait une traileuse avec plus de temps. Chaque séance en plus te rapproche de lui.</div>
    ${lundis.map((m, i) => {
      const PG = programmeSemaine(S, m);
      if (!PG) return "";
      const passee = m < courant, cette = m === courant;
      const sl = PG.jours.find((j) => j.sl);
      return `<details class="card" ${cette ? "open" : ""} style="${cette ? "border:2px solid var(--violet)" : passee ? "opacity:.7" : ""}">
        <summary><b>Semaine ${i + 1}</b> <span class="muted">· ${fmtDate(m)} → ${fmtDate(addDays(m, 6))}</span>${cette ? ` <span class="pill">cette semaine</span>` : ""}
          <div class="muted" style="font-weight:400;margin-top:2px">${esc(PG.phase)} · ${PG.nbSeances} séances${sl ? ` · sortie longue ${sl.km} km` : ""}</div></summary>
        <p class="muted" style="margin:8px 0 2px">${esc(PG.note)}</p>
        ${PG.jours.map((j) => jourProgHtml(j, false)).join("")}
      </details>`;
    }).join("")}`;
}

// Ce que dit le programme idéal pour aujourd'hui
function programmeAujourdhui() {
  const PG = programmeSemaine(S, mondayOf(today()));
  if (!PG) return null;
  return PG.jours.find((j) => j.date === today()) || null;
}
