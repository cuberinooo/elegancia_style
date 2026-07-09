document.addEventListener('DOMContentLoaded', () => {
  initNavDrawer();
  initStatusBadge();
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
