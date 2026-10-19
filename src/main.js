import { Game } from "./game.js";
import { LOVE_CONFIG } from "./config.js";

const canvas = document.getElementById("gameCanvas");
const statusElement = document.getElementById("game-status");
const game = new Game(canvas, statusElement);
const joystick = document.getElementById("joystick");
const joystickThumb = document.getElementById("joystickThumb");
const mobileAttack = document.getElementById("mobileAttack");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const fullscreenHelp = document.getElementById("fullscreenHelp");
const fullscreenHelpClose = document.getElementById("fullscreenHelpClose");
const fullscreenHelpOk = document.getElementById("fullscreenHelpOk");
const rootElement = document.documentElement;

const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
  || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
let iosImmersive = false;

const isStandaloneMode = () => {
  const standaloneQuery = window.matchMedia?.("(display-mode: standalone)");
  return Boolean(window.navigator.standalone) || standaloneQuery?.matches === true;
};

const getFullscreenElement = () => document.fullscreenElement ?? document.webkitFullscreenElement ?? null;

const getFullscreenRequest = (element) => element.requestFullscreen
  ?? element.webkitRequestFullscreen
  ?? element.webkitRequestFullScreen
  ?? null;

const getFullscreenExit = () => document.exitFullscreen
  ?? document.webkitExitFullscreen
  ?? document.webkitCancelFullScreen
  ?? null;

const resetJoystick = () => {
  if (!joystickThumb) return;
  joystickThumb.style.transform = "translate(-50%, -50%)";
  game.setTouch("up", false);
  game.setTouch("down", false);
};

const updateJoystick = (event) => {
  if (!joystick) return;
  const rect = joystick.getBoundingClientRect();
  const centerY = rect.top + rect.height * .5;
  const travel = rect.height * .26;
  const offsetY = Math.max(-travel, Math.min(travel, event.clientY - centerY));
  const normalized = offsetY / travel;
  joystickThumb.style.transform = `translate(-50%, calc(-50% + ${offsetY}px))`;
  game.setTouch("up", normalized < -.18);
  game.setTouch("down", normalized > .18);
};

let joystickPointerId = null;
if (joystick) {
  joystick.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    joystickPointerId = event.pointerId;
    joystick.setPointerCapture?.(event.pointerId);
    updateJoystick(event);
  });
  joystick.addEventListener("pointermove", (event) => {
    if (event.pointerId === joystickPointerId) updateJoystick(event);
  });
  const releaseJoystick = (event) => {
    if (event.pointerId === joystickPointerId) {
      joystickPointerId = null;
      resetJoystick();
    }
  };
  joystick.addEventListener("pointerup", releaseJoystick);
  joystick.addEventListener("pointercancel", releaseJoystick);
  joystick.addEventListener("lostpointercapture", resetJoystick);
}

mobileAttack?.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  mobileAttack.classList.add("active");
  game.attack();
});
mobileAttack?.addEventListener("pointerup", () => mobileAttack.classList.remove("active"));
mobileAttack?.addEventListener("pointercancel", () => mobileAttack.classList.remove("active"));

const updateFullscreenLabel = () => {
  if (!fullscreenBtn) return;
  const active = Boolean(getFullscreenElement()) || iosImmersive;
  const standalone = isStandaloneMode();
  fullscreenBtn.textContent = standalone ? "FULL ✓" : active ? "THOÁT" : "FULL";
  fullscreenBtn.setAttribute("aria-label", standalone
    ? "Game đang chạy ở chế độ toàn màn hình"
    : active ? "Thoát toàn màn hình" : "Bật toàn màn hình");
};

const showFullscreenHelp = () => {
  if (!fullscreenHelp || isStandaloneMode()) return;
  fullscreenHelp.hidden = false;
  fullscreenHelpClose?.focus();
};

const hideFullscreenHelp = () => {
  if (fullscreenHelp) fullscreenHelp.hidden = true;
};

const setIOSImmersive = (active) => {
  iosImmersive = active;
  rootElement.classList.toggle("ios-immersive", active);
  updateFullscreenLabel();
};

const activateIOSFallback = () => {
  setIOSImmersive(true);
  showFullscreenHelp();
  game.announce("Safari không cho fullscreen native. Hãy thêm game vào Màn hình chính để chơi như app.");
};

fullscreenBtn?.addEventListener("click", async (event) => {
  event.preventDefault();
  if (isStandaloneMode()) {
    game.announce("Game đang chạy toàn màn hình. Xoay ngang điện thoại để có khung hình rộng nhất.");
    return;
  }
  try {
    if (getFullscreenElement()) {
      const exit = getFullscreenExit();
      if (exit) await exit.call(document);
    } else if (iosImmersive) {
      setIOSImmersive(false);
      game.announce("Đã thoát chế độ mở rộng.");
      return;
    } else {
      const fullscreenTarget = document.querySelector(".game-shell") ?? document.documentElement;
      const request = getFullscreenRequest(fullscreenTarget);
      if (request) {
        await request.call(fullscreenTarget);
        try { await screen.orientation?.lock?.("landscape"); } catch { /* iPhone Safari may deny orientation lock. */ }
        if (!getFullscreenElement() && isIOSDevice) activateIOSFallback();
      } else if (isIOSDevice) {
        // iPhone Safari does not expose native fullscreen for a canvas/game
        // element. The CSS fallback fills the usable viewport and the help
        // card explains how to remove Safari chrome via Home Screen mode.
        activateIOSFallback();
        game.announce("Đã mở rộng khung game. Thêm game vào Màn hình chính để ẩn hẳn thanh Safari.");
      }
    }
  } catch (error) {
    if (isIOSDevice) {
      activateIOSFallback();
    } else {
      console.warn("Fullscreen không khả dụng trên thiết bị này.", error);
    }
  }
  updateFullscreenLabel();
});
fullscreenHelpClose?.addEventListener("click", hideFullscreenHelp);
fullscreenHelpOk?.addEventListener("click", hideFullscreenHelp);
fullscreenHelp?.addEventListener("pointerdown", (event) => {
  if (event.target === fullscreenHelp) hideFullscreenHelp();
});
document.addEventListener("fullscreenchange", updateFullscreenLabel);
document.addEventListener("webkitfullscreenchange", updateFullscreenLabel);
window.addEventListener("pageshow", updateFullscreenLabel);
updateFullscreenLabel();

let lastTime = performance.now();
function frame(now) {
  try {
    const dt = (now - lastTime) / 1000;
    lastTime = now;
    game.update(dt);
    game.draw();
    requestAnimationFrame(frame);
  } catch (error) {
    statusElement.textContent = `Lỗi runtime: ${error?.message ?? error}`;
    console.error(error);
  }
}

window.addEventListener("keydown", (event) => {
  if ([" ", "ArrowUp", "ArrowDown", "w", "s", "p", "m", "r", "Enter"].includes(event.key) || event.code === "Space") event.preventDefault();
  game.handleKeyDown(event.key === "" ? event.code : event.key, event.repeat);
});

window.addEventListener("keyup", (event) => game.handleKeyUp(event.key));

canvas.addEventListener("pointermove", (event) => game.updatePointer(event.clientX, event.clientY));
canvas.addEventListener("pointerleave", () => { game.hoverTarget = ""; });
canvas.addEventListener("pointerup", (event) => game.handlePointerUp(event.clientX, event.clientY));

game.announce(LOVE_CONFIG.introStory);
requestAnimationFrame(frame);
