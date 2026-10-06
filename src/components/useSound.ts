import { useEffect, useState } from "react";

/**
 * So sintetitzat amb WebAudio (cap fitxer extern, funciona al singlefile)
 * + vibració del mòbil (Android / navegadors que ho suportin).
 * El botó de so queda persistit a llocalStorage.
 */

let ctx: AudioContext | null = null;
const KEY = "camara_son_activat";

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;
  try {
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, dur: number, type: OscillatorType, gain: number, when = 0) {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + when;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

export type SoundName = "tap" | "ok" | "fail" | "unlock" | "reveal" | "star" | "gift";

export function playSound(name: SoundName) {
  try {
    if (localStorage.getItem(KEY) === "0") return;
  } catch {
    /* continua */
  }
  switch (name) {
    case "tap":
      tone(660, 0.07, "triangle", 0.07);
      break;
    case "ok":
      tone(720, 0.09, "triangle", 0.08);
      tone(960, 0.11, "triangle", 0.07, 0.07);
      break;
    case "fail":
      tone(180, 0.16, "sawtooth", 0.055);
      tone(120, 0.2, "sawtooth", 0.045, 0.05);
      break;
    case "unlock":
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.3, "triangle", 0.075, i * 0.085));
      break;
    case "reveal":
      [440, 587, 740, 988, 1175].forEach((f, i) => tone(f, 0.55, "sine", 0.07, i * 0.06));
      tone(1318, 0.7, "sine", 0.045, 0.42);
      break;
    case "star":
      tone(1318, 0.12, "square", 0.045);
      tone(1760, 0.14, "square", 0.04, 0.07);
      break;
    case "gift":
      [392, 523, 659, 880].forEach((f, i) => tone(f, 0.24, "sawtooth", 0.055, i * 0.06));
      break;
  }
}

export function vibrate(pattern: number | number[]) {
  try {
    if (localStorage.getItem(KEY) === "0") return;
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    /* no disponible */
  }
}

export function soundOn(): boolean {
  try {
    return localStorage.getItem(KEY) !== "0";
  } catch {
    return true;
  }
}
export function setSoundEnabled(v: boolean) {
  try {
    localStorage.setItem(KEY, v ? "1" : "0");
  } catch {
    /* ignorat */
  }
}

/** Hook que explica l'estat actual del so i el canvia. */
export function useSound() {
  const [on, setOn] = useState<boolean>(() => soundOn());
  useEffect(() => {
    if (!on) vibrate(0);
  }, [on]);
  return {
    on,
    toggle: () => {
      const v = !on;
      setOn(v);
      setSoundEnabled(v);
      if (v) playSound("ok");
    },
  };
}
