(function () {
  'use strict';

  const pages = [
    { href: '/sw_intro.html', title: 'Introduction' },
    { href: '/starwars_rpg_foundations.html', title: 'RPG Foundations' },
    { href: '/sw_char.html', title: 'Character Creation' },
    { href: '/sw_character_examples.html', title: 'Character Examples' },
    { href: '/sw_100.html', title: '100 Characters' },
    { href: '/sw_names.html', title: 'Character Names' },
    { href: '/sw_groups.html', title: 'Group Dynamics' },
    { href: '/sw_combat.html', title: 'Combat Mechanics' },
    { href: '/sw_dice_roller.html', title: 'Dice Roller' },
    { href: '/sw_adv_dice.html', title: 'Advanced Dice' },
    { href: '/starwars_ground_combat.html', title: 'Ground Combat' },
    { href: '/sw_force_and_lightsaber.html', title: 'Force & Lightsabers' },
    { href: '/starwars_force_powers.html', title: 'Force Powers' },
    { href: '/sw_vehicles.html', title: 'Vehicles & Starships' },
    { href: '/starwars_space_encounters.html', title: 'Space Encounters' },
    { href: '/sw_campaign.html', title: 'Campaign Creation' },
    { href: '/sw_gm_techniques.html', title: 'Game Master Techniques' },
    { href: '/starwars_campaign_arcs.html', title: 'Campaign Arcs' },
    { href: '/starwars_npcs_villains.html', title: 'NPCs & Villains' },
    { href: '/starwars_social_encounters.html', title: 'Social Encounters' },
    { href: '/starwars_planets_locations.html', title: 'Planets & Locations' },
    { href: '/starwars_galactic_politics.html', title: 'Galactic Politics' },
    { href: '/starwars_droids_technology.html', title: 'Droids & Technology' },
    { href: '/starwars_time_travel.html', title: 'Time Travel' },
    { href: '/starwars_capstone_mastery.html', title: 'Capstone: GM Mastery' }
  ];

  /* ---- make sure the shared chrome CSS is present (index.html relies on this) ---- */
  if (!document.querySelector('link[href$="nav.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/styles/nav.css';
    document.head.appendChild(link);
  }

  /* ---- theme: dark is the default, matching the homepage ---- */
  const STORE = 'sw-theme';
  if (localStorage.getItem(STORE) === 'light') {
    document.documentElement.classList.add('light');
  }

  function isLight() {
    return document.documentElement.classList.contains('light');
  }

  function updateToggleLabel() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.textContent = isLight() ? '🌙 Dark' : '☀️ Light';
    btn.setAttribute('aria-pressed', String(!isLight()));
    btn.setAttribute('title', isLight() ? 'Switch to dark mode' : 'Switch to light mode');
  }

  function toggleTheme() {
    document.documentElement.classList.toggle('light');
    localStorage.setItem(STORE, isLight() ? 'light' : 'dark');
    updateToggleLabel();
  }

  /* Diagrams are deliberately NOT re-themed on toggle: many carry hardcoded
     light `style X fill:#...` directives, so they render on their own light
     surface in mermaid's light theme regardless of the page theme. */

  /* ---- top navbar ---- */
  const nav = document.createElement('nav');
  nav.className = 'site-nav';
  nav.setAttribute('aria-label', 'Site');
  nav.innerHTML =
    '<div class="site-nav-inner">' +
      '<a href="/index.html" class="nav-link">🏠 Home</a>' +
      '<a href="https://rays-home.netlify.app/" class="nav-link" target="_blank" rel="noopener">Ray\'s House of Fun</a>' +
      '<a href="https://rays-home.netlify.app/contact" class="nav-link" target="_blank" rel="noopener">Contact</a>' +
      '<button id="theme-toggle" type="button" class="nav-btn" aria-label="Toggle colour theme"></button>' +
    '</div>';
  document.body.prepend(nav);
  updateToggleLabel();
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  /* ---- prev / next (skipped on the index) ---- */
  const file = location.pathname.split('/').pop() || 'index.html';
  if (file === 'index.html') return;

  const idx = pages.findIndex(function (p) { return p.href.slice(1) === file; });
  if (idx === -1) return;

  const prev = idx > 0 ? pages[idx - 1] : null;
  const next = idx < pages.length - 1 ? pages[idx + 1] : null;

  const pnav = document.createElement('nav');
  pnav.className = 'page-nav';
  pnav.setAttribute('aria-label', 'Lesson');
  pnav.innerHTML =
    '<div class="page-nav-inner">' +
      (prev ? '<a href="' + prev.href + '" class="page-nav-link prev" rel="prev">⬅ ' + prev.title + '</a>' : '<span></span>') +
      '<a href="/index.html" class="page-nav-link home">Table of Contents</a>' +
      (next ? '<a href="' + next.href + '" class="page-nav-link next" rel="next">' + next.title + ' ➡</a>' : '<span></span>') +
    '</div>';
  document.body.appendChild(pnav);
})();
