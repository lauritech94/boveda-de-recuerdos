import { Component, StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

/**
 * 🛡️ Xarxa de seguretat: si qualsevol error de JavaScript es produeix durant el dibuix,
 * en lloc d'una pantalla en blanc surt una targeta de recuperació amb dues opcions.
 * "Netejar les dades del navegador" esborra NOMÉS les còpies locals de contingut
 * (textos/fotos del panell), no el progrés del joc ni el calendari.
 */
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  private netejarIRecarregar = () => {
    try {
      const aEsborrar: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        // Només contingut editat; es conserva el progrés (esferas_progreso_) i el calendari (teaser_)
        if (k && k.startsWith("esferas_") && !k.startsWith("esferas_progreso_")) aEsborrar.push(k);
      }
      aEsborrar.forEach((k) => localStorage.removeItem(k));
    } catch {
      /* sense localStorage no hi ha res a netejar */
    }
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div className="tarjeta" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 56 }}>🙈</div>
          <h1 className="titol">Ui! Alguna cosa ha fallat</h1>
          <p className="subtitulo">No pateixis: el teu progrés està a salvo.</p>
          <button className="boto" onClick={() => window.location.reload()}>🔄 Torna-ho a carregar</button>
          <button className="boto secundari" onClick={this.netejarIRecarregar}>🧹 Netejar les dades del navegador i recarregar</button>
          <p style={{ marginTop: 14, fontSize: 11, color: "#9a8a70", wordBreak: "break-all" }}>
            Detall tècnic: {String(this.state.error?.message || this.state.error)}
          </p>
        </div>
      </div>
    );
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
