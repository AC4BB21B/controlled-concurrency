import Helpers from './Helpers';

export default class ParallelizeBasic {
  private readonly granularity = 0.001;
  private currentlyRunning: number = 0;

  constructor(private maxRunning: number) {
    if (maxRunning < 1) throw RangeError('Invalid maxRunning value (must be >= 1)');
  }

  public async run(promise: Promise<any>): Promise<void> {
    ++this.currentlyRunning;
    promise
    .catch()
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
  }
}
