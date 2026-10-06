import { useState } from "react";
import { Minion } from "./Minion";

/** The provided PNG can be placed at public/minions/iphone.png.
 * Relative paths are resolved against the deployed GitHub Pages subdirectory. */
export function GiftCharacter({ src = "minions/iphone.png", small = false }: { src?: string; small?: boolean }) {
  const [failed, setFailed] = useState(false);
  const resolved = /^(?:https?:|data:|blob:)/i.test(src) ? src : new URL(src.replace(/^\/+/, ""), document.baseURI).href;

  return (
    <div className={`gift-character ${small ? "gift-character-small" : ""}`}>
      <span className="gift-character-halo" aria-hidden="true" />
      {failed ? (
        <Minion variant="phone" anim="minion-anim" size={small ? 92 : 165} />
      ) : (
        <img src={resolved} alt="Personatge amb el regal del mòbil" onError={() => setFailed(true)} />
      )}
    </div>
  );
}