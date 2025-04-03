export default class Config {
  baseApiUrl: string;

  constructor() {
    this.baseApiUrl = "WRONGURL";
  }

  static get instance(): Config {
    throw Error("Not implemented");
  }

  static reset() {
    throw Error("Not implemented");
  }
}
