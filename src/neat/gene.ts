export class NeatGene {
  private _innovationNumber: number = -1;

  public get innovationNumber() {
    return this._innovationNumber;
  }

  public set innovationNumber(innovationNumber: number) {
    this._innovationNumber = innovationNumber;
  }

  public static sortByInnovationNumber(gene1: NeatGene, gene2: NeatGene) {
    return gene1.innovationNumber - gene2.innovationNumber;
  }
}
