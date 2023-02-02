import { NeatConnectionGene } from "./connection-gene";
import { NeatInnovationTracker } from "./innovation";
import { NeatNodeGene, NodeGeneType } from "./node-gene";

export class NeatGenome {
  static MUTATE_ADD_CONNECTION_PROBABILITY = 0.05;
  static MUTATE_ADD_CONNECTION_ATTEMPTS = 10;
  static MUTATE_ADD_NODE_PROBABILITY = 0.03;
  static MUTATE_ADD_NODE_ATTEMPTS = 10;
  static MUTATE_TOGGLE_CONNECTION_PROBABILITY = 0.01;
  static MUTATE_WEIGHT_SHIFT_PROBABILITY = 0.9;
  static MUTATE_WEIGHT_RANDOMISE_PROBABILITY = 0.1;

  private _connections: NeatConnectionGene[] = [];
  private _nodes: NeatNodeGene[] = [];
  private _inputNodes: NeatNodeGene[] = [];
  private _outputNodes: NeatNodeGene[] = [];
  private _innovationTracker: NeatInnovationTracker;

  constructor(
    inputCount: number,
    outputCount: number,
    innovationTracker: NeatInnovationTracker
  ) {
    this._innovationTracker = innovationTracker;

    for (let i = 0; i < inputCount; i++) {
      const node = new NeatNodeGene();
      this._innovationTracker.setNodeInnovationNumber(node);
      node.type = NodeGeneType.INPUT;

      node.x = 0;
      node.y = inputCount === 1 ? 0.5 : i / (inputCount - 1);

      this._nodes.push(node);
      this._inputNodes.push(node);
    }

    for (let i = 0; i < outputCount; i++) {
      const node = new NeatNodeGene();
      this._innovationTracker.setNodeInnovationNumber(node);
      node.type = NodeGeneType.OUTPUT;

      node.x = 1;
      node.y = outputCount === 1 ? 0.5 : i / (outputCount - 1);

      this._nodes.push(node);
      this._outputNodes.push(node);
    }
  }

  public mutate() {
    if (Math.random() < NeatGenome.MUTATE_ADD_CONNECTION_PROBABILITY)
      this.mutateAddConnection();

    if (Math.random() < NeatGenome.MUTATE_ADD_NODE_PROBABILITY)
      this.mutateAddNode();

    if (Math.random() < NeatGenome.MUTATE_TOGGLE_CONNECTION_PROBABILITY)
      this.mutateToggleConnection();

    if (Math.random() < NeatGenome.MUTATE_WEIGHT_SHIFT_PROBABILITY)
      this.mutateWeightShift();

    if (Math.random() < NeatGenome.MUTATE_WEIGHT_RANDOMISE_PROBABILITY)
      this.mutateWeightRandomise();
  }

  public mutateAll() {
    // debug function
    this.mutateAddConnection();
    this.mutateAddNode();
    this.mutateToggleConnection();
    this.mutateWeightShift();
    this.mutateWeightRandomise();
  }

  public mutateAddConnection() {
    // todo: fix connections added even if they already exist (same from and to nodes)
    for (let i = 0; i < NeatGenome.MUTATE_ADD_NODE_ATTEMPTS; i++) {
      let fromNode =
        this._nodes[Math.floor(Math.random() * this._nodes.length)];
      let toNode = this._nodes[Math.floor(Math.random() * this._nodes.length)];

      if (fromNode.x > toNode.x) {
        [fromNode, toNode] = [toNode, fromNode];
      }

      const exists = this._connections.find(
        (connection) =>
          connection.fromNode === fromNode && connection.toNode === toNode
      );

      if (exists) continue;

      if (!fromNode || !toNode) continue;
      if (fromNode.x === toNode.x) continue;

      const connection = new NeatConnectionGene(fromNode, toNode);
      this._innovationTracker.setConnectionInnovationNumber(connection);
      this._connections.push(connection);

      fromNode.addToConnection(connection);
      toNode.addFromConnection(connection);
      break;
    }
  }

  public mutateAddNode() {
    for (let i = 0; i < NeatGenome.MUTATE_ADD_NODE_ATTEMPTS; i++) {
      const connection =
        this._connections[Math.floor(Math.random() * this._connections.length)];

      if (!connection) continue;
      this._connections.splice(this._connections.indexOf(connection), 1);

      const fromNode = connection.fromNode;
      const toNode = connection.toNode;

      const node = new NeatNodeGene();
      this._innovationTracker.setNodeInnovationNumber(node);

      node.x = (fromNode.x + toNode.x) / 2;
      node.y = (fromNode.y + toNode.y) / 2 + (Math.random() / 10 - 0.05);

      const connection1 = new NeatConnectionGene(fromNode, node);
      this._innovationTracker.setConnectionInnovationNumber(connection1);
      connection1.weight = 1; // TODO: check this

      const connection2 = new NeatConnectionGene(node, toNode);
      this._innovationTracker.setConnectionInnovationNumber(connection2);
      connection2.weight = connection.weight;

      this._nodes.push(node);
      this._connections.push(connection1);
      this._connections.push(connection2);
      break;
    }
  }

  public mutateToggleConnection() {
    const connection =
      this._connections[Math.floor(Math.random() * this._connections.length)];

    if (!connection) return;

    connection.toggleEnabled();
  }

  public mutateWeightShift() {
    const connection =
      this._connections[Math.floor(Math.random() * this._connections.length)];

    if (!connection) return;

    connection.weight += Math.random() * 2 - 1;
  }

  public mutateWeightRandomise() {
    const connection =
      this._connections[Math.floor(Math.random() * this._connections.length)];

    if (!connection) return;

    connection.weight = Math.random() * 2 - 1;
  }

  public calculateOutput(inputs: number[]) {
    if (inputs.length !== this._inputNodes.length)
      throw new Error("Invalid input length");

    this._nodes.forEach((node) => {
      node.output = null;
    });

    this._inputNodes.forEach((node, index) => {
      node.output = inputs[index];
    });

    const outputs: number[] = [];
    this._outputNodes.forEach((node) => {
      const output = node.output;
      if (output === null) throw new Error("Unexpected null output");
      outputs.push(output);
    });

    return outputs;
  }

  public get connections() {
    return this._connections;
  }

  public get nodes() {
    return this._nodes;
  }

  public prettify() {
    // note: did the job, but did't work as good as I hoped
    const layers = new Map<number, NeatNodeGene[]>();
    for (const node of this._nodes) {
      if (!layers.has(node.x)) layers.set(node.x, []);
      layers.get(node.x)!.push(node);
    }
    console.log(layers);

    [...layers.values()].forEach((layer) => {
      layer.forEach((node, index) => {
        node.y = layer.length === 1 ? 0.5 : index / (layer.length - 1);
      });
    });

    [...layers.keys()].forEach((layer, index) => {
      const nodes = layers.get(layer)!;
      nodes.forEach((node) => {
        node.x = layers.size === 1 ? 0.5 : index / (layers.size - 1);
      });
    });
  }
}
