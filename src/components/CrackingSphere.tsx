import { Sphere } from "./Sphere";
import { EmotionKey } from "../data/memories";

/**
 * Esfera d'Inside Out que s'obre en dues meitats
 * amb una esquerda daurada brillant i deixa brollar la foto / record.
 */
export function CrackingSphere({
  emotion,
  emotion2,
  size = 140,
  cracked,
  onCracked,
  children,
}: {
  emotion: EmotionKey;
  emotion2?: EmotionKey;
  size?: number;
  cracked: boolean;
  onCracked?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto my-2 flex items-center justify-center" style={{ width: size + 40, minHeight: size + 20 }}>
      {/* Esfera base amb esquerda i obertura */}
      <div
        className={`relative transition-all duration-700 ease-out ${
          cracked ? "scale-90 opacity-20 filter blur-sm" : "scale-100 opacity-100"
        }`}
        style={{ width: size, height: size }}
      >
        <Sphere emotion={emotion} emotion2={emotion2} size={size} pulse={!cracked} />

        {/* Flaix i esquerdes quan es trenca */}
        {cracked && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center animate-ping">
            <span className="text-5xl">✨</span>
          </div>
        )}
      </div>

      {/* Contingut que brolla de dins de l'esfera quan s'obre */}
      {cracked && (
        <div
          className="absolute inset-0 flex items-center justify-center z-10"
          onAnimationEnd={() => {
            onCracked?.();
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
