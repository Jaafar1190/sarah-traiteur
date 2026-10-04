const header = document.getElementById('siteHeader');
const toggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');

function updateHeader(){ header.classList.toggle('scrolled', window.scrollY > 24); }
updateHeader(); window.addEventListener('scroll', updateHeader, {passive:true});

toggle?.addEventListener('click', () => {
  const open = header.classList.toggle('menu-open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
});
mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  header.classList.remove('menu-open'); toggle.setAttribute('aria-expanded','false');
}));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if(entry.isIntersecting){ entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); } });
}, {threshold:0.12, rootMargin:'0px 0px -30px 0px'});
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const navLinks = [...document.querySelectorAll('.desktop-nav a')];
const sections = navLinks
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){ navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`)); }
  });
}, {rootMargin:'-35% 0px -55% 0px'});
sections.forEach(s => sectionObserver.observe(s));

document.getElementById('year').textContent = new Date().getFullYear();

const form = document.getElementById('quoteForm');
const status = document.getElementById('formStatus');
const submitButton = form?.querySelector('.form-submit');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!form.reportValidity()) return;

  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'Envoi en cours…';
  status.textContent = 'Envoi de votre demande…';

  try {
    const response = await fetch('https://formsubmit.co/ajax/jaafar250594@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(Object.fromEntries(new FormData(form).entries()))
    });

    const result = await response.json();
    if (!response.ok || result.success === false) throw new Error('Erreur d’envoi');

    form.reset();
    status.textContent = 'Merci. Votre demande a bien été envoyée à Sarah Traiteur.';
    status.classList.add('success');
  } catch (error) {
    status.textContent = 'Une erreur est survenue. Vous pouvez aussi nous écrire directement à jaafar250594@gmail.com.';
    status.classList.remove('success');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
});

/* Galerie premium : diaporama + affichage de la photo entière + lightbox */
(() => {
  const gallery = document.querySelector('#galerie .gallery-grid');
  if (!gallery) return;

  /* Cette image ne correspond pas aux photos fournies : on la retire de la galerie. */
  gallery.querySelectorAll('figure').forEach((figure) => {
    const img = figure.querySelector('img');
    if (img?.getAttribute('src')?.includes('gallery-plat-marocain-2.webp')) {
      figure.remove();
    }
  });

  const slides = [...gallery.querySelectorAll('figure')];
  if (!slides.length) return;

  const style = document.createElement('style');
  style.textContent = `
    #galerie .gallery-grid.gallery-slideshow{
      position:relative !important;
      display:block !important;
      grid-template-columns:none !important;
      grid-auto-rows:auto !important;
      height:clamp(440px,62vw,720px);
      overflow:hidden;
      background:#18120e;
      border:1px solid rgba(130,91,48,.16);
      box-shadow:0 20px 55px rgba(49,32,20,.10);
    }
    #galerie .gallery-slideshow figure{
      position:absolute !important;
      inset:0 !important;
      width:100% !important;
      height:100% !important;
      margin:0 !important;
      display:flex !important;
      align-items:center;
      justify-content:center;
      background:#18120e !important;
      opacity:0;
      visibility:hidden;
      transform:none !important;
      transition:opacity .55s ease, visibility .55s ease;
      cursor:zoom-in;
    }
    #galerie .gallery-slideshow figure.is-active{
      opacity:1;
      visibility:visible;
      z-index:2;
    }
    #galerie .gallery-slideshow figure img{
      width:100% !important;
      height:100% !important;
      object-fit:contain !important;
      object-position:center !important;
      transform:none !important;
      transition:filter .3s ease !important;
      background:#18120e;
    }
    #galerie .gallery-slideshow figure:hover img{ transform:none !important; filter:brightness(.96); }
    .gallery-arrow{
      position:absolute;top:50%;z-index:8;transform:translateY(-50%);
      width:48px;height:48px;border-radius:50%;border:1px solid rgba(255,255,255,.48);
      background:rgba(18,12,8,.56);color:#fff;font-size:28px;line-height:1;
      display:grid;place-items:center;cursor:pointer;backdrop-filter:blur(6px);
      transition:.2s ease;
    }
    .gallery-arrow:hover{background:#c99135;border-color:#c99135;transform:translateY(-50%) scale(1.05)}
    .gallery-arrow.prev{left:18px}.gallery-arrow.next{right:18px}
    .gallery-controls{
      position:absolute;z-index:9;left:50%;bottom:18px;transform:translateX(-50%);
      display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:999px;
      background:rgba(18,12,8,.58);backdrop-filter:blur(7px);
    }
    .gallery-dot{width:8px;height:8px;border:0;border-radius:50%;padding:0;background:rgba(255,255,255,.45);cursor:pointer;transition:.2s}
    .gallery-dot.active{width:24px;border-radius:99px;background:#d6a44e}
    .gallery-counter{position:absolute;z-index:9;right:18px;bottom:18px;color:#fff;background:rgba(18,12,8,.58);padding:7px 11px;border-radius:999px;font-size:12px;backdrop-filter:blur(7px)}
    .gallery-hint{margin:14px 0 0;color:#7a6e64;font-size:13px;text-align:center}
    .sarah-lightbox{
      position:fixed;inset:0;z-index:5000;background:rgba(10,7,5,.96);
      display:none;align-items:center;justify-content:center;padding:64px 72px 52px;
    }
    .sarah-lightbox.open{display:flex}
    .sarah-lightbox img{max-width:100%;max-height:calc(100vh - 130px);width:auto;height:auto;object-fit:contain;box-shadow:0 20px 70px rgba(0,0,0,.38)}
    .lightbox-close,.lightbox-prev,.lightbox-next{
      position:absolute;border:1px solid rgba(255,255,255,.42);background:rgba(25,17,12,.72);color:#fff;
      display:grid;place-items:center;cursor:pointer;transition:.2s;backdrop-filter:blur(7px)
    }
    .lightbox-close{right:24px;top:22px;width:45px;height:45px;border-radius:50%;font-size:26px}
    .lightbox-prev,.lightbox-next{top:50%;transform:translateY(-50%);width:48px;height:58px;border-radius:5px;font-size:30px}
    .lightbox-prev{left:18px}.lightbox-next{right:18px}
    .lightbox-close:hover,.lightbox-prev:hover,.lightbox-next:hover{background:#c99135;border-color:#c99135}
    .lightbox-caption{position:absolute;bottom:17px;left:50%;transform:translateX(-50%);color:#f4ede5;font-size:13px;text-align:center;max-width:80vw}
    @media(max-width:820px){
      #galerie .gallery-grid.gallery-slideshow{height:clamp(360px,105vw,560px)}
      .gallery-arrow{width:40px;height:40px;font-size:23px}.gallery-arrow.prev{left:9px}.gallery-arrow.next{right:9px}
      .gallery-controls{bottom:11px;max-width:72%;overflow:hidden}.gallery-counter{right:10px;bottom:11px}
      .sarah-lightbox{padding:62px 10px 58px}.lightbox-prev{left:7px}.lightbox-next{right:7px}
      .lightbox-prev,.lightbox-next{width:40px;height:52px;background:rgba(25,17,12,.82)}
    }
  `;
  document.head.appendChild(style);

  gallery.classList.add('gallery-slideshow');
  slides.forEach((slide, i) => {
    slide.classList.remove('visible');
    slide.classList.toggle('is-active', i === 0);
    slide.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
    const img = slide.querySelector('img');
    if (img) {
      img.removeAttribute('width');
      img.removeAttribute('height');
    }
  });

  const prev = document.createElement('button');
  prev.type = 'button'; prev.className = 'gallery-arrow prev'; prev.innerHTML = '&#8249;'; prev.setAttribute('aria-label','Photo précédente');
  const next = document.createElement('button');
  next.type = 'button'; next.className = 'gallery-arrow next'; next.innerHTML = '&#8250;'; next.setAttribute('aria-label','Photo suivante');
  gallery.append(prev, next);

  const controls = document.createElement('div');
  controls.className = 'gallery-controls';
  const dots = slides.map((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button'; dot.className = `gallery-dot${i === 0 ? ' active' : ''}`;
    dot.setAttribute('aria-label', `Afficher la photo ${i + 1}`);
    controls.appendChild(dot);
    return dot;
  });
  gallery.appendChild(controls);

  const counter = document.createElement('div');
  counter.className = 'gallery-counter';
  gallery.appendChild(counter);

  const hint = document.createElement('p');
  hint.className = 'gallery-hint';
  hint.textContent = 'Cliquez sur une photo pour l’agrandir.';
  gallery.insertAdjacentElement('afterend', hint);

  let current = 0;
  let timer;
  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
    counter.textContent = `${current + 1} / ${slides.length}`;
  };
  const startAuto = () => { clearInterval(timer); timer = setInterval(() => show(current + 1), 5200); };
  const manual = (index) => { show(index); startAuto(); };

  prev.addEventListener('click', (e) => { e.stopPropagation(); manual(current - 1); });
  next.addEventListener('click', (e) => { e.stopPropagation(); manual(current + 1); });
  dots.forEach((dot, i) => dot.addEventListener('click', (e) => { e.stopPropagation(); manual(i); }));
  gallery.addEventListener('mouseenter', () => clearInterval(timer));
  gallery.addEventListener('mouseleave', startAuto);
  show(0); startAuto();

  const lightbox = document.createElement('div');
  lightbox.className = 'sarah-lightbox';
  lightbox.setAttribute('role','dialog');
  lightbox.setAttribute('aria-modal','true');
  lightbox.setAttribute('aria-label','Photo agrandie');
  lightbox.innerHTML = `
    <button type="button" class="lightbox-close" aria-label="Fermer">×</button>
    <button type="button" class="lightbox-prev" aria-label="Photo précédente">‹</button>
    <img alt="" />
    <button type="button" class="lightbox-next" aria-label="Photo suivante">›</button>
    <div class="lightbox-caption"></div>`;
  document.body.appendChild(lightbox);

  const lbImg = lightbox.querySelector('img');
  const lbCaption = lightbox.querySelector('.lightbox-caption');
  const syncLightbox = () => {
    const img = slides[current].querySelector('img');
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt || 'Photo Sarah Traiteur';
    lbCaption.textContent = img.alt || '';
  };
  const openLightbox = (index) => {
    show(index); syncLightbox(); clearInterval(timer);
    lightbox.classList.add('open'); document.body.style.overflow = 'hidden';
    lightbox.querySelector('.lightbox-close').focus();
  };
  const closeLightbox = () => {
    lightbox.classList.remove('open'); document.body.style.overflow = ''; startAuto();
  };
  const lbMove = (step) => { show(current + step); syncLightbox(); };

  slides.forEach((slide, i) => slide.addEventListener('click', () => openLightbox(i)));
  lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox-prev').addEventListener('click', () => lbMove(-1));
  lightbox.querySelector('.lightbox-next').addEventListener('click', () => lbMove(1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lbMove(-1);
    if (e.key === 'ArrowRight') lbMove(1);
  });
})();
