/* ═══════════════════════════════════════════════════════════
   CHAPTERS.JS — Lógica de renderizado por capítulo
   ═══════════════════════════════════════════════════════════ */

window.Chapters = (() => {

  // Referencia a cleanups de animaciones
  let _cleanups = [];

  function _cleanup() {
    _cleanups.forEach(fn => { try { fn(); } catch(e) {} });
    _cleanups = [];
  }

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

    // 3. Resetear Estado Inicial
    overlay.className = ''; 
    overlay.style.opacity = '1';

    labelEl.style.transition = 'all 1.2s ease';
    labelEl.style.opacity = '0';
    labelEl.style.transform = 'translateY(-10px)';
    labelEl.style.animation = 'none'; // Anular CSS

    titleEl.style.transition = 'all 1.2s ease';
    titleEl.style.opacity = '0';
    titleEl.style.transform = 'translateY(10px)';
    titleEl.style.animation = 'none'; // Anular CSS

    // 4. Secuencia de Animación
    // A) Aparece "Capítulo X"
    setTimeout(() => {
      labelEl.style.opacity = '0.7';
      labelEl.style.transform = 'translateY(0)';
    }, 100);

    // B) Después de 2 segundos exactos, aparece el Subtítulo
    setTimeout(() => {
      titleEl.style.opacity = '1';
      titleEl.style.transform = 'translateY(0)';
    }, 2100); 

    // C) Mantener ambos visibles y luego desvanecerlos
    setTimeout(() => {
      labelEl.style.opacity = '0';
      titleEl.style.opacity = '0';
    }, 5500); 

    // D) Ocultar el overlay y arrancar el contenido
    setTimeout(() => {
      overlay.classList.add('hidden');
      if (afterCallback) afterCallback();
    }, 6700); 
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

      // Reloj en tiempo real (Con Segundos para que valides en Paraguay que es hora Boliviana)
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
      AudioManager.play('audio-ch1', { loop: true });
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

      AudioManager.play('audio-ch2', { loop: true });
      
      // La voz suena 3 segundos después de que empieza el capítulo
      setTimeout(() => {
        AudioManager.playVoice('voice-ch2');
      }, 3000); 
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

      AudioManager.play('audio-ch3', { loop: true });
      
      // La voz suena 3 segundos después de que empieza el capítulo
      setTimeout(() => {
        AudioManager.playVoice('voice-ch3');
      }, 3000);
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

      AudioManager.play('audio-ch4', { loop: true });
      
      // La voz suena 3 segundos después de que empieza el capítulo
      setTimeout(() => {
        AudioManager.playVoice('voice-ch4');
      }, 3000);
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

      // Audio ambiental
      AudioManager.play('audio-ch5-ambient', { loop: true });

      // ─── Estado A: Contador ───
      const timerState   = document.getElementById('ch5-timer-state');
      const arrivedState = document.getElementById('ch5-arrived-state');
      const houseState   = document.getElementById('ch5-house-state');
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

      function tickCountdown() {
        if (!countdownDisplay) return;
        
        let remaining = getRemainingSeconds();
        countdownDisplay.textContent = BirthdayConfig.formatCountdown(remaining);
        
        if (remaining <= 0) {
          clearInterval(countdownInterval);
          // Transición a Estado B
          timerState.classList.add('hidden');
          arrivedState.classList.remove('hidden');
        }
      }

      tickCountdown();
      const countdownInterval = setInterval(tickCountdown, 1000);
      _cleanups.push(() => clearInterval(countdownInterval));

      // ─── Estado B: "Ya llegó" ───
      const arrivedBtn = document.getElementById('arrived-btn');
      if (arrivedBtn) {
        arrivedBtn.addEventListener('click', () => {
          // Detener ambientales, iniciar música
          AudioManager.crossfade('audio-ch5-ambient', 'audio-ch5-music');

          // Transición a Estado C
          arrivedState.classList.add('hidden');
          houseState.classList.remove('hidden');

          // Timer para mostrar estrella especial (epílogo)
          const epilogueTimer = setTimeout(() => {
            if (starsApi) {
              starsApi.activateSpecialStar(() => {
                // ─── Estado D: Epílogo ───
                epilogueState.classList.remove('hidden');

                const floatingNote = document.getElementById('floating-note');
                if (floatingNote) {
                  floatingNote.addEventListener('click', () => {
                    // Descargar PDF
                    const pdfLink = document.getElementById('gift-pdf-link');
                    if (pdfLink) pdfLink.click();

                    // Ocultar nota
                    floatingNote.style.animation = 'globalFadeOut 0.8s ease forwards';
                    setTimeout(() => {
                      epilogueState.classList.add('hidden');
                    }, 800);
                  });
                }
              });
            }
          }, BirthdayConfig.epilogueStarDelay);

          _cleanups.push(() => clearTimeout(epilogueTimer));
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