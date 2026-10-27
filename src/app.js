/* ============================================================
   OMNIVERSE — app.js
   watch · hologram warp · archive · battle · audio · forge
   ============================================================ */
(() => {
'use strict';
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const body = document.body;
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = ms => new Promise(r => setTimeout(r, REDUCE ? Math.min(ms, 40) : ms));

/* darken a hex colour so it reads on cream paper */
function deep(hex, k = .42){
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * k), g = Math.round(((n >> 8) & 255) * k), b = Math.round((n & 255) * k);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
function setAccent(a){
  const root = document.documentElement.style;
  root.setProperty('--accent', a.accent);
  root.setProperty('--accent-2', a.accent2);
  root.setProperty('--accent-deep', deep(a.accent));
}

/* ------------------------------------------------------------
   1 · DATA — original characters
   ------------------------------------------------------------ */
const ALIENS = [
{ id:'cinder', name:'Cinder', no:'№ 001', role:'Magma golem · Pyrokinetic',
  img:'assets/alien-cinder.jpg', accent:'#FF8A1E', accent2:'#FF3B2F', tags:['power'],
  powers:['Flame fist','Lava plating','Heatproof','Meltdown'],
  stats:{Power:96,Speed:52,Brains:60},
  text:'A walking volcano with a bad attitude. Obsidian armour plates crack open to let molten rock through, and his punches leave craters shaped like fists. Cannot hold anything delicate. Has never once tried to.',
  moves:[{n:'Flame Fist',d:[14,20],s:'flame'},{n:'Magma Surge',d:[10,16],s:'warp'},{n:'Meltdown',d:[22,30],s:'impact',recoil:6}] },

{ id:'volt', name:'Volt', no:'№ 002', role:'Speedster · Electrokinetic',
  img:'assets/alien-volt.jpg', accent:'#2BE3FF', accent2:'#0B78FF', tags:['speed'],
  powers:['Mach dash','Static field','Arc toss','Afterimage'],
  stats:{Power:56,Speed:99,Brains:71},
  text:'Built for one job: arrive first. Volt crosses thirteen blocks before the traffic light changes its mind, and his static field fries anything with a circuit — including, on one memorable occasion, the watch itself.',
  moves:[{n:'Mach Dash',d:[12,18],s:'zap'},{n:'Static Storm',d:[9,15],s:'zap'},{n:'Thunder Clap',d:[20,26],s:'impact'}] },

{ id:'tide', name:'Tide', no:'№ 003', role:'Deep-sea hunter · Hydrokinetic',
  img:'assets/alien-tide.jpg', accent:'#2BE3A9', accent2:'#0FA4C8', tags:['stealth','power'],
  powers:['Water drill','Pressure crush','Sonar','Gills'],
  stats:{Power:78,Speed:64,Brains:74},
  text:'Dredged up from trenches where light gives up. Tide coils water into drills and ropes, swims at sixty knots and reads a room by echo alone. On dry land he is slower, grumpier, and still terrifying.',
  moves:[{n:'Water Drill',d:[13,19],s:'water'},{n:'Pressure Crush',d:[11,17],s:'water'},{n:'Tidal Fang',d:[21,27],s:'impact'}] },

{ id:'quill', name:'Quill', no:'№ 004', role:'Crystal seer · Telekinetic',
  img:'assets/alien-quill.jpg', accent:'#C77DFF', accent2:'#7B2CE0', tags:['stealth'],
  powers:['Shard storm','Levitation','Mind link','Refraction'],
  stats:{Power:64,Speed:48,Brains:97},
  text:'A cathedral of violet crystal with a magenta core that never stops humming. Lifts twenty tonnes with a thought, sees a plan three moves before it happens, and never blinks. Has too many eyes to.',
  moves:[{n:'Shard Storm',d:[12,18],s:'crystal'},{n:'Mind Spike',d:[10,16],s:'crystal'},{n:'Core Flare',d:[21,27],s:'impact'}] },

{ id:'null', name:'Null', no:'№ 005', role:'Void phantom · Phasing',
  img:'assets/alien-null.jpg', accent:'#9B8CFF', accent2:'#3B1F8F', tags:['stealth','speed'],
  powers:['Phase walk','Shadow slip','Silence','Fear aura'],
  stats:{Power:52,Speed:82,Brains:88},
  text:'A hole in the shape of a person. Walks through walls, drops out of camera frames mid-shot, and leaves a cold spot where he used to be. The watch keeps him on a short leash. He resents it, loudly, in total silence.',
  moves:[{n:'Phase Strike',d:[12,18],s:'void'},{n:'Shadow Slip',d:[8,14],s:'void',heal:7},{n:'Void Grip',d:[20,26],s:'impact'}] }
];

const VILLAIN = { name:'Kronikk', hp:130, moves:[
  {n:'Time Slash',d:[11,16],s:'clank'},
  {n:'Gear Barrage',d:[9,14],s:'impact'},
  {n:'Chrono Beam',d:[17,23],s:'warp'}
]};

const PANELS = [
  {img:'assets/hero.jpg',        cap:'It was already warm when he found it.',      sfx:'KLIK!',  span:7, rot:-0.5, desc:'A crater behind the school, a watch that had no business being there, and a boy who should have walked away.'},
  {img:'assets/alien-cinder.jpg',cap:'First pull. First mistake.',                  sfx:'THOOM!', span:5, rot:0.7,  desc:'The dial snapped down and the street learned what a magma golem weighs.'},
  {img:'assets/villain-kronik.jpg',cap:'Then the air got cold.',                    sfx:'KRSSH!', span:5, rot:-0.6, desc:'Kronikk arrived four seconds before he left, which is a thing he does to make a point.'},
  {img:'assets/alien-volt.jpg',  cap:'Thirteen blocks. Four seconds.',              sfx:'FWOOOSH',span:7, rot:0.4,  desc:'The traffic cameras caught a smear of cyan and a very confused pigeon.'},
  {img:'assets/battle-vs.jpg',   cap:'Fire met clockwork in the middle of the road.', sfx:'KRAKK!', span:7, rot:-0.4, desc:'The impact cracked every window in a two-block radius. The city would later call it an earthquake.'},
  {img:'assets/alien-null.jpg',  cap:'Some doors you stop bothering to open.',      sfx:'SHHHK!', span:5, rot:0.6,  desc:'Null went through the vault wall, took back the hour Kronikk had stolen, and left no prints.'}
];

/* ------------------------------------------------------------
   2 · AUDIO — rebuilt from scratch, layered, no files
   ------------------------------------------------------------ */
const SynthSound = (() => {
  let ctx, master, verb, on = true, unlocked = false;
  function init(){
    if(ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = .55; master.connect(ctx.destination);
    // tiny feedback reverb so nothing sounds dry/cheap
    verb = ctx.createDelay(0.35); verb.delayTime.value = 0.11;
    const fb = ctx.createGain(); fb.gain.value = 0.28;
    const lp = ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value = 2600;
    verb.connect(fb); fb.connect(lp); lp.connect(verb);
    const wet = ctx.createGain(); wet.gain.value = .3;
    verb.connect(wet); wet.connect(master);
    return ctx;
  }
  const now = () => ctx.currentTime;

  function noiseBuf(dur){
    const n = Math.floor(ctx.sampleRate * dur), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    for(let i=0;i<n;i++) d[i] = (Math.random()*2-1);
    return b;
  }
  function voice(type, f0, f1, dur, gain=0.4, t0=0, dest='both', detune=0){
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.detune.value = detune;
    const t = now() + t0;
    o.frequency.setValueAtTime(f0, t);
    if(f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(12, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + Math.min(.02, dur*0.15));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); if(dest === 'both') g.connect(verb);
    o.start(t); o.stop(t + dur + .02);
    return o;
  }
  function noise(dur, gain=.35, type='bandpass', freq=1400, q=1, t0=0, sweepTo=null, atk=.004){
    const src = ctx.createBufferSource(); src.buffer = noiseBuf(dur);
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain(); const t = now() + t0;
    if(sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(master); g.connect(verb);
    src.start(t); src.stop(t + dur + .02);
  }
  function metal(freq, dur, gain=.3, t0=0){
    [1, 2.41, 3.77, 5.53].forEach((m,i)=> voice('sine', freq*m, freq*m*0.985, dur/(1+i*.5), gain/(1+i*1.4), t0, 'both'));
  }

  const P = {
    /* the watch: two clipped chirps, rising */
    chirp(){ voice('square', 880, 1320, .07, .16, 0, 'dry'); voice('square', 1320, 1760, .07, .13, .075, 'dry');
            voice('sine', 660, 990, .1, .1, 0, 'wet'); },
    /* dial ratchet: 5 mechanical clicks */
    crank(){ for(let i=0;i<5;i++){ noise(.03, .3, 'highpass', 2400, 1, i*.055);
             voice('square', 300 + i*40, 180, .03, .1, i*.055, 'dry'); } },
    /* transform sweep */
    warp(){ voice('sawtooth', 90, 760, .95, .22, 0, 'wet', -8);
            voice('sine', 140, 1180, 1.0, .17, .02, 'wet', 6);
            voice('triangle', 55, 220, 1.1, .18, 0, 'both');
            noise(1.0, .18, 'bandpass', 900, 1.6, 0, 5200); },
    charge(){ voice('triangle', 220, 1500, .7, .2, 0, 'both');
              voice('sawtooth', 110, 700, .7, .1, .03, 'wet', 12); noise(.7, .14, 'highpass', 2600, .8); },
    impact(){ voice('sine', 140, 34, .42, .85, 0, 'dry');
              voice('triangle', 90, 40, .3, .5, 0, 'dry');
              noise(.26, .5, 'lowpass', 1800, .9); metal(180, .28, .1, .01); },
    clank(){ metal(520, .45, .3); noise(.055, .4, 'highpass', 3600, 1.2);
             voice('square', 240, 120, .09, .12, .01, 'dry'); },
    glitch(){ for(let i=0;i<7;i++){ voice('square', 200 + Math.random()*1800, 120 + Math.random()*400, .04, .12, i*.045, 'dry'); }
              noise(.3, .2, 'highpass', 4200, .7); },
    timefreeze(){ voice('sine', 1200, 60, 1.5, .3, 0, 'both');
                  voice('sawtooth', 600, 40, 1.3, .12, .05, 'wet', -14);
                  noise(1.2, .12, 'lowpass', 4000, 1, 0, 300, .5); },
    /* element sounds */
    flame(){ noise(.5, .5, 'lowpass', 1400, .8, 0, 300); voice('sawtooth', 160, 60, .4, .16, 0, 'both'); },
    zap(){ voice('square', 2200, 500, .09, .2, 0, 'dry'); noise(.12, .3, 'highpass', 3800, .9);
           voice('sawtooth', 900, 240, .1, .14, .05, 'wet'); },
    water(){ noise(.55, .42, 'bandpass', 700, 1.1, 0, 2400); voice('sine', 320, 140, .5, .16, 0, 'both'); },
    crystal(){ [1560, 2340, 3120].forEach((f,i)=> voice('sine', f, f*.995, .5, .13/(i+1), i*.03, 'both')); noise(.2, .2, 'highpass', 5000, 1.4); },
    void(){ voice('sine', 70, 42, 1.0, .3, 0, 'wet'); voice('triangle', 300, 120, .7, .09, .1, 'both', -20); noise(.8, .12, 'lowpass', 700, 1); },
    /* ui */
    tick(){ voice('square', 1400, 900, .035, .1, 0, 'dry'); },
    ok(){ [523,784,1046].forEach((f,i)=> voice('triangle', f, f, .16, .14, i*.075, 'both')); },
    fail(){ voice('sawtooth', 220, 90, .5, .18, 0, 'wet'); voice('square', 160, 70, .4, .1, .05, 'dry'); }
  };

  function play(name){
    if(!on) return;
    if(!init()) return;
    if(ctx.state === 'suspended') ctx.resume();
    const fn = P[name]; if(fn) try { fn(); } catch(e){}
  }
  return {
    play,
    toggle(){ on = !on; if(on) play('tick'); return on; },
    get enabled(){ return on; },
    unlock(){ unlocked = true; if(init() && ctx.state==='suspended') ctx.resume(); }
  };
})();

/* ============================================================
   SOUND BANK  ·  recorded cues
   Composite cues built from Kenney CC0 source libraries
   (Sci-Fi Sounds, Interface Sounds, Digital Audio) — layered,
   pitched, filtered and loudness-matched offline. All CC0 1.0,
   so the files may be redistributed with this project.
   If the files fail to load (e.g. opened straight from disk on
   some browsers) every call falls back to the synthesised bank.
   ============================================================ */
const Sound = (() => {
  const BASE = 'assets/audio/';
  const NAMES = ['chirp','crank','warp','charge','impact','clank','glitch','timefreeze',
                 'flame','zap','water','crystal','void','tick','ok','fail','ko'];
  let ctx, master, on = true, ready = false, buffers = {}, failed = false, loading = null;

  function init(){
    if(ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = .9; master.connect(ctx.destination);
    return ctx;
  }

  function load(){
    if(loading) return loading;
    if(!init()) { failed = true; return Promise.resolve(); }
    loading = Promise.all(NAMES.map(n => fetch(BASE + n + '.mp3')
      .then(r => { if(!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then(b => new Promise((res, rej) => ctx.decodeAudioData(b, res, rej)))
      .then(buf => { buffers[n] = buf; })
      .catch(() => {})
    )).then(() => { ready = Object.keys(buffers).length > 0; failed = !ready; });
    return loading;
  }

  function play(name){
    if(!on) return;
    if(!init()) return;
    if(ctx.state === 'suspended') ctx.resume();
    const buf = buffers[name];
    if(buf){
      const src = ctx.createBufferSource();
      src.buffer = buf;
      // tiny per-play variation so repeats don't sound machine-gunned
      src.playbackRate.value = 1 + (Math.random() - 0.5) * 0.05;
      const g = ctx.createGain(); g.gain.value = 1;
      src.connect(g); g.connect(master);
      src.start();
      return;
    }
    if(!ready && !failed) load();          // first call boots the bank
    SynthSound.play(name);                 // immediate fallback / pre-load response
  }

  return {
    play,
    load,
    toggle(){ on = !on; if(on) play('tick'); return on; },
    get enabled(){ return on; },
    get usingFiles(){ return ready; },
    unlock(){ if(init() && ctx.state === 'suspended') ctx.resume(); }
  };
})();

const sfx = n => Sound.play(n);

/* ------------------------------------------------------------
   3 · HUD
   ------------------------------------------------------------ */
(function hud(){
  const prog = $('#prog');
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    prog.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
  };
  addEventListener('scroll', onScroll, {passive:true}); addEventListener('resize', onScroll); onScroll();

  const sb = $('#soundBtn');
  sb.addEventListener('click', ()=>{
    const e = Sound.toggle();
    sb.textContent = e ? '♪' : '✕';
    sb.setAttribute('aria-pressed', String(e));
    toast(e ? 'Sound on' : 'Sound off');
  });

  const clock = $('#clock');
  if(clock){
    const t = () => clock.textContent = new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date()) + ' local';
    t(); setInterval(t, 1000);
  }
})();

let toastT;
function toast(msg){
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(()=> t.classList.remove('on'), 2000);
}

/* ------------------------------------------------------------
   4 · WARP — hologram transformation
   ------------------------------------------------------------ */
const Warp = (() => {
  const el = id => document.getElementById(id);
  const W = { wrap:el('warp'), sky:el('wSky'), grid:el('wGrid'), rays:el('wRays'), hud:el('wHud'),
    scan:el('wScan'), sil:el('wSil'), real:el('wReal'), img:el('wImg'), slices:el('wSlices'),
    name:el('wName'), sub:el('wSub'), bar:el('wBar'), fill:el('wBarFill'),
    glitch:el('wGlitch'), flash:el('wFlash'), black:el('wBlack'), skip:el('wSkip') };
  let running = false, skipped = false, alien = null;

  function reset(){
    W.black.style.opacity = 1;
    W.flash.style.opacity = 0;
    W.sky.style.opacity = 0;
    W.grid.style.cssText = 'opacity:0;transform:perspective(700px) rotateX(74deg) translateY(28%)';
    W.rays.style.cssText = 'opacity:0;transform:scale(.2)';
    W.hud.style.opacity = 0; W.hud.textContent = 'SCANNING DNA · HOLD STILL';
    W.scan.style.opacity = 0; W.scan.style.top = '85%';
    W.sil.style.opacity = 0; W.sil.style.backgroundImage = '';
    W.real.style.opacity = 0; W.img.style.cssText = '';
    W.slices.innerHTML = ''; W.slices.style.opacity = 0;
    W.name.style.opacity = 0; W.name.style.transform = 'translate(-50%,6%) scale(.7)';
    W.sub.style.opacity = 0; W.bar.style.opacity = 0;
    W.fill.style.transition = 'none'; W.fill.style.width = '0%';
    W.glitch.style.opacity = 0;
    setAccent(alien);
    W.img.src = alien.img; W.img.alt = alien.name + ' transformation';
    W.name.textContent = alien.name.toUpperCase();
  }

  function setProgress(p){ W.fill.style.width = p + '%'; }

  async function run(a){
    if(running) return;
    alien = a; running = true; skipped = false;
    body.classList.add('busy');
    W.wrap.classList.add('on'); W.wrap.setAttribute('aria-hidden','false');
    reset();
    sfx('crank'); setTimeout(()=>sfx('chirp'), 180);

    await wait(320);

    /* 1 — the world boots up: sky, floor grid, rays */
    W.black.style.transition = 'opacity .5s ease-out'; W.black.style.opacity = 0;
    W.sky.style.transition = 'opacity .5s ease-out'; W.sky.style.opacity = 1;
    W.grid.style.transition = 'opacity .6s ease-out, transform 1.2s cubic-bezier(.16,1,.3,1)';
    requestAnimationFrame(()=> {
      W.grid.style.opacity = .5;
      W.grid.style.transform = 'perspective(700px) rotateX(74deg) translateY(0)';
    });
    W.bar.style.transition = 'opacity .3s'; W.bar.style.opacity = 1;
    setProgress(12);

    /* 2 — DNA scan sweeps up over a black silhouette */
    await wait(420);
    W.hud.style.transition = 'opacity .25s'; W.hud.style.opacity = .9;
    W.sil.style.backgroundImage = `url(${alien.img})`;
    W.sil.style.backgroundSize = 'contain';
    W.sil.style.backgroundRepeat = 'no-repeat';
    W.sil.style.backgroundPosition = 'center';
    W.sil.style.opacity = .95;
    sfx('charge');
    W.scan.style.transition = 'opacity .2s';
    W.scan.style.opacity = 1;
    W.scan.style.transition = 'opacity .2s, top 1.05s cubic-bezier(.4,0,.6,1)';
    requestAnimationFrame(()=>{ W.scan.style.top = '-26vh'; });
    W.rays.style.transition = 'opacity .6s ease-out, transform 1.4s cubic-bezier(.16,1,.3,1)';
    requestAnimationFrame(()=>{ W.rays.style.opacity = .22; W.rays.style.transform = 'scale(1) rotate(20deg)'; });
    setProgress(38);

    await wait(560);
    /* 3 — silhouette floods with colour, bottom-up */
    W.sil.style.transition = 'opacity .8s ease-out';
    W.sil.style.opacity = 0;
    W.real.style.transition = 'opacity .45s ease-out';
    W.real.style.opacity = 1;
    W.img.style.clipPath = 'inset(100% 0 0 0)';
    W.img.style.transition = 'clip-path 1.0s cubic-bezier(.16,1,.3,1)';
    W.img.style.filter = `drop-shadow(0 0 34px ${alien.accent}) contrast(1.1) saturate(1.15)`;
    requestAnimationFrame(()=>{ W.img.style.clipPath = 'inset(0% 0 0 0)'; });
    setProgress(64);
    W.hud.textContent = 'FORM LOCKED · ' + alien.role.toUpperCase();

    await wait(760);
    if(skipped) return finish();

    /* 4 — slice glitch + snap */
    sfx('glitch');
    const n = 8;
    W.slices.style.opacity = 1;
    W.slices.innerHTML = '';
    for(let i=0;i<n;i++){
      const s = document.createElement('div');
      s.className = 'warp__slice';
      s.style.top = (i * (100/n)) + '%';
      s.style.height = (100/n) + '%';
      s.style.backgroundImage = `url(${alien.img})`;
      s.style.backgroundSize = '100% auto';
      s.style.backgroundPosition = `center ${-(i * (100/n)) / (100/n) * 100 / n * 0}px`;
      s.style.backgroundPositionY = `${-(i * (100/n))}%`;
      s.style.backgroundSize = 'contain';
      s.style.backgroundRepeat = 'no-repeat';
      s.style.transform = `translateX(${(Math.random()*2-1)*36}px)`;
      s.style.mixBlendMode = 'screen';
      s.style.opacity = '.85';
      W.slices.appendChild(s);
      setTimeout(()=>{ s.style.transition = 'transform .18s ease-out, opacity .2s'; s.style.transform = 'translateX(0)'; s.style.opacity = '0'; }, 90 + i*22);
    }
    W.glitch.style.transition = 'opacity .08s'; W.glitch.style.opacity = .4;
    await wait(120); W.glitch.style.opacity = 0;
    await wait(220);
    W.slices.innerHTML = ''; W.slices.style.opacity = 0;

    /* 5 — name slam */
    sfx('impact');
    W.name.style.transition = 'none';
    W.name.style.transform = 'translate(-50%,6%) scale(2.4)';
    W.name.style.opacity = 0;
    requestAnimationFrame(()=>{
      W.name.style.transition = 'transform .4s cubic-bezier(.2,1.6,.4,1), opacity .1s';
      W.name.style.opacity = 1;
      W.name.style.transform = 'translate(-50%,0) scale(1)';
    });
    setProgress(88);

    await wait(420);
    W.sub.style.transition = 'opacity .3s'; W.sub.style.opacity = 1;
    document.dispatchEvent(new CustomEvent('omni:form', {detail: alien}));

    await wait(460);
    if(skipped) return finish();

    /* 6 — white-out and hand back to the page */
    sfx('warp');
    setProgress(100);
    W.flash.style.transition = 'opacity .1s linear'; W.flash.style.opacity = 1;
    await wait(120);
    W.flash.style.transition = 'opacity .55s ease-out'; W.flash.style.opacity = 0;
    await wait(140);
    finish();
  }

  function finish(){
    body.classList.remove('busy');
    W.wrap.classList.remove('on'); W.wrap.setAttribute('aria-hidden','true');
    running = false;
    setAccent(alien);
    const meta = document.querySelector('meta[name="theme-color"]');
    if(meta) meta.setAttribute('content', alien.accent);
    toast(alien.name.toUpperCase() + ' — transformation complete');
  }

  W.skip.addEventListener('click', ()=>{ skipped = true; if(running) finish(); });
  addEventListener('keydown', e => { if(e.key === 'Escape' && running){ skipped = true; finish(); } });

  return { run, get running(){ return running; } };
})();

/* ------------------------------------------------------------
   5 · DEX
   ------------------------------------------------------------ */
const Dex = (() => {
  const wheel = $('#wheel');
  const state = { i: 0 };

  ALIENS.forEach((a, i) => {
    const ang = (-90 + i * (360 / ALIENS.length)) * Math.PI / 180;
    const rad = 36;
    const b = document.createElement('button');
    b.className = 'chip'; b.dataset.id = a.id; b.dataset.tags = a.tags.join(' ');
    b.style.left = `calc(50% + ${(Math.cos(ang) * rad).toFixed(3)}%)`;
    b.style.top  = `calc(50% + ${(Math.sin(ang) * rad).toFixed(3)}%)`;
    b.setAttribute('aria-label', `Select ${a.name}, ${a.role}`);
    b.innerHTML = `<img src="${a.img}" alt=""><span class="chip__n">${a.name}</span>`;
    b.addEventListener('click', ()=>{ sfx('tick'); select(i, true); });
    wheel.appendChild(b);
  });

  function select(i, live){
    state.i = i;
    const a = ALIENS[i];
    $('#dexImg').src = a.img; $('#dexImg').alt = `${a.name} — ${a.role}`;
    $('#dexNo').textContent = a.no;
    $('#dexName').textContent = a.name;
    $('#dexRole').textContent = a.role;
    $('#dexText').textContent = a.text;
    $('#dexCount').textContent = String(i+1).padStart(2,'0') + ' / ' + String(ALIENS.length).padStart(2,'0');
    $('#dexStats').innerHTML = Object.entries(a.stats).map(([k,v])=>`
      <div class="stat"><span>${k}</span>
        <span class="stat__track"><span class="stat__fill" data-v="${v}"></span></span><b>${v}</b></div>`).join('');
    $('#dexPows').innerHTML = a.powers.map(p=>`<span>${p}</span>`).join('');
    $$('.chip').forEach(c => c.classList.toggle('on', c.dataset.id === a.id));
    if(live) setAccent(a);
    requestAnimationFrame(()=> $$('#dexStats .stat__fill').forEach(f => f.style.inset = `0 ${100 - (+f.dataset.v)}% 0 0`));
  }

  $$('[data-filter]').forEach(b => b.addEventListener('click', ()=>{
    sfx('tick');
    $$('[data-filter]').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    const f = b.dataset.filter;
    $$('.chip').forEach(c => {
      const show = f === 'all' || c.dataset.tags.includes(f);
      c.style.opacity = show ? 1 : .16;
      c.style.pointerEvents = show ? '' : 'none';
    });
  }));

  $('#goBtn').addEventListener('click', ()=> Warp.run(ALIENS[state.i]));
  $('#sendBtn').addEventListener('click', ()=>{
    Battle.setForm(ALIENS[state.i]);
    sfx('ok'); toast(ALIENS[state.i].name + ' sent to the arena');
    document.getElementById('arena').scrollIntoView({behavior:'smooth'});
  });

  select(0, false);
  return { state, get current(){ return ALIENS[state.i]; } };
})();

/* ------------------------------------------------------------
   6 · PANELS + READER
   ------------------------------------------------------------ */
(function panels(){
  const grid = $('#pagegrid');
  PANELS.forEach((p, i) => {
    const el = document.createElement('article');
    el.className = 'panel';
    el.style.setProperty('--span', p.span);
    el.style.setProperty('--rot', p.rot + 'deg');
    el.style.transitionDelay = (i % 3) * 55 + 'ms';
    el.innerHTML = `<img src="${p.img}" alt="${p.desc}" loading="lazy">
      <p class="panel__cap">${p.cap}</p><span class="panel__sfx">${p.sfx}</span>`;
    el.addEventListener('click', ()=>{ openReader(i); });
    grid.appendChild(el);
  });
  const io = new IntersectionObserver(es => es.forEach(e => {
    if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
  }), {threshold:.16, rootMargin:'0px 0px -6% 0px'});
  $$('.panel').forEach(p => io.observe(p));

  /* reader built on the fly */
  const R = $('#reader');
  R.innerHTML = `
    <div style="position:absolute;inset:0" data-close></div>
    <div style="position:relative;z-index:2;width:min(1080px,100%);max-height:92svh;display:flex;flex-direction:column;
      background:var(--paper);border:3px solid var(--paper);box-shadow:14px 14px 0 rgba(0,0,0,.6);margin:auto">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:7px 11px;
        background:#08090C;color:#EFE7D6;font-size:9px;letter-spacing:.2em;text-transform:uppercase;border-bottom:3px solid #08090C">
        <span>Issue 001 · <b id="rCount" style="color:var(--accent)">Panel 1 of 6</b></span>
        <span style="display:flex;gap:6px">
          <button id="rPrev" aria-label="Previous" style="width:30px;height:26px;border:2px solid #EFE7D6;display:grid;place-items:center">◂</button>
          <button id="rNext" aria-label="Next" style="width:30px;height:26px;border:2px solid #EFE7D6;display:grid;place-items:center">▸</button>
          <button data-close aria-label="Close" style="width:30px;height:26px;border:2px solid #EFE7D6;display:grid;place-items:center">✕</button>
        </span>
      </div>
      <div style="background:#05070b;overflow:auto;flex:1"><img id="rImg" src="" alt="" style="width:100%;max-height:72svh;object-fit:contain;margin:auto"></div>
      <div id="rCap" style="padding:13px 16px;color:var(--ink);font-size:12.5px;line-height:1.65;max-width:72ch"></div>
    </div>`;

  let idx = 0, lastFocus = null;
  const render = () => {
    const p = PANELS[idx];
    $('#rImg').src = p.img; $('#rImg').alt = p.desc;
    $('#rCap').innerHTML = `<b style="font-family:var(--dia);font-size:18px;letter-spacing:.03em;display:block;margin-bottom:2px;text-transform:uppercase">${p.cap}</b>${p.desc}`;
    $('#rCount').textContent = `Panel ${idx+1} of ${PANELS.length}`;
  };
  function openReader(i){
    idx = i; lastFocus = document.activeElement; render();
    R.classList.add('on'); R.setAttribute('aria-hidden','false'); body.classList.add('busy');
    sfx('warp'); $('#rNext').focus({preventScroll:true});
  }
  function close(){
    R.classList.remove('on'); R.setAttribute('aria-hidden','true'); body.classList.remove('busy');
    lastFocus?.focus?.({preventScroll:true});
  }
  const step = d => { idx = (idx + d + PANELS.length) % PANELS.length; render(); sfx('tick'); };
  $('#readBtn').addEventListener('click', ()=> openReader(0));
  $('#rPrev').addEventListener('click', ()=> step(-1));
  $('#rNext').addEventListener('click', ()=> step(1));
  R.addEventListener('click', e => { if(e.target.closest('[data-close]')) close(); });
  addEventListener('keydown', e => {
    if(!R.classList.contains('on')) return;
    if(e.key === 'Escape') close();
    if(e.key === 'ArrowRight') step(1);
    if(e.key === 'ArrowLeft') step(-1);
  });
})();

/* ------------------------------------------------------------
   7 · BATTLE
   ------------------------------------------------------------ */
const Battle = (() => {
  const el = id => document.getElementById(id);
  let form = ALIENS[0], heroHP = 100, villainHP = VILLAIN.hp, busy = false, over = false, frozen = false, combo = 0;

  function setForm(a){ form = a; reset(); }

  function paint(){
    el('heroFighterImg').src = form.img;
    el('heroFighterImg').alt = form.name;
    el('heroName').textContent = form.name;
    el('heroRole').textContent = form.role;
    el('hpHero').style.width = Math.max(0, heroHP) + '%';
    el('hpVill').style.width = Math.max(0, (villainHP / VILLAIN.hp) * 100) + '%';
  }

  function moves(){
    const wrap = el('moves');
    wrap.innerHTML = '';
    form.moves.forEach(m => {
      const b = document.createElement('button');
      b.className = 'movebtn'; b.textContent = m.n;
      b.addEventListener('click', ()=> attack(m));
      wrap.appendChild(b);
    });
  }

  function log(html, who='hero'){
    const d = document.createElement('div');
    d.innerHTML = html;
    el('battleLog').prepend(d);
    el('battleLog').scrollTop = 0;
  }

  function showCombo(text){
    const c = el('combo');
    c.textContent = text;
    c.classList.remove('on'); void c.offsetWidth; c.classList.add('on');
  }

  function hit(side, dmg){
    const f = side === 'hero' ? el('fHero') : el('fVill');
    f.classList.remove('is-hit'); void f.offsetWidth; f.classList.add('is-hit');
    showCombo(side === 'vill' ? `${dmg} DMG!` : `-${dmg} HP`);
  }

  async function attack(m){
    if(busy || over) return;
    busy = true; sfx(m.s);
    const dmg = m.d[0] + Math.floor(Math.random() * (m.d[1] - m.d[0] + 1));
    combo++;
    villainHP -= dmg;
    hit('vill', dmg);
    log(`<b>${form.name}</b> used <b>${m.n}</b> — <b>${dmg}</b> damage.`, 'hero');
    if(m.heal){ heroHP = Math.min(100, heroHP + m.heal); log(`<b>${form.name}</b> absorbed ${m.heal} HP from the void.`); }
    if(m.recoil){ heroHP = Math.max(0, heroHP - m.recoil); log(`Recoil! <b>${form.name}</b> took ${m.recoil}.`); }
    paint();
    await wait(420);
    if(villainHP <= 0) return win();

    /* Kronikk cheats when cornered */
    if(villainHP < VILLAIN.hp * .34 && !frozen){
      frozen = true;
      sfx('timefreeze');
      log(`<span class="vill">Kronikk</span> stops time. Everything goes quiet.`, 'vill');
      showCombo('TIME STOP!');
      await wait(700);
      villainHP = Math.min(VILLAIN.hp, villainHP + 14);
      paint();
      log(`<span class="vill">Kronikk</span> rewound his own plating (+14).`, 'vill');
      await wait(500);
      log(`Your turn is gone.`, 'vill');
      busy = false;
      return;
    }

    /* enemy turn */
    await wait(120);
    const pool = VILLAIN.moves;
    const mv = pool[Math.floor(Math.random()*pool.length)];
    const edmg = mv.d[0] + Math.floor(Math.random() * (mv.d[1] - mv.d[0] + 1));
    sfx(mv.s);
    heroHP = Math.max(0, heroHP - edmg);
    hit('hero', edmg);
    log(`<span class="vill">Kronikk</span> used <b>${mv.n}</b> — you take <b>${edmg}</b>.`, 'vill');
    paint();
    await wait(360);
    if(heroHP <= 0) return lose();
    busy = false;
  }

  function win(){
    over = true; busy = false;
    sfx('ko');
    log(`<b>KRONIK DOWN.</b> The hour he stole runs backwards into the street.`, 'hero');
    showCombo('K.O.!');
    [...el('moves').children].forEach(b => b.disabled = true);
  }
  function lose(){
    over = true; busy = false;
    sfx('ko');
    log(`<span class="vill">You're out.</span> Hit restart — the watch owes you one.`, 'vill');
    showCombo('KO…');
    [...el('moves').children].forEach(b => b.disabled = true);
  }

  function reset(){
    heroHP = 100; villainHP = VILLAIN.hp; busy = false; over = false; frozen = false; combo = 0;
    el('battleLog').innerHTML = '';
    paint(); moves();
    log(`<b>${form.name}</b> steps into the street. <span class="vill">Kronikk</span> is already four seconds ahead.`, 'hero');
  }

  el('resetBattle').addEventListener('click', ()=>{ sfx('tick'); reset(); toast('Fight restarted'); });
  addEventListener('omni:form', e => { if(ALIENS.includes(e.detail)) setForm(e.detail); });
  reset();

  return { setForm, reset };
})();

/* ------------------------------------------------------------
   8 · SFX LAB
   ------------------------------------------------------------ */
$$('.sfxbtn').forEach(b => b.addEventListener('click', ()=>{
  sfx(b.dataset.sfx);
  b.classList.remove('on'); void b.offsetWidth; b.classList.add('on');
}));
/* reveal the recorded bank once decoded */
Sound.load().then(()=>{ if(Sound.usingFiles) document.documentElement.dataset.audio = 'recorded'; });

/* ------------------------------------------------------------
   9 · PANEL FORGE (canvas)
   ------------------------------------------------------------ */
(function forge(){
  const cv = $('#cv'); if(!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const st = { text: $('#capText').value, spec:'alien-cinder', fx:'THOOM!', ink:'#FFD400', ang:-2.5 };
  const cache = {};
  const load = src => cache[src] ? Promise.resolve(cache[src]) : new Promise(res => {
    const im = new Image();
    im.onload = ()=>{ cache[src] = im; res(im); };
    im.onerror = ()=> res(null);
    im.src = src;
  });
  function dots(x,y,w,h,color,alpha,step){
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color;
    for(let yy=y; yy<y+h; yy+=step) for(let xx=x; xx<x+w; xx+=step){
      const r = 1.1 + 1.3 * Math.abs(Math.sin((xx+yy)*.05));
      ctx.beginPath(); ctx.arc(xx,yy,r,0,7); ctx.fill();
    }
    ctx.restore();
  }
  function starburst(cx,cy,r,color,spikes=18){
    ctx.save(); ctx.fillStyle = color; ctx.beginPath();
    for(let i=0;i<spikes*2;i++){
      const a = (Math.PI/spikes)*i, rr = i%2 ? r : r*.6;
      ctx.lineTo(cx+Math.cos(a)*rr, cy+Math.sin(a)*rr);
    }
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function wrapText(text, maxW){
    const words = text.split(/\s+/); const out = []; let line = '';
    words.forEach(w => {
      const t = line ? line + ' ' + w : w;
      if(ctx.measureText(t).width > maxW && line){ out.push(line); line = w; } else line = t;
    });
    if(line) out.push(line);
    return out;
  }
  async function draw(){
    const im = await load('assets/' + st.spec + '.jpg');
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = '#08090C'; ctx.fillRect(0,0,W,H);
    if(im){
      const s = Math.max(W/im.width, H/im.height);
      const dw = im.width*s, dh = im.height*s;
      ctx.drawImage(im, (W-dw)/2 + Math.sin(st.ang)*10, (H-dh)/2 + Math.cos(st.ang)*5, dw, dh);
      const g = ctx.createRadialGradient(W/2, H*.45, H*.18, W/2, H*.5, H*.95);
      g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,.55)');
      ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
      dots(0,0,W,H,'#08090C',.15,6);
    }
    /* caption */
    ctx.save(); ctx.translate(66,42); ctx.rotate(st.ang*Math.PI/180);
    ctx.font = '700 21px "Mono", monospace';
    const lines = wrapText(st.text.toUpperCase(), 540);
    const bw = Math.min(600, Math.max(...lines.map(l=>ctx.measureText(l).width)) + 40);
    const bh = lines.length*29 + 24;
    ctx.fillStyle = st.ink; ctx.strokeStyle = '#08090C'; ctx.lineWidth = 5;
    ctx.fillRect(0,0,bw,bh); ctx.strokeRect(0,0,bw,bh);
    ctx.fillStyle = '#08090C';
    lines.forEach((l,i)=> ctx.fillText(l, 20, 32 + i*29));
    ctx.restore();
    /* sfx */
    if(st.fx !== 'none'){
      ctx.save(); ctx.translate(W-245, H-145); ctx.rotate(-8*Math.PI/180);
      starburst(0,0,166,'#08090C'); starburst(0,0,148,st.ink);
      ctx.font = '110px "Bangers", Impact, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(8,9,12,.5)'; ctx.fillText(st.fx, 8, 11);
      ctx.lineJoin = 'round';
      ctx.lineWidth = 15; ctx.strokeStyle = '#08090C'; ctx.strokeText(st.fx, 0, 0);
      ctx.fillStyle = st.ink; ctx.fillText(st.fx, 0, 0);
      ctx.restore();
    }
    ctx.strokeStyle = '#08090C'; ctx.lineWidth = 10; ctx.strokeRect(5,5,W-10,H-10);
    /* corner stamp */
    ctx.save();
    ctx.fillStyle = '#08090C'; ctx.fillRect(W-206, 0, 206, 32);
    ctx.font = '700 13px "Mono", monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillStyle = st.ink;
    ctx.fillText('OMNIVERSE · ' + st.spec.split('-')[1].toUpperCase(), W-103, 17);
    ctx.restore();
  }

  $('#capText').addEventListener('input', e => { st.text = e.target.value || '…'; draw(); });
  $$('#specOpts .opt').forEach(b => b.addEventListener('click', ()=>{
    $$('#specOpts .opt').forEach(x=>x.classList.remove('on')); b.classList.add('on');
    st.spec = b.dataset.spec; sfx('tick'); draw();
  }));
  $$('#fxOpts .opt').forEach(b => b.addEventListener('click', ()=>{
    $$('#fxOpts .opt').forEach(x=>x.classList.remove('on')); b.classList.add('on');
    st.fx = b.dataset.fx; sfx('tick'); draw();
  }));
  $$('#inkOpts .sw').forEach(b => b.addEventListener('click', ()=>{
    $$('#inkOpts .sw').forEach(x=>x.classList.remove('on')); b.classList.add('on');
    st.ink = b.dataset.ink; sfx('tick'); draw();
  }));
  $('#rerollBtn').addEventListener('click', ()=>{ st.ang = Math.random()*6-3; sfx('glitch'); draw(); toast('Angle rerolled'); });
  $('#dlBtn').addEventListener('click', ()=>{
    let data;
    try { data = cv.toDataURL('image/png'); }
    catch(e){ sfx('fail'); toast('Export blocked — open over http (GitHub Pages)'); return; }
    const a = document.createElement('a');
    a.download = 'omniverse-panel.png'; a.href = data;
    document.body.appendChild(a); a.click(); a.remove();
    sfx('ok'); toast('Panel downloaded');
  });
  $('#bform').addEventListener('submit', e => e.preventDefault());
  if(document.fonts?.ready) document.fonts.ready.then(draw); else addEventListener('load', draw);
  draw();
})();

/* ------------------------------------------------------------
   10 · HERO — watch, keyboard, parallax
   ------------------------------------------------------------ */
(function hero(){
  const watch = $('#watch'), art = $('#heroArt');

  function slap(){
    if(Warp.running) return;
    watch.classList.add('charging');
    sfx('crank');
    setTimeout(()=>sfx('chirp'), 220);
    setTimeout(()=>{
      watch.classList.remove('charging');
      watch.classList.remove('is-hit'); void watch.offsetWidth; watch.classList.add('is-hit');
      const cur = Dex.current.id;
      const pool = ALIENS.filter(a => a.id !== cur);
      const pick = Math.random() < .5 ? Dex.current : pool[Math.floor(Math.random()*pool.length)];
      Warp.run(pick);
    }, 520);
  }
  watch.addEventListener('click', slap);
  $('#transformBtn').addEventListener('click', ()=>{
    if(Warp.running) return;
    watch.classList.add('is-hit'); void watch.offsetWidth;
    Warp.run(Dex.current);
  });
  addEventListener('keydown', e => {
    if(e.target.matches('input,textarea')) return;
    if((e.key === 't' || e.key === 'T') && !Warp.running){ e.preventDefault(); Warp.run(Dex.current); }
  });

  /* tilt the watch toward the pointer */
  let raf = null;
  addEventListener('pointermove', e => {
    if(matchMedia('(pointer:coarse)').matches || REDUCE) return;
    const nx = (e.clientX / innerWidth - .5), ny = (e.clientY / innerHeight - .5);
    if(raf) return;
    raf = requestAnimationFrame(()=>{
      watch.style.transform = `rotateX(${(16 - ny*16).toFixed(1)}deg) rotateY(${(-14 + nx*26).toFixed(1)}deg)`;
      art.style.transform = `scale(1.07) translate(${nx*-16}px,${ny*-10}px)`;
      raf = null;
    });
  }, {passive:true});
})();

/* ------------------------------------------------------------
   11 · CHAOS + MISC
   ------------------------------------------------------------ */
(function misc(){
  let chaos = false;
  const cb = $('#chaosBtn');
  cb.addEventListener('click', ()=>{
    chaos = !chaos;
    cb.setAttribute('aria-pressed', String(chaos));
    sfx(chaos ? 'charge' : 'tick');
    chaos ? (document.documentElement.style.setProperty('--accent','#FFD400'),
             document.documentElement.style.setProperty('--accent-deep','#7A5B00'))
          : setAccent(Dex.current);
    $$('.panel').forEach(p => p.style.setProperty('--rot', chaos ? (Math.random()*4-2).toFixed(2)+'deg' : (PANELS[+p.dataset.i]?.rot ?? 0)+'deg'));
    $$('.panel').forEach((p,i) => p.style.setProperty('--rot', chaos ? (Math.random()*4-2).toFixed(2)+'deg' : (PANELS[i]?.rot ?? 0)+'deg'));
    toast(chaos ? 'CHAOS MODE' : 'Chaos off');
  });

  const io = new IntersectionObserver(es => es.forEach(e=>{
    if(e.isIntersecting){ e.target.style.opacity = 1; e.target.style.transform='none'; io.unobserve(e.target); }
  }), {threshold:.12});
  $$('.sechead, .dexgrid, .builder, .vs, .sfxgrid').forEach(el => {
    el.style.opacity = 0; el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity .55s cubic-bezier(.16,1,.3,1), transform .55s cubic-bezier(.2,1.3,.4,1)';
    io.observe(el);
  });

  const f = $('#subForm');
  f.addEventListener('submit', e => {
    e.preventDefault(); sfx('ok');
    $('#subNote').textContent = 'Demo form — nothing was sent. Wire it to your provider.';
    f.reset(); toast('Subscribed (demo)');
  });

  ['pointerdown','keydown','touchstart'].forEach(ev =>
    addEventListener(ev, ()=> { Sound.unlock(); Sound.load(); }, {once:true}));
})();

window.Omniverse = { Warp, Dex, Battle, Sound, ALIENS };
})();
