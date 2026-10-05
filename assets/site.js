/* Theme toggle, active-section nav, and copy/selection deterrents. */
(function () {
  var root = document.documentElement;

  function currentTheme() {
    var t = root.getAttribute("data-theme");
    if (t) return t;
    return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest(".theme-btn");
    if (!btn) return;
    var next = currentTheme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (err) {}
  });

  // Deterrents only: they stop casual copying, not someone using dev tools.
  ["copy", "cut", "contextmenu", "dragstart", "selectstart"].forEach(function (type) {
    document.addEventListener(type, function (e) { e.preventDefault(); });
  });
  document.addEventListener("keydown", function (e) {
    var k = (e.key || "").toLowerCase();
    if ((e.ctrlKey || e.metaKey) && ["a", "c", "x", "s", "u", "p"].indexOf(k) !== -1) e.preventDefault();
  });
  // Clicking plain text must not leave a blinking caret (e.g. caret browsing).
  document.addEventListener("mouseup", function () {
    var sel = window.getSelection && window.getSelection();
    if (sel && sel.rangeCount) sel.removeAllRanges();
  });

  var links = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  if (!links.length || !("IntersectionObserver" in window)) return;
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      links.forEach(function (a) { a.classList.remove("on"); });
      if (byId[en.target.id]) byId[en.target.id].classList.add("on");
    });
  }, { rootMargin: "-35% 0px -60% 0px" });
  // Above the first tracked section nothing is "current".
  var first = document.getElementById(Object.keys(byId)[0]);
  window.addEventListener("scroll", function () {
    if (first && first.getBoundingClientRect().top > window.innerHeight * 0.4)
      links.forEach(function (a) { a.classList.remove("on"); });
  }, { passive: true });
  Object.keys(byId).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) io.observe(el);
  });
})();
