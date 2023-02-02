import { NeatConnectionGene } from "./connection-gene";
import { NeatNodeGene } from "./node-gene";

export class NeatGenome {
  static MUTATE_ADD_CONNECTION_PROBABILITY = 0.05;
  static MUTATE_ADD_NODE_PROBABILITY = 0.03;
  static MUTATE_TOGGLE_CONNECTION_PROBABILITY = 0.01;
  static MUTATE_WEIGHT_SHIFT_PROBABILITY = 0.9;
  static MUTATE_WEIGHT_RANDOMISE_PROBABILITY = 0.1;

  private _connections: NeatConnectionGene[] = [];
  private _nodes: NeatNodeGene[] = [];

  private mutate() {
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
  private mutateAddConnection() {}
  private mutateAddNode() {}
  private mutateToggleConnection() {}
  private mutateWeightShift() {}
  private mutateWeightRandomise() {}
}
