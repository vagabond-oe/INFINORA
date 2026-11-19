const introScreen = document.getElementById("introScreen");
const introVideo = document.getElementById("eventIntro");
const eventCatalog = document.getElementById("eventCatalog");
const skipIntro = document.getElementById("skipIntro");
const soundToggle = document.getElementById("soundToggle");
const progressBar = document.getElementById("introProgress");

let introFinished = false;
const INTRO_LENGTH_SECONDS = 17.74; // Uploaded clip is approximately 17.7 seconds.

function revealEvents() {
  if (introFinished) return;
  introFinished = true;
  introScreen.classList.add("finished");
  eventCatalog.classList.add("visible");
  eventCatalog.setAttribute("aria-hidden", "false");
  window.setTimeout(() => {
    introScreen.hidden = true;
  }, 850);
}

function updateProgress() {
  const duration = introVideo.duration || INTRO_LENGTH_SECONDS;
  const progress = Math.min(100, (introVideo.currentTime / duration) * 100);
  progressBar.style.width = `${progress}%`;
  if (introVideo.currentTime >= INTRO_LENGTH_SECONDS) revealEvents();
}

introVideo.addEventListener("timeupdate", updateProgress);
introVideo.addEventListener("ended", revealEvents);
introVideo.addEventListener("error", () => {
  // If the browser cannot play the local clip, don't trap visitors on a blank intro.
  revealEvents();
});
skipIntro.addEventListener("click", revealEvents);

soundToggle.addEventListener("click", async () => {
  introVideo.muted = !introVideo.muted;
  soundToggle.textContent = introVideo.muted ? "♫ SOUND OFF" : "♫ SOUND ON";
  if (!introVideo.paused) return;
  try { await introVideo.play(); } catch (e) {}
});

// Browsers require muted autoplay; visitors can turn sound on using the button.
introVideo.play().catch(() => {
  // If autoplay is blocked, show the clip's play control and keep Skip Intro available.
  introVideo.controls = true;
});
