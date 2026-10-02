import { GameOrder30, GameNonogram, GameSliding, GameTargets, GameMemory, GameSimon, GameMaze, GameWhack, GameGuess, GameWordle } from "./set1";
import { GameSoup, GameMath, GameDiff, GameSequence, GameCatch, GameTrivia, GameAnagram, GameRPS, GameTicTac, GameReflex } from "./set2";
import { GameEvens, GameHanoi, GameIntruder, GameLock, GameStroop, GameLights, GameTiming, GameRecycle, GameFlash, GameDice21, GameStory } from "./set3";

export type ConfigField = { key: string; label: string; type: "text" | "number" | "textarea"; help?: string; placeholder?: string };

export type GameDef = {
  key: string;
  name: string;
  short: string;
  time: string;
  level: "Fácil" | "Media";
  Comp: any;
  fields?: ConfigField[];
};

export const GAME_DEFS: Record<string, GameDef> = {
  guess: { key: "guess", name: "Adivina el número", short: "Pistas más alto / más bajo, 7 intentos", time: "1 min", level: "Fácil", Comp: GameGuess, fields: [
    { key: "label", label: "Pregunta", type: "text", placeholder: "¿En qué año naciste?" },
    { key: "secret", label: "Número secreto", type: "number", placeholder: "2005" },
    { key: "min", label: "Mínimo", type: "number", placeholder: "1990" },
    { key: "max", label: "Máximo", type: "number", placeholder: "2025" },
  ] },
  memory: { key: "memory", name: "Parejas de memoria", short: "6 parejas de emojis", time: "1 min", level: "Fácil", Comp: GameMemory, fields: [
    { key: "emojis", label: "6 emojis separados por coma", type: "text", placeholder: "🍪,🧶,📻,🪴,🐓,☕", help: "Objetos del recuerdo" },
  ] },
  order30: { key: "order30", name: "Cuenta hasta 30", short: "Toca del 1 al 30 en orden", time: "1-2 min", level: "Fácil", Comp: GameOrder30 },
  rps: { key: "rps", name: "Piedra, papel o tijera", short: "Mejor de 5 contra la CPU", time: "1 min", level: "Fácil", Comp: GameRPS },
  catch: { key: "catch", name: "Atrapa objetos", short: "Mueve la cesta 30s", time: "30s", level: "Fácil", Comp: GameCatch, fields: [
    { key: "good", label: "Emoji a atrapar", type: "text", placeholder: "🐚" },
    { key: "bad", label: "Emoji a evitar", type: "text", placeholder: "🪼" },
    { key: "basket", label: "Emoji de la cesta", type: "text", placeholder: "🪣" },
  ] },
  simon: { key: "simon", name: "Simón dice", short: "Repite la secuencia de colores", time: "1-2 min", level: "Media", Comp: GameSimon },
  maze: { key: "maze", name: "Laberinto", short: "Encuentra la salida 7×7", time: "1 min", level: "Fácil", Comp: GameMaze },
  nonogram: { key: "nonogram", name: "Nonograma corazón", short: "Pinta el dibujo oculto", time: "2 min", level: "Media", Comp: GameNonogram },
  whack: { key: "whack", name: "Atrapa a la mascota", short: "Toca cuando asome, 30s", time: "30s", level: "Fácil", Comp: GameWhack, fields: [
    { key: "emoji", label: "Emoji de la mascota", type: "text", placeholder: "🐶" },
    { key: "hole", label: "Emoji del escondite", type: "text", placeholder: "🛋️" },
  ] },
  wordle: { key: "wordle", name: "Wordle", short: "Adivina la palabra en 6 intentos", time: "2 min", level: "Media", Comp: GameWordle, fields: [
    { key: "word", label: "Palabra secreta (3-8 letras, sin tildes)", type: "text", placeholder: "PEQUE" },
  ] },
  math: { key: "math", name: "Cálculo relámpago", short: "8 operaciones en 45s", time: "45s", level: "Fácil", Comp: GameMath },
  sliding: { key: "sliding", name: "Puzzle de la foto", short: "Recompón la foto deslizando", time: "1-2 min", level: "Media", Comp: GameSliding, fields: [
    { key: "usePhoto", label: "Usar la foto del recuerdo como puzzle (true/false)", type: "text", placeholder: "true", help: "Si no hay foto, usa números" },
  ] },
  anagram: { key: "anagram", name: "Anagramas", short: "Ordena letras con pista", time: "2 min", level: "Media", Comp: GameAnagram, fields: [
    { key: "words", label: "Palabras (una por línea, PALABRA:pista)", type: "textarea", placeholder: "HERMANAS:👭 Lo que somos\nSECRETO:🤫 Lo que guardamos" },
  ] },
  trivia: { key: "trivia", name: "Trivia personal", short: "Preguntas sobre vosotras", time: "1 min", level: "Fácil", Comp: GameTrivia, fields: [
    { key: "questions", label: "Preguntas (una por línea)", type: "textarea", placeholder: "¿Mi comida favorita?|Pizza|Sushi|Paella|Tacos|Pizza", help: "Formato: pregunta|opción1|opción2|opción3|opción4|respuesta correcta" },
  ] },
  reflex: { key: "reflex", name: "Reflejo verde", short: "Test de reacción, 3 rondas", time: "1 min", level: "Fácil", Comp: GameReflex },
  diff: { key: "diff", name: "Encuentra diferencias", short: "3 diferencias entre dos fotos", time: "1 min", level: "Fácil", Comp: GameDiff },
  timing: { key: "timing", name: "Zona verde", short: "Para el cursor en el momento justo", time: "1 min", level: "Fácil", Comp: GameTiming },
  lights: { key: "lights", name: "Apaga las luces", short: "Lights out 4×4", time: "2 min", level: "Media", Comp: GameLights },
  lock: { key: "lock", name: "Candado", short: "Combinación con pistas", time: "1 min", level: "Fácil", Comp: GameLock, fields: [
    { key: "code", label: "Código (cifras separadas por coma, 2-5)", type: "text", placeholder: "2,4,6" },
    { key: "hints", label: "Pistas separadas por |", type: "text", placeholder: "Día|Mes|Último dígito del año" },
  ] },
  tictac: { key: "tictac", name: "Tres en raya", short: "Contra la CPU", time: "1 min", level: "Fácil", Comp: GameTicTac },
  soup: { key: "soup", name: "Sopa de letras", short: "3 palabras ocultas", time: "1-2 min", level: "Fácil", Comp: GameSoup },
  sequence: { key: "sequence", name: "Secuencia lógica", short: "5 series numéricas", time: "2 min", level: "Media", Comp: GameSequence },
  intruder: { key: "intruder", name: "El intruso", short: "Encuentra el distinto, 5 rondas", time: "1 min", level: "Fácil", Comp: GameIntruder },
  flash: { key: "flash", name: "Memoria flash", short: "Memoriza 3, 4 y 5 emojis", time: "2 min", level: "Media", Comp: GameFlash, fields: [
    { key: "emojis", label: "6-8 emojis separados por coma", type: "text", placeholder: "🍿,🎬,🛋️,🧣,🍫,😴,🥤,📺" },
  ] },
  recycle: { key: "recycle", name: "Ordena el caos", short: "Clasifica 10 objetos", time: "1-2 min", level: "Fácil", Comp: GameRecycle },
  hanoi: { key: "hanoi", name: "Torres de Hanói", short: "3 discos, mínimo 7 movs", time: "2 min", level: "Media", Comp: GameHanoi },
  targets: { key: "targets", name: "Dianas", short: "10 dianas rápidas", time: "45s", level: "Fácil", Comp: GameTargets },
  stroop: { key: "stroop", name: "Stroop", short: "Color vs palabra, 10 rondas", time: "30s", level: "Media", Comp: GameStroop },
  dice21: { key: "dice21", name: "Dado 21", short: "Blackjack con dados", time: "1 min", level: "Fácil", Comp: GameDice21 },
  story: { key: "story", name: "Ordena nuestra historia", short: "Cronología de momentos", time: "1 min", level: "Fácil", Comp: GameStory, fields: [
    { key: "events", label: "Momentos EN ORDEN correcto (uno por línea, 3-7)", type: "textarea", placeholder: "Naciste tú\nPrimer verano en la playa\nHoy" },
  ] },
  evens: { key: "evens", name: "Caza pares", short: "Solo números pares", time: "30s", level: "Fácil", Comp: GameEvens },
};

export const GAME_KEYS = Object.keys(GAME_DEFS);
