(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs('[data-menu-toggle]');
    var nav = qs('[data-main-nav]');

    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var slides = qsa('[data-hero-slide]');
    var dots = qsa('[data-hero-dot]');

    if (slides.length <= 1) {
      return;
    }

    var index = 0;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initFilters() {
    var panel = qs('[data-filter-panel]');

    if (!panel) {
      return;
    }

    var input = qs('[data-search-input]', panel);
    var clear = qs('[data-search-clear]', panel);
    var yearSelect = qs('[data-year-filter]', panel);
    var typeSelect = qs('[data-type-filter]', panel);
    var cards = qsa('[data-card]');
    var years = [];
    var types = [];

    cards.forEach(function (card) {
      var year = card.getAttribute('data-year') || '';
      var type = card.getAttribute('data-type') || '';

      if (year && years.indexOf(year) === -1) {
        years.push(year);
      }

      if (type && types.indexOf(type) === -1) {
        types.push(type);
      }
    });

    years.sort(function (a, b) {
      return Number(b) - Number(a);
    });
    types.sort();

    years.forEach(function (year) {
      var option = document.createElement('option');
      option.value = year;
      option.textContent = year + ' 年';
      yearSelect.appendChild(option);
    });

    types.forEach(function (type) {
      var option = document.createElement('option');
      option.value = type;
      option.textContent = type;
      typeSelect.appendChild(option);
    });

    function apply() {
      var keyword = (input.value || '').trim().toLowerCase();
      var year = yearSelect.value;
      var type = typeSelect.value;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-tags') || ''
        ].join(' ').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardType = card.getAttribute('data-type') || '';
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !year || cardYear === year;
        var matchType = !type || cardType === type;

        card.classList.toggle('hidden-card', !(matchKeyword && matchYear && matchType));
      });
    }

    input.addEventListener('input', apply);
    yearSelect.addEventListener('change', apply);
    typeSelect.addEventListener('change', apply);
    clear.addEventListener('click', function () {
      input.value = '';
      yearSelect.value = '';
      typeSelect.value = '';
      apply();
      input.focus();
    });
  }

  function initPlayer() {
    var video = qs('[data-player]');
    var button = qs('[data-play-button]');

    if (!video || !button) {
      return;
    }

    var src = video.getAttribute('data-src');
    var loaded = false;

    function loadAndPlay() {
      if (!src) {
        return;
      }

      if (loaded) {
        video.play().catch(function () {});
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {});
        }, { once: true });
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = src;
        video.play().catch(function () {});
      }
    }

    button.addEventListener('click', loadAndPlay);
    video.addEventListener('click', function () {
      if (video.paused) {
        loadAndPlay();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
