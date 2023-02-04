import { NeatGenome } from "./genome.js";
import { NeatInnovationTracker } from "./innovation.js";
import { NeatOptions } from "./neat.js";

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

      for (const specie of species) {
        const firstAgent = specie[0];
        const distance = NeatGenome.distance(firstAgent.genome, agent.genome);
        if (distance < 4) {
          specie.push(agent);
          break;
        } else {
          species.push([agent]);
          break;
        }
      }
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

  getReproducedGenome() {
    if (this._species.length === 0)
      return new NeatGenome(
        this._options.inputSize,
        this._options.outputSize,
        this._innovationTracker
      );
    const specie =
      this._species[Math.floor(Math.random() * this._species.length)];
    const parent1 = specie[Math.floor(Math.random() * specie.length)];
    const parent2 = specie[Math.floor(Math.random() * specie.length)];

    if (parent1.fitness > parent2.fitness)
      return NeatGenome.crossover(parent1.genome, parent2.genome);
    return NeatGenome.crossover(parent2.genome, parent1.genome);
  }

  kill(percent: number = 0.8) {
    // for (const specie of this._species) {
    //   const cutoff = Math.floor(specie.length * percent);
    //   const toKill = specie.slice(cutoff);
    //   for (const agent of toKill) {
    //     this._soullessAgents.push(agent);
    //   }
    // }

    const lowestAdjustedFitness = Math.min(
      ...this._agents.map((a) => a.adjustedFitness)
    );
    const toKill = this._agents.find(
      (a) => a.adjustedFitness < lowestAdjustedFitness
    );
    if (toKill) this._soullessAgents.push(toKill);
  }

  reproduce() {
    while (this._soullessAgents.length > 0) {
      const agent = this._soullessAgents.pop()!;
      agent.genome = this.getReproducedGenome();
    }
  }

  evolve() {
    this.speciate();
    this.kill(0.9);
    this.reproduce();
    this.mutate();
  }

  requestAgent() {
    if (this._availableAgents.length !== 0) {
      const agent = this._availableAgents.pop()!;
      this._takenAgents.push(agent);
      agent.taken = true;
      return agent;
    }

    const newGenome = new NeatGenome(
      this._options.inputSize,
      this._options.outputSize,
      this._innovationTracker
    );
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
  private _fitness: number = 0;
  private _adjustedFitness: number = 0;
  private _genomeAge: number = 0;
  private _taken: boolean = false;

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

  public calculateAdjustedFitness(specieSize: number) {
    this._adjustedFitness = this._fitness / specieSize;
  }

  public set adjustedFitness(adjustedFitness: number) {
    this._adjustedFitness = adjustedFitness;
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
