// ── Theme ────────────────────────────────────────────────────────────────────

const THEME_KEY = 'ah-theme';

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.querySelector('.theme-toggle');
  if (btn) btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  applyTheme(saved || getSystemTheme());
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || getSystemTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
}

initTheme();

document.addEventListener('DOMContentLoaded', () => {
  const themeBtn = document.querySelector('.theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(e.matches ? 'light' : 'dark');
    }
  });
});

// ── Mobile nav ────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav__toggle');
  const mobileNav = document.querySelector('.nav__links');

  if (toggle && mobileNav) {
    function openNav() {
      toggle.setAttribute('aria-expanded', 'true');
      mobileNav.classList.remove('hidden');
      // Two rAF frames ensure display:none → block is painted before transition starts
      requestAnimationFrame(() => requestAnimationFrame(() => {
        mobileNav.classList.add('is-open');
      }));
    }

    function closeNav() {
      toggle.setAttribute('aria-expanded', 'false');
      mobileNav.classList.remove('is-open');
      mobileNav.addEventListener('transitionend', () => {
        mobileNav.classList.add('hidden');
      }, { once: true });
      // Reset all open submenus
      mobileNav.querySelectorAll('.nav__submenu.is-open').forEach(sub => {
        sub.classList.remove('is-open');
      });
      mobileNav.querySelectorAll('.nav__dropdown-toggle[aria-expanded="true"]').forEach(btn => {
        btn.setAttribute('aria-expanded', 'false');
      });
    }

    toggle.addEventListener('click', () => {
      toggle.getAttribute('aria-expanded') === 'true' ? closeNav() : openNav();
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('click', (e) => {
      if (toggle.getAttribute('aria-expanded') === 'true' &&
          !mobileNav.contains(e.target) &&
          !toggle.contains(e.target)) {
        closeNav();
      }
    });

    // Mobile dropdown toggles
    mobileNav.querySelectorAll('.nav__dropdown-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const submenu = btn.closest('li').querySelector('.nav__submenu');
        const isOpen = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!isOpen));
        submenu.classList.toggle('is-open', !isOpen);
      });
    });
  }
});

// ── Transparent nav ───────────────────────────────────────────────────────────

(function () {
  const header = document.querySelector('header.nav--transparent');
  if (!header) return;

  function updateNav() {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
}());

// ── Hero parallax ─────────────────────────────────────────────────────────────

(function () {
  const blob1 = document.getElementById('hero-blob-1');
  const blob2 = document.getElementById('hero-blob-2');
  const blob3 = document.getElementById('hero-blob-3');

  if (!blob1 || !blob2 || !blob3) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 768) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        blob1.style.transform = `translateY(${y * 0.15}px)`;
        blob2.style.transform = `translateY(${y * -0.1}px)`;
        blob3.style.transform = `translateY(${y * 0.08}px)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}());

// ── Contact form (Formspree) ──────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const btn     = document.getElementById('contact-submit');
  const success = document.getElementById('form-success');
  const error   = document.getElementById('form-error');

  const SEND_LABEL = btn.innerHTML;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = 'Sending…';
    success.classList.add('hidden');
    error.classList.add('hidden');

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        success.classList.remove('hidden');
        form.reset();
      } else {
        error.classList.remove('hidden');
      }
    } catch {
      error.classList.remove('hidden');
    } finally {
      btn.disabled = false;
      btn.innerHTML = SEND_LABEL;
    }
  });
});
