var MovieSite = (function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var links = document.querySelector(".nav-links");
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener("click", function () {
            links.classList.toggle("open");
            toggle.classList.toggle("open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function reset(nextIndex) {
            window.clearInterval(timer);
            show(nextIndex);
            start();
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                reset(dotIndex);
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                reset(index - 1);
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                reset(index + 1);
            });
        }
        start();
    }

    function itemText(item) {
        return [
            item.getAttribute("data-title"),
            item.getAttribute("data-region"),
            item.getAttribute("data-genre"),
            item.getAttribute("data-type"),
            item.getAttribute("data-year"),
            item.getAttribute("data-tags"),
            item.textContent
        ].join(" ").toLowerCase();
    }

    function setupSearch() {
        var searchInputs = Array.prototype.slice.call(document.querySelectorAll(".site-search"));
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll(".filter-group button"));
        var items = Array.prototype.slice.call(document.querySelectorAll(".searchable-item"));
        var empty = document.querySelector(".empty-state");
        if (!items.length) {
            return;
        }
        function activeValues() {
            return filterButtons
                .filter(function (button) {
                    return button.classList.contains("active") && button.getAttribute("data-filter-value") !== "all";
                })
                .map(function (button) {
                    return button.getAttribute("data-filter-value").toLowerCase();
                });
        }
        function apply() {
            var query = searchInputs.map(function (input) {
                return input.value.trim().toLowerCase();
            }).find(Boolean) || "";
            var values = activeValues();
            var visible = 0;
            items.forEach(function (item) {
                var text = itemText(item);
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchFilter = values.every(function (value) {
                    return text.indexOf(value) !== -1;
                });
                var shouldShow = matchQuery && matchFilter;
                item.classList.toggle("is-hidden", !shouldShow);
                if (shouldShow) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        }
        searchInputs.forEach(function (input) {
            input.addEventListener("input", apply);
        });
        filterButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                var group = button.closest(".filter-group");
                if (group) {
                    Array.prototype.slice.call(group.querySelectorAll("button")).forEach(function (item) {
                        item.classList.remove("active");
                    });
                }
                button.classList.add("active");
                apply();
            });
        });
        apply();
    }

    function attachSource(video, sourceUrl) {
        if (!video || !sourceUrl) {
            return null;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
            return null;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            return hls;
        }
        video.src = sourceUrl;
        return null;
    }

    function initPlayer(sourceUrl) {
        ready(function () {
            var video = document.querySelector(".movie-player");
            var cover = document.querySelector(".player-cover");
            if (!video) {
                return;
            }
            var hls;
            var attached = false;
            function play() {
                if (!attached) {
                    hls = attachSource(video, sourceUrl);
                    attached = true;
                }
                if (cover) {
                    cover.classList.add("hide");
                }
                var start = video.play();
                if (start && typeof start.catch === "function") {
                    start.catch(function () {});
                }
            }
            if (cover) {
                cover.addEventListener("click", play);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                if (cover) {
                    cover.classList.add("hide");
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hls && typeof hls.destroy === "function") {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
    });

    return {
        initPlayer: initPlayer
    };
}());
