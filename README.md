# fn-memoizer

![npm bundle size](https://img.shields.io/bundlephobia/min/fn-memoizer)
![npm](https://img.shields.io/npm/v/fn-memoizer)

> A function memoizer with a LRU cache

Read more about the module at [dev.to post](https://dev.to/ksankar/build-a-function-memoizer-part-1-3n0o)

## Install

```bash
  npm i fn-memoizer
```

## Usage

Call memoizer with a function to memoize and optional params.
All input params are JSON.strigified to create cache key.

supported options:

```js
{
  cacheSize : 10, // defaults to 25
  expiresAt : 1000 // value in ms, defaults to null (no expiry)
}
```

```js
const memoizer = require("fn-memoizer");

let count = 0;
function calc(values, multiplier, labels) {
  count++;
  const total = values.reduce((acc, x) => x + acc, 0) * multiplier;
  return `${labels.text} => ${total}`;
}
const memoizedCalc = memoizer(calc);

memoizedCalc([10, 2], 2, { text: "A" });
// count = 1

memoizedCalc([1], 1, { text: "B" });
// count = 2

memoizedCalc([10, 2], 2, { text: "A" });
// count = 2, returned cached result
```

Also supports asynchronous functions which return a promise.

```js
let count = 0;
async function getTodo(id) {
  count++;
  return fetch(`https://jsonplaceholder.typicode.com/todos/${id}`).then((res) =>
    res.json()
  );
}
const memoizedGetTodo = memoizer(getTodo);

await memoizedGetTodo(1);
// count = 1

await memoizedGetTodo(2);
// count = 2

await memoizedGetTodo(1);
// count = 2
```

Pass cache size, also allows manual clear

```js
let count = 0;
function add(a, b, c = 0) {
  count++;
  return a + b + c;
}
const memoAdd = memoizer(add, { cacheSize: 3 });

  memoAdd(5, 3);
  memoAdd(3, 3);
  memoAdd(1, 2);
  memoAdd(2, 4));
  // count 4
  memoAdd(1, 2);
  // count 4
  memoAdd(5, 3);
  // count 5
  // cache size is 3, hence the least used was removed
  memoAdd.clearCache();
  memoAdd(1, 2);
  // count 6
  // cache was cleared, resulting in source function getting called again
```

Supports expiry of cached values, accepts expiresAt value in ms

```js
(async function () {
  let count = 0;
  function add(a, b, c = 0) {
    count++;
    return a + b + c;
  }
  const memoAdd = memoizer(add, { cacheSize: 3, expiresAt: 1000 });

  memoAdd(5, 3);
  memoAdd(3, 3);
  memoAdd(1, 2);
  memoAdd(2, 4);
  console.log(count); // 4

  await new Promise((r) => setTimeout(r, 2000));

  memoAdd(1, 2);
  console.log(count); // 5, cache expired

  memoAdd(1, 2);
  console.log(count); // 5, pulled from cache

  memoAdd(2, 4);
  console.log(count); // 6, expired value
})();
```

That's all folks.
