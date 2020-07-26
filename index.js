const Cache = require("./cache");

function memoizer(fn) {
  // cache store
  const resultsCache = Cache();

  // memoized wrapper function
  // capture all the input args
  function memoized(...args) {
    const cacheKey = Cache.generateKey(args);
    let cachedNode = resultsCache.find(cacheKey);

    if (!cachedNode) {
      // cached value not found, call fn and cache result
      const result = fn(...args);
      cachedNode = resultsCache.add(cacheKey, result);
    }

    // return result from cache;
    return cachedNode.value;
  }

  // clear cache
  memoized.clearCache = resultsCache.clear;

  return memoized;
}

module.exports = memoizer;
