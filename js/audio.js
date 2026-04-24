/* ═══════════════════════════════════════════════════════════
   AUDIO.JS — Gestor de audio global
   ═══════════════════════════════════════════════════════════ */

window.AudioManager = (() => {

  // ▼▼▼ VARIABLES PARA AJUSTAR DURANTE TUS PRUEBAS ▼▼▼
  const CONFIG_VOZ = {
    volumenVoz: 0.9,       
    reduccionMusica: 0.6  
  };
  // ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲

  let _current = null;
  let _unlocked = false;

  const ALL_IDS = [
    'audio-ch1', 'audio-ch2', 'audio-ch3',
    'audio-ch4', 'audio-ch5-ambient', 'audio-ch5-music',
    'voice-ch2', 'voice-ch3', 'voice-ch4'
  ];

  function _getEl(id) {
    return document.getElementById(id);
  }

  function unlock() {
    _unlocked = true;
    ALL_IDS.forEach(id => {
      const el = _getEl(id);
      if (el) {
        el.pause();
        el.currentTime = 0;
        el.volume = 0;
      }
    });
  }

  function stopAll(fadeMs = 800) {
    ALL_IDS.forEach(id => {
      const el = _getEl(id);
      if (el && !el.paused) {
        _fadeOut(el, fadeMs);
      }
    });
    _current = null;
  }

  // ─── NUEVO: Bajar el volumen suavemente a TODOS los audios (Para transiciones) ───
  function fadeOutAll(durationMs = 1500) {
    ALL_IDS.forEach(id => {
      const el = _getEl(id);
      if (el && !el.paused) {
        _fadeOut(el, durationMs);
      }
    });
  }

  function play(id, { loop = true, fadeMs = 1000 } = {}) {
    if (!_unlocked) return;
    const el = _getEl(id);
    if (!el) return;

    ALL_IDS.forEach(otherId => {
       const otherEl = _getEl(otherId);
       if (otherEl && otherId !== id) {
         otherEl.pause();
         otherEl.currentTime = 0;
       }
    });

    if (_current && _current !== el) {
      _fadeOut(_current, 400); 
    }

    el.loop = loop;
    el.volume = 0;
    el.currentTime = 0;

    const targetVol = BirthdayConfig.masterVolume || 0.4;
    
    const playPromise = el.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        _fadeIn(el, targetVol, fadeMs);
      }).catch(err => {
        console.warn('[Audio] Error en iPhone:', err);
      });
    }

    _current = el;
  }
  
  function crossfade(fromId, toId, { fadeMs = 1200 } = {}) {
    if (!_unlocked) return;
    const from = _getEl(fromId);
    const to   = _getEl(toId);
    const targetVol = BirthdayConfig.masterVolume || 0.4;

    if (from && !from.paused) _fadeOut(from, fadeMs);

    if (to) {
      if (to._fadeTimer) clearInterval(to._fadeTimer);
      to.loop = true;
      to.volume = 0;
      to.currentTime = 0;
      to.play().then(() => _fadeIn(to, targetVol, fadeMs)).catch(() => {});
      _current = to;
    }
  }

  function playVoice(id) {
    if (!_unlocked) return;
    const voiceEl = _getEl(id);
    if (!voiceEl) return;

    voiceEl.volume = CONFIG_VOZ.volumenVoz;
    voiceEl.currentTime = 0;
    
    const normalVol = BirthdayConfig.masterVolume || 0.4;
    if (_current && !_current.paused) {
      _current.volume = normalVol * CONFIG_VOZ.reduccionMusica; 
    }

    voiceEl.play().catch(() => {});

    voiceEl.onended = () => {
      if (_current && !_current.paused) {
        _fadeIn(_current, normalVol, 1500); 
      }
    };
  }

  function _fadeIn(el, targetVolume = 1, durationMs = 1000) {
    if (el._fadeTimer) clearInterval(el._fadeTimer);
    const steps = 30;
    const interval = durationMs / steps;
    const increment = targetVolume / steps;
    let v = 0;
    el._fadeTimer = setInterval(() => {
      v = Math.min(v + increment, targetVolume);
      el.volume = v;
      if (v >= targetVolume) clearInterval(el._fadeTimer);
    }, interval);
  }

  function _fadeOut(el, durationMs = 800) {
    if (!el || el.paused) return;
    if (el._fadeTimer) clearInterval(el._fadeTimer);
    const startVolume = el.volume > 0 ? el.volume : 0.01;
    const steps = 20;
    const interval = durationMs / steps;
    const decrement = startVolume / steps;
    let v = startVolume;
    el._fadeTimer = setInterval(() => {
      v = Math.max(v - decrement, 0);
      el.volume = v;
      if (v <= 0) {
        clearInterval(el._fadeTimer);
        el.pause();
        el.currentTime = 0;
      }
    }, interval);
  }

  return { unlock, play, stopAll, fadeOutAll, crossfade, playVoice };
})();