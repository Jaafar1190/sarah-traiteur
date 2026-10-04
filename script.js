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

/* Galerie : grille responsive + ouverture des photos en grand */
(() => {
  const buttons = [...document.querySelectorAll('#galerie .gallery-open')];
  if (!buttons.length) return;

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
  const caption = lightbox.querySelector('.lightbox-caption');
  let current = 0;

  const sync = () => {
    const card = buttons[current].closest('.gallery-card');
    const img = buttons[current].querySelector('img');
    const title = card?.querySelector('figcaption strong')?.textContent || '';
    const desc = card?.querySelector('figcaption span')?.textContent || '';
    const fallback = img.currentSrc || img.src;
    const full = img.dataset.full || fallback;
    lbImg.onerror = () => {
      if (lbImg.src !== fallback) {
        lbImg.onerror = null;
        lbImg.src = fallback;
      }
    };
    lbImg.src = full;
    lbImg.alt = img.alt || 'Photo Sarah Traiteur';
    caption.textContent = [title, desc].filter(Boolean).join(' — ');
  };

  const open = (index) => {
    current = index;
    sync();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lightbox.querySelector('.lightbox-close').focus();
  };

  const close = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  };

  const move = (step) => {
    current = (current + step + buttons.length) % buttons.length;
    sync();
  };

  buttons.forEach((button, index) => button.addEventListener('click', () => open(index)));
  lightbox.querySelector('.lightbox-close').addEventListener('click', close);
  lightbox.querySelector('.lightbox-prev').addEventListener('click', () => move(-1));
  lightbox.querySelector('.lightbox-next').addEventListener('click', () => move(1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') move(-1);
    if (e.key === 'ArrowRight') move(1);
  });
})();
