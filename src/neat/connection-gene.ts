import { NeatGene } from "./gene";
import { NeatNodeGene } from "./node-gene";

export class NeatConnectionGene extends NeatGene {
  private _fromNode: NeatNodeGene;
  private _toNode: NeatNodeGene;
  private _weight: number = 0;
  private _enabled: boolean = true;

  constructor(fromNode: NeatNodeGene, toNode: NeatNodeGene) {
    super();
    this._fromNode = fromNode;
    this._toNode = toNode;
  }

  public get fromNode() {
    return this._fromNode;
  }

  public set fromNode(fromNode: NeatNodeGene) {
    this._fromNode = fromNode;
  }

  public get toNode() {
    return this._toNode;
  }

  public set toNode(toNode: NeatNodeGene) {
    this._toNode = toNode;
  }

  public get weight() {
    return this._weight;
  }

  public set weight(weight: number) {
    this._weight = weight;
  }

  public get enabled() {
    return this._enabled;
  }

  public set enabled(enabled: boolean) {
    this._enabled = enabled;
  }

  public toggleEnabled() {
    this._enabled = !this._enabled;
  }
}
