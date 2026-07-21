document.addEventListener('DOMContentLoaded', () => {
  initNavDrawer();
  initStatusBadge();
  initLegalModals();
  initCookieConsent();
});

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
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    overlay.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    const isOpen = drawer.classList.contains('is-open');
    isOpen ? closeDrawer() : openDrawer();
  });

  closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  drawer.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && drawer.classList.contains('is-open')) {
      closeDrawer();
    }
  });
}

function initStatusBadge() {
  const badge = document.getElementById('status-badge');
  if (!badge) {
    return;
  }

  const HOURS = {
    1: { open: 9 * 60, close: 19 * 60 },
    2: { open: 9 * 60, close: 19 * 60 },
    3: { open: 9 * 60, close: 19 * 60 },
    4: { open: 9 * 60, close: 19 * 60 },
    5: { open: 9 * 60, close: 19 * 60 },
    6: { open: 9 * 60, close: 18 * 60 },
  };

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const now = new Date();
  const day = now.getDay();
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const today = HOURS[day];

  if (today && minutesNow >= today.open && minutesNow < today.close) {
    badge.textContent = `Jetzt geöffnet · schließt um ${formatTime(today.close)} Uhr`;
    badge.classList.add('is-open');
    return;
  }

  if (today && minutesNow < today.open) {
    badge.textContent = `Geschlossen · öffnet heute um ${formatTime(today.open)} Uhr`;
    badge.classList.add('is-closed');
    return;
  }

  const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  let daysAhead = 1;
  while (daysAhead <= 7 && !HOURS[(day + daysAhead) % 7]) {
    daysAhead += 1;
  }

  const nextDay = (day + daysAhead) % 7;
  const nextOpening = HOURS[nextDay];
  const dayLabel = daysAhead === 1 ? 'morgen' : dayNames[nextDay];

  badge.textContent = nextOpening
    ? `Geschlossen · öffnet ${dayLabel} um ${formatTime(nextOpening.open)} Uhr`
    : 'Geschlossen';
  badge.classList.add('is-closed');
}

function initLegalModals() {
  const modalImpressum = document.getElementById('modal-impressum');
  const modalDatenschutz = document.getElementById('modal-datenschutz');
  const btnImpressum = document.getElementById('btn-impressum');
  const btnDatenschutz = document.getElementById('btn-datenschutz');

  const openModal = (modal) => {
    if (!modal) return;
    modal.classList.add('is-active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (btnImpressum) btnImpressum.addEventListener('click', () => openModal(modalImpressum));
  if (btnDatenschutz) btnDatenschutz.addEventListener('click', () => openModal(modalDatenschutz));

  document.querySelectorAll('.modal-overlay').forEach((modal) => {
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => closeModal(modal));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(modalImpressum);
      closeModal(modalDatenschutz);
    }
  });
}

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
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    applyConsent(consent);
    if (banner) banner.hidden = true;
  };

  const storedConsentStr = localStorage.getItem(CONSENT_KEY);
  if (storedConsentStr) {
    try {
      const storedConsent = JSON.parse(storedConsentStr);
      applyConsent(storedConsent);
      if (consentExternalInput) consentExternalInput.checked = storedConsent.external;
    } catch {
      if (banner) banner.hidden = false;
    }
  } else {
    if (banner) banner.hidden = false;
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

