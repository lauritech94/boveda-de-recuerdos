import { useState } from "react";
import { Minion } from "./Minion";

/**
 * Minion general amb imatge. Puja el PNG (fons transparent) a public/minions/minion.png.
 * Les camins relaus es resolen segons la subcarpeta de GitHub Pages (lauritech94.github.io/boveda-de-recuerdos/).
 * Si el fitxer no existeix, es fa servir el dibuix SVG de reserva perquè no quedi un quadre roto.
 */
export function MinionImg({
  src = "minions/minion.png",
  size = 120,
  anim = "minion-anim",
  className = "",
}: {
  src?: string;
  size?: number;
  anim?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const resolved = /^(?:https?:|data:|blob:)/i.test(src) ? src : new URL(src.replace(/^\/+/, ""), document.baseURI).href;

  if (failed) return <Minion size={size} anim={anim} className={className} />;

  return (
    <img
      src={resolved}
      onError={() => setFailed(true)}
      alt="Minion"
      style={{ width: size, height: "auto" }}
      className={`minion-img ${anim} ${className}`}
    />
  );
}
