import { NeatConnectionGene } from "./connection-gene";
import { NeatGene } from "./gene";

enum GeneType {
  INPUT,
  OUTPUT,
  HIDDEN,
}

export class NeatNodeGene extends NeatGene {
  private _x: number = -1;
  private _y: number = -1;
  private _type: GeneType = GeneType.HIDDEN;
  private _fromConnections: NeatConnectionGene[] = [];
  private _toConnections: NeatConnectionGene[] = [];

  constructor() {
    super();
  }

  public get x() {
    return this._x;
  }

  public get y() {
    return this._y;
  }

  public get type() {
    return this._type;
  }

  public set type(type: GeneType) {
    this._type = type;
  }
}
