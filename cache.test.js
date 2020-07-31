const Cache = require("./cache");

test("cache list", () => {
  const testCache = Cache({ cacheSize: 3 });

  testCache.add("1-2", 3);
  testCache.add("2-3", 5);
  testCache.add("5-5", 10);
  testCache.add("4-2", 6);
  expect(testCache.print()).toEqual("[4-2: 6] -> [5-5: 10] -> [2-3: 5]");

  testCache.find("2-3");
  expect(testCache.print()).toEqual("[2-3: 5] -> [4-2: 6] -> [5-5: 10]");

  testCache.add("32-1", 33);
  expect(testCache.print()).toEqual("[32-1: 33] -> [2-3: 5] -> [4-2: 6]");

  testCache.find("2-2");
  testCache.find("32-1");
  expect(testCache.print()).toEqual("[32-1: 33] -> [2-3: 5] -> [4-2: 6]");

  testCache.clear();
  expect(testCache.print()).toEqual("");
});

test("key generator", () => {
  expect(Cache.generateKey([1, 2])).toEqual("1-2");
  expect(Cache.generateKey([1, 2, 3, 4])).toEqual("1-2-3-4");
  expect(Cache.generateKey([{ a: "hello", b: 31232 }])).toEqual(
    '{"a":"hello","b":31232}'
  );
  expect(Cache.generateKey([123, [456], 789, 0])).toEqual("123-[456]-789-0");
  expect(
    Cache.generateKey([3, { x: "hello", y: "world" }, [81, "on3"], 22])
  ).toEqual('3-{"x":"hello","y":"world"}-[81,"on3"]-22');
});

test("cache expiry", async () => {
  const testCache = Cache({ cacheSize: 3, expiresAt: 1000 });

  testCache.add("1-2", 3);
  testCache.add("2-3", 5);
  testCache.add("5-5", 10);
  testCache.add("4-2", 6);
  expect(testCache.print()).toEqual("[4-2: 6] -> [5-5: 10] -> [2-3: 5]");

  testCache.find("2-3");
  expect(testCache.print()).toEqual("[2-3: 5] -> [4-2: 6] -> [5-5: 10]");

  await new Promise((r) => setTimeout(r, 2000));

  expect(testCache.find("2-3")).toEqual(null);
  expect(testCache.print()).toEqual("[4-2: 6] -> [5-5: 10]");

  expect(testCache.find("5-5")).toEqual(null);
  expect(testCache.print()).toEqual("[4-2: 6]");

  expect(testCache.find("4-2")).toEqual(null);
  expect(testCache.print()).toEqual("");

  testCache.clear();
  expect(testCache.print()).toEqual("");
});
