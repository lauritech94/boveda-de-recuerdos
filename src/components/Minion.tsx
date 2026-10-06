import type { CSSProperties } from "react";

/**
 * Minion dibuixat per mi (SVG vectorial, no una imatge oficial).
 * No és un disseny de Universal/Illumination: és la meva interpretació estilística
 * (càpsula groga, ulleres, petó blau) per al regal privat de la família.
 *
 * `anim` controla la classe CSS d'animació:
 *   minion-anim · minion-salt · minion-espanta · minion-baluga · minion-menja
 */

export type MinionVariant = "happy" | "scared" | "sleepy" | "party" | "wave" | "gift" | "phone" | "defeat" | "peek" | "thief";

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
  const thief = variant === "thief";
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
        {/* Silueta del cos: la corretja i els tirants no en surten */}
        <clipPath id="mn-body-clip">
          <rect x="25" y="20" width="70" height="112" rx="35" />
        </clipPath>
        <pattern id="mn-denim" width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M0 6 L6 0 M-3 3 L3 -3" stroke="#D0E2FF" strokeOpacity=".24" strokeWidth=".7" />
        </pattern>
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
        d={variant === "gift" || variant === "phone" ? "M93 74 C108 74 112 88 106 96" : "M93 76 C108 80 112 96 106 108"}
        stroke="url(#mn-body)"
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />
      {/* Guants foscos com a la referència; el lladre porta el sac a una mà */}
      <ellipse cx="14" cy={variant === "wave" ? 29 : 108} rx="8" ry="7" fill="#232329" />
      <ellipse cx="106" cy={variant === "gift" || variant === "phone" ? 96 : 108} rx="8" ry="7" fill="#232329" />

      {/* Cos càpsula */}
      <rect x="25" y="20" width="70" height="112" rx="35" fill="url(#mn-body)" />
      {/* Llum i ombra al cos */}
      <ellipse cx="44" cy="46" rx="13" ry="20" fill="#FFF7B8" opacity="0.45" />
      <path d="M92 44 C98 66 98 96 88 118 C96 108 98 74 92 44Z" fill="#B87F08" opacity="0.22" />

      {/* Uns quants cabells curts al cap, com a silueta del Minion */}
      {variant !== "party" && !thief && (
        <g fill="none" stroke="#5B4210" strokeWidth="2.6" strokeLinecap="round">
          <path d="M49 23 C47 16 49 12 53 9" />
          <path d="M59 21 C59 14 62 11 66 9" />
          <path d="M68 23 C70 17 74 15 78 15" />
        </g>
      )}
      {thief && (
        <g>
          {/* Gorro de lladre amb vora i un ble de cabell */}
          <path d="M26 45 C24 23 39 10 60 10 C81 10 96 23 94 45 Z" fill="#282831" />
          <path d="M25 41 Q60 35 95 41 L95 49 Q60 44 25 49 Z" fill="#17171C" />
          <path d="M48 42 Q53 37 57 39" fill="none" stroke="#4B3C29" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {/* Corretja negra gruixuda, retallada a la silueta del cap (no en surt) */}
      <g clipPath="url(#mn-body-clip)">
        <rect x="20" y="51" width="80" height="18" fill="#17191E" />
        <rect x="20" y="52" width="80" height="3" fill="#3A3F48" opacity="0.6" />
      </g>

      {/* Muntura fina amb ulls grans; les lents es toquen al mig (sense pont gris) */}
      <circle cx="43" cy="60" r="16.5" fill="#515D6B" stroke="#252B33" strokeWidth="1.5" />
      <circle cx="77" cy="60" r="16.5" fill="#515D6B" stroke="#252B33" strokeWidth="1.5" />
      <circle cx="43" cy="60" r="14" fill="url(#mn-glass)" />
      <circle cx="77" cy="60" r="14" fill="url(#mn-glass)" />
      <circle cx="43" cy="60" r="12.5" fill="url(#mn-eye)" />
      <circle cx="77" cy="60" r="12.5" fill="url(#mn-eye)" />
      {/* Mirada mig entremaliada de la referència (els ulls continuen ben visibles) */}
      <path d="M31 55 Q43 50 55 55 L55 59 Q43 55 31 59 Z" fill="#F5C73E" />
      <path d="M65 55 Q77 50 89 55 L89 59 Q77 55 65 59 Z" fill="#F5C73E" />

      {/* Parpalleig: grup que s'aplana */}
      <g className="pestanya">
        {/* Pupils */}
        {wide ? (
          <>
            <circle cx="43" cy="60" r="6.2" fill="#26263A" />
            <circle cx="77" cy="60" r="6.2" fill="#26263A" />
          </>
        ) : (
          <>
            <circle cx={variant === "defeat" ? 39 : 45} cy="61" r="6.6" fill="#26263A" />
            <circle cx={variant === "defeat" ? 73 : 79} cy="61" r="6.6" fill="#26263A" />
          </>
        )}
        <circle cx="42.5" cy="57.5" r="2.3" fill="#fff" opacity="0.9" />
        <circle cx="76.5" cy="57.5" r="2.3" fill="#fff" opacity="0.9" />
      </g>

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
      <path d="M32 92 L32 118 Q32 132 44 132 L76 132 Q88 132 88 118 L88 92 Z" fill="url(#mn-denim)" />
      {/* Tirants als costats del cos, inclinats cap a les cantonades del petó (lluny de la boca) */}
      <g clipPath="url(#mn-body-clip)">
        <path d="M24 74 L38 96" stroke="#174B9A" strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d="M24 74 L38 96" stroke="#6FA8FF" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M96 74 L82 96" stroke="#174B9A" strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d="M96 74 L82 96" stroke="#6FA8FF" strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
      <path d="M34 96 L44 96 L40 132 L34 132 Z" fill="#2F6BD8" />
      <path d="M86 96 L76 96 L80 132 L86 132 Z" fill="#2F6BD8" />
      <rect x="50" y="112" width="20" height="16" rx="3" fill="#1F4FAF" />
      <path d="M51 113 H69 M51 127 H69" fill="none" stroke="#95B9EA" strokeWidth=".9" strokeDasharray="2 2" />
      <circle cx="38" cy="97" r="3" fill="#FFD23F" stroke="#1F4FAF" strokeWidth="1.2" />
      <circle cx="82" cy="97" r="3" fill="#FFD23F" stroke="#1F4FAF" strokeWidth="1.2" />

      {thief && (
        <g>
          {/* Sac amb records robats, darrere del braç esquerre */}
          <path d="M12 96 C0 100 0 121 13 130 C28 137 37 122 30 108 L21 98 Z" fill="#303038" stroke="#17171C" strokeWidth="2" />
          <path d="M13 99 L22 99 L19 93 L15 93 Z" fill="#17171C" />
          <path d="M9 108 Q15 104 24 107" fill="none" stroke="#74747D" strokeWidth="1.5" strokeLinecap="round" />
          <text x="16" y="122" fontSize="11" textAnchor="middle" fill="#FFD23F">✦</text>
        </g>
      )}

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
      {variant === "phone" && (
        <g transform="rotate(13 105 80)">
          <rect x="96" y="55" width="20" height="39" rx="3.5" fill="#252830" />
          <rect x="97.5" y="57" width="17" height="34" rx="2" fill="#F4F0E9" />
          <circle cx="101" cy="62" r="1.7" fill="#414753" />
          <circle cx="106" cy="62" r="1.7" fill="#414753" />
          <path d="M98 87 L114 87" stroke="#B9B6B3" strokeWidth="1.2" />
        </g>
      )}
    </svg>
  );
}
