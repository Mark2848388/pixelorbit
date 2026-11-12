(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const PO = window.PO;
  function renderQuests(period) {
    const list = $('qList'); if (!list || !PO?.ensureQuests) return;
    PO.ensureQuests();
    const S = PO.S();
    const qs = S.quests[period] || [];
    $('qStreak').textContent = (S.daily?.streak || 0);
    list.innerHTML = qs.map(q => {
      const pct = Math.min(100, Math.floor(100 * q.prog / q.t));
      const status = q.claimed ? 'claimed' : q.done ? 'done' : 'active';
      const reward = (q.r.coins ? q.r.coins + '✦ ' : '') + (q.r.parts ? q.r.parts + '◆ ' : '') + (q.r.xp ? q.r.xp + 'XP' : '');
      return `<div class="q-card ${status}" data-id="${q.id}" data-period="${period}">
        <div class="q-top"><b>${q.n}</b><span>${reward}</span></div>
        <p>${q.d.replace('{t}', q.t)}</p>
        <div class="q-bar"><i style="width:${pct}%"></i></div>
        <small>${Math.min(q.prog, q.t)} / ${q.t}</small>
        ${q.done && !q.claimed ? '<button class="q-claim">ЗАБРАТЬ</button>' : q.claimed ? '<em>ПОЛУЧЕНО</em>' : ''}
      </div>`;
    }).join('') || '<p class="empty">Нет активных заданий</p>';
    // synergies
    const b = PO.B ? PO.B() : {};
    const has = t => (S.bld || []).some(o => o.t === t);
    const syn = [];
    if (has('dome') && has('shieldGen')) syn.push('Купол + Щит-генератор → +15% щита');
    if (has('gen') && has('reactor')) syn.push('Генератор + Реактор → ×1.4 пассив');
    if (has('bay') && has('nest')) syn.push('Ангар + Гнездо → +25% урон помощников');
    if (has('array') && has('grid')) syn.push('Матрица + Сеть → мощные лучи и турели');
    if (has('lab') && has('observ')) syn.push('Лаборатория + Обсерватория → +20% опыта');
    if (has('drl') && has('miner')) syn.push('Бур + Рудник → усиленная добыча');
    if (has('aiCore') && has('quantum')) syn.push('Ядро ИИ + Квантовая кузница → криты и КД');
    $('qSynText').textContent = syn.length ? syn.join(' · ') : 'Построй комбинации зданий для мощных бонусов (см. описания новых построек).';
  }
  function openQuests() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('show'));
    const pg = $('pg-quests'); if (pg) pg.classList.add('show');
    renderQuests('daily');
  }
  document.addEventListener('click', e => {
    if (e.target.closest('#homeQuests') || e.target.closest('[data-go="quests"]')) {
      openQuests(); return;
    }
    if (e.target.id === 'questsBack') {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('show'));
      $('pg-home')?.classList.add('show');
      return;
    }
    const tab = e.target.closest('.q-tab');
    if (tab) {
      document.querySelectorAll('.q-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderQuests(tab.dataset.q);
      return;
    }
    const claim = e.target.closest('.q-claim');
    if (claim) {
      const card = claim.closest('.q-card');
      if (card && PO.claimQuest(card.dataset.period, card.dataset.id)) {
        renderQuests(card.dataset.period);
      }
    }
  });
  // music btn
  document.addEventListener('DOMContentLoaded', () => {
    const btn = $('musicBtn');
    if (btn) {
      btn.onclick = () => {
        const on = PO.Music?.toggle();
        btn.textContent = on ? '♪' : '♫';
        btn.style.opacity = on ? '1' : '0.45';
        PO.toast?.(on ? 'Музыка включена' : 'Музыка выключена');
      };
    }
  });
})();
