/* ═══════════════════════════════════════════════════════════
   CONFIG.JS — Configuración central de capítulos y tiempo
   ═══════════════════════════════════════════════════════════ */

window.BirthdayConfig = {

  // ─────────────────────────────────────────────────────
  // MODO DEBUG: Poner true para saltar el bloqueo horario
  // ─────────────────────────────────────────────────────
  debugMode: false,
  debugForceChapter: 4,
  masterVolume: 0.4,

  // ─────────────────────────────────────────────────────
  // FECHA OFICIAL (Año-Mes-Día)
  // El sistema mantendrá todo bloqueado (mostrando el candado del Cap 1)
  // si ella entra a la página el día 22 o antes.
  // ─────────────────────────────────────────────────────
  targetDate: '2026-04-23',

  // ─────────────────────────────────────────────────────
  // HORA ESTIMADA DE LLEGADA DEL PEDIDO (Capítulo 5)
  // Formato 24h: "HH:MM". Puedes cambiar esto en vivo 
  // cuando la app te dé la hora estimada.
  // ─────────────────────────────────────────────────────
  deliveryTargetTime: '22:55',

  // ─────────────────────────────────────────────────────
  // TIEMPO ANTES DE QUE APAREZCA LA ESTRELLA ESPECIAL
  // después de hacer click en "Sal a la puerta" (en ms)
  // ─────────────────────────────────────────────────────
  epilogueStarDelay: 30000, // 1 minuto
  // ─────────────────────────────────────────────────────
  // DEFINICIÓN DE CAPÍTULOS
  // unlockHour / unlockMinute: hora local de desbloqueo
  // ─────────────────────────────────────────────────────
chapters: [
    {
      id: 1,
      label: 'Capítulo I',
      title: '24 años, 24 horas',
      unlockHour: 0,
      unlockMinute: 0,
      nextHint: '08:00',
      audioId: 'audio-ch1',
      bgColor: '#000000',
      textColor: '#ffffff', // Fondo negro, letra blanca
    },
    {
      id: 2,
      label: 'Capítulo II',
      title: 'Fortaleza para el día',
      unlockHour: 8,
      unlockMinute: 0,
      nextHint: '12:00',
      audioId: 'audio-ch2',
      bgColor: '#fce8ef',
      textColor: '#4a1525', // Fondo rosa claro, letra vino tinto/guinda
    },
    {
      id: 3,
      label: 'Capítulo III',
      title: 'Tu propio mérito',
      unlockHour: 12,
      unlockMinute: 0,
      nextHint: '18:00',
      audioId: 'audio-ch3',
      bgColor: '#f8f8f6',
      textColor: '#e31837', // Fondo blanco Embol, letra roja corporativa
    },
    {
      id: 4,
      label: 'Capítulo IV',
      title: 'Un último esfuerzo',
      unlockHour: 18,
      unlockMinute: 0,
      nextHint: '19:30',
      audioId: 'audio-ch4',
      bgColor: '#050d1f',
      textColor: '#ffffff', // Fondo azul profundo, letra blanca
    },
    {
      id: 5,
      label: 'Capítulo V',
      title: 'Dulce reencuentro',
      unlockHour: 19,
      unlockMinute: 30,
      nextHint: null,
      audioId: null,
      bgColor: '#0e0b2e',
      textColor: '#ffffff', // Fondo noche, letra blanca
    },
  ],

  // ─────────────────────────────────────────────────────
  // HELPER: devuelve el capítulo activo según hora local
  // Retorna { chapter, locked: false } o { chapter: nextChapter, locked: true }
  // ─────────────────────────────────────────────────────
getActiveChapter() {
    if (this.debugMode) {
      const ch = this.chapters.find(c => c.id === this.debugForceChapter);
      return { chapter: ch, locked: false };
    }

    const now = this.getBoliviaTime();

    // 1. Bloqueo estricto por Fecha (Asegurar que sea el 23)
    // Extraemos año, mes y día de la fecha objetivo
    const [tYear, tMonth, tDay] = this.targetDate.split('-').map(Number);
    
    // now.getMonth() devuelve 0 para Enero, así que sumamos 1
    if (now.getFullYear() < tYear || 
       (now.getFullYear() === tYear && (now.getMonth() + 1) < tMonth) ||
       (now.getFullYear() === tYear && (now.getMonth() + 1) === tMonth && now.getDate() < tDay)) {
      // Es antes del 23 de abril: Todo bloqueado, muestra el Cap 1
      return { chapter: this.chapters[0], locked: true };
    }

    // 2. Bloqueo normal por Hora
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    let active = null;

    for (const ch of this.chapters) {
      const chMinutes = ch.unlockHour * 60 + ch.unlockMinute;
      if (currentMinutes >= chMinutes) {
        active = ch;
      }
    }

    if (!active) {
      return { chapter: this.chapters[0], locked: true };
    }

    return { chapter: active, locked: false };
  },

  // ─────────────────────────────────────────────────────
  // HELPERS DE FORMATO
  // ─────────────────────────────────────────────────────
  formatTime(date) {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  },

  formatCountdown(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  },

  getBoliviaTime() {
    const str = new Date().toLocaleString("en-US", { timeZone: "America/La_Paz" });
    return new Date(str);
  }
};