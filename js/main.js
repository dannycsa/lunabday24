/* ═══════════════════════════════════════════════════════════
   MAIN.JS — Punto de entrada, orquestación principal
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const splash = document.getElementById('splash-screen');

  // ─── Inicializar todo al cargar ───
  window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.chapter-screen').forEach(el => {
      el.classList.add('hidden');
      el.classList.remove('active');
    });
    document.getElementById('chapter-overlay').classList.add('hidden');

    // Asignar el color de fondo del capítulo actual al splash screen
    const { chapter } = BirthdayConfig.getActiveChapter();
    splash.style.backgroundColor = chapter.bgColor;
    splash.style.cursor = 'pointer'; 
  });

// ─── Click en cualquier parte de la pantalla ───
  splash.addEventListener('click', () => {
    AudioManager.unlock();

    // 1. Igualamos el color del body al color del capítulo 
    // para matar cualquier posibilidad de fondo negro residual.
    const { chapter } = BirthdayConfig.getActiveChapter();
    document.body.style.backgroundColor = chapter.bgColor;

    // 2. Arrancamos la lógica del capítulo ANTES de quitar el splash.
    // Esto prepara el 'chapter-overlay' justo debajo con el mismo color exacto.
    startExperience();

    // 3. Ocultamos el splash inmediatamente, sin animaciones de opacidad.
    // Como lo que hay debajo es literalmente del mismo color, el ojo 
    // humano no detecta el cambio de capa, solo ve el texto apareciendo.
    splash.style.display = 'none';
  });
  
  // ─── Arrancar la experiencia ───
  function startExperience() {
   const { chapter, locked } = BirthdayConfig.getActiveChapter();

    if (locked) {
      Chapters.showLocked(chapter);
      // Revisar cada minuto si desbloqueó
      startUnlockWatcher();
      return;
    }

    loadChapter(chapter);
  }

  // ─── Cargar el capítulo correcto ───
  function loadChapter(chapter) {
    switch (chapter.id) {
      case 1: Chapters.showChapter1(chapter); break;
      case 2: Chapters.showChapter2(chapter); break;
      case 3: Chapters.showChapter3(chapter); break;
      case 4: Chapters.showChapter4(chapter); break;
      case 5: Chapters.showChapter5(chapter); break;
      default:
        console.warn('[Main] Capítulo desconocido:', chapter.id);
    }
  }

  // ─── Watcher: revisa cada 30s si un capítulo se desbloqueó ───
  let _watcherInterval = null;
  function startUnlockWatcher() {
    if (_watcherInterval) clearInterval(_watcherInterval);
    _watcherInterval = setInterval(() => {
      const { chapter, locked } = BirthdayConfig.getActiveChapter();
      if (!locked) {
        clearInterval(_watcherInterval);
        loadChapter(chapter);
      }
    }, 30000);
  }

  // ─── Visibilidad de página: reanudar audio si se vuelve ───
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // Pequeña comprobación de capítulo al volver a la pestaña
      if (!BirthdayConfig.debugMode) {
        const { chapter, locked } = BirthdayConfig.getActiveChapter();
        // Solo navegar si cambió de capítulo (no redibujar el mismo)
        // Se podría mejorar con estado global, pero esto es suficiente
      }
    }
  });

  // ─── Prevenir scroll / zoom en móvil ───
  document.addEventListener('touchmove', e => {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });

  document.addEventListener('gesturestart', e => e.preventDefault());

})();
