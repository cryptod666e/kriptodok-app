// Анимация фона: конверты с логотипом КриптоДок и белым шлейфом.
(() => {
  const cv = document.getElementById('sky'), ctx = cv.getContext('2d');
  const logo = new Image(); logo.src = '../assets/logo-mark.png';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W, H, dpr;
  function resize(){ dpr = Math.min(devicePixelRatio||1, 2); W = innerWidth; H = innerHeight;
    cv.width = W*dpr; cv.height = H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); }
  addEventListener('resize', resize); resize();

  const TRAIL = 110, N = 8;
  const rnd = (a,b) => a + Math.random()*(b-a);
  const mk = (i) => {
    const size = rnd(34, 54);
    const s = { size, speed: rnd(95, 140) * (54/ (size+10)) + 40, hd: rnd(0, Math.PI*2),
      x: rnd(.1*W, .9*W), y: rnd(.15*H, .85*H),
      p1: rnd(0,6.28), p2: rnd(0,6.28), f1: rnd(.25,.55), f2: rnd(.6,1.1), t: 0, trail: [], sway: rnd(0,6.28) };
    return s;
  };
  const envs = Array.from({length:N}, (_,i) => mk(i));
  // pre-roll so the sky is already "alive" on first frame
  function step(e, dt){
    e.t += dt;
    // smooth wandering turn
    let turn = Math.sin(e.t*e.f1 + e.p1)*0.9 + Math.sin(e.t*e.f2 + e.p2)*0.5;
    // steer back when approaching edges -> flies "туда-сюда"
    const m = 90; let tx = 0, ty = 0;
    if (e.x < m) tx += (m-e.x)/m; if (e.x > W-m) tx -= (e.x-(W-m))/m;
    if (e.y < m+30) ty += (m+30-e.y)/(m+30); if (e.y > H-m) ty -= (e.y-(H-m))/m;
    if (tx || ty){
      const want = Math.atan2(ty, tx); let d = want - e.hd;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      turn += d * 3.2 * Math.min(1, Math.hypot(tx,ty)*1.5);
    }
    e.hd += turn * dt;
    e.x += Math.cos(e.hd) * e.speed * dt; e.y += Math.sin(e.hd) * e.speed * dt;
    e.trail.unshift({x:e.x, y:e.y}); if (e.trail.length > TRAIL) e.trail.pop();
  }
  if (!reduce) for (let k=0;k<420;k++) envs.forEach(e => step(e, 1/60));
  else envs.forEach(e => { for (let k=0;k<60;k++) step(e,1/60); });

  function bg(){
    const g = ctx.createLinearGradient(0,0,W,H);
    g.addColorStop(0,'#62aaf4'); g.addColorStop(.55,'#4e9bee'); g.addColorStop(1,'#3a82d8');
    ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
    let r = ctx.createRadialGradient(W*.2,H*-.05,0,W*.2,H*-.05,Math.max(W,H)*.7);
    r.addColorStop(0,'rgba(255,255,255,.28)'); r.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle = r; ctx.fillRect(0,0,W,H);
    r = ctx.createRadialGradient(W*.95,H*1.05,0,W*.95,H*1.05,Math.max(W,H)*.6);
    r.addColorStop(0,'rgba(20,60,130,.30)'); r.addColorStop(1,'rgba(20,60,130,0)');
    ctx.fillStyle = r; ctx.fillRect(0,0,W,H);
  }

  function drawTrail(e){
    const t = e.trail, n = t.length; if (n < 3) return;
    const w0 = e.size*0.30;
    // smoothed normals
    const L = [], Rr = [];
    for (let i=0;i<n;i++){
      const a = t[Math.max(0,i-2)], b = t[Math.min(n-1,i+2)];
      let dx = b.x-a.x, dy = b.y-a.y; const d = Math.hypot(dx,dy)||1; dx/=d; dy/=d;
      const k = 1 - i/(n-1), w = w0 * Math.pow(k, .9);
      L.push({x:t[i].x - dy*w, y:t[i].y + dx*w}); Rr.push({x:t[i].x + dy*w, y:t[i].y - dx*w});
    }
    for (let i=0;i<n-1;i++){
      const k = 1 - i/(n-1), alpha = 0.72 * Math.pow(k, 1.35);
      ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
      ctx.beginPath(); ctx.moveTo(L[i].x,L[i].y); ctx.lineTo(L[i+1].x,L[i+1].y);
      ctx.lineTo(Rr[i+1].x,Rr[i+1].y); ctx.lineTo(Rr[i].x,Rr[i].y); ctx.closePath(); ctx.fill();
    }
  }

  function drawEnvelope(e){
    const w = e.size*1.42, h = e.size, r = h*.14;
    const vx = Math.cos(e.hd), vy = Math.sin(e.hd);
    const tilt = Math.max(-.5, Math.min(.5, vy*.45 * (vx>=0?1:-1))) + Math.sin(e.t*1.7 + e.sway)*.06;
    ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(tilt);
    ctx.shadowColor = 'rgba(16,52,102,.35)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.roundRect(-w/2, -h/2, w, h, r); ctx.fill();
    ctx.shadowColor = 'transparent';
    // flap
    ctx.fillStyle = '#e7f1fd';
    ctx.beginPath(); ctx.moveTo(-w/2+r*.4, -h/2+r*.2); ctx.lineTo(0, h*.12); ctx.lineTo(w/2-r*.4, -h/2+r*.2);
    ctx.lineTo(w/2-r*.4, -h/2+r*.2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#cfe2f8'; ctx.lineWidth = Math.max(1, h*.025);
    ctx.beginPath(); ctx.moveTo(-w/2+2, h/2-2); ctx.lineTo(-w*.12, h*.02); ctx.moveTo(w/2-2, h/2-2); ctx.lineTo(w*.12, h*.02); ctx.stroke();
    // logo seal
    const s = h*.50; ctx.shadowColor='rgba(16,52,102,.3)'; ctx.shadowBlur=6; ctx.shadowOffsetY=2;
    if (logo.complete) ctx.drawImage(logo, -s/2, h*.10-s/2, s, s);
    ctx.restore();
  }

  let last = performance.now();
  function frame(now){
    const dt = Math.min(.05, (now-last)/1000); last = now;
    bg();
    envs.forEach(e => { if (!reduce) step(e, dt); });
    envs.forEach(drawTrail);
    envs.slice().sort((a,b)=>a.size-b.size).forEach(drawEnvelope);
    if (!reduce) requestAnimationFrame(frame);
  }
  logo.onload = () => requestAnimationFrame(frame);
  if (logo.complete) requestAnimationFrame(frame);
})();
