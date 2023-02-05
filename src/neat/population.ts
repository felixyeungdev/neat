import { NeatGenome } from "./genome.js";
import { NeatInnovationTracker } from "./innovation.js";
import type { NeatOptions } from "./neat.js";
import { NeatSpeciation, NeatSpecie } from "./speciation.js";

export class NeatPopulation {
  private _agents: NeatAgent[] = [];
  private _availableAgents: NeatAgent[] = [];
  private _takenAgents: NeatAgent[] = [];
  private _speciation = new NeatSpeciation();

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
    this._speciation.speciate(this._agents);
  }

  mutate() {
    for (const agent of this._agents) agent.genome?.mutate();
  }

  getNewGenome() {
    return new NeatGenome(
      this._options.inputSize,
      this._options.outputSize,
      this._innovationTracker
    );
  }

  getReproducedGenome() {
    if (this._speciation.species.size === 0) return this.getNewGenome();

    const specie = this._speciation.species.randomSpecie();
    if (!specie) return this.getNewGenome();

    const newGenome = specie.reproduce();
    return newGenome ?? this.getNewGenome();
  }

  kill(percent: number) {
    this._speciation.species.kill(percent);
  }

  reproduce() {
    for (const agent of this._agents) {
      if (agent.genome) continue;
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

  get speciation() {
    return this._speciation;
  }
}

export class NeatAgent {
  private _genome: NeatGenome | null;
  private _fitness = 0;
  private _adjustedFitness = 0;
  private _genomeAge = 0;
  private _taken = false;
  private _specie: NeatSpecie | null = null;

  constructor(genome: NeatGenome) {
    this._genome = genome;
  }

  public get genome() {
    return this._genome;
  }

  public set genome(genome: NeatGenome | null) {
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
    if (!this._genome) throw new Error("Agent has no genome");
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

  public get specie() {
    return this._specie;
  }

  public set specie(specie: NeatSpecie | null) {
    this._specie = specie;
  }
}
