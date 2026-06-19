const MoviePlayer = (function () {
    function bindVideo(video, source) {
        if (!video) {
            return null;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return null;
        }

        if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (_, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    hls.destroy();
                }
            });
            return hls;
        }

        video.src = source;
        return null;
    }

    function init(id, source) {
        const shell = document.getElementById(id);
        if (!shell) {
            return;
        }

        const video = shell.querySelector("video");
        const cover = shell.querySelector(".player-cover");
        bindVideo(video, source);

        function playVideo() {
            if (cover) {
                cover.classList.add("hidden");
            }
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", playVideo);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    playVideo();
                }
            });
            video.addEventListener("play", function () {
                if (cover) {
                    cover.classList.add("hidden");
                }
            });
        }
    }

    return {
        init: init
    };
})();
