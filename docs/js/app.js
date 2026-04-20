// Main App Controller
const App = {
  async init() {
    this.initMobileMenu();
    this.initArticleModal();
    
    // Load categories for global bar
    await this.initGlobalFilters();

    // Load dynamic layout
    const layout = await Api.getLayout();
    await this.renderLayout(layout);
    
    // Initialize animations
    Animations.init();
  },

  async initGlobalFilters() {
    const container = document.getElementById('globalFilters');
    if (!container) return;

    try {
      const data = await Api.getCategories();
      const cats = data.categories || [];
      
      container.innerHTML = `
        <div class="filters-inner">
          <button class="filter-tag active" data-category="all">Todos</button>
          ${cats.map(c => `<button class="filter-tag" data-category="${c.slug}" style="--cat-color:${c.color}">${c.name}</button>`).join('')}
        </div>
      `;

      container.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-tag');
        if (!btn) return;
        
        container.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Broadcast filter change to any active feed modules
        window.currentCategoryFilter = btn.dataset.category === 'all' ? null : btn.dataset.category;
        const event = new CustomEvent('globalFilterChange', { 
          detail: { category: window.currentCategoryFilter } 
        });
        window.dispatchEvent(event);
      });
    } catch (err) { console.error('Error init filters:', err); }
  },

  async renderLayout(layout) {
    const heroContainer = document.getElementById('moduleHero');
    const mainContainer = document.getElementById('moduleContainer');
    const leftSidebar = document.getElementById('leftSidebar');
    const rightSidebar = document.getElementById('rightSidebar');
    
    if (mainContainer) mainContainer.innerHTML = '';
    if (leftSidebar) leftSidebar.innerHTML = '';
    if (rightSidebar) rightSidebar.innerHTML = '';
    if (heroContainer) heroContainer.innerHTML = '';
    
    for (const section of layout) {
      try {
        const config = (typeof section.config === 'string' ? JSON.parse(section.config) : section.config) || {};
        
        if (section.type === 'hero_slider') {
          heroContainer.innerHTML = this.templates.heroSlider();
          await Slider.init(config);
          continue;
        }
        
        let container = mainContainer;
        if (section.position === 'left' && leftSidebar) container = leftSidebar;
        else if (section.position === 'right' && rightSidebar) container = rightSidebar;
        
        if (!container) continue;

        const sectionEl = document.createElement('div');
        sectionEl.className = 'module-wrapper';
        sectionEl.id = `section-${section.id || Math.random().toString(36).substr(2, 9)}`;
        container.appendChild(sectionEl);
        await this.renderModule(section, sectionEl);
      } catch (err) {
        console.error('Error rendering section:', section, err);
      }
    }
  },

  async renderModule(section, container) {
    const config = (typeof section.config === 'string' ? JSON.parse(section.config) : section.config) || {};
    
    switch (section.type) {
      case 'separator':
        container.innerHTML = this.templates.separator(config);
        break;
      
      case 'articles_feed':
        const feedTitle = config.title_visible || config.title || 'Últimos Artículos';
        container.innerHTML = this.templates.articlesFeed(section.id, feedTitle);
        await this.loadArticlesModule(section.id, config);
        break;
      
      case 'banner_horizontal':
        container.innerHTML = this.templates.bannerHorizontal(config);
        break;

      case 'html_custom':
        container.innerHTML = this.templates.htmlCustom(config);
        break;
    }
  },

  templates: {
    heroSlider: () => `
      <section class="hero-slider" id="heroSlider" aria-label="Artículos destacados">
        <div class="slider-track" id="sliderTrack">
          <!-- Slides injected via JS -->
        </div>
        <div class="slider-controls">
          <button class="slider-arrow slider-prev" id="sliderPrev"><i class="fas fa-chevron-left"></i></button>
          <div class="slider-dots" id="sliderDots"></div>
          <button class="slider-arrow slider-next" id="sliderNext"><i class="fas fa-chevron-right"></i></button>
        </div>
        <div class="slider-progress" id="sliderProgress"></div>
        <div class="slider-scroll-down">
          <span>DESLIZA</span>
          <div class="scroll-mouse">
            <div class="scroll-wheel"></div>
          </div>
        </div>
      </section>
    `,
    separator: (c) => `
      <section class="section-separator">
        <div class="separator-inner">
          <div class="separator-line"></div>
          <div class="separator-content">
            <span class="separator-icon"><i class="${c.icon || 'fas fa-flask'}"></i></span>
            <div class="separator-text-wrapper">
              <h2 class="separator-text">${c.text_sep || c.text || ''}</h2>
              <p class="separator-sub">${c.sub_sep || c.sub || ''}</p>
            </div>
          </div>
          <div class="separator-line"></div>
        </div>
      </section>
    `,
    articlesFeed: (id, title) => `
      <section class="articles-section" id="feed-${id}">
        <div class="articles-container">
          <div class="section-header">
            <h2 class="section-title">${title}</h2>
          </div>
          <div class="articles-grid" id="grid-${id}"></div>
          <div class="load-more-container" style="text-align: center; margin-top: 48px; position: relative;">
            <div style="position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: var(--border-light); z-index: 0;"></div>
            <a href="javascript:void(0)" onclick="App.loadMoreArticles('${id}', this)" class="btn-cta" style="position: relative; z-index: 1; padding: 10px 32px; background: var(--bg-white); color: var(--unach-azul); border: 1px solid var(--border-subtle); box-shadow: var(--shadow-sm);"><i class="fas fa-plus"></i> Leer más</a>
          </div>
        </div>
      </section>
    `,
    bannerHorizontal: (c) => `
      <section class="extensor-section">
        <div class="extensor-bg"></div>
        <div class="extensor-content">
          <span class="extensor-badge">UNACH</span>
          <h2 class="extensor-title">${c.title_banner || c.title || ''}</h2>
          <div class="extensor-text">${c.text || ''}</div>
          <div class="extensor-actions">
            <a href="${c.button_link || '#'}" class="btn-cta" target="_blank">
              <i class="fas fa-arrow-right"></i> ${c.button_text || 'Más información'}
            </a>
          </div>
        </div>
      </section>
    `,
    htmlCustom: (c) => `
      <section class="html-custom-section">
        ${c.html_content || c.html || ''}
      </section>
    `
  },

  async loadArticlesModule(id, config) {
    const grid = document.getElementById(`grid-${id}`);
    if (!grid) return;

    // Listen to global filter changes
    window.addEventListener('globalFilterChange', (e) => {
      this.fetchAndRenderArticles(grid, { ...config, category: e.detail.category });
    });

    grid.dataset.config = JSON.stringify(config);
    await this.fetchAndRenderArticles(grid, config);
  },

  async fetchAndRenderArticles(grid, config) {
    grid.innerHTML = Array(config.limit || 3).fill(0).map(() => `<div class="skeleton-card"><div class="skeleton-image"></div></div>`).join('');
    
    const params = { limit: config.limit || 3 };
    if (config.category) params.category = config.category;
    else if (config.category_id) params.category_id = config.category_id;
    
    const data = await Api.getPosts(params);
    const posts = data.posts || [];
    
    grid.innerHTML = posts.map((post, i) => {
      const catColor = post.category ? post.category.color : '#192D63';
      const date = post.published_at ? new Date(post.published_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : '';
      const imgSrc = post.cover_image || `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="225"><rect fill="${catColor}" width="400" height="225"/><text x="200" y="120" text-anchor="middle" fill="white" opacity="0.2">UNACH</text></svg>`)}`;

      return `
        <article class="article-card animate-reveal" data-delay="${i * 100}ms" onclick="App.openArticle('${post.slug}')">
          <div class="card-image">
            <img src="${imgSrc}" alt="${post.title}">
            <span class="card-category" style="background:${catColor}">${post.category ? post.category.name : 'Ciencia'}</span>
          </div>
          <div class="card-body">
            <h3 class="card-title">${post.title}</h3>
            <p class="card-excerpt">${post.excerpt || ''}</p>
            <div class="card-meta">
              <span><i class="far fa-calendar"></i> ${date}</span>
            </div>
          </div>
        </article>
      `;
    }).join('');
    
    Animations.initScrollObserver();
  },

  async loadMoreArticles(id, btn) {
    const grid = document.getElementById(`grid-${id}`);
    if (!grid) return;
    
    const currentCount = grid.querySelectorAll('.article-card').length;
    const limit = 3;
    
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...';
    btn.style.pointerEvents = 'none';
    
    const config = JSON.parse(grid.dataset.config || '{}');
    const params = { limit, offset: currentCount };
    
    if (window.currentCategoryFilter) {
      params.category = window.currentCategoryFilter;
    } else if (config.category_id) {
      params.category_id = config.category_id;
    }

    try {
      const data = await Api.getPosts(params);
      const posts = data.posts || [];
      
      if (posts.length === 0) {
        btn.innerHTML = '<i class="fas fa-check"></i> No hay más artículos';
        setTimeout(() => btn.parentElement.style.display = 'none', 2000);
        return;
      }

      const html = posts.map((post, i) => {
        const catColor = post.category ? post.category.color : '#192D63';
        const date = post.published_at ? new Date(post.published_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : '';
        const imgSrc = post.cover_image || `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="225"><rect fill="${catColor}" width="400" height="225"/><text x="200" y="120" text-anchor="middle" fill="white" opacity="0.2">UNACH</text></svg>`)}`;

        return `
          <article class="article-card animate-reveal" data-delay="${i * 100}ms" onclick="App.openArticle('${post.slug}')">
            <div class="card-image">
              <img src="${imgSrc}" alt="${post.title}">
              <span class="card-category" style="background:${catColor}">${post.category ? post.category.name : 'Ciencia'}</span>
            </div>
            <div class="card-body">
              <h3 class="card-title">${post.title}</h3>
              <p class="card-excerpt">${post.excerpt || ''}</p>
              <div class="card-meta">
                <span><i class="far fa-calendar"></i> ${date}</span>
              </div>
            </div>
          </article>
        `;
      }).join('');
      
      grid.insertAdjacentHTML('beforeend', html);
      Animations.initScrollObserver();
      
      btn.innerHTML = originalText;
      btn.style.pointerEvents = 'auto';
      
      if (posts.length < limit) {
        btn.parentElement.style.display = 'none';
      }
    } catch (e) {
      console.error(e);
      btn.innerHTML = originalText;
      btn.style.pointerEvents = 'auto';
    }
  },

  async openArticle(slug) {
    const modal = document.getElementById('articleModal');
    const content = document.getElementById('modalContent');

    try {
      const data = await Api.getPost(slug);
      const post = data.post;
      content.innerHTML = `
        <button class="close-btn" onclick="closeArticle()"><i class="fas fa-times"></i></button>
        ${post.cover_image ? `<img src="${post.cover_image}" class="article-full-image">` : ''}
        <h1 class="article-full-title">${post.title}</h1>
        <div class="article-full-body">${post.content}</div>
      `;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    } catch (err) { console.error(err); }
  },

  initMobileMenu() {
    const toggle = document.getElementById('mobileToggle');
    const nav = document.getElementById('headerNav');
    if (toggle) toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      toggle.classList.toggle('active');
    });
  },

  initArticleModal() {
    // Already in HTML
  }
};

function closeArticle() {
  document.getElementById('articleModal').classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => App.init());
window.App = App;
