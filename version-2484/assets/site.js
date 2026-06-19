(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var menu = document.querySelector('[data-nav-menu]');

        if (!toggle || !menu) {
            return;
        }

        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
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
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (!slides.length) {
            return;
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        start();
    }

    function uniqueSorted(values) {
        var map = Object.create(null);
        values.forEach(function (value) {
            if (value) {
                map[value] = true;
            }
        });
        return Object.keys(map).sort(function (a, b) {
            return String(b).localeCompare(String(a), 'zh-CN');
        });
    }

    function addOptions(select, values) {
        if (!select) {
            return;
        }
        values.forEach(function (value) {
            var option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function setupFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        var list = document.querySelector('[data-card-list]');
        if (!panel || !list) {
            return;
        }

        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
        var keyword = panel.querySelector('[data-filter-keyword]');
        var region = panel.querySelector('[data-filter-region]');
        var type = panel.querySelector('[data-filter-type]');
        var year = panel.querySelector('[data-filter-year]');
        var reset = panel.querySelector('[data-filter-reset]');
        var count = panel.querySelector('[data-filter-count]');
        var empty = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);

        addOptions(region, uniqueSorted(cards.map(function (card) { return card.dataset.region; })));
        addOptions(type, uniqueSorted(cards.map(function (card) { return card.dataset.type; })));
        addOptions(year, uniqueSorted(cards.map(function (card) { return card.dataset.year; })));

        if (keyword && params.get('q')) {
            keyword.value = params.get('q');
        }

        function cardText(card) {
            return [
                card.dataset.title,
                card.dataset.category,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.genre,
                card.dataset.tags
            ].join(' ').toLowerCase();
        }

        function apply() {
            var keywordValue = keyword ? keyword.value.trim().toLowerCase() : '';
            var regionValue = region ? region.value : '';
            var typeValue = type ? type.value : '';
            var yearValue = year ? year.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var matchKeyword = !keywordValue || cardText(card).indexOf(keywordValue) !== -1;
                var matchRegion = !regionValue || card.dataset.region === regionValue;
                var matchType = !typeValue || card.dataset.type === typeValue;
                var matchYear = !yearValue || card.dataset.year === yearValue;
                var matched = matchKeyword && matchRegion && matchType && matchYear;

                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = '显示 ' + visible + ' / ' + cards.length + ' 部';
            }
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [keyword, region, type, year].forEach(function (element) {
            if (element) {
                element.addEventListener('input', apply);
                element.addEventListener('change', apply);
            }
        });

        if (reset) {
            reset.addEventListener('click', function () {
                if (keyword) {
                    keyword.value = '';
                }
                if (region) {
                    region.value = '';
                }
                if (type) {
                    type.value = '';
                }
                if (year) {
                    year.value = '';
                }
                apply();
            });
        }

        apply();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

        players.forEach(function (panel) {
            var video = panel.querySelector('video[data-hls-src]');
            var button = panel.querySelector('[data-player-start]');
            var status = panel.querySelector('[data-player-status]');
            var hlsInstance = null;

            if (!video || !button) {
                return;
            }

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function attachSource() {
                var source = video.getAttribute('data-hls-src');
                if (!source || video.dataset.ready === '1') {
                    return;
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.dataset.ready = '1';
                    setStatus('正在使用浏览器原生 HLS 播放');
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        maxBufferLength: 45
                    });

                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus('播放源加载完成');
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            setStatus('网络波动，正在重新加载');
                            hlsInstance.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            setStatus('媒体解码异常，正在恢复');
                            hlsInstance.recoverMediaError();
                        } else {
                            setStatus('当前浏览器无法播放该视频源');
                            hlsInstance.destroy();
                        }
                    });
                    video.dataset.ready = '1';
                    return;
                }

                setStatus('当前浏览器暂不支持 HLS 播放，请更换浏览器');
            }

            button.addEventListener('click', function () {
                attachSource();
                panel.classList.add('is-playing');
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        setStatus('请再次点击播放器开始播放');
                    });
                }
            });

            video.addEventListener('play', function () {
                panel.classList.add('is-playing');
            });

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
        setupPlayers();
    });
}());
