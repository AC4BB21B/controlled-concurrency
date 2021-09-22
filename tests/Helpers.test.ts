/* eslint-disable prefer-arrow-callback */
// "Passing arrow functions (aka “lambdas”) to Mocha is discouraged"
// https://mochajs.org/#arrow-functions

import {expect} from 'chai';

import Helpers from '../src/Helpers';

function timestampNow(): number {
  return (new Date()).getTime() / 1_000;
}

describe('Helpers unit tests', function(): void {
  it('waits negative time', async function(): Promise<void> {
    const startTime = timestampNow();
    await Helpers.wait(-1);
    const endTime = timestampNow();
    expect(endTime - startTime).is.greaterThanOrEqual(0);
    expect(endTime - startTime).is.lessThan(0.05);
  });

  it('waits 0.2s', async function(): Promise<void> {
    this.slow(250);
    const startTime = timestampNow();
    await Helpers.wait(0.2);
    const endTime = timestampNow();
    expect(endTime - startTime).is.greaterThanOrEqual(0.2);
    expect(endTime - startTime).is.lessThan(0.25);
  });

  it('waits 0.4s', async function(): Promise<void> {
    this.slow(450);
    const startTime = timestampNow();
    await Helpers.wait(0.4);
    const endTime = timestampNow();
    expect(endTime - startTime).is.greaterThanOrEqual(0.4);
    expect(endTime - startTime).is.lessThan(0.45);
  });
});
