let intervalId = null;

const isPipSupported = "documentPictureInPicture" in window;

const container = document.getElementById("container");
const pipContainer = document.getElementById("pip-container");
const pipContent = document.getElementById("pip-content");
const togglePipButton = document.getElementById("toggle-pip");

if (!isPipSupported) {
  container.innerHTML = "Picture-in-Picture is not supported in this browser";
} else {
  togglePipButton.addEventListener("click", togglePictureInPicture);
  togglePipButton.style.display = "block";
}

function togglePictureInPicture() {
  if (window.documentPictureInPicture.window) {
    closePip();
  } else {
    openPip("300", "300");
  }
}

async function openPip(width, height) {
  const pipWindow = await window.documentPictureInPicture.requestWindow({
    width,
    height,
    disallowReturnToOpener: true,
    preferInitialWindowPlacement: true,
  });

  pipWindow.addEventListener("pagehide", onClosePip);
  pipWindow.document.body.append(pipContent);
  copyStyles(pipWindow);

  intervalId = setInterval(updateTime, 1000);
  updateTime();
}

function closePip() {
  window.documentPictureInPicture.window.close();
  clearInterval(intervalId);
  intervalId = null;
}

function onClosePip(event) {
  pipContainer.append(event.target.querySelector("#pip-content"));
}

function copyStyles(pipWindow) {
  [...document.styleSheets].forEach((styleSheet) => {
    try {
      const cssRules = [...styleSheet.cssRules]
        .map((rule) => rule.cssText)
        .join("");
      const style = document.createElement("style");
      style.textContent = cssRules;
      pipWindow.document.head.appendChild(style);
    } catch (e) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.type = styleSheet.type;
      link.media = styleSheet.media;
      link.href = styleSheet.href;
      pipWindow.document.head.appendChild(link);
    }
  });
}

function updateTime() {
  const pipWindow = window.documentPictureInPicture.window;
  if (!pipWindow) return;

  const timeElement = pipWindow.document.getElementById("current-time");
  if (!timeElement) return;
  const now = new Date();
  timeElement.textContent = now.toLocaleTimeString();
}
