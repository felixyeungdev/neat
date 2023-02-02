interface NeatOptions {
  inputSize: number;
  outputSize: number;
}

export class Neat {
  private _options: NeatOptions;

  constructor(options: NeatOptions) {
    this._options = options;
  }
}
