/* ============================================================
   Portfolio renderer
   Reads everything from data.json — no content should be
   hardcoded in this file. To update the site's content
   (bio, skills, projects...), edit data.json only.
   ============================================================ */

const ICONS = {
  external: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H9M17 7V15" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  code: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6L3 12L8 18M16 6L21 12L16 18" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  mail: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18v12H3z" stroke-linejoin="round"/><path d="M3 7l9 6 9-6" stroke-linejoin="round"/></svg>`,
  link: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9s1.3-6.5 3.8-9z"/></svg>`,
};

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

async function loadData() {
  const res = await fetch('data.json');
  if (!res.ok) throw new Error('Could not load data.json (status ' + res.status + ')');
  return res.json();
}

function renderHero(personal) {
  document.getElementById('nav-initials').textContent = personal.initials || '';
  document.getElementById('hero-kicker').textContent = '// ' + (personal.heroKicker || 'portfolio');
  document.getElementById('hero-name').textContent = personal.name;
  document.getElementById('hero-role').textContent = personal.role;
  document.getElementById('hero-tagline').textContent = personal.tagline;
  document.getElementById('hero-location').textContent =
    'based in — ' + personal.location + (personal.availability ? ' · ' + personal.availability : '');
  document.getElementById('resume-link').href = personal.resumeUrl || '#';
  document.getElementById('contact-email').textContent = personal.email;
  document.getElementById('contact-email').href = 'mailto:' + personal.email;
  const phoneEl = document.getElementById('contact-phone');
  if (personal.phone) {
    phoneEl.textContent = personal.phone;
  } else {
    phoneEl.classList.add('hidden');
  }
  document.getElementById('footer-name').textContent = personal.name;
  document.getElementById('contact-status').textContent = '// ' + (personal.availability || 'available');
  document.getElementById('year').textContent = new Date().getFullYear();

  const avatarImg = document.getElementById('avatar-img');
  const avatarFallback = document.getElementById('avatar-fallback');
  avatarFallback.textContent = personal.initials || '';
  if (personal.avatarUrl) {
    avatarImg.src = personal.avatarUrl;
    avatarImg.alt = personal.name || '';
    avatarImg.addEventListener('load', () => {
      avatarImg.classList.remove('hidden');
      avatarFallback.classList.add('hidden');
    });
    avatarImg.addEventListener('error', () => {
      avatarImg.classList.add('hidden');
      avatarFallback.classList.remove('hidden');
    });
  }
}

function renderAbout(about) {
  const summaryWrap = document.getElementById('about-summary');
  (about.summary || []).forEach((p) => {
    summaryWrap.appendChild(el('p', '', p));
  });

  const specList = document.getElementById('spec-list');
  (about.specs || []).forEach((spec) => {
    const row = el('div', 'flex items-center justify-between gap-4 py-3');
    row.appendChild(el('dt', 'font-mono text-xs text-muted', spec.label));
    row.appendChild(el('dd', 'text-sm text-ink text-right', spec.value));
    specList.appendChild(row);
  });

  const eduList = document.getElementById('education-list');
  (about.education || []).forEach((ed) => {
    const li = el('li', 'flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 border-l-2 border-line pl-4');
    li.appendChild(el('span', 'text-ink', `${ed.degree} <span class="text-muted">— ${ed.institution}</span>`));
    li.appendChild(el('span', 'font-mono text-xs text-muted whitespace-nowrap', ed.period));
    eduList.appendChild(li);
  });

  const trainList = document.getElementById('trainings-list');
  (about.trainings || []).forEach((t) => {
    const li = el('li', 'border-l-2 border-line pl-4');
    const head = el('div', 'flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1');
    head.appendChild(el('span', 'text-ink', `${t.name} <span class="text-muted">— ${t.provider}</span>`));
    head.appendChild(el('span', 'font-mono text-xs text-muted whitespace-nowrap', t.year));
    li.appendChild(head);
    if (t.description) {
      li.appendChild(el('p', 'text-sm text-muted mt-1', t.description));
    }
    trainList.appendChild(li);
  });
}

function renderSkills(skills) {
  const grid = document.getElementById('skills-grid');
  skills.forEach((group) => {
    const accentClass = group.accent === 'cyan' ? 'border-cyan text-cyan' : 'border-copper text-copper';
    const block = el('div', '');
    block.appendChild(el('h3', `font-mono text-xs mb-4 pb-2 border-b ${accentClass}`, group.category));
    const chipWrap = el('div', 'flex flex-wrap gap-2');
    group.items.forEach((item) => {
      chipWrap.appendChild(el('span', 'px-3 py-1.5 rounded border border-line text-sm text-ink bg-surface/60', item));
    });
    block.appendChild(chipWrap);
    grid.appendChild(block);
  });
}

function projectRow(project) {
  const row = el('article', 'row-link group py-7 first:pt-0 last:pb-0 hover:bg-surface/40 -mx-4 px-4 rounded flex flex-col sm:flex-row gap-6');

  // thumbnail — hides itself cleanly if the image path doesn't resolve yet
  const thumbWrap = el('div', 'shrink-0 w-full sm:w-40 h-28 rounded border border-line bg-surface2 overflow-hidden flex items-center justify-center');
  if (project.image) {
    const img = el('img', 'w-full h-full object-cover');
    img.src = project.image;
    img.alt = project.title || '';
    img.addEventListener('error', () => {
      thumbWrap.innerHTML = '';
      thumbWrap.appendChild(el('span', 'font-mono text-[10px] text-muted', ICONS.code));
    });
    thumbWrap.appendChild(img);
  } else {
    thumbWrap.appendChild(el('span', 'font-mono text-[10px] text-muted', ICONS.code));
  }
  row.appendChild(thumbWrap);

  const body = el('div', 'flex-1 min-w-0');

  body.appendChild(el('h3', 'font-display text-xl font-semibold text-ink group-hover:text-copper transition-colors', project.title));
  body.appendChild(el('p', 'mt-3 text-muted leading-relaxed max-w-2xl', project.description));

  const tagWrap = el('div', 'mt-4 flex flex-wrap gap-2');
  (project.tags || []).forEach((tag) => {
    tagWrap.appendChild(el('span', 'font-mono text-[11px] text-muted border border-line rounded px-2 py-1', tag));
  });
  body.appendChild(tagWrap);

  if (project.link) {
    const links = el('div', 'mt-5 flex flex-wrap gap-5 font-mono text-sm');
    const a = el('a', 'inline-flex items-center gap-2 text-ink hover:text-copper transition-colors', ICONS.external + ' view project');
    a.href = project.link;
    a.target = '_blank';
    a.rel = 'noopener';
    links.appendChild(a);
    body.appendChild(links);
  }

  row.appendChild(body);
  return row;
}

function renderProjects(projects) {
  const list = document.getElementById('projects-list');
  const filterWrap = document.getElementById('project-filters');

  const allTags = ['all', ...new Set(projects.flatMap((p) => p.tags || []))];

  function draw(filter) {
    list.innerHTML = '';
    const items = filter === 'all' ? projects : projects.filter((p) => (p.tags || []).includes(filter));
    if (items.length === 0) {
      list.appendChild(el('p', 'text-muted py-10 text-center', 'No projects match this filter yet.'));
      return;
    }
    items.forEach((p) => list.appendChild(projectRow(p)));
  }

  allTags.forEach((tag) => {
    const btn = el('button', 'px-3 py-1.5 rounded border border-line text-muted hover:text-ink hover:border-cyan/50 transition-colors data-filter', tag);
    btn.dataset.filter = tag;
    if (tag === 'all') btn.classList.add('text-ink', 'border-copper/60');
    btn.addEventListener('click', () => {
      filterWrap.querySelectorAll('button').forEach((b) => b.classList.remove('text-ink', 'border-copper/60'));
      btn.classList.add('text-ink', 'border-copper/60');
      draw(tag);
    });
    filterWrap.appendChild(btn);
  });

  draw('all');
}

function renderSocial(socials) {
  const wrap = document.getElementById('social-list');
  (socials || []).forEach((s) => {
    const label = s.display || s.platform;
    const a = el(
      'a',
      'row-link flex items-center justify-between gap-3 border border-line rounded px-4 py-3 hover:border-copper/50 hover:bg-surface/50',
      `<span class="flex items-center gap-3 text-ink">${s.platform === 'Email' ? ICONS.mail : ICONS.link}${s.platform}</span><span class="text-muted text-xs">${label}</span>`
    );
    a.href = s.url;
    if (!s.url.startsWith('mailto:')) {
      a.target = '_blank';
      a.rel = 'noopener';
    }
    wrap.appendChild(a);
  });
}

function setupMobileMenu() {
  const btn = document.getElementById('menu-btn');
  const menu = document.getElementById('mobile-menu');
  btn.addEventListener('click', () => {
    const isOpen = !menu.classList.contains('hidden');
    menu.classList.toggle('hidden');
    btn.setAttribute('aria-expanded', String(!isOpen));
  });
  menu.querySelectorAll('.mobile-link').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
}

function setupActiveNav() {
  const sections = ['about', 'skills', 'projects', 'contact'].map((id) => document.getElementById(id));
  const links = document.querySelectorAll('.nav-link');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id));
        }
      });
    },
    { rootMargin: '-40% 0px -50% 0px' }
  );
  sections.forEach((s) => s && observer.observe(s));
}

function showError(message) {
  const main = document.getElementById('main');
  main.innerHTML = `
    <div class="max-w-2xl mx-auto px-6 py-32 text-center">
      <p class="font-mono text-xs text-copper mb-4">// load error</p>
      <h1 class="font-display text-2xl font-semibold mb-4">Couldn't load data.json</h1>
      <p class="text-muted leading-relaxed">${message}</p>
      <p class="text-muted mt-4 leading-relaxed">This usually means the page was opened directly as a file. Serve the folder with a local server (see README.md) and reload.</p>
    </div>`;
}

(async function init() {
  setupMobileMenu();
  try {
    const data = await loadData();
    renderHero(data.personal);
    renderAbout(data.about);
    renderSkills(data.about.skills || []);
    renderProjects(data.projects);
    renderSocial(data.socials);
    setupActiveNav();
  } catch (err) {
    console.error(err);
    showError(err.message);
  }
})();
