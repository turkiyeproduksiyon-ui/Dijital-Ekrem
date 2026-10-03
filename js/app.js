const SAMPLE_URUNLER = [
  { ad:'Örnek Ürün — Fotoğraf Makinesi', marka:'Canon', foto_url:'img/ornek1.jpg' },
  { ad:'Örnek Ürün — Objektif', marka:'Sony', foto_url:'img/ornek2.jpg' },
  { ad:'Örnek Ürün — Video Kamera', marka:'Fujifilm', foto_url:'img/ornek3.jpg' },
  { ad:'Örnek Ürün — Aksesuar', marka:'Nikon', foto_url:'img/ornek4.jpg' }
];

const DEFAULT_SLIDES = [
  { eyebrow:'Ankara · Çankaya', baslik:'İkinci El ve Sıfır Elektronik Ekipmanları', alt_yazi:'Kamera, bilgisayar, tablet, telefon — 2006\'dan bu yana güvenilir, kurumsal hizmet' },
  { eyebrow:'Güneşli Pasajı', baslik:'2006\'dan Bu Yana Ankara\'da', alt_yazi:'Kurumsal, güvenilir hizmet anlayışıyla' },
  { eyebrow:'Geniş Ürün Yelpazesi', baslik:'Canon · Fujifilm · Sony ve Daha Fazlası', alt_yazi:'İkinci el ve sıfır seçenekleriyle' }
];

let sliderIndex = 0;
let sliderTimer = null;

const menuBtn = document.getElementById('menuBtn');
const navMenu = document.getElementById('navMenu');
menuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  navMenu.classList.toggle('open');
});
navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navMenu.classList.remove('open')));
document.addEventListener('click', (e) => {
  if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && e.target !== menuBtn) {
    navMenu.classList.remove('open');
  }
});

(async function loadGaleri(){
  if (!window.supabase) return;
  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const grid = document.getElementById('galeriGrid');

  try {
    const { data, error } = await sb
      .from('vitrin_fotograflari')
      .select('*')
      .order('sira_no', { ascending: true, nullsFirst: false });

    if (error || !data || data.length === 0) {
      grid.innerHTML = '<p class="galeri-empty">Çok yakında fotoğraflarımız burada olacak.</p>';
      return;
    }

    grid.innerHTML = data.map(f => `
      <div class="galeri-item">
        <img src="${f.foto_url}" alt="${f.aciklama || 'Dijital Ekrem'}">
        <p>${f.aciklama || ''}</p>
      </div>
    `).join('');
  } catch (e) {
    grid.innerHTML = '<p class="galeri-empty">Çok yakında fotoğraflarımız burada olacak.</p>';
  }

  const okSol = document.getElementById('galeriOkSol');
  const okSag = document.getElementById('galeriOkSag');
  if (okSol && okSag) {
    okSol.addEventListener('click', () => grid.scrollBy({ left: -220, behavior: 'smooth' }));
    okSag.addEventListener('click', () => grid.scrollBy({ left: 220, behavior: 'smooth' }));
  }
})();

const CATEGORIES_ICON = [
  { ad:'Fotoğraf Makineleri', ikon:'📷' },
  { ad:'Objektifler', ikon:'🔍' },
  { ad:'Video Kameralar', ikon:'🎥' },
  { ad:'Tripod / Monopod', ikon:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="5" r="2"/><path d="M12 7v6"/><path d="M12 13 L5 22"/><path d="M12 13 L19 22"/><path d="M12 13 L12 22"/></svg>' },
  { ad:'Stüdyo ve Işık', ikon:'💡' },
  { ad:'Aksesuar', ikon:'🎒' },
  { ad:'Ses', ikon:'🎙️' },
  { ad:'Hafıza Kartları', ikon:'💾' },
  { ad:'Bilgisayar ve Tablet', ikon:'💻' },
  { ad:'Cep Telefonu', ikon:'📱' }
];
const CATEGORIES = CATEGORIES_ICON.map(c => c.ad);

let ALL_URUNLER = [];
let AKTIF_KATEGORI = 'Tümü';

// İkon kategoriler ve varsayılan slider her zaman, Supabase'e hiç bağlı olmadan çizilir
renderIconKatGrid();
renderSlides(DEFAULT_SLIDES);
renderUrunGrid();

(async function loadUrunler(){
  if (!window.supabase) return;
  let sb;
  try {
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  } catch (e) {
    return;
  }

  loadSlider(sb);

  try {
    const { data, error } = await sb
      .from('urunler')
      .select('*')
      .order('sira_no', { ascending: true, nullsFirst: false });

    if (error || !data) {
      ALL_URUNLER = [];
    } else {
      ALL_URUNLER = data;
    }
  } catch (e) {
    ALL_URUNLER = [];
  }
  renderUrunGrid();
})();

function renderIconKatGrid() {
  const gridEl = document.getElementById('iconKatGrid');
  gridEl.innerHTML = CATEGORIES_ICON.map(c => `
    <button type="button" class="icon-kat-card${c.ad === AKTIF_KATEGORI ? ' active' : ''}" data-kat="${c.ad}">
      <div class="icon-circle">${c.ikon}</div>
      <p>${c.ad}</p>
    </button>
  `).join('');
  gridEl.querySelectorAll('.icon-kat-card').forEach(btn => {
    btn.addEventListener('click', () => {
      AKTIF_KATEGORI = (AKTIF_KATEGORI === btn.dataset.kat) ? 'Tümü' : btn.dataset.kat;
      renderIconKatGrid();
      document.getElementById('urunBaslik').textContent = AKTIF_KATEGORI === 'Tümü' ? 'Ürünlerimiz' : AKTIF_KATEGORI;
      renderUrunGrid();
      document.getElementById('urunler').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

function renderSlides(slides) {
  const track = document.getElementById('sliderTrack');
  const dotsEl = document.getElementById('sliderDots');

  track.innerHTML = slides.map(s => `
    <div class="slide${s.foto_url ? ' slide-photo' : ' slide-default'}"${s.foto_url ? ` style="background-image:url('${s.foto_url}');"` : ''}>
      ${s.eyebrow ? `<p class="eyebrow">${s.eyebrow}</p>` : ''}
      ${s.baslik ? `<h1>${s.baslik}</h1>` : ''}
      ${s.alt_yazi ? `<p class="hero-sub">${s.alt_yazi}</p>` : ''}
      <a href="https://digitalekrem.sahibinden.com/" target="_blank" class="btn-primary">Sahibinden Mağazamızı İncele ↗</a>
    </div>
  `).join('');

  dotsEl.innerHTML = slides.map((_, i) => `<span data-i="${i}"${i === 0 ? ' class="active"' : ''}></span>`).join('');
  dotsEl.querySelectorAll('span').forEach(dot => {
    dot.addEventListener('click', () => {
      clearInterval(sliderTimer);
      goToSlide(parseInt(dot.dataset.i, 10));
      startSliderTimer(slides.length);
    });
  });

  if (slides.length > 1) startSliderTimer(slides.length);
}

function startSliderTimer(total) {
  clearInterval(sliderTimer);
  sliderTimer = setInterval(() => {
    goToSlide((sliderIndex + 1) % total);
  }, 5000);
}

async function loadSlider(sb) {
  try {
    const { data, error } = await sb
      .from('slider_gorseller')
      .select('*')
      .order('sira_no', { ascending: true, nullsFirst: false });

    if (!error && data && data.length > 0) {
      renderSlides([...data, ...DEFAULT_SLIDES]);
    }
  } catch (e) {}
}

function goToSlide(i, total) {
  sliderIndex = i;
  const track = document.getElementById('sliderTrack');
  track.style.transform = `translateX(-${i * 100}%)`;
  document.querySelectorAll('.slider-dots span').forEach((d, idx) => {
    d.classList.toggle('active', idx === i);
  });
}

function renderUrunGrid() {
  const grid = document.getElementById('urunGrid');
  const filtered = AKTIF_KATEGORI === 'Tümü'
    ? ALL_URUNLER
    : ALL_URUNLER.filter(u => u.kategori === AKTIF_KATEGORI);

  if (ALL_URUNLER.length === 0) {
    grid.innerHTML = '<p class="urun-ornek-uyari">Aşağıdakiler örnek görünümdür — panelden gerçek ürünlerinizi ekleyince onların yerini alacaktır.</p>' +
      SAMPLE_URUNLER.map(u => `
        <div class="urun-card">
          <img src="${u.foto_url}" alt="${u.ad}">
          <div class="urun-info">
            <p class="urun-marka">${u.marka}</p>
            <p class="urun-ad">${u.ad}</p>
          </div>
        </div>
      `).join('');
    return;
  }

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="galeri-empty">Bu kategoride çok yakında ürünlerimiz eklenecek.</p>';
    return;
  }

  grid.innerHTML = filtered.map(u => `
    <div class="urun-card" data-id="${u.id}">
      ${u.foto_url ? `<img src="${u.foto_url}" alt="${u.ad}">` : `<div style="aspect-ratio:1/1;background:#222;"></div>`}
      <div class="urun-info">
        ${u.marka ? `<p class="urun-marka">${u.marka}</p>` : ''}
        <p class="urun-ad">${u.ad}</p>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.urun-card').forEach(card => {
    card.addEventListener('click', () => {
      const urun = ALL_URUNLER.find(u => u.id === card.dataset.id);
      if (urun) openUrunModal(urun);
    });
  });
}

function openUrunModal(urun) {
  document.getElementById('urunModalImg').src = urun.foto_url || '';
  document.getElementById('urunModalImg').style.display = urun.foto_url ? 'block' : 'none';
  document.getElementById('urunModalKategori').textContent = [urun.kategori, urun.alt_kategori].filter(Boolean).join(' · ');
  document.getElementById('urunModalAd').textContent = urun.ad;
  document.getElementById('urunModalAciklama').textContent = urun.aciklama || '';
  document.getElementById('urunModal').style.display = 'flex';
}

document.getElementById('urunModalClose').addEventListener('click', () => {
  document.getElementById('urunModal').style.display = 'none';
});
document.getElementById('urunModal').addEventListener('click', (e) => {
  if (e.target.id === 'urunModal') document.getElementById('urunModal').style.display = 'none';
});
