# controlled-concurrency

[![Build status](https://travis-ci.com/AC4BB21B/controlled-concurrency.svg?&branch=master)](https://app.travis-ci.com/github/AC4BB21B/controlled-concurrency)
[![npm version](https://badge.fury.io/js/controlled-concurrency.svg)](https://www.npmjs.com/package/controlled-concurrency)
[![License](https://img.shields.io/npm/l/controlled-concurrency)](license.md)
[![Bettercodehub rating](https://bettercodehub.com/edge/badge/AC4BB21B/controlled-concurrency?branch=master)](https://bettercodehub.com/)
[![](https://badgen.net/badge/icon/TypeScript?icon=typescript&label)]()

`controlled-concurrency` is a library, implemented in TypeScript, to execute promises in parallel with a limited concurrency.

It does not require pre-building a list of all promises but instead will accept promises on-the-fly.
Promises are processed as soon as they are added until the `maxRunning` threshold is reached.
When the threshold is reached, the main thread execution will wait until a slot gets freed to process the new promise.

The typical use case for `ParallelizeBasic` is when you want to spawn a controlled amount of processes,
each running a somewhat long task (due to the way the queue is handled, there is
significant overhead when tasks are shorter than ~10ms), without caring about
their output in the main process.

The `Parallelize` class offers more options. In particular, you can choose to swallow or forward thrown exceptions, by setting `throwOnError` to `false` or `true`, but the latter is currently not very well supported. You can also chose to collect results, by setting `storeResults` to `true`.

## Installation

```bash
npm i -S controlled-concurrency
```

## Usage

```typescript
import parallelize from 'controlled-concurrency';

function wait(seconds: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (seconds <= 0) resolve();
    else setTimeout(() => {console.log('tick'); resolve()}, seconds * 1000);
  });
}

async function main(): Promise<void> {
  console.log('Running full Parallelize');
  const parallel = new parallelize.Parallelize({
    maxRunning: 3,
    throwOnError: false,
    storeResults: true,
    granularity: 0.001
  });
  for (let i = 0; i < 5; i++) {
    await parallel.run(wait(1));
  }
  const result = await parallel.finish();
  console.log(result);

  await main2();
}

async function main2(): Promise<void> {
  console.log('Running ParallelizeBasic');
  const parallelBasic = new parallelize.ParallelizeBasic(3);
  for (let i = 0; i < 5; i++) {
    await parallelBasic.run(wait(1));
  }
  await parallelBasic.finish();
}

main()
.then(() => console.log('ok'));
```

### Options

`ParallelizeBasic` only take a single and mandatory option, the number of threads,
passed as a number to the constructor: `new parallelize.ParallelizeBasic(3)`

`Parallelize` takes the following options

- `maxRunning`: number, mandatory, max number of threads.
- `throwOnError`: boolean, optional (default `false`),, whether or not exceptions thrown by running processes should be forwarded.
Support for `true` is still a bit messy at the moment so you may want to set it to `false` and catch them yourself,
like `await parallel.run(wait(0.1).catch(e => {do something}))`, or just use `storeResults`
- `storeResults`: boolean, optional (default `false`), whether or not to collect the results of the promises.
If `true`, the results can be collected from `finish()`.
They will be in a format similar to `Promise.allSettled()`, and sorted in the same order as the promises were added to the queue.
- `granularity`: number, optional (default 0.001), seconds between each check for an empty spot in the execution pool, when the pool is full.
This is the reason why this library is not appropriate for very very short tasks.

`ParallelizeBasic` is similar to running `Parallelize` with `throwOnError = false`, `storeResults = false`, and `granularity = 0.001`
(but uses different, more concise code).


## Contributing

Global dev dependencies:
```bash
npm i -g typescript
npm i -g chai mocha ts-mocha
npm i -g nyc
npm i -g eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

### Compiling, testing, coverage

```bash
tsc -w
```

```bash
npm run build
npm test
npm run coverage
```

## License

This project is licensed under the GNU Lesser General Public License v3 or later - see the [license.md](license.md) file for details
