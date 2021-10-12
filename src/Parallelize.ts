import Helpers from './Helpers';

export default class Parallelize {
  private currentlyRunning: number = 0;
  private maxRunning: number;
  private throwOnError: boolean;
  private storeResults: boolean;
  private granularity: number;
  private exceptions: any[] = [];
  private rawResults: ({
    index: number;
    status: 'fulfilled';
    value: any;
  } | {
    index: number;
    status: 'rejected';
    reason: any;
  })[] = [];
  private index: number = 0;

  constructor(p: {
    maxRunning: number;
    throwOnError?: boolean;
    storeResults?: boolean;
    granularity?: number;
  }) {
    if (p.maxRunning < 1) throw RangeError('Invalid maxRunning value (must be >= 1)');
    this.maxRunning = p.maxRunning;
    this.throwOnError = p.throwOnError ? true : false;
    this.storeResults = p.storeResults ? true : false;
    this.granularity = p.granularity ? p.granularity : 0.001;
  }

  public async run(promise: Promise<any>): Promise<void> {
    this.throwIfWeMust();

    const index = this.index++;
    ++this.currentlyRunning;
    promise
    .then(r => this.storeResultSuccess(index, r))
    .catch(e => this.storeResultFailure(index, e))
    .finally(() => --this.currentlyRunning);

    while (this.currentlyRunning >= this.maxRunning) {
      await Helpers.wait(this.granularity);
    }
  }

  public async finish(): Promise<void | PromiseAllSettledList> {
    while (this.currentlyRunning > 0) {
      await Helpers.wait(this.granularity);
    }
    this.throwIfWeMust();
    if (this.storeResults) {
      let sortedResults: PromiseAllSettledList = new Array(this.rawResults.length);
      for (const r of this.rawResults) {
        if (r.status === 'fulfilled') {
          sortedResults[r.index] = {
            status: r.status,
            value: r.value
          };
        } else {
          sortedResults[r.index] = {
            status: r.status,
            reason: r.reason
          };
        }
      }
      return sortedResults;
    }
  }

  private throwIfWeMust(): void {
    if (this.exceptions.length > 0) {
      const copy = JSON.parse(JSON.stringify(this.exceptions));
      this.exceptions = [];
      throw copy;
    }
  }

  private storeResultFailure(index: number, error: any): void {
    if (this.storeResults) {
      this.rawResults.push({
        index: index,
        status: 'rejected',
        reason: error
      });
    }
    if (this.throwOnError) this.exceptions.push(error);
  }

  private storeResultSuccess(index: number, value: any): void {
    if (!this.storeResults) return;
    this.rawResults.push({
      index: index,
      status: 'fulfilled',
      value: value
    });
  }
}

type PromiseAllSettledItem = {status: 'fulfilled'; value: any} | {status: 'rejected'; reason: any};
type PromiseAllSettledList = PromiseAllSettledItem[];
