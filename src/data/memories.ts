export type EmotionKey = "alegria" | "tristesa" | "rabia" | "fastic" | "por";
export type MemoryKind = "intro" | "game" | "gift" | "video";

export const EMOTIONS: Record<EmotionKey, { name: string; color: string; glow: string; soft: string; text: string; emoji: string }> = {
  alegria: { name: "Alegria", color: "#ffd93d", glow: "rgba(255,217,61,0.55)", soft: "#fff7d6", text: "#8a6500", emoji: "⭐" },
  tristesa: { name: "Tristesa", color: "#4d96ff", glow: "rgba(77,150,255,0.55)", soft: "#dce8ff", text: "#1d3f8f", emoji: "💧" },
  rabia: { name: "Ràbia", color: "#ff6b6b", glow: "rgba(255,107,107,0.55)", soft: "#ffdad7", text: "#8f1b14", emoji: "🔥" },
  fastic: { name: "Fàstic", color: "#6bcb77", glow: "rgba(107,203,119,0.55)", soft: "#d8f5dd", text: "#1f6b2c", emoji: "🥦" },
  por: { name: "Por", color: "#b983ff", glow: "rgba(185,131,255,0.55)", soft: "#ebdcff", text: "#4e1f8f", emoji: "⚡" },
};

export type Memory = {
  id: number;
  kind: MemoryKind;
  title: string;
  emotion: EmotionKey;
  emotion2?: EmotionKey;
  when: string;
  hint: string;
  gameKey: string;
  gameWhy: string;
  message: string;
  photo: string;
  photoCaption?: string;
  config?: Record<string, any>;
};

export const APP_NAME = "La Càmera dels Records";

/** 🔄 VERSIÓ DEL CONTINGUT (títols, pistes, textos per defecte, jocs, i interfície).
 *  Aquesta és la "clau mestra": cada cop que es fa qualsevol canvi, es puja aquest número.
 *  A TOTS els navegadors, les còpies locals guardades amb una versió anterior deixen de
 *  tenir efecte i es netegen soles. D'aquesta manera, després de cada canvi, tot surt net
 *  i sense errors, sense que l'usuari hagi de fer res.
 *  (El progrés de les 30 esferes i l'estat del calendari NO depenen d'aquesta versió: es
 *  conserven, perquè el recorregut de qui està jugant no s'ha de perdre per una correcció.) */
/** ⚠️ Quan pugis aquest número, puja TAMBÉ el <meta name="cdr-build"> d'index.html. */
export const CONTENT_VERSION = 12;

/** Targeta d'inici (l'enllaç principal, sense ?bola=). No és cap esfera. Editable des del panell. */
export const HOME_TEXT_DEFAULT = `Aquesta nit, un Minion molt trapella ha volgut robar-te els teus records.

Per sort hem aconseguit recuperar-los abans que se'ls emportés.

Però, ell ha volgut fer de les seves i ha barrejat els records i ha encriptat el contingut de les esferes de memòria.

Ara ja no pots veure què guarda cadascuna d'elles.

Si vols tornar a descobrir els teus records, hauràs de desxifrar les esferes una a una per revelar el que contenen.

Ningú sap què conté cada esfera.

Ho hauràs de descobrir tu.

✨`;

export const FINAL_DEFAULT = {
  homeText: HOME_TEXT_DEFAULT,
  title: "Has recuperat tots els records",
  message:
    "El Minion ja no pot fer-hi res: les 30 esferes tornen a brillar. Però el record més important no cap en cap esfera: ets tu, i tot el que encara ens queda per viure juntes. T'estimo.",
  photo: "",
};

/** Text de l'esfera 1 (abans del botó per revelar el record). */
export const FIRST_SPHERE_TEXT = `Com que et volem ajudar, aquesta primera esfera ja ha estat desxifrada.

Les següents depenen de tu.`;

const PH = "Escriu aquí el teu text per a aquest record…";

export const DEFAULT_MEMORIES: Memory[] = [
  { id: 1, kind: "intro", title: "El primer record", emotion: "alegria", when: "Primera esfera", hint: FIRST_SPHERE_TEXT, gameKey: "", gameWhy: "Primera esfera: ja desxifrada, sense joc. Ella només prem el botó per revelar el record.", message: PH, photo: "" },

  { id: 2, kind: "game", title: "El nostre amagatall", emotion: "alegria", when: "Infància", hint: "1, 2, 3… amagar! Compta fins a 30 sense fer trampes.", gameKey: "order30", gameWhy: "Comptar de l'1 al 30 com quan jugàvem a amagar.", message: PH, photo: "" },
  { id: 3, kind: "game", title: "La casa dels avis", emotion: "alegria", emotion2: "tristesa", when: "Tots els estius", hint: "Un lloc amb olor de cuina i tardes llargues. Troba el que sempre hi havia.", gameKey: "memory", gameWhy: "Parelles de memòria amb els objectes de casa dels avis.", message: PH, photo: "", config: { emojis: "🍪,👵,📻,🌻,🐓,☕" } },
  { id: 4, kind: "game", title: "Plomes", emotion: "alegria", when: "Pensa-hi bé", hint: "Pensa-hi bé abans de respondre…", gameKey: "riddle", gameWhy: "Endevinalla: desxifra la connexió abans de continuar.", message: PH, photo: "", config: { question: "🪶 Un cap indi.\n\n🦜 Jack.\n\nQuè tenen en comú?", answer: "plomes,plumes,ploma,pluma" } },
  { id: 5, kind: "game", title: "Baralles de germanes", emotion: "rabia", when: "Sempre", hint: "Una baralla de germanes de les de tota la vida… però aquest cop el Minion fa de rival. Tira de la corda més fort que ell!", gameKey: "tug", gameWhy: "Tira i arronsa: la baralla de germanes de tota la vida.", message: PH, photo: "", config: { opponent: "🍌" } },
  { id: 6, kind: "game", title: "Vacances a la platja", emotion: "alegria", when: "Estiu", hint: "Sol, sorra i tresors que el mar deixa a la vora. Recull-ne tants com puguis.", gameKey: "catch", gameWhy: "Atrapar petxines i esquivar meduses.", message: PH, photo: "", config: { good: "🐚", bad: "🦀", basket: "🪣" } },
  { id: 7, kind: "game", title: "La nostra cançó", emotion: "alegria", when: "Viatges en cotxe", hint: "Aquella cançó que cantàvem a crits. Repeteix la melodia nota a nota.", gameKey: "simon", gameWhy: "Simon diu amb notes: repeteix la melodia.", message: PH, photo: "" },
  { id: 8, kind: "game", title: "El primer dia d'escola", emotion: "por", when: "Setembre", hint: "Els passadissos de l'escola semblen un laberint i el timbre sona en 15 segons. Toca les caselles per arribar a la porta blava abans no comenci la classe.", gameKey: "school", gameWhy: "Recorregut per l'escola contra el temps: el camí a la porta abans que soni el timbre.", message: PH, photo: "" },
  { id: 9, kind: "game", title: "Nadal en família", emotion: "alegria", when: "Desembre", hint: "Pinta el dibuix ocult seguint els números… té forma del que més importa.", gameKey: "nonogram", gameWhy: "Nonograma que revela un cor.", message: PH, photo: "" },

  { id: 10, kind: "gift", title: "Un regal per a tu", emotion: "alegria", when: "Esfera especial", hint: "Aquesta esfera pesa més que les altres… Sembla que el Minion hi ha amagat alguna cosa que no és un record. Encara.", gameKey: "", gameWhy: "Primer regal: l'iPhone.", message: "Escriu aquí el text del regal: per què te'l mereixes, on és amagat, etc.", photo: "", config: { giftEmoji: "📱", giftName: "Un iPhone nou!" } },

  { id: 11, kind: "game", title: "La nostra mascota", emotion: "alegria", emotion2: "tristesa", when: "Anys de companyia", hint: "Sempre s'amagava als llocs més estranys. Atrapa-la quan tregui el cap!", gameKey: "whack", gameWhy: "Caçar la mascota quan treu el cap.", message: PH, photo: "", config: { emoji: "🐶", hole: "🛋️" } },
  { id: 12, kind: "game", title: "El teu malnom", emotion: "alegria", when: "Des de petita", hint: "Només jo et dic així. Endevina la paraula lletra a lletra.", gameKey: "wordle", gameWhy: "Wordle amb el malnom.", message: PH, photo: "", config: { word: "PETITA" } },
  { id: 13, kind: "game", title: "Aniversari inoblidable", emotion: "alegria", when: "El teu aniversari", hint: "Suma espelmes, pastissos i regals. Els comptes no fallen!", gameKey: "math", gameWhy: "Càlcul ràpid: espelmes, anys i pastissos.", message: PH, photo: "" },
  { id: 14, kind: "game", title: "El gran viatge", emotion: "alegria", when: "El viatge juntes", hint: "Aquesta foto s'ha desordenat a la maleta. Recompon el record peça a peça.", gameKey: "sliding", gameWhy: "Puzle lliscant fet amb la foto del viatge.", message: PH, photo: "", config: { usePhoto: "true" } },
  { id: 15, kind: "game", title: "Cultura general", emotion: "alegria", when: "Repte de lletres", hint: "Les lletres d'aquestes paraules de cultura general s'han barrejat. Ordena-les fent servir les pistes!", gameKey: "anagram", gameWhy: "Anagrames fàcils de cultura general en català.", message: PH, photo: "", config: { words: "TERRA:🌍 El nostre planeta\nEURO:💶 La moneda que fem servir\nGIRONA:🏰 Una ciutat de Catalunya\nLLUNA:🌙 Surt de nit al cel\nDISSABTE:🎉 El dia abans de diumenge" } },
  { id: 16, kind: "game", title: "La fira", emotion: "alegria", when: "Festes del poble", hint: "A la caseta de tir mai ens enduiem el peluix. Avui, sí. Encerta totes les dianes!", gameKey: "targets", gameWhy: "Dianes ràpides com a la tómbola de la fira.", message: PH, photo: "" },
  { id: 17, kind: "game", title: "El gran ensurt", emotion: "por", when: "Aquella nit", hint: "Aquell dia el cor ens anava a mil. Mesura els teus reflexos: espera el verd.", gameKey: "reflex", gameWhy: "Test de reflexos.", message: PH, photo: "" },
  { id: 18, kind: "game", title: "Les fotos de família", emotion: "alegria", when: "Àlbum familiar", hint: "A les fotos de família sempre hi ha alguna cosa diferent. Ho veus?", gameKey: "diff", gameWhy: "Troba les diferències.", message: PH, photo: "" },
  { id: 19, kind: "game", title: "La festa", emotion: "alegria", when: "Aquella nit", hint: "A la festa hi havia globus a tot arreu. N'has agafat un… i no el pots deixar caure! Mantén-lo a l'aire 20 segons.", gameKey: "balloon", gameWhy: "El globus: un record de la festa que no es pot deixar caure.", message: PH, photo: "", config: { emoji: "🎈" } },

  { id: 20, kind: "gift", title: "Fem les maletes!", emotion: "alegria", emotion2: "por", when: "Esfera especial", hint: "Aquesta esfera fa olor de mar, d'aeroport i d'aventura. El Minion no ha pogut encriptar-la del tot…", gameKey: "", gameWhy: "Segon regal: el viatge.", message: "Escriu aquí el text del viatge: destinació, dates, amb qui…", photo: "", config: { giftEmoji: "✈️", giftName: "Un viatge juntes!" } },

  { id: 21, kind: "game", title: "La nit que vam plorar juntes", emotion: "tristesa", when: "Un dia difícil", hint: "Apaga tots els llums. De vegades només cal companyia a les fosques.", gameKey: "lights", gameWhy: "Apagar llums, com quedar-se juntes fins adormir-se.", message: PH, photo: "" },
  { id: 22, kind: "game", title: "La nostra data", emotion: "alegria", when: "Dia especial", hint: "Hi ha un dia de l'any que és només nostre, i el Minion l'ha amagat sota una capa de plata. Rasca per descobrir-lo.", gameKey: "scratch", gameWhy: "Rasca i guanya: descobrir la data d'un dia important.", message: PH, photo: "", config: { secret: "📅 Escriu aquí la data", label: "Rasca per descobrir la data" } },
  { id: 23, kind: "game", title: "Tardes de jocs de taula", emotion: "rabia", emotion2: "alegria", when: "Tardes de pluja", hint: "Sempre guanyaves tu… o feies trampes? Demostra-ho.", gameKey: "tictac", gameWhy: "Tres en ratlla.", message: PH, photo: "" },
  { id: 24, kind: "game", title: "El nostre lloc", emotion: "alegria", when: "Sempre hi tornem", hint: "Tres paraules amagades que descriuen el nostre racó preferit.", gameKey: "soup", gameWhy: "Sopa de lletres.", message: PH, photo: "" },
  { id: 25, kind: "game", title: "Els anys passen", emotion: "tristesa", emotion2: "alegria", when: "Créixer", hint: "Tot segueix un patró. Descobreix com continua la sèrie.", gameKey: "sequence", gameWhy: "Sèries lògiques.", message: PH, photo: "" },
  { id: 26, kind: "game", title: "La broma pesada", emotion: "alegria", when: "Innocents", hint: "Aquell dia et van enganyar amb una broma pesada… i aquí també et volen enganyar. No llegeixis la paraula: mira el color de la tinta!", gameKey: "stroop", gameWhy: "Color trampa: no et deixis enganyar, com amb la broma.", message: PH, photo: "" },
  { id: 27, kind: "game", title: "Nits de peli i manta", emotion: "alegria", when: "Dissabtes", hint: "Memoritza la seqüència de la nit perfecta.", gameKey: "flash", gameWhy: "Memòria flash amb emojis de la nit de pelis.", message: PH, photo: "", config: { emojis: "🍿,🎬,🛋️,🧣,🍫,😴,🥤,📺" } },
  { id: 28, kind: "game", title: "Pas a pas", emotion: "por", emotion2: "alegria", when: "El teu gran èxit", hint: "Les grans fites s'aconsegueixen movent una peça cada vegada.", gameKey: "hanoi", gameWhy: "Torres de Hanoi: constància.", message: PH, photo: "" },
  { id: 29, kind: "game", title: "Nits de cartes", emotion: "alegria", emotion2: "tristesa", when: "Vacances", hint: "El 21 era la xifra màgica a la taula de la cuina. Acosta-t'hi tant com puguis… sense passar-te!", gameKey: "dice21", gameWhy: "Blackjack amb daus, com les partides a la taula de la cuina.", message: PH, photo: "" },

  { id: 30, kind: "video", title: "El nostre vídeo", emotion: "alegria", emotion2: "tristesa", when: "L'última esfera", hint: "Aquesta és l'última esfera. Dins hi ha alguna cosa que hem fet per a tu amb molt d'amor.", gameKey: "", gameWhy: "Vídeo final fet per la família.", message: "Escriu aquí el missatge final que acompanya el vídeo.", photo: "", config: { videoUrl: "", requireAll: "true" } },
];
