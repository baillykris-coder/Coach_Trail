/* Coach Trail — ravitaillement, prédiction de chrono, jour J, écurie, import Garmin, chasse aux sommets.
   Chargé avant app.js : les fonctions utilisent l'état S et les outils d'app.js au moment où elles sont appelées. */

/* =====================================================================
   CHASSE AUX SOMMETS — coordonnées OpenStreetMap (relevées le 15/11/2026)
   r : rayon de validation en mètres · rare : 1 lieu, 2 sommet, 3 grand sommet, 4 légende
   ===================================================================== */
const SOMMETS = [
  { id: "thuir", nom: "Thuir, ligne de départ", lat: 42.63452, lon: 2.75745, alt: 100, r: 300, rare: 1, txt: "Là où tout commence le 7 mars." },
  { id: "castelnou", nom: "Château vicomtal de Castelnou", lat: 42.61874, lon: 2.70282, alt: 220, r: 200, rare: 1, txt: "Ton camp de base." },
  { id: "stecolombe", nom: "Sainte-Colombe-de-la-Commanderie", lat: 42.61460, lon: 2.74742, alt: 170, r: 300, rare: 1, txt: "Le village des sorties du midi." },
  { id: "camelas", nom: "Camélas", lat: 42.62974, lon: 2.68359, alt: 270, r: 300, rare: 1, txt: "Sur le parcours de l'ancienne 66 GTA." },
  { id: "bellecroze", nom: "Bellecroze", lat: 42.64093, lon: 2.68441, alt: 240, r: 300, rare: 1, txt: "Ancien ravito de la 66 GTA." },
  { id: "caixas", nom: "Caixas", lat: 42.58285, lon: 2.68299, alt: 470, r: 300, rare: 1, txt: "Village perché, ancien ravito de la 66." },
  { id: "montauriol", nom: "Château de Montauriol", lat: 42.56167, lon: 2.70315, alt: 330, r: 200, rare: 1, txt: "Ruines au sud des Aspres." },
  { id: "fontcanta", nom: "Font del Canta", lat: 42.65086, lon: 2.65494, alt: 250, r: 200, rare: 1, txt: "Une source, un secret." },
  { id: "mallorca", nom: "Roc de Mallorca", lat: 42.61604, lon: 2.70550, alt: 448, r: 150, rare: 2, txt: "Le rocher au-dessus de Castelnou." },
  { id: "gli", nom: "Serrat d'en Gli", lat: 42.61193, lon: 2.69403, alt: 439, r: 150, rare: 2, txt: "Crête de Castelnou." },
  { id: "peiro", nom: "el Peiró", lat: 42.61443, lon: 2.68894, alt: 458, r: 150, rare: 2, txt: "" },
  { id: "mila", nom: "Serrat de la Mila", lat: 42.61709, lon: 2.69765, alt: 364, r: 150, rare: 2, txt: "" },
  { id: "boscnegre", nom: "Puig del Bosc Negre", lat: 42.62753, lon: 2.65596, alt: 449, r: 150, rare: 2, txt: "Le bois noir." },
  { id: "calcina", nom: "la Calcina", lat: 42.64404, lon: 2.64291, alt: 469, r: 150, rare: 2, txt: "" },
  { id: "montou", nom: "Montou", lat: 42.65367, lon: 2.68037, alt: 292, r: 150, rare: 2, txt: "" },
  { id: "teixoneres", nom: "les Teixoneres", lat: 42.60817, lon: 2.72119, alt: 302, r: 150, rare: 2, txt: "Le coin des blaireaux." },
  { id: "esteva", nom: "Puig d'Esteva", lat: 42.58895, lon: 2.66528, alt: 521, r: 150, rare: 2, txt: "" },
  { id: "torrer", nom: "Torrer Blanc", lat: 42.54936, lon: 2.72690, alt: 511, r: 150, rare: 2, txt: "" },
  { id: "montagut", nom: "Montagut", lat: 42.55794, lon: 2.71307, alt: 422, r: 150, rare: 2, txt: "" },
  { id: "puigmila", nom: "Puig de Mila", lat: 42.59633, lon: 2.63174, alt: 605, r: 150, rare: 3, txt: "" },
  { id: "candell", nom: "Puig de Candell", lat: 42.60140, lon: 2.63332, alt: 691, r: 150, rare: 3, txt: "" },
  { id: "boc", nom: "Puig de Boc", lat: 42.60205, lon: 2.64923, alt: 695, r: 150, rare: 3, txt: "Sur l'ancienne 66 GTA." },
  { id: "valls", nom: "Puig d'en Valls", lat: 42.56839, lon: 2.65279, alt: 722, r: 150, rare: 3, txt: "" },
  { id: "helena", nom: "Mont Hélèna", lat: 42.57736, lon: 2.66374, alt: 775, r: 150, rare: 3, txt: "Le toit des Aspres, sur l'ancienne 66 GTA." },
  { id: "santaanna", nom: "Santa Anna dels Quatre Termes", lat: 42.56514, lon: 2.56117, alt: 1348, r: 200, rare: 4, txt: "La légende : là où quatre communes se rejoignent." },
];
const RARETE = { 1: { nom: "Lieu", e: "📍" }, 2: { nom: "Sommet", e: "⛰️" }, 3: { nom: "Grand sommet", e: "🏔️" }, 4: { nom: "Légende", e: "👑" } };

function distM(a, b, c, d) {
  const R = 6371000, toR = Math.PI / 180;
  const dLat = (c - a) * toR, dLon = (d - b) * toR;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a * toR) * Math.cos(c * toR) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
// Renvoie les sommets nouvellement débloqués par une trace [[lat,lon],...]
function sommetsDeTrace(trace, date) {
  const neufs = [];
  S.sommets = S.sommets || {};
  SOMMETS.forEach((p) => {
    if (S.sommets[p.id]) return;
    if (trace.some(([la, lo]) => distM(la, lo, p.lat, p.lon) <= p.r)) { S.sommets[p.id] = date; neufs.push(p); }
  });
  return neufs;
}

function vSommets() {
  S.sommets = S.sommets || {};
  const nb = SOMMETS.filter((p) => S.sommets[p.id]).length;
  // mini-carte : projection simple lat/lon → svg
  const lats = SOMMETS.map((p) => p.lat), lons = SOMMETS.map((p) => p.lon);
  const [la0, la1, lo0, lo1] = [Math.min(...lats) - 0.01, Math.max(...lats) + 0.01, Math.min(...lons) - 0.01, Math.max(...lons) + 0.01];
  const W = 340, H = Math.round(W * ((la1 - la0) / ((lo1 - lo0) * Math.cos(42.6 * Math.PI / 180))));
  const xy = (p) => [((p.lon - lo0) / (lo1 - lo0)) * W, H - ((p.lat - la0) / (la1 - la0)) * H];
  const carte = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;background:var(--violet-2);border-radius:14px">
    ${SOMMETS.map((p) => { const [x, y] = xy(p); const ok = S.sommets[p.id];
      return `<g><circle cx="${x}" cy="${y}" r="${p.rare >= 3 ? 7 : 5}" fill="${ok ? "var(--orange)" : "var(--card)"}" stroke="${ok ? "var(--orange)" : "var(--muted)"}" stroke-width="2"/>
      ${["helena", "boc", "castelnou", "thuir", "caixas", "santaanna", "valls"].includes(p.id) ? `<text x="${x + 9}" y="${y + 4}" font-size="10" fill="var(--ink)">${esc(p.nom.replace("Château vicomtal de ", "").replace(", ligne de départ", ""))}</text>` : ""}</g>`; }).join("")}
  </svg>`;
  const ligne = (p) => `<div class="card slot ${S.sommets[p.id] ? "fait" : ""}"><div class="ico">${S.sommets[p.id] ? RARETE[p.rare].e : "🔒"}</div>
    <div class="grow"><h3>${esc(p.nom)}</h3><div class="muted">${RARETE[p.rare].nom}${p.alt ? ` · ${p.alt} m` : ""}${p.txt ? " · " + esc(p.txt) : ""}</div>
    ${S.sommets[p.id] ? `<div class="conseil">Débloqué le ${fmtDate(S.sommets[p.id], { day: "numeric", month: "long", year: "numeric" })}</div>` : ""}</div></div>`;
  $app.innerHTML = `<a class="retour-haut" href="#accueil">‹ Accueil</a>
    <h1>🏔️ Chasse aux sommets</h1>
    <p class="muted">Les sommets et lieux mythiques des Aspres. Débloque-les en important tes sorties Garmin, ou en touchant « Je suis au sommet » quand tu y es.</p>
    <div class="card"><div class="row spread"><h3>${nb} / ${SOMMETS.length} débloqués</h3><span class="pill orange">${Math.round((nb / SOMMETS.length) * 100)} %</span></div>
      <div class="barre"><i style="width:${(nb / SOMMETS.length) * 100}%;background:var(--orange)"></i></div></div>
    ${carte}
    <button class="btn large orange" id="geo" style="margin-top:12px">📍 Je suis au sommet !</button>
    <p class="muted" id="geomsg" style="margin-top:6px">Ton téléphone vérifie ta position (rien n'est envoyé nulle part).</p>
    ${[4, 3, 2, 1].map((r) => `<h2>${RARETE[r].e} ${RARETE[r].nom}${r === 1 ? "x" : "s"}</h2>${SOMMETS.filter((p) => p.rare === r).map(ligne).join("")}`).join("")}`;
  document.getElementById("geo").onclick = () => {
    const msg = document.getElementById("geomsg");
    if (!navigator.geolocation) { msg.textContent = "Ton téléphone ne donne pas sa position."; return; }
    msg.textContent = "Recherche de ta position…";
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude: la, longitude: lo } = pos.coords;
      const proche = SOMMETS.map((p) => ({ p, d: distM(la, lo, p.lat, p.lon) })).sort((a, b) => a.d - b.d)[0];
      if (proche.d <= proche.p.r + Math.min(100, pos.coords.accuracy || 0)) {
        if (S.sommets[proche.p.id]) { msg.textContent = `Tu es bien à ${proche.p.nom}, déjà débloqué !`; return; }
        S.sommets[proche.p.id] = today(); save();
        const nv = verifierBadges();
        toast(`${RARETE[proche.p.rare].e} ${proche.p.nom} débloqué !${nv.length ? " 🏅 " + nv.map((b) => b.nom).join(", ") : ""}`, 4500);
        vSommets();
      } else {
        msg.textContent = `Le plus proche : ${proche.p.nom}, à ${proche.d >= 1000 ? (proche.d / 1000).toFixed(1).replace(".", ",") + " km" : Math.round(proche.d) + " m"}. Encore un effort !`;
      }
    }, () => { msg.textContent = "Position refusée ou introuvable. Autorise la localisation pour Coach Trail dans les réglages de l'iPhone."; }, { enableHighAccuracy: true, timeout: 15000 });
  };
}

/* =====================================================================
   IMPORT GARMIN — fichiers GPX ou TCX
   ===================================================================== */
async function lireSortie(file) {
  const txt = await file.text();
  const doc = new DOMParser().parseFromString(txt, "application/xml");
  const val = (el, nom) => { const x = el.getElementsByTagNameNS("*", nom)[0] || el.getElementsByTagName(nom)[0]; return x ? x.textContent : null; };
  let pts = [];
  const trkpts = doc.getElementsByTagName("trkpt");
  if (trkpts.length) {
    for (const p of trkpts) pts.push({ la: +p.getAttribute("lat"), lo: +p.getAttribute("lon"), ele: val(p, "ele"), t: val(p, "time"), hr: val(p, "hr"), cad: val(p, "cad") });
  } else {
    for (const p of doc.getElementsByTagNameNS("*", "Trackpoint")) {
      const la = val(p, "LatitudeDegrees");
      if (la == null) continue;
      pts.push({ la: +la, lo: +val(p, "LongitudeDegrees"), ele: val(p, "AltitudeMeters"), t: val(p, "Time"), hr: val(p, "Value"), cad: val(p, "RunCadence") });
    }
  }
  pts = pts.filter((p) => isFinite(p.la) && isFinite(p.lo));
  if (pts.length < 2) throw new Error("vide");
  let dist = 0;
  for (let i = 1; i < pts.length; i++) dist += distM(pts[i - 1].la, pts[i - 1].lo, pts[i].la, pts[i].lo);
  // D+ : altitude lissée sur 5 points, puis cumul des montées
  const eles = pts.map((p) => (p.ele != null ? +p.ele : null));
  let dplus = 0, prev = null;
  for (let i = 0; i < eles.length; i++) {
    const w = eles.slice(Math.max(0, i - 2), i + 3).filter((x) => x != null);
    if (!w.length) continue;
    const m = w.reduce((a, b) => a + b, 0) / w.length;
    if (prev != null && m > prev) dplus += m - prev;
    prev = m;
  }
  const t0 = pts[0].t ? new Date(pts[0].t) : null, t1 = pts[pts.length - 1].t ? new Date(pts[pts.length - 1].t) : null;
  const hrs = pts.map((p) => +p.hr).filter((x) => x > 30);
  let cads = pts.map((p) => +p.cad).filter((x) => x > 20);
  let cad = cads.length ? cads.reduce((a, b) => a + b, 0) / cads.length : null;
  if (cad && cad < 120) cad *= 2; // Garmin note les pas d'un seul pied
  // trace allégée : un point tous les 40 m environ
  const trace = [[+pts[0].la.toFixed(5), +pts[0].lo.toFixed(5)]];
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    acc += distM(pts[i - 1].la, pts[i - 1].lo, pts[i].la, pts[i].lo);
    if (acc >= 40 || i === pts.length - 1) { trace.push([+pts[i].la.toFixed(5), +pts[i].lo.toFixed(5)]); acc = 0; }
  }
  return {
    date: t0 ? isoDate(t0) : null,
    duree: t0 && t1 ? Math.round((t1 - t0) / 60000) : null,
    km: Math.round(dist / 100) / 10,
    dplus: Math.round(dplus / 10) * 10,
    fc: hrs.length ? Math.round(hrs.reduce((a, b) => a + b, 0) / hrs.length) : null,
    cadence: cad ? Math.round(cad) : null,
    trace,
  };
}

/* =====================================================================
   PRÉDICTION DE CHRONO
   km-effort = km + D+/100 ; on extrapole tes meilleures sorties récentes (formule de Riegel, exposant 1,06)
   ===================================================================== */
function prediction(obj) {
  if (!obj) return null;
  const keR = obj.km + obj.dplus / 100;
  const depuis = addDays(today(), -56);
  const sorties = S.logs.filter((l) => l.cat === "trail" && !l.course && l.km && l.duree && l.date >= depuis && l.sessionId !== "t-descente")
    .map((l) => { const ke = Number(l.km) + (Number(l.dplus) || 0) / 100; return { l, ke, t: Number(l.duree) * Math.pow(keR / ke, 1.06) }; })
    .filter((x) => x.ke >= 8 && x.t > 0)
    .sort((a, b) => a.t - b.t);
  if (!sorties.length) return null;
  const best = sorties.slice(0, 2);
  const min = best.reduce((a, b) => a + b.t, 0) / best.length;
  return { min: Math.round(min), keR, base: best.map((x) => x.l) };
}
function hm(min) { min = Math.round(min); return `${Math.floor(min / 60)}h${String(min % 60).padStart(2, "0")}`; }
function memoriserPrediction() {
  const { obj, apres } = objectifPour(S, mondayOf(today()));
  if (!obj || apres) return null;
  const p = prediction(obj);
  if (p) { S.predictions = S.predictions || {}; const k = mondayOf(today()); if (S.predictions[k] !== p.min) { S.predictions[k] = p.min; save(); } }
  return p;
}
function predictionCarte() {
  const { obj, apres } = objectifPour(S, mondayOf(today()));
  if (!obj || apres) return "";
  const p = memoriserPrediction();
  const hist = Object.entries(S.predictions || {}).sort().slice(-10);
  if (!p) return `<div class="card"><h3>⏱️ Chrono estimé</h3><p class="muted">Enregistre une sortie trail avec durée, km et D+ (ou importe-la depuis Garmin) : je calcule ton chrono pour ${esc(obj.nom)}.</p></div>`;
  const maxV = Math.max(...hist.map(([, v]) => v)), minV = Math.min(...hist.map(([, v]) => v));
  return `<div class="card"><div class="row spread"><h3>⏱️ Chrono estimé</h3><span class="pill">${esc(obj.km + " km · " + obj.dplus + " D+")}</span></div>
    <p style="font-size:2rem;font-weight:800;margin:4px 0">${hm(p.min)}</p>
    <p class="muted">Fourchette : ${hm(p.min * 0.95)} à ${hm(p.min * 1.08)}. Calculé à partir de tes meilleures sorties des 8 dernières semaines (${p.base.map((l) => `${fmtDate(l.date)} : ${l.km} km`).join(", ")}).</p>
    ${hist.length > 1 ? `<div class="barres" style="height:70px">${hist.map(([m, v]) => `<div class="b"><i style="height:${20 + ((maxV - v) / Math.max(1, maxV - minV)) * 80}%"></i><span>${fmtDate(m, { day: "numeric", month: "numeric" })}</span></div>`).join("")}</div><p class="muted">Plus la barre est haute, plus tu vas vite.</p>` : ""}
  </div>`;
}

/* =====================================================================
   RAVITAILLEMENT
   ===================================================================== */
function ravitoPlan(poids, duree, chaud) {
  const h = duree / 60;
  const gH = duree > 180 ? 50 : 40;            // glucides par heure le jour J
  const eauH = chaud ? 600 : 450;              // ml par heure (mars : doux)
  const naH = chaud ? 500 : 350;               // sodium mg par heure
  const prises = [];
  for (let t = 35; t < duree - 10; t += 40) prises.push(t);
  return { gH, eauH, naH, totG: Math.round(gH * h), totEau: Math.round((eauH * h) / 50) * 50, totNa: Math.round(naH * h), prises, h };
}
function vRavito() {
  const { obj } = objectifPour(S, mondayOf(today()));
  const p = obj ? prediction(obj) : null;
  const duree = S.ravitoDuree || (p ? p.min : 300);
  const chaud = !!S.ravitoChaud;
  const R = ravitoPlan(S.poids || 50, duree, chaud);
  const tests = S.logs.filter((l) => l.ravito || l.ventre).slice(-8).reverse();
  $app.innerHTML = `<a class="retour-haut" href="javascript:history.back()">‹ Retour</a>
    <h1>🍌 Mon ravitaillement</h1>
    <p class="muted">Sur 33 km, c'est souvent le ventre qui lâche avant les jambes. Ce plan se teste à l'entraînement, jamais pour la première fois le jour J.</p>
    <div class="card">
      <div class="grid2"><div><label>Mon poids (kg)</label><input type="number" inputmode="decimal" id="rpoids" value="${esc(S.poids || "")}" placeholder="50"></div>
      <div><label>Durée prévue (min)</label><input type="number" inputmode="numeric" id="rduree" value="${duree}"></div></div>
      <label style="display:flex;gap:10px;align-items:center"><input type="checkbox" id="rchaud" style="width:22px;height:22px" ${chaud ? "checked" : ""}> Il fait chaud (plus de 20 °C)</label>
      ${p ? `<p class="muted">Durée proposée à partir de ton chrono estimé (${hm(p.min)}).</p>` : ""}
    </div>
    <h2>Par heure de course</h2>
    <div class="stats"><div class="stat"><b>${R.gH} g</b><span>de glucides</span></div><div class="stat"><b>${R.eauH} ml</b><span>d'eau</span></div><div class="stat"><b>${R.naH} mg</b><span>de sodium</span></div></div>
    <h2>Sur toute la course (${hm(duree)})</h2>
    <div class="card"><p><b>${R.totG} g de glucides</b>, par exemple :</p>
      <ul class="etapes"><li>• 2 flasques de 500 ml de boisson d'effort (≈ 60 g), remplies aux ravitos</li>
      <li>• ${Math.max(2, Math.round((R.totG - 60) / 2 / 25))} gels ou compotes (≈ 25 g chacun)</li>
      <li>• ${Math.max(1, Math.round((R.totG - 60) / 2 / 25))} barres, pâtes de fruits ou morceaux de banane (≈ 25 g)</li>
      <li>• <b>${R.totEau / 1000} L d'eau</b> au total, et du sel : une pastille d'électrolytes ou une poignée de chips aux ravitos</li></ul></div>
    <h2>⏰ Le minutage</h2>
    <div class="card"><ul class="etapes">
      <li>• <b>Toutes les 15 min</b> : 3-4 gorgées, même sans soif.</li>
      ${R.prises.map((t, i) => `<li>• <b>${hm(t)}</b> : ${i % 2 === 0 ? "1 gel ou 1 compote" : "1 barre ou 1 pâte de fruits"} (≈ 25 g)</li>`).join("")}
      <li>• <b>Aux ravitos</b> : remplis les flasques, prends du salé, ne t'éternise pas.</li></ul></div>
    <div class="alerte info"><b>Entraîne ton ventre :</b> sur chaque sortie de plus de 1h30, mange comme le jour J, puis note dans ton retour ce que tu as pris et comment ton ventre l'a vécu. Monte progressivement vers ${R.gH + 10} g/h à l'entraînement.</div>
    <h2>Mes tests</h2>
    ${tests.length ? tests.map((l) => `<div class="card"><b>${fmtDate(l.date)} · ${esc(l.nom)}${l.km ? ` · ${l.km} km` : ""}</b><p class="muted">${esc(l.ravito || "")}</p><p>Ventre : ${{ ok: "😊 OK", bof: "😐 bof", ko: "🤢 pas bien" }[l.ventre] || "–"}</p></div>`).join("") : `<p class="muted">Aucun test encore. Ça se remplit depuis le retour de tes sorties longues.</p>`}`;
  const maj = () => {
    S.poids = Number(document.getElementById("rpoids").value) || S.poids;
    S.ravitoDuree = Number(document.getElementById("rduree").value) || null;
    S.ravitoChaud = document.getElementById("rchaud").checked;
    save(); vRavito();
  };
  ["rpoids", "rduree", "rchaud"].forEach((id) => (document.getElementById(id).onchange = maj));
}

/* =====================================================================
   MODE JOUR DE COURSE
   ===================================================================== */
const CHECKLIST = [
  ["Sac", "Sac ou gilet de trail"], ["Sac", "2 flasques remplies"], ["Sac", "Gels, barres, compotes (voir ravito)"], ["Sac", "Pastilles d'électrolytes"],
  ["Sac", "Couverture de survie"], ["Sac", "Coupe-vent léger"], ["Sac", "Téléphone chargé"], ["Sac", "Gobelet (souvent obligatoire)"],
  ["Sur toi", "Dossard + 4 épingles ou porte-dossard"], ["Sur toi", "Montre Garmin chargée, trace chargée si dispo"], ["Sur toi", "Chaussures déjà portées (pas neuves !)"],
  ["Sur toi", "Chaussettes testées"], ["Sur toi", "Crème anti-frottements"], ["Sur toi", "Casquette ou bandeau"],
  ["Après", "Vêtements secs + doudoune"], ["Après", "De quoi manger salé"], ["Après", "Claquettes pour les pieds"],
];
function vJourJ() {
  const { obj, apres } = objectifPour(S, mondayOf(today()));
  if (!obj) { $app.innerHTML = `<h1>🏁 Jour J</h1><p class="muted">Ajoute un objectif dans Réglages.</p>`; return; }
  const j = daysBetween(today(), obj.date);
  const p = prediction(obj);
  const tot = p ? p.min : 300;
  S.checklist = S.checklist || {};
  const faits = CHECKLIST.filter(([, x]) => S.checklist[x]).length;
  // stratégie en trois tiers : on part plus lentement, on finit fort
  const tiers = [
    { km: Math.round(obj.km * 0.33), part: 0.30, txt: "Pars plus lentement que tu ne crois. Tu dois pouvoir parler. Marche les côtes raides dès le début." },
    { km: Math.round(obj.km * 0.75), part: 0.72, txt: "Ton rythme. Mange et bois à l'heure, même sans faim. Relance sur le roulant." },
    { km: obj.km, part: 1, txt: "C'est là que la prépa paie. Petits pas en descente, et tout ce qui te reste dans les jambes." },
  ];
  $app.innerHTML = `<a class="retour-haut" href="#accueil">‹ Accueil</a>
    <div class="hero"><div class="muted">${esc(obj.nom)}${obj.lieu ? " · " + esc(obj.lieu) : ""}</div>
      <div class="j">${j > 0 ? "J-" + j : j === 0 ? "C'est aujourd'hui !" : "Terminé 🏁"}</div>
      <div class="muted">${fmtDate(obj.date, { weekday: "long", day: "numeric", month: "long" })} · ${obj.km} km · ${obj.dplus} m D+${p ? ` · objectif ≈ ${hm(p.min)}` : ""}</div></div>
    ${j <= 0 && !apres ? `<a class="btn large vert" href="#retour/course">🏁 J'ai fini ! Enregistrer ma course</a>` : ""}
    <h2>🧭 Ma stratégie</h2>
    ${tiers.map((t, i) => `<div class="card"><div class="row spread"><h3>${i === 0 ? "Départ" : i === 1 ? "Milieu" : "Final"} → km ${t.km}</h3><span class="pill">${p ? "≈ " + hm(tot * t.part) : ""}</span></div><p class="muted">${t.txt}</p></div>`).join("")}
    <p class="muted">Les temps de passage sont indicatifs : le parcours exact n'est pas encore publié.</p>
    <h2>🌙 La veille</h2>
    <div class="card"><ul class="etapes"><li>• Dîner normal, riche en féculents (pâtes, riz), rien de nouveau.</li><li>• Sac prêt, dossard épinglé, tenue posée.</li><li>• Au lit tôt. Mal dormir la veille, ce n'est pas grave : c'est l'avant-veille qui compte.</li></ul></div>
    <h2>☀️ Le matin</h2>
    <div class="card"><ul class="etapes"><li>• Petit-déjeuner 3 h avant : pain ou riz, miel ou confiture, banane, café si tu as l'habitude.</li><li>• 500 ml d'eau par petites gorgées jusqu'au départ.</li><li>• 10 minutes d'échauffement : trottiner, quelques montées de genoux.</li></ul></div>
    <h2>🍌 Ravito</h2>
    <a class="card lien slot" href="#ravito"><div class="ico">🍌</div><div class="grow"><h3>Mon plan de ravitaillement</h3><div class="muted">Glucides, eau, sel et minutage</div></div><div class="check">›</div></a>
    <h2>🎒 Mon sac (${faits}/${CHECKLIST.length})</h2>
    <div class="card">${["Sac", "Sur toi", "Après"].map((g) => `<p style="margin-top:8px"><b>${g}</b></p>${CHECKLIST.filter(([gg]) => gg === g).map(([, x]) => `<label class="facile" style="font-size:.95rem"><input type="checkbox" data-ck="${esc(x)}" ${S.checklist[x] ? "checked" : ""}> ${esc(x)}</label>`).join("")}`).join("")}
      <button class="chip" id="ckraz" style="margin-top:12px">Tout décocher</button></div>`;
  $app.querySelectorAll("[data-ck]").forEach((c) => (c.onchange = () => { S.checklist[c.dataset.ck] = c.checked; save(); }));
  document.getElementById("ckraz").onclick = () => { S.checklist = {}; save(); vJourJ(); };
}
function vBravo(id) {
  const l = S.logs.find((x) => x.id === id);
  $app.innerHTML = `<div class="timer" style="padding-top:30px"><div style="font-size:5rem" class="fete">🏁🎉🏅</div>
    <h1>FINISHER !</h1>
    <p style="font-size:1.2rem">${l ? esc(l.nom) : ""}</p>
    ${l && l.chrono ? `<p style="font-size:2.4rem;font-weight:800">${esc(l.chrono)}</p>` : ""}
    <p class="muted">16 semaines de préparation, entre les chevaux, la salle et les sentiers. Tu l'as fait${S.prenom ? ", " + esc(S.prenom) : ""}. Sois fière de toi. 💜</p>
    <a class="btn large" href="#progres" style="margin-top:16px">Voir tout mon parcours</a></div>`;
  parle("Finisher ! Bravo, tu l'as fait !");
}

/* =====================================================================
   ÉCURIE
   ===================================================================== */
const ECURIE = { 1: { nom: "Légère", e: "🐴" }, 2: { nom: "Normale", e: "🐴🐴" }, 3: { nom: "Grosse", e: "🐴🐴🐴" } };
function ecurieDuJour() { return (S.ecurie || []).find((x) => x.date === today()); }
function pointsEcurie(debut) { return (S.ecurie || []).filter((x) => !debut || x.date >= debut).reduce((a, x) => a + x.niv, 0); }
function ecurieCarte() {
  const auj = ecurieDuJour();
  const mois = today().slice(0, 7) + "-01";
  return `<div class="card" style="margin-top:12px"><div class="row spread"><h3>🐴 Ta journée à l'écurie</h3><span class="pill">${pointsEcurie(mois)} pts ce mois</span></div>
    <p class="muted">${auj ? `Aujourd'hui : ${ECURIE[auj.niv].e} ${ECURIE[auj.niv].nom}. Ça compte aussi !` : "Porter des seaux, curer, pousser la brouette : c'est du renfo. Dis-moi comment était ta journée."}</p>
    <div class="chips">${[1, 2, 3].map((n) => `<button class="chip ${auj && auj.niv === n ? "on" : ""}" data-ecurie="${n}">${ECURIE[n].e} ${ECURIE[n].nom}</button>`).join("")}</div></div>`;
}
function brancherEcurie(apres) {
  $app.querySelectorAll("[data-ecurie]").forEach((b) => (b.onclick = () => {
    S.ecurie = (S.ecurie || []).filter((x) => x.date !== today());
    S.ecurie.push({ date: today(), niv: Number(b.dataset.ecurie) });
    save();
    const nv = verifierBadges();
    toast(nv.length ? `🏅 Nouveau badge : ${nv.map((x) => x.emoji + " " + x.nom).join(", ")}` : Number(b.dataset.ecurie) === 3 ? "Grosse journée notée 🐴 Ta séance s'adapte." : "Noté 🐴", 3000);
    apres();
  }));
}
