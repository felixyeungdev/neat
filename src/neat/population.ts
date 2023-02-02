import { NeatGenome } from "./genome";
import { NeatInnovationTracker } from "./innovation";

export class NeatPopulation {
  private _genomes: NeatGenome[] = [];
  private _innovationTracker: NeatInnovationTracker =
    new NeatInnovationTracker();
}
