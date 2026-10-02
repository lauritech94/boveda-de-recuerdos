import { EMOTIONS, EmotionKey } from "../data/memories";

export function Sphere({
  emotion,
  emotion2,
  size = 96,
  locked,
  photo,
  number,
  pulse,
}: {
  emotion: EmotionKey;
  emotion2?: EmotionKey;
  size?: number;
  locked?: boolean;
  photo?: string;
  number?: number;
  pulse?: boolean;
}) {
  const c1 = EMOTIONS[emotion].color;
  const c2 = emotion2 ? EMOTIONS[emotion2].color : c1;
  const id = `g-${emotion}-${emotion2 || "x"}-${size}`;
  return (
    <div
      className={`relative shrink-0 ${pulse ? "animate-floaty" : ""}`}
      style={{ width: size, height: size, filter: locked ? "grayscale(0.85) brightness(0.55)" : `drop-shadow(0 0 ${size / 6}px ${EMOTIONS[emotion].glow})` }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <defs>
          <radialGradient id={`${id}-core`} cx="38%" cy="32%" r="70%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="22%" stopColor={c1} stopOpacity="0.9" />
            <stop offset="70%" stopColor={c2} />
            <stop offset="100%" stopColor={c2} stopOpacity="0.85" />
          </radialGradient>
          <radialGradient id={`${id}-shade`} cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.35" />
          </radialGradient>
          <clipPath id={`${id}-clip`}>
            <circle cx="50" cy="50" r="46" />
          </clipPath>
        </defs>
        <circle cx="50" cy="50" r="47" fill={`url(#${id}-core)`} />
        {photo && !locked && (
          <image href={photo} x="4" y="4" width="92" height="92" preserveAspectRatio="xMidYMid slice" clipPath={`url(#${id}-clip)`} opacity="0.85" />
        )}
        <circle cx="50" cy="50" r="47" fill={`url(#${id}-shade)`} />
        <ellipse cx="36" cy="30" rx="16" ry="9" fill="#fff" opacity="0.75" transform="rotate(-25 36 30)" />
        <ellipse cx="62" cy="74" rx="10" ry="4" fill="#fff" opacity="0.25" />
        <circle cx="50" cy="50" r="47" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.2" />
      </svg>
      {typeof number === "number" && (
        <span className={`absolute bottom-0 right-0 flex h-[32%] min-w-[32%] items-center justify-center rounded-full px-1 text-[11px] font-black ${locked ? "bg-white/70 text-stone-700" : "bg-white text-stone-900 shadow"}`}>
          {number}
        </span>
      )}
      {locked && (
        <span className="absolute inset-0 flex items-center justify-center text-white/80" style={{ fontSize: size / 3 }}>🔒</span>
      )}
    </div>
  );
}
