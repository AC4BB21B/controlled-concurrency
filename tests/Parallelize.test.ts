/* eslint-disable prefer-arrow-callback */
// "Passing arrow functions (aka “lambdas”) to Mocha is discouraged"
// https://mochajs.org/#arrow-functions

import {expect, should} from 'chai';

import Helpers from '../src/Helpers';
import Parallelize from '../src/Parallelize';

async function returnsAfter100Ms(): Promise<void> {
  await Helpers.wait(0.1);
}

async function crashes(msg: string): Promise<void> {
  await Helpers.wait(0.05);
  throw Error(msg);
}

function timestampNow(): number {
  return (new Date()).getTime() / 1_000;
}

describe('Parallelize unit tests', function(): void {
  it('parallelism = 1', async function(): Promise<void> {
    this.slow(350);
    const startTime = timestampNow();
    const parallel = new Parallelize({
      maxRunning: 1,
      throwOnError: false,
      granularity: 0.001
    });
    for (let i = 0; i < 3; i++) {
      await parallel.run(returnsAfter100Ms());
    }
    await parallel.finish();
    const endTime = timestampNow();
    expect(endTime - startTime).is.greaterThanOrEqual(0.298);
    expect(endTime - startTime).is.lessThan(0.4);
  });

  it('parallelism = 3 and < tasks', async function(): Promise<void> {
    this.slow(250);
    const startTime = timestampNow();
    const parallel = new Parallelize({
      maxRunning: 3,
      throwOnError: false,
      granularity: 0.001
    });
    for (let i = 0; i < 6; i++) {
      await parallel.run(returnsAfter100Ms());
    }
    await parallel.finish();
    const endTime = timestampNow();
    expect(endTime - startTime).is.greaterThanOrEqual(0.198);
    expect(endTime - startTime).is.lessThan(0.3);
  });

  it('parallelism = 5 and > tasks', async function(): Promise<void> {
    this.slow(120);
    const startTime = timestampNow();
    const parallel = new Parallelize({
      maxRunning: 5,
      throwOnError: false,
      granularity: 0.001
    });
    for (let i = 0; i < 2; i++) {
      await parallel.run(returnsAfter100Ms());
    }
    await parallel.finish();
    const endTime = timestampNow();
    expect(endTime - startTime).is.greaterThanOrEqual(0.098);
    expect(endTime - startTime).is.lessThan(0.2);
  });

  it('throw and ignore', async function(): Promise<void> {
    const parallel = new Parallelize({
      maxRunning: 3,
      throwOnError: false,
      granularity: 0.01
    });
    let functionThrew = false;
    try {
      await parallel.run(crashes('E1'));
      await parallel.run(crashes('E2'));
      await parallel.finish();
    } catch (e) {
      functionThrew = true;
    }
    expect(functionThrew).is.equal(false);
  });

  it('throw and throw when maxRunning = 1', async function(): Promise<void> {
    this.slow(120);
    const parallel = new Parallelize({
      maxRunning: 1,
      throwOnError: true
    });
    let functionThrew = false;
    try {
      await parallel.run(crashes('E1'));
      await parallel.run(crashes('E2'));
      await parallel.finish();
    } catch (e) {
      functionThrew = true;
    }
    expect(functionThrew).is.equal(true);
  });

  it('throw and throw when maxRunning > 1', async function(): Promise<void> {
    const parallel = new Parallelize({
      maxRunning: 3,
      throwOnError: true,
      granularity: 0.01
    });
    let functionThrew = false;
    try {
      await parallel.run(crashes('E1'));
      await parallel.run(crashes('E2'));
      await parallel.finish();
    } catch (e) {
      functionThrew = true;
    }
    expect(functionThrew).is.equal(true);
  });

  it('refuse maxRunning < 1', async function(): Promise<void> {
    let functionThrew = false;
    try {
      new Parallelize({
        maxRunning: 0,
        throwOnError: true
      });
    } catch (e) {
      functionThrew = true;
    }
    expect(functionThrew).is.equal(true);
  });
});
