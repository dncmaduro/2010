import { Game } from "./game.js";

const canvas = document.getElementById("gameCanvas");
const statusElement = document.getElementById("game-status");
const game = new Game(canvas, statusElement);

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

for (const button of document.querySelectorAll(".touch-btn")) {
  const action = button.dataset.action;
  const press = (event) => {
    event.preventDefault();
    button.classList.add("active");
    game.setTouch(action, true);
  };
  const release = (event) => {
    event.preventDefault();
    button.classList.remove("active");
    game.setTouch(action, false);
  };
  button.addEventListener("pointerdown", press);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);
}

game.announce("Màn hướng dẫn. Nhấn Enter hoặc nút bắt đầu trận chiến.");
requestAnimationFrame(frame);
