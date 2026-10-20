// Экран ожидания: «проверяем данные» — лупа проезжает по введённым данным компании,
// значения «расшифровываются» слева направо, глаз следит за лупой.
(async () => {
  const rowsBox = document.getElementById('scan-rows');
  const lens = document.getElementById('scan-lens');
  const iris = document.getElementById('scan-iris');
  const rows = Array.from(rowsBox.querySelectorAll('.scan-row'));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  let info = null;
  try { info = await window.kriptodok.getPendingInfo(); } catch (_) {}
  if (!info || !info.company) { rowsBox.hidden = true; return; }

  const values = { company: info.company, inn: info.inn, ogrn: info.ogrn };
  rows.forEach((r) => { r.querySelector('.scan-value').textContent = values[r.dataset.key] || '—'; });
  if (reduce) {
    rows.forEach((r) => r.classList.add('is-done'));
    lens.style.display = 'none';
    return;
  }

  const POOL = '0123456789ABCDEFabcdef#%$@';
  async function decrypt(el, text, ms) {
    const start = performance.now();
    while (true) {
      const k = Math.min(1, (performance.now() - start) / ms);
      const done = Math.floor(k * text.length);
      let out = text.slice(0, done);
      for (let i = done; i < text.length; i++) out += text[i] === ' ' ? ' ' : POOL[(Math.random() * POOL.length) | 0];
      el.textContent = out;
      if (k >= 1) break;
      await sleep(40);
    }
    el.textContent = text;
  }
  function moveLens(i) {
    const r = rows[i];
    lens.style.transform = `translateY(${r.offsetTop + r.offsetHeight / 2 - 15}px)`;
    iris.style.transform = `translate(${4 + (i % 2) * -3}px, ${1 + i * 2}px)`;
  }

  moveLens(0);
  while (true) {
    rows.forEach((r) => r.classList.remove('is-done', 'is-active'));
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i], el = r.querySelector('.scan-value');
      r.classList.add('is-active'); moveLens(i);
      await sleep(550);
      await decrypt(el, values[r.dataset.key] || '—', 1000 + Math.min(900, (values[r.dataset.key] || '').length * 25));
      r.classList.remove('is-active'); r.classList.add('is-done');
      await sleep(450);
    }
    await sleep(1800);
  }
})();
