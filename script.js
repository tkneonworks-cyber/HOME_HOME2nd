document.addEventListener("DOMContentLoaded", ()=>{
  loadLogos();
  loadGallery("home","gallery-home.json","home-gallery");
  loadGallery("2nd","gallery-2nd.json","2nd-gallery");

  // ロゴ切替
  document.querySelectorAll('.logo-option').forEach(option=>{
    option.addEventListener('click', ()=>{
      document.querySelectorAll('.logo-option').forEach(o=>o.classList.remove('active'));
      option.classList.add('active');
      const target = option.dataset.target;

      document.querySelectorAll('.shop-section').forEach(sec=>{
        sec.classList.toggle('active', sec.id === target);
      });

      const hero = document.querySelector('.hero');
      hero.classList.toggle('hero--home', target === 'home');
      hero.classList.toggle('hero--2nd',  target === '2nd');

      document.querySelector('.hero-sns--home').classList.toggle('is-hidden', target !== 'home');
      document.querySelector('.hero-sns--2nd').classList.toggle('is-hidden', target !== '2nd');
    });
  });
});

// 初期状態（2ndを表示している前提）
document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelector('.hero-sns--home').classList.add('is-hidden');
  document.querySelector('.hero-sns--2nd').classList.remove('is-hidden');
});

/* ========== ロゴ ========== */
async function loadLogos(){
  try {
    const res = await fetch("logos.json");
    const data = await res.json();
    document.querySelector('.logo-option[data-target="home"] img').src = data.home.img;
    document.querySelector('.logo-option[data-target="home"] img').alt = data.home.alt;
    document.querySelector('.logo-option[data-target="2nd"] img').src = data["2nd"].img;
    document.querySelector('.logo-option[data-target="2nd"] img').alt = data["2nd"].alt;
  } catch(e){ console.error("ロゴ読み込み失敗:", e); }
}

/* ========== ギャラリー ========== */
async function loadGallery(shop,jsonPath,containerId){
  try{
    const res = await fetch(jsonPath,{cache:"no-cache"});
    const data = await res.json();
    const container = document.getElementById(containerId);
    container.innerHTML = data.map(g=>`
      <figure class="gallery-item">
        <img src="${g.src}" alt="${g.alt}" loading="lazy"
             onerror="this.onerror=null;this.src='images/default-shop.png';">
        ${g.alt?`<figcaption>${g.alt}</figcaption>`:""}
      </figure>
    `).join("");
  }catch(e){console.error(`ギャラリー読み込み失敗(${shop}):`,e);}
}

/* ========== キャスト（初期2人＋店ごとボタン制御） ========== */
const CAST_INITIAL = 2;

const castStore = {
  home:  { data: [], shown: 0, json: "cast-home.json", container: "home-cast", btnSel: '.cast-more[data-shop="home"]' },
  "2nd": { data: [], shown: 0, json: "cast-2nd.json",  container: "2nd-cast",  btnSel: '.cast-more[data-shop="2nd"]' }
};

document.addEventListener("DOMContentLoaded", async ()=>{
  await Promise.all([ initCast("home"), initCast("2nd") ]);

  document.querySelectorAll(".cast-more").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const shop = btn.dataset.shop;
      renderCastSlice(shop, castStore[shop].shown, castStore[shop].data.length); // 残り全部
    });
  });
});

async function initCast(shop){
  const cfg  = castStore[shop];
  const grid = document.getElementById(cfg.container);
  if (grid) grid.innerHTML = ""; // ← 前回描画をクリア

  try{
    const res = await fetch(cfg.json, { cache: "no-cache" });
    cfg.data  = await res.json();
  }catch(e){
    console.error(`キャスト読み込み失敗(${shop}):`, e);
    cfg.data = [];
  }
  cfg.shown = 0;

  const initial = Math.min(CAST_INITIAL, cfg.data.length);
  renderCastSlice(shop, 0, initial);

  const btn = document.querySelector(cfg.btnSel);
  if (btn){
    btn.hidden = !(cfg.data.length >= 3); // 3未満なら隠す
  }
}

function renderCastSlice(shop, from, to){
  const cfg  = castStore[shop];
  const grid = document.getElementById(cfg.container);
  if (!grid) return;

  const slice = cfg.data.slice(from, to);
  if (!slice.length) return;

  grid.insertAdjacentHTML("beforeend", slice.map(c => `
    <div class="cast-card">
      <img src="${c.img}" alt="${escapeHtml(c.name)}" loading="lazy"
           onerror="this.onerror=null;this.src='images/default-avatar.png';">
      <h4>${escapeHtml(c.name)}</h4>
      <p>${escapeHtml(c.comment)}</p>
    </div>
  `).join(""));

  cfg.shown += slice.length;

  const btn = document.querySelector(cfg.btnSel);
  if (btn){
    btn.hidden = (cfg.shown >= cfg.data.length);
  }
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m => (
    {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]
  ));
}

/* ========== （旧）loadCast は削除！ 二重描画の原因になる ========== */
// async function loadCast(...) { ... }  ← これを消す
