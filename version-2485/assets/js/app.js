(function() {
  var toggle = document.querySelector("[data-menu-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");
  if (toggle && panel) {
    toggle.addEventListener("click", function() {
      panel.classList.toggle("open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function(slide, i) {
      slide.classList.toggle("active", i === current);
    });
    dots.forEach(function(dot, i) {
      dot.classList.toggle("active", i === current);
    });
  }

  dots.forEach(function(dot, i) {
    dot.addEventListener("click", function() {
      showSlide(i);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    setInterval(function() {
      showSlide(current + 1);
    }, 5600);
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get("q") || "";
  var filterInput = document.querySelector("[data-filter-input]");
  var filterButton = document.querySelector("[data-filter-button]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title]"));
  var empty = document.querySelector("[data-empty-state]");

  function applyFilter(value) {
    var keyword = String(value || "").trim().toLowerCase();
    var shown = 0;
    cards.forEach(function(card) {
      var haystack = [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-year") || "",
        card.getAttribute("data-tags") || "",
        card.getAttribute("data-category") || "",
        card.textContent || ""
      ].join(" ").toLowerCase();
      var match = !keyword || haystack.indexOf(keyword) !== -1;
      card.style.display = match ? "" : "none";
      if (match) {
        shown += 1;
      }
    });
    if (empty) {
      empty.style.display = shown ? "none" : "block";
    }
  }

  if (filterInput) {
    filterInput.value = query;
    applyFilter(query);
    filterInput.addEventListener("input", function() {
      applyFilter(filterInput.value);
    });
  }

  if (filterButton && filterInput) {
    filterButton.addEventListener("click", function() {
      applyFilter(filterInput.value);
    });
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
    script.onload = callback;
    document.head.appendChild(script);
  }

  function startPlayer(shell, video, url) {
    if (!url) {
      return;
    }
    shell.classList.add("playing");
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.play().catch(function() {});
      return;
    }
    loadHls(function() {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
          video.play().catch(function() {});
        });
      } else {
        video.src = url;
        video.play().catch(function() {});
      }
    });
  }

  var shell = document.querySelector("[data-player-shell]");
  var player = document.querySelector("[data-video-player]");
  var playButton = document.querySelector("[data-play-button]");

  if (shell && player) {
    var url = player.getAttribute("data-video-url") || "";
    var start = function() {
      startPlayer(shell, player, url);
    };
    if (playButton) {
      playButton.addEventListener("click", start);
    }
    player.addEventListener("click", function() {
      if (player.paused) {
        start();
      }
    });
  }
})();
