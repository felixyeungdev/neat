import { NeatConnectionGene } from "./connection-gene";
import { NeatGene } from "./gene";
import { NeatGeneCollection } from "./gene-collection";

export enum NodeGeneType {
  INPUT,
  OUTPUT,
  HIDDEN,
}

export class NeatNodeGene extends NeatGene {
  private _x: number = -1;
  private _y: number = -1;
  private _type: NodeGeneType = NodeGeneType.HIDDEN;
  private _fromConnections: NeatGeneCollection<NeatConnectionGene> =
    new NeatGeneCollection();
  private _toConnections: NeatGeneCollection<NeatConnectionGene> =
    new NeatGeneCollection();
  private _output: number | null = null;

  constructor() {
    super();
  }

  private static sigmoid(x: number) {
    return 1 / (1 + Math.exp(-4.9 * x));
  }

  public get x() {
    return this._x;
  }

  public set x(x: number) {
    this._x = x;
  }

  public get y() {
    return this._y;
  }

  public set y(y: number) {
    this._y = y;
  }

  public get type() {
    return this._type;
  }

  public set type(type: NodeGeneType) {
    this._type = type;
  }

  public get output() {
    if (this._output !== null) return this._output;

    let sum = 0;
    for (const connection of this._fromConnections) {
      const fromNode = connection.fromNode;
      if (fromNode.output === null) continue;
      sum += fromNode.output * connection.weight;
    }

    this._output = NeatNodeGene.sigmoid(sum);
    return this._output;
  }

  public set output(output: number | null) {
    this._output = output;
  }

  public addFromConnection(connection: NeatConnectionGene) {
    connection.toNode = this;
    this._fromConnections.add(connection);
  }

  public addToConnection(connection: NeatConnectionGene) {
    connection.fromNode = this;
    this._toConnections.add(connection);
  }

  public copy() {
    const copy = new NeatNodeGene();
    copy.innovationNumber = this.innovationNumber;
    copy.x = this.x;
    copy.y = this.y;
    copy.type = this.type;
    return copy;
  }
}
