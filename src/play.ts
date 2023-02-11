import { Direction, SnakeGame } from "./games/snake-game";
import "./styles/globals.css";

let game = new SnakeGame(25, 25);
let speedMs = 100;

const getCanvasSize = () => {
  const windowHeight = window.innerHeight;
  const windowWidth = window.innerWidth;
  const size = Math.min(windowHeight, windowWidth);
  return size;
};

const canvas = (() => {
  const canvas = document.createElement("canvas");
  canvas.height = getCanvasSize();
  canvas.width = getCanvasSize();
  document.querySelector("#wrapper")?.appendChild(canvas);
  return canvas;
})();

window.addEventListener("resize", () => {
  const newSize = getCanvasSize();
  if (canvas.height === newSize && canvas.width === newSize) return;
  canvas.height = getCanvasSize();
  canvas.width = getCanvasSize();
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const loop = async () => {
  await sleep(speedMs);

  game.tick();
  game.draw(canvas);
  console.log(game.snake.body);

  requestAnimationFrame(loop);
};

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "w":
    case "ArrowUp":
      game.setSnakeDirection(Direction.Up);
      break;
    case "s":
    case "ArrowDown":
      game.setSnakeDirection(Direction.Down);
      break;
    case "a":
    case "ArrowLeft":
      game.setSnakeDirection(Direction.Left);
      break;
    case "d":
    case "ArrowRight":
      game.setSnakeDirection(Direction.Right);
      break;
    // restart game on enter
    case " ":
    case "Enter":
      if (!game.gameOver) return;
      game = new SnakeGame(25, 25);
      break;
  }
});

loop();

document.querySelector("#sleepSlider")?.addEventListener("input", (e) => {
  speedMs = Number((e.target as HTMLInputElement).value);
});
