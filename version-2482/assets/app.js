document.addEventListener("DOMContentLoaded", function () {
    const menuButton = document.querySelector("[data-menu-button]");
    const mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("open");
            menuButton.textContent = mobilePanel.classList.contains("open") ? "×" : "☰";
        });
    }

    const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    const prev = document.querySelector("[data-hero-prev]");
    const next = document.querySelector("[data-hero-next]");
    let activeSlide = 0;
    let timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === activeSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === activeSlide);
        });
    }

    function startHero() {
        if (slides.length <= 1) {
            return;
        }
        clearInterval(timer);
        timer = setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
            startHero();
        });
    });

    if (prev) {
        prev.addEventListener("click", function () {
            showSlide(activeSlide - 1);
            startHero();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            showSlide(activeSlide + 1);
            startHero();
        });
    }

    startHero();

    const filterBar = document.querySelector("[data-filter-bar]");
    const cards = Array.from(document.querySelectorAll("[data-card]"));
    const emptyState = document.querySelector("[data-empty-state]");

    function updateEmptyState(visibleCount) {
        if (emptyState) {
            emptyState.classList.toggle("show", visibleCount === 0);
        }
    }

    if (filterBar) {
        filterBar.addEventListener("click", function (event) {
            const button = event.target.closest("[data-filter]");
            if (!button) {
                return;
            }
            const value = button.getAttribute("data-filter");
            let visibleCount = 0;
            filterBar.querySelectorAll("[data-filter]").forEach(function (item) {
                item.classList.toggle("active", item === button);
            });
            cards.forEach(function (card) {
                const matched = value === "all" || card.getAttribute("data-type") === value;
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visibleCount += 1;
                }
            });
            updateEmptyState(visibleCount);
        });
    }

    const liveSearch = document.querySelector("[data-live-search] input");
    if (liveSearch) {
        liveSearch.addEventListener("input", function () {
            const query = liveSearch.value.trim().toLowerCase();
            let visibleCount = 0;
            cards.forEach(function (card) {
                const text = (card.getAttribute("data-search") || card.textContent).toLowerCase();
                const matched = !query || text.includes(query);
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visibleCount += 1;
                }
            });
            updateEmptyState(visibleCount);
        });
    }

    const searchForm = document.querySelector("[data-search-form]");
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";

    if (searchForm) {
        const input = searchForm.querySelector("input[name='q']");
        if (input) {
            input.value = initialQuery;
            const runSearch = function () {
                const query = input.value.trim().toLowerCase();
                let visibleCount = 0;
                cards.forEach(function (card) {
                    const text = (card.getAttribute("data-search") || card.textContent).toLowerCase();
                    const matched = !query || text.includes(query);
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visibleCount += 1;
                    }
                });
                updateEmptyState(visibleCount);
            };
            searchForm.addEventListener("submit", function (event) {
                event.preventDefault();
                runSearch();
                const url = new URL(window.location.href);
                if (input.value.trim()) {
                    url.searchParams.set("q", input.value.trim());
                } else {
                    url.searchParams.delete("q");
                }
                window.history.replaceState({}, "", url.toString());
            });
            input.addEventListener("input", runSearch);
            runSearch();
        }
    }
});
