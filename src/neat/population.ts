import { NeatGenome } from "./genome.js";
import { NeatInnovationTracker } from "./innovation.js";
import type { NeatOptions } from "./neat.js";

type GroupedSpecie = NeatAgent[][];

export class NeatPopulation {
  private _agents: NeatAgent[] = [];
  private _availableAgents: NeatAgent[] = [];
  private _takenAgents: NeatAgent[] = [];
  private _soullessAgents: NeatAgent[] = [];
  private _species: GroupedSpecie = [];

  private _innovationTracker: NeatInnovationTracker =
    new NeatInnovationTracker();

  private _options: NeatOptions;

  constructor(options: NeatOptions) {
    this._options = options;
  }

  public tick() {
    for (const agent of this._agents) agent.tick();
  }

  public speciate() {
    const species: GroupedSpecie = [];

    for (const agent of this._agents.filter((agent) => agent.genomeAge > 500)) {
      if (species.length === 0) {
        species.push([agent]);
        continue;
      }

      let found = false;

      for (const specie of species) {
        const firstAgent = specie[0];
        if (!firstAgent) continue;

        const distance = NeatGenome.distance(firstAgent.genome, agent.genome);
        if (distance < 1.25) {
          specie.push(agent);
          found = true;
          break;
        }
      }
      if (!found) species.push([agent]);
    }

    for (const specie of species) {
      specie.sort((a, b) => b.fitness - a.fitness);
      for (const agent of specie) {
        agent.calculateAdjustedFitness(specie.length);
      }
    }

    this._species = species;
  }

  mutate() {
    for (const agent of this._agents) agent.genome.mutate();
  }

  getNewGenome() {
    return new NeatGenome(
      this._options.inputSize,
      this._options.outputSize,
      this._innovationTracker
    );
  }

  getReproducedGenome() {
    if (this._species.length === 0) return this.getNewGenome();
    const specie =
      this._species[Math.floor(Math.random() * this._species.length)];
    if (!specie) return this.getNewGenome();

    const parent1 = specie[Math.floor(Math.random() * specie.length)];
    const parent2 = specie[Math.floor(Math.random() * specie.length)];

    if (!parent1 || !parent2) return this.getNewGenome();

    if (parent1.fitness > parent2.fitness)
      return NeatGenome.crossover(parent1.genome, parent2.genome);
    return NeatGenome.crossover(parent2.genome, parent1.genome);
  }

  kill(percent: number) {
    console.log(this._species.map((s) => s.map((a) => a.fitness)));
    for (const specie of this._species) {
      const cutoff = Math.floor(specie.length * percent);
      const toKill = specie.slice(-cutoff);
      for (const agent of toKill) {
        this._soullessAgents.push(agent);

        const index = specie.indexOf(agent);
        specie.splice(index, 1);
      }

      if (specie.length === 0) {
        const index = this._species.indexOf(specie);
        this._species.splice(index, 1);
      }
    }

    console.log(this._species.map((s) => s.map((a) => a.fitness)));

    console.log(`Killed ${this._soullessAgents.length} agents.`);

    // const lowestAdjustedFitness = Math.min(
    //   ...this._agents.map((a) => a.adjustedFitness)
    // );
    // const toKill = this._agents.find(
    //   (a) => a.adjustedFitness < lowestAdjustedFitness
    // );
    // if (toKill) this._soullessAgents.push(toKill);
  }

  reproduce() {
    while (this._soullessAgents.length > 0) {
      const agent = this._soullessAgents.pop();
      if (!agent) continue;

      agent.fitness = 0;
      agent.genome = this.getReproducedGenome();
      agent.genome.mutate();
    }
  }

  evolve() {
    this.speciate();
    this.kill(0.75);
    this.reproduce();
    // this.mutate();
  }

  requestAgent() {
    if (this._availableAgents.length !== 0) {
      const agent = this._availableAgents.pop();

      if (!agent) throw new Error("Unexpected null agent");

      this._takenAgents.push(agent);
      agent.taken = true;
      return agent;
    }

    const newGenome = this.getReproducedGenome();
    const agent = new NeatAgent(newGenome);
    this._agents.push(agent);
    this._takenAgents.push(agent);
    agent.taken = true;
    return agent;
  }

  releaseAgent(agent: NeatAgent) {
    const index = this._takenAgents.indexOf(agent);
    this._takenAgents.splice(index, 1);
    this._availableAgents.push(agent);
    agent.taken = false;
  }
}

export class NeatAgent {
  private _genome: NeatGenome;
  private _fitness = 0;
  private _adjustedFitness = 0;
  private _genomeAge = 0;
  private _taken = false;

  constructor(genome: NeatGenome) {
    this._genome = genome;
  }

  public get genome() {
    return this._genome;
  }

  public set genome(genome: NeatGenome) {
    this._genome = genome;
  }

  public get fitness() {
    return this._fitness;
  }

  public set fitness(fitness: number) {
    this._fitness = fitness;
  }

  public get adjustedFitness() {
    return this._adjustedFitness;
  }

  public set adjustedFitness(adjustedFitness: number) {
    this._adjustedFitness = adjustedFitness;
  }

  public calculateAdjustedFitness(specieSize: number) {
    this._adjustedFitness = this._fitness / specieSize;
  }

  public activate(inputs: number[]) {
    return this._genome.calculateOutput(inputs);
  }

  public get taken() {
    return this._taken;
  }

  public set taken(taken: boolean) {
    this._taken = taken;
  }

  public get genomeAge() {
    return this._genomeAge;
  }

  public tick() {
    this._genomeAge++;
  }
}
