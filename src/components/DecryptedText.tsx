import { useEffect, useRef, useState } from "react";

const GLIFS = "▓▒░#@$%&*+=|/\\";

/**
 * Text que arriba xifrat i es desxifra caràcter a caràcter.
 * Es fa servir per a la pista de cada esfera: la germana veu garball fins que
 * comença a revelar-se, i encaixa amb la història del Minion encriptador.
 */
export function DecryptedText({
  text,
  revealed,
  speed = 26,
  className = "",
  style,
}: {
  text: string;
  revealed: boolean;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const chars = Array.from(text);
  const [done, setDone] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    cancelAnimationFrame(raf.current);
    if (!revealed) { setDone(0); return; }
    const total = chars.length;
    const started = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - started) / (total * speed));
      setDone(Math.floor(p * total));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [revealed, text, speed]);

  if (revealed && done >= chars.length) return <span className={className} style={style}>{text}</span>;

  // Xifrat amb una mica d'aturada: els primers caràcters ja comencen a sortir
  return (
    <span className={`xifrat ${className}`} style={style} aria-hidden={!revealed}>
      {chars.map((c, i) => {
        if (c === "\n") return <br key={i} />;
        if (i < done) return <span key={i}>{c}</span>;
        const g = GLIFS[(i * 7 + Math.floor(Math.random() * 11)) % GLIFS.length];
        return (
          <span key={i} className="inline-block opacity-70" style={{ animation: `revela .25s ease ${i * 3}ms both` }}>
            {c === " " ? "\u00A0" : g}
          </span>
        );
      })}
    </span>
  );
}
