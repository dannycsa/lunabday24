/* ═══════════════════════════════════════════════════════════
   AUDIO.JS — Gestor de audio global
   ═══════════════════════════════════════════════════════════ */

window.AudioManager = (() => {

  // ▼▼▼ VARIABLES PARA AJUSTAR DURANTE TUS PRUEBAS ▼▼▼
  const CONFIG_VOZ = {
    volumenVoz: 0.7,       

    // Qué tanto baja la música mientras hablas. 
    // Se multiplica por el masterVolume. 
    // Ej: 0.20 = baja a un 20%, 0.50 = baja a la mitad, 0 = se silencia.
    reduccionMusica: 0.8  
  };
  // ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲

  let _current = null;
  let _unlocked = false;

  // ─── IDs de todos los elementos de audio ───
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
        el.volume = 0;
        el.play().then(() => el.pause()).catch(() => {});
        el.currentTime = 0;
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

  // ─── MÚSICA DE FONDO ───
  function play(id, { loop = true, fadeMs = 1000 } = {}) {
    if (!_unlocked) return;
    const el = _getEl(id);
    if (!el) return;

    if (_current && _current !== el) _fadeOut(_current, fadeMs);

    el.loop = loop;
    el.volume = 0;
    el.currentTime = 0;

    // Aplicar el Master Volume de config.js estrictamente
    const targetVol = BirthdayConfig.masterVolume || 0.4;
    el.play().then(() => _fadeIn(el, targetVol, fadeMs)).catch(() => {});
    _current = el;
  }

  function crossfade(fromId, toId, { fadeMs = 1200 } = {}) {
    if (!_unlocked) return;
    const from = _getEl(fromId);
    const to   = _getEl(toId);
    
    const targetVol = BirthdayConfig.masterVolume || 0.4;

    if (from && !from.paused) _fadeOut(from, fadeMs);
    if (to) {
      to.loop = true;
      to.volume = 0;
      to.currentTime = 0;
      to.play().then(() => _fadeIn(to, targetVol, fadeMs)).catch(() => {});
      _current = to;
    }
  }

  // ─── NOTAS DE VOZ (Ducking: Baja la música mientras hablas) ───
  function playVoice(id) {
    if (!_unlocked) return;
    const voiceEl = _getEl(id);
    if (!voiceEl) return;

    // Usar la variable de configuración para el volumen de la voz
    voiceEl.volume = CONFIG_VOZ.volumenVoz;
    voiceEl.currentTime = 0;
    
    // Bajar la música de fondo según el ratio configurado
    const normalVol = BirthdayConfig.masterVolume || 0.4;
    if (_current && !_current.paused) {
      _current.volume = normalVol * CONFIG_VOZ.reduccionMusica; 
    }

    voiceEl.play().catch(() => {});

    // Cuando tu nota de voz termina, la música vuelve a subir
    voiceEl.onended = () => {
      if (_current && !_current.paused) {
        _fadeIn(_current, normalVol, 1500); 
      }
    };
  }

  function _fadeIn(el, targetVolume = 1, durationMs = 1000) {
    const steps = 30;
    const interval = durationMs / steps;
    const increment = targetVolume / steps;
    let v = el.volume;
    const timer = setInterval(() => {
      v = Math.min(v + increment, targetVolume);
      el.volume = v;
      if (v >= targetVolume) clearInterval(timer);
    }, interval);
  }

  function _fadeOut(el, durationMs = 800) {
    const steps = 20;
    const interval = durationMs / steps;
    const decrement = el.volume / steps;
    let v = el.volume;
    const timer = setInterval(() => {
      v = Math.max(v - decrement, 0);
      el.volume = v;
      if (v <= 0) {
        el.pause();
        clearInterval(timer);
      }
    }, interval);
  }

  return { unlock, play, stopAll, crossfade, playVoice };
})();