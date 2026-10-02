export type EmotionKey = "alegria" | "tristeza" | "ira" | "asco" | "miedo";

export const EMOTIONS: Record<EmotionKey, { name: string; color: string; glow: string; soft: string; text: string; emoji: string; desc: string }> = {
  alegria: { name: "Alegría", color: "#FFD23F", glow: "rgba(255,210,63,0.55)", soft: "#FFF4C2", text: "#8a6500", emoji: "⭐", desc: "Momentos que nos hicieron reír" },
  tristeza: { name: "Tristeza", color: "#4F86F7", glow: "rgba(79,134,247,0.55)", soft: "#DCE8FF", text: "#1d3f8f", emoji: "💧", desc: "Momentos duros que nos unieron" },
  ira: { name: "Ira", color: "#F0433A", glow: "rgba(240,67,58,0.55)", soft: "#FFDAD7", text: "#8f1b14", emoji: "🔥", desc: "Peleas y enfados que hoy dan risa" },
  asco: { name: "Asco", color: "#5FC96F", glow: "rgba(95,201,111,0.55)", soft: "#D8F5DD", text: "#1f6b2c", emoji: "🥦", desc: "Cosas que no soportábamos" },
  miedo: { name: "Miedo", color: "#A868F2", glow: "rgba(168,104,242,0.55)", soft: "#EBDCFF", text: "#4e1f8f", emoji: "⚡", desc: "Sustos y primeras veces" },
};

export type Memory = {
  id: number;
  title: string;
  emotion: EmotionKey;
  emotion2?: EmotionKey; // esfera bicolor opcional
  when: string; // "Verano 2009", "Tenías 6 años"
  hint: string; // pista antes del juego
  gameKey: string;
  gameWhy: string; // por qué este juego conecta con el recuerdo
  message: string; // texto personal al desbloquear
  photo: string; // URL o dataURL
  photoCaption?: string;
  config?: Record<string, any>;
};

export const FINAL_DEFAULT = {
  title: "El recuerdo que seguimos escribiendo",
  message:
    "Has desbloqueado los 30. Pero el verdadero recuerdo central no cabe en una esfera: eres tú, y todo lo que todavía nos queda por vivir juntas. Gracias por ser mi hermana. Te quiero.",
  photo: "",
};

export const DEFAULT_MEMORIES: Memory[] = [
  { id: 1, title: "El día que llegaste", emotion: "alegria", when: "El principio de todo", hint: "Todo empezó con un número: el año en que la familia creció.", gameKey: "guess", gameWhy: "Adivina el año en que naciste (o la edad que tenía yo).", message: "Aquí va tu texto: cuenta cómo fue el día que llegó a casa, qué sentiste, qué dijeron papá y mamá…", photo: "", config: { secret: 2005, min: 1990, max: 2025, label: "¿En qué año naciste?" } },
  { id: 2, title: "La casa de los abuelos", emotion: "alegria", emotion2: "tristeza", when: "Todos los veranos", hint: "Un lugar con olor a cocina y tardes largas. Encuentra lo que siempre había allí.", gameKey: "memory", gameWhy: "Parejas de memoria con los objetos de la casa de los abuelos.", message: "Escribe aquí qué hacíais en casa de los abuelos, la merienda, el patio, los cuentos…", photo: "", config: { emojis: "🍪,🧶,📻,🪴,🐓,☕" } },
  { id: 3, title: "Nuestro escondite", emotion: "alegria", when: "Infancia", hint: "1, 2, 3… ¡escondite inglés! Cuenta hasta 30 sin trampas.", gameKey: "order30", gameWhy: "Contar del 1 al 30 como cuando jugábamos al escondite.", message: "Cuenta dónde os escondíais, quién hacía trampas, el sitio secreto que nadie encontraba…", photo: "" },
  { id: 4, title: "Peleas de hermanos", emotion: "ira", when: "Siempre", hint: "¿Quién elegía el canal de la tele? Que lo decida el duelo de siempre.", gameKey: "rps", gameWhy: "Piedra, papel o tijera: así resolvíais las disputas.", message: "Recuerda alguna pelea absurda que ahora os da risa, el mando de la tele, el asiento del coche…", photo: "" },
  { id: 5, title: "Vacaciones en la playa", emotion: "alegria", when: "Verano", hint: "Sol, arena y tesoros que el mar deja en la orilla. Recoge todos los que puedas.", gameKey: "catch", gameWhy: "Atrapar conchas y esquivar medusas, como en la orilla.", message: "El castillo de arena, el helado derretido, la quemadura, el chiringuito…", photo: "", config: { good: "🐚", bad: "🪼", basket: "🪣" } },
  { id: 6, title: "Nuestra canción", emotion: "alegria", when: "Viajes en coche", hint: "Esa canción que cantábamos a gritos. Repite la melodía nota a nota.", gameKey: "simon", gameWhy: "Simón dice con notas: repite la melodía.", message: "Qué canción era, dónde la cantabais, el estribillo que os inventasteis…", photo: "" },
  { id: 7, title: "El primer día de cole", emotion: "miedo", when: "Septiembre", hint: "El camino al cole parecía un laberinto gigante. Hoy lo recorres sin miedo.", gameKey: "maze", gameWhy: "Encuentra el camino hasta la puerta del colegio.", message: "La mochila nueva, las lágrimas en la puerta, cómo te acompañé…", photo: "" },
  { id: 8, title: "Navidades en familia", emotion: "alegria", when: "Diciembre", hint: "Pinta el dibujo oculto siguiendo los números… tiene forma de lo que más importa.", gameKey: "nonogram", gameWhy: "Nonograma que revela un corazón, como el de la familia unida.", message: "El árbol torcido, el regalo repetido, la cena de Nochebuena…", photo: "" },
  { id: 9, title: "Nuestra mascota", emotion: "alegria", emotion2: "tristeza", when: "Años de compañía", hint: "Siempre se escondía en los sitios más raros. ¡Atrápala cuando asome!", gameKey: "whack", gameWhy: "Cazar a la mascota cuando asoma, como cuando se escapaba.", message: "Cómo llegó a casa, sus travesuras, cómo la echáis de menos o la queréis…", photo: "", config: { emoji: "🐶", hole: "🛋️" } },
  { id: 10, title: "Tu apodo", emotion: "alegria", when: "Desde pequeña", hint: "Solo yo te llamo así. Adivina la palabra letra a letra.", gameKey: "wordle", gameWhy: "Wordle con el apodo o palabra que solo vosotras usáis.", message: "De dónde viene el apodo, quién lo inventó, por qué se quedó…", photo: "", config: { word: "PEQUE" } },
  { id: 11, title: "Cumpleaños inolvidable", emotion: "alegria", when: "Tu cumple", hint: "Suma velas, tartas y regalos. ¡Las cuentas no fallan!", gameKey: "math", gameWhy: "Cálculo rápido: velas, años y tartas.", message: "La tarta que se cayó, la sorpresa que casi se chafó, los invitados…", photo: "" },
  { id: 12, title: "El gran viaje", emotion: "alegria", when: "El viaje juntas", hint: "Esta foto se desordenó en la maleta. Recompón el recuerdo pieza a pieza.", gameKey: "sliding", gameWhy: "Puzzle deslizante hecho con la propia foto del viaje.", message: "El vuelo perdido, el hotel raro, la foto que se repite siempre…", photo: "", config: { usePhoto: true } },
  { id: 13, title: "Nuestra palabra secreta", emotion: "alegria", when: "Código entre hermanas", hint: "Las letras se mezclaron. Ordénalas para recuperar las palabras que solo nosotras entendemos.", gameKey: "anagram", gameWhy: "Anagramas con palabras de vuestro código secreto.", message: "Qué significaban, cuándo las usabais, la cara de los demás sin entender…", photo: "", config: { words: "HERMANAS:👭 Lo que somos\nSECRETO:🤫 Lo que guardamos\nSIEMPRE:♾️ Hasta cuándo" } },
  { id: 14, title: "¿Cuánto me conoces?", emotion: "alegria", when: "Hoy", hint: "Un test rápido sobre mí. Si lo apruebas, hay premio.", gameKey: "trivia", gameWhy: "Trivia con preguntas sobre vosotras.", message: "Escribe por qué sabes que te conoce mejor que nadie…", photo: "", config: { questions: "¿Mi comida favorita?|Pizza|Sushi|Paella|Tacos|Pizza\n¿Mi película favorita?|Inside Out|Titanic|Matrix|Coco|Inside Out\n¿Mi mayor miedo?|Arañas|Alturas|Oscuridad|Payasos|Arañas\n¿Mi color favorito?|Azul|Rojo|Verde|Lila|Lila\n¿Dónde nací?|Madrid|Sevilla|Valencia|Bilbao|Madrid" } },
  { id: 15, title: "El gran susto", emotion: "miedo", when: "Aquella noche", hint: "Aquel día el corazón nos iba a mil. Mide tus reflejos: espera al verde.", gameKey: "reflex", gameWhy: "Test de reflejos: el susto que os dio aquel día.", message: "La tormenta, la película de miedo, el ruido en la noche…", photo: "" },
  { id: 16, title: "Las fotos de familia", emotion: "alegria", when: "Álbum familiar", hint: "En las fotos de familia siempre hay algo distinto. ¿Lo ves?", gameKey: "diff", gameWhy: "Encuentra las diferencias entre dos 'fotos'.", message: "La foto en la que sales con los ojos cerrados, la pose repetida cada año…", photo: "" },
  { id: 17, title: "El baile", emotion: "alegria", when: "Aquella fiesta", hint: "Ritmo, ritmo, ritmo. Para justo en el compás.", gameKey: "timing", gameWhy: "Juego de ritmo: para el cursor en el momento exacto.", message: "La coreografía inventada, la boda, el baile en el salón…", photo: "" },
  { id: 18, title: "La noche que lloramos juntas", emotion: "tristeza", when: "Un día difícil", hint: "Apaga todas las luces. A veces solo hace falta compañía en la oscuridad.", gameKey: "lights", gameWhy: "Lights Out: apagar luces, como quedarse juntas hasta dormir.", message: "El recuerdo triste que compartisteis y cómo os apoyasteis…", photo: "" },
  { id: 19, title: "Nuestra fecha", emotion: "alegria", when: "Día especial", hint: "Hay un día del año que es solo nuestro. Abre el candado con sus números.", gameKey: "lock", gameWhy: "Candado con la fecha de un día importante.", message: "Qué pasó ese día y por qué lo celebráis…", photo: "", config: { code: "2,4,6", hints: "Día (cifra 1)|Mes (cifra 2)|Último dígito del año" } },
  { id: 20, title: "Tardes de juegos de mesa", emotion: "ira", emotion2: "alegria", when: "Tardes de lluvia", hint: "Siempre ganabas tú… ¿o hacías trampas? Demuéstralo.", gameKey: "tictac", gameWhy: "Tres en raya, el clásico de las tardes de lluvia.", message: "El Monopoly interminable, la partida que acabó en pelea, el tablero perdido…", photo: "" },
  { id: 21, title: "Nuestro lugar", emotion: "alegria", when: "Siempre volvemos", hint: "Tres palabras escondidas que describen nuestro rincón favorito.", gameKey: "soup", gameWhy: "Sopa de letras con palabras del sitio especial.", message: "El parque, el banco, la terraza, la cafetería donde todo se arregla…", photo: "" },
  { id: 22, title: "Los años pasan", emotion: "tristeza", emotion2: "alegria", when: "Crecer", hint: "Todo sigue un patrón. Descubre cómo continúa la serie.", gameKey: "sequence", gameWhy: "Series lógicas: el paso del tiempo también tiene patrón.", message: "Cómo habéis cambiado, lo que se mantiene igual…", photo: "" },
  { id: 23, title: "La broma pesada", emotion: "alegria", when: "Inocentes", hint: "Entre tantos iguales, siempre había uno distinto… como tu broma.", gameKey: "intruder", gameWhy: "Encuentra el intruso, como la broma que descolocó todo.", message: "La broma que le gastaste, cómo reaccionó, la venganza…", photo: "" },
  { id: 24, title: "Noches de peli y manta", emotion: "alegria", when: "Sábados", hint: "Memoriza la secuencia de la noche perfecta.", gameKey: "flash", gameWhy: "Memoria flash con los emojis de la noche de pelis.", message: "La peli que repetís siempre, las palomitas quemadas, quién se duerme primero…", photo: "", config: { emojis: "🍿,🎬,🛋️,🧣,🍫,😴,🥤,📺" } },
  { id: 25, title: "Lo que no soportabas", emotion: "asco", when: "De pequeña", hint: "Ordenar la habitación era tu tortura. Clasifica el caos.", gameKey: "recycle", gameWhy: "Clasificar residuos: ordenar el desastre que odiabas.", message: "La comida que escupías, la habitación desordenada, el jersey que picaba…", photo: "" },
  { id: 26, title: "Paso a paso", emotion: "miedo", emotion2: "alegria", when: "Tu gran logro", hint: "Los grandes logros se consiguen moviendo una pieza cada vez.", gameKey: "hanoi", gameWhy: "Torres de Hanói: constancia, igual que tu logro.", message: "La graduación, el examen, el primer trabajo… lo orgullosa que estoy.", photo: "" },
  { id: 27, title: "La feria", emotion: "alegria", when: "Fiestas del pueblo", hint: "La caseta de tiro: nunca ganábamos el peluche. Hoy sí.", gameKey: "targets", gameWhy: "Dianas rápidas como en la tómbola.", message: "El algodón de azúcar, la noria, el peluche gigante…", photo: "" },
  { id: 28, title: "No leas, siente", emotion: "ira", when: "Discusiones", hint: "A veces lo que dicen y lo que sienten no coincide. Fíjate en el color, no en la palabra.", gameKey: "stroop", gameWhy: "Test Stroop: palabra vs color, como en las discusiones.", message: "Un recuerdo sobre perdonarse y entenderse…", photo: "" },
  { id: 29, title: "Noches de cartas", emotion: "alegria", when: "Vacaciones", hint: "El 21 era la cifra mágica en la mesa de la cocina.", gameKey: "dice21", gameWhy: "Blackjack con dados, como las partidas con los abuelos.", message: "Las partidas, las apuestas con caramelos, el que siempre perdía…", photo: "" },
  { id: 30, title: "Nuestra historia", emotion: "alegria", emotion2: "tristeza", when: "Hasta hoy", hint: "Ordena los capítulos de nuestra vida. Tú ya sabes el final.", gameKey: "story", gameWhy: "Ordenar cronológicamente los grandes momentos juntas.", message: "Un resumen de todo lo vivido y lo que viene…", photo: "", config: { events: "Naciste tú\nPrimer verano en la playa\nTu primer día de cole\nEl gran viaje juntas\nHoy, con estas 30 esferas" } },
];
