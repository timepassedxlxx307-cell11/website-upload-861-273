(function () {
  function setupPlayer(root) {
    var video = root.querySelector("video");
    var button = root.querySelector(".play-overlay");
    var status = root.querySelector(".player-status");
    var src = root.getAttribute("data-src");
    var loaded = false;
    var hls = null;

    function setStatus(text) {
      if (status) {
        status.textContent = text || "";
      }
    }

    function attachSource() {
      if (loaded || !video || !src) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus("");
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus("视频加载失败，请稍后再试");
          }
        });
      } else {
        video.src = src;
      }
    }

    function startPlayback() {
      attachSource();
      if (!video) {
        return;
      }
      root.classList.add("is-playing");
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          root.classList.remove("is-playing");
          setStatus("点击画面继续播放");
        });
      }
    }

    if (button) {
      button.addEventListener("click", startPlayback);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          startPlayback();
        }
      });
      video.addEventListener("play", function () {
        root.classList.add("is-playing");
        setStatus("");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          root.classList.remove("is-playing");
        }
      });
      video.addEventListener("error", function () {
        setStatus("视频加载失败，请稍后再试");
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.slice.call(document.querySelectorAll(".video-player")).forEach(setupPlayer);
  });
})();
