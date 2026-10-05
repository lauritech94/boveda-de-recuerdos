import { DEFAULT_MEMORIES, FINAL_DEFAULT, Memory } from "./memories";

const KEY_MEM = "esferas_memorias_v1";
const KEY_FINAL = "esferas_final_v1";
const KEY_PROG = "esferas_progreso_v1";

export type Progress = Record<number, { label: string; date: string }>;
export type FinalMemory = typeof FINAL_DEFAULT;

/** Esfera 1: descarta valors d'una versió anterior (quan portava el missatge del Minion)
 *  que, desats al panell o a recuerdos.json, taparien el text nou. La foto i el missatge es conserven. */
function cleanLegacy(o: Partial<Memory> | undefined): Partial<Memory> | undefined {
  if (!o || o.id !== 1) return o;
  const c = { ...o };
  if (typeof c.hint === "string" && c.hint.includes("Minion molt trapella")) delete c.hint;
  if (c.title === "La Càmera dels Records") delete c.title;
  if (c.when === "Missatge urgent") delete c.when;
  return c;
}

/** Mezcla una lista base de recuerdos con cambios parciales (por id). */
export function applyMemoryOverrides(base: Memory[], over: Partial<Memory>[] = []): Memory[] {
  if (!Array.isArray(over) || over.length === 0) return base;
  return base.map((m) => {
    const o = cleanLegacy(over.find((x) => x && x.id === m.id));
    if (!o) return m;
    return { ...m, ...o, config: { ...(m.config || {}), ...(o.config || {}) } };
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
    localStorage.setItem(KEY_MEM, JSON.stringify(list));
  } catch {
    alert(
      "No se pudo guardar en este navegador: las fotos ocupan demasiado.\n\n" +
        "Soluciones: usa URLs de imagen en vez de subirlas, o exporta el JSON y publícalo como public/recuerdos.json."
    );
  }
}

export function saveFinal(f: FinalMemory) {
  try {
    localStorage.setItem(KEY_FINAL, JSON.stringify(f));
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
  const payload = { v: 2, memories: diff, final: finalDiff };
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
