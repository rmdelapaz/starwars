(function () {
  const pages = [
    { href: '/sw_intro.html', title: 'Introduction' },
    { href: '/sw_char.html', title: 'Character Creation' },
    { href: '/sw_character_examples.html', title: 'Character Examples' },
    { href: '/sw_100.html', title: '100 Characters' },
    { href: '/sw_names.html', title: 'Character Names' },
    { href: '/sw_groups.html', title: 'Group Dynamics' },
    { href: '/sw_combat.html', title: 'Combat Mechanics' },
    { href: '/sw_dice_roller.html', title: 'Dice Roller' },
    { href: '/sw_force_and_lightsaber.html', title: 'The Force' },
    { href: '/sw_vehicles.html', title: 'Vehicles' },
    { href: '/sw_adv_dice.html', title: 'Advanced Dice' },
    { href: '/sw_campaign.html', title: 'Campaign' },
    { href: '/sw_gm_techniques.html', title: 'Game Mastery' },
    { href: '/starwars_rpg_foundations.html', title: 'RPG Foundations' },
    { href: '/starwars_planets_locations.html', title: 'Planets & Locations' },
    { href: '/starwars_space_encounters.html', title: 'Space Encounters' },
    { href: '/starwars_npcs_villains.html', title: 'NPCs & Villains' },
    { href: '/starwars_campaign_arcs.html', title: 'Campaign Arcs' },
    { href: '/starwars_social_encounters.html', title: 'Social Encounters' },
    { href: '/starwars_force_powers.html', title: 'Force Powers' },
    { href: '/starwars_ground_combat.html', title: 'Ground Combat' },
    { href: '/starwars_galactic_politics.html', title: 'Galactic Politics' },
    { href: '/starwars_droids_technology.html', title: 'Droids & Technology' },
    { href: '/starwars_time_travel.html', title: 'Time Travel' },
    { href: '/starwars_capstone_mastery.html', title: 'Capstone' }
  ];

  /* ---- Dark / Light mode ---- */
  const saved = localStorage.getItem('sw-theme');
  if (saved === 'dark') document.documentElement.classList.add('dark');

  function toggleTheme() {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('sw-theme',
      document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    updateToggleLabel();
  }

  function updateToggleLabel() {
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = document.documentElement.classList.contains('dark') ? '☀️ Light' : '🌙 Dark';
  }

  /* ---- Top navbar ---- */
  const nav = document.createElement('nav');
  nav.className = 'site-nav';
  nav.innerHTML = `
    <div class="site-nav-inner">
      <a href="/index.html" class="nav-link">🏠 Home</a>
      <a href="https://rays-home.netlify.app/" class="nav-link" target="_blank" rel="noopener">Ray's House of Fun</a>
      <a href="https://rays-home.netlify.app/contact" class="nav-link" target="_blank" rel="noopener">Contact</a>
      <button id="theme-toggle" class="nav-btn" aria-label="Toggle dark mode"></button>
    </div>`;
  document.body.prepend(nav);
  updateToggleLabel();
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  /* ---- Prev / Next (skip on index) ---- */
  const path = location.pathname;
  if (path === '/' || path === '/index.html') return;

  const idx = pages.findIndex(p => path.endsWith(p.href.replace('/', '')));
  if (idx === -1) return;

  const prev = idx > 0 ? pages[idx - 1] : null;
  const next = idx < pages.length - 1 ? pages[idx + 1] : null;

  const pnav = document.createElement('nav');
  pnav.className = 'page-nav';
  pnav.innerHTML = `
    <div class="page-nav-inner">
      ${prev ? `<a href="${prev.href}" class="page-nav-link prev">⬅ ${prev.title}</a>` : '<span></span>'}
      <a href="/index.html" class="page-nav-link home">Table of Contents</a>
      ${next ? `<a href="${next.href}" class="page-nav-link next">${next.title} ➡</a>` : '<span></span>'}
    </div>`;

  /* Insert before </body> */
  document.body.appendChild(pnav);
})();
