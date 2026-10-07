import { useEffect, useRef, useState } from "react";
import { X, Download, Upload, ImagePlus, ChevronDown, ChevronUp, Printer, Trash2, Link2, Save, RotateCcw, Unlock, ExternalLink } from "lucide-react";
import { EMOTIONS, EmotionKey, FINAL_DEFAULT, Memory, MemoryKind } from "../data/memories";
import { GAME_DEFS, GAME_KEYS } from "../games/registry";
import { Sphere } from "./Sphere";
import { exportAll, fileToDataUrl, importAll, loadPublished, onSaveStatus, publishedIsStale, flushLocal, hasLocalOverrides, getLocalBaseSig, clearLocalOverrides, Progress } from "../data/store";

type Props = {
  memories: Memory[];
  final: typeof FINAL_DEFAULT;
  progress: Progress;
  onChange: (m: Memory[]) => void;
  onChangeFinal: (f: typeof FINAL_DEFAULT) => void;
  onResetProgress: () => void;
  onUnlockAll: () => void;
  onClose: () => void;
  onPrint: () => void;
};

const inputCls = "w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white placeholder:text-white/30 outline-none focus:border-amber-300/60 focus:bg-white/10";
const labelCls = "mb-1 block text-[11px] font-black uppercase tracking-wider text-white/50";
const KIND_LABEL: Record<MemoryKind, string> = { intro: "✨ Primera esfera (ya desencriptada, sin juego)", game: "🧩 Minijuego + recuerdo", gift: "🎁 Regalo", video: "🎬 Vídeo final" };

function PhotoField({ value, onChange, label = "Fotografía" }: { value: string; onChange: (v: string) => void; label?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="flex gap-3">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/20 bg-white/5">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-6 w-6 text-white/30" />}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex gap-2">
            <button type="button" onClick={() => ref.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg bg-amber-300 px-3 py-1.5 text-xs font-black text-stone-900 hover:bg-amber-200"><Upload className="h-3.5 w-3.5" /> {busy ? "Procesando…" : "Subir foto"}</button>
            {value && <button type="button" onClick={() => onChange("")} className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white/70 hover:bg-white/20"><Trash2 className="h-3.5 w-3.5" /> Quitar</button>}
          </div>
          <div className="relative">
            <Link2 className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
            <input value={value.startsWith("data:") ? "" : value} onChange={(e) => onChange(e.target.value)} placeholder="…o ruta/URL: fotos/01.jpg" className={`${inputCls} pl-8`} />
          </div>
          <input ref={ref} type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setBusy(true); try { onChange(await fileToDataUrl(f)); } finally { setBusy(false); } }} />
        </div>
      </div>
      <p className="mt-1 text-[11px] font-semibold text-white/40">Recomendado: guarda las fotos en <code>public/fotos/</code> y escribe la ruta (ej. <code>fotos/01.jpg</code>). Así el JSON pesa poco.</p>
    </div>
  );
}

function MemoryForm({ m, onChange }: { m: Memory; onChange: (m: Memory) => void }) {
  const def = GAME_DEFS[m.gameKey];
  const set = (patch: Partial<Memory>) => onChange({ ...m, ...patch });
  const setCfg = (k: string, v: any) => onChange({ ...m, config: { ...(m.config || {}), [k]: v } });
  const nfcUrl = `${window.location.origin}${window.location.pathname}?bola=${m.id}`;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {m.kind === "intro" && (
        <div className="rounded-xl border border-amber-300/40 bg-amber-300/10 p-3 text-xs font-semibold text-amber-100 md:col-span-2">
          ✨ <b>Esfera 1: ya desencriptada, sin juego.</b> Tu hermana ve el texto de «Pista» y pulsa el botón <b>«Revelar el record»</b>: entonces aparecen la <b>foto</b> y el <b>mensaje</b>, igual que en las demás esferas. El mensaje del Minion va en la <b>tarjeta de inicio</b> (bloque 🏠 de arriba del panel), no aquí.
        </div>
      )}
      <div className="space-y-3">
        <div><label className={labelCls}>Tipo de esfera</label>
          <select value={m.kind} onChange={(e) => set({ kind: e.target.value as MemoryKind })} className={inputCls}>
            {(Object.keys(KIND_LABEL) as MemoryKind[]).map((k) => <option key={k} value={k} className="text-black">{KIND_LABEL[k]}</option>)}
          </select></div>
        <div><label className={labelCls}>Título del recuerdo (en catalán)</label><input value={m.title} onChange={(e) => set({ title: e.target.value })} className={inputCls} /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className={labelCls}>Emoción</label>
            <select value={m.emotion} onChange={(e) => set({ emotion: e.target.value as EmotionKey })} className={inputCls}>
              {(Object.keys(EMOTIONS) as EmotionKey[]).map((k) => <option key={k} value={k} className="text-black">{EMOTIONS[k].emoji} {EMOTIONS[k].name}</option>)}
            </select></div>
          <div><label className={labelCls}>Segunda emoción</label>
            <select value={m.emotion2 || ""} onChange={(e) => set({ emotion2: (e.target.value || undefined) as EmotionKey | undefined })} className={inputCls}>
              <option value="" className="text-black">— Ninguna —</option>
              {(Object.keys(EMOTIONS) as EmotionKey[]).map((k) => <option key={k} value={k} className="text-black">{EMOTIONS[k].emoji} {EMOTIONS[k].name}</option>)}
            </select></div>
        </div>
        <div><label className={labelCls}>Cuándo / subtítulo (en catalán)</label><input value={m.when} onChange={(e) => set({ when: e.target.value })} className={inputCls} placeholder="Estiu 2012" /></div>
        <div><label className={labelCls}>{m.kind === "intro" ? "Texto antes del botón (esfera ya desencriptada)" : "Pista antes del reto (sin desvelar el recuerdo)"}</label><textarea value={m.hint} onChange={(e) => set({ hint: e.target.value })} rows={3} className={inputCls} /></div>
        <div><label className={labelCls}>Mensaje personal (se muestra al desbloquear)</label><textarea value={m.message} onChange={(e) => set({ message: e.target.value })} rows={5} className={inputCls} placeholder="Escriu aquí el teu text…" /></div>
        <div><label className={labelCls}>Pie de foto (opcional)</label><input value={m.photoCaption || ""} onChange={(e) => set({ photoCaption: e.target.value })} className={inputCls} /></div>
      </div>
      <div className="space-y-3">
        <PhotoField value={m.photo} onChange={(v) => set({ photo: v })} />

        {m.kind === "game" && (
          <>
            <div>
              <label className={labelCls}>Minijuego</label>
              <select value={m.gameKey} onChange={(e) => set({ gameKey: e.target.value })} className={inputCls}>
                {GAME_KEYS.map((k) => <option key={k} value={k} className="text-black">{GAME_DEFS[k].name} · {GAME_DEFS[k].short}</option>)}
              </select>
              <p className="mt-1 text-[11px] font-semibold text-white/40">{def?.time}</p>
            </div>
            <div><label className={labelCls}>Por qué este juego conecta con el recuerdo (nota para ti)</label><input value={m.gameWhy} onChange={(e) => set({ gameWhy: e.target.value })} className={inputCls} /></div>
            {def?.fields && def.fields.length > 0 && (
              <div className="rounded-xl border border-amber-300/30 bg-amber-300/10 p-3">
                <p className="mb-2 text-xs font-black text-amber-200">⚙️ Personaliza el reto</p>
                <div className="space-y-2">
                  {def.fields.map((f) => (
                    <div key={f.key}>
                      <label className={labelCls}>{f.label}</label>
                      {f.type === "textarea" ? <textarea rows={4} value={m.config?.[f.key] ?? ""} onChange={(e) => setCfg(f.key, e.target.value)} placeholder={f.placeholder} className={inputCls} /> : <input type={f.type === "number" ? "number" : "text"} value={m.config?.[f.key] ?? ""} onChange={(e) => setCfg(f.key, e.target.value)} placeholder={f.placeholder} className={inputCls} />}
                      {f.help && <p className="mt-0.5 text-[11px] font-semibold text-white/40">{f.help}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {m.kind === "gift" && (
          <div className="rounded-xl border border-pink-300/30 bg-pink-300/10 p-3 space-y-2">
            <p className="text-xs font-black text-pink-200">🎁 Datos del regalo</p>
            <div><label className={labelCls}>Emoji del regalo</label><input value={m.config?.giftEmoji ?? ""} onChange={(e) => setCfg("giftEmoji", e.target.value)} placeholder="📱" className={inputCls} /></div>
            <div><label className={labelCls}>Nombre del regalo (en catalán, título grande)</label><input value={m.config?.giftName ?? ""} onChange={(e) => setCfg("giftName", e.target.value)} placeholder="Un iPhone nou!" className={inputCls} /></div>
            {m.id === 10 && (
              <div>
                <label className={labelCls}>PNG del personaje con el iPhone</label>
                <input value={m.config?.minionImage ?? ""} onChange={(e) => setCfg("minionImage", e.target.value)} placeholder="minions/iphone.png" className={inputCls} />
                <p className="mt-1 text-[11px] font-semibold text-white/60">Sube el PNG transparente a <code>public/minions/iphone.png</code> en GitHub. Aparecerá animado antes y después de abrir el regalo. No es la foto del recuerdo: esa se añade arriba por separado.</p>
              </div>
            )}
            <p className="text-[11px] font-semibold text-white/40">Ella tocará la caja 🎁 tres veces y se revelará el regalo, la foto y tu mensaje.</p>
          </div>
        )}

        {m.kind === "video" && (
          <div className="rounded-xl border border-sky-300/30 bg-sky-300/10 p-3 space-y-2">
            <p className="text-xs font-black text-sky-200">🎬 Vídeo</p>
            <div><label className={labelCls}>Enlace del vídeo</label><input value={m.config?.videoUrl ?? ""} onChange={(e) => setCfg("videoUrl", e.target.value)} placeholder="https://youtu.be/… o video/final.mp4" className={inputCls} />
              <p className="mt-1 text-[11px] font-semibold text-white/40">Acepta YouTube (mejor como <b>no listado</b>), Vimeo, Google Drive o un archivo .mp4 dentro de <code>public/video/</code>.</p></div>
            <div><label className={labelCls}>Requiere las otras 29 esferas (true/false)</label><input value={m.config?.requireAll ?? "true"} onChange={(e) => setCfg("requireAll", e.target.value)} className={inputCls} /></div>
          </div>
        )}

        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-[11px] font-black uppercase tracking-wider text-white/50">URL para la etiqueta NFC</p>
          <code className="mt-1 block break-all text-xs font-bold text-emerald-300">{nfcUrl}</code>
          <a href={nfcUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-amber-200 hover:underline"><ExternalLink className="h-3.5 w-3.5" /> Probar esta esfera en una pestaña nueva</a>
        </div>
      </div>
    </div>
  );
}

/** Comprova si una imatge de public/ es carrega a la web publicada. */
function ImageCheck({ path, label }: { path: string; label: string }) {
  const url = new URL(path, document.baseURI).href;
  const [state, setState] = useState<"loading" | "ok" | "fail">("loading");
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/5 p-2">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/10">
        {state !== "fail" ? (
          <img src={url} alt="" className="h-full w-full object-contain" onLoad={() => setState("ok")} onError={() => setState("fail")} />
        ) : (
          <span className="text-xl">❌</span>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-black">{state === "ok" ? "✅" : state === "fail" ? "❌" : "⏳"} {label}</p>
        <code className="block break-all text-[11px] text-emerald-300">public/{path}</code>
        {state === "fail" && <p className="text-[11px] font-semibold text-orange-200">No s'ha trobat. Puja-la a GitHub en aquesta carpeta.</p>}
      </div>
    </div>
  );
}

export function Editor({ memories, final, progress, onChange, onChangeFinal, onResetProgress, onUnlockAll, onClose, onPrint }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  const [showFinal, setShowFinal] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const unlockedCount = Object.keys(progress).length;

  // Fotos publicades a public/recuerdos.json (per detectar les que només existeixen en aquest navegador)
  const [pubPhotos, setPubPhotos] = useState<Record<number, string> | null>(null);
  const [pubFinalPhoto, setPubFinalPhoto] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  // Avís de desat: mai bloqueja, només informa (abans sortia un alert en cada lletra)
  const [saveWarn, setSaveWarn] = useState(false);
  // Quina versió es veu: la publicada o canvis locals encara sense publicar
  const [localPending, setLocalPending] = useState(false);
  useEffect(() => {
    loadPublished().then((pub) => {
      const map: Record<number, string> = {};
      (pub?.memories || []).forEach((x) => { if (x && typeof x.id === "number") map[x.id] = x.photo || ""; });
      setPubPhotos(map);
      setPubFinalPhoto(pub?.final?.photo || "");
      setStale(publishedIsStale());
      setLocalPending(!!pub && hasLocalOverrides() && getLocalBaseSig() === pub.sig);
    });
  }, []);

  // Escolta el resultat del desat local (amb debounce): si la quota és plena, avisa un cop
  useEffect(() => onSaveStatus((s) => setSaveWarn(!s.ok)), []);

  const unpublished = (m: Memory) => !!m.photo && pubPhotos !== null && pubPhotos[m.id] !== m.photo;
  const unpublishedIds = memories.filter(unpublished).map((m) => m.id);
  const finalUnpublished = !!final.photo && pubFinalPhoto !== null && pubFinalPhoto !== final.photo;
  const totalUnpublished = unpublishedIds.length + (finalUnpublished ? 1 : 0);

  const ready = (m: Memory) => !!m.photo && !m.message.includes("…") && !m.message.startsWith("Escriu");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0b0a1f] text-white">
      <div className="sticky top-0 z-10 border-b border-white/10 bg-[#0b0a1f]/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div>
            <h2 className="text-lg font-black">Panel de edición · 30 esferas</h2>
            <p className="text-xs font-semibold text-white/50">Solo lo ves tú (URL con <code>?editar=1</code>). Los cambios se guardan en este navegador.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={onPrint} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-black hover:bg-white/20"><Printer className="h-4 w-4" /> Imprimir fichas</button>
            <button onClick={() => exportAll(memories, final)} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-black hover:bg-white/20"><Download className="h-4 w-4" /> Exportar recuerdos.json</button>
            <button onClick={() => importRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-black hover:bg-white/20"><Upload className="h-4 w-4" /> Importar</button>
            <input ref={importRef} type="file" accept="application/json" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; try { const d = await importAll(f); onChange(d.memories); onChangeFinal(d.final); alert("Importado correctamente."); } catch { alert("Archivo no válido."); } }} />
            <button onClick={onClose} className="inline-flex items-center gap-1.5 rounded-lg bg-amber-300 px-3 py-2 text-xs font-black text-stone-900 hover:bg-amber-200"><Save className="h-4 w-4" /> Guardar y volver</button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-5">
        {/* AVÍS: no s'han pogut guardar les fotos en aquest navegador */}
        {saveWarn && (
          <div className="mb-4 rounded-2xl border-2 border-orange-300 bg-orange-300/15 p-4">
            <p className="font-black text-orange-200">⚠️ Les fotos pujades no caben en aquest navegador</p>
            <p className="mt-1 text-xs font-semibold text-white/75">
              Els <b>textos s'han guardat</b> i pots seguir editant amb normalitat. El navegador s'ha quedat sense espai per a les fotos incrustades (base64), així que en <b>aquest</b> navegador no es recordaran les fotos que encara no has publicat. Les fotos que ja són a <code>recuerdos.json</code> es continuen veient correctament.
            </p>
            <ol className="mt-2 list-decimal space-y-0.5 pl-5 text-xs font-semibold text-white/70">
              <li>Prem <b>Exportar recuerdos.json</b> i puja'l a <code className="text-emerald-300">public/recuerdos.json</code> (així no perds res).</li>
              <li>Per evitar-ho en endavant: guarda les imatges com a fitxers a <code className="text-emerald-300">public/fotos/</code> i escriu la ruta al camp d'URL (ex. <code className="text-emerald-300">fotos/01.jpg</code>) en lloc de pujar-les.</li>
            </ol>
            <button onClick={() => setSaveWarn(false)} className="mt-2 text-xs font-bold text-white/70 underline">Entesos, amaga</button>
          </div>
        )}

        {/* AVÍS: recuerdos.json d'una versió anterior */}
        {stale && (
          <div className="mb-4 rounded-2xl border-2 border-sky-300 bg-sky-300/15 p-4">
            <p className="font-black text-sky-200">ℹ️ El <code>recuerdos.json</code> publicat és d'una versió anterior del codi</p>
            <p className="mt-1 text-xs font-semibold text-white/70">S'han aplicat les <b>fotos, peus de foto i missatges</b> que hi havia. Els <b>títols, pistes i textos</b> han tornat als valors nous del codi. Si vols mantenir canvis de text que vas fer al panell, torna'ls a escriure aquí i prem <b>Exportar recuerdos.json</b>.</p>
            <button onClick={() => exportAll(memories, final)} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-sky-300 px-3 py-2 text-xs font-black text-stone-900 hover:bg-sky-200"><Download className="h-4 w-4" /> Regenerar recuerdos.json</button>
          </div>
        )}

        {/* AVÍS: fotos sense publicar */}
        {totalUnpublished > 0 && (
          <div className="mb-4 rounded-2xl border-2 border-amber-300 bg-amber-300/15 p-4">
            <p className="font-black text-amber-200">⚠️ Tienes {totalUnpublished} {totalUnpublished === 1 ? "foto" : "fotos"} que solo existe{totalUnpublished === 1 ? "" : "n"} en este navegador</p>
            <p className="mt-1 text-xs font-semibold text-white/70">
              {unpublishedIds.length > 0 && <>Esferas: <b className="text-amber-100">{unpublishedIds.map((i) => `#${String(i).padStart(2, "0")}`).join(", ")}</b>{finalUnpublished ? " y la foto del mensaje final" : ""}. </>}
              {unpublishedIds.length === 0 && finalUnpublished && <>Foto del mensaje final. </>}
              <b>Tu hermana NO las verá</b> (ni tú desde otro móvil u otro navegador) hasta que las publiques.
            </p>
            <ol className="mt-2 list-decimal space-y-0.5 pl-5 text-xs font-semibold text-white/70">
              <li>Pulsa el botón de abajo para descargar <code className="text-emerald-300">recuerdos.json</code>.</li>
              <li>En GitHub, entra en la carpeta <code className="text-emerald-300">public</code> → <b>Add file → Upload files</b> y sube ese archivo (sustituye al anterior).</li>
              <li>Espera a que <b>Actions</b> salga en verde y haz un refresco fuerte (Ctrl+F5).</li>
            </ol>
            <button onClick={() => exportAll(memories, final)} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-300 px-3 py-2 text-xs font-black text-stone-900 hover:bg-amber-200"><Download className="h-4 w-4" /> Descargar recuerdos.json ahora</button>
          </div>
        )}
        {totalUnpublished === 0 && pubPhotos !== null && memories.some((m) => !!m.photo) && (
          <div className="mb-4 rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-2 text-xs font-bold text-emerald-200">✅ Todas las fotos de este panel ya están en <code>recuerdos.json</code> publicado.</div>
        )}

        {/* QUINA VERSIÓ ES VEU */}
        <div className={`mb-4 rounded-2xl border p-3 text-xs font-semibold ${localPending ? "border-sky-300/40 bg-sky-300/10 text-sky-100" : "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"}`}>
          {localPending ? (
            <>
              ✏️ <b>Estàs veient canvis teus encara no publicats.</b> Els altres navegadors no els veuran fins que exportis i pugis el <code>recuerdos.json</code>.
              <button
                onClick={() => { if (confirm("Descartar els canvis d'aquest navegador i carregar la versió publicada?")) { clearLocalOverrides(); window.location.reload(); } }}
                className="ml-2 underline"
              >
                Descartar i veure la publicada
              </button>
            </>
          ) : (
            <>✅ <b>Estàs veient la versió publicada</b> (<code>recuerdos.json</code>). Si fas canvis, exporta i puja el JSON perquè els vegin els altres.</>
          )}
        </div>

        {/* COMPROVACIÓ DE LES IMATGES DELS MINIONS */}
        <div className="mb-4 rounded-2xl border border-yellow-300/30 bg-yellow-300/10 p-4">
          <p className="font-black text-yellow-200">🍌 Imatges dels Minions</p>
          <p className="mt-1 text-xs font-semibold text-white/60">
            Si una imatge surt amb ❌, la web mostra el dibuix de reserva. Puja el PNG a GitHub a la ruta exacta indicada (majúscules i minúscules incloses).
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <ImageCheck path="minions/minion.png" label="Minion general (totes les pantalles)" />
            <ImageCheck path="minions/iphone.png" label="Minion de la bola 10 (iPhone)" />
          </div>
        </div>

        {/* ZONA DE PRUEBAS */}
        <div className="mb-4 rounded-2xl border border-red-300/30 bg-red-400/10 p-4">
          <p className="font-black text-red-200">🧪 Zona de pruebas · progreso en este dispositivo: {unlockedCount}/30</p>
          <p className="mt-1 text-xs font-semibold text-white/60">El progreso (qué esferas están desbloqueadas) se guarda <b>por dispositivo</b>. Antes de dárselo a tu hermana, reinícialo en su móvil o asegúrate de que nunca haya abierto la web ahí.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => { if (confirm("¿Bloquear de nuevo las 30 esferas en este dispositivo? (No borra fotos ni textos)")) onResetProgress(); }} className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-2 text-xs font-black text-white hover:bg-red-600"><RotateCcw className="h-4 w-4" /> Reiniciar progreso (volver a 0)</button>
            <button onClick={onUnlockAll} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-black hover:bg-white/20"><Unlock className="h-4 w-4" /> Desbloquear todas (para revisar)</button>
          </div>
          <p className="mt-2 text-[11px] font-semibold text-white/40">También puedes reiniciar desde cualquier móvil abriendo: <code className="text-emerald-300">{window.location.origin}{window.location.pathname}?reset=1</code> · Solo bloquea las esferas: no toca fotos ni textos.</p>
          <p className="mt-1 text-[11px] font-semibold text-amber-200/80">⚠️ Prioridad: <b>textos, fotos y títulos</b> → recuerdos.json y panel mandan sobre el código. <b>Qué juego tiene cada esfera</b> → manda el código, salvo que lo cambies aquí (entonces se marca como "elegido aquí").</p>
        </div>

        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-semibold text-white/70">
          <p className="font-black text-white">Cómo usarlo</p>
          <ol className="mt-1 list-decimal space-y-0.5 pl-5">
            <li>Abre cada esfera, sube la <b className="text-amber-200">foto</b> y escribe el <b className="text-amber-200">mensaje en catalán</b>.</li>
            <li><b>Tarjeta de inicio</b> (enlace sin <code>?bola=</code>) = mensaje del Minion. Después, esfera <b>1</b> = ya desencriptada, solo botón + foto · <b>10</b> regalo iPhone · <b>20</b> regalo viaje · <b>30</b> vídeo.</li>
            <li>Pulsa <b>Exportar recuerdos.json</b> y guarda el archivo como <code className="text-emerald-300">public/recuerdos.json</code> en el proyecto → sube a GitHub.</li>
            <li>Graba en cada NFC la URL de su esfera (<code className="text-emerald-300">?bola=N</code>).</li>
          </ol>
          <p className="mt-2 text-xs text-white/40">Esferas listas: {memories.filter(ready).length}/30</p>
        </div>

        <div className="mb-4 overflow-hidden rounded-2xl border border-amber-300/30 bg-gradient-to-br from-amber-300/10 to-fuchsia-500/10">
          <button onClick={() => setShowFinal(!showFinal)} className="flex w-full items-center justify-between px-4 py-3 text-left">
            <div className="flex items-center gap-3"><span className="text-2xl">🏠</span><div><p className="font-black">🃏 Tarjeta de inicio (el mensaje del Minion) y mensaje al completar las 30</p><p className="text-xs font-semibold text-white/50">Es el enlace principal, sin <code>?bola=</code>. No es ninguna esfera.</p></div></div>
            {showFinal ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          {showFinal && (
            <div className="space-y-4 border-t border-white/10 p-4">
              <div>
                <label className={labelCls}>📖 Texto de la tarjeta de inicio (en catalán)</label>
                <textarea rows={14} value={final.homeText} onChange={(e) => onChangeFinal({ ...final, homeText: e.target.value })} className={inputCls} />
                <p className="mt-1 text-[11px] font-semibold text-white/40">Es lo primero que ve tu hermana: la tarjeta que escanea ANTES de las esferas. Los saltos de línea se respetan.</p>
                <p className="mt-2 text-[11px] font-black uppercase tracking-wider text-white/50">URL para la tarjeta de inicio (NFC / QR)</p>
                <code className="block break-all text-xs font-bold text-emerald-300">{window.location.origin}{window.location.pathname}</code>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-3">
                  <p className="text-xs font-black text-amber-200">🌟 Al completar las 30 (se muestra arriba en la pantalla principal)</p>
                  <div><label className={labelCls}>Título (catalán)</label><input value={final.title} onChange={(e) => onChangeFinal({ ...final, title: e.target.value })} className={inputCls} /></div>
                  <div><label className={labelCls}>Mensaje (catalán)</label><textarea rows={7} value={final.message} onChange={(e) => onChangeFinal({ ...final, message: e.target.value })} className={inputCls} /></div>
                </div>
                <PhotoField value={final.photo} onChange={(v) => onChangeFinal({ ...final, photo: v })} />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {memories.map((m) => {
            const isOpen = open === m.id;
            const ok = ready(m);
            return (
              <div key={m.id} className={`overflow-hidden rounded-2xl border ${isOpen ? "border-amber-300/40 bg-white/[0.06]" : m.kind !== "game" ? "border-pink-300/30 bg-pink-300/[0.04]" : "border-white/10 bg-white/[0.03]"}`}>
                <button onClick={() => setOpen(isOpen ? null : m.id)} className="flex w-full items-center gap-3 px-3 py-2.5 text-left">
                  <Sphere emotion={m.emotion} emotion2={m.emotion2} size={44} photo={m.photo} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-black"><span className="text-white/40">#{String(m.id).padStart(2, "0")}</span> {m.title} {progress[m.id] && <span className="ml-1 rounded bg-emerald-400/20 px-1.5 py-0.5 text-[10px] text-emerald-300">desbloqueada aquí</span>}</p>
                    <p className="truncate text-xs font-semibold text-white/50">{KIND_LABEL[m.kind]}{m.kind === "game" ? ` · ${GAME_DEFS[m.gameKey]?.name}` : ""} · {m.when}</p>
                  </div>
                  <span className={`hidden rounded-full px-2 py-0.5 text-[10px] font-black sm:inline ${ok ? "bg-emerald-400/20 text-emerald-300" : "bg-white/10 text-white/50"}`}>{ok ? "Lista" : m.photo ? "Falta texto" : "Falta foto"}</span>
                  {unpublished(m) && <span className="rounded-full bg-amber-300/25 px-2 py-0.5 text-[10px] font-black text-amber-200">⚠️ foto sin publicar</span>}
                  {isOpen ? <ChevronUp className="h-5 w-5 text-white/50" /> : <ChevronDown className="h-5 w-5 text-white/50" />}
                </button>
                {isOpen && <div className="border-t border-white/10 p-4"><MemoryForm m={m} onChange={(nm) => onChange(memories.map((x) => (x.id === nm.id ? nm : x)))} /></div>}
              </div>
            );
          })}
        </div>
      </div>
      <button onClick={() => { flushLocal(); onClose(); }} className="fixed bottom-4 right-4 rounded-full bg-white p-3 text-stone-900 shadow-xl md:hidden"><X className="h-5 w-5" /></button>
    </div>
  );
}
