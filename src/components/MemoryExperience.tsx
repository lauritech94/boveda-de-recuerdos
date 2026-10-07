import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { APP_NAME, EMOTIONS, Memory } from "../data/memories";
import { GAME_DEFS } from "../games/registry";
import { Sphere } from "./Sphere";
import { MinionImg } from "./MinionImg";
import { GiftCharacter } from "./GiftCharacter";
import { TypewriterText } from "./TypewriterText";
import { playSound, vibrate, useSound } from "./useSound";
import { Volume2, VolumeX, SkipForward } from "lucide-react";

type Props = {
  memory: Memory;
  unlocked: boolean;
  unlockedCount: number;
  othersUnlocked: number;
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

/** Bloc de pista: text senzill amb una "lluentor" que el travessa un cop en aparèixer. */
function Pista({ text, color }: { text: string; color: string }) {
  return (
    <section className="pista pista-shine" style={{ borderLeftColor: color }}>
      {text}
    </section>
  );
}

export function MemoryExperience({ memory: m, unlocked, unlockedCount, othersUnlocked, onUnlock, onHome }: Props) {
  const emo = EMOTIONS[m.emotion];
  const def = GAME_DEFS[m.gameKey];
  const Comp = def?.Comp;
  const { on: soundActive, toggle: toggleSound } = useSound();

  const [phase, setPhase] = useState<"intro" | "game" | "reveal">(unlocked ? "reveal" : "intro");
  const [gameDone, setGameDone] = useState(false);
  const [label, setLabel] = useState<string | undefined>();
  const [giftTaps, setGiftTaps] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [failsCount, setFailsCount] = useState(0);
  // Si l'esfera ja estava desbloquejada abans (hi tornem), la foto es veu d'entrada.
  const [photoReady, setPhotoReady] = useState(unlocked);
  const [justOpened, setJustOpened] = useState(false);

  // Aplica el color de l'emoció a tota la targeta (botons, vora, fons de la pista…)
  useEffect(() => {
    document.documentElement.style.setProperty("--color", emo.color);
    document.documentElement.style.setProperty("--color2", m.emotion2 ? EMOTIONS[m.emotion2].color : emo.color);
    document.documentElement.style.setProperty("--soft", emo.soft);
    return () => {
      document.documentElement.style.setProperty("--color", "#ffd84d");
      document.documentElement.style.setProperty("--color2", "#ff9f43");
      document.documentElement.style.setProperty("--soft", "#fff7d6");
    };
  }, [emo, m.emotion2]);

  useEffect(() => {
    setPhase(unlocked ? "reveal" : "intro");
    setGameDone(false);
    setGiftTaps(0);
    setFailsCount(0);
    setPhotoReady(unlocked); // ja desbloquejada abans → la foto es veu directament
  }, [m.id, unlocked]);

  const celebrate = (big = false) => {
    playSound("reveal");
    vibrate([100, 60, 150]);
    confetti({
      particleCount: big ? 200 : 100,
      spread: big ? 120 : 80,
      origin: { y: 0.6 },
      colors: [emo.color, "#ffffff", m.emotion2 ? EMOTIONS[m.emotion2].color : "#ffd84d"],
    });
  };

  const handleComplete = (_s?: number, l?: string) => {
    if (gameDone) return;
    setGameDone(true);
    setLabel(l);
    playSound("ok");
    vibrate(80);
    celebrate();
  };

  /** Revelació directa: el color de l'emoció + un flaix breu fan tota la feina,
   *  sense cap pantalla intermèdia d'espera. */
  const triggerReveal = () => {
    onUnlock(label);
    playSound("unlock");
    vibrate([80, 50, 80]);
    setPhotoReady(false);
    setJustOpened(true);
    setPhase("reveal");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      celebrate(true);
      setPhotoReady(true);
    }, 260);
    setTimeout(() => setJustOpened(false), 900);
  };

  const skipChallenge = () => {
    handleComplete(100, "saltat");
    triggerReveal();
  };

  const soundBtn = (
    <button onClick={toggleSound} className="boto-so" title={soundActive ? "Silenciar" : "Activar so"}>
      {soundActive ? <Volume2 size={14} /> : <VolumeX size={14} />}
      <span>{soundActive ? "So" : "Mut"}</span>
    </button>
  );

  const header = (
    <div className="cabecera flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className="mundo" style={{ color: emo.text }}>{APP_NAME}</span>
        {soundBtn}
      </div>
      <span className="mundo" style={{ color: emo.text }}>Esfera {pad(m.id)} / 30</span>
    </div>
  );

  /* ---------- ESFERA 1: desxifrada, revelació inicial ---------- */
  if (m.kind === "intro" && phase === "intro") {
    return (
      <main className="tarjeta animate-pop-in" style={{ borderColor: emo.color }}>
        {header}
        <div className="relative mx-auto flex justify-center py-2">
          <Sphere emotion={m.emotion} emotion2={m.emotion2} size={120} pulse />
          <div className="absolute -bottom-2 -right-4">
            <MinionImg size={70} />
          </div>
        </div>
        <h1 className="titol mt-3" style={{ color: emo.text }}>Esfera desxifrada ✨</h1>
        <p className="subtitulo">Primera esfera</p>

        <Pista text={m.hint} color={emo.color} />

        <button onClick={triggerReveal} className="boto" style={{ background: `linear-gradient(135deg, ${emo.color}, var(--color2))` }}>
          ✨ Revelar el record
        </button>
      </main>
    );
  }

  /* ---------- ESFERA 30: VÍDEO (bloquejada fins completar 29) ---------- */
  const requireAll = m.kind === "video" && String(m.config?.requireAll ?? "true").toLowerCase() !== "false";
  if (m.kind === "video" && requireAll && !unlocked && othersUnlocked < 29) {
    return (
      <main className="tarjeta animate-pop-in">
        {header}
        <div className="relative mx-auto flex justify-center py-2">
          <div className="icono">🔒</div>
          <div className="absolute -right-2 top-0">
            <MinionImg size={68} anim="minion-baluga" />
          </div>
        </div>
        <h1 className="titol">L'última esfera</h1>
        <p className="subtitulo">Encara no es pot obrir</p>
        <section className="pista">{`Aquesta esfera està protegida amb un encriptat especial.

Només s'obrirà quan hagis desxifrat totes les altres.

Portes ${othersUnlocked} de 29. Et falten ${29 - othersUnlocked}.`}</section>

        <div className="mt-4 barra-progres">
          <span style={{ width: `${(othersUnlocked / 29) * 100}%` }} />
        </div>
        <div className="final">🔍 Continua buscant esferes.</div>
        <button onClick={onHome} className="boto secundari">Veure el meu progrés</button>
      </main>
    );
  }

  /* ---------- REVELACIÓ (color de l'emoció + polaroid + màquina d'escriure) ---------- */
  if (phase === "reveal") {
    const embed = m.kind === "video" ? toEmbed(m.config?.videoUrl) : null;
    const isGift = m.kind === "gift";

    return (
      <main className="tarjeta animate-pop-in text-center" style={{ borderColor: emo.color }}>
        {header}
        <div className="relative flex items-center justify-center gap-3">
          {justOpened && <span className="flaix-obertura" style={{ background: emo.color }} />}
          <div className="icono">{isGift ? m.config?.giftEmoji || "🎁" : m.kind === "video" ? "🎬" : emo.emoji}</div>
          {m.id === 10 ? <GiftCharacter src={m.config?.minionImage || "minions/iphone.png"} small /> : <MinionImg size={60} anim="minion-salt" />}
        </div>

        <h1 className="titol" style={{ color: emo.text }}>
          {isGift && m.config?.giftName ? m.config.giftName : m.title}
        </h1>
        <p className="subtitulo">{isGift ? m.title : m.when}</p>

        {/* Vídeo */}
        {m.kind === "video" && embed && embed.kind !== "none" && (
          <div className="mb-4 overflow-hidden rounded-2xl shadow-lg border-4 border-white">
            {embed.kind === "iframe" ? (
              <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                <iframe src={embed.src} title="Vídeo" className="absolute inset-0 h-full w-full" allowFullScreen />
              </div>
            ) : (
              <video src={embed.src} controls playsInline className="w-full" />
            )}
          </div>
        )}

        {/* POLAROID amb la foto que s'aclareix */}
        {m.photo ? (
          <div className="polaroid grain mx-auto my-3 max-w-[380px]">
            <img
              src={m.photo}
              alt={m.title}
              className={`transition-all duration-1000 ease-out ${
                photoReady ? "filter-none opacity-100 scale-100" : "filter blur-md grayscale opacity-40 scale-95"
              }`}
            />
            {m.photoCaption && <p className="peu">{m.photoCaption}</p>}
          </div>
        ) : m.kind !== "video" ? (
          <div className="polaroid mx-auto my-3 max-w-[340px] flex flex-col items-center justify-center p-6 bg-amber-50" style={{ color: emo.text }}>
            <span className="text-5xl">📷</span>
            <p className="mt-2 text-xs font-bold">Aquí apareixerà la fotografia del record</p>
          </div>
        ) : null}

        {/* Missatge amb màquina d'escriure */}
        {m.message && (
          <section className="pista mt-4" style={{ borderLeftColor: emo.color }}>
            <TypewriterText text={m.message} speed={22} />
          </section>
        )}

        {/* Bananes / Progrés de la col·lecció */}
        <div className="mt-5 flex items-center justify-between rounded-2xl bg-amber-100/60 p-3 ring-1 ring-amber-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍌</span>
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Records recuperats</p>
              <p className="text-base font-black text-amber-950">{unlockedCount} / 30</p>
            </div>
          </div>
          <div className="barra-progres w-28">
            <span style={{ width: `${(unlockedCount / 30) * 100}%` }} />
          </div>
        </div>

        <div className="final" style={{ color: emo.text }}>
          {unlockedCount >= 30 ? "🌟 Has recuperat tots els records!" : "🔍 Busca la següent esfera per continuar!"}
        </div>

        <button onClick={onHome} className="boto secundari mt-3">Veure el meu progrés</button>
      </main>
    );
  }

  /* ---------- REGAL: obrir la capsa amb Minion saltant ---------- */
  if (m.kind === "gift") {
    const tapGift = () => {
      setShaking(true);
      playSound("gift");
      vibrate(50);
      setTimeout(() => setShaking(false), 500);
      const n = giftTaps + 1;
      setGiftTaps(n);
      if (n >= 3) {
        triggerReveal();
      } else {
        confetti({ particleCount: 30, spread: 45, origin: { y: 0.6 }, colors: [emo.color, "#ffffff"] });
      }
    };

    return (
      <main className="tarjeta animate-pop-in" style={{ borderColor: emo.color }}>
        {header}
        <div className="flex justify-center items-center gap-3">
          <div className="icono">✨</div>
          {m.id === 10 ? <GiftCharacter src={m.config?.minionImage || "minions/iphone.png"} /> : <MinionImg size={76} />}
        </div>
        <h1 className="titol" style={{ color: emo.text }}>Esfera especial</h1>
        <p className="subtitulo">{m.when}</p>

        <Pista text={m.hint} color={emo.color} />

        <button
          onClick={tapGift}
          className={`mx-auto mt-6 block text-[96px] leading-none transition-transform active:scale-90 ${
            shaking ? "regal-shake" : "animate-floaty"
          }`}
          style={{ filter: "drop-shadow(0 10px 14px rgba(0,0,0,.2))" }}
        >
          🎁
        </button>
        <p className="mt-3 text-sm font-bold text-stone-500">
          {giftTaps === 0
            ? "Toca el regal 3 vegades per obrir-lo!"
            : giftTaps < 3
            ? `${3 - giftTaps} ${3 - giftTaps === 1 ? "toc més" : "tocs més"}…`
            : "S'està obrint…"}
        </p>
        <div className="mt-2 flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-3 w-3 rounded-full transition-all" style={{ background: i < giftTaps ? emo.color : "#e5e4ef" }} />
          ))}
        </div>
      </main>
    );
  }

  /* ---------- VÍDEO (desbloquejable) ---------- */
  if (m.kind === "video") {
    return (
      <main className="tarjeta animate-pop-in" style={{ borderColor: emo.color }}>
        {header}
        <div className="flex justify-center items-center gap-2">
          <div className="icono">🎬</div>
          <MinionImg size={72} anim="minion-salt" />
        </div>
        <h1 className="titol" style={{ color: emo.text }}>L'última esfera</h1>
        <p className="subtitulo">Ho has aconseguit</p>
        <Pista text={m.hint} color={emo.color} />
        <button onClick={triggerReveal} className="boto">▶ Obrir l'última esfera</button>
      </main>
    );
  }

  /* ---------- FASE D'INTRODUCCIÓ: PISTA ---------- */
  if (phase === "intro") {
    return (
      <main className="tarjeta animate-pop-in" style={{ borderColor: emo.color }}>
        {header}
        <div className="relative mx-auto flex justify-center py-2">
          <Sphere emotion={m.emotion} emotion2={m.emotion2} size={120} pulse />
          <div className="absolute -bottom-2 -right-3">
            <MinionImg size={68} />
          </div>
        </div>

        <h1 className="titol mt-2" style={{ color: emo.text }}>Esfera encriptada</h1>
        <p className="subtitulo">Record desconegut · {m.when}</p>

        <Pista text={m.hint} color={emo.color} />

        <div className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold" style={{ background: emo.soft, color: emo.text }}>
          🧩 Repte: {def?.name} · {def?.time}
        </div>

        <button onClick={() => { playSound("tap"); setPhase("game"); }} className="boto">
          🔓 Desxifrar l'esfera
        </button>
        <p className="mt-2 text-xs font-semibold text-stone-400">Supera el repte per obrir l'esfera.</p>
      </main>
    );
  }

  /* ---------- FASE DE JOC ---------- */
  return (
    <main className="tarjeta animate-pop-in" style={{ borderColor: emo.color }}>
      {header}
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => { playSound("tap"); setPhase("intro"); }} className="text-xs font-black text-stone-500 hover:text-stone-800">
          ← Pista
        </button>
        <span className="rounded-full px-3 py-1 text-[11px] font-black" style={{ background: emo.soft, color: emo.text }}>
          {def?.name}
        </span>
      </div>

      {Comp ? (
        <Comp
          key={m.id}
          onComplete={handleComplete}
          config={m.config}
          photo={m.photo}
        />
      ) : (
        <p className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">Aquest joc no existeix ({m.gameKey}).</p>
      )}

      {/* Botó per saltar el repte si costa molt */}
      {!gameDone && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => {
              // Confirmació: evita saltar-se el repte per error (és just sota els botons del joc)
              if (!window.confirm("Segur que vols saltar-te el repte i veure el record directament?")) return;
              setFailsCount((c) => c + 1);
              skipChallenge();
            }}
            className="drecera"
            title="Si se t'ennuega el joc, pots passar al record"
          >
            <SkipForward size={13} />
            <span>Passar repte ({failsCount > 0 ? "reintentat" : "veure record"})</span>
          </button>
        </div>
      )}

      {gameDone && (
        <button onClick={triggerReveal} className="boto animate-pop-in mt-4">
          ✨ Revelar el record
        </button>
      )}
    </main>
  );
}
