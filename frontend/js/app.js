// Main App Controller
const App = {
  async init() {
    // Initialize slider
    await Slider.init();
    // Load categories and articles
    await this.loadCategories();
    await this.loadArticles();
    // Initialize animations
    Animations.init();
    // Mobile menu
    this.initMobileMenu();
  },

  async loadCategories() {
    const data = await Api.getCategories();
    const container = document.getElementById('categoryFilters');
    const cats = data.categories || [];
    container.innerHTML = `<button class="filter-btn active" data-category="all">Todos</button>` +
      cats.map(c => `<button class="filter-btn" data-category="${c.slug}" style="--cat-color:${c.color}">${c.name}</button>`).join('');

    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.loadArticles(btn.dataset.category === 'all' ? null : btn.dataset.category);
    });
  },

  async loadArticles(category = null) {
    const grid = document.getElementById('articlesGrid');
    const loader = document.getElementById('articlesLoader');

    // Show skeletons
    grid.innerHTML = Array(9).fill(0).map(() => `
      <div class="skeleton-card">
        <div class="skeleton-image"></div>
        <div class="skeleton-body">
          <div class="skeleton-line w-40"></div>
          <div class="skeleton-line w-80"></div>
          <div class="skeleton-line w-60"></div>
        </div>
      </div>
    `).join('');
    loader.style.display = 'none';

    const params = { limit: 9 };
    if (category) params.category = category;
    const data = await Api.getPosts(params);
    const posts = data.posts || [];

    // Small delay for visual effect
    await new Promise(r => setTimeout(r, 300));

    if (posts.length === 0) {
      grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#94a3b8;padding:40px;">No hay artículos disponibles.</p>';
      return;
    }

    grid.innerHTML = posts.map((post, i) => {
      const catColor = post.category ? post.category.color : '#192D63';
      const date = post.published_at ? new Date(post.published_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
      const authorName = post.author ? post.author.full_name : 'DGIP';

      // Placeholder image SVG when no cover image
      const imgSrc = post.cover_image || `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="225"><rect fill="${catColor}" width="400" height="225" rx="0"/><text x="200" y="120" text-anchor="middle" fill="rgba(255,255,255,0.2)" font-family="sans-serif" font-size="48" font-weight="bold">DGIP</text></svg>`)}`;

      return `
        <article class="article-card animate-on-scroll" data-delay="${i * 0.08}s" onclick="App.openArticle('${post.slug}')">
          <div class="card-image">
            <img src="${imgSrc}" alt="${post.title}" loading="lazy">
            <span class="card-category" style="background:${catColor}">${post.category ? post.category.name : 'General'}</span>
          </div>
          <div class="card-body">
            <h3 class="card-title">${post.title}</h3>
            <p class="card-excerpt">${post.excerpt || ''}</p>
            <div class="card-meta">
              <span class="card-author"><i class="fas fa-user-circle"></i> ${authorName}</span>
              <span><i class="far fa-calendar"></i> ${date}</span>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Re-observe new elements for animation
    Animations.initScrollObserver();
  },

  async openArticle(slug) {
    const modal = document.getElementById('articleModal');
    const content = document.getElementById('modalContent');

    try {
      const data = await Api.getPost(slug);
      const post = data.post;
      const date = post.published_at ? new Date(post.published_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

      content.innerHTML = `
        <button class="close-btn" onclick="closeArticle()"><i class="fas fa-times"></i></button>
        ${post.cover_image ? `<img src="${post.cover_image}" class="article-full-image" alt="${post.title}">` : ''}
        <div style="display:flex;gap:12px;align-items:center;margin-bottom:16px;">
          ${post.category ? `<span style="padding:4px 12px;background:${post.category.color};color:#fff;border-radius:4px;font-size:0.75rem;font-weight:600;">${post.category.name}</span>` : ''}
          <span style="color:#94a3b8;font-size:0.85rem;">${date}</span>
        </div>
        <h1 class="article-full-title">${post.title}</h1>
        <div class="article-full-body">${post.content}</div>
      `;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    } catch (err) {
      console.error('Error opening article:', err);
    }
  },

  initMobileMenu() {
    const toggle = document.getElementById('mobileToggle');
    const nav = document.getElementById('headerNav');
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      toggle.classList.toggle('active');
    });
  }
};

function closeArticle() {
  document.getElementById('articleModal').classList.remove('active');
  document.body.style.overflow = '';
}

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
