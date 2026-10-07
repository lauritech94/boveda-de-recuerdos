import { CONTENT_VERSION } from "./memories";

/**
 * Dades del calendari d'anticipació (?sorpresa=1), editables des del panell (?editar=1).
 * Mateix sistema de capes que els records:
 *   codi (per defecte) ← recuerdos.json publicat ← canvis locals del panell
 */

export type TeaserDia = {
  dia: number;
  emoji: string;
  titol: string;
  intro: string; // text abans de rascar
  secret: string; // el que hi ha sota la capa de plata (curt, 2 línies màxim)
  cosaEmoji: string; // icona del "Has trobat:"
  cosaNom: string;
  text: string; // missatge després de rascar
  foto?: string;
  peu?: string;
};

export type TeaserData = {
  any: number;
  hora: number; // hora d'obertura de cada porta (0-23)
  missatgeInicial: string;
  dies: TeaserDia[];
};

export const TEASER_DEFAULT: TeaserData = {
  any: 2026,
  hora: 8,
  missatgeInicial: `Un Minion molt trapella ronda per casa.

Cada dia a les 08:00 s'obre una porta nova.

Rasca-la i descobreix què t'ha deixat.`,
  dies: [
    {
      dia: 4,
      emoji: "🎂",
      titol: "Per molts anys!",
      intro:
        "Avui és el teu dia… i el Minion no s'ha pogut aguantar.\n\nT'ha deixat una carta, però li ha tapat el més important amb una capa de plata. Rasca-la!",
      secret: "DISSABTE\n7 de novembre 🔮",
      cosaEmoji: "🍌",
      cosaNom: "El plàtan del Minion",
      text: "Aquest dissabte t'espera una aventura molt especial.\n\nUn Minion molt trapella té alguna cosa teva… i necessitarem la teva ajuda per recuperar-la.\n\nA partir d'avui, cada dia a les 08:00 s'obrirà una porta nova. Només has de tornar a obrir aquesta mateixa targeta. 💛",
    },
    {
      dia: 5,
      emoji: "🍌",
      titol: "Ha passat per aquí",
      intro: "Algú ha estat rondant per casa aquesta nit.\n\nHa deixat una cosa a terra, però està tot tapat. Rasca per veure què és!",
      secret: "Una pell\nde plàtan 🍌",
      cosaEmoji: "👣",
      cosaNom: "Unes petjades",
      text: "El Minion ha tornat a passar per aquí.\n\nNo sabem què busca ni on s'amaga, però cada nit deixa alguna cosa enrere.\n\nDemà hi tornarà. 👀",
    },
    {
      dia: 6,
      emoji: "🔔",
      titol: "Està nerviós",
      intro: "Avui ha deixat caure una cosa amb molta pressa.\n\nSembla que té un pla per a demà… Rasca!",
      secret: "Demà\nens veiem ✨",
      cosaEmoji: "⏰",
      cosaNom: "Un rellotge",
      text: "El Minion està nerviós: demà és el seu gran dia… o el teu.\n\nDescansa bé aquesta nit, que demà et tocarà córrer.\n\nDemà ho entendràs tot. 💛",
    },
    {
      dia: 7,
      emoji: "🔮",
      titol: "Avui és el dia",
      intro: "Ha arribat el moment.\n\nLa darrera porta té el segell més gruixut de tots. Rasca fort!",
      secret: "A casa\ndels papes 🏠",
      cosaEmoji: "🎉",
      cosaNom: "La sorpresa",
      text: "Avui, a les 17:00, a casa dels papes.\n\nVine amb ganes de jugar i de passar-t'ho bé: t'hi esperem tots. 💛\n\n(I el Minion també. Ell diu que no, però sí.)",
    },
  ],
};

const KEY_TEASER = `teaser_contingut_v${CONTENT_VERSION}`;

/** Combina les capes: per defecte ← publicat ← local. Els dies es fusionen per número. */
export function mergeTeaser(...parts: (Partial<TeaserData> | null | undefined)[]): TeaserData {
  const out: TeaserData = { ...TEASER_DEFAULT, dies: TEASER_DEFAULT.dies.map((d) => ({ ...d })) };
  for (const p of parts) {
    if (!p) continue;
    if (typeof p.any === "number") out.any = p.any;
    if (typeof p.hora === "number" && p.hora >= 0 && p.hora <= 23) out.hora = p.hora;
    if (typeof p.missatgeInicial === "string" && p.missatgeInicial.trim()) out.missatgeInicial = p.missatgeInicial;
    if (Array.isArray(p.dies)) {
      for (const pd of p.dies) {
        if (!pd || typeof pd.dia !== "number") continue;
        const idx = out.dies.findIndex((d) => d.dia === pd.dia);
        if (idx >= 0) out.dies[idx] = { ...out.dies[idx], ...pd };
      }
    }
  }
  return out;
}

export function loadLocalTeaser(): Partial<TeaserData> | null {
  try {
    const raw = localStorage.getItem(KEY_TEASER);
    return raw ? (JSON.parse(raw) as Partial<TeaserData>) : null;
  } catch {
    return null;
  }
}

export function saveLocalTeaser(t: TeaserData) {
  try {
    localStorage.setItem(KEY_TEASER, JSON.stringify(t));
  } catch {
    /* sense espai: els textos del teaser són petits, no hauria de passar */
  }
}

/** Només les diferències respecte al valor per defecte (per a l'exportació). */
export function diffTeaser(t: TeaserData): Partial<TeaserData> | null {
  const out: Partial<TeaserData> = {};
  if (t.any !== TEASER_DEFAULT.any) out.any = t.any;
  if (t.hora !== TEASER_DEFAULT.hora) out.hora = t.hora;
  if (t.missatgeInicial !== TEASER_DEFAULT.missatgeInicial) out.missatgeInicial = t.missatgeInicial;
  const dies: Partial<TeaserDia>[] = [];
  for (const d of t.dies) {
    const base = TEASER_DEFAULT.dies.find((x) => x.dia === d.dia);
    if (!base) { dies.push(d); continue; }
    const delta: Record<string, unknown> = { dia: d.dia };
    (Object.keys(d) as (keyof TeaserDia)[]).forEach((k) => {
      if (k !== "dia" && JSON.stringify(d[k]) !== JSON.stringify(base[k])) delta[k] = d[k];
    });
    if (Object.keys(delta).length > 1) dies.push(delta as Partial<TeaserDia>);
  }
  if (dies.length) out.dies = dies as TeaserDia[];
  return Object.keys(out).length ? out : null;
}
