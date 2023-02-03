import { NeatConnectionGene } from "./connection-gene";
import { NeatGeneCollection } from "./gene-collection";
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

  private _connections: NeatGeneCollection<NeatConnectionGene> =
    new NeatGeneCollection();
  private _nodes: NeatGeneCollection<NeatNodeGene> = new NeatGeneCollection();
  private _innovationTracker: NeatInnovationTracker;

  constructor(
    inputCount: number,
    outputCount: number,
    innovationTracker: NeatInnovationTracker
  ) {
    this._innovationTracker = innovationTracker;

    for (let i = 0; i < inputCount; i++) {
      const node = new NeatNodeGene();
      node.innovationNumber = i;
      this._innovationTracker.registerNode(node);
      node.type = NodeGeneType.INPUT;

      node.x = 0;
      node.y = inputCount === 1 ? 0.5 : i / (inputCount - 1);

      this._nodes.add(node);
    }

    for (let i = 0; i < outputCount; i++) {
      const node = new NeatNodeGene();
      node.innovationNumber = inputCount + i;
      this._innovationTracker.registerNode(node);
      node.type = NodeGeneType.OUTPUT;

      node.x = 1;
      node.y = outputCount === 1 ? 0.5 : i / (outputCount - 1);

      this._nodes.add(node);
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
      let fromNode = this._nodes.random();
      let toNode = this._nodes.random();

      if (fromNode.x > toNode.x) {
        [fromNode, toNode] = [toNode, fromNode];
      }

      const exists = this._connections.genes.find(
        (connection) =>
          connection.fromNode === fromNode && connection.toNode === toNode
      );

      if (exists) continue;

      if (!fromNode || !toNode) continue;
      if (fromNode.x === toNode.x) continue;

      const connection = new NeatConnectionGene(fromNode, toNode);
      this._innovationTracker.setConnectionInnovationNumber(connection);
      this._connections.add(connection);

      fromNode.addToConnection(connection);
      toNode.addFromConnection(connection);
      break;
    }
  }

  public mutateAddNode() {
    for (let i = 0; i < NeatGenome.MUTATE_ADD_NODE_ATTEMPTS; i++) {
      const connection = this._connections.random();

      if (!connection) continue;
      this._connections.remove(connection);

      const fromNode = connection.fromNode;
      const toNode = connection.toNode;
      fromNode.removeToConnection(connection);
      toNode.removeFromConnection(connection);

      const node = new NeatNodeGene();
      this._innovationTracker.setNodeInnovationNumber(node);

      node.x = (fromNode.x + toNode.x) / 2;
      node.y = (fromNode.y + toNode.y) / 2 + (Math.random() / 10 - 0.05);

      const connection1 = new NeatConnectionGene(fromNode, node);
      this._innovationTracker.setConnectionInnovationNumber(connection1);
      connection1.weight = 1;

      const connection2 = new NeatConnectionGene(node, toNode);
      this._innovationTracker.setConnectionInnovationNumber(connection2);
      connection2.weight = connection.weight;

      this._nodes.add(node);
      this._connections.add(connection1);
      this._connections.add(connection2);
      break;
    }
  }

  public mutateToggleConnection() {
    const connection = this._connections.random();

    if (!connection) return;

    connection.toggleEnabled();
  }

  public mutateWeightShift() {
    const connection = this._connections.random();

    if (!connection) return;

    connection.weight += Math.random() * 2 - 1;
  }

  public mutateWeightRandomise() {
    const connection = this._connections.random();

    if (!connection) return;

    connection.weight = Math.random() * 2 - 1;
  }

  public calculateOutput(inputs: number[]) {
    if (inputs.length !== this.inputNodes.length)
      throw new Error("Invalid input length");

    this._nodes.genes.forEach((node) => {
      node.output = null;
    });

    this.inputNodes.forEach((node, index) => {
      node.output = inputs[index];
    });

    const outputs: number[] = [];
    this.outputNodes.forEach((node) => {
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

  public get inputNodes() {
    return this._nodes.genes.filter((node) => node.type === NodeGeneType.INPUT);
  }

  public get outputNodes() {
    return this._nodes.genes.filter(
      (node) => node.type === NodeGeneType.OUTPUT
    );
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

  public static crossover(genome1: NeatGenome, genome2: NeatGenome) {
    const newGenome = new NeatGenome(0, 0, genome1._innovationTracker);
    const connections1 = genome1.connections.sortByInnovationNumber();
    const connections2 = genome2.connections.sortByInnovationNumber();

    let connections1Index = 0;
    let connections2Index = 0;

    while (
      connections1Index < connections1.length &&
      connections2Index < connections2.length
    ) {
      const connection1 = connections1[connections1Index];
      const connection2 = connections2[connections2Index];

      if (connection1.innovationNumber === connection2.innovationNumber) {
        // similar gene
        const chosenConnection =
          Math.random() > 0.5 ? connection1 : connection2;
        newGenome._connections.add(chosenConnection.copy());

        connections1Index++;
        connections2Index++;
      } else if (connection1.innovationNumber < connection2.innovationNumber) {
        // disjoint gene of genome1
        newGenome._connections.add(connection1.copy());
        connections1Index++;
      } else {
        // disjoint gene of genome2
        newGenome._connections.add(connection2.copy());
        connections2Index++;
      }
    }

    for (const inputNode of genome1.inputNodes) {
      newGenome._nodes.add(inputNode.copy());
    }

    for (const outputNode of genome1.outputNodes) {
      newGenome._nodes.add(outputNode.copy());
    }

    while (connections1Index < connections1.length) {
      // excess genes of genome1
      const connection = connections1[connections1Index];
      newGenome._connections.add(connection.copy());
      connections1Index++;
    }

    while (connections2Index < connections2.length) {
      // excess genes of genome2
      const connection = connections2[connections2Index];
      newGenome._connections.add(connection.copy());
      connections2Index++;
    }

    for (const connection of newGenome._connections) {
      if (!newGenome._nodes.contains(connection.fromNode)) {
        const copy = connection.fromNode.copy();
        newGenome._nodes.add(copy);
      }
      if (!newGenome._nodes.contains(connection.toNode)) {
        const copy = connection.toNode.copy();
        newGenome._nodes.add(copy);
      }
    }

    for (const connection of newGenome._connections) {
      const fromNode = newGenome.nodes.getByInnovationNumber(
        connection.fromNode.innovationNumber
      );
      const toNode = newGenome.nodes.getByInnovationNumber(
        connection.toNode.innovationNumber
      );

      if (!fromNode || !toNode) throw new Error("Unexpected null node");

      connection.fromNode = fromNode;
      connection.toNode = toNode;

      fromNode.addToConnection(connection);
      toNode.addFromConnection(connection);
    }

    return newGenome;
  }

  public static distance(genome1: NeatGenome, genome2: NeatGenome) {
    const C1 = 1;
    const C2 = 1;
    const C3 = 1;

    const connections1 = genome1.connections.sortByInnovationNumber();
    const connections2 = genome2.connections.sortByInnovationNumber();

    let connections1Index = 0;
    let connections2Index = 0;

    let similarGenes = 0;
    let disjointGenes = 0;
    let excessGenes = 0;
    let weightDiff = 0;

    while (
      connections1Index < connections1.length &&
      connections2Index < connections2.length
    ) {
      const connection1 = connections1[connections1Index];
      const connection2 = connections2[connections2Index];

      if (connection1.innovationNumber === connection2.innovationNumber) {
        // similar gene
        similarGenes++;
        connections1Index++;
        connections2Index++;
        weightDiff += Math.abs(connection1.weight - connection2.weight);
      } else if (connection1.innovationNumber < connection2.innovationNumber) {
        // disjoint gene of genome1
        disjointGenes++;
        connections1Index++;
      } else {
        // disjoint gene of genome2
        disjointGenes++;
        connections2Index++;
      }
    }

    if (connections1Index < connections1.length) {
      // excess genes of genome1
      excessGenes += connections1.length - connections1Index;
    } else {
      // excess genes of genome2
      excessGenes += connections2.length - connections2Index;
    }

    weightDiff = weightDiff / Math.max(1, similarGenes);

    let N = Math.max(connections1.length, connections2.length);
    if (N < 20) N = 1;

    return (C1 * excessGenes) / N + (C2 * disjointGenes) / N + C3 * weightDiff;
  }
}
