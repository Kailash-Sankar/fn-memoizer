const DEFAULT_CACHE_SIZE = 25;

// cache node
function Node(key, value) {
  this.key = key;
  this.value = value;
  this.next = null;
  this.prev = null;
}

// in-memory LRU cache
function Cache(params = {}) {
  let hash = {};
  let head = null;
  let tail = null;
  let size = 0;
  let options = {
    cacheSize: DEFAULT_CACHE_SIZE,
    ...params,
  };

  // add a new node to cache
  function add(key, value) {
    const node = new Node(key, value);

    if (head) {
      node.next = head;
      head.prev = node;
    }
    // set the tail node
    if (!tail) {
      tail = node;
    }

    head = node;
    size++;

    // remove a node if we reach size limit
    if (size > options.cacheSize) {
      remove();
    }
    hash[key] = node;

    return node;
  }

  // remove the tail node
  // the previous node becomes the tail
  function remove() {
    if (tail) {
      delete hash[tail.key];
      const prev = tail.prev;
      tail = prev;
      // in case head/tail are the same
      if (prev) {
        prev.next = null;
      }
      size--;
    }
  }

  // refresh a node, move it to top
  function refresh(node) {
    if (head === node) {
      return;
    }

    // remove from current position
    if (node.prev) {
      node.prev.next = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    }

    // add to top
    node.next = head;
    head.prev = node;
    head = node;

    // update tail if refreshed node is the tail node
    if (tail === node) {
      tail = node.prev;
    }
    node.prev = null;
  }

  // check for cached node
  function find(key) {
    if (key in hash) {
      const node = hash[key];
      refresh(node);
      return node;
    }
    return null;
  }

  // clear the cache
  function clear() {
    head = null;
    tail = null;
    size = 0;
    hash = {};
    // garabage collector will take care of the rest. right?
  }

  // pretty print cache
  function print() {
    let node = head;
    let out = [];
    while (node) {
      out.push(`[${node.key}: ${node.value}]`);
      node = node.next;
    }
    return out.join(" -> ");
  }

  return {
    add,
    find,
    print,
    clear,
  };
}

// build cache key
Cache.generateKey = (args) => args.map((x) => JSON.stringify(x)).join("-");

module.exports = Cache;
