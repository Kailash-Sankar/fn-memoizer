const fetch = require("node-fetch");
const memoizer = require("./index");

test("simple params", () => {
  let count = 0;
  function add(a, b, c = 0) {
    count++;
    return a + b + c;
  }
  const memoAdd = memoizer(add);

  expect(memoAdd(1, 2)).toEqual(3);
  expect(count).toEqual(1);

  expect(memoAdd(2, 4, 2)).toEqual(8);
  expect(count).toEqual(2);

  expect(memoAdd(2, 4, 2)).toEqual(8);
  expect(count).toEqual(2);

  expect(memoAdd(22, 33, 44)).toEqual(99);
  expect(count).toEqual(3);

  expect(memoAdd(1, 2)).toEqual(3);
  expect(count).toEqual(3);
});

test("complex params", () => {
  let count = 0;
  function calc(values, multiplier, labels) {
    count++;
    const total = values.reduce((acc, x) => x + acc, 0) * multiplier;
    return `${labels.text} => ${total}`;
  }
  const memoizedCalc = memoizer(calc);

  expect(memoizedCalc([10, 2], 2, { text: "A" })).toEqual("A => 24");
  expect(count).toEqual(1);

  expect(memoizedCalc([1], 1, { text: "B" })).toEqual("B => 1");
  expect(count).toEqual(2);

  expect(memoizedCalc([10, 2], 2, { text: "A" })).toEqual("A => 24");
  expect(count).toEqual(2);
});

test("basic async test", async () => {
  let count = 0;
  async function alpha(a, b) {
    count++;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(a + b);
      }, 500);
    });
  }
  const memoizedAlpha = memoizer(alpha);

  expect(await memoizedAlpha(2, 3)).toEqual(5);
  expect(count).toEqual(1);

  expect(await memoizedAlpha(1, 2)).toEqual(3);
  expect(count).toEqual(2);

  expect(await memoizedAlpha(2, 3)).toEqual(5);
  expect(count).toEqual(2);
});

test("api async test", async () => {
  let count = 0;
  async function getTodo(id) {
    count++;
    return fetch(
      `https://jsonplaceholder.typicode.com/todos/${id}`
    ).then((res) => res.json());
  }
  const memoizedGetTodo = memoizer(getTodo);

  await memoizedGetTodo(1);
  expect(count).toEqual(1);

  await memoizedGetTodo(2);
  expect(count).toEqual(2);

  await memoizedGetTodo(1);
  expect(count).toEqual(2);
});

test("clear cache", () => {
  let count = 0;
  function add(a, b, c = 0) {
    count++;
    return a + b + c;
  }
  const memoAdd = memoizer(add);

  expect(memoAdd(1, 2)).toEqual(3);
  expect(memoAdd(2, 4)).toEqual(6);
  expect(memoAdd(1, 2)).toEqual(3);
  expect(count).toEqual(2);
  memoAdd.clearCache();
  expect(memoAdd(1, 2)).toEqual(3);
  expect(count).toEqual(3);
});

test("cache size", () => {
  let count = 0;
  function add(a, b, c = 0) {
    count++;
    return a + b + c;
  }
  const memoAdd = memoizer(add, { cacheSize: 3 });

  expect(memoAdd(5, 3)).toEqual(8);
  expect(memoAdd(3, 3)).toEqual(6);
  expect(memoAdd(1, 2)).toEqual(3);
  expect(memoAdd(2, 4)).toEqual(6);
  expect(count).toEqual(4);
  expect(memoAdd(1, 2)).toEqual(3);
  expect(count).toEqual(4);
  expect(memoAdd(5, 3)).toEqual(8);
  expect(count).toEqual(5);
  memoAdd.clearCache();
  expect(memoAdd(1, 2)).toEqual(3);
  expect(count).toEqual(6);
});
