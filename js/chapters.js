/* ═══════════════════════════════════════════════════════════
   CHAPTERS.JS — Lógica de renderizado por capítulo
   ═══════════════════════════════════════════════════════════ */

window.Chapters = (() => {

  // Referencia a cleanups de animaciones
  let _cleanups = [];
  
  // Índice para llevar el control en el MODO LIBRE
  let currentFreeIndex = 0; 

  function _cleanup() {
    _cleanups.forEach(fn => { try { fn(); } catch(e) {} });
    _cleanups = [];
  }

  // ─── NUEVO: Detener audios al cambiar de capítulo en Modo Libre ───
  function stopAllAudioSafely() {
    if (window.AudioManager) AudioManager.stopAll();
    document.querySelectorAll('audio').forEach(a => {
      a.pause();
      a.currentTime = 0;
    });
  }

  // ─── NUEVO: Avanzar al siguiente capítulo (Modo Libre) ───
  function advanceToNextChapter() {
    if (currentFreeIndex >= BirthdayConfig.chapters.length - 1) return;
    
    currentFreeIndex++;
    const nextCh = BirthdayConfig.chapters[currentFreeIndex];

    // Ocultar botón temporalmente mientras pasa la cinemática
    const btn = document.getElementById('btn-next-chapter');
    if (btn) btn.classList.add('hidden');

    // Cargar el siguiente capítulo
    if (nextCh.id === 1) showChapter1(nextCh);
    else if (nextCh.id === 2) showChapter2(nextCh);
    else if (nextCh.id === 3) showChapter3(nextCh);
    else if (nextCh.id === 4) showChapter4(nextCh);
    else if (nextCh.id === 5) showChapter5(nextCh);
  }

  // ─── NUEVO: Inicializar botón si el Modo Libre está activo ───
  document.addEventListener('DOMContentLoaded', () => {
    if (window.BirthdayConfig && BirthdayConfig.freeMode) {
      document.body.classList.add('free-mode');
      const btn = document.getElementById('btn-next-chapter');
      if (btn) {
        btn.addEventListener('click', advanceToNextChapter);
      }
    }
  });

// ─── Mostrar overlay cinemático y luego revelar capítulo ───
  function showWithCinematicIntro(chapterId, config, afterCallback) {
    const overlay = document.getElementById('chapter-overlay');
    const labelEl = document.getElementById('overlay-chapter-label');
    const titleEl = document.getElementById('overlay-chapter-title');

    if (!overlay) {
      if (afterCallback) afterCallback();
      return;
    }

    // 1. Textos
    labelEl.textContent = config.label;
    titleEl.textContent = config.title;

    // 2. Colores
    titleEl.style.color = config.textColor || '#ffffff';
    labelEl.style.color = config.textColor || '#ffffff';
    overlay.style.backgroundColor = config.bgColor || '#000000';

    // 3. Resetear Estado Inicial con transición de color
    overlay.classList.remove('hidden'); 
    overlay.style.transition = 'opacity 1.5s ease-in-out';
    overlay.style.opacity = '0';

    labelEl.style.transition = 'all 1.2s ease';
    labelEl.style.opacity = '0';
    labelEl.style.transform = 'translateY(-10px)';
    labelEl.style.animation = 'none'; // Anular CSS

    titleEl.style.transition = 'all 1.2s ease';
    titleEl.style.opacity = '0';
    titleEl.style.transform = 'translateY(10px)';
    titleEl.style.animation = 'none'; // Anular CSS

    // Forzar redibujado para que inicie la transición de opacidad
    void overlay.offsetWidth;
    overlay.style.opacity = '1';

    // FADE OUT DEL AUDIO MIENTRAS SE OSCURECE LA PANTALLA
    if (window.AudioManager && window.AudioManager.fadeOutAll) {
      AudioManager.fadeOutAll(1500);
    }

    // 4. Secuencia de Animación (Inicia cuando el color ya tapó la pantalla tras 1.5s)
    setTimeout(() => {
      
      // Apagamos los componentes del capítulo viejo tras bambalinas
      _cleanup();
      stopAllAudioSafely(); // Por si quedó algún residuo
      hideAll();

      // A) Aparece "Capítulo X" (Con 2 SEGUNDOS EXTRA de espera en color sólido)
      setTimeout(() => {
        labelEl.style.opacity = '0.7';
        labelEl.style.transform = 'translateY(0)';
      }, 2000);

      // B) Después de 2 segundos exactos, aparece el Subtítulo
      setTimeout(() => {
        titleEl.style.opacity = '1';
        titleEl.style.transform = 'translateY(0)';
      }, 4000); 

      // C) Mantener ambos visibles y luego desvanecerlos
      setTimeout(() => {
        labelEl.style.opacity = '0';
        titleEl.style.opacity = '0';
      }, 7500); 

      // D) Ocultar el overlay y arrancar el contenido
      setTimeout(() => {
        overlay.style.opacity = '0'; // Se desvanece la cortina de color
        
        if (afterCallback) afterCallback(); // Arranca el nuevo audio y visuales

        setTimeout(() => {
          overlay.classList.add('hidden');
        }, 1500);

        // Mostrar botón Siguiente discretamente 1 segundo DESPUÉS de que inicie la voz (a los 4s del inicio del cap)
        if (window.BirthdayConfig && BirthdayConfig.freeMode && currentFreeIndex < BirthdayConfig.chapters.length - 1) {
          setTimeout(() => {
            const btn = document.getElementById('btn-next-chapter');
            if (btn) btn.classList.remove('hidden');
          }, 4000); 
        }
      }, 8700); 

    }, 1500); // 1500ms es lo que tarda la transición de color inicial
  }

  // ─── Ocultar todas las pantallas ───
  function hideAll() {
    document.querySelectorAll('.chapter-screen').forEach(el => {
      el.classList.remove('active');
    });
    // Dar tiempo al fade antes de ocultar
    setTimeout(() => {
      document.querySelectorAll('.chapter-screen').forEach(el => {
        if (!el.classList.contains('active')) {
          el.classList.add('hidden');
        }
      });
    }, 1000);
  }

  // ─── Mostrar pantalla ───
  function showScreen(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('hidden');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.add('active');
      });
    });
  }

  /* ══════════════════════════════════════════
     PANTALLA BLOQUEADA
  ══════════════════════════════════════════ */
  function showLocked(chapter) {
    _cleanup();
    AudioManager.stopAll();

    hideAll();
    setTimeout(() => {
      const screen = document.getElementById('locked-screen');
      screen.classList.remove('hidden');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => screen.classList.add('active'));
      });

      // Nombre del capítulo bloqueado
      const nameEl = document.querySelector('.locked-chapter-name');
      if (nameEl) nameEl.textContent = chapter.title;

      // Hora de desbloqueo
      const timeEl = document.getElementById('locked-time-display');
      if (timeEl) {
        const h = String(chapter.unlockHour).padStart(2, '0');
        const m = String(chapter.unlockMinute).padStart(2, '0');
        timeEl.textContent = `${h}:${m}`;
      }

      // Reloj en tiempo real
      const clockEl = document.getElementById('current-time-display');
      function tickClock() {
        if (clockEl) {
          const bTime = BirthdayConfig.getBoliviaTime();
          const h = String(bTime.getHours()).padStart(2, '0');
          const m = String(bTime.getMinutes()).padStart(2, '0');
          const s = String(bTime.getSeconds()).padStart(2, '0');
          clockEl.textContent = `${h}:${m}:${s}`; 
        }
      }
      tickClock();
      const clockInterval = setInterval(tickClock, 1000);
      _cleanups.push(() => clearInterval(clockInterval));

    }, 400);
  }

  /* ══════════════════════════════════════════
     CAPÍTULO 1 — 24 años, 24 horas
  ══════════════════════════════════════════ */
  function showChapter1(config) {
    _cleanup();
    hideAll();

    const screen = document.getElementById('chapter-1');

    showWithCinematicIntro('chapter-1', config, () => {
      screen.classList.remove('hidden');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => screen.classList.add('active'));
      });

      // Iniciar confeti
      const stopConfetti = Animations.startConfetti();
      if (stopConfetti) _cleanups.push(stopConfetti);

      // Audio
      if (window.AudioManager) AudioManager.play('audio-ch1', { loop: true });
    });
  }

  /* ══════════════════════════════════════════
     CAPÍTULO 2 — Fortaleza para el día
  ══════════════════════════════════════════ */
  function showChapter2(config) {
    _cleanup();
    hideAll();

    const screen = document.getElementById('chapter-2');

    showWithCinematicIntro('chapter-2', config, () => {
      screen.classList.remove('hidden');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => screen.classList.add('active'));
      });

      setTimeout(() => {
        Animations.startFlowers();
      }, 300);

      if (window.AudioManager) {
        AudioManager.play('audio-ch2', { loop: true });
        // La voz suena 3 segundos después de que empieza el capítulo
        setTimeout(() => {
          AudioManager.playVoice('voice-ch2');
        }, 3000); 
      }
    });
  }

  /* ══════════════════════════════════════════
     CAPÍTULO 3 — Tu propio mérito
  ══════════════════════════════════════════ */
  function showChapter3(config) {
    _cleanup();
    hideAll();

    const screen = document.getElementById('chapter-3');

    showWithCinematicIntro('chapter-3', config, () => {
      screen.classList.remove('hidden');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => screen.classList.add('active'));
      });

      setTimeout(() => {
        Animations.startColaElements();
      }, 300);

      if (window.AudioManager) {
        AudioManager.play('audio-ch3', { loop: true });
        // La voz suena 3 segundos después de que empieza el capítulo
        setTimeout(() => {
          AudioManager.playVoice('voice-ch3');
        }, 3000);
      }
    });
  }

  /* ══════════════════════════════════════════
     CAPÍTULO 4 — Un último esfuerzo
  ══════════════════════════════════════════ */
  function showChapter4(config) {
    _cleanup();
    hideAll();

    const screen = document.getElementById('chapter-4');

    showWithCinematicIntro('chapter-4', config, () => {
      screen.classList.remove('hidden');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => screen.classList.add('active'));
      });

      const stopOcean = Animations.startOcean();
      if (stopOcean) _cleanups.push(stopOcean);

      if (window.AudioManager) {
        AudioManager.play('audio-ch4', { loop: true });
        // La voz suena 3 segundos después de que empieza el capítulo
        setTimeout(() => {
          AudioManager.playVoice('voice-ch4');
        }, 3000);
      }
    });
  }

/* ══════════════════════════════════════════
     CAPÍTULO 5 — Dulce reencuentro
  ══════════════════════════════════════════ */
  function showChapter5(config) {
    _cleanup();
    hideAll();

    const screen = document.getElementById('chapter-5');

    showWithCinematicIntro('chapter-5', config, () => {
      screen.classList.remove('hidden');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => screen.classList.add('active'));
      });

      // Iniciar estrellas
      const starsApi = Animations.startStars();
      if (starsApi) _cleanups.push(() => starsApi.destroy());

      // ─── Referencias del DOM ───
      const timerState    = document.getElementById('ch5-timer-state');
      const arrivedState  = document.getElementById('ch5-arrived-state');
      const houseState    = document.getElementById('ch5-house-state');
      const epilogueState = document.getElementById('ch5-epilogue-state');
      const countdownDisplay = document.getElementById('countdown-display');

      // ACTUALIZADO: Contador basado en hora de Bolivia y target time
      const targetParts = BirthdayConfig.deliveryTargetTime.split(':');
      const targetHour = parseInt(targetParts[0], 10);
      const targetMinute = parseInt(targetParts[1], 10);

      function getRemainingSeconds() {
        const now = BirthdayConfig.getBoliviaTime();
        const targetDate = BirthdayConfig.getBoliviaTime();
        targetDate.setHours(targetHour, targetMinute, 0, 0);

        let diff = Math.floor((targetDate.getTime() - now.getTime()) / 1000);
        return diff > 0 ? diff : 0;
      }

      // ─── LÓGICA DE LA ESCENA FINAL (Estado C y D) ───
      function showHouseAndEpilogue() {
        // Transición de audio y pantallas
        if (window.AudioManager) AudioManager.crossfade('audio-ch5-ambient', 'audio-ch5-music');
        timerState.classList.add('hidden');
        arrivedState.classList.add('hidden');
        houseState.classList.remove('hidden');

        // Timer para mostrar estrella especial (epílogo)
        const epilogueTimer = setTimeout(() => {
          if (starsApi) {
            starsApi.activateSpecialStar(() => {
              epilogueState.classList.remove('hidden');

              const floatingNote = document.getElementById('floating-note');
              if (floatingNote) {
                floatingNote.addEventListener('click', () => {
                  
                  // 1. Iniciar captura con html2canvas
                  if(typeof html2canvas !== 'undefined') {
                    html2canvas(floatingNote, {
                      backgroundColor: null, // Fondo transparente
                      scale: 3, // Alta calidad
                      
                      // ESTA ES LA CLAVE: Modificar el clon antes de capturarlo
                      onclone: (clonedDoc) => {
                        // Encontrar la nota dentro del documento clonado
                        const clonedNote = clonedDoc.getElementById('floating-note');
                        if (clonedNote) {
                          // Forzar estilos para la captura perfecta:
                          clonedNote.style.cssText += `
                            transform: none !important;
                            animation: none !important;
                            box-shadow: none !important;
                            opacity: 1 !important;
                            filter: none !important;
                            margin: 0 !important;
                            border-radius: 12px;
                          `;
                        }
                      }
                    }).then(canvas => {
                      // 2. Crear el enlace de descarga
                      const link = document.createElement('a');
                      link.download = 'coupon.png'; 
                      link.href = canvas.toDataURL('image/png');
                      link.click();

                      // 3. Ocultar la nota original
                      floatingNote.style.animation = 'globalFadeOut 0.8s ease forwards';
                      setTimeout(() => {
                        epilogueState.classList.add('hidden');
                      }, 800);
                    });
                  }
                }); 
              } 
            });
          }
        }, BirthdayConfig.epilogueStarDelay);

        _cleanups.push(() => clearTimeout(epilogueTimer));
      }

      // ─── EVALUACIÓN INICIAL DEL TIEMPO ───
      const isFreeMode = window.BirthdayConfig && BirthdayConfig.freeMode;
      let freeModeCounter = 10; // 10 segundos simulados para el Modo Libre

      // SIEMPRE ponemos el audio ambiente y mostramos el timer de inicio
      if (window.AudioManager) AudioManager.play('audio-ch5-ambient', { loop: true });
      timerState.classList.remove('hidden');
      arrivedState.classList.add('hidden');
      houseState.classList.add('hidden');

      function tickCountdown() {
        if (!countdownDisplay) return;
        
        let remaining;
        
        if (isFreeMode) {
          remaining = freeModeCounter;
          freeModeCounter--; // Restamos 1 segundo localmente
        } else {
          remaining = getRemainingSeconds();
        }
        
        countdownDisplay.textContent = BirthdayConfig.formatCountdown(Math.max(0, remaining));
        
        if (remaining <= 0) {
          clearInterval(countdownInterval);
          // Mantenemos el 00:00 un instante para que vea que llegó a cero y no sea brusco
          setTimeout(() => {
            timerState.classList.add('hidden');
            arrivedState.classList.remove('hidden');
          }, 2000);
        }
      }

      tickCountdown();
      const countdownInterval = setInterval(tickCountdown, 1000);
      _cleanups.push(() => clearInterval(countdownInterval));

      // Evento del botón "Ya volví"
      const arrivedBtn = document.getElementById('arrived-btn');
      if (arrivedBtn) {
        arrivedBtn.addEventListener('click', () => {
          showHouseAndEpilogue();
        }, { once: true });
      }
      
    });
  }

  // ─── API pública ───
  return {
    showLocked,
    showChapter1,
    showChapter2,
    showChapter3,
    showChapter4,
    showChapter5,
  };

})();