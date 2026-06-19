(function () {
    'use strict';

    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var nav = document.querySelector('[data-site-nav]');
        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }

        var slides = selectAll('[data-hero-slide]', slider);
        var dots = selectAll('[data-hero-dot]', slider);
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = Number(dot.getAttribute('data-hero-dot')) || 0;
                showSlide(index);
                start();
            });
        });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        showSlide(0);
        start();
    }

    function initFilters() {
        selectAll('[data-filter-form]').forEach(function (form) {
            var input = form.querySelector('[data-filter-input]');
            var selects = selectAll('[data-filter-select]', form);
            var section = form.parentElement || document;
            var cards = selectAll('[data-movie-card]', section);
            var count = form.querySelector('[data-filter-count]');

            function getSelectValue(name) {
                var select = form.querySelector('[data-filter-select="' + name + '"]');
                return select ? select.value.trim().toLowerCase() : '';
            }

            function applyFilter() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var category = getSelectValue('category');
                var region = getSelectValue('region');
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                    var cardCategory = (card.getAttribute('data-category') || '').toLowerCase();
                    var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
                    var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
                    var categoryMatch = !category || cardCategory === category;
                    var regionMatch = !region || cardRegion === region;
                    var show = keywordMatch && categoryMatch && regionMatch;

                    card.classList.toggle('is-hidden', !show);
                    if (show) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = '显示 ' + visible + ' 部';
                }
            }

            if (input) {
                input.addEventListener('input', applyFilter);
            }
            selects.forEach(function (select) {
                select.addEventListener('change', applyFilter);
            });
            applyFilter();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initNavigation();
        initHeroSlider();
        initFilters();
    });
})();
