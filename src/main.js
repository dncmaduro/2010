import { Game } from "./game.js";
import { LOVE_CONFIG } from "./config.js";

const canvas = document.getElementById("gameCanvas");
const statusElement = document.getElementById("game-status");
const game = new Game(canvas, statusElement);
const joystick = document.getElementById("joystick");
const joystickThumb = document.getElementById("joystickThumb");
const mobileAttack = document.getElementById("mobileAttack");
const fullscreenBtn = document.getElementById("fullscreenBtn");

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
  const active = Boolean(document.fullscreenElement);
  fullscreenBtn.textContent = active ? "THOÁT" : "FULL";
  fullscreenBtn.setAttribute("aria-label", active ? "Thoát toàn màn hình" : "Bật toàn màn hình");
};

fullscreenBtn?.addEventListener("click", async (event) => {
  event.preventDefault();
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else {
      const fullscreenTarget = document.querySelector(".game-shell") ?? document.documentElement;
      await fullscreenTarget.requestFullscreen();
    }
  } catch (error) {
    console.warn("Fullscreen không khả dụng trên thiết bị này.", error);
  }
  updateFullscreenLabel();
});
document.addEventListener("fullscreenchange", updateFullscreenLabel);

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
