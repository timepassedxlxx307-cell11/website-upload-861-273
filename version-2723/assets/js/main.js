(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[char];
    });
  }

  function movieCard(movie) {
    return [
      '<article class="movie-card">',
      '<a class="card-cover" href="' + escapeHTML(movie.url) + '" title="' + escapeHTML(movie.title) + '">',
      '<img src="' + escapeHTML(movie.cover) + '" alt="' + escapeHTML(movie.title) + '" loading="lazy">',
      '<span class="card-year">' + escapeHTML(movie.year) + '</span>',
      '<span class="play-circle">▶</span>',
      '</a>',
      '<div class="card-body">',
      '<h3><a href="' + escapeHTML(movie.url) + '">' + escapeHTML(movie.title) + '</a></h3>',
      '<div class="movie-meta"><span>' + escapeHTML(movie.region) + '</span><span>' + escapeHTML(movie.type) + '</span></div>',
      '<p>' + escapeHTML(movie.oneLine) + '</p>',
      '<span class="genre-pill">' + escapeHTML(movie.genre) + '</span>',
      '</div>',
      '</article>'
    ].join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var toggle = $("[data-menu-toggle]");
    var mobileNav = $("[data-mobile-nav]");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var slides = $all("[data-hero-slide]");
    var dots = $all("[data-hero-dot]");
    var active = 0;
    var timer = null;

    function showSlide(next) {
      if (!slides.length) {
        return;
      }
      active = (next + slides.length) % slides.length;
      slides.forEach(function (slide, index) {
        slide.classList.toggle("is-active", index === active);
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle("is-active", index === active);
      });
    }

    function startSlider() {
      if (slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        startSlider();
      });
    });

    startSlider();

    var form = $("[data-search-form]");
    var input = $("#site-search");
    var filter = $("#genre-filter");
    var results = $("[data-search-results]");

    function runSearch() {
      if (!results || typeof SEARCH_DATA === "undefined") {
        return;
      }
      var query = input ? input.value.trim().toLowerCase() : "";
      var selected = filter ? filter.value.trim().toLowerCase() : "";
      if (!query && !selected) {
        results.innerHTML = "";
        return;
      }
      var matched = SEARCH_DATA.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.oneLine,
          (movie.tags || []).join(" ")
        ].join(" ").toLowerCase();
        var textMatch = !query || haystack.indexOf(query) !== -1;
        var typeMatch = !selected || haystack.indexOf(selected) !== -1;
        return textMatch && typeMatch;
      }).slice(0, 80);
      if (!matched.length) {
        results.innerHTML = '<div class="side-card"><p>没有找到匹配影片。</p></div>';
        return;
      }
      results.innerHTML = matched.map(movieCard).join("");
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        runSearch();
      });
    }

    if (input) {
      input.addEventListener("input", runSearch);
    }

    if (filter) {
      filter.addEventListener("change", runSearch);
    }

    $all("[data-search-term]").forEach(function (button) {
      button.addEventListener("click", function () {
        if (input) {
          input.value = button.getAttribute("data-search-term") || "";
        }
        runSearch();
        if (results) {
          results.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });
    });

    var pageFilter = $("[data-page-filter]");
    if (pageFilter) {
      pageFilter.addEventListener("input", function () {
        var query = pageFilter.value.trim().toLowerCase();
        $all("[data-card]").forEach(function (card) {
          var haystack = (card.getAttribute("data-keywords") || "").toLowerCase();
          card.classList.toggle("is-hidden", query && haystack.indexOf(query) === -1);
        });
      });
    }
  });
})();
