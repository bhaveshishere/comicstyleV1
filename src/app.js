/* ============================================================
   OMNIDEX — app.js
   transformations · panels · reader · sfx · panel builder
   ============================================================ */
(() => {
'use strict';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const body = document.body;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------
   1. DATA
   ------------------------------------------------------------ */
const ALIENS = [
  {
    id:'cinder', name:'Cinder', no:'№ 001', role:'Magma bruiser · Pyrokinesis',
    img:'assets/alien-cinder.jpg', accent:'#FF7A18', accent2:'#FF3B2F',
    tags:['power'], powers:['Lava fists','Heatproof','Flame dash','Meltdown'],
    stats:{ Power:96, Speed:54, Brains:61 },
    text:'Rocked-up obsidian plating with a molten core. Cinder throws fists like wrecking balls and leaves a two-metre crater where he lands. The downside: he cannot touch anything fragile, and he absolutely will try.'
  },
  {
    id:'volt', name:'Volt', no:'№ 002', role:'Speedster · Electrokinesis',
    img:'assets/alien-volt.jpg', accent:'#2BE3FF', accent2:'#0077FF',
    tags:['speed'], powers:['Mach sprint','Static field','Arc toss','Afterimage'],
    stats:{ Power:58, Speed:99, Brains:70 },
    text:'A lean, aerodynamic frame built for one thing: getting there first. Volt crosses a city block before the traffic light notices. His static field fries anything with a circuit board, including, occasionally, the dial.'
  },
  {
    id:'tide', name:'Tide', no:'№ 003', role:'Deep-sea hunter · Hydrokinesis',
    img:'assets/alien-tide.jpg', accent:'#2BE3A9', accent2:'#0FA4C8',
    tags:['stealth','power'], powers:['Water coils','Pressure crush','Sonar','Gills'],
    stats:{ Power:78, Speed:66, Brains:74 },
    text:'Built for trenches where light gives up. Tide shapes water into drills and ropes, swims at sixty knots, and reads a room by echo alone. On dry land he is slower — and significantly grumpier.'
  },
  {
    id:'quill', name:'Quill', no:'№ 004', role:'Crystal seer · Telekinesis',
    img:'assets/alien-quill.jpg', accent:'#C77DFF', accent2:'#7B2CE0',
    tags:['stealth'], powers:['Shard storm','Levitation','Mind link','Refraction'],
    stats:{ Power:64, Speed:49, Brains:97 },
    text:'A walking cathedral of violet crystal with a magenta core that never stops humming. Quill lifts twenty tonnes with a thought and can see the shape of a plan three moves before it happens. Never blinks. Has too many eyes to.'
  },
  {
    id:'null', name:'Null', no:'№ 005', role:'Void phantom · Phasing',
    img:'assets/alien-null.jpg', accent:'#9B8CFF', accent2:'#3B1F8F',
    tags:['stealth','speed'], powers:['Phase walk','Shadow slip','Silence','Fear aura'],
    stats:{ Power:52, Speed:82, Brains:88 },
    text:'A hole in the shape of a person. Null walks through walls, cameras lose him mid-frame, and the only warning you get is a drop in temperature. The dial keeps him on a short leash, and he resents it.'
  }
];

const PANELS = [
  { img:'assets/hero-teen.jpg',   cap:'The watch was already warm when he found it.', sfx:'KLIK!',   span:7, rot:-0.6, desc:'Found in the crater behind the school, still ticking. The dial did not come with instructions.' },
  { img:'assets/panel-watch.jpg', cap:'Ten minutes. That is the whole deal.',           sfx:'BZZT!',   span:5, rot:0.8,  desc:'The green face starts counting the second it is pressed. It does not stop for anything.' },
  { img:'assets/alien-titan.jpg', cap:'He grew. Then he kept growing.',                 sfx:'THOOM!',  span:5, rot:-0.5, desc:'First change, first mistake: he picked a form heavier than the street could hold.' },
  { img:'assets/alien-volt.jpg',  cap:'Somewhere across town, a blur.',                 sfx:'FWOOOSH', span:7, rot:0.4,  desc:'Thirteen blocks in four seconds. The traffic cameras only caught a smear of cyan.' },
  { img:'assets/alien-null.jpg',  cap:'The wall never knew he was there.',              sfx:'SHHHK!',  span:6, rot:-0.7, desc:'Null went straight through the vault door and out the other side without a sound.' },
  { img:'assets/panel-city.jpg',  cap:'By dawn, the city had a new problem.',           sfx:'KRAKK!',  span:6, rot:0.6,  desc:'Half of downtown is closed for repairs. The official statement says earthquake.' }
];

/* ------------------------------------------------------------
   2. SOUND — pure Web Audio, no files
   ------------------------------------------------------------ */
const Sound = (() => {
  let ctx = null, on = true, master = null;
  function init(){
    if(ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
    return ctx;
  }
  function noiseBuffer(dur){
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for(let i=0;i<len;i++) d[i] = (Math.random()*2-1) * (1 - i/len);
    return buf;
  }
  function env(node, t0, a, d, peak=1){
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
    node.connect(g); g.connect(master);
    return g;
  }
  function tone({freq=220, type='sine', dur=.3, a=.005, gain=.5, slideTo=null, slideT=null}){
    const t0 = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if(slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + (slideT || dur));
    env(o, t0, a, dur, gain);
    o.start(t0); o.stop(t0 + a + dur + .05);
  }
  function noise({dur=.25, gain=.5, type='highpass', freq=800, q=1}){
    const t0 = ctx.currentTime;
    const s = ctx.createBufferSource();
    s.buffer = noiseBuffer(dur);
    const f = ctx.createBiquadFilter();
    f.type = type; f.frequency.value = freq; f.Q.value = q;
    s.connect(f);
    env(f, t0, .004, dur, gain);
    s.start(t0);
  }
  const play = (name) => {
    if(!on) return;
    if(!init()) return;
    if(ctx.state === 'suspended') ctx.resume();
    switch(name){
      case 'punch':
        tone({freq:150, type:'sine', dur:.18, gain:.9, slideTo:48, slideT:.16});
        noise({dur:.16, gain:.55, type:'lowpass', freq:2400});
        break;
      case 'zap':
        tone({freq:1800, type:'square', dur:.12, gain:.22, slideTo:520, slideT:.1});
        noise({dur:.14, gain:.3, type:'highpass', freq:2600});
        setTimeout(()=>tone({freq:900, type:'sawtooth', dur:.09, gain:.16, slideTo:240, slideT:.08}), 60);
        break;
      case 'whoosh':
        noise({dur:.5, gain:.5, type:'bandpass', freq:400, q:1.4});
        setTimeout(()=>noise({dur:.35, gain:.35, type:'bandpass', freq:1400, q:1.1}), 90);
        break;
      case 'warp':
        tone({freq:70, type:'sawtooth', dur:1.1, gain:.3, slideTo:700, slideT:1.0});
        tone({freq:110, type:'sine', dur:1.2, gain:.22, slideTo:880, slideT:1.05});
        noise({dur:.9, gain:.28, type:'bandpass', freq:1800, q:.8});
        break;
      case 'click':
        tone({freq:1200, type:'square', dur:.05, gain:.18, slideTo:300, slideT:.045});
        break;
      case 'charge':
        tone({freq:220, type:'triangle', dur:.75, gain:.3, slideTo:1600, slideT:.7});
        noise({dur:.6, gain:.22, type:'highpass', freq:3000});
        break;
      case 'land':
        tone({freq:110, type:'sine', dur:.38, gain:.9, slideTo:36, slideT:.34});
        noise({dur:.3, gain:.5, type:'lowpass', freq:1200});
        break;
      case 'success':
        [523, 659, 784, 1046].forEach((f,i)=> setTimeout(()=>tone({freq:f, type:'square', dur:.14, gain:.16}), i*80));
        break;
    }
  };
  return {
    play,
    toggle(){ on = !on; if(on) play('click'); return on; },
    get enabled(){ return on; },
    unlock(){ if(init() && ctx.state === 'suspended') ctx.resume(); }
  };
})();

/* ------------------------------------------------------------
   3. HUD — progress, sound toggle, clock
   ------------------------------------------------------------ */
(function hud(){
  const bar = $('#progress');
  const upd = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0).toFixed(2) + '%';
  };
  window.addEventListener('scroll', upd, { passive:true });
  window.addEventListener('resize', upd);
  upd();

  const sb = $('#soundBtn');
  sb.addEventListener('click', () => {
    const enabled = Sound.toggle();
    sb.textContent = enabled ? '♪' : '✕';
    sb.classList.toggle('is-off', !enabled);
    sb.setAttribute('aria-pressed', String(enabled));
    toast(enabled ? 'Sound on' : 'Sound off');
  });

  const clock = $('#clock');
  if(clock){
    const tick = () => clock.textContent = new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date()) + ' local';
    tick(); setInterval(tick, 1000);
  }
})();

let toastTimer;
function toast(msg){
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> t.classList.remove('on'), 2100);
}

/* ------------------------------------------------------------
   4. TRANSFORMATION
   ------------------------------------------------------------ */
const Warp = (() => {
  const wrap = $('#warp');
  const els = {
    dim:$('#warpDim'), lines:$('#warpLines'), lines2:$('#warpLines2'),
    morph:$('#warpMorph'), img:$('#warpImg'), ring:$('#warpRing'), ring2:$('#warpRing2'),
    word:$('#warpWord'), flash:$('#warpFlash'), black:$('#warpBlack'), glitch:$('#warpGlitch'),
    skip:$('#warpSkip')
  };
  let running = false, skipped = false, current = null;

  const wait = (ms) => new Promise(r => setTimeout(r, reduce ? Math.min(ms, 60) : ms));

  function applyTheme(alien){
    const root = document.documentElement;
    root.style.setProperty('--accent', alien.accent);
    root.style.setProperty('--accent-2', alien.accent2);
    document.querySelector('meta[name="theme-color"]').setAttribute('content', alien.accent);
    $$('.chip').forEach(c => c.classList.toggle('is-active', c.dataset.id === alien.id));
  }

  async function run(alien, opts = {}){
    if(running) return;
    running = true; skipped = false;
    current = alien;
    body.classList.add('is-busy');
    wrap.classList.add('on');
    wrap.setAttribute('aria-hidden','false');
    Sound.play('charge');

    // reset
    Object.assign(els.flash.style, {opacity:0, transition:'none'});
    els.dim.style.opacity = 1;
    els.lines.style.cssText = 'opacity:0;transform:scale(.2) rotate(0deg)';
    els.lines2.style.cssText = 'opacity:0;transform:scale(.2) rotate(0deg)';
    els.morph.style.cssText = 'opacity:0';
    els.img.style.cssText = '';
    els.ring.style.cssText = '';
    els.ring2.style.cssText = '';
    els.word.style.cssText = '';
    els.black.style.opacity = 0;
    els.glitch.style.opacity = 0;
    els.img.src = alien.img;
    els.img.alt = alien.name + ' transformation';
    els.word.textContent = alien.name.toUpperCase();

    await wait(60);

    // --- 1. screen goes dark, lines spin up ---
    els.dim.style.transition = 'opacity .45s ease-out';
    els.lines.style.transition = 'opacity .5s ease-out, transform 1.4s cubic-bezier(.16,1,.3,1)';
    els.lines2.style.transition = 'opacity .6s ease-out, transform 1.8s cubic-bezier(.16,1,.3,1)';
    requestAnimationFrame(()=>{
      els.lines.style.opacity = .5;
      els.lines.style.transform = 'scale(1) rotate(28deg)';
      els.lines2.style.opacity = .35;
      els.lines2.style.transform = 'scale(.8) rotate(-22deg)';
    });

    // --- 2. rings pulse out ---
    await wait(180);
    [els.ring, els.ring2].forEach((r,i)=>{
      r.style.transition = 'none';
      r.style.transform = 'translate(-50%,-50%) scale(.2)';
      r.style.opacity = .9;
      requestAnimationFrame(()=>{
        r.style.transition = `transform 1.1s cubic-bezier(.2,1.4,.3,1), opacity .9s ease-out`;
        r.style.transform = `translate(-50%,-50%) scale(${3.2 + i*1.4})`;
        r.style.opacity = 0;
      });
    });

    // --- 3. the creature morphs in, glitchy ---
    await wait(220);
    els.morph.style.transition = 'opacity .5s ease-out';
    els.morph.style.opacity = 1;
    els.img.style.transition = 'transform 1.5s cubic-bezier(.16,1,.3,1), filter .8s';
    els.img.style.transform = 'scale(1)';
    els.img.style.filter = `drop-shadow(0 0 60px ${alien.accent}) contrast(1.15) saturate(1.2)`;
    els.glitch.style.transition = 'opacity .12s';
    for(let i=0;i<6;i++){
      els.glitch.style.opacity = (i % 2 ? .35 : 0);
      await wait(55);
    }
    els.glitch.style.opacity = 0;

    // --- 4. the name slams down ---
    await wait(120);
    Sound.play('land');
    els.word.style.transition = 'none';
    els.word.style.opacity = 0;
    els.word.style.transform = 'translate(-50%,-50%) scale(3) rotate(-14deg)';
    requestAnimationFrame(()=>{
      els.word.style.transition = 'transform .42s cubic-bezier(.2,1.5,.4,1), opacity .12s';
      els.word.style.opacity = 1;
      els.word.style.transform = 'translate(-50%,-50%) scale(1) rotate(-8deg)';
    });
    document.documentElement.style.setProperty('--accent', alien.accent);

    await wait(560);
    if(skipped) return finish(false);

    // --- 5. white flash + wipe out ---
    Sound.play('whoosh');
    els.flash.style.transition = 'opacity .08s linear';
    els.flash.style.opacity = 1;
    await wait(110);
    els.flash.style.transition = 'opacity .5s ease-out';
    els.flash.style.opacity = 0;
    els.black.style.transition = 'opacity .35s ease-out';
    els.black.style.opacity = 0;
    finish(true);
  }

  function finish(){
    applyTheme(current);
    body.classList.remove('is-busy');
    wrap.classList.remove('on');
    wrap.setAttribute('aria-hidden','true');
    running = false;
    document.dispatchEvent(new CustomEvent('omni:transform', {detail: current}));
  }

  els.skip.addEventListener('click', ()=>{
    skipped = true;
    if(!running) return;
    els.flash.style.transition = 'opacity .1s';
    els.flash.style.opacity = 1;
    setTimeout(()=>{ els.flash.style.opacity = 0; }, 100);
    finish();
  });

  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && running){ skipped = true; finish(); }
  });

  return { run, get running(){ return running; } };
})();

/* ------------------------------------------------------------
   5. ALIEN DEX — wheel, dossier, filter
   ------------------------------------------------------------ */
const Dex = (() => {
  const wheel = $('#wheel');
  const state = { current: 0, filter: 'all', timer: 600 };

  ALIENS.forEach((a, i) => {
    const ang = (-90 + i * (360 / ALIENS.length)) * Math.PI / 180;
    const rad = 38; // % of the wheel box
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.dataset.id = a.id;
    btn.dataset.tags = a.tags.join(' ');
    // place on a circle inside the padded box, coords in wheel-space
    btn.style.left = `calc(50% + ${(Math.cos(ang) * rad).toFixed(3)}%)`;
    btn.style.top  = `calc(50% + ${(Math.sin(ang) * rad).toFixed(3)}%)`;
    btn.setAttribute('aria-label', `Select ${a.name}, ${a.role}`);
    btn.innerHTML = `<img src="${a.img}" alt=""><span class="chip__name">${a.name}</span>`;
    btn.addEventListener('click', () => {
      Sound.play('click');
      select(i, true);
    });
    wheel.appendChild(btn);
  });

  function select(i, announce){
    state.current = i;
    const a = ALIENS[i];
    $('#dexImg').src = a.img;
    $('#dexImg').alt = `${a.name} — ${a.role}`;
    $('#dexNo').textContent = a.no;
    $('#dexName').textContent = a.name;
    $('#dexRole').textContent = a.role;
    $('#dexText').textContent = a.text;
    $('#dexCounter').textContent = String(i + 1).padStart(2,'0') + ' / ' + String(ALIENS.length).padStart(2,'0');
    $('#dexStats').innerHTML = Object.entries(a.stats).map(([k,v])=>`
      <div class="stat">
        <span>${k}</span>
        <span class="stat__bar"><span class="stat__fill" data-v="${v}"></span></span>
        <b>${v}</b>
      </div>`).join('');
    $('#dexPowers').innerHTML = a.powers.map(p=>`<span>${p}</span>`).join('');
    $$('.chip').forEach(c => c.classList.toggle('is-active', c.dataset.id === a.id));
    if(announce){
      document.documentElement.style.setProperty('--accent', a.accent);
      document.documentElement.style.setProperty('--accent-2', a.accent2);
    }
    $('#dexTimer').textContent = '10:00';
    $('#dexTimer').classList.remove('low');
    requestAnimationFrame(()=>{
      $$('#dexStats .stat__fill').forEach(f => f.style.inset = `0 ${100 - (+f.dataset.v)}% 0 0`);
    });
    if(announce) toast(a.name + ' loaded');
  }

  // filter
  $$('[data-filter]').forEach(b=>{
    b.addEventListener('click', ()=>{
      Sound.play('click');
      $$('[data-filter]').forEach(x=>x.classList.remove('is-on'));
      b.classList.add('is-on');
      const f = b.dataset.filter;
      $$('.chip').forEach(c=>{
        const show = f === 'all' || c.dataset.tags.includes(f);
        c.style.opacity = show ? 1 : .18;
        c.style.pointerEvents = show ? '' : 'none';
        c.style.filter = show ? '' : 'grayscale(1)';
      });
    });
  });

  $('#goBtn').addEventListener('click', () => Warp.run(ALIENS[state.current]));

  select(0, false);
  return { state, select };
})();

/* ------------------------------------------------------------
   6. COMIC PANELS + READER
   ------------------------------------------------------------ */
(function panels(){
  const grid = $('#pageGrid');
  PANELS.forEach((p, i) => {
    const el = document.createElement('article');
    el.className = 'panel';
    el.style.setProperty('--span', p.span);
    el.style.setProperty('--rot', p.rot + 'deg');
    el.dataset.index = i;
    el.innerHTML = `
      <img src="${p.img}" alt="${p.desc}" loading="lazy">
      <p class="panel__cap">${p.cap}</p>
      <span class="panel__sfx">${p.sfx}</span>
      <button class="panel__zoom" aria-label="Open panel ${i+1} in reader">⤢</button>`;
    el.addEventListener('click', ()=> openReader(i));
    grid.appendChild(el);
  });

  // reveal
  const io = new IntersectionObserver((es)=>{
    es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .18, rootMargin: '0px 0px -6% 0px' });
  $$('.panel').forEach((p, i)=>{ p.style.transitionDelay = (i % 3) * 60 + 'ms'; io.observe(p); });

  // reader
  const reader = $('#reader');
  const img = $('#readerImg'), cap = $('#readerCap'), cnt = $('#readerCount');
  let idx = 0, lastFocus = null;
  function render(){
    const p = PANELS[idx];
    img.src = p.img; img.alt = p.desc;
    cap.innerHTML = `<b>${p.cap}</b>${p.desc}`;
    cnt.textContent = `Panel ${idx+1} of ${PANELS.length}`;
  }
  function openReader(i){
    idx = i; lastFocus = document.activeElement;
    render();
    reader.classList.add('on');
    reader.setAttribute('aria-hidden','false');
    body.classList.add('is-busy');
    Sound.play('whoosh');
    $('#readerNext').focus({preventScroll:true});
  }
  function closeReader(){
    reader.classList.remove('on');
    reader.setAttribute('aria-hidden','true');
    body.classList.remove('is-busy');
    lastFocus && lastFocus.focus && lastFocus.focus({preventScroll:true});
  }
  document.addEventListener('keydown', (e)=>{
    if(e.key !== 'Tab' || !reader.classList.contains('on')) return;
    const f = $$('button, [href], input, [tabindex]:not([tabindex="-1"])', reader).filter(el=>el.offsetParent !== null);
    if(!f.length) return;
    const first = f[0], last = f[f.length-1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  });
  $('#openReader').addEventListener('click', ()=> openReader(0));
  $('#readerPrev').addEventListener('click', ()=>{ idx = (idx - 1 + PANELS.length) % PANELS.length; render(); Sound.play('click'); });
  $('#readerNext').addEventListener('click', ()=>{ idx = (idx + 1) % PANELS.length; render(); Sound.play('click'); });
  $$('[data-rclose]').forEach(b=> b.addEventListener('click', closeReader));
  document.addEventListener('keydown', (e)=>{
    if(!reader.classList.contains('on')) return;
    if(e.key === 'Escape') closeReader();
    if(e.key === 'ArrowRight'){ idx = (idx + 1) % PANELS.length; render(); Sound.play('click'); }
    if(e.key === 'ArrowLeft'){ idx = (idx - 1 + PANELS.length) % PANELS.length; render(); Sound.play('click'); }
  });
  window.__openReader = openReader;
})();

/* ------------------------------------------------------------
   7. SFX LAB
   ------------------------------------------------------------ */
(function sfxLab(){
  $$('.sfxbtn').forEach(b=>{
    b.addEventListener('click', ()=>{
      Sound.play(b.dataset.sfx);
      b.classList.remove('is-hit');
      void b.offsetWidth;
      b.classList.add('is-hit');
    });
  });
})();

/* ------------------------------------------------------------
   8. PANEL BUILDER (canvas)
   ------------------------------------------------------------ */
(function builder(){
  const cv = $('#panelCanvas');
  if(!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const state = { text: $('#capText').value, spec: 'alien-titan', fx: 'THOOM!', ink: '#FFD400', angle: -2 };

  const imgCache = {};
  function load(src){
    if(imgCache[src]) return Promise.resolve(imgCache[src]);
    return new Promise((res)=>{
      const im = new Image();
      im.onload = ()=>{ imgCache[src] = im; res(im); };
      im.onerror = ()=> res(null);
      im.src = src;
    });
  }

  function halftone(x, y, w, h, color, alpha=.35, step=7){
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color;
    for(let yy=y; yy<y+h; yy+=step){
      for(let xx=x; xx<x+w; xx+=step){
        const d = 1.2 + 1.4 * Math.abs(Math.sin((xx+yy)*0.05));
        ctx.beginPath(); ctx.arc(xx, yy, d, 0, Math.PI*2); ctx.fill();
      }
    }
    ctx.restore();
  }

  function burst(cx, cy, r, color){
    ctx.save(); ctx.fillStyle = color;
    const spikes = 18;
    ctx.beginPath();
    for(let i=0;i<spikes*2;i++){
      const ang = (Math.PI*2/spikes/2)*i;
      const rr = i%2 ? r : r*0.62;
      ctx.lineTo(cx + Math.cos(ang)*rr, cy + Math.sin(ang)*rr);
    }
    ctx.closePath(); ctx.fill(); ctx.restore();
  }

  function wrap(text, maxW){
    const words = text.split(/\s+/); const lines = []; let line = '';
    words.forEach(w=>{
      const t = line ? line + ' ' + w : w;
      if(ctx.measureText(t).width > maxW && line){ lines.push(line); line = w; }
      else line = t;
    });
    if(line) lines.push(line);
    return lines;
  }

  async function draw(){
    const im = await load('assets/' + state.spec + '.jpg');
    ctx.clearRect(0,0,W,H);

    // base panel
    ctx.fillStyle = '#0A0A0E'; ctx.fillRect(0,0,W,H);

    // artwork, cover-fit with a shake offset
    if(im){
      const s = Math.max(W / im.width, H / im.height);
      const dw = im.width * s, dh = im.height * s;
      const dx = (W - dw) / 2 + Math.sin(state.angle) * 12;
      const dy = (H - dh) / 2 + Math.cos(state.angle) * 6;
      ctx.drawImage(im, dx, dy, dw, dh);
      // vignette
      const g = ctx.createRadialGradient(W/2, H*0.45, H*0.2, W/2, H*0.5, H*0.95);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,.55)');
      ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
      halftone(0,0,W,H,'#0A0A0E',.16,6);
    }

    // caption box
    ctx.save();
    ctx.translate(70, 46); ctx.rotate(state.angle * Math.PI/180);
    ctx.font = '700 22px "Mono", monospace';
    const lines = wrap(state.text.toUpperCase(), 560);
    const lh = 30;
    const bw = Math.min(620, Math.max(...lines.map(l=>ctx.measureText(l).width)) + 44);
    const bh = lines.length * lh + 26;
    ctx.fillStyle = state.ink; ctx.strokeStyle = '#0A0A0E'; ctx.lineWidth = 5;
    ctx.fillRect(0,0,bw,bh); ctx.strokeRect(0,0,bw,bh);
    ctx.fillStyle = '#0A0A0E';
    lines.forEach((l,i)=> ctx.fillText(l, 22, 34 + i*lh));
    ctx.restore();

    // SFX burst — starburst behind, ink-outlined lettering in front
    if(state.fx && state.fx !== 'none'){
      ctx.save();
      ctx.translate(W - 250, H - 148); ctx.rotate(-8 * Math.PI/180);
      burst(0, 0, 168, '#0A0A0E');
      burst(0, 0, 150, state.ink);
      ctx.font = '112px "Bangers", Impact, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      // comic drop-shadow pass
      ctx.fillStyle = 'rgba(10,10,14,.55)';
      ctx.fillText(state.fx, 9, 12);
      // outlined lettering: accent fill, thick ink stroke
      ctx.lineJoin = 'round'; ctx.miterLimit = 2;
      ctx.lineWidth = 16; ctx.strokeStyle = '#0A0A0E'; ctx.strokeText(state.fx, 0, 0);
      ctx.lineWidth = 5; ctx.strokeStyle = '#0A0A0E'; ctx.strokeText(state.fx, 0, 0);
      ctx.fillStyle = state.ink; ctx.fillText(state.fx, 0, 0);
      ctx.restore();
    }

    // inner border
    ctx.strokeStyle = '#0A0A0E'; ctx.lineWidth = 10;
    ctx.strokeRect(5,5,W-10,H-10);

    // corner tag
    ctx.save();
    ctx.fillStyle = '#0A0A0E';
    ctx.fillRect(W-190, 0, 190, 34);
    ctx.font = '700 14px "Mono", monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillStyle = state.ink;
    ctx.fillText('OMNIDEX · P.' + (state.spec.split('-')[1] || '').toUpperCase(), W-95, 18);
    ctx.restore();
  }

  // controls
  $('#capText').addEventListener('input', e => { state.text = e.target.value || '…'; draw(); });
  $$('#specOpts .opt').forEach(b=> b.addEventListener('click', ()=>{
    $$('#specOpts .opt').forEach(x=>x.classList.remove('is-on')); b.classList.add('is-on');
    state.spec = b.dataset.spec; Sound.play('click'); draw();
  }));
  $$('#sfxOpts .opt').forEach(b=> b.addEventListener('click', ()=>{
    $$('#sfxOpts .opt').forEach(x=>x.classList.remove('is-on')); b.classList.add('is-on');
    state.fx = b.dataset.fx; Sound.play('click'); draw();
  }));
  $$('#inkOpts .sw').forEach(b=> b.addEventListener('click', ()=>{
    $$('#inkOpts .sw').forEach(x=>x.classList.remove('is-on')); b.classList.add('is-on');
    state.ink = b.dataset.ink; Sound.play('click'); draw();
  }));
  $('#shakePanel').addEventListener('click', ()=>{
    state.angle = (Math.random()*6 - 3);
    Sound.play('whoosh'); draw(); toast('Angle rerolled');
  });
  $('#downloadPanel').addEventListener('click', ()=>{
    let data;
    try { data = cv.toDataURL('image/png'); }
    catch(err){
      Sound.play('zap');
      toast('Export blocked — open the site via a server (GitHub Pages)');
      return;
    }
    const a = document.createElement('a');
    a.download = 'omnidex-panel.png';
    a.href = data;
    document.body.appendChild(a); a.click(); a.remove();
    Sound.play('success');
    toast('Panel downloaded');
  });

  const ready = () => draw();
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(ready);
  else window.addEventListener('load', ready);
  draw();
  $('#bform').addEventListener('submit', e => e.preventDefault());
})();

/* ------------------------------------------------------------
   9. HERO BITS — title pop, dial, stickers, parallax
   ------------------------------------------------------------ */
(function hero(){
  // split the title letters for a pop-in (per word, keeps <em> intact)
  const title = $('#heroTitle');
  $$('.t-word', title).forEach(word => {
    const chars = [...word.textContent];
    word.textContent = '';
    chars.forEach(ch => {
      const span = document.createElement('span');
      span.textContent = ch;
      word.appendChild(span);
    });
  });
  const letters = $$('#heroTitle .t-word span');
  letters.forEach((l,i)=>{
    l.style.opacity = 0;
    l.style.transform = 'translateY(46px) scale(.82) rotate(-8deg)';
    setTimeout(()=>{
      l.style.transition = 'transform .55s cubic-bezier(.2,1.7,.4,1), opacity .3s';
      l.style.opacity = 1;
      l.style.transform = 'none';
    }, reduce ? 0 : 100 + i*42);
  });

  // dial
  const dial = $('#dial');
  const randomAlien = () => {
    const cur = ALIENS[Dex.state.current].id;
    const pool = ALIENS.filter(a => a.id !== cur);
    return pool[Math.floor(Math.random() * pool.length)] || ALIENS[0];
  };
  dial.addEventListener('click', () => {
    Sound.play('charge');
    dial.classList.remove('shake'); void dial.offsetWidth; dial.classList.add('shake');
    Warp.run(randomAlien());
  });
  $('#transformBtn').addEventListener('click', ()=> Warp.run(ALIENS[Dex.state.current]));
  document.addEventListener('keydown', (e)=>{
    if(e.target.matches('input, textarea')) return;
    if(e.key === 't' || e.key === 'T'){ Warp.run(ALIENS[Dex.state.current]); }
  });

  // pointer parallax on hero art
  const bg = $('#heroBg');
  let raf = null;
  window.addEventListener('pointermove', (e)=>{
    if(window.matchMedia('(pointer:coarse)').matches || reduce) return;
    const nx = (e.clientX / window.innerWidth - .5);
    const ny = (e.clientY / window.innerHeight - .5);
    if(raf) return;
    raf = requestAnimationFrame(()=>{
      bg.style.transform = `scale(1.08) translate(${nx*-18}px, ${ny*-12}px)`;
      raf = null;
    });
  }, { passive:true });
})();

/* ------------------------------------------------------------
   10. CHAOS MODE
   ------------------------------------------------------------ */
(function chaos(){
  let on = false;
  const btn = $('#chaosBtn');
  btn.addEventListener('click', ()=>{
    on = !on;
    body.classList.toggle('chaos', on);
    btn.classList.toggle('is-off', !on);
    Sound.play(on ? 'charge' : 'click');
    toast(on ? 'CHAOS MODE — panels are alive' : 'Chaos mode off');
    if(on){
      $$('.panel').forEach(p=>{
        p.style.transition = 'transform .45s cubic-bezier(.2,1.6,.4,1), box-shadow .4s';
        p.style.setProperty('--rot', (Math.random()*4 - 2).toFixed(2) + 'deg');
      });
      document.documentElement.style.setProperty('--accent', '#FFD400');
    } else {
      $$('.panel').forEach(p=> p.style.setProperty('--rot', p.dataset.rot || '0deg'));
      const a = ALIENS[Dex.state.current];
      document.documentElement.style.setProperty('--accent', a.accent);
    }
  });
})();

/* ------------------------------------------------------------
   11. REVEALS, SUBSCRIBE, MISC
   ------------------------------------------------------------ */
(function misc(){
  const io = new IntersectionObserver((es)=>{
    es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold:.15 });
  $$('[data-reveal]').forEach(el=> io.observe(el));

  // scroll reveal for whole sections' direct children (subtle)
  $$('.sec-head, .alienlab, .origin, .builder').forEach(el=>{
    el.style.opacity = 0; el.style.transform = 'translateY(22px)';
    el.style.transition = 'opacity .6s cubic-bezier(.16,1,.3,1), transform .6s cubic-bezier(.2,1.3,.4,1)';
    const o = new IntersectionObserver((ents)=>{
      ents.forEach(en=>{ if(en.isIntersecting){ el.style.opacity = 1; el.style.transform = 'none'; o.disconnect(); } });
    }, {threshold:.12});
    o.observe(el);
  });

  const form = $('#subForm');
  form && form.addEventListener('submit', (e)=>{
    e.preventDefault();
    Sound.play('success');
    $('#subNote').textContent = 'Nice — this is a demo, so nothing was sent. Wire it to your provider.';
    form.reset();
    toast('Subscribed (demo)');
  });

  // unlock audio on first gesture (mobile policy)
  ['pointerdown','keydown'].forEach(ev=> window.addEventListener(ev, ()=> Sound.unlock(), {once:true}));
})();

/* expose for debugging */
window.Omnidex = { Warp, Dex, ALIENS, Sound };
})();
