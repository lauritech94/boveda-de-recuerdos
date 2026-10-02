import { X, Printer } from "lucide-react";
import { EMOTIONS, Memory } from "../data/memories";
import { GAME_DEFS } from "../games/registry";
import { Sphere } from "./Sphere";

export function PrintSheets({ memories, onClose }: { memories: Memory[]; onClose: () => void }) {
  const base = `${window.location.origin}${window.location.pathname}`;
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-white text-stone-900 print:static">
      <div className="sticky top-0 flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 print:hidden">
        <div>
          <p className="font-black">Fichas imprimibles · 30 esferas</p>
          <p className="text-xs font-semibold text-stone-500">Una ficha por esfera: qué preparar, qué juego, URL NFC. Usa “Guardar como PDF”.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-2 text-xs font-black text-white"><Printer className="h-4 w-4" /> Imprimir</button>
          <button onClick={onClose} className="rounded-lg bg-stone-100 p-2"><X className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="mx-auto max-w-4xl p-4 print:max-w-none print:p-0">
        <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2">
          {memories.map((m) => {
            const emo = EMOTIONS[m.emotion];
            const def = GAME_DEFS[m.gameKey];
            return (
              <div key={m.id} className="break-inside-avoid rounded-2xl border-2 p-3" style={{ borderColor: emo.color }}>
                <div className="flex items-center gap-3">
                  <Sphere emotion={m.emotion} emotion2={m.emotion2} size={48} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: emo.text }}>Esfera #{String(m.id).padStart(2, "0")} · {emo.name}{m.emotion2 ? ` + ${EMOTIONS[m.emotion2].name}` : ""}</p>
                    <p className="truncate text-base font-black leading-tight">{m.title}</p>
                    <p className="text-[11px] font-bold text-stone-500">{m.when}</p>
                  </div>
                  {m.photo ? <img src={m.photo} alt="" className="h-12 w-12 rounded-lg object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-stone-300 text-[9px] font-bold text-stone-400">FOTO</div>}
                </div>
                <div className="mt-2 grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-[11px] font-semibold text-stone-700">
                  <span className="font-black text-stone-400">Tipo</span><span>{m.kind === "intro" ? "📜 Mensaje de inicio" : m.kind === "gift" ? `🎁 Regalo: ${m.config?.giftName || ""}` : m.kind === "video" ? "🎬 Vídeo final" : `🧩 ${def?.name} — ${def?.short} (${def?.time})`}</span>
                  <span className="font-black text-stone-400">Vínculo</span><span>{m.gameWhy}</span>
                  <span className="font-black text-stone-400">Pista</span><span className="line-clamp-3 italic">“{m.hint}”</span>
                  <span className="font-black text-stone-400">Texto</span><span className="line-clamp-3">{m.message}</span>
                  {m.kind === "game" && def?.fields && def.fields.length > 0 && (<><span className="font-black text-stone-400">Config</span><span className="line-clamp-2">{def.fields.map((f) => `${f.label.split(" (")[0]}: ${m.config?.[f.key] ?? "—"}`).join(" · ")}</span></>)}
                </div>
                <div className="mt-2 rounded-lg bg-stone-100 px-2 py-1.5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Grabar en NFC</p>
                  <p className="break-all font-mono text-[11px] font-bold">{base}?bola={m.id}</p>
                </div>
                <div className="mt-2 flex gap-3 text-[10px] font-bold text-stone-400">
                  <span>☐ Foto</span><span>☐ Texto</span><span>☐ NFC grabada</span><span>☐ Bola montada</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
