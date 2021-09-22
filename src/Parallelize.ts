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
    // console.log('Parallelize.run');
    // logger.logVerbose(this.currentlyRunning, this.maxRunning);

    if (this.exceptions.length > 0) {
      // console.log('Parallelize.run throw 1', this.exceptions);
      const copy = JSON.parse(JSON.stringify(this.exceptions));
      this.exceptions = [];
      throw copy;
    }

    ++this.currentlyRunning;
    promise
    .then(() => {
      --this.currentlyRunning;
    })
    .catch(e => {
      // console.log('throwing', e);
      if (this.throwOnError) {
        this.exceptions.push(e);
        --this.currentlyRunning;
        // console.log('Parallelize.run throw 2', this.exception);
        // throw this.exceptions;
      } else {
        --this.currentlyRunning;
      }
    });

    while (this.currentlyRunning >= this.maxRunning) {
      // logger.logVerbose(`Too many tasks running (${this.currentlyRunning}/${this.maxRunning}, waiting...`);
      await Helpers.wait(this.granularity);
    }
  }

  public async finish(): Promise<void> {
    // console.log('Parallelize.finish');
    while (this.currentlyRunning > 0) {
      // console.log(`Still ${this.currentlyRunning} tasks running...`);
      await Helpers.wait(this.granularity);
    }
    if (this.exceptions.length > 0) {
      // console.log('Parallelize.finish throw', this.exceptions);
      const copy = JSON.parse(JSON.stringify(this.exceptions));
      this.exceptions = [];
      throw copy;
    }
  }
}
