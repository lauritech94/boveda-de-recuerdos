import { DEFAULT_MEMORIES, FINAL_DEFAULT, Memory } from "./memories";

const KEY_MEM = "esferas_memorias_v1";
const KEY_FINAL = "esferas_final_v1";
const KEY_PROG = "esferas_progreso_v1";

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
  2: { fields: { title: ["El dia que vas arribar"], when: ["El principi de tot"], hint: ["Tot va començar amb un número: l'any en què la família va créixer."], gameWhy: ["Endevinar l'any de naixement."] } },
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

/* ---------- Fusió a tres bandes (codi · desat · edició) ----------
 *  Cada canvi desat guarda també quin era el text del codi en aquell moment (`_base`).
 *  En carregar: si el text del codi ja no és el mateix que `_base`, vol dir que s'ha
 *  canviat el codi DESPRÉS del desat → mana el codi. Si coincideix, mana la vostra edició.
 *  Així, canviar un text a memories.ts ja no queda tapat per un recuerdos.json antic,
 *  i les vostres fotos i missatges no es perden mai.                                   */

const MEM_FIELDS: (keyof Memory)[] = ["kind", "title", "emotion", "emotion2", "when", "hint", "gameKey", "gameWhy", "message", "photo", "photoCaption"];
const FINAL_FIELDS: (keyof FinalMemory)[] = ["homeText", "title", "message", "photo"];

type MemOverride = Partial<Memory> & { id: number; _base?: Record<string, any>; _baseConfig?: Record<string, any> };
export type FinalOverride = Partial<FinalMemory> & { _base?: Record<string, any> };

const same = (a: any, b: any) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/** Calcula què s'ha editat respecte del codi, desant-ne també el valor original. */
export function computeOverrides(list: Memory[]): MemOverride[] {
  const out: MemOverride[] = [];
  list.forEach((m) => {
    const def = DEFAULT_MEMORIES.find((d) => d.id === m.id);
    if (!def) { out.push({ ...(m as MemOverride) }); return; }
    const o: MemOverride = { id: m.id };
    const b: Record<string, any> = {};
    MEM_FIELDS.forEach((k) => {
      if (!same(m[k], def[k])) { (o as any)[k] = m[k]; b[k as string] = def[k] ?? null; }
    });
    const cur = m.config || {}, dft = def.config || {};
    const cfg: Record<string, any> = {}, cfgBase: Record<string, any> = {};
    Object.keys(cur).forEach((k) => {
      if (!same(cur[k], dft[k])) { cfg[k] = cur[k]; cfgBase[k] = dft[k] ?? null; }
    });
    if (Object.keys(cfg).length) { o.config = cfg; o._baseConfig = cfgBase; }
    if (Object.keys(b).length) o._base = b;
    if (Object.keys(o).length > 1) out.push(o);
  });
  return out;
}

export function computeFinalOverride(final: FinalMemory): FinalOverride {
  const o: FinalOverride = {};
  const b: Record<string, any> = {};
  FINAL_FIELDS.forEach((k) => {
    if (!same(final[k], FINAL_DEFAULT[k])) { (o as any)[k] = final[k]; b[k as string] = FINAL_DEFAULT[k] ?? null; }
  });
  if (Object.keys(b).length) o._base = b;
  return o;
}

/** Aplica els canvis desats sobre la llista del codi. */
export function applyMemoryOverrides(base: Memory[], over: Partial<Memory>[] = []): Memory[] {
  if (!Array.isArray(over) || over.length === 0) return base;
  return base.map((m) => {
    const found = over.find((x) => x && x.id === m.id) as MemOverride | undefined;
    if (!found) return m;
    const o = cleanLegacy(found) as MemOverride;
    const def = DEFAULT_MEMORIES.find((d) => d.id === m.id) || m;
    const res: Memory = { ...m };

    MEM_FIELDS.forEach((k) => {
      if (!(k in o)) return;
      // El joc el decideix el codi, tret que s'hagi triat expressament al panell
      if (k === "gameKey" && (o.config as Record<string, any> | undefined)?.__gameCustom !== "1") return;
      // Si el codi ha canviat des del desat, mana el codi
      if (o._base && k in o._base && !same(o._base[k as string], def[k])) return;
      (res as any)[k] = (o as any)[k];
    });

    const cfg: Record<string, any> = { ...(m.config || {}) };
    Object.entries(o.config || {}).forEach(([k, v]) => {
      if (o._baseConfig && k in o._baseConfig && !same(o._baseConfig[k], (def.config || {})[k])) return;
      cfg[k] = v;
    });
    res.config = cfg;
    return res;
  });
}

/** Combina els textos de la pantalla d'inici i del missatge final. */
export function mergeFinal(...parts: Partial<FinalMemory>[]): FinalMemory {
  const merged: FinalMemory = { ...FINAL_DEFAULT };
  parts.forEach((p) => {
    if (!p) return;
    const o = p as FinalOverride;
    const c: Partial<FinalMemory> = { ...p };
    delete (c as any)._base;
    // Text d'inici per defecte d'una versió anterior: el descartem
    if (typeof c.homeText === "string" && /^Benvinguda!/.test(c.homeText.trim())) delete c.homeText;
    FINAL_FIELDS.forEach((k) => {
      if (!(k in c)) return;
      if (o._base && k in o._base && !same(o._base[k as string], FINAL_DEFAULT[k])) { delete (c as any)[k]; return; }
    });
    Object.assign(merged, c);
  });
  return merged;
}

/* ---------- Cambios guardados en ESTE navegador (panel de edición) ---------- */

export function loadLocalMemoryOverrides(): Partial<Memory>[] {
  try {
    const raw = localStorage.getItem(KEY_MEM);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function loadLocalFinalOverride(): Partial<FinalMemory> {
  try {
    return JSON.parse(localStorage.getItem(KEY_FINAL) || "{}");
  } catch {
    return {};
  }
}

export function loadMemories(): Memory[] {
  return applyMemoryOverrides(DEFAULT_MEMORIES, loadLocalMemoryOverrides());
}

export function loadFinal(): FinalMemory {
  return mergeFinal(loadLocalFinalOverride());
}

export function saveMemories(list: Memory[]) {
  try {
    localStorage.setItem(KEY_MEM, JSON.stringify(computeOverrides(list)));
  } catch {
    alert(
      "No se pudo guardar en este navegador: las fotos ocupan demasiado.\n\n" +
        "Soluciones: usa rutas de imagen (fotos/01.jpg) en vez de subirlas, o exporta el JSON y publícalo como public/recuerdos.json."
    );
  }
}

export function saveFinal(f: FinalMemory) {
  try {
    localStorage.setItem(KEY_FINAL, JSON.stringify(computeFinalOverride(f)));
  } catch {
    /* ignorado: mismo motivo que arriba */
  }
}

/* ---------- Contenido publicado en la web (public/recuerdos.json) ---------- */

export async function loadPublished(): Promise<{ memories: Partial<Memory>[]; final: Partial<FinalMemory> } | null> {
  try {
    const url = new URL("recuerdos.json", window.location.href).toString();
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") || "";
    if (!type.includes("json")) return null; // el servidor devolvió el index.html de fallback
    const data = await res.json();
    if (!data || !Array.isArray(data.memories)) return null;
    return { memories: data.memories, final: data.final || {} };
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

/** Exporta NOMÉS el que s'ha editat al panell, amb el valor original de cada camp (`_base`).
 *  Així el recuerdos.json no tapa mai un canvi posterior fet al codi. */
export function exportAll(memories: Memory[], final: FinalMemory, filename = "recuerdos.json") {
  const payload = { v: 3, memories: computeOverrides(memories), final: computeFinalOverride(final) };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
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
