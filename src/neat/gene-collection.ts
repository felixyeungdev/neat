import { NeatGene } from "./gene";

export class NeatGeneCollection<T extends NeatGene> {
  private _genes: T[] = [];

  public get genes() {
    return this._genes;
  }

  public contains(gene: T) {
    const found = this._genes.find(
      (g) => g.innovationNumber === gene.innovationNumber
    );
    return !!found;
  }

  public add(gene: T) {
    if (this.contains(gene)) return;
    this._genes.push(gene);
  }

  public remove(gene: T) {
    const index = this._genes.findIndex(
      (g) => g.innovationNumber === gene.innovationNumber
    );
    if (index === -1) return;
    this._genes.splice(index, 1);
  }

  public sortByInnovationNumber() {
    this._genes.sort((gene1: NeatGene, gene2: NeatGene) => {
      return gene1.innovationNumber - gene2.innovationNumber;
    });
    return this._genes;
  }

  public [Symbol.iterator]() {
    return this._genes[Symbol.iterator]();
  }

  public get size() {
    return this._genes.length;
  }

  public get(index: number) {
    return this._genes[index];
  }

  public getByInnovationNumber(innovationNumber: number) {
    return this._genes.find((g) => g.innovationNumber === innovationNumber);
  }

  public random() {
    return this._genes[Math.floor(Math.random() * this._genes.length)];
  }
}
