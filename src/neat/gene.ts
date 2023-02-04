export class NeatGene {
  private _innovationNumber = -1;

  public get innovationNumber() {
    return this._innovationNumber;
  }

  public set innovationNumber(innovationNumber: number) {
    this._innovationNumber = innovationNumber;
  }
}
