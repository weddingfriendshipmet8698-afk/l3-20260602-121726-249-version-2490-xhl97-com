document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  var activeIndex = 0;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeIndex);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      setSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      setSlide(activeIndex + 1);
    }, 5200);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      var value = input.value.trim().toLowerCase();
      var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));

      cards.forEach(function (card) {
        var content = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-region') || '',
          card.textContent || ''
        ].join(' ').toLowerCase();

        card.classList.toggle('hidden-card', value && content.indexOf(value) === -1);
      });
    });
  });

  var player = document.querySelector('[data-player]');
  var overlay = document.querySelector('[data-player-overlay]');

  if (player && overlay) {
    var streamUrl = player.getAttribute('data-stream');
    var hasLoaded = false;

    function loadAndPlay() {
      if (!hasLoaded) {
        if (player.canPlayType('application/vnd.apple.mpegurl')) {
          player.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(streamUrl);
          hls.attachMedia(player);
        } else {
          player.src = streamUrl;
        }
        hasLoaded = true;
      }

      overlay.classList.add('hidden');
      var playPromise = player.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    overlay.addEventListener('click', loadAndPlay);
    player.addEventListener('click', function () {
      if (player.paused) {
        loadAndPlay();
      }
    });
  }
});
