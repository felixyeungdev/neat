import { CanvasRenderingContext2D, createCanvas } from "canvas";
import fs from "fs";
import { NeatGenome } from "../neat/genome";
import { NodeGeneType } from "../neat/node-gene";

const addMargin = (value: number, size: number) => {
  const margin = 0.1;
  return value * (1 - margin) + (margin * size) / 2;
};

const SIZE = 1024;
const NODE_RADIUS = SIZE / 100;
const CONNECTION_WIDTH = NODE_RADIUS / 4;
const TEXT_OFFSET_Y = NODE_RADIUS * 2;
const TEXT_OFFSET_X = 0;
const TEXT_SIZE = NODE_RADIUS * 1.5;

const drawText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number
) => {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "black";
  ctx.font = `${TEXT_SIZE}px Arial`;
  ctx.fillText(text, x + TEXT_OFFSET_X, y + TEXT_OFFSET_Y);
};

export const visualiseGenome = (
  genome: NeatGenome,
  filename: string = "visual.png"
) => {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext("2d");
  const size = SIZE;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, size, size);

  const { nodes, connections } = genome;

  for (const connection of connections) {
    const { fromNode, toNode, weight, enabled, innovationNumber } = connection;
    const fromCanvasX = addMargin(fromNode.x * size, size);
    const fromCanvasY = addMargin(fromNode.y * size, size);
    const toCanvasX = addMargin(toNode.x * size, size);
    const toCanvasY = addMargin(toNode.y * size, size);
    ctx.strokeStyle = enabled ? (weight > 0 ? "red" : "blue") : "grey";
    ctx.beginPath();
    ctx.moveTo(fromCanvasX, fromCanvasY);
    ctx.lineTo(toCanvasX, toCanvasY);
    ctx.lineWidth = CONNECTION_WIDTH;
    ctx.stroke();

    drawText(
      ctx,
      `${innovationNumber}@w${weight.toFixed(2)}`,
      (fromCanvasX + toCanvasX) / 2,
      (fromCanvasY + toCanvasY) / 2
    );
  }

  for (const node of nodes) {
    const { x, y, innovationNumber, type } = node;
    const canvasX = addMargin(x * size, size);
    const canvasY = addMargin(y * size, size);
    ctx.fillStyle =
      type === NodeGeneType.INPUT
        ? "green"
        : type === NodeGeneType.OUTPUT
        ? "orange"
        : "grey";
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, NODE_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    drawText(ctx, `${innovationNumber}`, canvasX, canvasY);
  }

  fs.mkdirSync("./temp", { recursive: true });
  const out = fs.createWriteStream(`./temp/${filename}`);
  const stream = canvas.createPNGStream();
  stream.pipe(out);
};
