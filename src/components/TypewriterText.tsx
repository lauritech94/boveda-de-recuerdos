import { useEffect, useState } from "react";

/**
 * Escriu el text lletra a lletra amb so subtil de màquina d'escriure
 */
export function TypewriterText({
  text,
  speed = 28,
  onDone,
  className = "",
}: {
  text: string;
  speed?: number;
  onDone?: () => void;
  className?: string;
}) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    if (!text) {
      setDone(true);
      return;
    }
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(t);
        setDone(true);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(t);
  }, [text, speed]);

  return (
    <span className={`${className} ${!done ? "maquina" : ""}`}>
      {displayed}
    </span>
  );
}
