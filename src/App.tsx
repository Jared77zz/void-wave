// App.tsx - componente raíz de Void Wave
// Aquí vive el layout principal de toda la app
import "./styles/index.css";

function App() {
  return (
    // Contenedor principal que ocupa toda la pantalla
    <div className="void-root">

      {/* Capa de fondo: aquí irá el video/edit */}
      <div className="void-bg" />

      {/* Zona central donde van los visualizadores y letras */}
      <main className="void-main">

        {/* Header con el nombre del proyecto */}
        <header className="void-header">
          <span className="void-logo">VOID</span>
          <span className="void-logo-accent">WAVE</span>
        </header>

        {/* Placeholder del visualizador de audio */}
        <section className="void-visualizer-zone">
          {/* Aquí irá <AudioVisualizer /> */}
          <p className="void-placeholder">[ VISUALIZER ]</p>
        </section>

        {/* Placeholder de las letras sincronizadas */}
        <section className="void-lyrics-zone">
          {/* Aquí irá <LyricsDisplay /> */}
          <p className="void-placeholder">[ LYRICS ]</p>
        </section>

      </main>

      {/* Barra inferior: controles de audio y subida de archivos */}
      <footer className="void-controls">
        {/* Aquí irán <AudioPlayer /> y <FileUploader /> */}
        <p className="void-placeholder">[ CONTROLS ]</p>
      </footer>

    </div>
  )
}

export default App