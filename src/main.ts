import { Direction, SnakeGame } from "./games/snake-game.js";
import { Neat } from "./neat/neat.js";
import { NeatAgent } from "./neat/population.js";
import { visualiseGenome } from "./visualiser/visualiseGenome.js";

const BOARD_SIZE = 17;

const getCanvasSize = () => {
  const windowHeight = window.innerHeight;
  const windowWidth = window.innerWidth;
  const size = Math.min(windowHeight, windowWidth);
  return size;
};

const neat = new Neat({
  inputSize: 13 + 4,
  outputSize: 4,
  evolutionInterval: 1000,
});

(window as any).neat = neat;

let newHighScore = 0;
let bestAgent: NeatAgent | null = null;

const populationSize = 1024;
const CANVAS_COUNT = 0;

const agents = new Array(populationSize).fill(0).map(() => neat.requestAgent());
const games = new Array(populationSize)
  .fill(0)
  .map(() => new SnakeGame(BOARD_SIZE, BOARD_SIZE));
const canvases = new Array(CANVAS_COUNT).fill(0).map(() => {
  const canvas = document.createElement("canvas");
  canvas.height = getCanvasSize();
  canvas.width = getCanvasSize();
  document.querySelector("#wrapper")?.appendChild(canvas);
  return canvas;
});
const canvas = (() => {
  const canvas = document.createElement("canvas");
  canvas.height = getCanvasSize();
  canvas.width = getCanvasSize();
  document.querySelector("#wrapper")?.appendChild(canvas);
  return canvas;
})();

window.addEventListener("resize", (e) => {
  const newSize = getCanvasSize();
  if (canvas.height === newSize && canvas.width === newSize) return;
  canvas.height = getCanvasSize();
  canvas.width = getCanvasSize();
});

const drawGameAndGenome = (
  game: SnakeGame,
  agent: NeatAgent,
  _canvas: HTMLCanvasElement = canvas
) => {
  if (!_canvas) return;
  game.draw(_canvas);
  visualiseGenome(agent.genome, _canvas);
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

(window as any).sleepMs = 0;
const main = async () => {
  while (true) {
    await sleep(bestAgent ? (window as any).sleepMs : 0);
    neat.tick();
    for (let i = 0; i < populationSize; i++) {
      const agent = agents[i];
      const game = games[i];
      const canvas = canvases[i];

      const inputs = [
        game.snake.direction === Direction.Up ? 1 : 0, // up
        game.snake.direction === Direction.Down ? 1 : 0, // down
        game.snake.direction === Direction.Left ? 1 : 0, // left
        game.snake.direction === Direction.Right ? 1 : 0, // right
        game.apple.position.y < game.snake.head.y ? 1 : 0, // appleUp
        game.apple.position.y > game.snake.head.y ? 1 : 0, // appleDown
        game.apple.position.x < game.snake.head.x ? 1 : 0, // appleLeft
        game.apple.position.x > game.snake.head.x ? 1 : 0, // appleRight
        game.snake.head.y === 0 ? 1 : 0, // nextToWallUp
        game.snake.head.y === game.height - 1 ? 1 : 0, // nextToWallDown
        game.snake.head.x === 0 ? 1 : 0, // nextToWallLeft
        game.snake.head.x === game.width - 1 ? 1 : 0, // nextToWallRight

        // nextToTailUp
        game.snake.body.some(
          (tail) =>
            tail.x === game.snake.head.x && tail.y === game.snake.head.y - 1
        )
          ? 1
          : 0,

        // nextToTailDown
        game.snake.body.some(
          (tail) =>
            tail.x === game.snake.head.x && tail.y === game.snake.head.y + 1
        )
          ? 1
          : 0,

        // nextToTailLeft
        game.snake.body.some(
          (tail) =>
            tail.x === game.snake.head.x - 1 && tail.y === game.snake.head.y
        )
          ? 1
          : 0,

        // nextToTailRight
        game.snake.body.some(
          (tail) =>
            tail.x === game.snake.head.x + 1 && tail.y === game.snake.head.y
        )
          ? 1
          : 0,

        1, // bias
      ];

      const outputs = agent.activate(Object.values(inputs));

      const maxOutput = outputs.indexOf(Math.max(...outputs));

      switch (maxOutput) {
        case 0:
          game.setSnakeDirection(Direction.Up);
          break;
        case 1:
          game.setSnakeDirection(Direction.Down);
          break;
        case 2:
          game.setSnakeDirection(Direction.Left);
          break;
        case 3:
          game.setSnakeDirection(Direction.Right);
          break;
      }

      agent.fitness += game.tick() ?? 0;

      if (game.score > newHighScore / 3) {
        if (game.score > newHighScore) newHighScore = game.score;

        if (bestAgent) {
          if (agent == bestAgent) {
            drawGameAndGenome(game, agent, canvas);
          }
        } else {
          bestAgent = agent;
          drawGameAndGenome(game, agent, canvas);
        }
      }

      if (game.gameOver) {
        neat.releaseAgent(agent);
        games[i] = new SnakeGame(BOARD_SIZE, BOARD_SIZE);
        agents[i] = neat.requestAgent();
        if (agent === bestAgent) bestAgent = null;
      }
    }
  }
};

main();
