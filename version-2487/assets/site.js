(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(parseInt(dot.getAttribute("data-hero-dot"), 10));
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }

        restart();
    }

    function setupFilters() {
        var bars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-bar]"));
        bars.forEach(function (bar) {
            var list = document.querySelector("[data-filter-list]");
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll(".searchable-item"));
            bar.addEventListener("click", function (event) {
                var button = event.target.closest("[data-filter]");
                if (!button) {
                    return;
                }
                var value = button.getAttribute("data-filter");
                Array.prototype.slice.call(bar.querySelectorAll("[data-filter]")).forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                cards.forEach(function (card) {
                    var cardType = card.getAttribute("data-type") || "";
                    var visible = value === "all" || cardType.indexOf(value) !== -1;
                    card.classList.toggle("hidden-by-filter", !visible);
                });
            });
        });
    }

    function setupInlineSearch() {
        var input = document.getElementById("inlineMovieSearch");
        var list = document.querySelector("[data-filter-list]");
        if (!input || !list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll(".searchable-item"));
        input.addEventListener("input", function () {
            var keyword = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var source = (card.getAttribute("data-search") || "").toLowerCase();
                var visible = keyword === "" || source.indexOf(keyword) !== -1;
                card.classList.toggle("hidden-by-filter", !visible);
            });
        });
    }

    function setupSearchPage() {
        var input = document.getElementById("searchPageInput");
        var list = document.querySelector("[data-search-list]");
        if (!input || !list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll(".searchable-item"));
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;

        function apply() {
            var keyword = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var source = (card.getAttribute("data-search") || "").toLowerCase();
                var visible = keyword === "" || source.indexOf(keyword) !== -1;
                card.classList.toggle("hidden-by-filter", !visible);
            });
        }

        input.addEventListener("input", apply);
        apply();
    }

    window.initMoviePlayer = function (sourceUrl) {
        var video = document.getElementById("moviePlayer");
        var overlay = document.getElementById("playerOverlay");
        var attached = false;
        var hlsInstance = null;

        if (!video || !sourceUrl) {
            return;
        }

        function start() {
            if (!attached) {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = sourceUrl;
                    attached = true;
                    video.play().catch(function () {});
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(sourceUrl);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        attached = true;
                        video.play().catch(function () {});
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                        if (!data || !data.fatal || !hlsInstance) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hlsInstance.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hlsInstance.recoverMediaError();
                        } else {
                            hlsInstance.destroy();
                        }
                    });
                } else {
                    video.src = sourceUrl;
                    attached = true;
                    video.play().catch(function () {});
                }
            } else {
                video.play().catch(function () {});
            }

            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        }

        if (overlay) {
            overlay.addEventListener("click", start);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupInlineSearch();
        setupSearchPage();
    });
})();
