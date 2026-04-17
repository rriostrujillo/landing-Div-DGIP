// Scroll animations and effects
const Animations = {
  init() {
    this.initScrollObserver();
    this.initHeaderScroll();
    this.initParallax();
  },

  initScrollObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Staggered animation for grid items
          if (entry.target.dataset.delay) {
            entry.target.style.transitionDelay = entry.target.dataset.delay;
          }
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
  },

  initHeaderScroll() {
    const header = document.getElementById('siteHeader');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY > 80) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      lastScroll = scrollY;
    }, { passive: true });
  },

  initParallax() {
    const extensor = document.querySelector('.extensor-bg');
    if (!extensor) return;

    window.addEventListener('scroll', () => {
      const rect = extensor.parentElement.getBoundingClientRect();
      const windowH = window.innerHeight;
      if (rect.top < windowH && rect.bottom > 0) {
        const progress = (windowH - rect.top) / (windowH + rect.height);
        const offset = (progress - 0.5) * 40;
        extensor.style.transform = `translateY(${offset}px)`;
      }
    }, { passive: true });
  }
};
