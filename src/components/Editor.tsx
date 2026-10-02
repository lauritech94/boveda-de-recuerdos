import { useRef, useState } from "react";
import { X, Download, Upload, ImagePlus, ChevronDown, ChevronUp, Printer, Trash2, Link2, Save } from "lucide-react";
import { EMOTIONS, EmotionKey, FINAL_DEFAULT, Memory } from "../data/memories";
import { GAME_DEFS, GAME_KEYS } from "../games/registry";
import { Sphere } from "./Sphere";
import { exportAll, fileToDataUrl, importAll } from "../data/store";

type Props = {
  memories: Memory[];
  final: typeof FINAL_DEFAULT;
  onChange: (m: Memory[]) => void;
  onChangeFinal: (f: typeof FINAL_DEFAULT) => void;
  onClose: () => void;
  onPrint: () => void;
};

const inputCls = "w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white placeholder:text-white/30 outline-none focus:border-amber-300/60 focus:bg-white/10";
const labelCls = "mb-1 block text-[11px] font-black uppercase tracking-wider text-white/50";

function PhotoField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div>
      <label className={labelCls}>Fotografía</label>
      <div className="flex gap-3">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/20 bg-white/5">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-6 w-6 text-white/30" />}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex gap-2">
            <button type="button" onClick={() => ref.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg bg-amber-300 px-3 py-1.5 text-xs font-black text-stone-900 hover:bg-amber-200">
              <Upload className="h-3.5 w-3.5" /> {busy ? "Procesando…" : "Subir foto"}
            </button>
            {value && <button type="button" onClick={() => onChange("")} className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white/70 hover:bg-white/20"><Trash2 className="h-3.5 w-3.5" /> Quitar</button>}
          </div>
          <div className="relative">
            <Link2 className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
            <input value={value.startsWith("data:") ? "" : value} onChange={(e) => onChange(e.target.value)} placeholder="…o pega una URL de imagen" className={`${inputCls} pl-8`} />
          </div>
          <input ref={ref} type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setBusy(true); try { onChange(await fileToDataUrl(f)); } finally { setBusy(false); } }} />
        </div>
      </div>
      <p className="mt-1 text-[11px] font-semibold text-white/40">Las fotos subidas se comprimen y guardan en este navegador. Para publicar la web, exporta el JSON y colócalo en el proyecto.</p>
    </div>
  );
}

function MemoryForm({ m, onChange }: { m: Memory; onChange: (m: Memory) => void }) {
  const def = GAME_DEFS[m.gameKey];
  const set = (patch: Partial<Memory>) => onChange({ ...m, ...patch });
  const setCfg = (k: string, v: any) => onChange({ ...m, config: { ...(m.config || {}), [k]: v } });
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-3">
        <div><label className={labelCls}>Título del recuerdo</label><input value={m.title} onChange={(e) => set({ title: e.target.value })} className={inputCls} /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className={labelCls}>Emoción principal</label>
            <select value={m.emotion} onChange={(e) => set({ emotion: e.target.value as EmotionKey })} className={inputCls}>
              {(Object.keys(EMOTIONS) as EmotionKey[]).map((k) => <option key={k} value={k} className="text-black">{EMOTIONS[k].emoji} {EMOTIONS[k].name}</option>)}
            </select></div>
          <div><label className={labelCls}>Segunda emoción</label>
            <select value={m.emotion2 || ""} onChange={(e) => set({ emotion2: (e.target.value || undefined) as EmotionKey | undefined })} className={inputCls}>
              <option value="" className="text-black">— Ninguna —</option>
              {(Object.keys(EMOTIONS) as EmotionKey[]).map((k) => <option key={k} value={k} className="text-black">{EMOTIONS[k].emoji} {EMOTIONS[k].name}</option>)}
            </select></div>
        </div>
        <div><label className={labelCls}>Cuándo (año, edad, época)</label><input value={m.when} onChange={(e) => set({ when: e.target.value })} className={inputCls} placeholder="Verano 2012" /></div>
        <div><label className={labelCls}>Pista antes del reto (sin desvelar el recuerdo)</label><textarea value={m.hint} onChange={(e) => set({ hint: e.target.value })} rows={2} className={inputCls} /></div>
        <div><label className={labelCls}>Mensaje personal (se muestra al desbloquear)</label><textarea value={m.message} onChange={(e) => set({ message: e.target.value })} rows={5} className={inputCls} placeholder="Escribe aquí tu texto para este recuerdo…" /></div>
        <div><label className={labelCls}>Pie de foto (opcional)</label><input value={m.photoCaption || ""} onChange={(e) => set({ photoCaption: e.target.value })} className={inputCls} placeholder="Playa de…, agosto 2012" /></div>
      </div>
      <div className="space-y-3">
        <PhotoField value={m.photo} onChange={(v) => set({ photo: v })} />
        <div>
          <label className={labelCls}>Minijuego</label>
          <select value={m.gameKey} onChange={(e) => set({ gameKey: e.target.value })} className={inputCls}>
            {GAME_KEYS.map((k) => <option key={k} value={k} className="text-black">{GAME_DEFS[k].name} · {GAME_DEFS[k].short}</option>)}
          </select>
          <p className="mt-1 text-[11px] font-semibold text-white/40">{def?.time} · {def?.level}</p>
        </div>
        <div><label className={labelCls}>Por qué este juego conecta con el recuerdo</label><input value={m.gameWhy} onChange={(e) => set({ gameWhy: e.target.value })} className={inputCls} /></div>
        {def?.fields && def.fields.length > 0 && (
          <div className="rounded-xl border border-amber-300/30 bg-amber-300/10 p-3">
            <p className="mb-2 text-xs font-black text-amber-200">⚙️ Personaliza el reto</p>
            <div className="space-y-2">
              {def.fields.map((f) => (
                <div key={f.key}>
                  <label className={labelCls}>{f.label}</label>
                  {f.type === "textarea" ? (
                    <textarea rows={4} value={m.config?.[f.key] ?? ""} onChange={(e) => setCfg(f.key, e.target.value)} placeholder={f.placeholder} className={inputCls} />
                  ) : (
                    <input type={f.type === "number" ? "number" : "text"} value={m.config?.[f.key] ?? ""} onChange={(e) => setCfg(f.key, e.target.value)} placeholder={f.placeholder} className={inputCls} />
                  )}
                  {f.help && <p className="mt-0.5 text-[11px] font-semibold text-white/40">{f.help}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-[11px] font-black uppercase tracking-wider text-white/50">URL para la etiqueta NFC</p>
          <code className="mt-1 block break-all text-xs font-bold text-emerald-300">{`${window.location.origin}${window.location.pathname}?bola=${m.id}`}</code>
        </div>
      </div>
    </div>
  );
}

export function Editor({ memories, final, onChange, onChangeFinal, onClose, onPrint }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  const [showFinal, setShowFinal] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const filled = memories.filter((m) => m.photo || !m.message.startsWith("Escribe") && !m.message.includes("…")).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0b0a1f] text-white">
      <div className="sticky top-0 z-10 border-b border-white/10 bg-[#0b0a1f]/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div>
            <h2 className="text-lg font-black">Panel de edición · 30 fichas</h2>
            <p className="text-xs font-semibold text-white/50">Rellena foto + texto de cada esfera. Se guarda automáticamente en este navegador.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={onPrint} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-black hover:bg-white/20"><Printer className="h-4 w-4" /> Imprimir fichas</button>
            <button onClick={() => exportAll(memories, final)} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-black hover:bg-white/20"><Download className="h-4 w-4" /> Exportar JSON</button>
            <button onClick={() => importRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-black hover:bg-white/20"><Upload className="h-4 w-4" /> Importar</button>
            <input ref={importRef} type="file" accept="application/json" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; try { const d = await importAll(f); onChange(d.memories); onChangeFinal(d.final); alert("Importado correctamente."); } catch { alert("Archivo no válido."); } }} />
            <button onClick={onClose} className="inline-flex items-center gap-1.5 rounded-lg bg-amber-300 px-3 py-2 text-xs font-black text-stone-900 hover:bg-amber-200"><Save className="h-4 w-4" /> Guardar y volver</button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-5">
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-semibold text-white/70">
          <p className="font-black text-white">Cómo usarlo</p>
          <ol className="mt-1 list-decimal space-y-0.5 pl-5">
            <li>Abre cada ficha, sube la <b className="text-amber-200">foto</b> y escribe el <b className="text-amber-200">mensaje personal</b>.</li>
            <li>Si el juego es personalizable, cambia el año, el apodo, la fecha del candado, las preguntas…</li>
            <li>Graba en cada etiqueta NFC la URL indicada en la ficha (<code className="text-emerald-300">?bola=N</code>).</li>
            <li>Exporta el JSON como copia de seguridad (y para publicar los datos en la web definitiva).</li>
          </ol>
          <p className="mt-2 text-xs text-white/40">Fichas con contenido: {filled}/30</p>
        </div>

        {/* FINAL */}
        <div className="mb-4 overflow-hidden rounded-2xl border border-amber-300/30 bg-gradient-to-br from-amber-300/10 to-fuchsia-500/10">
          <button onClick={() => setShowFinal(!showFinal)} className="flex w-full items-center justify-between px-4 py-3 text-left">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌟</span>
              <div><p className="font-black">Recuerdo final (al completar las 30)</p><p className="text-xs font-semibold text-white/50">{final.title}</p></div>
            </div>
            {showFinal ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          {showFinal && (
            <div className="grid gap-3 border-t border-white/10 p-4 md:grid-cols-2">
              <div className="space-y-3">
                <div><label className={labelCls}>Título</label><input value={final.title} onChange={(e) => onChangeFinal({ ...final, title: e.target.value })} className={inputCls} /></div>
                <div><label className={labelCls}>Mensaje final</label><textarea rows={7} value={final.message} onChange={(e) => onChangeFinal({ ...final, message: e.target.value })} className={inputCls} /></div>
              </div>
              <PhotoField value={final.photo} onChange={(v) => onChangeFinal({ ...final, photo: v })} />
            </div>
          )}
        </div>

        <div className="space-y-2">
          {memories.map((m) => {
            const isOpen = open === m.id;
            const ready = !!m.photo && !m.message.includes("…");
            return (
              <div key={m.id} className={`overflow-hidden rounded-2xl border ${isOpen ? "border-amber-300/40 bg-white/[0.06]" : "border-white/10 bg-white/[0.03]"}`}>
                <button onClick={() => setOpen(isOpen ? null : m.id)} className="flex w-full items-center gap-3 px-3 py-2.5 text-left">
                  <Sphere emotion={m.emotion} emotion2={m.emotion2} size={44} photo={m.photo} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-black"><span className="text-white/40">#{String(m.id).padStart(2, "0")}</span> {m.title}</p>
                    <p className="truncate text-xs font-semibold text-white/50">{EMOTIONS[m.emotion].name}{m.emotion2 ? ` + ${EMOTIONS[m.emotion2].name}` : ""} · {GAME_DEFS[m.gameKey]?.name} · {m.when}</p>
                  </div>
                  <span className={`hidden rounded-full px-2 py-0.5 text-[10px] font-black sm:inline ${ready ? "bg-emerald-400/20 text-emerald-300" : "bg-white/10 text-white/50"}`}>{ready ? "Lista" : m.photo ? "Falta texto" : "Falta foto"}</span>
                  {isOpen ? <ChevronUp className="h-5 w-5 text-white/50" /> : <ChevronDown className="h-5 w-5 text-white/50" />}
                </button>
                {isOpen && (
                  <div className="border-t border-white/10 p-4">
                    <MemoryForm m={m} onChange={(nm) => onChange(memories.map((x) => (x.id === nm.id ? nm : x)))} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <button onClick={onClose} className="fixed bottom-4 right-4 rounded-full bg-white p-3 text-stone-900 shadow-xl md:hidden"><X className="h-5 w-5" /></button>
    </div>
  );
}
