(() => {
  const buttons = Array.from(document.querySelectorAll('[data-play-url]'));

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const video = document.querySelector('#moviePlayer');
      const message = document.querySelector('[data-player-message]');
      const source = button.getAttribute('data-play-url');

      if (!video || !source) {
        return;
      }

      button.closest('.player-cover')?.classList.add('is-hidden');

      const playVideo = () => {
        const playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(() => {});
        }
      };

      if (window.Hls && window.Hls.isSupported()) {
        if (video.hlsInstance) {
          video.hlsInstance.destroy();
        }

        const hls = new window.Hls({
          lowLatencyMode: true,
          backBufferLength: 90
        });

        video.hlsInstance = hls;
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        hls.on(window.Hls.Events.ERROR, (event, data) => {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }

          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }

          hls.destroy();
          if (message) {
            message.textContent = '视频加载遇到异常，请刷新页面后重试。';
          }
        });
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        return;
      }

      if (message) {
        message.textContent = '当前环境无法播放该视频。';
      }
    });
  });
})();
