(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function toggleHidden(element, force) {
    if (!element) {
      return;
    }
    if (typeof force === "boolean") {
      element.hidden = force;
    } else {
      element.hidden = !element.hidden;
    }
  }

  function initHeader() {
    var searchToggle = $("[data-search-toggle]");
    var searchBox = $("[data-search-box]");
    var searchForm = $("[data-search-form]");
    var searchInput = searchForm ? searchForm.querySelector("input") : null;
    var searchResults = $("[data-search-results]");
    var menuToggle = $("[data-menu-toggle]");
    var mobileNav = $("[data-mobile-nav]");

    if (searchToggle && searchBox) {
      searchToggle.addEventListener("click", function () {
        toggleHidden(searchBox);
        if (!searchBox.hidden && searchInput) {
          searchInput.focus();
        }
      });
    }

    if (menuToggle && mobileNav) {
      menuToggle.addEventListener("click", function () {
        toggleHidden(mobileNav);
      });
    }

    if (searchForm && searchInput && searchResults) {
      searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        renderSearch(searchInput.value, searchResults);
      });
      searchInput.addEventListener("input", function () {
        if (searchInput.value.trim().length >= 2) {
          renderSearch(searchInput.value, searchResults);
        } else {
          searchResults.innerHTML = "";
        }
      });
    }
  }

  function renderSearch(query, target) {
    var q = String(query || "").trim().toLowerCase();
    var data = window.__SEARCH_INDEX__ || [];
    if (!q) {
      target.innerHTML = "";
      return;
    }
    var result = data.filter(function (item) {
      return [item.title, item.year, item.region, item.type, item.genre, item.category].join(" ").toLowerCase().indexOf(q) !== -1;
    }).slice(0, 12);
    if (!result.length) {
      target.innerHTML = '<p class="empty-result">没有找到相关影片</p>';
      return;
    }
    target.innerHTML = result.map(function (item) {
      return '<a class="search-item" href="' + item.url + '"><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml([item.region, item.type, item.year, item.genre].filter(Boolean).join(' · ')) + '</span></a>';
    }).join("");
  }

  function escapeHtml(text) {
    return String(text || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function initHero() {
    var hero = $("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = $all(".hero-slide", hero);
    var dots = $all("[data-hero-dot]", hero);
    var prev = $("[data-hero-prev]", hero);
    var next = $("[data-hero-next]", hero);
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  window.initMoviePlayer = function (config) {
    var video = document.getElementById(config.videoId);
    var buttons = $all(config.buttonSelector);
    var sourceUrl = config.url;
    var hlsInstance = null;
    var ready = false;

    if (!video || !sourceUrl) {
      return;
    }

    function load() {
      if (ready) {
        play();
        return;
      }
      ready = true;
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
      buttons.forEach(function (button) {
        button.classList.add("is-hidden");
      });
      play();
    }

    function play() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", load);
    });

    video.addEventListener("click", function () {
      if (!ready || video.paused) {
        load();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    initHero();
  });
})();
