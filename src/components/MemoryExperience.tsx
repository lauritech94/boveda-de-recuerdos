import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { APP_NAME, EMOTIONS, Memory } from "../data/memories";
import { GAME_DEFS } from "../games/registry";
import { Sphere } from "./Sphere";

type Props = {
  memory: Memory;
  unlocked: boolean;
  unlockedCount: number;
  othersUnlocked: number; // esferes desbloquejades sense comptar aquesta
  onUnlock: (label?: string) => void;
  onHome: () => void;
};

const pad = (n: number) => String(n).padStart(2, "0");

function toEmbed(url: string): { kind: "iframe" | "video" | "none"; src: string } {
  const u = (url || "").trim();
  if (!u) return { kind: "none", src: "" };
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return { kind: "iframe", src: `https://www.youtube.com/embed/${yt[1]}?rel=0` };
  const vm = u.match(/vimeo\.com\/(\d+)/);
  if (vm) return { kind: "iframe", src: `https://player.vimeo.com/video/${vm[1]}` };
  const dr = u.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (dr) return { kind: "iframe", src: `https://drive.google.com/file/d/${dr[1]}/preview` };
  return { kind: "video", src: u };
}

export function MemoryExperience({ memory: m, unlocked, unlockedCount, othersUnlocked, onUnlock, onHome }: Props) {
  const emo = EMOTIONS[m.emotion];
  const def = GAME_DEFS[m.gameKey];
  const Comp = def?.Comp;
  const [phase, setPhase] = useState<"intro" | "game" | "reveal">(unlocked ? "reveal" : "intro");
  const [gameDone, setGameDone] = useState(false);
  const [label, setLabel] = useState<string | undefined>();
  const [giftTaps, setGiftTaps] = useState(0);
  const [shaking, setShaking] = useState(false);

  useEffect(() => { setPhase(unlocked ? "reveal" : "intro"); setGameDone(false); setGiftTaps(0); }, [m.id]);

  // L'esfera 1 (missatge) es desbloqueja només en obrir-la
  useEffect(() => { if (m.kind === "intro" && !unlocked) onUnlock("llegit"); }, [m.id]);

  const celebrate = (big = false) => {
    confetti({ particleCount: big ? 180 : 90, spread: big ? 110 : 70, origin: { y: 0.6 }, colors: [emo.color, "#ffffff", m.emotion2 ? EMOTIONS[m.emotion2].color : "#ff9f43"] });
  };
  const handleComplete = (_s?: number, l?: string) => { if (gameDone) return; setGameDone(true); setLabel(l); celebrate(); };
  const reveal = () => { onUnlock(label); setPhase("reveal"); setTimeout(() => celebrate(true), 350); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const header = (
    <div className="cabecera flex items-center justify-between">
      <span className="mundo">{APP_NAME}</span>
      <span className="mundo" style={{ color: "#9a9bb0" }}>Esfera {pad(m.id)} / 30</span>
    </div>
  );

  /* ---------- ESFERA 1: MISSATGE ---------- */
  if (m.kind === "intro") {
    return (
      <main className="tarjeta animate-pop-in">
        <div className="icono">🔮</div>
        <h1 className="titol">{m.title}</h1>
        <p className="subtitulo">{m.when}</p>
        <section className="pista">{m.hint}</section>
        <div className="final">🔍 Busca la següent esfera per a començar l'aventura.</div>
        <button onClick={onHome} className="boto secundari">Veure totes les esferes</button>
      </main>
    );
  }

  /* ---------- ESFERA 30: VÍDEO (bloquejada fins tenir les altres) ---------- */
  const requireAll = m.kind === "video" && String(m.config?.requireAll ?? "true").toLowerCase() !== "false";
  if (m.kind === "video" && requireAll && !unlocked && othersUnlocked < 29) {
    return (
      <main className="tarjeta animate-pop-in">
        {header}
        <div className="icono">🔒</div>
        <h1 className="titol">L'última esfera</h1>
        <p className="subtitulo">Encara no es pot obrir</p>
        <section className="pista">{`Aquesta esfera està protegida amb un encriptat especial.

Només s'obrirà quan hagis desxifrat totes les altres.

Portes ${othersUnlocked} de 29. Et falten ${29 - othersUnlocked}.`}</section>
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full transition-all" style={{ width: `${(othersUnlocked / 29) * 100}%`, background: "linear-gradient(90deg,var(--color),var(--color2))" }} /></div>
        <div className="final">🔍 Continua buscant esferes.</div>
        <button onClick={onHome} className="boto secundari">Veure totes les esferes</button>
      </main>
    );
  }

  /* ---------- REVELACIÓ (comuna a joc / regal / vídeo) ---------- */
  if (phase === "reveal") {
    const embed = m.kind === "video" ? toEmbed(m.config?.videoUrl) : null;
    const isGift = m.kind === "gift";
    return (
      <main className="tarjeta animate-pop-in">
        {header}
        <div className="icono">{isGift ? m.config?.giftEmoji || "🎁" : m.kind === "video" ? "🎬" : emo.emoji}</div>
        <h1 className="titol">{isGift && m.config?.giftName ? m.config.giftName : m.title}</h1>
        <p className="subtitulo">{isGift ? m.title : m.when}</p>

        {m.kind === "video" && embed && embed.kind !== "none" && (
          <div className="mb-4 overflow-hidden rounded-2xl shadow-lg" style={{ border: "4px solid #fff" }}>
            {embed.kind === "iframe" ? (
              <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                <iframe src={embed.src} title="Vídeo" className="absolute inset-0 h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
            ) : (
              <video src={embed.src} controls playsInline className="w-full" />
            )}
          </div>
        )}
        {m.kind === "video" && embed && embed.kind === "none" && (
          <div className="mb-4 rounded-2xl bg-stone-100 p-6 text-sm font-bold text-stone-500">🎬 Aquí es veurà el vídeo.<br /><span className="text-xs font-semibold">Afegeix l'enllaç al Panel de edición → Esfera 30.</span></div>
        )}

        {m.photo ? (
          <img src={m.photo} alt={m.title} className="foto-record" />
        ) : m.kind !== "video" ? (
          <div className="flex h-48 flex-col items-center justify-center rounded-2xl text-center" style={{ background: emo.soft, color: emo.text }}>
            <span className="text-5xl">📷</span>
            <p className="mt-2 px-6 text-sm font-bold">Aquí apareixerà la fotografia del record</p>
            <p className="text-xs opacity-70">(Panel de edición · Esfera {m.id})</p>
          </div>
        ) : null}
        {m.photoCaption && <p className="mt-2 text-xs font-bold text-stone-500">{m.photoCaption}</p>}

        {m.message && (
          <section className="pista mt-4" style={{ borderLeftColor: emo.color }}>{m.message}</section>
        )}

        <div className="mt-5 flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3 text-left ring-1 ring-stone-100">
          <div><p className="mundo" style={{ fontSize: 10 }}>Records recuperats</p><p className="text-lg font-black">{unlockedCount} / 30</p></div>
          <div className="h-2 w-28 overflow-hidden rounded-full bg-stone-200"><div className="h-full rounded-full" style={{ width: `${(unlockedCount / 30) * 100}%`, background: emo.color }} /></div>
        </div>

        <div className="final">{unlockedCount >= 30 ? "🌟 Has recuperat tots els records!" : "🔍 Busca la següent esfera per continuar l'aventura."}</div>
        <button onClick={onHome} className="boto secundari">Veure totes les esferes</button>
      </main>
    );
  }

  /* ---------- REGAL: obrir la capsa ---------- */
  if (m.kind === "gift") {
    const tap = () => {
      setShaking(true); setTimeout(() => setShaking(false), 500);
      const n = giftTaps + 1; setGiftTaps(n);
      if (n >= 3) { setTimeout(() => { onUnlock("regal"); setPhase("reveal"); celebrate(true); }, 500); }
      else confetti({ particleCount: 25, spread: 40, origin: { y: 0.6 }, colors: [emo.color, "#fff"] });
    };
    return (
      <main className="tarjeta animate-pop-in">
        {header}
        <div className="icono">✨</div>
        <h1 className="titol">Esfera especial</h1>
        <p className="subtitulo">{m.when}</p>
        <section className="pista">{m.hint}</section>
        <button onClick={tap} className={`mx-auto mt-6 block text-[96px] leading-none transition-transform active:scale-95 ${shaking ? "regal-shake" : "animate-floaty"}`} style={{ filter: "drop-shadow(0 10px 14px rgba(0,0,0,.2))" }}>🎁</button>
        <p className="mt-3 text-sm font-bold text-stone-500">{giftTaps === 0 ? "Toca el regal 3 vegades per obrir-lo" : giftTaps < 3 ? `${3 - giftTaps} ${3 - giftTaps === 1 ? "toc més" : "tocs més"}…` : "S'està obrint…"}</p>
        <div className="mt-2 flex justify-center gap-1.5">{[0, 1, 2].map((i) => (<span key={i} className="h-2.5 w-2.5 rounded-full transition-all" style={{ background: i < giftTaps ? emo.color : "#e5e4ef" }} />))}</div>
      </main>
    );
  }

  /* ---------- VÍDEO (ja desbloquejable): un botó per obrir ---------- */
  if (m.kind === "video") {
    return (
      <main className="tarjeta animate-pop-in">
        {header}
        <div className="icono">🎬</div>
        <h1 className="titol">L'última esfera</h1>
        <p className="subtitulo">Ho has aconseguit</p>
        <section className="pista">{m.hint}</section>
        <button onClick={() => { onUnlock("vídeo"); setPhase("reveal"); celebrate(true); }} className="boto">▶ Obrir l'última esfera</button>
      </main>
    );
  }

  /* ---------- JOC: pista → repte ---------- */
  if (phase === "intro") {
    return (
      <main className="tarjeta animate-pop-in">
        {header}
        <div className="mx-auto flex justify-center"><Sphere emotion={m.emotion} emotion2={m.emotion2} size={120} pulse /></div>
        <h1 className="titol mt-3">Esfera encriptada</h1>
        <p className="subtitulo">Record desconegut · {m.when}</p>
        <section className="pista">{m.hint}</section>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold" style={{ background: emo.soft, color: emo.text }}>🧩 Repte: {def?.name} · {def?.time}</div>
        <button onClick={() => setPhase("game")} className="boto">🔓 Desxifrar l'esfera</button>
        <p className="mt-3 text-xs font-semibold text-stone-400">Quan superis el repte es revelarà el record.</p>
      </main>
    );
  }

  return (
    <main className="tarjeta animate-pop-in">
      {header}
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => setPhase("intro")} className="text-xs font-black text-stone-500">← Pista</button>
        <span className="rounded-full px-3 py-1 text-[11px] font-black" style={{ background: emo.soft, color: emo.text }}>{def?.name}</span>
      </div>
      {Comp ? <Comp key={m.id} onComplete={handleComplete} config={m.config} photo={m.photo} /> : <p className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">Aquest joc no existeix ({m.gameKey}). Revisa la ficha en el panel de edición.</p>}
      {gameDone && <button onClick={reveal} className="boto animate-pop-in">✨ Revelar el record</button>}
    </main>
  );
}
