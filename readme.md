# controlled-concurrency

[![Build status](https://travis-ci.com/AC4BB21B/controlled-concurrency.svg?&branch=master)](https://app.travis-ci.com/github/AC4BB21B/controlled-concurrency)
[![npm version](https://badge.fury.io/js/controlled-concurrency.svg)](https://www.npmjs.com/package/controlled-concurrency)
[![License](https://img.shields.io/npm/l/controlled-concurrency)](license.md)
![](https://badgen.net/badge/icon/TypeScript?icon=typescript&label)

controlled-concurrency is an experimental library, implemented in TypeSript, to execute promises in parallel with a limited concurrency.

It does not require pre-building a list of all promises but instead will accept promises on-the-fly. Promises are processed as soon as they are added until the `maxRunning` threshold is reached. When the threshold is reached, the main thread execution will wait until a slot gets freed to process the new promise.

The typical use case is when you want to spawn a controlled amount of processes, each running a somewhat long task (due to the way the queue is handled, there is significant overhead when tasks are shorter than ~100ms), without caring about their output in the main process. You can choose to swallow or forward thrown exceptions, but the latter is currently not very well supported.

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
    else setTimeout(resolve, seconds * 1000);
  });
}

const parallel = new parallelize.Parallelize({
  maxRunning: 2,
  throwOnError: false,
  granularity: 0.001
});
for (let i = 0; i < 3; i++) {
  await parallel.run(wait(1));
}
await parallel.finish();
```

### Options

- `maxRunning`: number, mandatory, max number of threads
- `throwOnError`: boolean, mandatory, whether or not exceptions thrown by running processes should be forwarded. Support for `true` is still a bit messy at the moment so you may want to set it to `false` and catch them yourself like `await parallel.run(wait(0.1).catch(e => {do something}));`
- `granularity`: number, optional (default 0.1), seconds between each check for an empty spot in the execution pool, when the pool is full. This is the reason why this library is not appropriate for very very short tasks.


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
