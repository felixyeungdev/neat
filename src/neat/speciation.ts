import { NeatGenome } from "./genome.js";
import { NeatAgent } from "./population.js";

const genomeAgeRequiredForSpeciation = 500;

export class NeatSpeciation {
  private _species: NeatSpecies = new NeatSpecies();

  public speciate(agents: NeatAgent[]) {
    for (const agent of agents.filter(
      (agent) => agent.genomeAge > genomeAgeRequiredForSpeciation
    )) {
      if (agent.specie) continue;

      if (this._species.size === 0) {
        this._species.createNewSpecie(agent);
        continue;
      }

      let found = false;

      for (const specie of this._species.species) {
        if (specie.specieBelongs(agent)) {
          specie.add(agent);
          found = true;
          break;
        }
      }
      if (!found) this._species.createNewSpecie(agent);
    }

    this._species.sortByFitness();
  }

  public get species() {
    return this._species;
  }
}

export class NeatSpecies {
  private _species: NeatSpecie[] = [];

  public sortByFitness() {
    this._species.forEach((specie) => specie.sortByFitness());
  }

  public kill(percentage: number) {
    this._species.forEach((specie) => specie.kill(percentage));

    // remove extinct species
    const oldSpeciesSize = this._species.length;
    this._species = this._species.filter((specie) => specie.size > 0);
    const newSpeciesSize = this._species.length;

    console.log(
      `Killed ${
        oldSpeciesSize - newSpeciesSize
      } species, ${newSpeciesSize} left`
    );
  }

  public get size() {
    return this._species.length;
  }

  public get species() {
    return this._species;
  }

  public createNewSpecie(agent: NeatAgent) {
    const specie = new NeatSpecie();
    specie.add(agent);
    this._species.push(specie);
    return specie;
  }

  public randomSpecie() {
    return this._species[Math.floor(Math.random() * this._species.length)];
  }
}

export class NeatSpecie {
  private _agents: NeatAgent[] = [];

  public sortByFitness() {
    this._agents.sort((a, b) => b.fitness - a.fitness);
  }

  public kill(percentage: number) {
    const cutoff = Math.floor(this.size * percentage);
    const toKill = this._agents
      .filter((agent) => agent.genomeAge > genomeAgeRequiredForSpeciation)
      .slice(-cutoff);
    for (const agent of toKill) {
      agent.specie = null;
      agent.genome = null;
      const index = this._agents.indexOf(agent);
      this._agents.splice(index, 1);
    }
  }

  public reproduce() {
    const parent1 = this._agents[Math.floor(Math.random() * this.size)];
    const parent2 = this._agents[Math.floor(Math.random() * this.size)];

    if (!parent1?.genome || !parent2?.genome) return null;

    if (parent1.fitness > parent2.fitness)
      return NeatGenome.crossover(parent1.genome, parent2.genome);
    return NeatGenome.crossover(parent2.genome, parent1.genome);
  }

  public get size() {
    return this._agents.length;
  }

  public add(agent: NeatAgent) {
    agent.specie = this;
    this._agents.push(agent);
  }

  public specieBelongs(agent: NeatAgent) {
    if (!agent.genome) return false;

    const firstAgent = this._agents[0];
    if (!firstAgent?.genome) return false;

    const distance = NeatGenome.distance(firstAgent.genome, agent.genome);
    return distance < 1.25;
  }

  public get agents() {
    return this._agents;
  }
}
