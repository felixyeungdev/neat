import { Direction, SnakeGame } from "./games/snake-game.js";
import { Neat } from "./neat/neat.js";
import { NeatAgent } from "./neat/population.js";
import { visualiseGenome } from "./visualiser/visualiseGenome.js";

const neat = new Neat({
  inputSize: 13,
  outputSize: 4,
});

(window as any).neat = neat;

let newHighScore = 0;
let bestAgent: NeatAgent | null = null;

const populationSize = 256;
const CANVAS_COUNT = 0;

const agents = new Array(populationSize).fill(0).map(() => neat.requestAgent());
const games = new Array(populationSize)
  .fill(0)
  .map(() => new SnakeGame(33, 33));
const canvases = new Array(CANVAS_COUNT).fill(0).map(() => {
  const canvas = document.createElement("canvas");
  canvas.height = 66;
  canvas.width = 66;
  document.querySelector("#wrapper")?.appendChild(canvas);
  return canvas;
});
const canvas = (() => {
  const canvas = document.createElement("canvas");
  canvas.height = 512;
  canvas.width = 512;
  document.querySelector("#wrapper")?.appendChild(canvas);
  return canvas;
})();

setInterval(() => {
  for (let i = 0; i < populationSize; i++) {
    const agent = agents[i];
    const game = games[i];
    const canvas = canvases[i];
    neat.tick();
    game.tick();

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

    agent.fitness = game.score;
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
      games[i] = new SnakeGame(33, 33);
      agents[i] = neat.requestAgent();
      if (agent === bestAgent) bestAgent = null;
    }
  }
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
