(function () {
  function all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function one(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function text(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function initMenu() {
    var toggle = one('[data-mobile-toggle]');
    var menu = one('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', menu.classList.contains('is-open'));
    });
  }

  function initHero() {
    var slides = all('[data-hero-slide]');
    var dots = all('[data-hero-dot]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5600);
  }

  function getFilterValues(scope) {
    var input = one('[data-filter-input]', scope);
    var year = one('[data-filter-year]', scope);
    var type = one('[data-filter-type]', scope);
    var category = one('[data-filter-category]', scope);
    return {
      query: text(input && input.value),
      year: text(year && year.value),
      type: text(type && type.value),
      category: text(category && category.value)
    };
  }

  function applyFilter(scope) {
    var values = getFilterValues(scope);
    var cards = all('[data-card]', scope);
    var visible = 0;
    cards.forEach(function (card) {
      var words = text([
        card.getAttribute('data-title'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-category'),
        card.getAttribute('data-keywords')
      ].join(' '));
      var match = true;
      if (values.query && words.indexOf(values.query) === -1) {
        match = false;
      }
      if (values.year && text(card.getAttribute('data-year')) !== values.year) {
        match = false;
      }
      if (values.type && text(card.getAttribute('data-type')) !== values.type) {
        match = false;
      }
      if (values.category && text(card.getAttribute('data-category')) !== values.category) {
        match = false;
      }
      card.style.display = match ? '' : 'none';
      if (match) {
        visible += 1;
      }
    });
    var empty = one('[data-empty-state]', scope);
    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  function initFilters() {
    var panels = all('.filter-panel');
    panels.forEach(function (panel) {
      var scope = panel.parentElement || document;
      all('input, select', panel).forEach(function (control) {
        control.addEventListener('input', function () {
          applyFilter(scope);
        });
        control.addEventListener('change', function () {
          applyFilter(scope);
        });
      });
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      var input = one('[data-filter-input]', panel);
      if (q && input) {
        input.value = q;
      }
      applyFilter(scope);
    });
  }

  function initSearchForms() {
    all('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = one('input[name="q"]', form);
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = './search.html';
        }
      });
    });
  }

  function setupVideo(video, status) {
    if (!video || video.getAttribute('data-ready') === '1') {
      return;
    }
    var stream = video.getAttribute('data-stream');
    if (!stream) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video._hlsPlayer = hls;
      hls.on(window.Hls.Events.ERROR, function (eventName, data) {
        if (data && data.fatal && status) {
          status.textContent = '视频暂时无法播放，请稍后再试';
        }
      });
    } else {
      video.src = stream;
    }
    video.setAttribute('data-ready', '1');
  }

  function initPlayers() {
    all('.player-wrap').forEach(function (wrap) {
      var video = one('video', wrap);
      var button = one('[data-play-button]', wrap);
      var status = one('[data-player-status]', wrap);
      if (!video || !button) {
        return;
      }
      function start() {
        setupVideo(video, status);
        video.controls = true;
        button.classList.add('is-hidden');
        var playTask = video.play();
        if (playTask && playTask.catch) {
          playTask.catch(function () {
            button.classList.remove('is-hidden');
          });
        }
      }
      button.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          button.classList.remove('is-hidden');
        }
      });
      video.addEventListener('error', function () {
        if (status) {
          status.textContent = '视频暂时无法播放，请稍后再试';
        }
      });
    });
  }

  function init() {
    initMenu();
    initHero();
    initSearchForms();
    initFilters();
    initPlayers();
  }

  window.MovieSite = {
    init: init,
    initPlayers: initPlayers
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
