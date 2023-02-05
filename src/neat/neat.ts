import type { NeatAgent } from "./population.js";
import { NeatPopulation } from "./population.js";

export interface NeatOptions {
  inputSize: number;
  outputSize: number;
  evolutionInterval: number;
}

export class Neat {
  private _options: NeatOptions;
  private _population: NeatPopulation;
  private timeUntilNextEvolution = 0;

  constructor(options: NeatOptions) {
    this._options = options;
    this._population = new NeatPopulation(options);
  }

  public requestAgent() {
    return this._population.requestAgent();
  }

  public releaseAgent(agent: NeatAgent) {
    this._population.releaseAgent(agent);
  }

  public tick() {
    this._population.tick();
    this.timeUntilNextEvolution--;
    if (this.timeUntilNextEvolution <= 0) {
      this.timeUntilNextEvolution = this._options.evolutionInterval;
      console.log("Evolving...");
      this._population.evolve();
    }
  }

  public get stats() {
    return {
      species: this._population.speciation.species.size,
    };
  }
}
