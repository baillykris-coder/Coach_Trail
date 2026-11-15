/* Coach Trail — l'application */

const KEY = "coachTrail.v1";
const $app = document.getElementById("app");

/* ================= État ================= */
function defaut() {
  return {
    version: 1,
    prenom: "",
    debut: mondayOf(today()),
    objectifs: [{ id: "aspres2027", nom: "La 33'tour des Aspres", lieu: "Thuir", date: "2027-03-07", km: 33, dplus: 1200 }],
    logs: [],
    petits: [],
    charges: {},
    ecurie: [],
    sommets: {},
    checklist: {},
    predictions: {},
    poids: null,
    semaines: {},
    badges: {},
    repere: "Ma boucle de Castelnou (~10 km)",
    voix: true,
    dernierExport: null,
  };
}
let S;
try { S = JSON.parse(localStorage.getItem(KEY)) || defaut(); } catch (e) { S = defaut(); }
S = Object.assign(defaut(), S);
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast("⚠️ Impossible d'enregistrer sur ce téléphone"); }
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

/* ================= Outils ================= */
function esc(s) { return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function mmss(sec) { sec = Math.max(0, Math.round(sec)); const m = Math.floor(sec / 60), s = sec % 60; return `${m}:${String(s).padStart(2, "0")}`; }
function dureeTxt(sec) { const m = Math.round(sec / 60); return m >= 60 ? `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}` : `${m}'`; }
function catInfo(id) { return CATEGORIES.find((c) => c.id === id) || { emoji: "✳️", nom: "Autre" }; }
function totalEtapes(s) { return (s.etapes || []).reduce((a, e) => a + e.t, 0); }
let toastTimer;
function toast(msg, ms = 2800) {
  const t = document.getElementById("toast");
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.hidden = true), ms);
}
function parseRepos(r) {
  const m = String(r).match(/(\d+)'(\d+)?|(\d+)"/);
  if (!m) return 0;
  if (m[3]) return Number(m[3]);
  return Number(m[1]) * 60 + Number(m[2] || 0);
}

/* Son et voix */
let actx;
function audioOn() { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === "suspended") actx.resume(); } catch (e) {} }
function bip(freq = 880, dur = 0.15) {
  if (!actx) return;
  try {
    const o = actx.createOscillator(), g = actx.createGain();
    o.frequency.value = freq; o.connect(g); g.connect(actx.destination);
    g.gain.setValueAtTime(0.25, actx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur);
    o.start(); o.stop(actx.currentTime + dur);
  } catch (e) {}
}
function parle(txt) {
  if (!S.voix || !("speechSynthesis" in window)) return;
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(txt); u.lang = "fr-FR"; u.rate = 1.05; speechSynthesis.speak(u); } catch (e) {}
}
let wake;
async function garderEcran() { try { wake = await navigator.wakeLock?.request("screen"); } catch (e) {} }
function libererEcran() { try { wake?.release(); } catch (e) {} wake = null; }

/* ================= Photos des machines (stockées sur le téléphone) ================= */
const Photos = (() => {
  let dbp;
  const db = () => (dbp = dbp || new Promise((res, rej) => {
    const r = indexedDB.open("coachTrailPhotos", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("photos");
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  }));
  const tx = async (mode, fn) => {
    const d = await db();
    return new Promise((res, rej) => {
      const t = d.transaction("photos", mode); const req = fn(t.objectStore("photos"));
      t.oncomplete = () => res(req && req.result); t.onerror = () => rej(t.error);
    });
  };
  return {
    get: (id) => tx("readonly", (s) => s.get(id)),
    put: (id, b) => tx("readwrite", (s) => s.put(b, id)),
    del: (id) => tx("readwrite", (s) => s.delete(id)),
  };
})();
let urlsPhotos = [];
function remplirPhotos() {
  document.querySelectorAll("[data-photo]").forEach((el) => {
    Photos.get(el.dataset.photo).then((b) => {
      if (!b) return;
      const u = URL.createObjectURL(b); urlsPhotos.push(u);
      el.innerHTML = `<img src="${u}" alt="Ma photo : ${esc(machineInfo(el.dataset.photo)?.nom || "")}">`;
    }).catch(() => {});
  });
}
async function reduirePhoto(file) {
  let src, w, h;
  try { src = await createImageBitmap(file); w = src.width; h = src.height; }
  catch (e) {
    src = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); });
    w = src.naturalWidth; h = src.naturalHeight;
  }
  const k = Math.min(1, 900 / Math.max(w, h));
  const c = document.createElement("canvas"); c.width = Math.round(w * k); c.height = Math.round(h * k);
  c.getContext("2d").drawImage(src, 0, 0, c.width, c.height);
  return new Promise((res) => c.toBlob(res, "image/jpeg", 0.75));
}
function vignette(macId, lien = true) {
  const m = machineInfo(macId);
  if (!m) return "";
  // pas de lien dans un lien : dans une carte cliquable, la vignette est un simple bloc
  return lien
    ? `<a class="vignette" href="#machine/${m.id}" data-photo="${m.id}" title="${esc(m.nom)}">${m.svg}</a>`
    : `<div class="vignette" data-photo="${m.id}">${m.svg}</div>`;
}

/* ================= Charges ================= */
function fmtKg(n) { return String(Math.round(n * 10) / 10).replace(".", ","); }
function chargesDe(k) { return (S.charges[k] || []).slice().sort((a, b) => (a.date < b.date ? -1 : 1)); }
function derniereCharge(k) { return chargesDe(k).filter((c) => c.date < today()).pop(); }
function chargeDuJour(k) { return chargesDe(k).find((c) => c.date === today()); }
function chargeTxt(c, uni) {
  if (!c) return "";
  return uni ? `D ${c.d != null ? fmtKg(c.d) : "–"} / G ${c.g != null ? fmtKg(c.g) : "–"} kg` : `${c.kg != null ? fmtKg(c.kg) : "–"} kg`;
}
function exoHtml(e, i) {
  let charges = "";
  if (!e.pdc && e.k) {
    const last = derniereCharge(e.k);
    const auj = chargeDuJour(e.k) || {};
    const unite = e.unite || "kg";
    const sugg = (v) => (last && last.facile && v != null ? v + e.pas : null);
    const champ = (cote, lib) => {
      const prec = last ? last[cote] : e.base ? e.base[cote] : null;
      return `<label style="margin:0;font-weight:500"><small>${lib}</small><br><input type="number" inputmode="decimal" step="0.5" min="0" data-charge="${i}" data-cote="${cote}" value="${auj[cote] ?? ""}" placeholder="${prec != null ? fmtKg(sugg(prec) ?? prec) : "kg"}"></label>`;
    };
    const conseil = last && last.facile
      ? `💡 C'était facile la dernière fois : essaie ${e.uni ? `D ${fmtKg(sugg(last.d) ?? 0)} / G ${fmtKg(sugg(last.g) ?? 0)}` : fmtKg(sugg(last.kg) ?? 0)} kg`
      : last ? "Même charge que la dernière fois, et vise toutes les répétitions." : "";
    const ratio = auj.d && auj.g ? `<div class="muted">Droite = ${Math.round((auj.d / auj.g) * 100)} % de la gauche</div>` : "";
    charges = `<div class="charges">${e.uni ? champ("d", "Droite") + champ("g", "Gauche") : champ("kg", "Charge")}
      <small>${esc(unite)}${e.option ? " (facultatif)" : ""}${last ? `<br>Dernière fois (${fmtDate(last.date)}) : ${chargeTxt(last, e.uni)}` : e.base ? `<br>Ta base actuelle : ${chargeTxt(e.base, e.uni)}` : "<br>Première fois : note ta charge"}</small></div>
      ${conseil ? `<div class="conseil">${conseil}</div>` : ""}${ratio}
      <label class="facile"><input type="checkbox" data-facile="${i}" ${auj.facile ? "checked" : ""}> Toutes les répétitions, et c'était facile</label>`;
  }
  return `<div class="exo">${vignette(e.mac)}<div class="grow">
      <div class="row spread" style="align-items:flex-start"><b>${esc(e.n)}</b><input type="checkbox" id="x${i}" title="Fait"></div>
      <div><b style="color:var(--violet)">${esc(e.s)}</b> <span class="muted">· repos ${esc(e.r)}</span></div>
      ${e.c ? `<div class="muted">${esc(e.c)}</div>` : ""}
      ${charges}
      ${parseRepos(e.r) ? `<button class="btn second petit" style="margin-top:8px" data-repos="${parseRepos(e.r)}">⏱ Repos ${esc(e.r)}</button>` : ""}
    </div></div>`;
}
function brancherCharges(s) {
  const enregistrer = (i) => {
    const e = s.exos[i];
    const box = $app.querySelectorAll(`[data-charge="${i}"]`);
    const entree = { date: today() };
    box.forEach((inp) => { if (inp.value !== "") entree[inp.dataset.cote] = Number(inp.value.replace(",", ".")); });
    const fac = $app.querySelector(`[data-facile="${i}"]`);
    entree.facile = !!(fac && fac.checked);
    const liste = (S.charges[e.k] || []).filter((c) => c.date !== today());
    if (Object.keys(entree).some((k) => ["d", "g", "kg"].includes(k)) || entree.facile) liste.push(entree);
    S.charges[e.k] = liste;
    save();
  };
  $app.querySelectorAll("[data-charge]").forEach((inp) => (inp.onchange = () => enregistrer(Number(inp.dataset.charge))));
  $app.querySelectorAll("[data-facile]").forEach((inp) => (inp.onchange = () => enregistrer(Number(inp.dataset.facile))));
}

/* ================= Routeur ================= */
let nettoyage = null;
function route() {
  if (nettoyage) { nettoyage(); nettoyage = null; }
  urlsPhotos.forEach((u) => URL.revokeObjectURL(u)); urlsPhotos = [];
  const h = location.hash.slice(1) || "accueil";
  const [chemin, qs] = h.split("?");
  const q = Object.fromEntries(new URLSearchParams(qs || ""));
  const [vue, a, b] = chemin.split("/");
  document.querySelectorAll(".tabbar a").forEach((x) => x.classList.toggle("on", x.dataset.tab === (["seance", "go", "petits", "machines", "machine"].includes(vue) ? "seances" : ["retour", "ravito", "jourj", "sommets", "bravo"].includes(vue) ? "accueil" : vue)));
  document.getElementById("tabbar").hidden = vue === "go";
  const vues = { accueil: vAccueil, semaine: vSemaine, seances: vSeances, seance: vSeance, go: vGo, retour: vRetour, progres: vProgres, reglages: vReglages, petits: vPetits, machines: vMachines, machine: vMachine, ravito: vRavito, jourj: vJourJ, sommets: vSommets, bravo: vBravo };
  (vues[vue] || vAccueil)(a, b, q);
  remplirPhotos();
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", route);

/* ================= Composants ================= */
function slotHtml(slot) {
  const s = seance(slot.id);
  const c = slot.course ? { emoji: "🏁" } : catInfo(s ? s.cat : slot.cats[0]);
  const nom = slot.course ? esc(slot.nom) : s ? esc(s.nom) : "Séance libre";
  let detail = "";
  if (slot.km) detail = `${slot.km} km · ~${slot.dplus} m D+`;
  else if (s && s.etapes) detail = dureeTxt(totalEtapes(s));
  else if (s && s.duree) detail = `${s.duree}'`;
  const href = slot.course ? "#retour/course" : `#seance/${slot.id}${slot.km ? `?km=${slot.km}&dplus=${slot.dplus}` : ""}`;
  const fait = slot.fait;
  return `<a class="card lien slot ${fait ? "fait" : ""}" href="${href}">
    <div class="ico">${c.emoji}</div>
    <div class="grow"><div class="muted">${esc(slot.role)}</div><h3>${nom}</h3>
      <div class="muted">${fait ? `✅ Fait le ${fmtDate(fait.date, { weekday: "long", day: "numeric" })}${fait.nom && s && fait.nom !== s.nom ? ` (${esc(fait.nom)})` : ""}` : detail}</div></div>
    <div class="check">${fait ? "✅" : "›"}</div></a>`;
}
function alertesHtml(P) { return P.alertes.map((a) => `<div class="alerte ${a.niv}">${esc(a.txt)}</div>`).join(""); }

/* ================= Accueil ================= */
function vAccueil() {
  const lundi = mondayOf(today());
  const P = planSemaine(S, lundi);
  const J = jauge(S);
  const ser = serie(S);
  const obj = P.obj && !objectifPour(S, lundi).apres ? P.obj : null;
  const jRest = obj ? daysBetween(today(), obj.date) : null;
  const socleFaits = P.socle.filter((s) => s.fait).length;
  const pred = obj ? memoriserPrediction() : null;
  const salut = S.prenom ? `Salut ${esc(S.prenom)} 👋` : "Salut 👋";

  $app.innerHTML = `
    <p class="muted">${fmtDate(today(), { weekday: "long", day: "numeric", month: "long" })}</p>
    <h1>${salut}</h1>
    ${!S.prenom ? `<div class="card"><label for="pn">Comment je t'appelle ?</label><div class="row"><input id="pn" placeholder="Ton prénom"><button class="btn" id="pnok">OK</button></div></div>` : ""}
    ${obj ? `<a class="hero" href="#jourj" style="display:block;text-decoration:none">
      <div class="muted">${esc(obj.nom)} · ${fmtDate(obj.date, { day: "numeric", month: "long", year: "numeric" })}</div>
      <div class="row spread" style="align-items:flex-end;margin-top:6px">
        <div><div class="j">${jRest > 0 ? "J-" + jRest : jRest === 0 ? "Jour J !" : "Bravo !"}</div><div class="muted">${obj.km} km · ${obj.dplus} m D+</div></div>
        ${J ? `<div style="text-align:right"><div style="font-size:1.6rem;font-weight:800">${J.pct}%</div><div class="muted">préparation</div></div>` : ""}
      </div>
      ${J ? `<div class="barre"><i style="width:${J.pct}%"></i></div>` : ""}
      <div class="row spread"><span class="muted">${esc(P.phase)}</span><span class="muted">${pred ? `⏱️ ≈ ${hm(pred.min)} · ` : ""}Jour J ›</span></div>
    </a>` : `<div class="card"><h3>Pas d'objectif à venir</h3><p class="muted">Ajoute ton prochain défi dans Réglages.</p><a class="btn second" href="#reglages">Ajouter un objectif</a></div>`}

    <div class="row" style="gap:10px;margin-bottom:12px">
      <div class="stat grow"><b>${ser > 0 ? "🔥 " + ser : "0"}</b><span>semaine${ser > 1 ? "s" : ""} tenue${ser > 1 ? "s" : ""} d'affilée</span></div>
      <div class="stat grow"><b>${socleFaits}/${P.socle.length}</b><span>socle de la semaine</span></div>
    </div>

    ${alertesHtml(P)}
    <div class="row spread"><h2>Cette semaine</h2><a href="#semaine" class="muted">Tout voir ›</a></div>
    <p class="muted" style="margin-top:-6px">Focus : ${FOCUS.find((f) => f.id === P.focus).emoji} ${FOCUS.find((f) => f.id === P.focus).nom} · <a href="#semaine">changer</a></p>
    ${P.socle.map(slotHtml).join("")}

    <a class="btn large orange" href="#retour" style="margin-top:6px">✍️ J'ai fait une séance</a>
    <div class="row" style="gap:8px;margin-top:12px">
      <a class="stat grow" href="#ravito" style="text-decoration:none;color:inherit"><b>🍌</b><span>Ravito</span></a>
      <a class="stat grow" href="#sommets" style="text-decoration:none;color:inherit"><b>🏔️ ${Object.keys(S.sommets || {}).length}/${SOMMETS.length}</b><span>Sommets</span></a>
      <a class="stat grow" href="#jourj" style="text-decoration:none;color:inherit"><b>🏁</b><span>Jour J</span></a>
    </div>
    ${petitsCarte(lundi)}
    ${ecurieCarte()}
  `;
  brancherEcurie(route);
  const ok = document.getElementById("pnok");
  if (ok) ok.onclick = () => { const v = document.getElementById("pn").value.trim(); if (v) { S.prenom = v; save(); route(); } };
}

/* ================= Semaine ================= */
function vSemaine(lundiParam) {
  const lundi = lundiParam || mondayOf(today());
  const P = planSemaine(S, lundi);
  const courante = lundi === mondayOf(today());
  const passee = lundi < mondayOf(today());
  const fin = addDays(lundi, 6);
  $app.innerHTML = `
    <div class="row spread">
      <a class="btn second petit" href="#semaine/${addDays(lundi, -7)}">‹</a>
      <div style="text-align:center"><b>${courante ? "Cette semaine" : passee ? "Semaine passée" : "Semaine à venir"}</b><div class="muted">du ${fmtDate(lundi)} au ${fmtDate(fin)}</div></div>
      <a class="btn second petit" href="#semaine/${addDays(lundi, 7)}">›</a>
    </div>
    <div class="card" style="margin-top:12px">
      <div class="row wrap"><span class="pill">${esc(P.phase)}</span>${P.wr != null ? `<span class="pill orange">${P.wr === 0 ? "Course !" : P.wr + " sem. avant la course"}</span>` : ""}${P.test ? `<span class="pill vert">Semaine test</span>` : ""}</div>
      <p style="margin-top:8px">${esc(P.note)}</p>
    </div>
    ${!passee ? `<h2>Mon focus de la semaine</h2>
    <div class="chips">${FOCUS.map((f) => `<button class="chip ${P.focus === f.id ? "on" : ""}" data-f="${f.id}" title="${esc(f.aide)}">${f.emoji} ${f.nom}</button>`).join("")}</div>
    <p class="muted" style="margin-top:6px">${esc(FOCUS.find((f) => f.id === P.focus).aide)}</p>` : ""}
    <div style="margin-top:14px">${alertesHtml(P)}</div>
    <h2>Le socle <span class="muted">(l'essentiel)</span></h2>
    ${P.socle.map(slotHtml).join("")}
    ${P.bonus.length ? `<h2>Bonus <span class="muted">(si tu as le temps, jamais une dette)</span></h2>${P.bonus.map(slotHtml).join("")}` : ""}
    ${!passee || petitsEntre(S, lundi, addDays(lundi, 7)).length ? petitsCarte(lundi) : ""}
    ${P.extras.length ? `<h2>Fait en plus 👏</h2>${P.extras.map((l) => `<div class="card slot fait"><div class="ico">${catInfo(l.cat).emoji}</div><div class="grow"><h3>${esc(l.nom)}</h3><div class="muted">${fmtDate(l.date, { weekday: "long", day: "numeric" })}</div></div></div>`).join("")}` : ""}
  `;
  $app.querySelectorAll("[data-f]").forEach((b) => (b.onclick = () => {
    S.semaines[lundi] = { ...(S.semaines[lundi] || {}), focus: b.dataset.f };
    save(); vSemaine(lundiParam); toast(`Focus : ${FOCUS.find((f) => f.id === b.dataset.f).nom}`);
  }));
}

/* ================= Bibliothèque ================= */
function vSeances(cat) {
  if (!cat) {
    $app.innerHTML = `<h1>Séances</h1><p class="muted">Choisis un module.</p>
      ${CATEGORIES.map((c) => `<a class="card lien slot" href="#seances/${c.id}"><div class="ico">${c.emoji}</div><div class="grow"><h3>${c.nom}</h3><div class="muted">${c.aide} · ${SEANCES.filter((s) => s.cat === c.id).length} séances</div></div><div class="check">›</div></a>`).join("")}`;
    return;
  }
  const c = catInfo(cat);
  $app.innerHTML = `<a class="retour-haut" href="#seances">‹ Modules</a><h1>${c.emoji} ${c.nom}</h1><p class="muted">${c.aide}</p>
    ${cat === "pdc" ? `<a class="card lien slot" href="#petits" style="border-color:var(--orange)"><div class="ico">✨</div><div class="grow"><h3>Petits plus à la carte</h3><div class="muted">${EXOS_PDC.length} exercices, une série chacun. Tu choisis, tu fais, tu coches.</div></div><div class="check">›</div></a>
    <h2>Capsules chronométrées</h2>` : ""}
    ${cat === "renfo" || cat === "cardio" ? `<a class="card lien slot" href="#machines" style="border-color:var(--orange)"><div class="ico">📷</div><div class="grow"><h3>Les machines de ma salle</h3><div class="muted">${MACHINES_SALLE.length} fiches : schéma, réglages, erreurs à éviter, et ta photo.</div></div><div class="check">›</div></a>` : ""}
    ${SEANCES.filter((s) => s.cat === cat).map((s) => `<a class="card lien" href="#seance/${s.id}"${s.fav ? ' style="border-color:var(--orange)"' : ""}>
      ${s.fav ? `<span class="pill orange" style="margin-bottom:6px">⭐ Tes préférées</span>` : ""}
      <div class="row spread"><h3>${esc(s.nom)}</h3><span class="pill">${s.etapes ? dureeTxt(totalEtapes(s)) : s.duree ? s.duree + "'" : "Sortie"}</span></div>
      <p class="muted">${esc(s.resume)}</p>${"●".repeat(s.niveau)}<span style="opacity:.25">${"●".repeat(3 - s.niveau)}</span> <span class="muted">intensité</span></a>`).join("")}`;
}

function profilHtml(s) {
  const tot = totalEtapes(s);
  return `<div class="profil">${s.etapes.map((e) => `<i class="z${e.z}" style="flex-basis:${(e.t / tot) * 100}%;height:${e.z * 20}%"></i>`).join("")}</div>`;
}
function etapesGroupees(s) {
  const out = [];
  s.etapes.forEach((e) => {
    const base = e.l.replace(/ \(\d+\/\d+\)$/, "");
    const last = out[out.length - 1];
    if (last && last.base === base && last.m === e.m && last.z === e.z) { last.n++; last.t += e.t; }
    else out.push({ base, m: e.m, z: e.z, t: e.t, n: 1, u: e.t });
  });
  // fusionne les alternances « fort / souple » répétées
  const res = [];
  for (let i = 0; i < out.length; i++) {
    const a = out[i], b = out[i + 1];
    if (a.n === 1 && b && b.n === 1) {
      let k = i, reps = 0;
      while (out[k] && out[k + 1] && out[k].base === a.base && out[k + 1].base === b.base && out[k].u === a.u && out[k + 1].u === b.u) { reps++; k += 2; }
      if (reps >= 2) { res.push({ txt: `${reps} × (${mmss(a.u)} ${a.base.toLowerCase()} / ${mmss(b.u)} ${b.base.toLowerCase()})`, m: a.m, z: a.z, t: reps * (a.u + b.u) }); i = k - 1; continue; }
    }
    res.push({ txt: a.n > 1 ? `${a.n} × ${mmss(a.u)} ${a.base.toLowerCase()}` : a.base, m: a.m, z: a.z, t: a.t });
  }
  return res;
}

function vSeance(id, _b, q) {
  const s = seance(id);
  if (!s) { location.hash = "#seances"; return; }
  const c = catInfo(s.cat);
  let corps = "";
  if (s.etapes) {
    const macs = machinesDeSeance(s);
    corps = `${macs.length ? `<div class="row wrap" style="margin-bottom:12px">${macs.map((m) => `<div style="text-align:center">${vignette(m)}<div class="muted" style="font-size:.75rem">${esc(machineInfo(m).nom)}</div></div>`).join("")}</div>` : ""}
    <div class="card">${profilHtml(s)}
      <ul class="etapes">${etapesGroupees(s).map((e) => `<li><span class="zone z${e.z}"></span><span>${esc(e.txt)} <span class="muted">· ${MACHINES[e.m]}</span></span><span class="t">${dureeTxt(e.t)}</span></li>`).join("")}</ul></div>
      <details class="card"><summary>Les zones d'effort</summary>${Object.entries(ZONES).map(([z, v]) => `<p style="margin-top:8px"><span class="zone z${z}"></span><b>${v.nom}</b> : ${v.aide}</p>`).join("")}</details>
      <button class="btn large" id="lancer">▶️ Lancer le minuteur</button>`;
  } else if (s.exos) {
    corps = `<div class="card"><p><b>Échauffement :</b> ${esc(s.echauffement)}</p></div>
      <p class="muted">Touche le dessin pour voir la fiche de la machine (réglages, erreurs) et y mettre ta photo.</p>
      <div class="card">${s.exos.map(exoHtml).join("")}</div>
      <p class="muted">Charges : prends un poids qui te laisse 1 à 2 répétitions « en réserve ». Coche « facile » si c'était le cas : la prochaine fois, je te proposerai d'augmenter un peu. Tout est enregistré automatiquement.</p>
      <a class="btn large vert" href="#retour/${s.id}">✅ J'ai fini, je fais mon retour</a>`;
  } else {
    const cible = q && q.km ? `<div class="card"><h3>🎯 Cible de la semaine</h3><p style="font-size:1.3rem;font-weight:800;margin:4px 0">${q.km} km · ~${q.dplus} m D+</p><p class="muted">À adapter au terrain : c'est la durée d'effort qui compte. Ajoute ou retire une boucle selon tes sensations.</p></div>` : "";
    corps = `${cible}${s.test === "repere" ? `<div class="card"><h3>📍 Ton parcours repère</h3><p>${esc(S.repere)}</p><p class="muted">Modifiable dans Réglages.</p></div>` : ""}
      <div class="card"><ul class="etapes">${s.consignes.map((x) => `<li>• ${esc(x)}</li>`).join("")}</ul></div>
      <a class="btn large vert" href="#retour/${s.id}">✍️ Enregistrer ma séance</a>`;
  }
  $app.innerHTML = `<a class="retour-haut" href="#seances/${s.cat}">‹ ${c.nom}</a>
    <h1>${c.emoji} ${esc(s.nom)}</h1>
    <p>${esc(s.resume)}</p>
    <div class="alerte info"><b>Pourquoi ?</b> ${esc(s.pourquoi)}</div>
    ${corps}`;
  const l = document.getElementById("lancer");
  if (l) l.onclick = () => { audioOn(); location.hash = `#go/${s.id}`; };
  $app.querySelectorAll("[data-repos]").forEach((b) => (b.onclick = () => { audioOn(); repos(Number(b.dataset.repos)); }));
  if (s.exos) brancherCharges(s);
}

/* ================= Machines ================= */
function vMachines() {
  $app.innerHTML = `<a class="retour-haut" href="javascript:history.back()">‹ Retour</a>
    <h1>📷 Les machines de ma salle</h1>
    <p class="muted">Des schémas simples pour repérer chaque machine. Le mieux : à la salle, ouvre une fiche et prends <b>ta</b> machine en photo. Elle remplacera le schéma partout dans l'appli.</p>
    ${MACHINES_SALLE.map((m) => `<a class="card lien slot" href="#machine/${m.id}">${vignette(m.id, false)}<div class="grow"><h3>${esc(m.nom)}</h3><div class="muted">${esc(m.zone)}</div></div><div class="check">›</div></a>`).join("")}`;
}
function vMachine(id) {
  const m = machineInfo(id);
  if (!m) { location.hash = "#machines"; return; }
  const utilisee = SEANCES.filter((s) => machinesDeSeance(s).includes(id));
  $app.innerHTML = `<a class="retour-haut" href="javascript:history.back()">‹ Retour</a>
    <h1>${esc(m.nom)}</h1><p class="muted">${esc(m.zone)}</p>
    <div class="grande" data-photo="${m.id}" id="grande">${m.svg}</div>
    <div class="row wrap">
      <label class="btn" style="margin:0">📷 Prendre ou choisir ma photo<input type="file" accept="image/*" capture="environment" id="photo" hidden></label>
      <button class="btn second" id="sansphoto" hidden>Remettre le schéma</button>
    </div>
    <p class="muted" style="margin-top:6px">La photo reste sur ton téléphone (elle n'est pas dans la sauvegarde texte).</p>
    <div class="card"><h3>⚙️ Réglages</h3><ul class="etapes">${m.reglages.map((x) => `<li>• ${esc(x)}</li>`).join("")}</ul></div>
    <div class="card"><h3>⚠️ Erreurs à éviter</h3><ul class="etapes">${m.erreurs.map((x) => `<li>• ${esc(x)}</li>`).join("")}</ul></div>
    ${utilisee.length ? `<h2>Dans tes séances</h2>${utilisee.map((s) => `<a class="card lien slot" href="#seance/${s.id}"><div class="ico">${catInfo(s.cat).emoji}</div><div class="grow"><h3>${esc(s.nom)}</h3>${s.exos ? `<div class="muted">${s.exos.filter((e) => e.mac === id).map((e) => esc(e.n)).join(" · ")}</div>` : ""}</div><div class="check">›</div></a>`).join("")}` : ""}`;
  Photos.get(id).then((b) => { if (b) document.getElementById("sansphoto").hidden = false; }).catch(() => {});
  document.getElementById("photo").onchange = async (ev) => {
    const f = ev.target.files && ev.target.files[0];
    if (!f) return;
    try {
      toast("Photo en cours d'enregistrement…");
      await Photos.put(id, await reduirePhoto(f));
      toast("📷 Photo enregistrée !"); route();
    } catch (e) { toast("⚠️ Impossible d'enregistrer la photo"); }
  };
  document.getElementById("sansphoto").onclick = async () => {
    if (!confirm("Supprimer ta photo et remettre le schéma ?")) return;
    try { await Photos.del(id); } catch (e) {}
    route();
  };
}

/* ================= Petits plus (poids du corps à la carte) ================= */
function petitsCarte(lundi) {
  const sem = petitsEntre(S, lundi, addDays(lundi, 7)).length;
  const auj = petitsEntre(S, today(), addDays(today(), 1)).length;
  const pct = Math.min(100, (sem / PETITS_POUR_TENIR) * 100);
  return `<a class="card lien" href="#petits" style="margin-top:14px;border-color:var(--orange)">
    <div class="row spread"><h3>✨ Petits plus</h3><span class="pill orange">${sem} cette semaine</span></div>
    <p class="muted">10 minutes entre deux chevaux ? Choisis un exercice, fais ta série, coche.${auj ? ` Aujourd'hui : ${auj} ✅` : ""}</p>
    ${sem < PETITS_POUR_TENIR ? `<div class="barre"><i style="width:${pct}%;background:var(--orange)"></i></div><p class="muted">${PETITS_POUR_TENIR - sem} de plus et ta semaine compte comme tenue, même sans séance.</p>` : `<p class="muted">🔥 Assez pour tenir ta semaine à eux seuls !</p>`}
  </a>`;
}
let filtrePdc = "tous";
let tirage = [];
function vPetits() {
  const lundi = mondayOf(today());
  const aujList = petitsEntre(S, today(), addDays(today(), 1));
  const nbAuj = (id) => aujList.filter((p) => p.exo === id).length;
  const semN = petitsEntre(S, lundi, addDays(lundi, 7)).length;
  const liste = EXOS_PDC.filter((e) => filtrePdc === "tous" || (filtrePdc === "ecurie" ? e.n.includes("🐴") : e.g === filtrePdc));
  const carte = (e) => {
    const n = nbAuj(e.id);
    return `<div class="card" style="${tirage.includes(e.id) ? "border-color:var(--orange);border-width:2px" : ""}">
      <div class="row" style="align-items:flex-start"><div class="grow"><h3>${esc(e.n)}</h3>
        <div><b>${esc(e.s)}</b></div><div class="muted">${esc(e.c)}</div></div>
        <div style="text-align:center;flex:none"><button class="btn ${n ? "vert" : ""} petit" data-fait="${e.id}">${n ? `✅ ×${n}` : "✓ Fait"}</button>
        ${n ? `<div><button class="chip" style="padding:2px 8px;margin-top:6px;font-size:.75rem" data-annule="${e.id}">annuler</button></div>` : ""}</div></div></div>`;
  };
  $app.innerHTML = `<a class="retour-haut" href="#seances/pdc">‹ Poids du corps</a>
    <h1>✨ Petits plus</h1>
    <p class="muted">Chaque exercice = une série complète. Fais-en un, deux ou cinq : chaque coche compte.</p>
    <div class="row" style="gap:10px;margin:12px 0">
      <div class="stat grow"><b>${aujList.length}</b><span>aujourd'hui</span></div>
      <div class="stat grow"><b>${semN}</b><span>cette semaine</span></div>
      <div class="stat grow"><b>${(S.petits || []).length}</b><span>au total</span></div>
    </div>
    <button class="btn large orange" id="tirer">🎲 Tire-moi 3 exercices au hasard</button>
    ${tirage.length ? `<h2>Ton tirage 🎲</h2>${tirage.map((id) => carte(EXOS_PDC.find((e) => e.id === id))).join("")}` : ""}
    <h2>Tous les exercices</h2>
    <div class="chips" style="margin-bottom:12px">
      <button class="chip ${filtrePdc === "tous" ? "on" : ""}" data-filtre="tous">Tous</button>
      <button class="chip ${filtrePdc === "ecurie" ? "on" : ""}" data-filtre="ecurie">🐴 Spécial écurie</button>
      ${GROUPES_PDC.map((g) => `<button class="chip ${filtrePdc === g.id ? "on" : ""}" data-filtre="${g.id}">${g.emoji} ${g.nom}</button>`).join("")}
    </div>
    ${liste.map(carte).join("")}`;

  $app.querySelectorAll("[data-filtre]").forEach((b) => (b.onclick = () => { filtrePdc = b.dataset.filtre; vPetits(); }));
  document.getElementById("tirer").onclick = () => {
    // 3 exercices de 3 groupes différents
    const groupes = [...GROUPES_PDC].sort(() => Math.random() - 0.5).slice(0, 3);
    tirage = groupes.map((g) => { const l = EXOS_PDC.filter((e) => e.g === g.id); return l[Math.floor(Math.random() * l.length)].id; });
    vPetits();
  };
  $app.querySelectorAll("[data-fait]").forEach((b) => (b.onclick = () => {
    const y = window.scrollY;
    const avant = semaineTenue(S, lundi);
    S.petits = S.petits || [];
    S.petits.push({ id: uid(), date: today(), exo: b.dataset.fait });
    save();
    const nouveaux = verifierBadges();
    vPetits(); window.scrollTo(0, y);
    if (nouveaux.length) toast(`🏅 Nouveau badge : ${nouveaux.map((x) => x.emoji + " " + x.nom).join(", ")}`, 4500);
    else if (!avant && semaineTenue(S, lundi)) toast("🔥 Semaine tenue grâce à tes petits plus !", 3500);
    else toast(["Bien joué ! ✨", "Une de plus 💪", "Chaque série compte 🔥", "Top ! 👏"][Math.floor(Math.random() * 4)], 1500);
  }));
  $app.querySelectorAll("[data-annule]").forEach((b) => (b.onclick = () => {
    const y = window.scrollY;
    const i = S.petits.map((p) => p.date === today() && p.exo === b.dataset.annule).lastIndexOf(true);
    if (i >= 0) { S.petits.splice(i, 1); save(); }
    vPetits(); window.scrollTo(0, y);
  }));
}

/* Minuteur de repos (renfo) */
let reposTimer;
function repos(sec) {
  clearInterval(reposTimer);
  const fin = Date.now() + sec * 1000;
  const t = document.getElementById("toast");
  t.hidden = false;
  const maj = () => {
    const r = (fin - Date.now()) / 1000;
    if (r <= 0) { clearInterval(reposTimer); t.textContent = "💪 C'est reparti !"; bip(990, 0.4); setTimeout(() => (t.hidden = true), 2000); return; }
    t.textContent = `⏱ Repos : ${mmss(r)} (toucher pour arrêter)`;
  };
  t.onclick = () => { clearInterval(reposTimer); t.hidden = true; };
  maj(); reposTimer = setInterval(maj, 250);
}

/* ================= Minuteur de séance ================= */
function vGo(id) {
  const s = seance(id);
  if (!s || !s.etapes) { location.hash = "#seances"; return; }
  const E = s.etapes;
  const tot = totalEtapes(s);
  let i = 0, fin = null, restant = E[0].t * 1000, pause = true, lastSec = null, termine = false;

  $app.innerHTML = `<div class="timer">
    <div class="row spread"><a class="btn second petit" href="#seance/${s.id}" id="quit">✕ Quitter</a><span class="muted" id="glob"></span></div>
    <div class="barre"><i id="prog" style="width:0"></i></div>
    <div class="anneau" id="ann">
      <div class="machine" id="mac"></div>
      <div class="phase" id="pha"></div>
      <div class="chrono" id="chr"></div>
      <div class="machine" id="zon"></div>
    </div>
    <div class="suivant" id="sui"></div>
    <div class="row">
      <button class="btn second" id="prev">⏮</button>
      <button class="btn grow" id="play">▶️ Démarrer</button>
      <button class="btn second" id="next">⏭</button>
    </div>
    <p class="muted" style="margin-top:14px">Garde l'écran allumé. 🔊 ${S.voix ? "Voix activée" : "Voix coupée (Réglages)"}.</p>
  </div>`;
  const $ = (x) => document.getElementById(x);

  function annonce() {
    const e = E[i];
    parle(`${e.l.replace(/\(\d+\/\d+\)/, "")}. ${MACHINES[e.m]}. ${e.t >= 60 ? Math.round(e.t / 60) + " minute" + (e.t >= 120 ? "s" : "") : e.t + " secondes"}.`);
  }
  function aller(n) {
    if (n >= E.length) return finir();
    i = Math.max(0, n);
    restant = E[i].t * 1000;
    if (!pause) fin = Date.now() + restant;
    bip(i === 0 ? 660 : 880, 0.3); annonce(); affiche();
  }
  function finir() {
    termine = true; pause = true; libererEcran();
    bip(660, 0.2); setTimeout(() => bip(880, 0.2), 250); setTimeout(() => bip(1100, 0.5), 500);
    parle("Séance terminée. Bravo !");
    $app.innerHTML = `<div class="timer"><div style="font-size:4rem">🎉</div><h1>Séance terminée !</h1><p class="muted">${esc(s.nom)} · ${dureeTxt(tot)}</p>
      <a class="btn large vert" href="#retour/${s.id}?duree=${Math.round(tot / 60)}">✍️ Faire mon retour</a></div>`;
    document.getElementById("tabbar").hidden = false;
  }
  function affiche() {
    if (termine) return;
    const e = E[i];
    const r = pause ? restant : fin - Date.now();
    const ecoule = E.slice(0, i).reduce((a, x) => a + x.t, 0) + (e.t - r / 1000);
    $("ann").className = `anneau bg-z${e.z}`;
    $("mac").textContent = MACHINES[e.m];
    $("pha").textContent = e.l;
    $("chr").textContent = mmss(Math.ceil(r / 1000));
    $("zon").textContent = `${ZONES[e.z].nom} — ${ZONES[e.z].aide}`;
    $("sui").textContent = E[i + 1] ? `Ensuite : ${E[i + 1].l} · ${MACHINES[E[i + 1].m]} · ${mmss(E[i + 1].t)}` : "Dernière étape !";
    $("prog").style.width = `${Math.min(100, (ecoule / tot) * 100)}%`;
    $("glob").textContent = `${mmss(ecoule)} / ${mmss(tot)}`;
    $("play").textContent = pause ? "▶️ Reprendre" : "⏸ Pause";
  }
  function tick() {
    if (pause || termine) return;
    const r = fin - Date.now();
    const sec = Math.ceil(r / 1000);
    if (sec !== lastSec && sec <= 3 && sec > 0) bip(520, 0.12);
    lastSec = sec;
    if (r <= 0) aller(i + 1); else affiche();
  }
  $("play").onclick = () => {
    audioOn();
    if (pause) {
      if (fin === null) { annonce(); bip(660, 0.3); }
      pause = false; fin = Date.now() + restant; garderEcran();
    } else { pause = true; restant = fin - Date.now(); }
    affiche();
  };
  $("next").onclick = () => aller(i + 1);
  $("prev").onclick = () => aller(i - 1);
  affiche();
  $("play").textContent = "▶️ Démarrer";
  const iv = setInterval(tick, 200);
  const vis = () => { if (document.visibilityState === "visible" && !pause) garderEcran(); };
  document.addEventListener("visibilitychange", vis);
  nettoyage = () => { clearInterval(iv); libererEcran(); document.removeEventListener("visibilitychange", vis); try { speechSynthesis.cancel(); } catch (e) {} };
}

/* ================= Retour de séance ================= */
function vRetour(a, b, q) {
  let L = null, sid = a || "";
  if (a === "edit") { L = S.logs.find((l) => l.id === b); if (!L) { location.hash = "#progres"; return; } sid = L.sessionId || "autre"; }
  const estCourse = a === "course";
  if (estCourse) sid = "course";
  const v = L || { date: today(), duree: q.duree || "", ressenti: 5, fatigue: 4, hanche: 0 };
  // reprend automatiquement les charges de presse notées pendant la séance
  const presseAuj = chargeDuJour("presse-1");
  if (!L && presseAuj) { v.presseD = presseAuj.d ?? ""; v.presseG = presseAuj.g ?? ""; }
  const options = CATEGORIES.map((c) => `<optgroup label="${c.emoji} ${c.nom}">${SEANCES.filter((s) => s.cat === c.id).map((s) => `<option value="${s.id}" ${s.id === sid ? "selected" : ""}>${esc(s.nom)}</option>`).join("")}</optgroup>`).join("");

  $app.innerHTML = `<a class="retour-haut" href="javascript:history.back()">‹ Retour</a>
    <h1>${L ? "Modifier la séance" : estCourse ? "🏁 Ma course" : "✍️ Mon retour"}</h1>
    <p class="muted">30 secondes, et ton plan s'adapte.</p>
    <label class="btn second large" style="margin:8px 0 0">⌚ Importer depuis Garmin (fichier GPX ou TCX)<input type="file" id="gpx" accept=".gpx,.tcx,application/gpx+xml,application/xml,text/xml" hidden></label>
    <p class="muted" id="gpxmsg" style="margin-top:6px">${L && L.trace ? "📍 Trace GPS enregistrée avec cette séance." : "Distance, D+, durée, FC et cadence se remplissent tout seuls, et tes sommets se débloquent."}</p>
    <form id="f">
      ${estCourse ? "" : `<label>Séance</label><select name="sessionId" id="sid"><option value="autre" ${sid === "autre" ? "selected" : ""}>Autre / séance libre</option>${options}</select>
      <div id="catLibre"><label>Type de séance libre</label><select name="cat">${CATEGORIES.map((c) => `<option value="${c.id}" ${L && L.cat === c.id ? "selected" : ""}>${c.emoji} ${c.nom}</option>`).join("")}</select>
      <label>Nom (facultatif)</label><input name="nomLibre" value="${L && L.sessionId === "autre" ? esc(L.nom) : ""}" placeholder="ex. Sortie avec les copines"></div>`}
      <div class="grid2"><div><label>Date</label><input type="date" name="date" value="${v.date}" max="${today()}"></div>
      <div><label>Durée (min)</label><input type="number" inputmode="numeric" name="duree" value="${esc(v.duree)}" min="0"></div></div>
      <div id="blocDist" class="grid2"><div><label>Distance (km)</label><input type="number" inputmode="decimal" step="0.1" name="km" value="${esc(v.km || "")}"></div>
      <div><label>D+ (m)</label><input type="number" inputmode="numeric" name="dplus" value="${esc(v.dplus || "")}"></div></div>
      <div id="blocCad" class="grid2"><div><label>Cadence moy. (pas/min)</label><input type="number" inputmode="numeric" name="cadence" value="${esc(v.cadence || "")}"></div>
      <div><label>FC moyenne</label><input type="number" inputmode="numeric" name="fc" value="${esc(v.fc || "")}"></div></div>
      <div id="blocChrono"><label>Chrono (h:mm:ss)</label><input name="chrono" value="${esc(v.chrono || "")}" placeholder="1:32:10"></div>
      <div id="blocPresse" class="grid2"><div><label>Presse jambe DROITE (kg)</label><input type="number" inputmode="decimal" name="presseD" value="${esc(v.presseD || "")}"></div>
      <div><label>Presse jambe GAUCHE (kg)</label><input type="number" inputmode="decimal" name="presseG" value="${esc(v.presseG || "")}"></div></div>
      ${curseur("ressenti", "Effort ressenti", v.ressenti, 1, 10, "très facile", "à bloc")}
      ${curseur("fatigue", "Fatigue générale aujourd'hui", v.fatigue, 1, 10, "en forme", "épuisée")}
      ${curseur("hanche", "Hanche droite", v.hanche, 0, 10, "rien", "douleur forte")}
      <div id="blocRavito"><label>🍌 Ravito testé (ce que tu as mangé et bu)</label><input name="ravito" value="${esc(v.ravito || "")}" placeholder="ex. 2 gels + 1 barre, 1 L de boisson">
        <label>Et ton ventre ?</label><select name="ventre"><option value="">–</option>${[["ok", "😊 Tout bien"], ["bof", "😐 Bof"], ["ko", "🤢 Pas bien"]].map(([k, t]) => `<option value="${k}" ${v.ventre === k ? "selected" : ""}>${t}</option>`).join("")}</select></div>
      <label>Un mot ? (sensations, météo, parcours…)</label><textarea name="note">${esc(v.note || "")}</textarea>
      <button class="btn large vert" style="margin-top:16px">💾 Enregistrer</button>
      ${L ? `<button type="button" class="btn large second" id="suppr" style="margin-top:10px">🗑 Supprimer cette séance</button>` : ""}
    </form>`;

  const f = document.getElementById("f");
  const sel = document.getElementById("sid");
  function majChamps() {
    const id = estCourse ? "course" : sel.value;
    const s = seance(id);
    const cat = estCourse ? "trail" : s ? s.cat : f.cat.value;
    document.getElementById("catLibre") && (document.getElementById("catLibre").hidden = !!s);
    document.getElementById("blocDist").hidden = !["trail", "plat", "vtt", "express"].includes(cat);
    document.getElementById("blocCad").hidden = !["trail", "plat"].includes(cat);
    document.getElementById("blocChrono").hidden = !(estCourse || id === "t-repere");
    document.getElementById("blocPresse").hidden = !(s && s.test === "presse");
    document.getElementById("blocRavito").hidden = cat !== "trail";
  }
  if (sel) { sel.onchange = majChamps; f.cat.onchange = majChamps; }
  f.querySelectorAll("input[type=range]").forEach((r) => (r.oninput = () => (document.getElementById("v-" + r.name).textContent = r.value)));
  majChamps();

  // Import d'une sortie Garmin
  let trace = L && L.trace ? L.trace : null;
  document.getElementById("gpx").onchange = async (ev) => {
    const file = ev.target.files && ev.target.files[0];
    const msg = document.getElementById("gpxmsg");
    if (!file) return;
    try {
      const r = await lireSortie(file);
      if (r.date) f.date.value = r.date > today() ? today() : r.date;
      ["duree", "km", "dplus", "fc", "cadence"].forEach((k) => { if (r[k] != null) f[k].value = r[k]; });
      trace = r.trace;
      if (sel && !seance(sel.value)) { sel.value = "autre"; f.cat.value = "trail"; }
      majChamps();
      msg.textContent = `✅ Sortie importée : ${r.km} km, ${r.dplus} m D+, ${r.duree ? hm(r.duree) : "durée inconnue"}. Vérifie, complète ton ressenti, puis enregistre.`;
    } catch (e) { msg.textContent = "⚠️ Je n'arrive pas à lire ce fichier. Il faut un fichier .gpx ou .tcx exporté depuis Garmin Connect."; }
  };

  f.onsubmit = (ev) => {
    ev.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    const s = estCourse ? null : seance(d.sessionId);
    const obj = estCourse ? objectifPour(S, mondayOf(d.date)).obj : null;
    const log = {
      id: L ? L.id : uid(),
      date: d.date || today(),
      sessionId: estCourse ? "course" : d.sessionId,
      cat: estCourse ? "trail" : s ? s.cat : d.cat,
      nom: estCourse ? (obj ? obj.nom : "Course") : s ? s.nom : d.nomLibre || catInfo(d.cat).nom,
      course: estCourse || (L && L.course) || false,
    };
    ["duree", "km", "dplus", "cadence", "fc", "presseD", "presseG", "ressenti", "fatigue", "hanche"].forEach((k) => { if (d[k] !== undefined && d[k] !== "") log[k] = Number(String(d[k]).replace(",", ".")); });
    if (d.chrono) log.chrono = d.chrono;
    if (d.note) log.note = d.note.trim();
    if (d.ravito && log.cat === "trail") log.ravito = d.ravito.trim();
    if (d.ventre && log.cat === "trail") log.ventre = d.ventre;
    if (trace) log.trace = trace;
    if (L) S.logs[S.logs.indexOf(L)] = log; else S.logs.push(log);
    S.logs.sort((x, y) => (x.date < y.date ? -1 : 1));
    const sommetsNeufs = trace ? sommetsDeTrace(trace, log.date) : [];
    save();
    const nouveaux = verifierBadges();
    let msg = L ? "Séance modifiée ✅" : "Bien joué ! Séance enregistrée ✅";
    if (log.hanche >= 4) msg = "Enregistré. Ta hanche est notée : la suite s'adapte 🧡";
    if (sommetsNeufs.length) msg = `🏔️ ${sommetsNeufs.length > 1 ? sommetsNeufs.length + " sommets débloqués" : "Débloqué"} : ${sommetsNeufs.map((p) => p.nom).join(", ")} !`;
    toast(nouveaux.length ? `🏅 Nouveau badge : ${nouveaux.map((x) => x.emoji + " " + x.nom).join(", ")}` : msg, nouveaux.length || sommetsNeufs.length ? 4500 : 2800);
    location.hash = estCourse && !L ? `#bravo/${log.id}` : L ? "#progres" : "#accueil";
  };
  const sup = document.getElementById("suppr");
  if (sup) sup.onclick = () => { if (confirm("Supprimer cette séance ?")) { S.logs = S.logs.filter((l) => l.id !== L.id); save(); location.hash = "#progres"; } };
}
function curseur(nom, titre, val, min, max, g, d) {
  return `<label>${titre} : <span class="val" id="v-${nom}">${val}</span>/${max}</label>
    <input type="range" name="${nom}" min="${min}" max="${max}" value="${val}"><div class="echelle"><span>${g}</span><span>${d}</span></div>`;
}
function verifierBadges() {
  const got = calculerBadges(S);
  const nouveaux = [];
  Object.keys(got).forEach((k) => { if (!S.badges[k]) { S.badges[k] = today(); nouveaux.push(BADGES.find((b) => b.id === k)); } });
  if (nouveaux.length) save();
  return nouveaux.filter(Boolean);
}

/* ================= Progrès ================= */
function vProgres() {
  const L = S.logs;
  const depuis = L.filter((l) => l.date >= S.debut);
  const km = depuis.reduce((a, l) => a + (Number(l.km) || 0), 0);
  const dp = depuis.reduce((a, l) => a + (Number(l.dplus) || 0), 0);
  const J = jauge(S);
  const lundi = mondayOf(today());
  const sem = [];
  for (let i = 9; i >= 0; i--) {
    const m = addDays(lundi, -7 * i);
    const ls = logsEntre(S, m, addDays(m, 7));
    sem.push({ m, n: ls.length, km: ls.reduce((a, l) => a + (Number(l.km) || 0), 0) });
  }
  const maxN = Math.max(3, ...sem.map((s) => s.n));
  const longues = L.filter((l) => l.cat === "trail" && l.km).sort((a, b) => b.km - a.km);
  const reperes = L.filter((l) => l.sessionId === "t-repere" && l.chrono);
  const presses = L.filter((l) => l.presseD && l.presseG);
  const cadences = L.filter((l) => l.cat === "plat" && l.cadence);
  const hanches = L.filter((l) => l.hanche != null).slice(-12);

  $app.innerHTML = `<h1>Progrès</h1><p class="muted">Depuis le ${fmtDate(S.debut, { day: "numeric", month: "long", year: "numeric" })}</p>
    <div class="stats"><div class="stat"><b>${depuis.length}</b><span>séances</span></div><div class="stat"><b>${Math.round(km)}</b><span>km</span></div><div class="stat"><b>${dp}</b><span>m D+</span></div></div>
    ${J ? `<div class="card" style="margin-top:12px"><h3>Jauge de préparation : ${J.pct}%</h3><div class="barre"><i style="width:${J.pct}%"></i></div>
      <p class="muted">Régularité : ${J.tenues} semaine${J.tenues > 1 ? "s" : ""} tenue${J.tenues > 1 ? "s" : ""} sur ${J.total} jusqu'à la course · Fond : plus longue sortie ${J.maxKm} km sur ${J.pic} km visés.</p></div>` : ""}
    ${predictionCarte()}
    <a class="card lien slot" href="#sommets"><div class="ico">🏔️</div><div class="grow"><h3>Chasse aux sommets</h3><div class="muted">${Object.keys(S.sommets || {}).length} / ${SOMMETS.length} débloqués</div></div><div class="check">›</div></a>
    <h2>Les 10 dernières semaines</h2>
    <div class="card"><div class="barres">${sem.map((s) => `<div class="b" title="${s.n} séances, ${Math.round(s.km)} km"><span>${s.n || ""}</span><i class="${s.n ? "" : "vide"}" style="height:${Math.max(4, (s.n / maxN) * 100)}%"></i><span>${fmtDate(s.m, { day: "numeric", month: "numeric" })}</span></div>`).join("")}</div>
    <p class="muted" style="margin-top:8px">Nombre de séances par semaine. Le but : plus aucune barre vide.</p></div>
    <h2>Tests de progression</h2>
    <div class="card"><h3>📍 Parcours repère</h3>${reperes.length ? reperes.map((l) => `<p>${fmtDate(l.date)} : <b>${esc(l.chrono)}</b>${l.fc ? ` · FC ${l.fc}` : ""} · effort ${l.ressenti}/10</p>`).join("") : `<p class="muted">Pas encore de test. Le premier arrive en semaine test.</p>`}</div>
    <div class="card"><h3>⚖️ Presse : droite / gauche</h3>${presses.length ? presses.map((l) => `<p>${fmtDate(l.date)} : D ${l.presseD} kg · G ${l.presseG} kg → <b>${Math.round((l.presseD / l.presseG) * 100)}%</b></p>`).join("") : `<p class="muted">Note tes charges lors de « Jambes une par une » ou « Côté fonte ».</p>`}</div>
    <div class="card"><h3>👣 Cadence sur le plat</h3>${cadences.length ? cadences.slice(-6).map((l) => `<p>${fmtDate(l.date)} : <b>${l.cadence}</b> pas/min</p>`).join("") : `<p class="muted">Note ta cadence Garmin après tes séances de plat.</p>`}</div>
    <div class="card"><h3>🦴 Hanche droite</h3>${hanches.length ? `<div class="barres" style="height:70px">${hanches.map((l) => `<div class="b"><i style="height:${Math.max(4, l.hanche * 10)}%;background:${l.hanche >= 6 ? "var(--rouge)" : l.hanche >= 4 ? "var(--orange)" : "var(--vert)"}"></i></div>`).join("")}</div><p class="muted">Tes ${hanches.length} derniers retours (0 = rien, 10 = douleur forte).</p>` : `<p class="muted">Rien encore.</p>`}</div>
    <div class="card"><h3>⛰️ Plus longues sorties</h3>${longues.length ? longues.slice(0, 3).map((l) => `<p>${fmtDate(l.date)} : <b>${l.km} km</b>${l.dplus ? ` · ${l.dplus} m D+` : ""}</p>`).join("") : `<p class="muted">Rien encore.</p>`}</div>
    <h2>Badges</h2>
    <div class="badges">${BADGES.map((b) => `<div class="badge ${S.badges[b.id] ? "" : "off"}" title="${esc(b.aide)}"><span class="e">${b.emoji}</span><b>${b.nom}</b><div class="muted">${S.badges[b.id] ? fmtDate(S.badges[b.id]) : esc(b.aide)}</div></div>`).join("")}</div>
    <h2>Historique</h2>
    <div class="card hist">${L.length ? [...L].reverse().map((l) => `<a class="l row" href="#retour/edit/${l.id}" style="color:inherit;text-decoration:none"><span>${catInfo(l.cat).emoji}</span><div class="grow"><b>${esc(l.nom)}</b><div class="muted">${fmtDate(l.date, { weekday: "short", day: "numeric", month: "short" })}${l.duree ? ` · ${l.duree}'` : ""}${l.km ? ` · ${l.km} km` : ""}${l.dplus ? ` · ${l.dplus} D+` : ""}${l.hanche ? ` · hanche ${l.hanche}` : ""}</div></div><span class="muted">✎</span></a>`).join("") : `<p class="muted">Aucune séance pour l'instant. La première, c'est la plus importante !</p>`}</div>`;
}

/* ================= Réglages ================= */
function resumeCoach() {
  const lundi = mondayOf(today());
  const P = planSemaine(S, lundi);
  const debut = addDays(lundi, -42);
  const ls = S.logs.filter((l) => l.date >= debut);
  const lignes = ls.map((l) => [
    l.date, l.nom, l.duree ? `${l.duree}'` : "", l.km ? `${l.km} km` : "", l.dplus ? `${l.dplus} D+` : "",
    l.cadence ? `cad ${l.cadence}` : "", l.fc ? `FC ${l.fc}` : "", l.chrono ? `chrono ${l.chrono}` : "",
    l.presseD ? `presse D${l.presseD}/G${l.presseG}` : "", l.ravito ? `ravito : ${l.ravito} (ventre ${l.ventre || "?"})` : "", `effort ${l.ressenti ?? "-"}/10`, `fatigue ${l.fatigue ?? "-"}/10`, `hanche ${l.hanche ?? "-"}/10`, l.note ? `« ${l.note} »` : "",
  ].filter(Boolean).join(" · "));
  return `=== Coach Trail — point du ${today()} ===
Objectif : ${P.obj ? `${P.obj.nom} le ${P.obj.date} (${P.obj.km} km / ${P.obj.dplus} D+)` : "aucun"}
Phase : ${P.phase} · focus : ${P.focus} · série : ${serie(S)} semaine(s) tenue(s)
Objectifs enregistrés : ${S.objectifs.map((o) => `${o.nom} ${o.date}`).join(" ; ")}

Séances des 6 dernières semaines (${ls.length}) :
${lignes.join("\n") || "aucune"}

Petits plus poids du corps (6 dernières semaines) : ${petitsTxt(debut)}

Charges en salle (dernière valeur notée) :
${chargesTxt() || "aucune"}

Chrono estimé : ${(() => { const p = P.obj ? prediction(P.obj) : null; return p ? hm(p.min) : "pas encore de données"; })()}
Écurie (6 semaines) : ${(S.ecurie || []).filter((x) => x.date >= debut).map((x) => `${x.date} ${ECURIE[x.niv].nom}`).join(", ") || "rien noté"}
Sommets débloqués : ${Object.keys(S.sommets || {}).length}/${SOMMETS.length}${Object.keys(S.sommets || {}).length ? " (" + Object.keys(S.sommets).map((k) => (SOMMETS.find((p) => p.id === k) || { nom: k }).nom).join(", ") + ")" : ""}`;
}
function chargesTxt() {
  return Object.entries(S.charges || {}).filter(([, l]) => l.length).map(([k, l]) => {
    const nom = Object.keys(EXO_META).find((n) => EXO_META[n].k === k) || k;
    const uni = Object.values(EXO_META).some((m) => m.k === k && m.uni);
    const last = l.slice().sort((a, b) => (a.date < b.date ? -1 : 1)).pop();
    return `${nom} : ${chargeTxt(last, uni)} le ${last.date}${last.facile ? " (facile)" : ""} · ${l.length} fois notée`;
  }).join("\n");
}
function petitsTxt(debut) {
  const ps = (S.petits || []).filter((p) => p.date >= debut);
  if (!ps.length) return "aucun";
  const parSem = {};
  ps.forEach((p) => { const m = mondayOf(p.date); parSem[m] = (parSem[m] || 0) + 1; });
  const parExo = {};
  ps.forEach((p) => { const n = (EXOS_PDC.find((e) => e.id === p.exo) || { n: p.exo }).n; parExo[n] = (parExo[n] || 0) + 1; });
  return `${ps.length} au total\n  par semaine : ${Object.entries(parSem).map(([m, n]) => `sem. du ${m} : ${n}`).join(" ; ")}\n  les plus faits : ${Object.entries(parExo).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([n, k]) => `${n} ×${k}`).join(", ")}`;
}
function vReglages() {
  const objs = [...S.objectifs].sort((a, b) => (a.date < b.date ? -1 : 1));
  $app.innerHTML = `<h1>Réglages</h1>
    <h2>🎯 Mes objectifs</h2>
    ${objs.map((o) => `<div class="card"><div class="row spread"><div><h3>${esc(o.nom)}</h3><div class="muted">${fmtDate(o.date, { day: "numeric", month: "long", year: "numeric" })}${o.lieu ? " · " + esc(o.lieu) : ""} · ${o.km} km · ${o.dplus} m D+</div></div>
      <button class="btn second petit" data-del="${o.id}">🗑</button></div></div>`).join("") || `<p class="muted">Aucun objectif.</p>`}
    <details class="card"><summary>➕ Ajouter un objectif</summary>
      <form id="fo"><label>Nom</label><input name="nom" required placeholder="ex. Trail de printemps">
      <div class="grid2"><div><label>Date</label><input type="date" name="date" required min="${today()}"></div><div><label>Lieu</label><input name="lieu"></div></div>
      <div class="grid2"><div><label>Distance (km)</label><input type="number" inputmode="decimal" name="km" required min="1" step="0.1"></div><div><label>D+ (m)</label><input type="number" inputmode="numeric" name="dplus" required min="0"></div></div>
      <button class="btn large" style="margin-top:12px">Ajouter</button></form>
      <p class="muted" style="margin-top:8px">Le plan se construit toujours vers l'objectif le plus proche, puis enchaîne sur le suivant.</p></details>

    <h2>📤 Faire le point avec le coach</h2>
    <div class="card"><p>Copie ce résumé et colle-le dans ta conversation avec Claude : j'ajuste ton plan à partir de là.</p>
      <button class="btn large" id="copie">📋 Copier le résumé pour le coach</button></div>

    <h2>💾 Sauvegarde</h2>
    <div class="card"><p class="muted">Tes données vivent uniquement sur ce téléphone. Fais une sauvegarde de temps en temps${S.dernierExport ? ` (dernière : ${fmtDate(S.dernierExport)})` : " (jamais faite pour l'instant)"}.</p>
      <div class="row wrap"><button class="btn second" id="exp">⬇️ Télécharger une sauvegarde</button><button class="btn second" id="expc">📋 Copier la sauvegarde</button></div>
      <details style="margin-top:12px"><summary>Restaurer une sauvegarde</summary><textarea id="imp" placeholder="Colle ici le contenu de la sauvegarde"></textarea><button class="btn second" id="impok" style="margin-top:8px">Restaurer</button></details></div>

    <h2>⚙️ Préférences</h2>
    <div class="card"><label>Prénom</label><input id="prenom" value="${esc(S.prenom)}">
      <label>Mon parcours repère (pour les tests)</label><input id="repere" value="${esc(S.repere)}">
      <label style="display:flex;gap:10px;align-items:center"><input type="checkbox" id="voix" style="width:22px;height:22px" ${S.voix ? "checked" : ""}> Annonces vocales pendant le minuteur</label>
      <button class="btn large" id="prefok" style="margin-top:12px">Enregistrer</button></div>

    <details class="card"><summary>Zone dangereuse</summary><p class="muted" style="margin-top:8px">Efface toutes les données de l'appli sur ce téléphone.</p><button class="btn second" id="raz">Tout effacer</button></details>
    <p class="muted" style="text-align:center">Coach Trail · v1</p>`;

  $app.querySelectorAll("[data-del]").forEach((b) => (b.onclick = () => {
    const o = S.objectifs.find((x) => x.id === b.dataset.del);
    if (confirm(`Supprimer l'objectif « ${o.nom} » ?`)) { S.objectifs = S.objectifs.filter((x) => x !== o); save(); vReglages(); }
  }));
  document.getElementById("fo").onsubmit = (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    S.objectifs.push({ id: uid(), nom: d.nom.trim(), date: d.date, lieu: d.lieu.trim(), km: Number(d.km), dplus: Number(d.dplus) });
    save(); toast("Objectif ajouté 🎯"); vReglages();
  };
  const copier = async (txt, ok) => {
    try { await navigator.clipboard.writeText(txt); toast(ok); }
    catch (e) { const t = document.createElement("textarea"); t.value = txt; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); toast(ok); } catch (_) { toast("Copie impossible"); } t.remove(); }
  };
  document.getElementById("copie").onclick = () => copier(resumeCoach(), "Résumé copié ! Colle-le dans Claude 📋");
  const marquer = () => { S.dernierExport = today(); save(); };
  document.getElementById("expc").onclick = () => { copier(JSON.stringify(S), "Sauvegarde copiée 💾"); marquer(); };
  document.getElementById("exp").onclick = () => {
    const blob = new Blob([JSON.stringify(S, null, 1)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `coach-trail-${today()}.json`;
    document.body.appendChild(a); a.click(); a.remove(); marquer(); toast("Sauvegarde téléchargée 💾");
  };
  document.getElementById("impok").onclick = () => {
    try {
      const d = JSON.parse(document.getElementById("imp").value);
      if (!d || !Array.isArray(d.logs)) throw 0;
      if (confirm(`Restaurer ${d.logs.length} séances ? Les données actuelles seront remplacées.`)) { S = Object.assign(defaut(), d); save(); toast("Restauré ✅"); location.hash = "#accueil"; }
    } catch (e) { toast("Ce texte n'est pas une sauvegarde valide"); }
  };
  document.getElementById("prefok").onclick = () => {
    S.prenom = document.getElementById("prenom").value.trim();
    S.repere = document.getElementById("repere").value.trim() || S.repere;
    S.voix = document.getElementById("voix").checked;
    save(); toast("Enregistré ✅");
  };
  document.getElementById("raz").onclick = () => { if (confirm("Tout effacer ? C'est définitif.") && confirm("Vraiment sûre ?")) { S = defaut(); save(); location.hash = "#accueil"; } };
}

/* ================= Démarrage ================= */
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
route();
