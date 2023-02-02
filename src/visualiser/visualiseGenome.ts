import { createCanvas } from "canvas";
import fs from "fs";
import { NeatGenome } from "../neat/genome";

export const visualiseGenome = (genome: NeatGenome) => {
  const canvas = createCanvas(500, 500);
  const ctx = canvas.getContext("2d");
  const size = 500;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, size, size);
  ctx.globalAlpha = 0.5;

  const { nodes, connections } = genome;

  for (const node of nodes) {
    const { x, y } = node;
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(x * size, y * size, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const connection of connections) {
    const { fromNode, toNode, weight, enabled } = connection;
    if (!enabled) continue;
    ctx.strokeStyle = weight > 0 ? "red" : "blue";
    ctx.beginPath();
    ctx.moveTo(fromNode.x * size, fromNode.y * size);
    ctx.lineTo(toNode.x * size, toNode.y * size);
    ctx.stroke();
  }

  fs.mkdirSync("./temp", { recursive: true });
  const out = fs.createWriteStream("./temp/visual.png");
  const stream = canvas.createPNGStream();
  stream.pipe(out);
};
