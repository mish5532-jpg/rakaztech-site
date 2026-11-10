// Rakaz Tech — one-shot cinematic section.
// Scroll drives a single continuous camera move: an extruded RAKAZ wordmark with gloss and shadow,
// a fixed title whose line underneath swaps, a wall of work/service cards the camera flies over,
// and one card that drops forward to open the services section. Motion blur follows scroll speed.
(function () {
  const host = document.getElementById('cinema');
  if (!host) return;
  const css = `
#cinema{position:relative;height:320vh;background:#f5f5f7}
#cinema .cstage{position:sticky;top:0;height:100vh;height:100svh;overflow:hidden;background:radial-gradient(110% 80% at 50% 0%,#14244b 0%,#0B1A3A 45%,#05070d 100%);perspective:1200px;perspective-origin:50% 40%;color:#fff}
#cinema .grid{position:absolute;inset:-20%;background-image:linear-gradient(rgba(45,124,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(45,124,255,.08) 1px,transparent 1px);background-size:60px 60px;transform:rotateX(60deg) translateY(30%);transform-origin:50% 100%;mask-image:radial-gradient(60% 60% at 50% 60%,#000,transparent)}
#cinema .top{position:absolute;inset-inline:0;top:0;padding:96px 20px 60px;text-align:center;z-index:3;pointer-events:none;background:linear-gradient(#0d1a38 0%,rgba(11,26,58,.9) 60%,rgba(11,26,58,0) 100%)}
#cinema .k{display:inline-block;font:600 12px var(--en);letter-spacing:.35em;color:#2D7CFF;border:1px solid rgba(45,124,255,.5);padding:6px 14px;border-radius:999px}
#cinema h2{margin:14px 0 0;font-size:clamp(34px,6vw,64px);line-height:1.1;font-weight:700;letter-spacing:-.02em}
#cinema .swap{position:relative;height:42px;margin-top:10px}
#cinema .swap span{position:absolute;inset-inline:0;font-size:clamp(19px,2.6vw,26px);color:#9db8ff;opacity:0;transform:translateY(28px) scaleY(1.3);filter:blur(10px);transition:opacity .45s,transform .55s var(--ease),filter .45s}
#cinema .swap span.on{opacity:1;transform:none;filter:none}
#cinema .swap span.out{opacity:0;transform:translateY(-28px) scaleY(1.3);filter:blur(10px)}
#cinema .logo3d{position:absolute;left:50%;top:54%;width:0;height:0;transform-style:preserve-3d;z-index:2;will-change:transform}
#cinema .logo3d svg,#cinema .sheen{position:absolute;left:0;top:0;width:min(78vw,640px);aspect-ratio:492/132;height:auto;backface-visibility:hidden}
#cinema .logo3d .front{filter:drop-shadow(0 0 1px rgba(255,255,255,.4))}
#cinema .sheen{transform:translate(-50%,-50%) translateZ(1px);background:linear-gradient(115deg,transparent 35%,rgba(255,255,255,.55) 47%,transparent 58%);background-size:260% 100%;animation:rzSheen 5s ease-in-out infinite;mix-blend-mode:overlay;-webkit-mask:var(--m) center/100% 100% no-repeat;mask:var(--m) center/100% 100% no-repeat}
@keyframes rzSheen{0%,100%{background-position:100% 0}50%{background-position:0 0}}
#cinema .shadow{position:absolute;left:50%;top:54%;width:min(70vw,560px);height:70px;transform:translate(-50%,calc(min(78vw,640px)*.16 + 34px));background:radial-gradient(50% 50% at 50% 50%,rgba(45,124,255,.45),transparent 70%);filter:blur(10px);z-index:1}
#cinema .wall{position:absolute;left:50%;top:50%;width:1040px;display:grid;grid-template-columns:repeat(4,240px);gap:26px;transform-style:preserve-3d;will-change:transform,filter;z-index:1}
#cinema .wc{height:300px;border-radius:24px;overflow:hidden;background:#101c3a;border:1px solid rgba(255,255,255,.08);box-shadow:0 40px 80px rgba(0,0,0,.45);position:relative;display:flex;flex-direction:column;justify-content:flex-end;padding:20px}
#cinema .wc img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top;opacity:.9}
#cinema .wc.img::after{content:"";position:absolute;inset:0;background:linear-gradient(transparent 45%,rgba(5,7,13,.85))}
#cinema .wc b,#cinema .wc small{position:relative;z-index:1}
#cinema .wc b{font-size:22px;line-height:1.2}#cinema .wc small{color:#9db8ff;font-size:14px}
#cinema .wc i{position:relative;z-index:1;font-style:normal;font-size:44px;margin-bottom:auto}
#cinema .wc.b{background:#2D7CFF}#cinema .wc.b small{color:#e6efff}
#cinema .wc.w{background:#fbfbfd;color:#0B1A3A}#cinema .wc.w small{color:#2D7CFF}
#cinema .drop{position:absolute;left:50%;top:50%;width:min(92vw,720px);height:min(60vh,420px);border-radius:30px;background:#f5f5f7;color:#0B1A3A;transform:translate(-50%,-50%);z-index:5;will-change:transform;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;opacity:0;text-align:center;padding:24px;box-shadow:0 50px 120px rgba(0,0,0,.5)}
#cinema .drop b{font-size:clamp(28px,4vw,44px);line-height:1.15}#cinema .drop a{background:#0a5cff;color:#fff;padding:12px 26px;border-radius:999px;font-size:17px;margin-top:8px}
#cinema .hint{position:absolute;inset-inline:0;bottom:34px;text-align:center;font-size:13px;color:#7f8aa8;z-index:4;transition:opacity .3s}
@media (prefers-reduced-motion:reduce){#cinema{height:auto}#cinema .cstage{position:relative;height:auto;padding:180px 0 80px}#cinema .wall,#cinema .drop,#cinema .hint{display:none}#cinema .logo3d{position:relative;top:auto;left:50%;height:200px;transform:none}#cinema .logo3d svg,#cinema .sheen{top:100px}#cinema .shadow{display:none}}
`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const PATHS = '<path d="M40 30h46c22 0 36 13 36 32 0 15-8 26-22 30l26 28H99L76 95H62v25H40zM62 50v26h22c10 0 16-5 16-13s-6-13-16-13z"/><path d="M168 30h22l40 90h-24l-27-64-27 64h-24z"/><path d="M246 30h22v38l36-38h28l-40 41 43 49h-29l-38-44v44h-22z"/><path d="M372 30h22l40 90h-24l-27-64-27 64h-24z"/><path d="M440 30h72v18l-46 52h46v20h-74v-18l46-52h-44z"/>';
  const svg = (fill, sq, z, extra = '') => `<svg viewBox="30 22 492 132" ${extra} style="transform:translate(-50%,-50%) translateZ(${z}px)"><g fill="${fill}">${PATHS}</g><rect x="374" y="88" width="18" height="18" rx="2" fill="${sq}"/></svg>`;
  const mask = "url('data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="30 22 492 132"><g fill="#000">${PATHS}</g></svg>`) + "')";
  const N = 18;
  let logo = '';
  for (let i = N; i >= 1; i--) logo += svg(`hsl(220,${60 - i}%,${30 - i * .9}%)`, `hsl(217,90%,${42 - i}%)`, -i * 1.5);
  logo += svg('#ffffff', '#2D7CFF', 0, 'class="front"') + `<div class="sheen" style="--m:${mask}"></div>`;

  const LINES = ['مواقع ومتاجر إلكترونية', 'أنظمة محاسبة وحجوزات', 'تطبيقات آيفون وأندرويد', 'سوشال ميديا وهوية', 'أتمتة توفر وقتك'];
  const CARDS = [
    ['img', 'assets/aura-desktop.jpg', 'AuraHome', 'متجر Shopify'], ['b', '🛒', 'متاجر', 'دفع كي نت وتوصيل'], ['w', '📊', 'أنظمة', 'محاسبة وحجوزات'], ['img', 'assets/mafia-m1.jpg', 'المافيا', 'لعبة iPhone وiPad'],
    ['img', 'assets/feed-2.jpg', 'سوشال ميديا', 'محتوى وإدارة حسابات'], ['w', '📱', 'تطبيقات', 'iOS وAndroid'], ['b', '⚡', 'أتمتة', 'شغل يمشي بروحه'], ['img', 'assets/aura-mobile.jpg', 'تجربة جوال', 'سريعة ونظيفة'],
    ['w', '🎨', 'هوية', 'لوقو وألوان وخطوط'], ['img', 'assets/feed-4.jpg', 'تصوير ومونتاج', 'فيديو وريلز'], ['b', '🔍', 'SEO', 'يطلع أول بقوقل'], ['img', 'assets/mafia-m3.jpg', 'App Store', 'منشور وشغال'],
  ];
  host.innerHTML = `
<svg width="0" height="0" style="position:absolute"><filter id="rzBlur" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur id="rzBlurG" stdDeviation="0 0"/></filter></svg>
<div class="cstage">
  <div class="grid"></div>
  <div class="top"><span class="k">RAKAZ TECH</span><h2>كل شي يحتاجه شغلك</h2><div class="swap">${LINES.map((t, i) => `<span class="${i ? '' : 'on'}">${t}</span>`).join('')}</div></div>
  <div class="shadow"></div>
  <div class="logo3d">${logo}</div>
  <div class="wall">${CARDS.map(c => c[0] === 'img'
    ? `<div class="wc img"><img src="${c[1]}" alt="" loading="lazy"><b>${c[2]}</b><small>${c[3]}</small></div>`
    : `<div class="wc ${c[0]}"><i>${c[1]}</i><b>${c[2]}</b><small>${c[3]}</small></div>`).join('')}</div>
  <div class="drop"><div class="in" style="display:flex;flex-direction:column;align-items:center;gap:10px"><b>فكرتك تستاهل أساس قوي</b><span style="color:#6e6e73">نبنيها لك من الصفر، بمكان واحد</span><a href="#services">شوف خدماتنا ›</a></div></div>
  <div class="hint">اسحب لتحت ↓</div>
</div>`;

  const q = s => host.querySelector(s);
  const topEl = q('.top'), dropIn = q('.drop .in'), logoEl = q('.logo3d'), shadow = q('.shadow'), wall = q('.wall'), drop = q('.drop'), hint = q('.hint'), blurG = q('#rzBlurG');
  const spans = [...host.querySelectorAll('.swap span')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let tiltX = 0, tiltY = 0, line = 0, lastY = scrollY, vel = 0;
  addEventListener('pointermove', e => { tiltY = (e.clientX / innerWidth - .5) * 26; tiltX = (e.clientY / innerHeight - .5) * -18; }, { passive: true });
  addEventListener('deviceorientation', e => { if (e.gamma != null) { tiltY = Math.max(-20, Math.min(20, e.gamma)); tiltX = Math.max(-15, Math.min(15, (e.beta || 45) - 45)) * -.6; } }, { passive: true });
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const seg = (p, a, b) => ease(clamp((p - a) / (b - a)));
  function setLine(n) {
    if (n === line) return;
    const old = spans[line]; old.classList.remove('on'); old.classList.add('out'); setTimeout(() => old.classList.remove('out'), 500);
    line = n; spans[line].classList.add('on');
  }
  function frame(t) {
    requestAnimationFrame(frame);
    const r = host.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) { lastY = scrollY; return; }
    const p = clamp(-r.top / (host.offsetHeight - innerHeight));
    const dy = scrollY - lastY; lastY = scrollY;
    vel += (Math.abs(dy) - vel) * .25;
    const b = Math.min(16, vel * .35);
    blurG.setAttribute('stdDeviation', `0 ${b.toFixed(2)}`);
    wall.style.filter = b > .3 ? 'url(#rzBlur)' : 'none';
    const idle = Math.sin(t / 1500) * 6;
    const a = seg(p, 0, .3);
    logoEl.style.transform = `translate3d(0,${-a * 30}vh,${-a * 520}px) rotateX(${tiltX + 14 - a * 30 + idle * .3}deg) rotateY(${tiltY - 16 + idle}deg)`;
    logoEl.style.opacity = 1 - seg(p, .18, .32);
    shadow.style.opacity = (1 - a) * (.9 - Math.abs(idle) / 20);
    const k = clamp(innerWidth / 1000, .62, 1);
    const w = seg(p, .16, .78);
    wall.style.opacity = seg(p, .12, .24) * (1 - seg(p, .8, .9));
    wall.style.transform = `translate(-50%,-50%) translate3d(${(w - .5) * -260}px,${(1 - w) * 460 - 120}px,${-640 + w * 560}px) rotateX(${58 - w * 26}deg) rotateZ(${-24 + w * 18}deg) scale(${(.55 + w * .5) * k})`;
    const d = seg(p, .72, .9), e = seg(p, .92, 1);
    const cover = Math.max(innerWidth / drop.offsetWidth, innerHeight / drop.offsetHeight) * 1.06 - 1;
    drop.style.opacity = d;
    drop.style.transform = `translate(-50%,-50%) translateY(${(1 - d) * -40}vh) rotateX(${(1 - d) * 70}deg) scale(${(.35 + d * .65) * (1 + e * cover)})`;
    dropIn.style.opacity = 1 - e;
    topEl.style.opacity = 1 - seg(p, .7, .82);
    hint.style.opacity = 1 - seg(p, .04, .12);
    setLine(Math.min(LINES.length - 1, Math.floor(clamp(p / .78) * LINES.length)));
  }
  if (!reduce) requestAnimationFrame(frame);
  else { let i = 0; setInterval(() => setLine(i = (i + 1) % LINES.length), 2600); }
})();
