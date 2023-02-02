import { createCanvas } from "canvas";
import fs from "fs";
import { NeatGenome } from "../neat/genome";

const addMargin = (value: number, size: number) => {
  const margin = 0.1;
  return value * (1 - margin) + (margin * size) / 2;
};

export const visualiseGenome = (genome: NeatGenome) => {
  const canvas = createCanvas(500, 500);
  const ctx = canvas.getContext("2d");
  const size = 500;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, size, size);

  const { nodes, connections } = genome;

  for (const connection of connections) {
    const { fromNode, toNode, weight, enabled } = connection;
    if (!enabled) continue;
    ctx.strokeStyle = weight > 0 ? "red" : "blue";
    ctx.beginPath();
    ctx.moveTo(
      addMargin(fromNode.x * size, size),
      addMargin(fromNode.y * size, size)
    );
    ctx.lineTo(
      addMargin(toNode.x * size, size),
      addMargin(toNode.y * size, size)
    );
    ctx.stroke();
  }

  for (const node of nodes) {
    const { x, y } = node;
    const canvasX = addMargin(x * size, size);
    const canvasY = addMargin(y * size, size);
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  fs.mkdirSync("./temp", { recursive: true });
  const out = fs.createWriteStream("./temp/visual.png");
  const stream = canvas.createPNGStream();
  stream.pipe(out);
};
