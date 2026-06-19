(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileMenu() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            var expanded = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!expanded));
            menu.classList.toggle("hidden");
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot") || 0));
                start();
            });
        });
        root.addEventListener("mouseenter", function () {
            window.clearInterval(timer);
        });
        root.addEventListener("mouseleave", start);
        start();
    }

    function initPlayer() {
        var players = document.querySelectorAll("[data-player]");
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var cover = player.querySelector(".player-cover");
            if (!video || !cover) {
                return;
            }
            var stream = video.getAttribute("data-stream");
            var hls;
            function bindStream() {
                if (video.getAttribute("data-ready") === "true") {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
                video.setAttribute("data-ready", "true");
            }
            function playVideo() {
                bindStream();
                cover.classList.add("is-hidden");
                video.setAttribute("controls", "controls");
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {
                        video.setAttribute("controls", "controls");
                    });
                }
            }
            cover.addEventListener("click", playVideo);
            video.addEventListener("click", function () {
                if (video.paused) {
                    playVideo();
                }
            });
            player.addEventListener("keydown", function (event) {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    playVideo();
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    function renderSearchCard(item) {
        return [
            '<a href="' + item.url + '" class="group block bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 movie-card poster-card">',
            '<div class="relative aspect-[3/4] overflow-hidden">',
            '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy">',
            '<div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center"><span class="play-ring"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7L8 5Z"></path></svg></span></div>',
            '<div class="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-white text-xs">' + escapeHtml(item.year) + '</div>',
            '</div>',
            '<div class="p-4">',
            '<div class="flex items-center gap-2 mb-2 card-meta"><span class="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">' + escapeHtml(item.region) + '</span><span class="text-xs text-neutral-500">' + escapeHtml(item.type) + '</span></div>',
            '<h2 class="font-semibold text-neutral-800 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2 card-title">' + escapeHtml(item.title) + '</h2>',
            '<p class="text-sm text-neutral-600 line-clamp-2 mb-3">' + escapeHtml(item.oneLine) + '</p>',
            '<div class="flex items-center justify-between text-xs text-neutral-500"><span>' + escapeHtml(item.genre) + '</span><span class="score-inline">' + escapeHtml(item.score) + '</span></div>',
            '</div>',
            '</a>'
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initSearchPage() {
        var results = document.getElementById("searchResults");
        var summary = document.getElementById("searchSummary");
        var input = document.getElementById("searchInput");
        var data = window.SITE_INDEX || [];
        if (!results || !summary || !data.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        if (input) {
            input.value = query;
        }
        if (!query) {
            return;
        }
        var words = query.toLowerCase().split(/\s+/).filter(Boolean);
        var matches = data.filter(function (item) {
            var haystack = item.search.toLowerCase();
            return words.every(function (word) {
                return haystack.indexOf(word) !== -1;
            });
        }).slice(0, 120);
        summary.textContent = matches.length ? "搜索结果" : "暂未找到匹配内容，换个关键词试试。";
        results.innerHTML = matches.map(renderSearchCard).join("");
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initPlayer();
        initSearchPage();
    });
})();
