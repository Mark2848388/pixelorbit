/* Pixel Orbit Music — procedural ambient + battle themes via Web Audio */
(() => {
  'use strict';
  const PO = window.PO || (window.PO = {});
  let ac = null, master = null, nodes = [], playing = false, theme = 'home', gainVal = 0.18;
  function ctx() {
    if (!ac) {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      master = ac.createGain();
      master.gain.value = gainVal;
      master.connect(ac.destination);
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  function stopAll() {
    nodes.forEach(n => { try { n.stop(); } catch(e){} });
    nodes = [];
  }
  function osc(type, freq, g, start, dur, dest) {
    const o = ac.createOscillator(), gg = ac.createGain();
    o.type = type; o.frequency.value = freq;
    gg.gain.setValueAtTime(0, start);
    gg.gain.linearRampToValueAtTime(g, start + 0.05);
    gg.gain.exponentialRampToValueAtTime(0.001, start + dur);
    o.connect(gg); gg.connect(dest || master);
    o.start(start); o.stop(start + dur + 0.05);
    nodes.push(o);
    return o;
  }
  function pad(freqs, type='sine') {
    const now = ac.currentTime;
    freqs.forEach((f, i) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.value = f;
      g.gain.value = 0.04 / freqs.length;
      o.connect(g); g.connect(master);
      o.start(now);
      nodes.push(o);
    });
  }
  function arpeggio(notes, rate = 0.35) {
    const now = ac.currentTime;
    notes.forEach((f, i) => {
      osc('triangle', f, 0.06, now + i * rate, rate * 0.9);
    });
  }
  function startHome() {
    stopAll();
    pad([110, 164.81, 220, 329.63], 'sine'); // ambient space pad
    // soft pulse every 4s
    const pulse = () => {
      if (!playing || theme !== 'home') return;
      arpeggio([220, 277, 330, 440, 330, 277], 0.28);
      setTimeout(pulse, 4200);
    };
    setTimeout(pulse, 800);
  }
  function startBattle() {
    stopAll();
    pad([82.41, 123.47, 164.81], 'sawtooth');
    const loop = () => {
      if (!playing || theme !== 'battle') return;
      arpeggio([165, 196, 247, 294, 247, 196, 165, 130], 0.18);
      setTimeout(loop, 1600);
    };
    setTimeout(loop, 200);
  }
  function setTheme(t) {
    if (theme === t && playing) return;
    theme = t;
    if (!playing) return;
    if (t === 'battle') startBattle(); else startHome();
  }
  function play() {
    if (playing) return;
    const s = PO.S && PO.S();
    if (s && s.music === 0) return;
    ctx();
    playing = true;
    if (theme === 'battle') startBattle(); else startHome();
  }
  function stop() {
    playing = false;
    stopAll();
  }
  function toggle() {
    const s = PO.S && PO.S();
    if (!s) return;
    s.music = s.music ? 0 : 1;
    if (s.music) play(); else stop();
    PO.save && PO.save();
    return s.music;
  }
  function setVolume(v) {
    gainVal = Math.max(0, Math.min(0.4, v));
    if (master) master.gain.value = gainVal;
  }
  // auto start after user gesture
  let started = false;
  function userStart() {
    if (started) return;
    started = true;
    play();
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach(ev => {
    document.addEventListener(ev, userStart, { once: true, passive: true });
  });
  // expose
  PO.Music = { play, stop, toggle, setTheme, setVolume, isPlaying: () => playing };
  // react to page changes
  const obs = new MutationObserver(() => {
    const battle = document.getElementById('pg-battle');
    if (battle && battle.classList.contains('show')) setTheme('battle');
    else setTheme('home');
  });
  document.addEventListener('DOMContentLoaded', () => {
    const pages = document.getElementById('pages');
    if (pages) obs.observe(pages, { attributes: true, subtree: true, attributeFilter: ['class'] });
  });
})();
