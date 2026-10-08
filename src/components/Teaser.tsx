import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { MinionImg } from "./MinionImg";
import { GameScratch } from "../games/set4";
import { playSound, vibrate } from "./useSound";
import { DEFAULT_TEASER_DAYS, TeaserDay } from "../data/memories";

/**
 * 🗓️ CALENDARI D'ANTICIPACIÓ  ·  enllaç de l'NFC: ?sorpresa=1
 *
 * Una sola targeta NFC. Quatre portes (4, 5, 6 i 7 de novembre).
 * La primera SEMPRE està oberta (és la del seu aniversari, es dóna aquell dia).
 * Les altres s'obren a les 08:00 del seu dia.
 *
 * ⚠️ IMPORTANT: les portes 2 i 3 no han de donar cap pista del joc de les esferes.
 * Només la 4 revela on i a quina hora.
 *
 * ─── PROVES (només nosaltres) ───────────────────────────────────────────────
 *   ?sorpresa=1&admin=minion2026       → panell de control amagat
 *   ?sorpresa=1&ara=2026-11-05T09:00   → simula un dia/hora concret
 * ────────────────────────────────────────────────────────────────────────────
 */
const ANY = 2026;
const MES = 11;
const HORA_OBERTURA = 8;
const KEY = "teaser_rascat_v1";
const KEY_OVR = "teaser_overrides_v1";
const KEY_FLAGS = "teaser_flags_v1";
const ADMIN_KEY = "minion2026";

export type Dia = TeaserDay & {
  cosa: { emoji: string; nom: string };
};

export function mapTeaserDays(days: TeaserDay[]): Dia[] {
  return days.map((d) => ({
    ...d,
    cosa: { emoji: d.cosaEmoji, nom: d.cosaNom },
  }));
}

export const CALENDARI: Dia[] = mapTeaserDays(DEFAULT_TEASER_DAYS);

const MISSATGE_INICIAL = `Un Minion molt trapella ronda per casa.

Cada dia a les 08:00 s'obre una porta nova.

Rasca-la i descobreix què t'ha deixat.`;

/* ---------- utilitats de temps ---------- */
const DIES = ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"];
const MESOS = ["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"];
const HORA = `${String(HORA_OBERTURA).padStart(2, "0")}:00`;

type Overrides = Record<number, "open" | "blocked">;
type Flags = { senseHores: boolean; circuit: boolean };

function obertura(d: Dia, senseHores: boolean): number {
  return new Date(ANY, MES - 1, d.dia, senseHores ? 0 : HORA_OBERTURA, 0, 0).getTime();
}
function etiqueta(d: Dia): string {
  const dt = new Date(ANY, MES - 1, d.dia);
  return `${DIES[dt.getDay()]} ${d.dia} de ${MESOS[MES - 1]}`;
}
function quanTxt(d: Dia, now: number): string {
  const o = new Date(obertura(d, false));
  const avui0 = new Date(now);
  avui0.setHours(0, 0, 0, 0);
  const o0 = new Date(o);
  o0.setHours(0, 0, 0, 0);
  const dies = Math.round((o0.getTime() - avui0.getTime()) / 86400000);
  if (dies <= 0) return "avui";
  if (dies === 1) return "demà";
  return `el ${DIES[o.getDay()]} ${d.dia}`;
}
function formatRestant(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const hms = [Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60].map((n) => String(n).padStart(2, "0")).join(":");
  return d > 0 ? `${d} ${d === 1 ? "dia" : "dies"} ${hms}` : hms;
}

/** Hora simulada per provar (?ara=2026-11-05T09:00). null = hora real. */
function usarSimulacio(): number | null {
  const p = new URLSearchParams(window.location.search);
  const raw = p.get("ara");
  if (!raw) return null;
  const solo = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const t = solo ? new Date(+solo[1], +solo[2] - 1, +solo[3], 12, 0, 0).getTime() : new Date(raw).getTime();
  return isNaN(t) ? null : t;
}

function llegir<T>(k: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Una porta està oberta? Prioritat: manual > sempre oberta > mode circuit > data i hora. */
function portaOberta(d: Dia, now: number, ovr: Overrides, flags: Flags): boolean {
  const o = ovr[d.dia];
  if (o === "open") return true;
  if (o === "blocked") return false;
  if (d.sempreOberta) return true;
  if (flags.circuit) return true;
  return now >= obertura(d, flags.senseHores);
}

const COLORS = ["#ffd93d", "#4d96ff", "#ff6b6b", "#6bcb77", "#b983ff"];

export function Teaser({ daysData }: { daysData?: TeaserDay[] }) {
  const [simT] = useState<number | null>(usarSimulacio);
  const [offset] = useState(() => (simT === null ? 0 : simT - Date.now()));
  const [, setTick] = useState(0);
  // L'App no munta el calendari fins que records.json ja està carregat.
  // Per tant aquí només usem les dades definitives que ens passa l'App: cap parpelleig.
  const days = mapTeaserDays(daysData || DEFAULT_TEASER_DAYS);
  const [rascades, setRascades] = useState<number[]>(() => (simT === null ? llegir<number[]>(KEY, []) : []));
  const [ovr, setOvr] = useState<Overrides>(() => llegir<Overrides>(KEY_OVR, {}));
  const [flags, setFlags] = useState<Flags>(() => llegir<Flags>(KEY_FLAGS, { senseHores: false, circuit: false }));
  const [oberta, setOberta] = useState<number | null>(null);
  const [avis, setAvis] = useState<string | null>(null);

  const esAdmin = new URLSearchParams(window.location.search).get("admin") === ADMIN_KEY;
  const modeProva = simT !== null || flags.circuit;

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (simT !== null) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(rascades));
      localStorage.setItem(KEY_OVR, JSON.stringify(ovr));
      localStorage.setItem(KEY_FLAGS, JSON.stringify(flags));
    } catch {
      /* ignorat */
    }
  }, [rascades, ovr, flags, simT]);

  const now = Date.now() + offset;
  const propera = days.find((d) => !portaOberta(d, now, ovr, flags)) || null;
  const dia = oberta !== null ? days.find((d) => d.dia === oberta) || null : null;
  const totRascat = rascades.length >= days.length;

  const tocar = (d: Dia) => {
    if (!portaOberta(d, now, ovr, flags)) {
      playSound("fail");
      setAvis(
        ovr[d.dia] === "blocked"
          ? "Aquesta porta està blocada ara mateix."
          : `Encara no! Aquesta porta s'obre ${quanTxt(d, now)} a les ${HORA}.`
      );
      setTimeout(() => setAvis(null), 2800);
      return;
    }
    playSound("tap");
    setOberta(d.dia);
  };

  // En acabar de rascar: es deixa llegir el que hi ha sota i després passa al missatge
  const alRascar = (d: Dia) => {
    playSound("ok");
    vibrate(60);
    setTimeout(() => {
      setRascades((prev) => (prev.includes(d.dia) ? prev : [...prev, d.dia]));
      playSound("reveal");
      vibrate([100, 60, 150]);
      confetti(
        d.gran
          ? { particleCount: 220, spread: 120, origin: { y: 0.55 }, colors: COLORS }
          : { particleCount: 90, spread: 70, origin: { y: 0.6 }, colors: COLORS }
      );
    }, 1900);
  };

  const base = window.location.origin + window.location.pathname;

  return (
    <main className="tarjeta animate-pop-in">
      <div className="cabecera mb-2 flex items-center justify-between">
        <span className="mundo">El Minion trapella</span>
        <span className="mundo" style={{ color: "#9a8a70" }}>{rascades.length} / {days.length} pistes</span>
      </div>

      {modeProva && (
        <p className="mb-3 rounded-xl bg-stone-900 px-3 py-2 text-[11px] font-semibold text-amber-200">
          🧪 Mode prova{simT !== null ? ` · ${new Date(now).toLocaleString("ca-ES")}` : " · totes les portes obertes"}. No és el dia real.
        </p>
      )}

      {/* ══════════════ PANELL DE CONTROL (només nosaltres) ══════════════ */}
      {esAdmin && (
        <section className="mb-5 rounded-2xl border-2 border-stone-800 bg-stone-900 p-4 text-left text-white">
          <p className="text-sm font-black">🔧 Panell de control</p>
          <p className="mt-1 text-[11px] font-semibold text-white/60">
            Només es veu si l'enllaç porta la clau. Quan acabis, deixa-ho tot en automàtic.
          </p>

          <div className="mt-3 space-y-2">
            {days.map((d) => {
              const oberta_ = portaOberta(d, now, ovr, flags);
              const motiu =
                ovr[d.dia] === "open" ? "oberta a mà"
                : ovr[d.dia] === "blocked" ? "bloquejada a mà"
                : d.sempreOberta ? "sempre oberta"
                : flags.circuit ? "mode circuit"
                : "automàtic";
              return (
                <div key={d.dia} className="rounded-xl bg-white/5 p-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold">
                      {d.emoji} {etiqueta(d)}{" "}
                      <span className={`ml-1 rounded px-1.5 py-0.5 text-[10px] ${oberta_ ? "bg-emerald-400/20 text-emerald-300" : "bg-red-400/20 text-red-300"}`}>
                        {oberta_ ? "🔓 oberta" : "🔒 tancada"} · {motiu}
                      </span>
                    </p>
                    {rascades.includes(d.dia) && <span className="text-[10px] text-emerald-300">rascada</span>}
                  </div>
                  <div className="mt-1.5 flex gap-1.5">
                    {(["auto", "open", "blocked"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setOvr((prev) => { const n = { ...prev }; if (m === "auto") delete n[d.dia]; else n[d.dia] = m; return n; })}
                        className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-bold ${
                          (m === "auto" && !ovr[d.dia]) || (m !== "auto" && ovr[d.dia] === m) ? "bg-amber-300 text-stone-900" : "bg-white/10 text-white/80 hover:bg-white/20"
                        }`}
                      >
                        {m === "auto" ? "Automàtic" : m === "open" ? "Obrir" : "Bloquejar"}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 space-y-1.5">
            <button
              onClick={() => setFlags((f) => ({ ...f, senseHores: !f.senseHores }))}
              className={`w-full rounded-xl px-3 py-2 text-left text-xs font-bold ${flags.senseHores ? "bg-amber-300 text-stone-900" : "bg-white/10 hover:bg-white/20"}`}
            >
              🕐 Obrir sense hores: {flags.senseHores ? "SÍ (des de les 00:00)" : "no (cal esperar les 08:00)"}
            </button>
            <button
              onClick={() => setFlags((f) => ({ ...f, circuit: !f.circuit }))}
              className={`w-full rounded-xl px-3 py-2 text-left text-xs font-bold ${flags.circuit ? "bg-amber-300 text-stone-900" : "bg-white/10 hover:bg-white/20"}`}
            >
              🔁 Mode circuit (totes obertes): {flags.circuit ? "ACTIU" : "desactivat"}
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <button onClick={() => { if (confirm("Esborrar les pistes rascades?")) setRascades([]); }} className="rounded-lg bg-red-500/80 px-3 py-2 text-[11px] font-bold text-white hover:bg-red-500">
              Reset rascades
            </button>
            <button
              onClick={() => { if (confirm("Deixar-ho tot en automàtic?")) { setOvr({}); setFlags({ senseHores: false, circuit: false }); setRascades([]); } }}
              className="rounded-lg bg-white/10 px-3 py-2 text-[11px] font-bold hover:bg-white/20"
            >
              Tot automàtic
            </button>
          </div>

          <p className="mt-3 text-[11px] font-black uppercase tracking-wider text-white/50">Provar-ho</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <a href={`${base}?sorpresa=1`} className="rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] font-bold hover:bg-white/20">👀 Com ho veu ella</a>
            {days.map((d) => (
              <a key={d.dia} href={`${base}?sorpresa=1&ara=${ANY}-11-0${d.dia}T09:00`} className="rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] font-bold hover:bg-white/20">
                {d.dia} nov
              </a>
            ))}
            <a href={`${base}?editar=1`} className="rounded-lg bg-amber-300 px-2.5 py-1.5 text-[11px] font-bold text-stone-900 hover:bg-amber-200">
              ✏️ Editar textos i fotos al panell
            </a>
          </div>

          <p className="mt-3 text-[11px] font-bold text-amber-200">
            ⚠️ Abans de donar-li el mòbil: prem «Tot automàtic» i comprova que cap porta digui «oberta a mà».
          </p>
        </section>
      )}

      {/* ══════════════ VISTA DE LES PORTES ══════════════ */}
      {!dia && (
        <>
          <div className="mx-auto flex justify-center">
            <MinionImg size={100} anim={totRascat ? "minion-salt" : "minion-anim"} />
          </div>
          <h1 className="titol mt-2">Quatre portes, quatre dies</h1>
          <section className="pista">{MISSATGE_INICIAL}</section>

          {propera && (
            <div className="mt-4 rounded-2xl bg-stone-900 px-4 py-3 text-white shadow-md">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-200">
                Propera porta · {etiqueta(propera)} a les {flags.senseHores ? "00:00" : HORA}
              </p>
              <p className="mt-1 text-3xl font-bold tabular-nums">{formatRestant(obertura(propera, flags.senseHores) - now)}</p>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {days.map((d) => {
              const oberta_ = portaOberta(d, now, ovr, flags);
              const feta = rascades.includes(d.dia);
              return (
                <button
                  key={d.dia}
                  onClick={() => tocar(d)}
                  className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-3 transition-all active:scale-95 ${
                    feta ? "border-emerald-300 bg-emerald-50" : oberta_ ? "animate-floaty border-orange-400 bg-orange-50" : "border-stone-200 bg-stone-50"
                  }`}
                >
                  <span className="text-3xl">{oberta_ ? d.emoji : "🔒"}</span>
                  <span className="text-lg font-bold tabular-nums text-stone-800">{d.dia} nov</span>
                  <span className={`text-[10px] font-semibold ${feta ? "text-emerald-600" : oberta_ ? "text-orange-600" : "text-stone-400"}`}>
                    {feta ? "✓ Vista" : oberta_ ? "Rasca!" : `${quanTxt(d, now)}, ${flags.senseHores ? "00:00" : HORA}`}
                  </span>
                </button>
              );
            })}
          </div>

        </>
      )}

      {/* ══════════════ UNA PORTA ══════════════ */}
      {dia && (
        <>
          <button onClick={() => setOberta(null)} className="mb-3 text-xs font-bold text-stone-500 hover:text-stone-800">
            ← Tornar a les portes
          </button>
          <div className="icono">{dia.emoji}</div>
          <h1 className="titol">{dia.titol}</h1>
          <p className="subtitulo">{etiqueta(dia)}</p>

          {!rascades.includes(dia.dia) ? (
            <>
              <section className="pista">{dia.intro}</section>
              <div className="mt-4">
                <GameScratch
                  key={dia.dia}
                  config={{ secret: dia.secret, label: "Rasca per descobrir què t'ha deixat", senseBanner: "1" }}
                  onComplete={() => alRascar(dia)}
                />
              </div>
            </>
          ) : (
            <div className="revela">
              <div className="mx-auto my-3 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-700">Això hi havia sota la capa</p>
                <p className="mt-1 whitespace-pre-line text-2xl font-bold leading-snug text-stone-800">{dia.secret}</p>
              </div>

              <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm ring-1 ring-amber-200">
                <span className="text-2xl">{dia.cosa.emoji}</span> Has trobat: {dia.cosa.nom}
              </div>

              {dia.foto && (
                <div className="polaroid grain mx-auto my-3 max-w-[340px]">
                  <img src={dia.foto} alt={dia.titol} />
                  {dia.peu && <p className="peu">{dia.peu}</p>}
                </div>
              )}

              <section className="pista">{dia.text}</section>
            </div>
          )}
        </>
      )}

      {avis && (
        <div className="fixed bottom-5 left-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 animate-pop-in rounded-2xl bg-stone-900 px-4 py-3 text-center text-sm font-bold text-white shadow-2xl">
          🔒 {avis}
        </div>
      )}
    </main>
  );
}
