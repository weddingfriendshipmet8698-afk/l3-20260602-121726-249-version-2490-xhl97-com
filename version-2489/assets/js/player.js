(function () {
    'use strict';

    var hlsScriptPromise = null;

    function loadHlsScript() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (hlsScriptPromise) {
            return hlsScriptPromise;
        }
        hlsScriptPromise = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
        return hlsScriptPromise;
    }

    function setStatus(statusEl, message) {
        if (statusEl) {
            statusEl.textContent = message;
        }
    }

    function initVideo(video, source, statusEl, onReady, onError) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', onReady, { once: true });
            video.addEventListener('error', onError, { once: true });
            return;
        }

        loadHlsScript().then(function (Hls) {
            if (!Hls || !Hls.isSupported()) {
                onError();
                return;
            }
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            video._hlsInstance = hls;
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, onReady);
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    hls.destroy();
                    video._hlsInstance = null;
                    onError();
                }
            });
        }).catch(onError);
    }

    function initPlayer(player) {
        var video = player.querySelector('video[data-src]');
        var toggle = player.querySelector('[data-player-toggle]');
        var statusEl = player.querySelector('[data-player-status]');
        var shell = player.querySelector('.video-shell');
        var initialized = false;
        var sourceIndex = 0;
        var sources = [];

        if (!video || !toggle) {
            return;
        }

        sources.push(video.getAttribute('data-src'));
        if (video.getAttribute('data-fallback-src')) {
            sources.push(video.getAttribute('data-fallback-src'));
        }

        function playVideo() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    setStatus(statusEl, '请再次点击播放');
                });
            }
        }

        function tryInitCurrentSource() {
            var source = sources[sourceIndex];
            if (!source) {
                setStatus(statusEl, '播放线路暂不可用');
                return;
            }
            setStatus(statusEl, '播放加载中');
            initVideo(video, source, statusEl, function () {
                initialized = true;
                setStatus(statusEl, '正在播放');
                playVideo();
            }, function () {
                sourceIndex += 1;
                if (sourceIndex < sources.length) {
                    tryInitCurrentSource();
                } else {
                    setStatus(statusEl, '播放线路暂不可用');
                }
            });
        }

        function togglePlayback() {
            if (!initialized) {
                tryInitCurrentSource();
                return;
            }
            if (video.paused) {
                playVideo();
            } else {
                video.pause();
            }
        }

        toggle.addEventListener('click', togglePlayback);
        video.addEventListener('click', togglePlayback);
        video.addEventListener('play', function () {
            if (shell) {
                shell.classList.add('is-playing');
            }
            setStatus(statusEl, '正在播放');
        });
        video.addEventListener('pause', function () {
            if (shell) {
                shell.classList.remove('is-playing');
            }
            setStatus(statusEl, '已暂停');
        });
        video.addEventListener('ended', function () {
            if (shell) {
                shell.classList.remove('is-playing');
            }
            setStatus(statusEl, '播放结束');
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
    });
})();
