import Helpers from './Helpers';

export default class Parallelize {
  private currentlyRunning: number = 0;
  private maxRunning: number;
  private throwOnError: boolean;
  private granularity: number;
  private exceptions: any[] = [];

  constructor(p: {
    maxRunning: number;
    throwOnError: boolean;
    granularity?: number;
  }) {
    if (p.maxRunning < 1) throw RangeError('Invalid maxRunning value (must be >= 1)');
    this.maxRunning = p.maxRunning;
    this.throwOnError = p.throwOnError;
    this.granularity = p.granularity ? p.granularity : 0.1;
  }

  public async run(promise: Promise<any>): Promise<void> {
    this.throwIfWeMust();

    ++this.currentlyRunning;
    promise
    .catch(e => {
      if (this.throwOnError) this.exceptions.push(e);
    })
    .finally(() => {
      --this.currentlyRunning;
    });

    while (this.currentlyRunning >= this.maxRunning) {
      await Helpers.wait(this.granularity);
    }
  }

  public async finish(): Promise<void> {
    while (this.currentlyRunning > 0) {
      await Helpers.wait(this.granularity);
    }
    this.throwIfWeMust();
  }

  private throwIfWeMust(): void {
    if (this.exceptions.length > 0) {
      const copy = JSON.parse(JSON.stringify(this.exceptions));
      this.exceptions = [];
      throw copy;
    }
  }
}
