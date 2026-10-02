import { GameOrder30, GameNonogram, GameSliding, GameTargets, GameMemory, GameSimon, GameMaze, GameWhack, GameGuess, GameWordle } from "./set1";
import { GameSoup, GameMath, GameDiff, GameSequence, GameCatch, GameTrivia, GameAnagram, GameRPS, GameTicTac, GameReflex } from "./set2";
import { GameEvens, GameHanoi, GameIntruder, GameLock, GameStroop, GameLights, GameTiming, GameRecycle, GameFlash, GameDice21, GameStory, GameRiddle } from "./set3";

export type ConfigField = { key: string; label: string; type: "text" | "number" | "textarea"; help?: string; placeholder?: string };

export type GameDef = {
  key: string;
  name: string;      // nom que veu la jugadora (català)
  short: string;     // descripció curta (català)
  time: string;
  Comp: any;
  fields?: ConfigField[]; // ajuda per a l'editor (castellà, per a l'autor)
};

export const GAME_DEFS: Record<string, GameDef> = {
  guess: { key: "guess", name: "Endevina el número", short: "Pistes amunt/avall, 7 intents", time: "1 min", Comp: GameGuess, fields: [
    { key: "label", label: "Pregunta (en catalán)", type: "text", placeholder: "En quin any vas néixer?" },
    { key: "secret", label: "Número secreto", type: "number", placeholder: "2005" },
    { key: "min", label: "Mínimo", type: "number", placeholder: "1990" },
    { key: "max", label: "Máximo", type: "number", placeholder: "2025" },
  ] },
  memory: { key: "memory", name: "Parelles de memòria", short: "6 parelles d'emojis", time: "1 min", Comp: GameMemory, fields: [{ key: "emojis", label: "6 emojis separados por coma", type: "text", placeholder: "🍪,🧶,📻,🪴,🐓,☕" }] },
  order30: { key: "order30", name: "Compta fins a 30", short: "Toca de l'1 al 30 en ordre", time: "1-2 min", Comp: GameOrder30 },
  rps: { key: "rps", name: "Pedra, paper o tisora", short: "Millor de 5 contra la CPU", time: "1 min", Comp: GameRPS },
  catch: { key: "catch", name: "Atrapa objectes", short: "Mou la cistella 30s", time: "30s", Comp: GameCatch, fields: [
    { key: "good", label: "Emoji a atrapar", type: "text", placeholder: "🐚" },
    { key: "bad", label: "Emoji a evitar", type: "text", placeholder: "🪼" },
    { key: "basket", label: "Emoji de la cesta", type: "text", placeholder: "🪣" },
  ] },
  simon: { key: "simon", name: "Simon diu", short: "Repeteix la seqüència de colors", time: "1-2 min", Comp: GameSimon },
  maze: { key: "maze", name: "Laberint", short: "Troba la sortida", time: "1 min", Comp: GameMaze },
  nonogram: { key: "nonogram", name: "Nonograma", short: "Pinta el dibuix ocult", time: "2 min", Comp: GameNonogram },
  whack: { key: "whack", name: "Atrapa la mascota", short: "Toca quan tregui el cap", time: "30s", Comp: GameWhack, fields: [
    { key: "emoji", label: "Emoji de la mascota", type: "text", placeholder: "🐶" },
    { key: "hole", label: "Emoji del escondite", type: "text", placeholder: "🛋️" },
  ] },
  wordle: { key: "wordle", name: "Paraula secreta", short: "Endevina-la en 6 intents", time: "2 min", Comp: GameWordle, fields: [{ key: "word", label: "Palabra secreta (3-8 letras, sin acentos)", type: "text", placeholder: "PETITA" }] },
  math: { key: "math", name: "Càlcul llampec", short: "8 operacions en 45s", time: "45s", Comp: GameMath },
  sliding: { key: "sliding", name: "Puzle de la foto", short: "Recompon la foto lliscant", time: "1-2 min", Comp: GameSliding, fields: [{ key: "usePhoto", label: "Usar la foto del recuerdo como puzzle (true/false)", type: "text", placeholder: "true", help: "Si no hay foto, usa números" }] },
  anagram: { key: "anagram", name: "Anagrames", short: "Ordena lletres amb pista", time: "2 min", Comp: GameAnagram, fields: [{ key: "words", label: "Palabras (una por línea, PALABRA:pista)", type: "textarea", placeholder: "GERMANES:👭 El que som" }] },
  trivia: { key: "trivia", name: "Quant em coneixes?", short: "Preguntes sobre vosaltres", time: "1 min", Comp: GameTrivia, fields: [{ key: "questions", label: "Preguntas (una por línea)", type: "textarea", placeholder: "El meu menjar preferit?|Pizza|Sushi|Paella|Tacos|Pizza", help: "Formato: pregunta|opción1|opción2|opción3|opción4|respuesta correcta" }] },
  reflex: { key: "reflex", name: "Reflex verd", short: "Test de reacció, 3 rondes", time: "1 min", Comp: GameReflex },
  diff: { key: "diff", name: "Troba les diferències", short: "3 diferències", time: "1 min", Comp: GameDiff },
  timing: { key: "timing", name: "Zona verda", short: "Atura el cursor al moment just", time: "1 min", Comp: GameTiming },
  lights: { key: "lights", name: "Apaga els llums", short: "Lights out 4×4", time: "2 min", Comp: GameLights },
  lock: { key: "lock", name: "Cadenat", short: "Combinació amb pistes", time: "1 min", Comp: GameLock, fields: [
    { key: "code", label: "Código (cifras separadas por coma, 2-5)", type: "text", placeholder: "2,4,6" },
    { key: "hints", label: "Pistas separadas por | (en catalán)", type: "text", placeholder: "Dia|Mes|Últim dígit de l'any" },
  ] },
  tictac: { key: "tictac", name: "Tres en ratlla", short: "Contra la CPU", time: "1 min", Comp: GameTicTac },
  soup: { key: "soup", name: "Sopa de lletres", short: "3 paraules amagades", time: "1-2 min", Comp: GameSoup },
  sequence: { key: "sequence", name: "Seqüència lògica", short: "5 sèries numèriques", time: "2 min", Comp: GameSequence },
  intruder: { key: "intruder", name: "L'intrús", short: "Troba el diferent, 5 rondes", time: "1 min", Comp: GameIntruder },
  flash: { key: "flash", name: "Memòria flash", short: "Memoritza 3, 4 i 5 emojis", time: "2 min", Comp: GameFlash, fields: [{ key: "emojis", label: "6-8 emojis separados por coma", type: "text", placeholder: "🍿,🎬,🛋️,🧣,🍫,😴,🥤,📺" }] },
  recycle: { key: "recycle", name: "Ordena el caos", short: "Classifica 10 objectes", time: "1-2 min", Comp: GameRecycle },
  hanoi: { key: "hanoi", name: "Torres de Hanoi", short: "3 discs, mínim 7 movs", time: "2 min", Comp: GameHanoi },
  targets: { key: "targets", name: "Dianes", short: "10 dianes ràpides", time: "45s", Comp: GameTargets },
  stroop: { key: "stroop", name: "Color trampa", short: "Color vs paraula, 10 rondes", time: "30s", Comp: GameStroop },
  dice21: { key: "dice21", name: "Dau 21", short: "Blackjack amb daus", time: "1 min", Comp: GameDice21 },
  story: { key: "story", name: "Ordena la nostra història", short: "Cronologia de moments", time: "1 min", Comp: GameStory, fields: [{ key: "events", label: "Momentos EN ORDEN correcto (uno por línea, 3-7, en catalán)", type: "textarea", placeholder: "Vas néixer tu\nPrimer estiu a la platja\nAvui" }] },
  evens: { key: "evens", name: "Caça parells", short: "Només números parells", time: "30s", Comp: GameEvens },
  riddle: { key: "riddle", name: "Endevinalla", short: "Escriu la resposta correcta", time: "1 min", Comp: GameRiddle, fields: [
    { key: "question", label: "Enunciado de la endevinalla (en catalán, se muestra en la pantalla del juego)", type: "textarea", placeholder: "🪶 Un cap indi.\n🦜 Jack.\n\nQuè tenen en comú?" },
    { key: "answer", label: "Respuesta(s) válidas separadas por coma (sin acentos, minúsculas)", type: "text", placeholder: "plomes,plumes,ploma,pluma" },
  ] },
};

export const GAME_KEYS = Object.keys(GAME_DEFS);
