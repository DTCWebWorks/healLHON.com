(function () {
  // v8: add ?reset=1 to force I-can-see mode (clears saved toggle)
  try {
    const p = new URLSearchParams(window.location.search);
    if (p.get('reset') === '1') {
      localStorage.removeItem('visionMode');
      localStorage.removeItem('autoplayAttemptedHome');
    }
  } catch (_) {}

  // -----------------------------
  // 1) Vision Mode Toggle (persist across pages)
  // -----------------------------
  const body = document.body;
  const visionToggle = document.getElementById("visionToggle");

  function setVisionMode(mode) {
    const isBlind = mode === "blind";
    body.classList.toggle("blind-mode", isBlind);

    if (visionToggle) {
      visionToggle.setAttribute("aria-checked", isBlind ? "true" : "false");
    }

    try { localStorage.setItem("visionMode", mode); } catch (_) {}
  }

  function getVisionMode() {
    try { return localStorage.getItem("visionMode") || "see"; } catch (_) { return "see"; }
  }

  setVisionMode(getVisionMode());

  // -----------------------------
  // 1b) Global Text Size Selector (persist across pages)
  // -----------------------------
  const textSizeSelect = document.getElementById("textSizeSelect");

  function setTextSize(size) {
    const allowed = ["normal", "large", "xlarge", "huge", "maximum"];
    const next = allowed.includes(size) ? size : "normal";

    body.classList.remove("text-size-large", "text-size-xlarge", "text-size-huge", "text-size-maximum");
    if (next === "large") body.classList.add("text-size-large");
    if (next === "xlarge") body.classList.add("text-size-xlarge");
    if (next === "huge") body.classList.add("text-size-huge");
    if (next === "maximum") body.classList.add("text-size-maximum");

    if (textSizeSelect) textSizeSelect.value = next;

    try { localStorage.setItem("globalTextSize", next); } catch (_) {}
  }

  function getTextSize() {
    try { return localStorage.getItem("globalTextSize") || "normal"; } catch (_) { return "normal"; }
  }

  setTextSize(getTextSize());

  if (textSizeSelect) {
    textSizeSelect.addEventListener("change", (e) => {
      setTextSize(e.target.value);
    });
  }


  if (visionToggle) {
    visionToggle.addEventListener("click", () => {
      const next = body.classList.contains("blind-mode") ? "see" : "blind";
      setVisionMode(next);
    });

    visionToggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        visionToggle.click();
      }
    });
  }

  // -----------------------------
  // 2) Audio behavior (your filenames EXACTLY)
  // -----------------------------
  const AUDIO = {
    lhon: "Audio/lhon landing page.mp3",
    lhonplus: "Audio/lhon + landing page.mp3",
  };

  let currentAudio = null;

  function stopAudio() {
    if (!currentAudio) return;
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (_) {}
    currentAudio = null;
  }

  function playSound(key) {
    const src = AUDIO[key];
    if (!src) return;

    stopAudio();

    // encode URI so spaces/+ behave more consistently when opened from file://
    const a = new Audio(encodeURI(src));
    a.volume = 0.3;

    try { a.currentTime = 0; } catch (_) {}

    a.play().catch(() => {});
    currentAudio = a;
  }

  function isHome() {
    const p = (window.location.pathname || "").toLowerCase();
    return p.endsWith("/") || p.endsWith("index.html") || p === "";
  }

  // Clicking logos: if already on home, do NOT reload; just play immediately.
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[data-play]");
    if (!link) return;

    const key = link.getAttribute("data-play");
    if (!key) return;

    if (isHome()) {
      e.preventDefault();
      playSound(key);
    }
  });

  // Home page load behavior:
  if (isHome()) {
    const params = new URLSearchParams(window.location.search);
    const play = params.get("play");

    if (play === "lhon" || play === "lhonplus") {
      playSound(play);
      try { history.replaceState(null, "", "index.html"); } catch (_) {}
    } else {
      // attempt autoplay once on first-ever visit to home
      try {
        const attempted = localStorage.getItem("autoplayAttemptedHome") === "1";
        if (!attempted) {
          localStorage.setItem("autoplayAttemptedHome", "1");
          playSound("lhon");
        }
      } catch (_) {
        // if storage blocked, just attempt once per load
        playSound("lhon");
      }
    }
  }
})(); 
