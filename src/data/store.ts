import { CONTENT_VERSION, DEFAULT_MEMORIES, FINAL_DEFAULT, Memory, normalizeEmotion, normalizeSecondaryEmotion } from "./memories";

/** Les claus inclouen la versió del contingut: si canvio un text o un joc al codi i pujo
 *  CONTENT_VERSION, les còpies velles guardades al panell deixen de tenir efecte automàticament.
 *  IMPORTANT: textos i fotos es guarden SEPARATS. Les fotos en base64 són les que esgoten la
 *  quota; si el seu desat falla, només es perden les fotos d'aquest navegador i les fotos
 *  publicades a recuerdos.json continuen visibles. */
const KEY_TXT = `esferas_txt_v${CONTENT_VERSION}`;
const KEY_PHOTO = `esferas_foto_v${CONTENT_VERSION}`;
const KEY_FINAL_TXT = `esferas_final_txt_v${CONTENT_VERSION}`;
const KEY_FINAL_PHOTO = `esferas_final_foto_v${CONTENT_VERSION}`;
const KEY_PROG = "esferas_progreso_v1";
/** Empremta del recuerdos.json sobre el qual es van fer els canvis locals d'aquest navegador.
 *  Si el JSON publicat canvia (algú n'ha pujat un de nou), la còpia local queda obsoleta
 *  i es descarta automàticament. Això funciona fins i tot amb JSON antics sense data. */
const KEY_BASE_SIG = `esferas_base_sig_v${CONTENT_VERSION}`;

/** Empremta del recuerdos.json carregat ara mateix. */
let publishedSig = "";

/** Prefixos de les claus de contingut editat (les que depenen de la versió).
 *  NO hi són el progrés (`esferas_progreso_`) ni el calendari (`teaser_`): aquests
 *  s'han de conservar entre versions. */
const CONTENT_KEY_PREFIXES = [
  "esferas_txt_",
  "esferas_foto_",
  "esferas_final_txt_",
  "esferas_final_foto_",
  "esferas_base_sig_",
];

/** Neteja automàtica: elimina les dades locals de versions anteriors del contingut.
 *  Es fa en cada càrrega, a TOTS els navegadors, perquè no quedi cap residu antic
 *  que pugui desentonar o fer error. No toca el progrés ni el calendari. */
export function cleanupOldContentKeys() {
  try {
    const obsoletes: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      const esContingut = CONTENT_KEY_PREFIXES.some((p) => k.startsWith(p));
      const esActual = k.endsWith(`v${CONTENT_VERSION}`);
      if (esContingut && !esActual) obsoletes.push(k);
    }
    obsoletes.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* sense accés a localStorage: no hi ha res a netejar */
  }
}

/** Hash curt i ràpid d'un text (només per detectar canvis, no és criptogràfic). */
function hashText(text: string): string {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return `${text.length}-${(h >>> 0).toString(36)}`;
}

/** Hi ha canvis del panell guardats en aquest navegador? */
export function hasLocalOverrides(): boolean {
  try {
    return [KEY_TXT, KEY_PHOTO, KEY_FINAL_TXT, KEY_FINAL_PHOTO].some((k) => localStorage.getItem(k) !== null);
  } catch {
    return false;
  }
}
/** Empremta guardada de la versió publicada que servia de base als canvis locals. */
export function getLocalBaseSig(): string {
  try { return localStorage.getItem(KEY_BASE_SIG) || ""; } catch { return ""; }
}
/** En desar un canvi local, es recorda sobre quina versió publicada s'ha fet. */
function markSaved() {
  if (!publishedSig) return; // encara no s'ha carregat el JSON: es conserva la base anterior
  try { localStorage.setItem(KEY_BASE_SIG, publishedSig); } catch { /* ignorat */ }
}
/** Esborra la còpia local del panell (textos i fotos), NO el progrés del joc. */
export function clearLocalOverrides() {
  [KEY_TXT, KEY_PHOTO, KEY_FINAL_TXT, KEY_FINAL_PHOTO, KEY_BASE_SIG].forEach((k) => {
    try { localStorage.removeItem(k); } catch { /* ignorat */ }
  });
}

export type PublishedData = { memories: Partial<Memory>[]; final: Partial<FinalMemory>; v?: number };
/** Dades llegides de recuerdos.json d'una versió anterior del codi (per avisar a l'editor). */
let stalePublished = false;
export function publishedIsStale() {
  return stalePublished;
}

export type Progress = Record<number, { label: string; date: string }>;
export type FinalMemory = typeof FINAL_DEFAULT;

/** Textos per defecte de versions ANTERIORS del codi.
 *  El panell i el recuerdos.json guarden una còpia de cada esfera; si una còpia conté exactament
 *  un d'aquests valors, no és una edició vostra sinó una còpia vella: es descarta i es fa servir
 *  el valor actual de memories.ts. Fotos, missatges i textos personalitzats no es toquen mai.
 *  ➜ Cada cop que es canvia un valor per defecte a memories.ts, cal afegir aquí el valor antic. */
type LegacyField = "title" | "when" | "hint" | "gameWhy";
const LEGACY: Record<number, { fields?: Partial<Record<LegacyField, string[]>>; config?: Record<string, string[]> }> = {
  1: { fields: { title: ["La Càmera dels Records"], when: ["Missatge urgent"], gameWhy: ["Esfera d'inici: explica la història i les regles."] } },
  2: {
    fields: {
      // Valors antics de la bola 2, inclòs l'últim intercanvi amb la bola 4.
      title: ["El dia que vas arribar", "Plomes"],
      when: ["El principi de tot", "Pensa-hi bé"],
      hint: ["Tot va començar amb un número: l'any en què la família va créixer.", "Pensa-hi bé abans de respondre…"],
      gameWhy: ["Endevinar l'any de naixement.", "Endevinalla: desxifra la connexió abans de continuar."],
    },
    config: { question: ["🪶 Un cap indi.\n\n🦜 Jack.\n\nQuè tenen en comú?"], answer: ["plomes,plumes,ploma,pluma"] },
  },
  4: {
    fields: {
      title: ["El nostre amagatall"],
      when: ["Infància"],
      hint: ["1, 2, 3… amagar! Compta fins a 30 sense fer trampes."],
      gameWhy: ["Comptar de l'1 al 30 com quan jugàvem a amagar."],
    },
  },
  3: { config: { emojis: ["🍪,🧶,📻,🪴,🐓,☕"] } },
  5: { fields: { hint: ["Qui triava el canal de la tele? Que ho decideixi el duel de sempre."], gameWhy: ["Pedra, paper o tisora: així resolíeu les disputes."] } },
  6: { config: { bad: ["🪼"] } },
  8: {
    fields: {
      hint: [
        "El camí a l'escola semblava un laberint gegant. Avui el recorres sense por.",
        "La campana de l'escola és molt especial: només sona si la pares al moment exacte. Tens cinc intents.",
      ],
      gameWhy: ["Troba el camí fins a la porta de l'escola.", "Zona verda: parar la campana de l'escola al moment just."],
    },
  },
  15: {
    fields: {
      title: ["La nostra paraula secreta"],
      when: ["Codi entre germanes", "Reto de lletres"],
      hint: ["Les lletres s'han barrejat. Ordena-les per recuperar les paraules que només nosaltres entenem."],
      gameWhy: ["Anagrames amb el vostre codi secret."],
    },
    config: { words: ["GERMANES:👭 El que som\nSECRET:🤫 El que guardem\nSEMPRE:♾️ Fins quan"] },
  },
  16: { fields: { title: ["Quant em coneixes?"], when: ["Avui"], hint: ["Un test ràpid sobre mi. Si l'aproves, hi ha premi."], gameWhy: ["Trivial amb preguntes sobre vosaltres."] } },
  19: {
    fields: {
      title: ["El ball", "Torre de records", "La pista de ball", "Després de la festa"],
      when: ["Aquella festa", "Bloc a bloc", "La festa", "L'endemà"],
      hint: [
        "Ritme, ritme, ritme. Atura't just al compàs.",
        "Cada record és un bloc. Apila'ls amb molta punteria perquè la torre no s'ensorri!",
        "Ballar és com recórrer un camí de passos precisos. Troba el camí a través del laberint per arribar al final de la pista de ball!",
        "La festa va ser espectacular… però l'endemà tot estava ple de deixalles. Classifica cada cosa al seu contenidor!",
      ],
      gameWhy: [
        "Joc de ritme.",
        "Apilar blocs: construir la nostra història bloc a bloc.",
        "Laberint: trobar els passos correctes fins al final de la pista de ball.",
        "Ordena el caos: reciclar el que va quedar després de la festa.",
      ],
    },
  },
  22: { fields: { hint: ["Hi ha un dia de l'any que és només nostre. Obre el cadenat amb els seus números."], gameWhy: ["Cadenat amb la data d'un dia important."] } },
  26: { fields: { hint: ["Entre tants d'iguals, sempre n'hi havia un de diferent… com la teva broma."], gameWhy: ["Troba l'intrús."] } },
  29: { fields: { title: ["La nostra història"], when: ["Fins avui"], hint: ["Ordena els capítols de la nostra vida. Tu ja saps el final."], gameWhy: ["Ordenar cronològicament els grans moments."] } },
};

function cleanLegacy(o: Partial<Memory> | undefined): Partial<Memory> | undefined {
  if (!o || typeof o.id !== "number") return o;
  const c: Partial<Memory> = { ...o };
  // Esfera 1: el text antic del Minion (amb variants) ara és a la targeta d'inici
  if (o.id === 1 && typeof c.hint === "string" && c.hint.includes("Minion molt trapella")) delete c.hint;
  const legacy = LEGACY[o.id];
  if (!legacy) return c;
  const fields = legacy.fields || {};
  (Object.keys(fields) as LegacyField[]).forEach((k) => {
    const v = c[k];
    if (typeof v === "string" && (fields[k] || []).includes(v)) delete c[k];
  });
  if (legacy.config && c.config) {
    const cfg: Record<string, any> = { ...c.config };
    Object.entries(legacy.config).forEach(([k, olds]) => {
      if (typeof cfg[k] === "string" && olds.includes(cfg[k])) delete cfg[k];
    });
    c.config = cfg;
  }
  return c;
}

/** Mezcla una lista base de recuerdos con cambios parciales (por id).
 *  REGLA: el `gameKey` (qué minijuego tiene cada esfera) lo decide memories.ts.
 *  Solo se respeta el de la capa guardada si se cambió desde el panel (config.__gameCustom).
 *  Así un recuerdos.json antiguo nunca bloquea un cambio de juego hecho en el código. */
export function applyMemoryOverrides(base: Memory[], over: Partial<Memory>[] = []): Memory[] {
  if (!Array.isArray(over) || over.length === 0) return base;
  return base.map((m) => {
    const o = { ...(cleanLegacy(over.find((x) => x && x.id === m.id)) || {}) };
    if ((o.config as Record<string, any> | undefined)?.__gameCustom !== "1") delete o.gameKey;
    const merged = { ...m, ...o, config: { ...(m.config || {}), ...(o.config || {}) } };
    return {
      ...merged,
      emotion: normalizeEmotion(merged.emotion),
      emotion2: normalizeSecondaryEmotion(merged.emotion2),
    };
  });
}

/** Combina el text per defecte amb les capes desades. Descarta el text d'inici antic ("Benvinguda!…"). */
export function mergeFinal(...parts: Partial<FinalMemory>[]): FinalMemory {
  const merged: FinalMemory = { ...FINAL_DEFAULT };
  parts.forEach((p) => {
    if (!p) return;
    const c: Partial<FinalMemory> = { ...p };
    if (typeof c.homeText === "string" && /^Benvinguda!/.test(c.homeText.trim())) delete c.homeText;
    Object.assign(merged, c);
  });
  return merged;
}

/* ---------- Cambios guardados en ESTE navegador (panel de edición) ---------- */

/** Textos editats en aquest navegador (petits, sempre caben). */
export function loadLocalMemoryOverrides(): Partial<Memory>[] {
  const texts = readJson<MemText[]>(KEY_TXT) || [];
  const photos = readJson<MemPhoto[]>(KEY_PHOTO);
  // Si les fotos locales no s'han pogut desar, no s'apliquen: així les fotos
  // publicades a recuerdos.json continuen visibles en comptes de quedar en blanc.
  if (!photos) return texts.filter((t) => t && typeof t.id === "number");
  const map = new Map<number, string>();
  photos.forEach((p) => { if (p && typeof p.id === "number") map.set(p.id, p.photo || ""); });
  return texts
    .filter((t) => t && typeof t.id === "number")
    .map((t) => ({ ...t, photo: map.get(t.id) || "" }));
}

export function loadLocalFinalOverride(): Partial<FinalMemory> {
  const txt = readJson<Partial<FinalMemory>>(KEY_FINAL_TXT) || {};
  const photo = readJson<{ photo: string }>(KEY_FINAL_PHOTO);
  return photo ? { ...txt, photo: photo.photo || "" } : { ...txt };
}

export function loadMemories(): Memory[] {
  return applyMemoryOverrides(DEFAULT_MEMORIES, loadLocalMemoryOverrides());
}

export function loadFinal(): FinalMemory {
  return mergeFinal(loadLocalFinalOverride());
}

/* ---------- Desat local amb DEBOUNCE ----------
 * Escriure a localStorage en cada lletra omplia la quota (les fotos en base64 pesen molt)
 * i llençava un alert bloquejant. Ara s'escriu 800 ms després de deixar d'escriure, i les fotos
 * es guarden en una clau pròpia: si no caben, els textos es desen igualment i les fotos
 * publicades a recuerdos.json continuen visibles. Mai fa alert. */

type MemText = Partial<Memory> & { id: number };
type MemPhoto = { id: number; photo: string };

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export type SaveStatus = { scope: "memories" | "final"; ok: boolean; stripped: boolean };
const saveListeners = new Set<(s: SaveStatus) => void>();

/** Subscripció perquè la interfície pugui avisar sense bloquejar l'escriptura. */
export function onSaveStatus(cb: (s: SaveStatus) => void) {
  saveListeners.add(cb);
  return () => { saveListeners.delete(cb); };
}
function emit(s: SaveStatus) { saveListeners.forEach((l) => l(s)); }

function writeMemories(list: Memory[]): SaveStatus {
  // Textos: petits, gairebé sempre caben
  const texts: MemText[] = list.map(({ photo, ...rest }) => ({ ...rest, id: rest.id }));
  let txtOk = true;
  try { localStorage.setItem(KEY_TXT, JSON.stringify(texts)); } catch { txtOk = false; }

  // Fotos: en base64 poden esgotar la quota. Si fallen, s'esborra la clau perquè
  // no deixi valors buits que taparien les fotos publicades a recuerdos.json.
  const photos: MemPhoto[] = list.map((m) => ({ id: m.id, photo: m.photo || "" }));
  let photoOk = true;
  try { localStorage.setItem(KEY_PHOTO, JSON.stringify(photos)); }
  catch { photoOk = false; try { localStorage.removeItem(KEY_PHOTO); } catch { /* res a fer */ } }

  if (txtOk) markSaved();
  return { scope: "memories", ok: txtOk && photoOk, stripped: !photoOk };
}

function writeFinal(f: FinalMemory): SaveStatus {
  const { photo, ...rest } = f;
  let txtOk = true;
  try { localStorage.setItem(KEY_FINAL_TXT, JSON.stringify(rest)); } catch { txtOk = false; }

  let photoOk = true;
  try { localStorage.setItem(KEY_FINAL_PHOTO, JSON.stringify({ photo: photo || "" })); }
  catch { photoOk = false; try { localStorage.removeItem(KEY_FINAL_PHOTO); } catch { /* res a fer */ } }

  if (txtOk) markSaved();
  return { scope: "final", ok: txtOk && photoOk, stripped: !photoOk };
}

let memTimer: ReturnType<typeof setTimeout> | null = null;
let memPending: Memory[] | null = null;
let finTimer: ReturnType<typeof setTimeout> | null = null;
let finPending: FinalMemory | null = null;

/** Programa el desat (no bloqueja mentre s'escriu). Es pot forçar amb flushLocal(). */
export function saveMemories(list: Memory[]) {
  memPending = list;
  if (memTimer) clearTimeout(memTimer);
  memTimer = setTimeout(flushMemories, 800);
}

export function saveFinal(f: FinalMemory) {
  finPending = f;
  if (finTimer) clearTimeout(finTimer);
  finTimer = setTimeout(flushFinal, 800);
}

/** Escriu ara mateix el que estigui pendent. */
export function flushMemories() {
  if (memTimer) { clearTimeout(memTimer); memTimer = null; }
  if (memPending) emit(writeMemories(memPending));
  memPending = null;
}
export function flushFinal() {
  if (finTimer) { clearTimeout(finTimer); finTimer = null; }
  if (finPending) emit(writeFinal(finPending));
  finPending = null;
}
export function flushLocal() {
  flushMemories();
  flushFinal();
}

// Si es tanca o es recarrega la pàgina, no es perd l'últim canvi pendent
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", flushLocal);
  window.addEventListener("pagehide", flushLocal);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flushLocal(); });
}

/* ---------- Contenido publicado en la web (public/recuerdos.json) ---------- */

export async function loadPublished(): Promise<{ memories: Partial<Memory>[]; final: Partial<FinalMemory>; v?: number; sig: string } | null> {
  try {
    // ?t=… evita la memòria cau de GitHub Pages (fins a 10 min): sempre arriba l'última versió
    const url = new URL(`recuerdos.json?t=${Date.now()}`, window.location.href).toString();
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") || "";
    if (!type.includes("json")) return null; // el servidor ha retornat l'index.html de reserva
    const text = await res.text();
    const data = JSON.parse(text);
    if (!data || !Array.isArray(data.memories)) return null;
    const sig = hashText(text);
    publishedSig = sig;
    const v = typeof data.v === "number" ? data.v : 1;
    stalePublished = v < CONTENT_VERSION;
    if (!stalePublished) return { memories: data.memories, final: data.final || {}, v, sig };
    // JSON d'una versió anterior: conserva els canvis que l'usuari va editar,
    // però neteja valors antics coneguts. El gameKey continuarà sent decidit per
    // memories.ts tret que el canvi s'hagi fet explícitament des del desplegable.
    const mems = (data.memories as Partial<Memory>[])
      .map((o) => cleanLegacy(o))
      .filter((x): x is Partial<Memory> => !!x && typeof x.id === "number");
    // El missatge final també pot ser personal: una versió antiga del JSON no l'ha
    // d'esborrar només perquè s'ha actualitzat el codi.
    const fin: Partial<FinalMemory> = data.final && typeof data.final === "object" ? data.final : {};
    return { memories: mems, final: fin, v, sig };
  } catch {
    return null;
  }
}

/* ---------- Progreso (por dispositivo) ---------- */

export function loadProgress(): Progress {
  try {
    return JSON.parse(localStorage.getItem(KEY_PROG) || "{}");
  } catch {
    return {};
  }
}
export function saveProgress(p: Progress) {
  try {
    localStorage.setItem(KEY_PROG, JSON.stringify(p));
  } catch {
    /* sin espacio: el progreso no es crítico */
  }
}
export function resetProgress() {
  localStorage.removeItem(KEY_PROG);
}

/* ---------- Exportar / importar ---------- */

/** Només els camps que difereixen del valor per defecte del codi. */
function pickDiff<T extends object>(base: T, cur: T, keys: (keyof T)[]): Partial<T> {
  const out: Partial<T> = {};
  keys.forEach((k) => {
    if (JSON.stringify(base[k]) !== JSON.stringify(cur[k])) (out as Record<string, unknown>)[k as string] = cur[k];
  });
  return out;
}

const MEM_KEYS: (keyof Memory)[] = ["kind", "title", "emotion", "emotion2", "when", "hint", "gameKey", "gameWhy", "message", "photo", "photoCaption", "config"];
const FINAL_KEYS = ["homeText", "title", "message", "photo"] as const;

/** Exporta NOMÉS el que s'ha editat al panell. Així el recuerdos.json no tapa mai
 *  els valors que venen de memories.ts (emojis, jocs per defecte…). */
export function exportAll(memories: Memory[], final: FinalMemory, filename = "recuerdos.json") {
  const diff = memories
    .map((m) => {
      const base = DEFAULT_MEMORIES.find((d) => d.id === m.id);
      if (!base) return m as unknown as Partial<Memory> & { id: number };
      const norm = (x: Memory) => ({ ...x, config: x.config && Object.keys(x.config).length ? x.config : undefined });
      const d = pickDiff(norm(base), norm(m), MEM_KEYS);
      return Object.keys(d).length ? { id: m.id, ...d } : null;
    })
    .filter((x): x is Partial<Memory> & { id: number } => x !== null);
  const finalDiff = pickDiff(FINAL_DEFAULT, final, [...FINAL_KEYS] as unknown as (keyof typeof FINAL_DEFAULT)[]);
  const payload = { v: CONTENT_VERSION, exportedAt: Date.now(), memories: diff, final: finalDiff };
  const text = JSON.stringify(payload, null, 2);
  // Només el recuerdos.json principal (no les còpies de seguretat): quan el publiquis,
  // l'empremta coincidirà i aquest navegador conservarà els seus canvis.
  if (filename === "recuerdos.json") {
    try { localStorage.setItem(KEY_BASE_SIG, hashText(text)); } catch { /* ignorat */ }
  }
  const blob = new Blob([text], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

/** Importa un JSON (nou format parcial o antic format complet) i l'aplica sobre els valors per defecte. */
export function importAll(file: File): Promise<{ memories: Memory[]; final: FinalMemory }> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(String(r.result));
        res({ memories: applyMemoryOverrides(DEFAULT_MEMORIES, data.memories || []), final: mergeFinal(data.final || {}) });
      } catch (e) {
        rej(e);
      }
    };
    r.readAsText(file);
  });
}

export function fileToDataUrl(file: File, maxSize = 1000): Promise<string> {
  return new Promise((res, rej) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      res(canvas.toDataURL("image/jpeg", 0.82));
      URL.revokeObjectURL(url);
    };
    img.onerror = rej;
    img.src = url;
  });
}
