// Hero Slider Controller
const Slider = {
  slides: [],
  currentIndex: 0,
  interval: null,
  duration: 5000,
  progressWidth: 0,
  progressInterval: null,

  async init() {
    const data = await Api.getFeatured();
    this.slides = data.posts || [];
    if (this.slides.length === 0) return;
    this.render();
    this.startAutoPlay();
    this.bindEvents();
  },

  render() {
    const track = document.getElementById('sliderTrack');
    const dots = document.getElementById('sliderDots');

    // Generate placeholder backgrounds for slides without images
    const bgColors = ['#192D63', '#0F1B3D', '#2A4080', '#1a3570', '#152856', '#0d1a3a'];

    track.innerHTML = this.slides.map((slide, i) => {
      const bg = slide.cover_image
        ? `url('${slide.cover_image}')`
        : `linear-gradient(135deg, ${bgColors[i % bgColors.length]} 0%, ${bgColors[(i+1) % bgColors.length]} 100%)`;
      return `
        <div class="slide ${i === 0 ? 'active' : ''}" style="background-image:${bg}" data-slug="${slide.slug}">
          <div class="slide-overlay"></div>
          <div class="slide-content">
            <span class="slide-category">${slide.category ? slide.category.name : 'Destacado'}</span>
            <h2 class="slide-title">${slide.title}</h2>
            <p class="slide-excerpt">${slide.excerpt || ''}</p>
          </div>
        </div>
      `;
    }).join('');

    dots.innerHTML = this.slides.map((_, i) =>
      `<button class="slider-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Ir a slide ${i + 1}"></button>`
    ).join('');
  },

  goTo(index) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.slider-dot');
    if (slides.length === 0) return;

    slides[this.currentIndex].classList.remove('active');
    dots[this.currentIndex].classList.remove('active');

    this.currentIndex = (index + slides.length) % slides.length;

    slides[this.currentIndex].classList.add('active');
    dots[this.currentIndex].classList.add('active');

    this.resetProgress();
  },

  next() { this.goTo(this.currentIndex + 1); },
  prev() { this.goTo(this.currentIndex - 1); },

  startAutoPlay() {
    this.resetProgress();
    this.interval = setInterval(() => this.next(), this.duration);
  },

  stopAutoPlay() {
    clearInterval(this.interval);
    clearInterval(this.progressInterval);
  },

  resetProgress() {
    const bar = document.getElementById('sliderProgress');
    this.progressWidth = 0;
    bar.style.width = '0%';
    clearInterval(this.progressInterval);
    this.progressInterval = setInterval(() => {
      this.progressWidth += (100 / (this.duration / 50));
      bar.style.width = Math.min(this.progressWidth, 100) + '%';
    }, 50);
  },

  bindEvents() {
    document.getElementById('sliderPrev').addEventListener('click', () => {
      this.stopAutoPlay();
      this.prev();
      this.startAutoPlay();
    });
    document.getElementById('sliderNext').addEventListener('click', () => {
      this.stopAutoPlay();
      this.next();
      this.startAutoPlay();
    });
    document.getElementById('sliderDots').addEventListener('click', (e) => {
      const dot = e.target.closest('.slider-dot');
      if (!dot) return;
      this.stopAutoPlay();
      this.goTo(parseInt(dot.dataset.index));
      this.startAutoPlay();
    });

    // Touch/swipe support
    let startX = 0;
    const slider = document.getElementById('heroSlider');
    slider.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', (e) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        this.stopAutoPlay();
        diff > 0 ? this.next() : this.prev();
        this.startAutoPlay();
      }
    }, { passive: true });

    // Pause on hover
    slider.addEventListener('mouseenter', () => this.stopAutoPlay());
    slider.addEventListener('mouseleave', () => this.startAutoPlay());
  }
};
