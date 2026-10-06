import type { CSSProperties } from "react";

/**
 * Minion dibuixat per mi (SVG vectorial, no una imatge oficial).
 * No és un disseny de Universal/Illumination: és la meva interpretació estilística
 * (càpsula groga, ulleres, petó blau) per al regal privat de la família.
 *
 * `anim` controla la classe CSS d'animació:
 *   minion-anim · minion-salt · minion-espanta · minion-baluga · minion-menja
 */

export type MinionVariant = "happy" | "scared" | "sleepy" | "party" | "wave" | "gift" | "defeat" | "peek";

export function Minion({
  variant = "happy",
  size = 120,
  anim = "minion-anim",
  className = "",
  style,
}: {
  variant?: MinionVariant;
  size?: number;
  anim?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const wide = variant === "scared";
  return (
    <svg
      viewBox="0 0 120 158"
      width={size}
      height={size * (158 / 120)}
      className={`minion minion-parpalleja ${anim} ${className}`}
      style={style}
      role="img"
      aria-label="Minion animat"
    >
      <defs>
        <linearGradient id="mn-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFF07A" />
          <stop offset="42%" stopColor="#FFD23F" />
          <stop offset="100%" stopColor="#E8A814" />
        </linearGradient>
        <linearGradient id="mn-glass" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#F3F7FF" />
          <stop offset="55%" stopColor="#C9D6E6" />
          <stop offset="100%" stopColor="#93A4B8" />
        </linearGradient>
        <radialGradient id="mn-eye" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2E9F2" />
        </radialGradient>
        <linearGradient id="mn-overall" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6FA8FF" />
          <stop offset="100%" stopColor="#2F6BD8" />
        </linearGradient>
        <linearGradient id="mn-hat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF8FB8" />
          <stop offset="100%" stopColor="#F0433A" />
        </linearGradient>
      </defs>

      {/* Ombra a terra */}
      <ellipse cx="60" cy="150" rx="30" ry="6" fill="#000" opacity="0.16" />

      {/* Braç esquerre */}
      <path
        d={variant === "wave" ? "M27 74 C10 62 6 40 16 30" : "M27 76 C12 80 8 96 14 108"}
        stroke="url(#mn-body)"
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />
      {/* Braç dret */}
      <path
        d={variant === "gift" ? "M93 74 C108 74 112 88 106 96" : "M93 76 C108 80 112 96 106 108"}
        stroke="url(#mn-body)"
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />

      {/* Cos càpsula */}
      <rect x="25" y="20" width="70" height="112" rx="35" fill="url(#mn-body)" />
      {/* Llum i ombra al cos */}
      <ellipse cx="44" cy="46" rx="13" ry="20" fill="#FFF7B8" opacity="0.45" />
      <path d="M92 44 C98 66 98 96 88 118 C96 108 98 74 92 44Z" fill="#B87F08" opacity="0.22" />

      {/* Tira de les ulleres */}
      <rect x="14" y="44" width="92" height="32" rx="16" fill="#7E8B9C" />
      <rect x="14" y="44" width="92" height="10" rx="5" fill="#A9B6C6" opacity="0.7" />

      {/* Ulleres */}
      <circle cx="43" cy="60" r="17" fill="url(#mn-glass)" />
      <circle cx="77" cy="60" r="17" fill="url(#mn-glass)" />
      <circle cx="43" cy="60" r="12" fill="url(#mn-eye)" />
      <circle cx="77" cy="60" r="12" fill="url(#mn-eye)" />

      {/* Parpalleig: grup que s'aplana */}
      <g className="pestanya">
        {/* Pupils */}
        {wide ? (
          <>
            <circle cx="43" cy="60" r="5.4" fill="#26263A" />
            <circle cx="77" cy="60" r="5.4" fill="#26263A" />
          </>
        ) : (
          <>
            <circle cx={variant === "defeat" ? 40 : 44} cy="61" r="5.6" fill="#26263A" />
            <circle cx={variant === "defeat" ? 74 : 78} cy="61" r="5.6" fill="#26263A" />
          </>
        )}
        <circle cx="41.4" cy="58" r="2" fill="#fff" opacity="0.9" />
        <circle cx="75.4" cy="58" r="2" fill="#fff" opacity="0.9" />
      </g>

      {/* Cell de l'ull dret */}
      <rect x="62" y="46" width="6" height="28" rx="3" fill="#8C99A9" opacity="0.75" />

      {/* Bocs */}
      {variant === "defeat" ? (
        <path d="M48 88 Q60 80 72 88" stroke="#6B4A08" strokeWidth="3" fill="none" strokeLinecap="round" />
      ) : variant === "scared" ? (
        <ellipse cx="60" cy="88" rx="8" ry="10" fill="#6B4A08" />
      ) : variant === "sleepy" ? (
        <path d="M48 88 Q60 94 72 88" stroke="#6B4A08" strokeWidth="3" fill="none" strokeLinecap="round" />
      ) : (
        <path
          d="M46 84 Q60 98 74 84"
          stroke="#6B4A08"
          strokeWidth="3.4"
          fill={variant === "party" ? "#E2574C" : "none"}
          strokeLinecap="round"
        />
      )}

      {/* Petit monyo */}
      {variant === "sleepy" && (
        <text x="74" y="40" fontSize="14" fontWeight="700" fill="#5B7FD4" opacity="0.8">
          z z
        </text>
      )}
      {variant === "scared" && (
        <>
          <path d="M36 40 L30 30 M44 38 L41 27" stroke="#F0433A" strokeWidth="3" strokeLinecap="round" />
          <path d="M84 40 L90 30 M76 38 L79 27" stroke="#F0433A" strokeWidth="3" strokeLinecap="round" />
        </>
      )}

      {/* Barret de festa */}
      {variant === "party" && (
        <>
          <path d="M60 -2 L78 42 L42 42 Z" fill="url(#mn-hat)" />
          <circle cx="60" cy="-4" r="7" fill="#FFD23F" />
          <path d="M46 38 Q60 46 74 38" stroke="#FFD23F" strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      )}

      {/* Bota / peu */}
      <ellipse cx="46" cy="133" rx="13" ry="7" fill="#3A2E6B" />
      <ellipse cx="74" cy="133" rx="13" ry="7" fill="#3A2E6B" />

      {/* Petó */}
      <path d="M32 92 L32 118 Q32 132 44 132 L76 132 Q88 132 88 118 L88 92 Z" fill="url(#mn-overall)" />
      <path d="M34 96 L44 96 L40 132 L34 132 Z" fill="#2F6BD8" />
      <path d="M86 96 L76 96 L80 132 L86 132 Z" fill="#2F6BD8" />
      <rect x="50" y="112" width="20" height="16" rx="3" fill="#1F4FAF" />
      <circle cx="36" cy="98" r="2.6" fill="#FFD23F" />
      <circle cx="84" cy="98" r="2.6" fill="#FFD23F" />

      {/* Regal a les mans */}
      {variant === "gift" && (
        <g transform="translate(72 92)">
          <rect x="-4" y="-2" width="30" height="24" rx="4" fill="#F0433A" />
          <rect x="-4" y="5" width="30" height="6" fill="#FFD23F" />
          <rect x="9" y="-2" width="5" height="24" fill="#FFD23F" />
          <path d="M8 -2 Q11 -10 14 -2" stroke="#FFD23F" strokeWidth="3" fill="none" />
          <path d="M21 -2 Q24 -10 27 -2" stroke="#FFD23F" strokeWidth="3" fill="none" />
        </g>
      )}
    </svg>
  );
}
