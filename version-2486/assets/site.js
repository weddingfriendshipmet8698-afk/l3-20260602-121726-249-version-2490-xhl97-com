(() => {
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-main-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const next = hero.querySelector('[data-hero-next]');
    const prev = hero.querySelector('[data-hero-prev]');
    let active = 0;

    const show = (index) => {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    };

    if (next) {
      next.addEventListener('click', () => show(active + 1));
    }

    if (prev) {
      prev.addEventListener('click', () => show(active - 1));
    }

    dots.forEach((dot, dotIndex) => {
      dot.addEventListener('click', () => show(dotIndex));
    });

    show(0);
    window.setInterval(() => show(active + 1), 5000);
  }

  const searchInput = document.querySelector('[data-search-input]');
  const yearSelect = document.querySelector('[data-year-filter]');
  const filterButtons = Array.from(document.querySelectorAll('[data-filter-value]'));
  const cards = Array.from(document.querySelectorAll('[data-title]'));

  const normalize = (value) => (value || '').toString().trim().toLowerCase();

  const applyFilters = () => {
    const keyword = normalize(searchInput ? searchInput.value : '');
    const year = yearSelect ? yearSelect.value : '';
    const activeButton = filterButtons.find((button) => button.classList.contains('is-active'));
    const filterValue = activeButton ? activeButton.getAttribute('data-filter-value') : '';

    cards.forEach((card) => {
      const pool = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.textContent
      ].join(' '));
      const cardYear = card.getAttribute('data-year') || '';
      const cardGenre = normalize(card.getAttribute('data-genre'));
      const keywordOk = !keyword || pool.includes(keyword);
      const yearOk = !year || cardYear === year;
      const filterOk = !filterValue || cardGenre.includes(normalize(filterValue)) || pool.includes(normalize(filterValue));

      card.classList.toggle('hidden-card', !(keywordOk && yearOk && filterOk));
    });
  };

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  if (yearSelect) {
    yearSelect.addEventListener('change', applyFilters);
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((item) => item.classList.remove('is-active'));
      button.classList.add('is-active');
      applyFilters();
    });
  });
})();
