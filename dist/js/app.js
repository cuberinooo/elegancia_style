/* =========================================================================
   ELEGANCIA STYLE — interactions
   ========================================================================= */

const PHONE_HOURS = {
  0: null,
  1: { open: 9 * 60, close: 19 * 60 },
  2: { open: 9 * 60, close: 19 * 60 },
  3: { open: 9 * 60, close: 19 * 60 },
  4: { open: 9 * 60, close: 19 * 60 },
  5: { open: 9 * 60, close: 19 * 60 },
  6: { open: 9 * 60, close: 18 * 60 },
};

const DAY_NAMES = [
  'Sonntag',
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
];

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initNavDrawer();
  initScrollSpy();
  initReveal();
  initOpeningHours();
  initFaq();
  initLegalModals();
  initCookieConsent();
  initFooterYear();
});

/* ------------------------------------------------------------------ header */
function initHeaderScroll() {
  const header = document.getElementById('site-header');
  const sticky = document.getElementById('sticky-cta');
  if (!header) {
    return;
  }

  const update = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 24);
    if (sticky) {
      sticky.classList.toggle('is-visible', y > 420);
    }
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
}

/* ------------------------------------------------------------- nav drawer */
function initNavDrawer() {
  const toggle = document.querySelector('.nav-toggle');
  const drawer = document.getElementById('nav-drawer');
  const overlay = document.querySelector('.nav-drawer-overlay');
  const closeBtn = document.querySelector('.nav-drawer-close');

  if (!toggle || !drawer || !overlay) {
    return;
  }

  const openDrawer = () => {
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    overlay.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Menü schließen');
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  };

  const closeDrawer = ({ restoreFocus = false } = {}) => {
    if (!drawer.classList.contains('is-open')) {
      return;
    }
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    overlay.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Menü öffnen');
    document.body.style.overflow = '';
    if (restoreFocus) toggle.focus();
  };

  toggle.addEventListener('click', () => {
    if (drawer.classList.contains('is-open')) {
      closeDrawer({ restoreFocus: true });
    } else {
      openDrawer();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => closeDrawer({ restoreFocus: true }));
  }
  overlay.addEventListener('click', () => closeDrawer());

  drawer.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => closeDrawer());
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeDrawer({ restoreFocus: true });
    }
  });
}

/* ------------------------------------------------------------- scroll spy */
function initScrollSpy() {
  const links = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  if (!links.length || !('IntersectionObserver' in window)) {
    return;
  }

  const byId = new Map();
  const sections = [];

  links.forEach((link) => {
    const id = link.getAttribute('href').slice(1);
    const section = document.getElementById(id);
    if (section) {
      byId.set(id, link);
      sections.push(section);
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        links.forEach((link) => link.classList.remove('is-active'));
        const active = byId.get(entry.target.id);
        if (active) active.classList.add('is-active');
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
  );

  sections.forEach((section) => observer.observe(section));
}

/* --------------------------------------------------------- scroll reveals */
function initReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) {
    return;
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry, index) => {
        if (!entry.isIntersecting) {
          return;
        }
        const delay = Math.min(index, 5) * 80;
        window.setTimeout(() => entry.target.classList.add('is-revealed'), delay);
        obs.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );

  items.forEach((item) => observer.observe(item));
}

/* ----------------------------------------------------- opening hours / status */
function initOpeningHours() {
  const now = new Date();
  const day = now.getDay();
  const minutesNow = now.getHours() * 60 + now.getMinutes();

  highlightToday(day);
  renderStatus(document.getElementById('status-badge'), day, minutesNow);
}

function highlightToday(day) {
  document.querySelectorAll('.hours-row').forEach((row) => {
    const value = row.dataset.day;
    if (value === undefined) {
      return;
    }
    // A row may stand for a range (Mo–Fr is marked with data-day="1").
    const isWeekdayRange = value === '1' && row.querySelector('dt').textContent.includes('–');
    const matches = isWeekdayRange ? day >= 1 && day <= 5 : Number(value) === day;
    row.classList.toggle('is-today', matches);
  });
}

function renderStatus(badge, day, minutesNow) {
  if (!badge) {
    return;
  }

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const today = PHONE_HOURS[day];

  if (today && minutesNow >= today.open && minutesNow < today.close) {
    const closingSoon = today.close - minutesNow <= 60;
    badge.textContent = closingSoon
      ? `Schließt um ${formatTime(today.close)} Uhr`
      : `Jetzt geöffnet · bis ${formatTime(today.close)} Uhr`;
    badge.classList.add('is-open');
    return;
  }

  if (today && minutesNow < today.open) {
    badge.textContent = `Geschlossen · öffnet ${formatTime(today.open)} Uhr`;
    badge.classList.add('is-closed');
    return;
  }

  let daysAhead = 1;
  while (daysAhead <= 7 && !PHONE_HOURS[(day + daysAhead) % 7]) {
    daysAhead += 1;
  }

  const nextDay = (day + daysAhead) % 7;
  const nextOpening = PHONE_HOURS[nextDay];
  const dayLabel = daysAhead === 1 ? 'morgen' : DAY_NAMES[nextDay];

  badge.textContent = nextOpening
    ? `Geschlossen · öffnet ${dayLabel} ${formatTime(nextOpening.open)} Uhr`
    : 'Geschlossen';
  badge.classList.add('is-closed');
}

/* ----------------------------------------------------------------- faq */
function initFaq() {
  const items = Array.from(document.querySelectorAll('.faq details'));
  if (items.length < 2) {
    return;
  }

  // Fallback for browsers without exclusive-accordion (`name`) support.
  const supportsExclusive = 'name' in document.createElement('details');
  if (supportsExclusive) {
    return;
  }

  items.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) {
        return;
      }
      items.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });
}

/* -------------------------------------------------------------- modals */
function initLegalModals() {
  const modalImpressum = document.getElementById('modal-impressum');
  const modalDatenschutz = document.getElementById('modal-datenschutz');
  const btnImpressum = document.getElementById('btn-impressum');
  const btnDatenschutz = document.getElementById('btn-datenschutz');
  let lastFocused = null;

  const openModal = (modal, trigger) => {
    if (!modal) return;
    lastFocused = trigger || document.activeElement;
    modal.classList.add('is-active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
  };

  const closeModal = (modal) => {
    if (!modal || !modal.classList.contains('is-active')) return;
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused) {
      lastFocused.focus();
      lastFocused = null;
    }
  };

  if (btnImpressum) {
    btnImpressum.addEventListener('click', () => openModal(modalImpressum, btnImpressum));
  }
  if (btnDatenschutz) {
    btnDatenschutz.addEventListener('click', () => openModal(modalDatenschutz, btnDatenschutz));
  }

  document.querySelectorAll('.modal-overlay').forEach((modal) => {
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => closeModal(modal));
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal(modal);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal(modalImpressum);
      closeModal(modalDatenschutz);
    }
  });
}

/* ------------------------------------------------------- cookie consent */
function initCookieConsent() {
  const banner = document.getElementById('cookie-banner');
  const mapsIframe = document.getElementById('google-maps-iframe');
  const mapsPlaceholder = document.getElementById('maps-placeholder');
  const btnEnableMaps = document.getElementById('btn-enable-maps');
  const btnAcceptAll = document.getElementById('btn-cookie-accept-all');
  const btnAcceptSelection = document.getElementById('btn-cookie-accept-selection');
  const btnRejectAll = document.getElementById('btn-cookie-reject-all');
  const btnSettings = document.getElementById('btn-cookie-settings');
  const consentExternalInput = document.getElementById('consent-external');

  const CONSENT_KEY = 'elegancia_cookie_consent_v1';

  const applyConsent = (consent) => {
    if (consent.external) {
      if (mapsIframe && mapsIframe.dataset.src) {
        mapsIframe.src = mapsIframe.dataset.src;
      }
      if (mapsPlaceholder) {
        mapsPlaceholder.hidden = true;
      }
    } else {
      if (mapsIframe) {
        mapsIframe.removeAttribute('src');
      }
      if (mapsPlaceholder) {
        mapsPlaceholder.hidden = false;
      }
    }
  };

  const saveConsent = (externalAllowed) => {
    const consent = {
      essential: true,
      external: externalAllowed,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    } catch {
      /* storage blocked – consent then applies for this visit only */
    }
    applyConsent(consent);
    if (banner) banner.hidden = true;
  };

  let storedConsentStr = null;
  try {
    storedConsentStr = localStorage.getItem(CONSENT_KEY);
  } catch {
    storedConsentStr = null;
  }

  if (storedConsentStr) {
    try {
      const storedConsent = JSON.parse(storedConsentStr);
      applyConsent(storedConsent);
      if (consentExternalInput) consentExternalInput.checked = Boolean(storedConsent.external);
    } catch {
      if (banner) banner.hidden = false;
    }
  } else if (banner) {
    banner.hidden = false;
  }

  if (btnAcceptAll) {
    btnAcceptAll.addEventListener('click', () => saveConsent(true));
  }

  if (btnAcceptSelection) {
    btnAcceptSelection.addEventListener('click', () => {
      const externalAllowed = consentExternalInput ? consentExternalInput.checked : true;
      saveConsent(externalAllowed);
    });
  }

  if (btnRejectAll) {
    btnRejectAll.addEventListener('click', () => saveConsent(false));
  }

  if (btnEnableMaps) {
    btnEnableMaps.addEventListener('click', () => saveConsent(true));
  }

  if (btnSettings) {
    btnSettings.addEventListener('click', () => {
      if (banner) banner.hidden = false;
    });
  }
}

/* ------------------------------------------------------------ footer year */
function initFooterYear() {
  const year = document.getElementById('year');
  if (year) {
    year.textContent = new Date().getFullYear();
  }
}
